const GenesisLinkContractDeployment = async () => {
  const transactionsFactory = await hre.ethers.getContractFactory(
    "GenesisLinkTransactions"
  );
  const transactionsContract = await transactionsFactory.deploy();

  await transactionsContract.deployed();

  console.log(
    "GenesisLink Transactions Contract Deployed to Address: ",
    transactionsContract.address
  );
};

const runMain = async () => {
  try {
    await GenesisLinkContractDeployment();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();
