import { expect } from "chai";
import { ethers } from "hardhat";
import { GenesisToken, GenesisCollateral } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("GenesisCollateral", function () {
  let token: GenesisToken;
  let collateral: GenesisCollateral;
  let owner: SignerWithAddress;
  let borrower: SignerWithAddress;

  const INITIAL_SUPPLY = ethers.parseEther("1000000");
  const COLLATERAL_AMOUNT = ethers.parseEther("1000");
  const LOAN_ID = 1;

  beforeEach(async function () {
    [owner, borrower] = await ethers.getSigners();

    const tokenFactory = await ethers.getContractFactory("GenesisToken");
    token = await tokenFactory.deploy(INITIAL_SUPPLY);

    const collateralFactory = await ethers.getContractFactory("GenesisCollateral");
    collateral = await collateralFactory.deploy(await token.getAddress());

    // Give borrower tokens and approve collateral contract
    await token.transfer(borrower.address, ethers.parseEther("10000"));
    await token.connect(borrower).approve(await collateral.getAddress(), ethers.MaxUint256);
  });

  describe("Deposit", function () {
    it("Should deposit collateral", async function () {
      await expect(collateral.connect(borrower).depositCollateral(LOAN_ID, COLLATERAL_AMOUNT))
        .to.emit(collateral, "CollateralDeposited")
        .withArgs(LOAN_ID, borrower.address, COLLATERAL_AMOUNT);

      const info = await collateral.collaterals(LOAN_ID);
      expect(info.amount).to.equal(COLLATERAL_AMOUNT);
      expect(info.depositor).to.equal(borrower.address);
    });

    it("Should revert on zero amount", async function () {
      await expect(collateral.connect(borrower).depositCollateral(LOAN_ID, 0))
        .to.be.revertedWithCustomError(collateral, "ZeroAmount");
    });
  });

  describe("Withdraw", function () {
    beforeEach(async function () {
      await collateral.connect(borrower).depositCollateral(LOAN_ID, COLLATERAL_AMOUNT);
    });

    it("Should withdraw after loan repaid", async function () {
      await collateral.markLoanRepaid(LOAN_ID);

      const balBefore = await token.balanceOf(borrower.address);
      await collateral.connect(borrower).withdrawCollateral(LOAN_ID);
      const balAfter = await token.balanceOf(borrower.address);

      expect(balAfter - balBefore).to.equal(COLLATERAL_AMOUNT);
    });

    it("Should revert withdrawal if loan not repaid", async function () {
      await expect(collateral.connect(borrower).withdrawCollateral(LOAN_ID))
        .to.be.revertedWithCustomError(collateral, "LoanNotRepaid");
    });

    it("Should revert if non-depositor tries to withdraw", async function () {
      await collateral.markLoanRepaid(LOAN_ID);
      await expect(collateral.connect(owner).withdrawCollateral(LOAN_ID))
        .to.be.revertedWithCustomError(collateral, "Unauthorized");
    });
  });

  describe("Liquidation", function () {
    beforeEach(async function () {
      await collateral.connect(borrower).depositCollateral(LOAN_ID, COLLATERAL_AMOUNT);
      // Set principal to 900 (90% LTV > 80% threshold)
      await collateral.setLoanPrincipal(LOAN_ID, ethers.parseEther("900"));
    });

    it("Should liquidate when LTV > 80%", async function () {
      await expect(collateral.liquidate(LOAN_ID))
        .to.emit(collateral, "LiquidationTriggered");
    });

    it("Should revert liquidation when LTV <= 80%", async function () {
      // Set principal to 500 (50% LTV)
      await collateral.setLoanPrincipal(LOAN_ID, ethers.parseEther("500"));
      await expect(collateral.liquidate(LOAN_ID))
        .to.be.revertedWithCustomError(collateral, "LTVBelowThreshold");
    });

    it("Should revert if non-owner tries to liquidate", async function () {
      await expect(collateral.connect(borrower).liquidate(LOAN_ID))
        .to.be.revertedWithCustomError(collateral, "OwnableUnauthorizedAccount");
    });
  });

  describe("Collateral Ratio", function () {
    it("Should return correct LTV", async function () {
      await collateral.connect(borrower).depositCollateral(LOAN_ID, ethers.parseEther("1000"));
      await collateral.setLoanPrincipal(LOAN_ID, ethers.parseEther("750"));
      expect(await collateral.getCollateralRatio(LOAN_ID)).to.equal(75n);
    });

    it("Should return 0 when no collateral", async function () {
      expect(await collateral.getCollateralRatio(999)).to.equal(0n);
    });
  });
});
