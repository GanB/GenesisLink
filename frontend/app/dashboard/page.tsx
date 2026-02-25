"use client";

import { useWallet } from "@/hooks/useWallet";
import { useLoanData } from "@/hooks/useLoanData";

export default function DashboardPage() {
  const { address, isConnected, balance } = useWallet();
  const { loans, loading } = useLoanData();

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400">
          Please connect your wallet to view your dashboard.
        </p>
      </div>
    );
  }

  const activeLoans = loans.filter((l) => l.state === "Active");
  const totalBorrowed = loans.reduce((sum, l) => sum + l.principal, 0);
  const totalCollateral = loans.reduce((sum, l) => sum + l.collateralAmount, 0);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass p-4">
          <p className="text-sm text-gray-400">Wallet Balance</p>
          <p className="text-2xl font-bold">{balance} ETH</p>
        </div>
        <div className="glass p-4">
          <p className="text-sm text-gray-400">Active Loans</p>
          <p className="text-2xl font-bold">{activeLoans.length}</p>
        </div>
        <div className="glass p-4">
          <p className="text-sm text-gray-400">Total Borrowed</p>
          <p className="text-2xl font-bold">{totalBorrowed} GLT</p>
        </div>
        <div className="glass p-4">
          <p className="text-sm text-gray-400">Total Collateral</p>
          <p className="text-2xl font-bold">{totalCollateral} GLT</p>
        </div>
      </div>

      <div className="glass p-6">
        <h2 className="text-xl font-semibold mb-4">Wallet Info</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Address</span>
            <span className="font-mono">{address}</span>
          </div>
        </div>
      </div>

      <div className="glass p-6">
        <h2 className="text-xl font-semibold mb-4">Loan History</h2>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : loans.length === 0 ? (
          <p className="text-gray-400">No loans yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-white/10">
                  <th className="text-left py-2">ID</th>
                  <th className="text-left py-2">Principal</th>
                  <th className="text-left py-2">Term</th>
                  <th className="text-left py-2">Rate</th>
                  <th className="text-left py-2">Collateral</th>
                  <th className="text-left py-2">State</th>
                  <th className="text-left py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id} className="border-b border-white/5">
                    <td className="py-2 font-mono text-xs">
                      {loan.id.slice(0, 8)}...
                    </td>
                    <td className="py-2">{loan.principal} GLT</td>
                    <td className="py-2">{loan.termDays}d</td>
                    <td className="py-2">{loan.interestRate}%</td>
                    <td className="py-2">{loan.collateralAmount} GLT</td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
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
                    </td>
                    <td className="py-2 text-gray-400">
                      {new Date(loan.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
