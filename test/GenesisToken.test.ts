import { expect } from "chai";
import { ethers } from "hardhat";
import { GenesisToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("GenesisToken", function () {
  let token: GenesisToken;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;

  const INITIAL_SUPPLY = ethers.parseEther("1000000");

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("GenesisToken");
    token = await factory.deploy(INITIAL_SUPPLY);
  });

  describe("Deployment", function () {
    it("Should set correct name and symbol", async function () {
      expect(await token.name()).to.equal("GenesisLink Token");
      expect(await token.symbol()).to.equal("GLT");
    });

    it("Should assign initial supply to deployer", async function () {
      expect(await token.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });

    it("Should set deployer as owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint", async function () {
      const amount = ethers.parseEther("100");
      await token.mint(addr1.address, amount);
      expect(await token.balanceOf(addr1.address)).to.equal(amount);
    });

    it("Should revert if non-owner tries to mint", async function () {
      const amount = ethers.parseEther("100");
      await expect(token.connect(addr1).mint(addr1.address, amount))
        .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("Should revert mint to zero address", async function () {
      await expect(token.mint(ethers.ZeroAddress, ethers.parseEther("1")))
        .to.be.revertedWithCustomError(token, "MintToZeroAddress");
    });

    it("Should revert mint of zero amount", async function () {
      await expect(token.mint(addr1.address, 0))
        .to.be.revertedWithCustomError(token, "MintAmountZero");
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const amount = ethers.parseEther("50");
      await token.transfer(addr1.address, amount);
      expect(await token.balanceOf(addr1.address)).to.equal(amount);
    });
  });
});
