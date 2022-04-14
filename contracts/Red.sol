// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract RED is ERC20, ERC20Burnable {
    constructor(uint256 initialSupply) ERC20("RedEye", "RED") {
        _mint(msg.sender, initialSupply);
    }
}
