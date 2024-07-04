// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LiquidityPool is ERC20 {
    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidity;

    constructor() ERC20("Liquidity Pool Token", "LPT") {}

    function deposit() external payable {
        _mint(msg.sender, msg.value);
        liquidity[msg.sender] += msg.value;
        totalLiquidity += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(liquidity[msg.sender] >= amount, "Insufficient liquidity");

        _burn(msg.sender, amount);
        liquidity[msg.sender] -= amount;
        totalLiquidity -= amount;
        payable(msg.sender).transfer(amount);
    }

    function provideLoan(address borrower, uint256 amount) external {
        require(totalLiquidity >= amount, "Insufficient liquidity");

        liquidity[address(this)] -= amount;
        totalLiquidity -= amount;
        payable(borrower).transfer(amount);
    }
}
