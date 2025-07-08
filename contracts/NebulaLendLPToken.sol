// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NebulaLend LP Token
 * @dev Represents liquidity provider shares in NebulaLend pools
 */
contract NebulaLendLPToken is ERC20, Ownable {
    address public immutable pool;

    constructor(
        string memory _name,
        string memory _symbol,
        address _pool
    ) ERC20(_name, _symbol) {
        pool = _pool;
    }

    /**
     * @dev Mint LP tokens (only pool contract)
     */
    function mint(address _to, uint256 _amount) external {
        require(msg.sender == pool, "Only pool can mint");
        _mint(_to, _amount);
    }

    /**
     * @dev Burn LP tokens (only pool contract)
     */
    function burn(address _from, uint256 _amount) external {
        require(msg.sender == pool, "Only pool can burn");
        _burn(_from, _amount);
    }
}
