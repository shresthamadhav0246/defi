// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract InterestRateModel {
    uint256 public baseRate;
    uint256 public utilizationRate;
    uint256 public multiplier;

    constructor(uint256 _baseRate, uint256 _multiplier) {
        baseRate = _baseRate;
        multiplier = _multiplier;
    }

    function updateUtilizationRate(
        uint256 totalSupply,
        uint256 totalBorrows
    ) external {
        utilizationRate = (totalBorrows * 1e18) / totalSupply;
    }

    function getInterestRate() external view returns (uint256) {
        return baseRate + ((utilizationRate * multiplier) / 1e18);
    }
}
