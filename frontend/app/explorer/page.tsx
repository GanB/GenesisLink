"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface LoanSummary {
  id: string;
  borrowerAddress: string;
  principal: number;
  state: string;
  createdAt: string;
}

interface ChannelSummary {
  id: string;
  senderAddress: string;
  recipientAddress: string;
  deposit: number;
  state: string;
  createdAt: string;
}

export default function ExplorerPage() {
  const [loans, setLoans] = useState<LoanSummary[]>([]);
  const [channels, setChannels] = useState<ChannelSummary[]>([]);
  const [blockNumber, setBlockNumber] = useState<string>("");
  const [chainId, setChainId] = useState<string>("");
  const [tab, setTab] = useState<"loans" | "channels">("loans");

  useEffect(() => {
    async function fetchData() {
      try {
        const [loansRes, channelsRes, blockRes, chainRes] = await Promise.all([
          fetch(`${API_URL}/api/loan`),
          fetch(`${API_URL}/api/payment`),
          fetch(`${API_URL}/api/blockchain/latest-block`),
          fetch(`${API_URL}/api/blockchain/chain-id`),
        ]);

        if (loansRes.ok) setLoans(await loansRes.json());
        if (channelsRes.ok) setChannels(await channelsRes.json());
        if (blockRes.ok) {
          const data = await blockRes.json();
          setBlockNumber(data.blockNumber);
        }
        if (chainRes.ok) {
          const data = await chainRes.json();
          setChainId(data.chainId?.toString() || "");
        }
      } catch {
        // Explorer page is best-effort
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Explorer</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-4">
          <p className="text-sm text-gray-400">Latest Block</p>
          <p className="text-2xl font-bold font-mono">{blockNumber || "---"}</p>
        </div>
        <div className="glass p-4">
          <p className="text-sm text-gray-400">Chain ID</p>
          <p className="text-2xl font-bold">{chainId || "---"}</p>
        </div>
        <div className="glass p-4">
          <p className="text-sm text-gray-400">Total Activity</p>
          <p className="text-2xl font-bold">
            {loans.length + channels.length} records
          </p>
        </div>
      </div>

      <div className="glass p-6">
        <div className="flex gap-4 mb-4 border-b border-white/10 pb-3">
          <button
            onClick={() => setTab("loans")}
            className={`text-sm font-semibold pb-1 ${
              tab === "loans"
                ? "text-genesis-500 border-b-2 border-genesis-500"
                : "text-gray-400"
            }`}
          >
            Loans ({loans.length})
          </button>
          <button
            onClick={() => setTab("channels")}
            className={`text-sm font-semibold pb-1 ${
              tab === "channels"
                ? "text-genesis-500 border-b-2 border-genesis-500"
                : "text-gray-400"
            }`}
          >
            Payment Channels ({channels.length})
          </button>
        </div>

        {tab === "loans" && (
          <div className="overflow-x-auto">
            {loans.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No loans found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10">
                    <th className="text-left py-2">ID</th>
                    <th className="text-left py-2">Borrower</th>
                    <th className="text-left py-2">Principal</th>
                    <th className="text-left py-2">State</th>
                    <th className="text-left py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => (
                    <tr key={loan.id} className="border-b border-white/5">
                      <td className="py-2 font-mono text-xs">
                        {loan.id.slice(0, 8)}...
                      </td>
                      <td className="py-2 font-mono text-xs">
                        {loan.borrowerAddress.slice(0, 10)}...
                      </td>
                      <td className="py-2">{loan.principal} GLT</td>
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
            )}
          </div>
        )}

        {tab === "channels" && (
          <div className="overflow-x-auto">
            {channels.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                No payment channels found.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10">
                    <th className="text-left py-2">ID</th>
                    <th className="text-left py-2">Sender</th>
                    <th className="text-left py-2">Recipient</th>
                    <th className="text-left py-2">Deposit</th>
                    <th className="text-left py-2">State</th>
                    <th className="text-left py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {channels.map((ch) => (
                    <tr key={ch.id} className="border-b border-white/5">
                      <td className="py-2 font-mono text-xs">
                        {ch.id.slice(0, 8)}...
                      </td>
                      <td className="py-2 font-mono text-xs">
                        {ch.senderAddress.slice(0, 10)}...
                      </td>
                      <td className="py-2 font-mono text-xs">
                        {ch.recipientAddress.slice(0, 10)}...
                      </td>
                      <td className="py-2">{ch.deposit} GLT</td>
                      <td className="py-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            ch.state === "Open"
                              ? "bg-green-500/20 text-green-400"
                              : ch.state === "Closed"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {ch.state}
                        </span>
                      </td>
                      <td className="py-2 text-gray-400">
                        {new Date(ch.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
