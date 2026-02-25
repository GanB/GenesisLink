"use client";

import { useContext } from "react";
import { WalletContext } from "@/components/WalletProvider";

export function useWallet() {
  return useContext(WalletContext);
}
