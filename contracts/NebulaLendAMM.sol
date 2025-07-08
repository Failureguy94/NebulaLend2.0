// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NebulaLendLPToken.sol";

/**
 * @title NebulaLend AMM
 * @dev Automated Market Maker with Chainlink price feed integration
 */
contract NebulaLendAMM is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    struct Pool {
        address token0;
        address token1;
        address priceFeed0;
        address priceFeed1;
        uint256 reserve0;
        uint256 reserve1;
        uint256 totalSupply;
        address lpToken;
        uint256 fee; // Fee in basis points (30 = 0.3%)
        bool isActive;
    }

    mapping(bytes32 => Pool) public pools;
    mapping(address => mapping(address => bytes32)) public getPoolId;
    bytes32[] public allPools;

    uint256 public constant MINIMUM_LIQUIDITY = 1000;
    uint256 public constant FEE_DENOMINATOR = 10000;

    event PoolCreated(
        address indexed token0,
        address indexed token1,
        bytes32 indexed poolId,
        address lpToken
    );
    event LiquidityAdded(
        bytes32 indexed poolId,
        address indexed provider,
        uint256 amount0,
        uint256 amount1,
        uint256 liquidity
    );
    event LiquidityRemoved(
        bytes32 indexed poolId,
        address indexed provider,
        uint256 amount0,
        uint256 amount1,
        uint256 liquidity
    );
    event Swap(
        bytes32 indexed poolId,
        address indexed user,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    /**
     * @dev Create a new liquidity pool
     */
    function createPool(
        address _token0,
        address _token1,
        address _priceFeed0,
        address _priceFeed1,
        uint256 _fee
    ) external onlyOwner returns (bytes32 poolId) {
        require(_token0 != _token1, "Identical tokens");
        require(_token0 != address(0) && _token1 != address(0), "Zero address");
        require(_fee <= 1000, "Fee too high"); // Max 10%

        // Ensure consistent ordering
        if (_token0 > _token1) {
            (_token0, _token1) = (_token1, _token0);
            (_priceFeed0, _priceFeed1) = (_priceFeed1, _priceFeed0);
        }

        poolId = keccak256(abi.encodePacked(_token0, _token1));
        require(pools[poolId].token0 == address(0), "Pool exists");

        // Create LP token
        string memory lpName = string(abi.encodePacked("NL-", IERC20(_token0).symbol(), "-", IERC20(_token1).symbol()));
        string memory lpSymbol = string(abi.encodePacked("NL-LP"));
        
        NebulaLendLPToken lpToken = new NebulaLendLPToken(lpName, lpSymbol, address(this));

        pools[poolId] = Pool({
            token0: _token0,
            token1: _token1,
            priceFeed0: _priceFeed0,
            priceFeed1: _priceFeed1,
            reserve0: 0,
            reserve1: 0,
            totalSupply: 0,
            lpToken: address(lpToken),
            fee: _fee,
            isActive: true
        });

        getPoolId[_token0][_token1] = poolId;
        getPoolId[_token1][_token0] = poolId;
        allPools.push(poolId);

        emit PoolCreated(_token0, _token1, poolId, address(lpToken));
    }

    /**
     * @dev Add liquidity to a pool
     */
    function addLiquidity(
        bytes32 _poolId,
        uint256 _amount0Desired,
        uint256 _amount1Desired,
        uint256 _amount0Min,
        uint256 _amount1Min
    ) external nonReentrant returns (uint256 amount0, uint256 amount1, uint256 liquidity) {
        Pool storage pool = pools[_poolId];
        require(pool.isActive, "Pool not active");

        (amount0, amount1) = _calculateOptimalAmounts(
            pool,
            _amount0Desired,
            _amount1Desired,
            _amount0Min,
            _amount1Min
        );

        // Transfer tokens
        IERC20(pool.token0).safeTransferFrom(msg.sender, address(this), amount0);
        IERC20(pool.token1).safeTransferFrom(msg.sender, address(this), amount1);

        // Calculate liquidity
        if (pool.totalSupply == 0) {
            liquidity = sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            // Mint minimum liquidity to zero address
            NebulaLendLPToken(pool.lpToken).mint(address(0), MINIMUM_LIQUIDITY);
        } else {
            liquidity = min(
                (amount0 * pool.totalSupply) / pool.reserve0,
                (amount1 * pool.totalSupply) / pool.reserve1
            );
        }

        require(liquidity > 0, "Insufficient liquidity minted");

        // Update reserves and mint LP tokens
        pool.reserve0 += amount0;
        pool.reserve1 += amount1;
        pool.totalSupply += liquidity;

        NebulaLendLPToken(pool.lpToken).mint(msg.sender, liquidity);

        emit LiquidityAdded(_poolId, msg.sender, amount0, amount1, liquidity);
    }

    /**
     * @dev Remove liquidity from a pool
     */
    function removeLiquidity(
        bytes32 _poolId,
        uint256 _liquidity,
        uint256 _amount0Min,
        uint256 _amount1Min
    ) external nonReentrant returns (uint256 amount0, uint256 amount1) {
        Pool storage pool = pools[_poolId];
        require(pool.isActive, "Pool not active");

        // Calculate amounts
        amount0 = (_liquidity * pool.reserve0) / pool.totalSupply;
        amount1 = (_liquidity * pool.reserve1) / pool.totalSupply;

        require(amount0 >= _amount0Min && amount1 >= _amount1Min, "Insufficient amounts");

        // Burn LP tokens
        NebulaLendLPToken(pool.lpToken).burn(msg.sender, _liquidity);

        // Update reserves
        pool.reserve0 -= amount0;
        pool.reserve1 -= amount1;
        pool.totalSupply -= _liquidity;

        // Transfer tokens
        IERC20(pool.token0).safeTransfer(msg.sender, amount0);
        IERC20(pool.token1).safeTransfer(msg.sender, amount1);

        emit LiquidityRemoved(_poolId, msg.sender, amount0, amount1, _liquidity);
    }

    /**
     * @dev Swap tokens
     */
    function swap(
        bytes32 _poolId,
        address _tokenIn,
        uint256 _amountIn,
        uint256 _amountOutMin
    ) external nonReentrant returns (uint256 amountOut) {
        Pool storage pool = pools[_poolId];
        require(pool.isActive, "Pool not active");
        require(_tokenIn == pool.token0 || _tokenIn == pool.token1, "Invalid token");

        bool isToken0 = _tokenIn == pool.token0;
        address tokenOut = isToken0 ? pool.token1 : pool.token0;

        // Calculate output amount with fee
        uint256 amountInWithFee = _amountIn * (FEE_DENOMINATOR - pool.fee);
        uint256 numerator = amountInWithFee * (isToken0 ? pool.reserve1 : pool.reserve0);
        uint256 denominator = (isToken0 ? pool.reserve0 : pool.reserve1) * FEE_DENOMINATOR + amountInWithFee;
        amountOut = numerator / denominator;

        require(amountOut >= _amountOutMin, "Insufficient output amount");

        // Transfer tokens
        IERC20(_tokenIn).safeTransferFrom(msg.sender, address(this), _amountIn);
        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);

        // Update reserves
        if (isToken0) {
            pool.reserve0 += _amountIn;
            pool.reserve1 -= amountOut;
        } else {
            pool.reserve1 += _amountIn;
            pool.reserve0 -= amountOut;
        }

        emit Swap(_poolId, msg.sender, _tokenIn, tokenOut, _amountIn, amountOut);
    }

    /**
     * @dev Get output amount for a given input
     */
    function getAmountOut(
        bytes32 _poolId,
        address _tokenIn,
        uint256 _amountIn
    ) external view returns (uint256 amountOut) {
        Pool memory pool = pools[_poolId];
        require(pool.isActive, "Pool not active");
        require(_tokenIn == pool.token0 || _tokenIn == pool.token1, "Invalid token");

        bool isToken0 = _tokenIn == pool.token0;
        uint256 amountInWithFee = _amountIn * (FEE_DENOMINATOR - pool.fee);
        uint256 numerator = amountInWithFee * (isToken0 ? pool.reserve1 : pool.reserve0);
        uint256 denominator = (isToken0 ? pool.reserve0 : pool.reserve1) * FEE_DENOMINATOR + amountInWithFee;
        amountOut = numerator / denominator;
    }

    /**
     * @dev Get Chainlink price for a token
     */
    function getChainlinkPrice(address _priceFeed) public view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(_priceFeed);
        (, int256 price, , uint256 timeStamp, ) = priceFeed.latestRoundData();
        
        require(price > 0, "Invalid price");
        require(block.timestamp - timeStamp < 3600, "Price feed stale");
        
        return uint256(price);
    }

    /**
     * @dev Calculate optimal amounts for adding liquidity
     */
    function _calculateOptimalAmounts(
        Pool memory _pool,
        uint256 _amount0Desired,
        uint256 _amount1Desired,
        uint256 _amount0Min,
        uint256 _amount1Min
    ) internal pure returns (uint256 amount0, uint256 amount1) {
        if (_pool.reserve0 == 0 && _pool.reserve1 == 0) {
            (amount0, amount1) = (_amount0Desired, _amount1Desired);
        } else {
            uint256 amount1Optimal = (_amount0Desired * _pool.reserve1) / _pool.reserve0;
            if (amount1Optimal <= _amount1Desired) {
                require(amount1Optimal >= _amount1Min, "Insufficient amount1");
                (amount0, amount1) = (_amount0Desired, amount1Optimal);
            } else {
                uint256 amount0Optimal = (_amount1Desired * _pool.reserve0) / _pool.reserve1;
                require(amount0Optimal <= _amount0Desired && amount0Optimal >= _amount0Min, "Insufficient amount0");
                (amount0, amount1) = (amount0Optimal, _amount1Desired);
            }
        }
    }

    /**
     * @dev Square root function
     */
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    /**
     * @dev Minimum function
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    /**
     * @dev Get all pools
     */
    function getAllPools() external view returns (bytes32[] memory) {
        return allPools;
    }

    /**
     * @dev Get pool information
     */
    function getPool(bytes32 _poolId) external view returns (Pool memory) {
        return pools[_poolId];
    }
}
