import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // 1. Deploy GenesisToken
  const initialSupply = ethers.parseEther("1000000");
  const tokenFactory = await ethers.getContractFactory("GenesisToken");
  const token = await tokenFactory.deploy(initialSupply);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("GenesisToken deployed to:", tokenAddress);

  // 2. Deploy GenesisCollateral
  const collateralFactory = await ethers.getContractFactory("GenesisCollateral");
  const collateral = await collateralFactory.deploy(tokenAddress);
  await collateral.waitForDeployment();
  const collateralAddress = await collateral.getAddress();
  console.log("GenesisCollateral deployed to:", collateralAddress);

  // 3. Deploy GenesisLoan
  const loanFactory = await ethers.getContractFactory("GenesisLoan");
  const loan = await loanFactory.deploy(tokenAddress);
  await loan.waitForDeployment();
  const loanAddress = await loan.getAddress();
  console.log("GenesisLoan deployed to:", loanAddress);

  // 4. Deploy GenesisPayment
  const paymentFactory = await ethers.getContractFactory("GenesisPayment");
  const payment = await paymentFactory.deploy(tokenAddress);
  await payment.waitForDeployment();
  const paymentAddress = await payment.getAddress();
  console.log("GenesisPayment deployed to:", paymentAddress);

  console.log("\n--- Deployment Summary ---");
  console.log("GenesisToken:      ", tokenAddress);
  console.log("GenesisCollateral:  ", collateralAddress);
  console.log("GenesisLoan:       ", loanAddress);
  console.log("GenesisPayment:    ", paymentAddress);
  console.log("\nUpdate your .env with these addresses.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
