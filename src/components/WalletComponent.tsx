import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';

export function WalletComponent() {
    const { address, isConnected } = useAccount();
    const { connect, connectors, isPending } = useConnect();
    const { disconnect } = useDisconnect();

    // Format address for display
    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    if (isConnected && address) {
        return (
            <div className="flex items-center gap-2">
                <div className="bg-blue-900/50 px-3 py-2 rounded-lg border border-blue-500/30">
                    <span className="text-blue-200 text-sm font-mono">
                        {formatAddress(address)}
                    </span>
                </div>
                <Button
                    onClick={() => disconnect()}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                >
                    Disconnect
                </Button>
            </div>
        );
    }

    return (
        <Button
            onClick={() => {
                // Try to find Coinbase Wallet first, then fallback to first available (Injected)
                const cbConnector = connectors.find(c => c.id === 'coinbaseWalletSDK');
                const connector = cbConnector || connectors[0];

                if (connector) {
                    connect({ connector });
                }
            }}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700"
        >
            {isPending ? 'Connecting...' : '💼 Connect Wallet'}
        </Button>
    );
}
