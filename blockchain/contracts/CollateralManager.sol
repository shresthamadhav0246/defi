// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CollateralManager {
    mapping(address => uint256) public collaterals;

    event CollateralLocked(address indexed user, uint256 amount);
    event CollateralReleased(address indexed user, uint256 amount);

    function lockCollateral(address user, uint256 amount) external payable {
        require(msg.value == amount, "Incorrect collateral amount");
        collaterals[user] += amount;
        emit CollateralLocked(user, amount);
    }

    function releaseCollateral(address user, uint256 amount) external {
        require(collaterals[user] >= amount, "Insufficient collateral");
        collaterals[user] -= amount;
        payable(user).transfer(amount);
        emit CollateralReleased(user, amount);
    }
}
