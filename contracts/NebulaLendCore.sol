// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title NebulaLend Core Protocol
 * @dev Main lending protocol with Chainlink price feeds and VRF integration
 */
contract NebulaLendCore is VRFConsumerBaseV2, ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // Chainlink VRF
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // Protocol constants
    uint256 public constant LIQUIDATION_THRESHOLD = 110; // 110%
    uint256 public constant LIQUIDATION_BONUS = 5; // 5%
    uint256 public constant MIN_HEALTH_FACTOR = 1e18;
    uint256 public constant PRECISION = 1e18;
    uint256 public constant PRICE_PRECISION = 1e8;

    // Supported tokens
    struct TokenInfo {
        address tokenAddress;
        address priceFeed;
        uint256 ltv; // Loan-to-value ratio (75 = 75%)
        uint256 liquidationThreshold;
        bool isActive;
        uint256 totalDeposited;
        uint256 totalBorrowed;
        uint256 borrowRate; // Annual rate in basis points
        uint256 supplyRate; // Annual rate in basis points
    }

    // User account information
    struct UserAccount {
        mapping(address => uint256) deposits;
        mapping(address => uint256) borrows;
        uint256 lastUpdateTimestamp;
    }

    // Liquidation lottery
    struct LiquidationLottery {
        uint256 requestId;
        address[] eligibleUsers;
        uint256 totalPrize;
        bool isActive;
        uint256 timestamp;
    }

    // State variables
    mapping(address => TokenInfo) public tokenInfo;
    mapping(address => UserAccount) private userAccounts;
    mapping(uint256 => LiquidationLottery) public liquidationLotteries;
    
    address[] public supportedTokens;
    uint256 public totalUsers;
    uint256 public protocolFeeRate = 300; // 3%
    address public feeRecipient;
    
    // VRF state
    mapping(uint256 => address) private vrfRequestToSender;
    uint256 public lastLotteryId;

    // Events
    event Deposit(address indexed user, address indexed token, uint256 amount);
    event Withdraw(address indexed user, address indexed token, uint256 amount);
    event Borrow(address indexed user, address indexed token, uint256 amount);
    event Repay(address indexed user, address indexed token, uint256 amount);
    event Liquidation(address indexed liquidator, address indexed user, address indexed token, uint256 amount);
    event LiquidationLotteryStarted(uint256 indexed requestId, uint256 totalPrize);
    event LiquidationLotteryCompleted(uint256 indexed requestId, address winner, uint256 prize);
    event TokenAdded(address indexed token, address indexed priceFeed);
    event InterestRatesUpdated(address indexed token, uint256 borrowRate, uint256 supplyRate);

    constructor(
        address _vrfCoordinator,
        uint64 _subscriptionId,
        bytes32 _gasLane,
        uint32 _callbackGasLimit,
        address _feeRecipient
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        i_subscriptionId = _subscriptionId;
        i_gasLane = _gasLane;
        i_callbackGasLimit = _callbackGasLimit;
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Add a new supported token with Chainlink price feed
     */
    function addToken(
        address _token,
        address _priceFeed,
        uint256 _ltv,
        uint256 _liquidationThreshold,
        uint256 _borrowRate,
        uint256 _supplyRate
    ) external onlyOwner {
        require(_token != address(0), "Invalid token address");
        require(_priceFeed != address(0), "Invalid price feed address");
        require(_ltv <= 90, "LTV too high");
        require(_liquidationThreshold >= _ltv, "Invalid liquidation threshold");

        tokenInfo[_token] = TokenInfo({
            tokenAddress: _token,
            priceFeed: _priceFeed,
            ltv: _ltv,
            liquidationThreshold: _liquidationThreshold,
            isActive: true,
            totalDeposited: 0,
            totalBorrowed: 0,
            borrowRate: _borrowRate,
            supplyRate: _supplyRate
        });

        supportedTokens.push(_token);
        emit TokenAdded(_token, _priceFeed);
    }

    /**
     * @dev Get latest price from Chainlink price feed
     */
    function getLatestPrice(address _token) public view returns (uint256) {
        TokenInfo memory token = tokenInfo[_token];
        require(token.isActive, "Token not supported");

        AggregatorV3Interface priceFeed = AggregatorV3Interface(token.priceFeed);
        (, int256 price, , uint256 timeStamp, ) = priceFeed.latestRoundData();
        
        require(price > 0, "Invalid price");
        require(timeStamp > 0, "Round not complete");
        
        // Check if price is stale (older than 1 hour)
        require(block.timestamp - timeStamp < 3600, "Price feed stale");

        return uint256(price);
    }

    /**
     * @dev Deposit tokens to earn interest
     */
    function deposit(address _token, uint256 _amount) external nonReentrant whenNotPaused {
        require(_amount > 0, "Amount must be greater than 0");
        require(tokenInfo[_token].isActive, "Token not supported");

        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        
        userAccounts[msg.sender].deposits[_token] += _amount;
        tokenInfo[_token].totalDeposited += _amount;
        
        if (userAccounts[msg.sender].lastUpdateTimestamp == 0) {
            totalUsers++;
        }
        userAccounts[msg.sender].lastUpdateTimestamp = block.timestamp;

        emit Deposit(msg.sender, _token, _amount);
    }

    /**
     * @dev Withdraw deposited tokens
     */
    function withdraw(address _token, uint256 _amount) external nonReentrant whenNotPaused {
        require(_amount > 0, "Amount must be greater than 0");
        require(userAccounts[msg.sender].deposits[_token] >= _amount, "Insufficient balance");

        // Check if withdrawal would break health factor
        uint256 newHealthFactor = calculateHealthFactorAfterWithdraw(msg.sender, _token, _amount);
        require(newHealthFactor >= MIN_HEALTH_FACTOR, "Health factor too low");

        userAccounts[msg.sender].deposits[_token] -= _amount;
        tokenInfo[_token].totalDeposited -= _amount;

        IERC20(_token).safeTransfer(msg.sender, _amount);

        emit Withdraw(msg.sender, _token, _amount);
    }

    /**
     * @dev Borrow tokens against collateral
     */
    function borrow(address _token, uint256 _amount) external nonReentrant whenNotPaused {
        require(_amount > 0, "Amount must be greater than 0");
        require(tokenInfo[_token].isActive, "Token not supported");
        require(tokenInfo[_token].totalDeposited >= tokenInfo[_token].totalBorrowed + _amount, "Insufficient liquidity");

        // Check health factor after borrow
        uint256 newHealthFactor = calculateHealthFactorAfterBorrow(msg.sender, _token, _amount);
        require(newHealthFactor >= MIN_HEALTH_FACTOR, "Health factor too low");

        userAccounts[msg.sender].borrows[_token] += _amount;
        tokenInfo[_token].totalBorrowed += _amount;

        IERC20(_token).safeTransfer(msg.sender, _amount);

        emit Borrow(msg.sender, _token, _amount);
    }

    /**
     * @dev Repay borrowed tokens
     */
    function repay(address _token, uint256 _amount) external nonReentrant whenNotPaused {
        require(_amount > 0, "Amount must be greater than 0");
        require(userAccounts[msg.sender].borrows[_token] >= _amount, "Repay amount exceeds debt");

        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        userAccounts[msg.sender].borrows[_token] -= _amount;
        tokenInfo[_token].totalBorrowed -= _amount;

        emit Repay(msg.sender, _token, _amount);
    }

    /**
     * @dev Liquidate undercollateralized position
     */
    function liquidate(address _user, address _debtToken, address _collateralToken, uint256 _debtAmount) 
        external nonReentrant whenNotPaused {
        require(_user != msg.sender, "Cannot liquidate yourself");
        require(userAccounts[_user].borrows[_debtToken] >= _debtAmount, "Invalid debt amount");

        uint256 healthFactor = calculateHealthFactor(_user);
        require(healthFactor < MIN_HEALTH_FACTOR, "User is not liquidatable");

        // Calculate collateral to seize
        uint256 debtValue = (_debtAmount * getLatestPrice(_debtToken)) / PRICE_PRECISION;
        uint256 collateralValue = (debtValue * (100 + LIQUIDATION_BONUS)) / 100;
        uint256 collateralAmount = (collateralValue * PRICE_PRECISION) / getLatestPrice(_collateralToken);

        require(userAccounts[_user].deposits[_collateralToken] >= collateralAmount, "Insufficient collateral");

        // Transfer debt token from liquidator
        IERC20(_debtToken).safeTransferFrom(msg.sender, address(this), _debtAmount);

        // Transfer collateral to liquidator
        userAccounts[_user].deposits[_collateralToken] -= collateralAmount;
        userAccounts[_user].borrows[_debtToken] -= _debtAmount;
        
        tokenInfo[_debtToken].totalBorrowed -= _debtAmount;

        IERC20(_collateralToken).safeTransfer(msg.sender, collateralAmount);

        emit Liquidation(msg.sender, _user, _debtToken, _debtAmount);
    }

    /**
     * @dev Start liquidation lottery using Chainlink VRF
     */
    function startLiquidationLottery() external onlyOwner returns (uint256 requestId) {
        // Find users eligible for liquidation
        address[] memory eligibleUsers = getEligibleUsersForLiquidation();
        require(eligibleUsers.length > 0, "No eligible users");

        // Calculate total prize pool (protocol fees)
        uint256 totalPrize = address(this).balance;
        require(totalPrize > 0, "No prize pool");

        // Request randomness from Chainlink VRF
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );

        liquidationLotteries[requestId] = LiquidationLottery({
            requestId: requestId,
            eligibleUsers: eligibleUsers,
            totalPrize: totalPrize,
            isActive: true,
            timestamp: block.timestamp
        });

        vrfRequestToSender[requestId] = msg.sender;
        lastLotteryId = requestId;

        emit LiquidationLotteryStarted(requestId, totalPrize);
        return requestId;
    }

    /**
     * @dev Chainlink VRF callback function
     */
    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        LiquidationLottery storage lottery = liquidationLotteries[_requestId];
        require(lottery.isActive, "Lottery not active");

        uint256 randomIndex = _randomWords[0] % lottery.eligibleUsers.length;
        address winner = lottery.eligibleUsers[randomIndex];

        // Transfer prize to winner
        payable(winner).transfer(lottery.totalPrize);

        lottery.isActive = false;

        emit LiquidationLotteryCompleted(_requestId, winner, lottery.totalPrize);
    }

    /**
     * @dev Calculate user's health factor
     */
    function calculateHealthFactor(address _user) public view returns (uint256) {
        uint256 totalCollateralValue = 0;
        uint256 totalDebtValue = 0;

        for (uint256 i = 0; i < supportedTokens.length; i++) {
            address token = supportedTokens[i];
            uint256 price = getLatestPrice(token);

            // Calculate collateral value
            uint256 depositAmount = userAccounts[_user].deposits[token];
            if (depositAmount > 0) {
                uint256 collateralValue = (depositAmount * price * tokenInfo[token].ltv) / (100 * PRICE_PRECISION);
                totalCollateralValue += collateralValue;
            }

            // Calculate debt value
            uint256 borrowAmount = userAccounts[_user].borrows[token];
            if (borrowAmount > 0) {
                uint256 debtValue = (borrowAmount * price) / PRICE_PRECISION;
                totalDebtValue += debtValue;
            }
        }

        if (totalDebtValue == 0) {
            return type(uint256).max;
        }

        return (totalCollateralValue * PRECISION) / totalDebtValue;
    }

    /**
     * @dev Calculate health factor after withdrawal
     */
    function calculateHealthFactorAfterWithdraw(address _user, address _token, uint256 _amount) 
        public view returns (uint256) {
        uint256 totalCollateralValue = 0;
        uint256 totalDebtValue = 0;

        for (uint256 i = 0; i < supportedTokens.length; i++) {
            address token = supportedTokens[i];
            uint256 price = getLatestPrice(token);

            // Calculate collateral value (subtract withdrawal if same token)
            uint256 depositAmount = userAccounts[_user].deposits[token];
            if (token == _token) {
                depositAmount = depositAmount >= _amount ? depositAmount - _amount : 0;
            }
            
            if (depositAmount > 0) {
                uint256 collateralValue = (depositAmount * price * tokenInfo[token].ltv) / (100 * PRICE_PRECISION);
                totalCollateralValue += collateralValue;
            }

            // Calculate debt value
            uint256 borrowAmount = userAccounts[_user].borrows[token];
            if (borrowAmount > 0) {
                uint256 debtValue = (borrowAmount * price) / PRICE_PRECISION;
                totalDebtValue += debtValue;
            }
        }

        if (totalDebtValue == 0) {
            return type(uint256).max;
        }

        return (totalCollateralValue * PRECISION) / totalDebtValue;
    }

    /**
     * @dev Calculate health factor after borrow
     */
    function calculateHealthFactorAfterBorrow(address _user, address _token, uint256 _amount) 
        public view returns (uint256) {
        uint256 totalCollateralValue = 0;
        uint256 totalDebtValue = 0;

        for (uint256 i = 0; i < supportedTokens.length; i++) {
            address token = supportedTokens[i];
            uint256 price = getLatestPrice(token);

            // Calculate collateral value
            uint256 depositAmount = userAccounts[_user].deposits[token];
            if (depositAmount > 0) {
                uint256 collateralValue = (depositAmount * price * tokenInfo[token].ltv) / (100 * PRICE_PRECISION);
                totalCollateralValue += collateralValue;
            }

            // Calculate debt value (add new borrow if same token)
            uint256 borrowAmount = userAccounts[_user].borrows[token];
            if (token == _token) {
                borrowAmount += _amount;
            }
            
            if (borrowAmount > 0) {
                uint256 debtValue = (borrowAmount * price) / PRICE_PRECISION;
                totalDebtValue += debtValue;
            }
        }

        if (totalDebtValue == 0) {
            return type(uint256).max;
        }

        return (totalCollateralValue * PRECISION) / totalDebtValue;
    }

    /**
     * @dev Get users eligible for liquidation
     */
    function getEligibleUsersForLiquidation() public view returns (address[] memory) {
        address[] memory tempUsers = new address[](totalUsers);
        uint256 count = 0;

        // This is a simplified version - in production, you'd maintain a more efficient data structure
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            // Implementation would iterate through users more efficiently
            // For demo purposes, we'll return a mock array
        }

        address[] memory eligibleUsers = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            eligibleUsers[i] = tempUsers[i];
        }

        return eligibleUsers;
    }

    /**
     * @dev Get user account information
     */
    function getUserAccount(address _user) external view returns (
        uint256[] memory deposits,
        uint256[] memory borrows,
        uint256 healthFactor
    ) {
        deposits = new uint256[](supportedTokens.length);
        borrows = new uint256[](supportedTokens.length);

        for (uint256 i = 0; i < supportedTokens.length; i++) {
            address token = supportedTokens[i];
            deposits[i] = userAccounts[_user].deposits[token];
            borrows[i] = userAccounts[_user].borrows[token];
        }

        healthFactor = calculateHealthFactor(_user);
    }

    /**
     * @dev Get protocol statistics
     */
    function getProtocolStats() external view returns (
        uint256[] memory totalDeposited,
        uint256[] memory totalBorrowed,
        uint256[] memory borrowRates,
        uint256[] memory supplyRates
    ) {
        totalDeposited = new uint256[](supportedTokens.length);
        totalBorrowed = new uint256[](supportedTokens.length);
        borrowRates = new uint256[](supportedTokens.length);
        supplyRates = new uint256[](supportedTokens.length);

        for (uint256 i = 0; i < supportedTokens.length; i++) {
            address token = supportedTokens[i];
            totalDeposited[i] = tokenInfo[token].totalDeposited;
            totalBorrowed[i] = tokenInfo[token].totalBorrowed;
            borrowRates[i] = tokenInfo[token].borrowRate;
            supplyRates[i] = tokenInfo[token].supplyRate;
        }
    }

    /**
     * @dev Update interest rates (only owner)
     */
    function updateInterestRates(address _token, uint256 _borrowRate, uint256 _supplyRate) external onlyOwner {
        require(tokenInfo[_token].isActive, "Token not supported");
        
        tokenInfo[_token].borrowRate = _borrowRate;
        tokenInfo[_token].supplyRate = _supplyRate;

        emit InterestRatesUpdated(_token, _borrowRate, _supplyRate);
    }

    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get supported tokens
     */
    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokens;
    }

    /**
     * @dev Receive ETH for prize pool
     */
    receive() external payable {}
}
