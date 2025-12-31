import React from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

export const config = createConfig({
  chains: [base], // Only Base Mainnet
  connectors: [
    coinbaseWallet({
      appName: 'Perfect Circle',
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
