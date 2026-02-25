import { expect } from "chai";
import { ethers } from "hardhat";
import { GenesisToken, GenesisPayment } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("GenesisPayment", function () {
  let token: GenesisToken;
  let payment: GenesisPayment;
  let owner: SignerWithAddress;
  let sender: SignerWithAddress;
  let recipient: SignerWithAddress;

  const INITIAL_SUPPLY = ethers.parseEther("1000000");
  const DEPOSIT_AMOUNT = ethers.parseEther("100");
  const DURATION = 86400; // 1 day in seconds

  // EIP-712 helpers
  let domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  };

  const PaymentType = {
    Payment: [
      { name: "channelId", type: "bytes32" },
      { name: "amount", type: "uint256" },
      { name: "nonce", type: "uint256" },
    ],
  };

  async function signPayment(
    signer: SignerWithAddress,
    channelId: string,
    amount: bigint,
    nonce: number
  ) {
    return signer.signTypedData(domain, PaymentType, {
      channelId,
      amount,
      nonce,
    });
  }

  async function openChannelAndGetId() {
    const tx = await payment
      .connect(sender)
      .openChannel(recipient.address, DEPOSIT_AMOUNT, DURATION);
    const receipt = await tx.wait();
    const event = receipt!.logs.find((log) => {
      try {
        return payment.interface.parseLog({ topics: log.topics as string[], data: log.data })?.name === "ChannelOpened";
      } catch {
        return false;
      }
    });
    const parsed = payment.interface.parseLog({
      topics: event!.topics as string[],
      data: event!.data,
    });
    return parsed!.args.channelId;
  }

  beforeEach(async function () {
    [owner, sender, recipient] = await ethers.getSigners();

    const tokenFactory = await ethers.getContractFactory("GenesisToken");
    token = await tokenFactory.deploy(INITIAL_SUPPLY);

    const paymentFactory = await ethers.getContractFactory("GenesisPayment");
    payment = await paymentFactory.deploy(await token.getAddress());

    // Give sender tokens and approve payment contract
    await token.transfer(sender.address, ethers.parseEther("10000"));
    await token
      .connect(sender)
      .approve(await payment.getAddress(), ethers.MaxUint256);

    // Set up EIP-712 domain
    const network = await ethers.provider.getNetwork();
    domain = {
      name: "GenesisPayment",
      version: "1",
      chainId: Number(network.chainId),
      verifyingContract: await payment.getAddress(),
    };
  });

  describe("Open Channel", function () {
    it("Should open a payment channel", async function () {
      const tx = await payment
        .connect(sender)
        .openChannel(recipient.address, DEPOSIT_AMOUNT, DURATION);

      await expect(tx).to.emit(payment, "ChannelOpened");

      // Verify token transfer
      expect(await token.balanceOf(await payment.getAddress())).to.equal(
        DEPOSIT_AMOUNT
      );
    });

    it("Should revert on zero deposit", async function () {
      await expect(
        payment.connect(sender).openChannel(recipient.address, 0, DURATION)
      ).to.be.revertedWithCustomError(payment, "ZeroAmount");
    });

    it("Should revert on zero duration", async function () {
      await expect(
        payment
          .connect(sender)
          .openChannel(recipient.address, DEPOSIT_AMOUNT, 0)
      ).to.be.revertedWithCustomError(payment, "InvalidDuration");
    });

    it("Should revert on duration > 30 days", async function () {
      await expect(
        payment
          .connect(sender)
          .openChannel(
            recipient.address,
            DEPOSIT_AMOUNT,
            31 * 24 * 60 * 60
          )
      ).to.be.revertedWithCustomError(payment, "InvalidDuration");
    });
  });

  describe("Close Channel", function () {
    let channelId: string;

    beforeEach(async function () {
      channelId = await openChannelAndGetId();
    });

    it("Should close channel with valid signature", async function () {
      const payAmount = ethers.parseEther("60");
      const signature = await signPayment(sender, channelId, payAmount, 1);

      const recipientBalBefore = await token.balanceOf(recipient.address);
      const senderBalBefore = await token.balanceOf(sender.address);

      await expect(
        payment
          .connect(recipient)
          .closeChannel(channelId, payAmount, 1, signature)
      ).to.emit(payment, "ChannelClosed");

      const recipientBalAfter = await token.balanceOf(recipient.address);
      const senderBalAfter = await token.balanceOf(sender.address);

      expect(recipientBalAfter - recipientBalBefore).to.equal(payAmount);
      expect(senderBalAfter - senderBalBefore).to.equal(
        DEPOSIT_AMOUNT - payAmount
      );
    });

    it("Should close channel with full deposit to recipient", async function () {
      const signature = await signPayment(
        sender,
        channelId,
        DEPOSIT_AMOUNT,
        1
      );

      await payment
        .connect(recipient)
        .closeChannel(channelId, DEPOSIT_AMOUNT, 1, signature);

      const channel = await payment.channels(channelId);
      expect(channel.state).to.equal(1); // CLOSED
    });

    it("Should revert if non-recipient tries to close", async function () {
      const signature = await signPayment(
        sender,
        channelId,
        ethers.parseEther("50"),
        1
      );

      await expect(
        payment
          .connect(sender)
          .closeChannel(channelId, ethers.parseEther("50"), 1, signature)
      ).to.be.revertedWithCustomError(payment, "Unauthorized");
    });

    it("Should revert with invalid signature", async function () {
      // Sign with wrong signer (recipient instead of sender)
      const signature = await signPayment(
        recipient,
        channelId,
        ethers.parseEther("50"),
        1
      );

      await expect(
        payment
          .connect(recipient)
          .closeChannel(channelId, ethers.parseEther("50"), 1, signature)
      ).to.be.revertedWithCustomError(payment, "InvalidSignature");
    });

    it("Should revert if amount exceeds deposit", async function () {
      const tooMuch = DEPOSIT_AMOUNT + 1n;
      const signature = await signPayment(sender, channelId, tooMuch, 1);

      await expect(
        payment
          .connect(recipient)
          .closeChannel(channelId, tooMuch, 1, signature)
      ).to.be.revertedWithCustomError(payment, "AmountExceedsDeposit");
    });

    it("Should revert if channel already closed", async function () {
      const signature = await signPayment(
        sender,
        channelId,
        ethers.parseEther("50"),
        1
      );
      await payment
        .connect(recipient)
        .closeChannel(channelId, ethers.parseEther("50"), 1, signature);

      const signature2 = await signPayment(
        sender,
        channelId,
        ethers.parseEther("50"),
        2
      );
      await expect(
        payment
          .connect(recipient)
          .closeChannel(channelId, ethers.parseEther("50"), 2, signature2)
      ).to.be.revertedWithCustomError(payment, "ChannelNotOpen");
    });
  });

  describe("Force Close", function () {
    let channelId: string;

    beforeEach(async function () {
      channelId = await openChannelAndGetId();
    });

    it("Should force-close after expiry", async function () {
      await time.increase(DURATION + 1);

      const balBefore = await token.balanceOf(sender.address);
      await expect(
        payment.connect(sender).forceClose(channelId)
      ).to.emit(payment, "ChannelForceClosed");
      const balAfter = await token.balanceOf(sender.address);

      expect(balAfter - balBefore).to.equal(DEPOSIT_AMOUNT);
    });

    it("Should revert force-close before expiry", async function () {
      await expect(
        payment.connect(sender).forceClose(channelId)
      ).to.be.revertedWithCustomError(payment, "ChannelNotExpired");
    });

    it("Should revert if non-sender tries to force-close", async function () {
      await time.increase(DURATION + 1);
      await expect(
        payment.connect(recipient).forceClose(channelId)
      ).to.be.revertedWithCustomError(payment, "Unauthorized");
    });
  });

  describe("Verify Payment", function () {
    let channelId: string;

    beforeEach(async function () {
      channelId = await openChannelAndGetId();
    });

    it("Should verify valid payment signature", async function () {
      const amount = ethers.parseEther("50");
      const signature = await signPayment(sender, channelId, amount, 1);

      const [valid, signer] = await payment.verifyPayment(
        channelId,
        amount,
        1,
        signature
      );
      expect(valid).to.equal(true);
      expect(signer).to.equal(sender.address);
    });

    it("Should reject payment exceeding deposit", async function () {
      const tooMuch = DEPOSIT_AMOUNT + 1n;
      const signature = await signPayment(sender, channelId, tooMuch, 1);

      const [valid] = await payment.verifyPayment(
        channelId,
        tooMuch,
        1,
        signature
      );
      expect(valid).to.equal(false);
    });

    it("Should reject wrong signer", async function () {
      const amount = ethers.parseEther("50");
      const signature = await signPayment(recipient, channelId, amount, 1);

      const [valid, signer] = await payment.verifyPayment(
        channelId,
        amount,
        1,
        signature
      );
      expect(valid).to.equal(false);
      expect(signer).to.not.equal(sender.address);
    });
  });

  describe("Domain & Typehash", function () {
    it("Should expose domain separator", async function () {
      const separator = await payment.getDomainSeparator();
      expect(separator).to.not.equal(ethers.ZeroHash);
    });

    it("Should expose payment typehash", async function () {
      const typehash = await payment.getPaymentTypehash();
      const expected = ethers.keccak256(
        ethers.toUtf8Bytes("Payment(bytes32 channelId,uint256 amount,uint256 nonce)")
      );
      expect(typehash).to.equal(expected);
    });
  });
});
