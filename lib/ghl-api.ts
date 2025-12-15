/**
 * GoHighLevel API Client
 * Handles all communication with GHL REST API
 */

import { getGHLToken, invalidateTokenCache } from './ghl-token';

const GHL_BASE_URL = process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = process.env.GHL_API_VERSION || '2021-07-28';

interface GHLContact {
    id: string;
    locationId: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    phone?: string;
    source?: string;
    tags?: string[];
    customFields?: any[];
}

interface GHLUser {
    id: string;
    name: string;
    email?: string;
    role?: string;
    type?: string;
    locationIds?: string[];
}

interface GHLPipelineStage {
    id: string;
    name: string;
    position?: number;
    showInFunnel?: boolean;
    showInPieChart?: boolean;
}

interface GHLPipeline {
    id: string;
    name: string;
    locationId: string;
    stages: GHLPipelineStage[];
}

class GHLAPIError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
        this.name = 'GHLAPIError';
    }
}

/**
 * Makes authenticated request to GHL API with retry logic
 */
async function ghlRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = 3
): Promise<T> {
    const accessToken = await getGHLToken();

    const url = `${GHL_BASE_URL}${endpoint}`;
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Version': GHL_API_VERSION,
        'Content-Type': 'application/json',
        ...options.headers,
    };

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, { ...options, headers });

            if (response.status === 429) {
                // Rate limited - wait and retry
                const retryAfter = parseInt(response.headers.get('retry-after') || '5', 10);
                console.warn(`GHL API rate limited. Retrying after ${retryAfter}s`);
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                continue;
            }

            if (response.status === 401) {
                // Token might be stale - invalidate cache and retry once
                if (attempt === 0) {
                    console.warn('GHL API returned 401, refreshing token...');
                    invalidateTokenCache();
                    continue;
                }
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new GHLAPIError(response.status, `GHL API Error: ${errorText}`);
            }

            return await response.json() as T;
        } catch (err) {
            if (attempt === retries || err instanceof GHLAPIError) {
                throw err;
            }
            // Network error - retry after delay
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
    }

    throw new Error('Max retries exceeded');
}

/**
 * Get contact details by ID
 */
export async function getContact(contactId: string): Promise<GHLContact | null> {
    try {
        const data = await ghlRequest<{ contact: GHLContact }>(`/contacts/${contactId}`);
        return data.contact;
    } catch (err: any) {
        if (err.statusCode === 404) {
            console.warn(`Contact ${contactId} not found in GHL`);
            return null;
        }
        console.error('Failed to fetch contact:', err);
        throw err;
    }
}

/**
 * Get user details by ID
 */
export async function getUser(userId: string): Promise<GHLUser | null> {
    try {
        const user = await ghlRequest<GHLUser>(`/users/${userId}`);
        return user;
    } catch (err: any) {
        if (err.statusCode === 404) {
            console.warn(`User ${userId} not found in GHL`);
            return null;
        }
        console.error('Failed to fetch user:', err);
        throw err;
    }
}

/**
 * Get all pipelines and stages for a location
 */
export async function getPipelines(locationId: string): Promise<GHLPipeline[]> {
    try {
        const data = await ghlRequest<{ pipelines: GHLPipeline[] }>(
            `/opportunities/pipelines?locationId=${locationId}`
        );
        return data.pipelines || [];
    } catch (err: any) {
        console.error('Failed to fetch pipelines:', err);
        return [];
    }
}

/**
 * Health check - verify token is valid
 */
export async function healthCheck(): Promise<boolean> {
    try {
        // Try a simple request to verify auth
        await ghlRequest('/users/lookup', { method: 'GET' });
        return true;
    } catch {
        return false;
    }
}
