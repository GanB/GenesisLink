import { expect } from "chai";
import { ethers } from "hardhat";
import { GenesisToken, GenesisLoan } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("GenesisLoan", function () {
  let token: GenesisToken;
  let loan: GenesisLoan;
  let owner: SignerWithAddress;
  let borrower: SignerWithAddress;

  const INITIAL_SUPPLY = ethers.parseEther("1000000");
  const LOAN_AMOUNT = ethers.parseEther("1000");
  const TERM_DAYS = 30;
  const COLLATERAL_AMOUNT = ethers.parseEther("1500");

  beforeEach(async function () {
    [owner, borrower] = await ethers.getSigners();

    const tokenFactory = await ethers.getContractFactory("GenesisToken");
    token = await tokenFactory.deploy(INITIAL_SUPPLY);

    const loanFactory = await ethers.getContractFactory("GenesisLoan");
    loan = await loanFactory.deploy(await token.getAddress());

    // Owner approves loan contract to disburse tokens
    await token.approve(await loan.getAddress(), ethers.MaxUint256);
  });

  describe("Request Loan", function () {
    it("Should create a pending loan", async function () {
      await expect(loan.connect(borrower).requestLoan(LOAN_AMOUNT, TERM_DAYS, COLLATERAL_AMOUNT))
        .to.emit(loan, "LoanRequested")
        .withArgs(1, borrower.address, LOAN_AMOUNT, TERM_DAYS, COLLATERAL_AMOUNT);

      const loanData = await loan.loans(1);
      expect(loanData.borrower).to.equal(borrower.address);
      expect(loanData.principal).to.equal(LOAN_AMOUNT);
      expect(loanData.termDays).to.equal(TERM_DAYS);
      expect(loanData.collateralAmount).to.equal(COLLATERAL_AMOUNT);
      expect(loanData.state).to.equal(0); // PENDING
    });

    it("Should increment loan IDs", async function () {
      await loan.connect(borrower).requestLoan(LOAN_AMOUNT, TERM_DAYS, COLLATERAL_AMOUNT);
      await loan.connect(borrower).requestLoan(LOAN_AMOUNT, 60, COLLATERAL_AMOUNT);
      expect(await loan.nextLoanId()).to.equal(3);
    });

    it("Should revert on zero amount", async function () {
      await expect(loan.connect(borrower).requestLoan(0, TERM_DAYS, COLLATERAL_AMOUNT))
        .to.be.revertedWithCustomError(loan, "ZeroAmount");
    });

    it("Should revert on zero term", async function () {
      await expect(loan.connect(borrower).requestLoan(LOAN_AMOUNT, 0, COLLATERAL_AMOUNT))
        .to.be.revertedWithCustomError(loan, "InvalidTerm");
    });

    it("Should revert on term > 365 days", async function () {
      await expect(loan.connect(borrower).requestLoan(LOAN_AMOUNT, 366, COLLATERAL_AMOUNT))
        .to.be.revertedWithCustomError(loan, "InvalidTerm");
    });
  });

  describe("Approve Loan", function () {
    beforeEach(async function () {
      await loan.connect(borrower).requestLoan(LOAN_AMOUNT, TERM_DAYS, COLLATERAL_AMOUNT);
    });

    it("Should approve and disburse funds", async function () {
      const balBefore = await token.balanceOf(borrower.address);

      await expect(loan.approveLoan(1))
        .to.emit(loan, "LoanApproved")
        .withArgs(1, borrower.address, LOAN_AMOUNT);

      const balAfter = await token.balanceOf(borrower.address);
      expect(balAfter - balBefore).to.equal(LOAN_AMOUNT);

      const loanData = await loan.loans(1);
      expect(loanData.state).to.equal(1); // ACTIVE
      expect(loanData.startTime).to.be.gt(0);
    });

    it("Should revert if non-owner tries to approve", async function () {
      await expect(loan.connect(borrower).approveLoan(1))
        .to.be.revertedWithCustomError(loan, "OwnableUnauthorizedAccount");
    });

    it("Should revert if loan not found", async function () {
      await expect(loan.approveLoan(999))
        .to.be.revertedWithCustomError(loan, "LoanNotFound");
    });

    it("Should revert if loan already approved", async function () {
      await loan.approveLoan(1);
      await expect(loan.approveLoan(1))
        .to.be.revertedWithCustomError(loan, "InvalidLoanState");
    });
  });

  describe("Repay Loan", function () {
    beforeEach(async function () {
      await loan.connect(borrower).requestLoan(LOAN_AMOUNT, TERM_DAYS, COLLATERAL_AMOUNT);
      await loan.approveLoan(1);
      // Give borrower extra tokens for interest
      await token.transfer(borrower.address, ethers.parseEther("10000"));
      await token.connect(borrower).approve(await loan.getAddress(), ethers.MaxUint256);
    });

    it("Should repay loan with principal + interest", async function () {
      const interest = await loan.calculateInterest(LOAN_AMOUNT, 500, TERM_DAYS);
      const totalOwed = LOAN_AMOUNT + interest;

      await expect(loan.connect(borrower).repayLoan(1, totalOwed))
        .to.emit(loan, "LoanRepaid")
        .withArgs(1, borrower.address, totalOwed);

      const loanData = await loan.loans(1);
      expect(loanData.state).to.equal(2); // REPAID
      expect(loanData.repaidAmount).to.equal(totalOwed);
    });

    it("Should revert if insufficient repayment", async function () {
      await expect(loan.connect(borrower).repayLoan(1, ethers.parseEther("1")))
        .to.be.revertedWithCustomError(loan, "InsufficientRepayment");
    });

    it("Should revert if non-borrower tries to repay", async function () {
      const interest = await loan.calculateInterest(LOAN_AMOUNT, 500, TERM_DAYS);
      const totalOwed = LOAN_AMOUNT + interest;
      await token.approve(await loan.getAddress(), ethers.MaxUint256);
      await expect(loan.connect(owner).repayLoan(1, totalOwed))
        .to.be.revertedWithCustomError(loan, "Unauthorized");
    });

    it("Should revert repay on zero amount", async function () {
      await expect(loan.connect(borrower).repayLoan(1, 0))
        .to.be.revertedWithCustomError(loan, "ZeroAmount");
    });

    it("Should revert if loan not active", async function () {
      // Request a new loan but don't approve it
      await loan.connect(borrower).requestLoan(LOAN_AMOUNT, TERM_DAYS, COLLATERAL_AMOUNT);
      await expect(loan.connect(borrower).repayLoan(2, LOAN_AMOUNT))
        .to.be.revertedWithCustomError(loan, "InvalidLoanState");
    });
  });

  describe("Default", function () {
    beforeEach(async function () {
      await loan.connect(borrower).requestLoan(LOAN_AMOUNT, TERM_DAYS, COLLATERAL_AMOUNT);
      await loan.approveLoan(1);
    });

    it("Should mark loan as defaulted after expiry", async function () {
      // Fast-forward past loan term
      await time.increase(TERM_DAYS * 24 * 60 * 60 + 1);

      await expect(loan.markDefault(1))
        .to.emit(loan, "LoanDefaulted")
        .withArgs(1, borrower.address);

      const loanData = await loan.loans(1);
      expect(loanData.state).to.equal(3); // DEFAULTED
    });

    it("Should revert default if loan not expired", async function () {
      await expect(loan.markDefault(1))
        .to.be.revertedWithCustomError(loan, "LoanNotExpired");
    });

    it("Should revert if non-owner tries to default", async function () {
      await time.increase(TERM_DAYS * 24 * 60 * 60 + 1);
      await expect(loan.connect(borrower).markDefault(1))
        .to.be.revertedWithCustomError(loan, "OwnableUnauthorizedAccount");
    });
  });

  describe("Get Loan Status", function () {
    it("Should return PENDING for new loan", async function () {
      await loan.connect(borrower).requestLoan(LOAN_AMOUNT, TERM_DAYS, COLLATERAL_AMOUNT);
      expect(await loan.getLoanStatus(1)).to.equal(0); // PENDING
    });

    it("Should return ACTIVE for approved loan", async function () {
      await loan.connect(borrower).requestLoan(LOAN_AMOUNT, TERM_DAYS, COLLATERAL_AMOUNT);
      await loan.approveLoan(1);
      expect(await loan.getLoanStatus(1)).to.equal(1); // ACTIVE
    });

    it("Should revert for non-existent loan", async function () {
      await expect(loan.getLoanStatus(999))
        .to.be.revertedWithCustomError(loan, "LoanNotFound");
    });
  });

  describe("Calculate Interest", function () {
    it("Should calculate simple interest correctly", async function () {
      // 1000 tokens * 500 bps (5%) * 365 days / (10000 * 365) = 50 tokens
      const interest = await loan.calculateInterest(
        ethers.parseEther("1000"),
        500,
        365
      );
      expect(interest).to.equal(ethers.parseEther("50"));
    });

    it("Should calculate partial year interest", async function () {
      // 1000 tokens * 500 bps * 30 days / (10000 * 365) ≈ 4.109589... tokens
      const interest = await loan.calculateInterest(
        ethers.parseEther("1000"),
        500,
        30
      );
      // (1000e18 * 500 * 30) / (10000 * 365) = 4109589041095890410
      expect(interest).to.equal(4109589041095890410n);
    });

    it("Should return 0 for zero principal", async function () {
      expect(await loan.calculateInterest(0, 500, 30)).to.equal(0);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to set default interest rate", async function () {
      await loan.setDefaultInterestRate(1000); // 10%
      expect(await loan.defaultInterestRate()).to.equal(1000);
    });

    it("Should revert if non-owner sets interest rate", async function () {
      await expect(loan.connect(borrower).setDefaultInterestRate(1000))
        .to.be.revertedWithCustomError(loan, "OwnableUnauthorizedAccount");
    });

    it("Should use updated rate for new loans", async function () {
      await loan.setDefaultInterestRate(1000); // 10%
      await loan.connect(borrower).requestLoan(LOAN_AMOUNT, TERM_DAYS, COLLATERAL_AMOUNT);
      const loanData = await loan.loans(1);
      expect(loanData.interestRate).to.equal(1000);
    });
  });
});
