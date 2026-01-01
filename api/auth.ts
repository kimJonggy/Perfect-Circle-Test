import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, Errors } from '@farcaster/quick-auth';

// Initialize the Quick Auth client
const client = createClient();

// Get domain from environment or use default
// Strip protocol from URL for domain verification
function getDomain(): string {
    const url = process.env.NEXT_PUBLIC_URL || process.env.VERCEL_URL || 'localhost:3000';
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only accept GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Extract Bearer token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid Authorization header' });
        }

        const token = authHeader.slice(7); // Remove 'Bearer ' prefix

        if (!token) {
            return res.status(401).json({ error: 'Token is required' });
        }

        const domain = getDomain();
        console.log(`[Auth] Verifying JWT for domain: ${domain}`);

        // Verify the JWT with Farcaster
        const result = await client.verifyJwt({
            token,
            domain,
        });

        // Return the verified FID
        return res.status(200).json({
            success: true,
            fid: result.fid,
            username: result.username,
        });

    } catch (error) {
        console.error('[Auth] Verification error:', error);

        // Handle specific Quick Auth errors
        if (error instanceof Errors.InvalidTokenError) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        if (error instanceof Errors.ExpiredTokenError) {
            return res.status(401).json({ error: 'Token expired' });
        }

        if (error instanceof Errors.InvalidDomainError) {
            return res.status(401).json({ error: 'Invalid domain' });
        }

        return res.status(500).json({ error: 'Authentication failed' });
    }
}
