/**
 * GHL Token Manager
 * Fetches access token dynamically from webhook endpoint
 */

const TOKEN_WEBHOOK_URL = process.env.GHL_TOKEN_WEBHOOK_URL || 'https://n8n.sparkleads.pro/webhook/api-vincit';
const TOKEN_CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours (token expires in 24h)

interface TokenCache {
    token: string;
    fetchedAt: number;
}

let cachedToken: TokenCache | null = null;

/**
 * Fetches fresh token from webhook endpoint
 */
async function fetchTokenFromWebhook(): Promise<string> {
    try {
        const response = await fetch(TOKEN_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`Token webhook returned ${response.status}`);
        }

        const data = await response.json();

        if (!data.access_key) {
            throw new Error('No access_key in webhook response');
        }

        return data.access_key;
    } catch (err) {
        console.error('Failed to fetch GHL token from webhook:', err);
        throw new Error('Token fetch failed');
    }
}

/**
 * Gets current valid token (from cache or fetches new one)
 */
export async function getGHLToken(): Promise<string> {
    // Check if cached token is still valid
    if (cachedToken) {
        const age = Date.now() - cachedToken.fetchedAt;
        if (age < TOKEN_CACHE_TTL_MS) {
            console.log('Using cached GHL token');
            return cachedToken.token;
        }
    }

    // Fetch fresh token
    console.log('Fetching fresh GHL token from webhook...');
    const token = await fetchTokenFromWebhook();

    cachedToken = {
        token,
        fetchedAt: Date.now(),
    };

    return token;
}

/**
 * Forces token refresh (call this if you get 401 errors)
 */
export function invalidateTokenCache(): void {
    cachedToken = null;
}
