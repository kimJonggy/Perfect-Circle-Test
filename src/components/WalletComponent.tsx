
import {
    ConnectWallet,
    Wallet,
    WalletDropdown,
    WalletDropdownDisconnect,
    WalletDropdownBasename,
    WalletDropdownFundLink,
    WalletDropdownLink,
} from '@coinbase/onchainkit/wallet';
import {
    Address,
    Avatar,
    Name,
    Identity,
    EthBalance,
} from '@coinbase/onchainkit/identity';
import { color } from '@coinbase/onchainkit/theme';

export function WalletComponent() {
    return (
        <div className="flex justify-end p-4">
            <Wallet>
                <ConnectWallet>
                    <Avatar className="h-6 w-6" />
                    <Name />
                </ConnectWallet>

                <WalletDropdown>
                    <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                        <Avatar />
                        <Name />
                        <Address className={color.foregroundMuted} />
                        <EthBalance />
                    </Identity>

                    <WalletDropdownBasename />

                    <WalletDropdownLink
                        icon="wallet"
                        href="https://keys.coinbase.com"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Wallet
                    </WalletDropdownLink>

                    <WalletDropdownFundLink />

                    <WalletDropdownDisconnect />
                </WalletDropdown>
            </Wallet>
        </div>
    );
}
