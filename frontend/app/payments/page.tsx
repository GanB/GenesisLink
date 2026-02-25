"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { usePaymentChannel } from "@/hooks/usePaymentChannel";

export default function PaymentsPage() {
  const { address, isConnected } = useWallet();
  const { channels, openChannel, closeChannel, loading } = usePaymentChannel();
  const [recipient, setRecipient] = useState("");
  const [deposit, setDeposit] = useState("");
  const [duration, setDuration] = useState("86400");

  const handleOpenChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    await openChannel({
      senderAddress: address,
      recipientAddress: recipient,
      deposit: parseFloat(deposit),
      durationSeconds: parseInt(duration),
    });
    setRecipient("");
    setDeposit("");
  };

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400">
          Please connect your wallet to manage payment channels.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">x402 Payment Channels</h1>

      <form onSubmit={handleOpenChannel} className="glass p-6 space-y-4">
        <h2 className="text-xl font-semibold">Open New Channel</h2>
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Recipient Address
          </label>
          <input
            type="text"
            required
            pattern="^0x[0-9a-fA-F]{40}$"
            title="Enter a valid Ethereum address (0x + 40 hex characters)"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-genesis-500 font-mono text-sm"
            placeholder="0x..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Deposit (GLT)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-genesis-500"
              placeholder="100"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-genesis-500"
            >
              <option value="3600">1 hour</option>
              <option value="86400">1 day</option>
              <option value="604800">7 days</option>
              <option value="2592000">30 days</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-genesis-600 hover:bg-genesis-700 disabled:opacity-50 rounded-lg font-semibold transition"
        >
          {loading ? "Opening..." : "Open Channel"}
        </button>
      </form>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Channels</h2>
        {channels.length === 0 ? (
          <p className="text-gray-400 glass p-6 text-center">
            No payment channels yet.
          </p>
        ) : (
          channels.map((ch) => (
            <div key={ch.id} className="glass p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm text-gray-400">Channel</p>
                  <p className="font-mono text-xs">{ch.id.slice(0, 16)}...</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    ch.state === "Open"
                      ? "bg-green-500/20 text-green-400"
                      : ch.state === "Closed"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {ch.state}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Recipient</p>
                  <p className="font-mono text-xs">
                    {ch.recipientAddress.slice(0, 10)}...
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Deposit</p>
                  <p>{ch.deposit} GLT</p>
                </div>
                <div>
                  <p className="text-gray-400">Expires</p>
                  <p>{new Date(ch.expiry).toLocaleDateString()}</p>
                </div>
              </div>
              {ch.state === "Open" && (
                <button
                  onClick={() => closeChannel(ch.id)}
                  disabled={loading}
                  className="mt-3 text-sm px-4 py-1.5 border border-white/10 rounded-lg hover:bg-white/5 transition"
                >
                  Close Channel
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
