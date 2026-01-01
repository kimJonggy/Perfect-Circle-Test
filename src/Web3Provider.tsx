import React from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

// App metadata
const APP_METADATA = {
  name: 'Perfect Circle',
  iconUrl: 'https://perfectcircle-based.vercel.app/icon.png',
};

export const config = createConfig({
  chains: [base], // Base Mainnet only
  connectors: [
    // Coinbase Wallet for Smart Wallet connection
    coinbaseWallet({
      appName: APP_METADATA.name,
      preference: 'smartWalletOnly',
    }),
  ],
  transports: {
    [base.id]: http(),
  },
});

const queryClient = new QueryClient();

export const Web3Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};
