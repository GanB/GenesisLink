import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Integration Tests", function () {
  describe("Full Loan Lifecycle", function () {
    it("Should complete request → approve → repay with collateral", async function () {
      const [owner, borrower] = await ethers.getSigners();

      // Deploy token
      const Token = await ethers.getContractFactory("GenesisToken");
      const token = await Token.deploy(ethers.parseEther("1000000"));

      // Deploy collateral vault
      const Collateral = await ethers.getContractFactory("GenesisCollateral");
      const collateral = await Collateral.deploy(await token.getAddress());

      // Deploy loan contract
      const Loan = await ethers.getContractFactory("GenesisLoan");
      const loan = await Loan.deploy(await token.getAddress());

      // Fund borrower with tokens for collateral
      await token.transfer(borrower.address, ethers.parseEther("5000"));

      // Borrower deposits collateral
      const loanAmount = ethers.parseEther("1000");
      const collateralAmount = ethers.parseEther("1500");
      await token.connect(borrower).approve(await collateral.getAddress(), collateralAmount);
      await collateral.connect(borrower).depositCollateral(1, collateralAmount);

      // Verify collateral deposited
      const info = await collateral.collaterals(1);
      expect(info.depositor).to.equal(borrower.address);
      expect(info.amount).to.equal(collateralAmount);

      // Borrower requests loan
      const tx = await loan.connect(borrower).requestLoan(loanAmount, 30, collateralAmount);
      const receipt = await tx.wait();
      const loanId = 1;

      // Verify loan is pending
      expect(await loan.getLoanStatus(loanId)).to.equal(0); // PENDING

      // Owner approves and funds the loan
      await token.approve(await loan.getAddress(), loanAmount);
      await loan.approveLoan(loanId);

      // Verify loan is active
      expect(await loan.getLoanStatus(loanId)).to.equal(1); // ACTIVE

      // Verify borrower received tokens
      const borrowerBal = await token.balanceOf(borrower.address);
      expect(borrowerBal).to.equal(ethers.parseEther("4500")); // 5000 - 1500 collateral + 1000 loan

      // Borrower repays loan (principal + interest)
      const interest = await loan.calculateInterest(loanAmount, 500, 30);
      const repayAmount = loanAmount + interest;
      await token.connect(borrower).approve(await loan.getAddress(), repayAmount);
      await loan.connect(borrower).repayLoan(loanId, repayAmount);

      // Verify loan is repaid
      expect(await loan.getLoanStatus(loanId)).to.equal(2); // REPAID

      // Owner marks loan repaid in collateral contract
      await collateral.setLoanPrincipal(1, loanAmount);
      await collateral.markLoanRepaid(1);

      // Borrower withdraws collateral
      await collateral.connect(borrower).withdrawCollateral(1);
      const finalInfo = await collateral.collaterals(1);
      expect(finalInfo.amount).to.equal(0);
      expect(finalInfo.withdrawn).to.equal(true);
    });

    it("Should handle loan default and liquidation", async function () {
      const [owner, borrower] = await ethers.getSigners();

      const Token = await ethers.getContractFactory("GenesisToken");
      const token = await Token.deploy(ethers.parseEther("1000000"));
      const Collateral = await ethers.getContractFactory("GenesisCollateral");
      const collateral = await Collateral.deploy(await token.getAddress());
      const Loan = await ethers.getContractFactory("GenesisLoan");
      const loan = await Loan.deploy(await token.getAddress());

      await token.transfer(borrower.address, ethers.parseEther("5000"));

      // Borrower deposits collateral (low amount for high LTV)
      const collateralAmount = ethers.parseEther("100");
      await token.connect(borrower).approve(await collateral.getAddress(), collateralAmount);
      await collateral.connect(borrower).depositCollateral(1, collateralAmount);

      // Request and approve loan
      const loanAmount = ethers.parseEther("1000");
      await loan.connect(borrower).requestLoan(loanAmount, 30, collateralAmount);
      await token.approve(await loan.getAddress(), loanAmount);
      await loan.approveLoan(1);

      // Advance time past term
      await time.increase(31 * 24 * 60 * 60);

      // Owner marks default
      await loan.markDefault(1);
      expect(await loan.getLoanStatus(1)).to.equal(3); // DEFAULTED

      // Owner sets principal and liquidates (LTV = 1000/100 * 100 = 1000%, > 80%)
      await collateral.setLoanPrincipal(1, loanAmount);
      await collateral.liquidate(1);

      const info = await collateral.collaterals(1);
      expect(info.amount).to.equal(0);
      expect(info.withdrawn).to.equal(true);
    });
  });

  describe("Full Payment Channel Lifecycle", function () {
    it("Should complete open → sign → close with EIP-712", async function () {
      const [owner, sender, recipient] = await ethers.getSigners();

      const Token = await ethers.getContractFactory("GenesisToken");
      const token = await Token.deploy(ethers.parseEther("1000000"));
      const Payment = await ethers.getContractFactory("GenesisPayment");
      const payment = await Payment.deploy(await token.getAddress());

      // Fund sender
      const deposit = ethers.parseEther("100");
      await token.transfer(sender.address, deposit);
      await token.connect(sender).approve(await payment.getAddress(), deposit);

      // Open channel
      const tx = await payment.connect(sender).openChannel(recipient.address, deposit, 86400);
      const receipt = await tx.wait();

      // Extract channelId from event
      const event = receipt?.logs.find(
        (log) => {
          try {
            return payment.interface.parseLog({ topics: log.topics as string[], data: log.data })?.name === "ChannelOpened";
          } catch { return false; }
        }
      );
      const parsedEvent = payment.interface.parseLog({ topics: event!.topics as string[], data: event!.data });
      const channelId = parsedEvent!.args.channelId;

      // Verify channel is open
      const channel = await payment.channels(channelId);
      expect(channel.sender).to.equal(sender.address);
      expect(channel.recipient).to.equal(recipient.address);
      expect(channel.deposit).to.equal(deposit);
      expect(channel.state).to.equal(0); // OPEN

      // Sign a payment voucher (sender signs to pay 60 tokens)
      const paymentAmount = ethers.parseEther("60");
      const nonce = 1;

      const domain = {
        name: "GenesisPayment",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await payment.getAddress(),
      };

      const types = {
        Payment: [
          { name: "channelId", type: "bytes32" },
          { name: "amount", type: "uint256" },
          { name: "nonce", type: "uint256" },
        ],
      };

      const value = { channelId, amount: paymentAmount, nonce };
      const signature = await sender.signTypedData(domain, types, value);

      // Verify payment off-chain
      const [valid, signer] = await payment.verifyPayment(channelId, paymentAmount, nonce, signature);
      expect(valid).to.be.true;
      expect(signer).to.equal(sender.address);

      // Recipient closes channel with signed voucher
      const senderBalBefore = await token.balanceOf(sender.address);
      const recipientBalBefore = await token.balanceOf(recipient.address);

      await payment.connect(recipient).closeChannel(channelId, paymentAmount, nonce, signature);

      // Verify payouts
      const senderBalAfter = await token.balanceOf(sender.address);
      const recipientBalAfter = await token.balanceOf(recipient.address);
      expect(recipientBalAfter - recipientBalBefore).to.equal(paymentAmount);
      expect(senderBalAfter - senderBalBefore).to.equal(deposit - paymentAmount);

      // Verify channel is closed
      const closedChannel = await payment.channels(channelId);
      expect(closedChannel.state).to.equal(1); // CLOSED
    });

    it("Should prevent nonce replay on close", async function () {
      const [owner, sender, recipient] = await ethers.getSigners();

      const Token = await ethers.getContractFactory("GenesisToken");
      const token = await Token.deploy(ethers.parseEther("1000000"));
      const Payment = await ethers.getContractFactory("GenesisPayment");
      const payment = await Payment.deploy(await token.getAddress());

      const deposit = ethers.parseEther("100");
      await token.transfer(sender.address, deposit);
      await token.connect(sender).approve(await payment.getAddress(), deposit);

      const tx = await payment.connect(sender).openChannel(recipient.address, deposit, 86400);
      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log) => {
          try {
            return payment.interface.parseLog({ topics: log.topics as string[], data: log.data })?.name === "ChannelOpened";
          } catch { return false; }
        }
      );
      const parsedEvent = payment.interface.parseLog({ topics: event!.topics as string[], data: event!.data });
      const channelId = parsedEvent!.args.channelId;

      const paymentAmount = ethers.parseEther("60");
      const nonce = 1;
      const domain = {
        name: "GenesisPayment",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await payment.getAddress(),
      };
      const types = {
        Payment: [
          { name: "channelId", type: "bytes32" },
          { name: "amount", type: "uint256" },
          { name: "nonce", type: "uint256" },
        ],
      };

      const signature = await sender.signTypedData(domain, types, { channelId, amount: paymentAmount, nonce });

      // First close succeeds
      await payment.connect(recipient).closeChannel(channelId, paymentAmount, nonce, signature);

      // Channel is closed, so replay attempt should fail (ChannelNotOpen, not nonce check, since channel is already closed)
      await expect(
        payment.connect(recipient).closeChannel(channelId, paymentAmount, nonce, signature)
      ).to.be.revertedWithCustomError(payment, "ChannelNotOpen");
    });

    it("Should handle force-close after expiry", async function () {
      const [owner, sender, recipient] = await ethers.getSigners();

      const Token = await ethers.getContractFactory("GenesisToken");
      const token = await Token.deploy(ethers.parseEther("1000000"));
      const Payment = await ethers.getContractFactory("GenesisPayment");
      const payment = await Payment.deploy(await token.getAddress());

      const deposit = ethers.parseEther("100");
      await token.transfer(sender.address, deposit);
      await token.connect(sender).approve(await payment.getAddress(), deposit);

      const tx = await payment.connect(sender).openChannel(recipient.address, deposit, 3600);
      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log) => {
          try {
            return payment.interface.parseLog({ topics: log.topics as string[], data: log.data })?.name === "ChannelOpened";
          } catch { return false; }
        }
      );
      const parsedEvent = payment.interface.parseLog({ topics: event!.topics as string[], data: event!.data });
      const channelId = parsedEvent!.args.channelId;

      // Advance time past expiry
      await time.increase(3601);

      const balBefore = await token.balanceOf(sender.address);
      await payment.connect(sender).forceClose(channelId);
      const balAfter = await token.balanceOf(sender.address);

      expect(balAfter - balBefore).to.equal(deposit);
      const closedChannel = await payment.channels(channelId);
      expect(closedChannel.state).to.equal(2); // FORCE_CLOSED
    });
  });

  describe("Multi-Contract Deployment", function () {
    it("Should deploy all contracts and verify linkage", async function () {
      const [owner] = await ethers.getSigners();

      const Token = await ethers.getContractFactory("GenesisToken");
      const token = await Token.deploy(ethers.parseEther("1000000"));

      const Collateral = await ethers.getContractFactory("GenesisCollateral");
      const collateral = await Collateral.deploy(await token.getAddress());

      const Loan = await ethers.getContractFactory("GenesisLoan");
      const loan = await Loan.deploy(await token.getAddress());

      const Payment = await ethers.getContractFactory("GenesisPayment");
      const payment = await Payment.deploy(await token.getAddress());

      // Verify all contracts reference the same token
      expect(await collateral.collateralToken()).to.equal(await token.getAddress());
      expect(await loan.lendingToken()).to.equal(await token.getAddress());
      expect(await payment.paymentToken()).to.equal(await token.getAddress());

      // Verify ownership
      expect(await token.owner()).to.equal(owner.address);
      expect(await collateral.owner()).to.equal(owner.address);
      expect(await loan.owner()).to.equal(owner.address);
      expect(await payment.owner()).to.equal(owner.address);
    });
  });

  describe("Collateral Depositor Protection", function () {
    it("Should prevent a different user from depositing to same loanId", async function () {
      const [owner, userA, userB] = await ethers.getSigners();

      const Token = await ethers.getContractFactory("GenesisToken");
      const token = await Token.deploy(ethers.parseEther("1000000"));
      const Collateral = await ethers.getContractFactory("GenesisCollateral");
      const collateral = await Collateral.deploy(await token.getAddress());

      await token.transfer(userA.address, ethers.parseEther("1000"));
      await token.transfer(userB.address, ethers.parseEther("1000"));

      const amount = ethers.parseEther("100");
      await token.connect(userA).approve(await collateral.getAddress(), amount);
      await collateral.connect(userA).depositCollateral(1, amount);

      // userB tries to deposit to same loanId
      await token.connect(userB).approve(await collateral.getAddress(), amount);
      await expect(
        collateral.connect(userB).depositCollateral(1, amount)
      ).to.be.revertedWithCustomError(collateral, "Unauthorized");
    });

    it("Should allow same depositor to add more collateral", async function () {
      const [owner, userA] = await ethers.getSigners();

      const Token = await ethers.getContractFactory("GenesisToken");
      const token = await Token.deploy(ethers.parseEther("1000000"));
      const Collateral = await ethers.getContractFactory("GenesisCollateral");
      const collateral = await Collateral.deploy(await token.getAddress());

      await token.transfer(userA.address, ethers.parseEther("1000"));

      const amount = ethers.parseEther("100");
      await token.connect(userA).approve(await collateral.getAddress(), ethers.parseEther("200"));
      await collateral.connect(userA).depositCollateral(1, amount);
      await collateral.connect(userA).depositCollateral(1, amount);

      const info = await collateral.collaterals(1);
      expect(info.amount).to.equal(ethers.parseEther("200"));
      expect(info.depositor).to.equal(userA.address);
    });
  });
});
