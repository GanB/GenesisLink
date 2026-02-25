"use client";

import { createContext, useCallback, useEffect, useState, ReactNode } from "react";
import { BrowserProvider } from "ethers";

export interface WalletContextType {
  address: string | null;
  balance: string;
  chainId: number | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  provider: BrowserProvider | null;
}

export const WalletContext = createContext<WalletContextType>({
  address: null,
  balance: "0",
  chainId: null,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
  provider: null,
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState("0");
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  const updateBalance = useCallback(async (addr: string, prov: BrowserProvider) => {
    const bal = await prov.getBalance(addr);
    const formatted = (Number(bal) / 1e18).toFixed(4);
    setBalance(formatted);
  }, []);

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    const prov = new BrowserProvider(window.ethereum);
    const accounts = await prov.send("eth_requestAccounts", []);
    const network = await prov.getNetwork();

    setProvider(prov);
    setAddress(accounts[0]);
    setChainId(Number(network.chainId));
    await updateBalance(accounts[0], prov);
  }, [updateBalance]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance("0");
    setChainId(null);
    setProvider(null);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
        if (provider) updateBalance(accounts[0], provider);
      }
    };

    const handleChainChanged = () => window.location.reload();

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, [provider, disconnect, updateBalance]);

  return (
    <WalletContext.Provider
      value={{ address, balance, chainId, isConnected: !!address, connect, disconnect, provider }}
    >
      {children}
    </WalletContext.Provider>
  );
}
