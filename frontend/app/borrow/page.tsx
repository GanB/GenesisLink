"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useLoanData } from "@/hooks/useLoanData";

export default function BorrowPage() {
  const { address, isConnected } = useWallet();
  const { loans, requestLoan, loading } = useLoanData();
  const [amount, setAmount] = useState("");
  const [termDays, setTermDays] = useState("30");
  const [collateral, setCollateral] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    await requestLoan({
      borrowerAddress: address,
      principal: parseFloat(amount),
      termDays: parseInt(termDays),
      collateralAmount: parseFloat(collateral),
    });
    setAmount("");
    setCollateral("");
  };

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400">
          Please connect your wallet to request a loan.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Request a Loan</h1>

      <form onSubmit={handleSubmit} className="glass p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Loan Amount (GLT)
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-genesis-500"
            placeholder="1000"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Term (days)
          </label>
          <select
            value={termDays}
            onChange={(e) => setTermDays(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-genesis-500"
          >
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="180">180 days</option>
            <option value="365">365 days</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Collateral Amount (GLT)
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            value={collateral}
            onChange={(e) => setCollateral(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-genesis-500"
            placeholder="1500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-genesis-600 hover:bg-genesis-700 disabled:opacity-50 rounded-lg font-semibold transition"
        >
          {loading ? "Submitting..." : "Request Loan"}
        </button>
      </form>

      {loans.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Loans</h2>
          {loans.map((loan) => (
            <div key={loan.id} className="glass p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{loan.principal} GLT</p>
                <p className="text-sm text-gray-400">
                  {loan.termDays} days @ {loan.interestRate}%
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  loan.state === "Active"
                    ? "bg-green-500/20 text-green-400"
                    : loan.state === "Repaid"
                    ? "bg-blue-500/20 text-blue-400"
                    : loan.state === "Defaulted"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {loan.state}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
