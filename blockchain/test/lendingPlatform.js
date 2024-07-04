const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Lending Platform", function () {
  let LendingContract, lendingContract;
  let CollateralManager, collateralManager;
  let InterestRateModel, interestRateModel;
  let LiquidityPool, liquidityPool;
  let owner, lender, borrower;

  beforeEach(async function () {
    [owner, lender, borrower] = await ethers.getSigners();

    // Deploy CollateralManager
    CollateralManager = await ethers.getContractFactory("CollateralManager");
    collateralManager = await CollateralManager.deploy();

    // Deploy InterestRateModel
    InterestRateModel = await ethers.getContractFactory("InterestRateModel");
    interestRateModel = await InterestRateModel.deploy(5, 10);

    // Deploy LiquidityPool
    LiquidityPool = await ethers.getContractFactory("LiquidityPool");
    liquidityPool = await LiquidityPool.deploy();

    // Deploy LendingContract
    LendingContract = await ethers.getContractFactory("LendingContract");
    lendingContract = await LendingContract.deploy(
      collateralManager.target,
      interestRateModel.target,
      liquidityPool.target
    );
  });

  it("Should allow a lender to offer a loan", async function () {
    await lendingContract
      .connect(lender)
      .offerLoan(ethers.parseEther("10"), 5, 30);

    const loan = await lendingContract.loans(1);
    expect(loan.lender).to.equal(lender.address);
    expect(loan.amount).to.equal(ethers.parseEther("10"));
  });

  it("Should allow a borrower to request a loan", async function () {
    await lendingContract
      .connect(lender)
      .offerLoan(ethers.parseEther("10"), 5, 30);

    await collateralManager.connect(borrower).lockCollateral(borrower.address, {
      value: BigInt("1500000000000000"),
    });

    await lendingContract
      .connect(borrower)
      .requestLoan(1, BigInt("1500000000000000"));

    const loan = await lendingContract.loans(1);
    expect(loan.borrower).to.equal(borrower.address);
    expect(loan.collateralAmount).to.equal(ethers.parseEther("15"));
  });

  it("Should allow a lender to accept a loan", async function () {
    await lendingContract
      .connect(lender)
      .offerLoan(ethers.parseEther("10"), 5, 30);

    await collateralManager.connect(borrower).lockCollateral(borrower.address, {
      value: ethers.parseEther("15"),
    });

    await lendingContract
      .connect(borrower)
      .requestLoan(1, ethers.parseEther("15"));
    await lendingContract.connect(lender).acceptLoan(1);

    const loan = await lendingContract.loans(1);
    expect(loan.borrower).to.equal(borrower.address);
    expect(loan.lender).to.equal(lender.address);
  });

  it("Should allow a borrower to repay a loan", async function () {
    await lendingContract
      .connect(lender)
      .offerLoan(ethers.parseEther("10"), 5, 30);

    await collateralManager.connect(borrower).lockCollateral(borrower.address, {
      value: ethers.parseEther("15"),
    });

    await lendingContract
      .connect(borrower)
      .requestLoan(1, ethers.parseEther("15"));
    await lendingContract.connect(lender).acceptLoan(1);

    const interest = ethers
      .parseEther("10")
      .mul(5)
      .div(100)
      .mul(30)
      .div(365)
      .div(24)
      .div(60)
      .div(60);
    const repaymentAmount = ethers.utils.parseEther("10").add(interest);

    await lendingContract
      .connect(borrower)
      .repayLoan(1, { value: repaymentAmount });

    const loan = await lendingContract.loans(1);
    expect(loan.isRepaid).to.be.true;
  });

  it("Should allow liquidity providers to deposit and withdraw funds", async function () {
    await liquidityPool
      .connect(lender)
      .deposit({ value: ethers.parseEther("20") });
    let balance = await liquidityPool.balanceOf(lender.address);
    expect(balance).to.equal(ethers.parseEther("20"));

    await liquidityPool.connect(lender).withdraw(ethers.parseEther("10"));
    balance = await liquidityPool.balanceOf(lender.address);
    expect(balance).to.equal(ethers.parseEther("10"));
  });

  it("Should adjust interest rates based on utilization", async function () {
    await interestRateModel.updateUtilizationRate(
      ethers.parseEther("100"),
      ethers.parseEther("50")
    );

    const rate = await interestRateModel.getInterestRate();
    expect(rate).to.be.gt(5);
  });
});
