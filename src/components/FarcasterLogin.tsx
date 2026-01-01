import { useState, useEffect, useCallback } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface AuthState {
    fid: number | null;
    username: string | null;
    isLoading: boolean;
}

const STORAGE_KEY = 'farcaster_auth';

export function FarcasterLogin() {
    const [auth, setAuth] = useState<AuthState>({
        fid: null,
        username: null,
        isLoading: true,
    });

    // Load persisted auth on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setAuth({
                    fid: parsed.fid,
                    username: parsed.username,
                    isLoading: false,
                });
            } catch {
                setAuth(prev => ({ ...prev, isLoading: false }));
            }
        } else {
            setAuth(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    const signIn = useCallback(async () => {
        setAuth(prev => ({ ...prev, isLoading: true }));

        try {
            // Get JWT token from Farcaster SDK
            const tokenResult = await sdk.quickAuth.getToken();

            if (!tokenResult?.token) {
                throw new Error('Failed to get authentication token');
            }

            // Verify token with our backend
            const response = await fetch('/api/auth', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${tokenResult.token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Authentication failed');
            }

            const data = await response.json();

            // Store auth state
            const authData = {
                fid: data.fid,
                username: data.username,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

            setAuth({
                fid: data.fid,
                username: data.username,
                isLoading: false,
            });

            toast({
                title: 'Signed In! ✓',
                description: `Welcome, ${data.username || `FID: ${data.fid}`}`,
            });

        } catch (error) {
            console.error('Sign in failed:', error);
            setAuth({ fid: null, username: null, isLoading: false });
            toast({
                title: 'Sign In Failed',
                description: error instanceof Error ? error.message : 'Please try again',
                variant: 'destructive',
            });
        }
    }, []);

    const signOut = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setAuth({ fid: null, username: null, isLoading: false });
        toast({
            title: 'Signed Out',
            description: 'You have been signed out.',
        });
    }, []);

    if (auth.isLoading) {
        return (
            <div className="flex items-center gap-2 text-gray-400">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <span>Loading...</span>
            </div>
        );
    }

    if (auth.fid) {
        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-green-900/50 px-3 py-1.5 rounded-full border border-green-500/30">
                    <span className="text-green-200 text-sm font-medium">
                        {auth.username ? `@${auth.username}` : `FID: ${auth.fid}`}
                    </span>
                </div>
                <Button
                    onClick={signOut}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                >
                    Sign Out
                </Button>
            </div>
        );
    }

    return (
        <Button
            onClick={signIn}
            disabled={auth.isLoading}
            className="bg-purple-600 hover:bg-purple-700"
        >
            🔐 Sign In with Farcaster
        </Button>
    );
}

// Export hook for other components to access auth state
export function useFarcasterAuth() {
    const [auth, setAuth] = useState<{ fid: number | null; username: string | null }>({
        fid: null,
        username: null,
    });

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setAuth({ fid: parsed.fid, username: parsed.username });
            } catch {
                // Ignore parse errors
            }
        }

        // Listen for storage changes
        const handleStorage = () => {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setAuth({ fid: parsed.fid, username: parsed.username });
                } catch {
                    setAuth({ fid: null, username: null });
                }
            } else {
                setAuth({ fid: null, username: null });
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return auth;
}
