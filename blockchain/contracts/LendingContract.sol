// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CollateralManager.sol";
import "./InterestRateModel.sol";
import "./LiquidityPool.sol";

contract LendingContract {
    CollateralManager collateralManager;
    InterestRateModel interestRateModel;
    LiquidityPool liquidityPool;

    struct Loan {
        address lender;
        address borrower;
        uint256 amount;
        uint256 collateralAmount;
        uint256 interestRate;
        uint256 duration;
        bool isRepaid;
    }

    uint256 public loanCounter;
    mapping(uint256 => Loan) public loans;

    event LoanOffered(
        uint256 loanId,
        address indexed lender,
        uint256 amount,
        uint256 interestRate,
        uint256 duration
    );
    event LoanRequested(
        uint256 loanId,
        address indexed borrower,
        uint256 collateralAmount
    );
    event LoanAccepted(
        uint256 loanId,
        address indexed lender,
        address indexed borrower
    );
    event LoanRepaid(uint256 loanId, address indexed borrower, uint256 amount);

    constructor(
        address _collateralManager,
        address _interestRateModel,
        address _liquidityPool
    ) {
        collateralManager = CollateralManager(_collateralManager);
        interestRateModel = InterestRateModel(_interestRateModel);
        liquidityPool = LiquidityPool(_liquidityPool);
    }

    function offerLoan(
        uint256 amount,
        uint256 interestRate,
        uint256 duration
    ) external {
        loanCounter++;
        loans[loanCounter] = Loan({
            lender: msg.sender,
            borrower: address(0),
            amount: amount,
            collateralAmount: 0,
            interestRate: interestRate,
            duration: duration,
            isRepaid: false
        });
        emit LoanOffered(
            loanCounter,
            msg.sender,
            amount,
            interestRate,
            duration
        );
    }

    function requestLoan(uint256 loanId, uint256 collateralAmount) external {
        Loan storage loan = loans[loanId];
        require(loan.lender != address(0), "Loan does not exist");
        require(loan.borrower == address(0), "Loan already taken");

        collateralManager.lockCollateral(msg.sender, collateralAmount);
        loan.borrower = msg.sender;
        loan.collateralAmount = collateralAmount;

        emit LoanRequested(loanId, msg.sender, collateralAmount);
    }

    function acceptLoan(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        require(msg.sender == loan.lender, "Only lender can accept the loan");
        require(loan.borrower != address(0), "No borrower for this loan");

        liquidityPool.provideLoan(loan.borrower, loan.amount);
        emit LoanAccepted(loanId, loan.lender, loan.borrower);
    }

    function repayLoan(uint256 loanId) internal {
        Loan storage loan = loans[loanId];
        require(
            msg.sender == loan.borrower,
            "Only borrower can repay the loan"
        );
        require(!loan.isRepaid, "Loan already repaid");

        uint256 interest = (loan.amount * loan.duration * loan.interestRate) /
            (100 * 365 * 24 * 60 * 60);
        uint256 totalAmount = loan.amount + interest;

        require(msg.value == totalAmount, "Incorrect repayment amount");

        collateralManager.releaseCollateral(msg.sender, loan.collateralAmount);
        payable(loan.lender).transfer(totalAmount);
        loan.isRepaid = true;

        emit LoanRepaid(loanId, msg.sender, totalAmount);
    }
}
