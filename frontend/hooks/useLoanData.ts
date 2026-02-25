"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "./useWallet";

interface LoanData {
  id: string;
  borrowerAddress: string;
  principal: number;
  interestRate: number;
  termDays: number;
  collateralAmount: number;
  state: string;
  transactionHash?: string;
  createdAt: string;
  approvedAt?: string;
  repaidAt?: string;
}

interface CreateLoanInput {
  borrowerAddress: string;
  principal: number;
  termDays: number;
  collateralAmount: number;
}

export function useLoanData() {
  const { address } = useWallet();
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLoans = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/loan/borrower/${address}`);
      if (!res.ok) throw new Error("Failed to fetch loans");
      const data = await res.json();
      setLoans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [address]);

  const requestLoan = useCallback(
    async (input: CreateLoanInput) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/loan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error("Failed to create loan");
        await fetchLoans();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [fetchLoans]
  );

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  return { loans, loading, error, requestLoan, refreshLoans: fetchLoans };
}
