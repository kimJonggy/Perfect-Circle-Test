/**
 * Notifications Module for Farcaster Mini App
 * 
 * ⚠️ PRODUCTION NOTE: Replace this in-memory store with a real database
 * (Postgres, Redis, Vercel KV, etc.) before going live. Currently using Pinata for IPFS storage.
 */

// Types
export interface NotificationDetails {
    url: string;
    token: string;
}

export interface UserNotificationRecord {
    fid: number;
    notificationDetails: NotificationDetails;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================================
// MOCK IN-MEMORY DATABASE
// Replace with real database in production!
// ============================================================
const notificationStore = new Map<number, UserNotificationRecord>();

/**
 * Get notification details for a user
 */
export function getUserNotificationDetails(fid: number): NotificationDetails | null {
    const record = notificationStore.get(fid);
    return record?.notificationDetails ?? null;
}

/**
 * Save notification details for a user
 */
export function setUserNotificationDetails(
    fid: number,
    details: NotificationDetails
): UserNotificationRecord {
    const now = new Date();
    const existing = notificationStore.get(fid);

    const record: UserNotificationRecord = {
        fid,
        notificationDetails: details,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
    };

    notificationStore.set(fid, record);
    return record;
}

/**
 * Delete notification details for a user
 */
export function deleteUserNotificationDetails(fid: number): boolean {
    return notificationStore.delete(fid);
}

/**
 * Get all stored users (for debugging)
 */
export function getAllUsers(): UserNotificationRecord[] {
    return Array.from(notificationStore.values());
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
    const details = getUserNotificationDetails(fid);

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
                targetUrl: targetUrl ?? 'https://perfectcircle-based.vercel.app/',
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
            deleteUserNotificationDetails(fid);
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
