"use client";

import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";

export default function Home() {
  const { address, isConnected } = useWallet();

  return (
    <div className="space-y-12">
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-genesis-500 to-blue-400 bg-clip-text text-transparent">
          GenesisLink
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Decentralized lending protocol with x402 micropayment channels.
          Borrow, lend, and transact on Ethereum.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/borrow"
            className="px-6 py-3 bg-genesis-600 hover:bg-genesis-700 rounded-lg font-semibold transition"
          >
            Start Borrowing
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 glass hover:bg-white/10 font-semibold transition"
          >
            Dashboard
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6">
          <h3 className="text-lg font-semibold mb-2">Collateralized Loans</h3>
          <p className="text-gray-400 text-sm">
            Lock ERC-20 tokens as collateral and borrow against them with
            transparent LTV ratios and automated liquidation.
          </p>
        </div>
        <div className="glass p-6">
          <h3 className="text-lg font-semibold mb-2">x402 Payment Channels</h3>
          <p className="text-gray-400 text-sm">
            Open off-chain payment channels for instant micropayments with
            EIP-712 signed vouchers and on-chain settlement.
          </p>
        </div>
        <div className="glass p-6">
          <h3 className="text-lg font-semibold mb-2">Smart Contract Security</h3>
          <p className="text-gray-400 text-sm">
            Built with OpenZeppelin v5, custom errors, reentrancy guards, and
            comprehensive test coverage.
          </p>
        </div>
      </section>

      {isConnected && (
        <section className="glass p-6 text-center">
          <p className="text-sm text-gray-400">Connected wallet</p>
          <p className="font-mono text-sm mt-1">{address}</p>
        </section>
      )}
    </div>
  );
}
