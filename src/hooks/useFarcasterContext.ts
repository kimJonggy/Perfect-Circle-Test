import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

// User profile data
export interface FarcasterUser {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
    bio?: string;
    location?: {
        placeId?: string;
        description?: string;
    };
}

// Location context types
export type MiniAppLocationType =
    | 'cast_embed'
    | 'cast_share'
    | 'notification'
    | 'launcher'
    | 'channel'
    | 'open_miniapp';

export interface MiniAppLocationContext {
    type: MiniAppLocationType;
    embed?: string;
    cast?: {
        author: FarcasterUser;
        hash: string;
        timestamp: number;
        text: string;
        embeds?: string[];
        channelKey?: string;
    };
    notification?: {
        notificationId: string;
        title: string;
        body: string;
    };
    channel?: {
        key: string;
        name: string;
        imageUrl?: string;
    };
    referrerDomain?: string;
}

// Client context
export interface SafeAreaInsets {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export interface NotificationDetails {
    url: string;
    token: string;
}

export interface ClientContext {
    platformType?: 'web' | 'mobile';
    clientFid: number;
    added: boolean;
    safeAreaInsets?: SafeAreaInsets;
    notificationDetails?: NotificationDetails;
}

// Features context
export interface FeaturesContext {
    haptics: boolean;
    cameraAndMicrophoneAccess?: boolean;
}

// Full context data returned by hook
export interface FarcasterContextData {
    // Loading state
    isLoading: boolean;
    isInMiniApp: boolean;

    // Context data
    user: FarcasterUser | null;
    location: MiniAppLocationContext | null;
    client: ClientContext | null;
    features: FeaturesContext | null;

    // Raw context for advanced use cases
    rawContext: unknown;
}

export function useFarcasterContext(): FarcasterContextData {
    const [isLoading, setIsLoading] = useState(true);
    const [isInMiniApp, setIsInMiniApp] = useState(false);
    const [user, setUser] = useState<FarcasterUser | null>(null);
    const [location, setLocation] = useState<MiniAppLocationContext | null>(null);
    const [client, setClient] = useState<ClientContext | null>(null);
    const [features, setFeatures] = useState<FeaturesContext | null>(null);
    const [rawContext, setRawContext] = useState<unknown>(null);

    useEffect(() => {
        const loadContext = async () => {
            try {
                // Check if we're in a Mini App
                const miniAppStatus = await sdk.isInMiniApp();
                setIsInMiniApp(miniAppStatus);

                if (miniAppStatus) {
                    // Get full context
                    const context = await sdk.context;
                    setRawContext(context);

                    // Extract user data
                    if (context?.user) {
                        setUser({
                            fid: context.user.fid,
                            username: context.user.username,
                            displayName: context.user.displayName,
                            pfpUrl: context.user.pfpUrl,
                            bio: (context.user as any).bio,
                            location: (context.user as any).location,
                        });
                    }

                    // Extract location data
                    if (context?.location) {
                        setLocation(context.location as MiniAppLocationContext);
                    }

                    // Extract client data
                    if (context?.client) {
                        setClient({
                            platformType: context.client.platformType,
                            clientFid: context.client.clientFid,
                            added: context.client.added,
                            safeAreaInsets: context.client.safeAreaInsets,
                            notificationDetails: context.client.notificationDetails,
                        });
                    }

                    // Extract features data
                    if (context?.features) {
                        setFeatures({
                            haptics: context.features.haptics,
                            cameraAndMicrophoneAccess: context.features.cameraAndMicrophoneAccess,
                        });
                    }

                    // Signal to Farcaster that the app is ready
                    sdk.actions.ready();
                }
            } catch (error) {
                console.error('Error loading Farcaster context:', error);
            } finally {
                setIsLoading(false);
                // Also call ready in case of error to dismiss splash screen
                try {
                    sdk.actions.ready();
                } catch (e) {
                    // Ignore if not in mini app
                }
            }
        };

        loadContext();
    }, []);

    return {
        isLoading,
        isInMiniApp,
        user,
        location,
        client,
        features,
        rawContext,
    };
}

// Convenience hooks for specific context parts
export function useFarcasterUser() {
    const { user, isLoading, isInMiniApp } = useFarcasterContext();
    return { user, isLoading, isInMiniApp };
}

export function useFarcasterClient() {
    const { client, isLoading, isInMiniApp } = useFarcasterContext();
    return { client, isLoading, isInMiniApp };
}

export function useSafeAreaInsets() {
    const { client } = useFarcasterContext();
    return client?.safeAreaInsets ?? { top: 0, bottom: 0, left: 0, right: 0 };
}
