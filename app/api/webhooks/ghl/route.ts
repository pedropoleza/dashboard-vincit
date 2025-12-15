import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyWebhook } from '@/lib/auth';
import { normalizePayload } from '@/lib/normalize';
import { generateDedupeKey } from '@/lib/utils';
import { processOpportunityEvent } from '@/lib/processors/opportunity';

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();

        // 1. Auth
        const authResult = verifyWebhook(req.headers, rawBody);
        if (!authResult.authorized) {
            return NextResponse.json(
                { error: 'Unauthorized', detail: authResult.error },
                { status: 401 }
            );
        }

        // 2. Parse & Normalize
        let jsonBody;
        try {
            jsonBody = JSON.parse(rawBody);
        } catch (e) {
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        const event = normalizePayload(jsonBody);
        const dedupeKey = generateDedupeKey(event);

        // 3. Raw Insert with Deduplication check
        const { error } = await supabaseAdmin
            .from('ghl_raw_events')
            .insert({
                received_at: new Date().toISOString(),
                location_id: event.location_id,
                event_type: event.event_type,
                entity_id: event.entity_id,
                webhook_id: event.webhook_id,
                event_ts: event.event_ts,
                headers: event.headers,
                payload: event.payload,
                dedupe_key: dedupeKey,
            });

        if (error) {
            // Check for unique violation (code 23505)
            if (error.code === '23505') {
                console.log(`[Duplicate] Skipped event ${dedupeKey}`);
                return NextResponse.json({ ok: true, duplicate: true });
            }
            console.error('Raw Insert Error:', error);
            return NextResponse.json({ error: 'Database Error' }, { status: 500 });
        }

        // 4. Process (Ruling)
        console.log(`[Processing] ${event.event_type} for ${event.entity_id}`);

        if (event.event_type.startsWith('Opportunity')) {
            await processOpportunityEvent(event, dedupeKey);
        } else {
            console.log('Skipping processor for type:', event.event_type);
        }

        return NextResponse.json({ ok: true });

    } catch (err: any) {
        console.error('Webhook Unhandled Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
