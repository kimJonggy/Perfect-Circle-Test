import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

export interface FarcasterUser {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
}

export interface FarcasterContextData {
    user: FarcasterUser | null;
    isInMiniApp: boolean;
    isLoading: boolean;
}

export function useFarcasterContext(): FarcasterContextData {
    const [user, setUser] = useState<FarcasterUser | null>(null);
    const [isInMiniApp, setIsInMiniApp] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const inMiniApp = await sdk.isInMiniApp();
                setIsInMiniApp(inMiniApp);

                if (inMiniApp) {
                    const context = await sdk.context;
                    if (context?.user) {
                        setUser({
                            fid: context.user.fid,
                            username: context.user.username,
                            displayName: context.user.displayName,
                            pfpUrl: context.user.pfpUrl,
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to get Farcaster context:', error);
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, []);

    return { user, isInMiniApp, isLoading };
}
