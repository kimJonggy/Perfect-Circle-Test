import React from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { baseAccount } from 'wagmi/connectors';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

// App metadata for Base Account
const APP_METADATA = {
  name: 'Perfect Circle',
  iconUrl: 'https://perfectcircle-based.vercel.app/icon.png',
};

export const config = createConfig({
  chains: [base], // Base Mainnet only
  connectors: [
    // Farcaster MiniApp connector - auto-connects in Base App
    farcasterMiniApp(),
    // Base Account connector - provides Smart Wallet features
    baseAccount({
      appName: APP_METADATA.name,
      appLogoUrl: APP_METADATA.iconUrl,
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
