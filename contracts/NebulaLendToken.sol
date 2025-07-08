// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NebulaLend Protocol Token (NLT)
 * @dev Governance and utility token for the NebulaLend protocol
 */
contract NebulaLendToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100 million tokens

    mapping(address => bool) public minters;

    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);

    constructor(address _initialOwner) ERC20("NebulaLend Token", "NLT") {
        _transferOwnership(_initialOwner);
        _mint(_initialOwner, INITIAL_SUPPLY);
    }

    /**
     * @dev Add a minter
     */
    function addMinter(address _minter) external onlyOwner {
        minters[_minter] = true;
        emit MinterAdded(_minter);
    }

    /**
     * @dev Remove a minter
     */
    function removeMinter(address _minter) external onlyOwner {
        minters[_minter] = false;
        emit MinterRemoved(_minter);
    }

    /**
     * @dev Mint new tokens (only minters)
     */
    function mint(address _to, uint256 _amount) external {
        require(minters[msg.sender], "Not authorized to mint");
        require(totalSupply() + _amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(_to, _amount);
    }
}
