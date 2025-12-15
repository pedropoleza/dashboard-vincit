export interface StandardEvent {
    event_type: string;
    location_id: string;
    entity_id: string; // id of the object (oppId, contactId, etc)
    webhook_id?: string;
    event_ts?: string; // ISO string
    payload: any; // The internal 'body' or logic object
    headers?: any;
}

export function normalizePayload(rawBody: any): StandardEvent {
    // 1. Handle Array Wrapper
    let input = Array.isArray(rawBody) ? rawBody[0] : rawBody;

    // 2. Handle Wrapper Object with 'body'
    // Some payloads come as { headers: {...}, body: {...} }
    // Others are direct { type: '...' }
    let payload = input.body ? input.body : input;
    const headers = input.headers || {};

    // 3. Extract Core Fields
    const event_type = payload.type || 'Unknown';
    const location_id = payload.locationId || 'UnknownLocation';
    const entity_id = payload.id || payload.contactId || 'UnknownEntity';
    const webhook_id = payload.webhookId;

    // Timestamp preference: timestamp -> dateAdded -> now
    const event_ts = payload.timestamp || payload.dateAdded || new Date().toISOString();

    return {
        event_type,
        location_id,
        entity_id,
        webhook_id,
        event_ts,
        payload,
        headers,
    };
}
