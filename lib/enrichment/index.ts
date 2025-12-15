/**
 * Data Enrichment Service
 * Fetches and caches enriched data from GHL API
 */

import { supabaseAdmin } from '../supabase';
import { getContact, getUser, getPipelines } from '../ghl-api';
import { StandardEvent } from '../normalize';

const CACHE_TTL_HOURS = 24;

/**
 * Check if cached data is stale (older than 24 hours)
 */
function isStale(lastEnriched: string | null): boolean {
    if (!lastEnriched) return true;
    const age = Date.now() - new Date(lastEnriched).getTime();
    return age > CACHE_TTL_HOURS * 60 * 60 * 1000;
}

/**
 * Enrich contact data
 */
async function enrichContact(contactId: string, locationId: string): Promise<void> {
    try {
        // Check cache first
        const { data: cached } = await supabaseAdmin
            .from('ghl_contacts')
            .select('last_enriched_at')
            .eq('contact_id', contactId)
            .single();

        if (cached && !isStale(cached.last_enriched_at)) {
            console.log(`Contact ${contactId} is fresh in cache`);
            return;
        }

        // Fetch from GHL API
        const contact = await getContact(contactId);
        if (!contact) return;

        // Upsert to cache
        await supabaseAdmin
            .from('ghl_contacts')
            .upsert({
                contact_id: contact.id,
                location_id: locationId,
                full_name: contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
                first_name: contact.firstName,
                last_name: contact.lastName,
                email: contact.email,
                phone: contact.phone,
                source: contact.source,
                tags: contact.tags || [],
                custom_fields: contact.customFields || [],
                last_enriched_at: new Date().toISOString(),
            }, { onConflict: 'contact_id' });

        console.log(`✓ Enriched contact: ${contactId}`);
    } catch (err) {
        console.error(`Failed to enrich contact ${contactId}:`, err);
        // Don't throw - graceful degradation
    }
}

/**
 * Enrich user/advisor data
 */
async function enrichUser(userId: string, locationId: string): Promise<void> {
    if (!userId) return;

    try {
        const { data: cached } = await supabaseAdmin
            .from('ghl_users')
            .select('last_enriched_at')
            .eq('user_id', userId)
            .single();

        if (cached && !isStale(cached.last_enriched_at)) {
            console.log(`User ${userId} is fresh in cache`);
            return;
        }

        const user = await getUser(userId);
        if (!user) return;

        await supabaseAdmin
            .from('ghl_users')
            .upsert({
                user_id: user.id,
                location_id: locationId,
                full_name: user.name,
                email: user.email,
                role: user.role,
                type: user.type,
                avatar_url: null, // GHL doesn't provide this in basic endpoint
                last_enriched_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

        console.log(`✓ Enriched user: ${userId}`);
    } catch (err) {
        console.error(`Failed to enrich user ${userId}:`, err);
    }
}

/**
 * Enrich pipeline stage metadata
 */
async function enrichPipelineStage(
    pipelineId: string,
    stageId: string,
    locationId: string
): Promise<void> {
    if (!pipelineId || !stageId) return;

    try {
        const { data: cached } = await supabaseAdmin
            .from('ghl_pipeline_stages')
            .select('last_enriched_at')
            .eq('stage_id', stageId)
            .single();

        if (cached && !isStale(cached.last_enriched_at)) {
            console.log(`Stage ${stageId} is fresh in cache`);
            return;
        }

        // Fetch all pipelines for location (caches all stages at once)
        const pipelines = await getPipelines(locationId);
        const pipeline = pipelines.find(p => p.id === pipelineId);

        if (!pipeline) {
            console.warn(`Pipeline ${pipelineId} not found`);
            return;
        }

        // Upsert all stages from this pipeline
        for (const stage of pipeline.stages) {
            await supabaseAdmin
                .from('ghl_pipeline_stages')
                .upsert({
                    stage_id: stage.id,
                    pipeline_id: pipelineId,
                    location_id: locationId,
                    stage_name: stage.name,
                    stage_order: stage.position || 0,
                    color: null, // No color in API response typically
                    show_in_funnel: stage.showInFunnel !== false,
                    last_enriched_at: new Date().toISOString(),
                }, { onConflict: 'stage_id' });
        }

        console.log(`✓ Enriched pipeline stages for: ${pipelineId}`);
    } catch (err) {
        console.error(`Failed to enrich pipeline stage ${stageId}:`, err);
    }
}

/**
 * Main enrichment orchestrator
 * Called from webhook handler after raw event insert
 */
export async function enrichOpportunityEvent(event: StandardEvent): Promise<void> {
    const { contactId, assignedTo, pipelineId, stageId, locationId } = event.payload;

    console.log('Starting enrichment for event:', event.event_type);

    // Run enrichment in parallel for speed
    await Promise.allSettled([
        contactId ? enrichContact(contactId, locationId) : Promise.resolve(),
        assignedTo ? enrichUser(assignedTo, locationId) : Promise.resolve(),
        pipelineId && stageId ? enrichPipelineStage(pipelineId, stageId, locationId) : Promise.resolve(),
    ]);

    console.log('Enrichment complete');
}
