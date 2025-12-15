import { createHash } from 'crypto';
import { StandardEvent } from './normalize';

export function generateDedupeKey(event: StandardEvent): string {
    const parts = [
        event.location_id,
        event.event_type,
        event.entity_id,
        event.webhook_id || '',
        event.event_ts || ''
    ];

    // If we lack uniqueness (e.g. create event with no ID?), fallback to hashing the whole payload
    if (!event.entity_id || event.entity_id === 'UnknownEntity') {
        return createHash('sha256').update(JSON.stringify(event.payload)).digest('hex');
    }

    const rawString = parts.join('|');
    return createHash('sha256').update(rawString).digest('hex');
}
