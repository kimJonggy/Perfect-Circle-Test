import { kv } from '@vercel/kv';

/**
 * Notifications Module for Farcaster Mini App
 * 
 * Uses Vercel KV (Redis) for persistent storage.
 */

// Types
export interface NotificationDetails {
    url: string;
    token: string;
}

export interface UserNotificationRecord {
    fid: number;
    notificationDetails: NotificationDetails;
    createdAt: string; // Dates stored as strings in JSON
    updatedAt: string;
}

const PREFIX = 'notification:';

/**
 * Get notification details for a user
 */
export async function getUserNotificationDetails(fid: number): Promise<NotificationDetails | null> {
    const record = await kv.get<UserNotificationRecord>(`${PREFIX}${fid}`);
    return record?.notificationDetails ?? null;
}

/**
 * Save notification details for a user
 */
export async function setUserNotificationDetails(
    fid: number,
    details: NotificationDetails
): Promise<UserNotificationRecord> {
    const now = new Date().toISOString();
    const key = `${PREFIX}${fid}`;

    // Check for existing record to preserve createdAt
    const existing = await kv.get<UserNotificationRecord>(key);

    const record: UserNotificationRecord = {
        fid,
        notificationDetails: details,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
    };

    await kv.set(key, record);
    return record;
}

/**
 * Delete notification details for a user
 */
export async function deleteUserNotificationDetails(fid: number): Promise<boolean> {
    const count = await kv.del(`${PREFIX}${fid}`);
    return count > 0;
}

// ============================================================
// SEND NOTIFICATION
// ============================================================

export interface SendNotificationParams {
    fid: number;
    title: string;
    body: string;
    targetUrl?: string;
}

export interface SendNotificationResult {
    success: boolean;
    error?: string;
    rateLimited?: boolean;
    invalidToken?: boolean;
}

/**
 * Send a notification to a user
 */
export async function sendMiniAppNotification(
    params: SendNotificationParams
): Promise<SendNotificationResult> {
    const { fid, title, body, targetUrl } = params;

    // Get user's notification details
    const details = await getUserNotificationDetails(fid);

    if (!details) {
        return {
            success: false,
            error: `No notification details found for fid ${fid}`,
        };
    }

    try {
        const response = await fetch(details.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                notificationId: crypto.randomUUID(),
                title,
                body,
                targetUrl: targetUrl ?? process.env.NEXT_PUBLIC_URL ?? 'https://based-pc-test.vercel.app/',
                tokens: [details.token],
            }),
        });

        if (response.ok) {
            return { success: true };
        }

        // Handle rate limiting
        if (response.status === 429) {
            return {
                success: false,
                error: 'Rate limited',
                rateLimited: true,
            };
        }

        // Handle invalid token
        if (response.status === 401 || response.status === 403) {
            // Token is invalid, remove it
            await deleteUserNotificationDetails(fid);
            return {
                success: false,
                error: 'Invalid token - removed from store',
                invalidToken: true,
            };
        }

        const errorText = await response.text();
        return {
            success: false,
            error: `HTTP ${response.status}: ${errorText}`,
        };

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
