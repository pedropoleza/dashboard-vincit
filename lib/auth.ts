import { createHmac } from 'crypto';

export interface AuthResult {
    authorized: boolean;
    mode: 'bearer' | 'signature' | 'none';
    error?: string;
}

export function verifyWebhook(headers: Headers, rawBody: string): AuthResult {
    const mode = process.env.WEBHOOK_AUTH_MODE || 'bearer';

    if (mode === 'signature') {
        const signature = headers.get('x-wh-signature');
        const secret = process.env.GHL_WEBHOOK_SECRET;

        if (!secret) {
            console.error('GHL_WEBHOOK_SECRET is not set but mode is signature');
            return { authorized: false, mode: 'signature', error: 'Server Config Error' };
        }

        if (!signature) {
            return { authorized: false, mode: 'signature', error: 'Missing Signature' };
        }

        // HMAC-SHA256 verification
        const computed = createHmac('sha256', secret).update(rawBody).digest('hex');
        // NOTE: GHL might use base64 or specific encoding. Verify this against their docs if available.
        // Standard generic webhooks often use hex.

        if (computed === signature) {
            return { authorized: true, mode: 'signature' };
        } else {
            console.warn(`Signature mismatch. Algo: sha256. Received: ${signature}, Computed: ${computed}`);
            return { authorized: false, mode: 'signature', error: 'Invalid Signature' };
        }
    }

    // Bearer Token Mode (Default)
    const authHeader = headers.get('authorization');
    const expectedToken = process.env.WEBHOOK_BEARER_TOKEN;

    if (!expectedToken) {
        console.error('WEBHOOK_BEARER_TOKEN is not set');
        return { authorized: false, mode: 'bearer', error: 'Server Config Error' };
    }

    if (authHeader === `Bearer ${expectedToken}`) {
        return { authorized: true, mode: 'bearer' };
    }

    return { authorized: false, mode: 'bearer', error: 'Invalid Token' };
}
