import {
    ConnectWallet,
    Wallet,
    WalletDropdown,
    WalletDropdownBasename,
    WalletDropdownFundLink,
    WalletDropdownLink,
    WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
    Address,
    Avatar,
    Name,
    Identity,
    EthBalance,
} from '@coinbase/onchainkit/identity';

export function WalletComponent() {
    return (
        <div className="flex justify-end">
            <Wallet>
                <ConnectWallet className='bg-blue-800' disconnectedLabel='Log In'>
                    <Avatar className="h-6 w-6" />
                    <Name className='text-white' />
                </ConnectWallet>
                <WalletDropdown>
                    <Identity
                        className="px-4 pt-3 pb-2 hover:bg-blue-200"
                        hasCopyAddressOnClick
                    >
                        <Avatar />
                        <Name />
                        <Address />
                        <EthBalance />
                    </Identity>
                    <WalletDropdownBasename />
                    <WalletDropdownLink
                        className='hover:bg-blue-200'
                        icon="wallet"
                        href="https://keys.coinbase.com"
                    >
                        Wallet
                    </WalletDropdownLink>
                    <WalletDropdownFundLink />
                    <WalletDropdownDisconnect className='hover:bg-blue-200' />
                </WalletDropdown>
            </Wallet>
        </div>
    );
}
