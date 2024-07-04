const hre = require("hardhat");

async function main() {
  // Deploy CollateralManager contract
  const CollateralManager = await hre.ethers.getContractFactory(
    "CollateralManager"
  );
  const collateralManager = await CollateralManager.deploy();
  await collateralManager.target;
  console.log("CollateralManager deployed to:", collateralManager.target);

  // Deploy InterestRateModel contract
  const InterestRateModel = await hre.ethers.getContractFactory(
    "InterestRateModel"
  );
  const interestRateModel = await InterestRateModel.deploy(5, 10); // Example parameters
  await interestRateModel.target;
  console.log("InterestRateModel deployed to:", interestRateModel.target);

  // Deploy LiquidityPool contract
  const LiquidityPool = await hre.ethers.getContractFactory("LiquidityPool");
  const liquidityPool = await LiquidityPool.deploy();
  await liquidityPool.target;
  console.log("LiquidityPool deployed to:", liquidityPool.target);

  // Deploy LendingContract contract
  const LendingContract = await hre.ethers.getContractFactory(
    "LendingContract"
  );
  const lendingContract = await LendingContract.deploy(
    collateralManager.target,
    interestRateModel.target,
    liquidityPool.target
  );
  await lendingContract.target;
  console.log("LendingContract deployed to:", lendingContract.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
