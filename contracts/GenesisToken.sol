// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title GenesisToken (GLT) - ERC-20 utility token for GenesisLink
/// @notice Standard ERC-20 with owner-only minting for testing/demo
contract GenesisToken is ERC20, Ownable {
    error MintToZeroAddress();
    error MintAmountZero();

    /// @notice Deploy token with initial supply to deployer
    /// @param initialSupply Amount of tokens minted to deployer (in wei)
    constructor(uint256 initialSupply) ERC20("GenesisLink Token", "GLT") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }

    /// @notice Mint new tokens (owner only, for testing)
    /// @param to Recipient address
    /// @param amount Amount to mint (in wei)
    function mint(address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert MintToZeroAddress();
        if (amount == 0) revert MintAmountZero();
        _mint(to, amount);
    }
}
