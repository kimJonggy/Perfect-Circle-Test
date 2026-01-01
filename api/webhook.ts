import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
    parseWebhookEvent,
    verifyAppKeyWithNeynar,
} from '@farcaster/miniapp-node';
import {
    setUserNotificationDetails,
    deleteUserNotificationDetails,
    sendMiniAppNotification,
} from '../src/lib/notifications';

// Neynar API key for verification
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || 'D621FF22-667A-43F8-88E2-1B2CCBAAC740';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Parse the webhook event
        const data = await parseWebhookEvent(req.body, verifyAppKeyWithNeynar, {
            neynarApiKey: NEYNAR_API_KEY,
        });

        const { fid } = data;

        // Handle different event types
        switch (data.event) {
            case 'miniapp_added': {
                console.log(`[Webhook] miniapp_added for fid ${fid}`);

                // Save notification details if present
                if (data.notificationDetails) {
                    setUserNotificationDetails(fid, data.notificationDetails);

                    // Send welcome notification
                    await sendMiniAppNotification({
                        fid,
                        title: 'Welcome to Perfect Circle! 🎯',
                        body: 'Challenge yourself to draw the most perfect circle.',
                    });
                }
                break;
            }

            case 'miniapp_removed': {
                console.log(`[Webhook] miniapp_removed for fid ${fid}`);
                deleteUserNotificationDetails(fid);
                break;
            }

            case 'notifications_enabled': {
                console.log(`[Webhook] notifications_enabled for fid ${fid}`);

                if (data.notificationDetails) {
                    setUserNotificationDetails(fid, data.notificationDetails);

                    // Send confirmation notification
                    await sendMiniAppNotification({
                        fid,
                        title: 'Notifications Enabled ✅',
                        body: "You'll now receive updates from Perfect Circle!",
                    });
                }
                break;
            }

            case 'notifications_disabled': {
                console.log(`[Webhook] notifications_disabled for fid ${fid}`);
                deleteUserNotificationDetails(fid);
                break;
            }

            default:
                console.log(`[Webhook] Unknown event: ${(data as any).event}`);
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('[Webhook] Error:', error);

        if (error instanceof Error) {
            // Handle specific error types
            if (error.message.includes('Invalid signature')) {
                return res.status(401).json({ error: 'Invalid signature' });
            }
            if (error.message.includes('Verification failed')) {
                return res.status(401).json({ error: 'Verification failed' });
            }
        }

        return res.status(500).json({ error: 'Internal server error' });
    }
}
