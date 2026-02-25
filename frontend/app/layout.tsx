import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { WalletProvider } from "@/components/WalletProvider";

export const metadata: Metadata = {
  title: "GenesisLink - DeFi Lending & x402 Payments",
  description: "Decentralized lending platform with micropayment channels",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <WalletProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </WalletProvider>
      </body>
    </html>
  );
}
