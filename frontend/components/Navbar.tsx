"use client";

import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";

export function Navbar() {
  const { address, isConnected, connect, disconnect } = useWallet();

  return (
    <nav className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-genesis-500">
              GenesisLink
            </Link>
            <div className="flex gap-4">
              <Link
                href="/borrow"
                className="text-sm text-gray-300 hover:text-white transition"
              >
                Borrow
              </Link>
              <Link
                href="/dashboard"
                className="text-sm text-gray-300 hover:text-white transition"
              >
                Dashboard
              </Link>
              <Link
                href="/payments"
                className="text-sm text-gray-300 hover:text-white transition"
              >
                Payments
              </Link>
              <Link
                href="/explorer"
                className="text-sm text-gray-300 hover:text-white transition"
              >
                Explorer
              </Link>
            </div>
          </div>
          <div>
            {isConnected ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-400">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <button
                  onClick={disconnect}
                  className="text-xs px-3 py-1.5 border border-white/10 rounded-lg hover:bg-white/5 transition"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="text-sm px-4 py-2 bg-genesis-600 hover:bg-genesis-700 rounded-lg font-semibold transition"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
