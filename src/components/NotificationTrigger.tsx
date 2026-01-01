import { useState, useCallback } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface NotificationTriggerProps {
    className?: string;
}

export function NotificationTrigger({ className }: NotificationTriggerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);

    const handleEnableNotifications = useCallback(async () => {
        setIsLoading(true);

        try {
            // Request to add the mini app (enables notifications)
            const response = await sdk.actions.addMiniApp();

            // Check if we got notification details back
            if (response?.notificationDetails) {
                setIsEnabled(true);
                toast({
                    title: 'Notifications Enabled! 🔔',
                    description: "You'll receive updates from Perfect Circle.",
                });
            } else {
                setIsEnabled(true);
                toast({
                    title: 'App Added!',
                    description: 'Perfect Circle has been added to your apps.',
                });
            }
        } catch (error) {
            console.error('Failed to enable notifications:', error);
            toast({
                title: 'Error',
                description: 'Failed to enable notifications. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <Button
            onClick={handleEnableNotifications}
            disabled={isLoading || isEnabled}
            className={className}
            variant={isEnabled ? 'outline' : 'default'}
        >
            {isLoading ? (
                'Enabling...'
            ) : isEnabled ? (
                '✓ Notifications Enabled'
            ) : (
                '🔔 Enable Notifications'
            )}
        </Button>
    );
}
