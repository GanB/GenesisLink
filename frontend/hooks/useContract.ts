"use client";

import { useMemo } from "react";
import { Contract } from "ethers";
import { useWallet } from "./useWallet";

const CONTRACT_ABIS: Record<string, string[]> = {
  GenesisToken: [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function balanceOf(address) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transfer(address to, uint256 amount) returns (bool)",
  ],
  GenesisLoan: [
    "function requestLoan(uint256 amount, uint256 termDays, uint256 collateralAmount) returns (uint256)",
    "function approveLoan(uint256 loanId)",
    "function repayLoan(uint256 loanId, uint256 amount)",
    "function getLoanStatus(uint256 loanId) view returns (uint8)",
    "function calculateInterest(uint256 principal, uint256 rate, uint256 termDays) pure returns (uint256)",
    "function loans(uint256) view returns (address borrower, uint256 principal, uint256 interestRate, uint256 termDays, uint256 collateralAmount, uint256 startTime, uint256 repaidAmount, uint8 state)",
    "event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 termDays, uint256 collateralAmount)",
    "event LoanApproved(uint256 indexed loanId, address indexed borrower, uint256 amount)",
    "event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 totalRepaid)",
  ],
  GenesisPayment: [
    "function openChannel(address recipient, uint256 deposit, uint256 durationSeconds) returns (bytes32)",
    "function closeChannel(bytes32 channelId, uint256 amount, uint256 nonce, bytes signature)",
    "function forceClose(bytes32 channelId)",
    "function verifyPayment(bytes32 channelId, uint256 amount, uint256 nonce, bytes signature) view returns (bool valid, address signer)",
    "function channels(bytes32) view returns (address sender, address recipient, uint256 deposit, uint256 expiry, uint8 state)",
    "event ChannelOpened(bytes32 indexed channelId, address indexed sender, address indexed recipient, uint256 deposit, uint256 expiry)",
    "event ChannelClosed(bytes32 indexed channelId, uint256 senderRefund, uint256 recipientPayout)",
  ],
  GenesisCollateral: [
    "function depositCollateral(uint256 loanId, uint256 amount)",
    "function withdrawCollateral(uint256 loanId)",
    "function getCollateralRatio(uint256 loanId) view returns (uint256)",
    "function collaterals(uint256) view returns (address depositor, uint256 amount, bool withdrawn)",
    "event CollateralDeposited(uint256 indexed loanId, address indexed depositor, uint256 amount)",
  ],
};

export function useContract(contractName: string, address: string) {
  const { provider } = useWallet();

  return useMemo(() => {
    if (!provider || !address) return null;
    const abi = CONTRACT_ABIS[contractName];
    if (!abi) return null;

    return new Contract(address, abi, provider);
  }, [provider, address, contractName]);
}
