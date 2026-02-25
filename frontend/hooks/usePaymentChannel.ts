"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "./useWallet";

interface ChannelData {
  id: string;
  senderAddress: string;
  recipientAddress: string;
  deposit: number;
  expiry: string;
  state: string;
  transactionHash?: string;
  createdAt: string;
}

interface CreateChannelInput {
  senderAddress: string;
  recipientAddress: string;
  deposit: number;
  durationSeconds: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export function usePaymentChannel() {
  const { address } = useWallet();
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChannels = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/payment/sender/${address}`);
      if (!res.ok) throw new Error("Failed to fetch channels");
      const data = await res.json();
      setChannels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [address]);

  const openChannel = useCallback(
    async (input: CreateChannelInput) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error("Failed to open channel");
        await fetchChannels();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [fetchChannels]
  );

  const closeChannel = useCallback(
    async (channelId: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/payment/${channelId}/close`, {
          method: "POST",
        });
        if (!res.ok) throw new Error("Failed to close channel");
        await fetchChannels();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [fetchChannels]
  );

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  return { channels, loading, error, openChannel, closeChannel, refreshChannels: fetchChannels };
}
