/**
 * Dashboard Data Service
 * Fetches and computes all metrics from Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

function getSupabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase credentials not configured');
        return null;
    }

    return createClient(supabaseUrl, supabaseKey);
}

export interface DateRangeFilter {
    start: Date;
    end: Date;
}

export interface DashboardMetrics {
    // W Prospects
    wProspects: {
        current: number;
        previous: number;
        change: number;
    };

    // Funnel
    funnel: {
        m1s: number;
        m1c: number;
        m2s: number;
        m2c: number;
        dcs: number;
        dcc: number;
        m1Conversion: number; // M1S -> M1C
        m2Conversion: number; // M1C -> M2C
        dcConversion: number; // M2C -> DCC
    };

    // DSC
    dsc: {
        expectedDeals: number;
        expectedRevenue: number;
        avgTicket: number;
    };

    // Referrals
    referrals: {
        meetingsCompleted: number;
        referralsExpected: number;
        referralsCollected: number;
        rpi: number; // Performance Index
        missing: number;
    };

    // Advisors
    advisors: AdvisorMetrics[];
}

export interface AdvisorMetrics {
    name: string;
    userId: string;
    meetingsCompleted: number;
    m2Conversion: number;
    dscContribution: number;
    referralsExpected: number;
    referralsCollected: number;
    revenue: number;
}

/**
 * Fetch all opportunities for a date range
 */
export async function fetchOpportunities(range: DateRangeFilter, advisorIds?: string[]) {
    const supabase = getSupabase();
    if (!supabase) {
        console.warn('Supabase not initialized, returning empty array');
        return [];
    }

    let query = supabase
        .from('ghl_opportunities')
        .select('*')
        .gte('created_at', range.start.toISOString())
        .lte('created_at', range.end.toISOString());

    if (advisorIds && advisorIds.length > 0) {
        query = query.in('assigned_to', advisorIds);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching opportunities:', error);
        return [];
    }

    return data || [];
}

/**
 * Compute dashboard metrics from opportunities
 */
export async function computeDashboardMetrics(
    currentRange: DateRangeFilter,
    previousRange: DateRangeFilter,
    advisorIds?: string[]
): Promise<DashboardMetrics> {

    // Fetch current and previous period data
    const [currentOpps, previousOpps] = await Promise.all([
        fetchOpportunities(currentRange, advisorIds),
        fetchOpportunities(previousRange, advisorIds)
    ]);

    // W Prospects
    const wProspectsCurrent = currentOpps.filter(o => o.stage_id === 'stage_w_prospect' || o.stage_id?.includes('new')).length;
    const wProspectsPrevious = previousOpps.filter(o => o.stage_id === 'stage_w_prospect' || o.stage_id?.includes('new')).length;
    const wProspectsChange = wProspectsPrevious > 0
        ? ((wProspectsCurrent - wProspectsPrevious) / wProspectsPrevious) * 100
        : 0;

    // Funnel counts
    const m1s = currentOpps.filter(o => o.stage_id?.includes('m1_sched') || o.stage_id?.includes('M1 S')).length;
    const m1c = currentOpps.filter(o => o.stage_id?.includes('m1_comp') || o.stage_id?.includes('M1 C')).length;
    const m2s = currentOpps.filter(o => o.stage_id?.includes('m2_sched') || o.stage_id?.includes('M2 S')).length;
    const m2c = currentOpps.filter(o => o.stage_id?.includes('m2_comp') || o.stage_id?.includes('M2 C')).length;
    const dcs = currentOpps.filter(o => o.stage_id?.includes('dc_sched') || o.stage_id?.includes('DC S')).length;
    const dcc = currentOpps.filter(o => o.status === 'won' || o.stage_id?.includes('dc_comp') || o.stage_id?.includes('DC C')).length;

    // Conversions
    const m1Conversion = m1s > 0 ? (m1c / m1s) * 100 : 0;
    const m2Conversion = m1c > 0 ? (m2c / m1c) * 100 : 0;
    const dcConversion = m2c > 0 ? (dcc / m2c) * 100 : 0;

    // DSC
    const avgTicket = 15000; // TODO: Pull from settings
    const expectedDeals = m2c * 0.4;
    const expectedRevenue = expectedDeals * avgTicket;

    // Referrals
    const meetingsCompleted = m1c + m2c;
    const referralsExpected = meetingsCompleted * 2;
    const referralsCollected = currentOpps.filter(o => o.source === 'Referral' || o.source?.toLowerCase().includes('referr')).length;
    const rpi = referralsExpected > 0 ? (referralsCollected / referralsExpected) * 100 : 0;
    const missing = Math.max(0, referralsExpected - referralsCollected);

    // Advisor metrics
    const advisorMap = new Map<string, AdvisorMetrics>();

    currentOpps.forEach(opp => {
        const userId = opp.assigned_to || 'Unassigned';

        if (!advisorMap.has(userId)) {
            advisorMap.set(userId, {
                name: userId,
                userId,
                meetingsCompleted: 0,
                m2Conversion: 0,
                dscContribution: 0,
                referralsExpected: 0,
                referralsCollected: 0,
                revenue: 0,
            });
        }

        const advisor = advisorMap.get(userId)!;

        // Count meetings
        if (opp.stage_id?.includes('m1_comp') || opp.stage_id?.includes('M1 C')) advisor.meetingsCompleted++;
        if (opp.stage_id?.includes('m2_comp') || opp.stage_id?.includes('M2 C')) advisor.meetingsCompleted++;

        // Count referrals
        if (opp.source === 'Referral' || opp.source?.toLowerCase().includes('referr')) {
            advisor.referralsCollected++;
        }
    });

    // Compute advisor-level metrics
    const advisors: AdvisorMetrics[] = [];
    advisorMap.forEach(advisor => {
        advisor.referralsExpected = advisor.meetingsCompleted * 2;
        advisor.dscContribution = advisor.meetingsCompleted * 0.4 * 0.5; // Simplified
        advisor.revenue = advisor.dscContribution * avgTicket;

        // M2 conversion (simplified - count m2c meetings)
        const advisorM1c = currentOpps.filter(o => o.assigned_to === advisor.userId && (o.stage_id?.includes('m1_comp') || o.stage_id?.includes('M1 C'))).length;
        const advisorM2c = currentOpps.filter(o => o.assigned_to === advisor.userId && (o.stage_id?.includes('m2_comp') || o.stage_id?.includes('M2 C'))).length;
        advisor.m2Conversion = advisorM1c > 0 ? (advisorM2c / advisorM1c) * 100 : 0;

        advisors.push(advisor);
    });

    return {
        wProspects: {
            current: wProspectsCurrent,
            previous: wProspectsPrevious,
            change: wProspectsChange,
        },
        funnel: {
            m1s, m1c, m2s, m2c, dcs, dcc,
            m1Conversion,
            m2Conversion,
            dcConversion,
        },
        dsc: {
            expectedDeals,
            expectedRevenue,
            avgTicket,
        },
        referrals: {
            meetingsCompleted,
            referralsExpected,
            referralsCollected,
            rpi,
            missing,
        },
        advisors,
    };
}

/**
 * Get date range from preset
 */
export function getDateRange(preset: string): { current: DateRangeFilter, previous: DateRangeFilter } {
    const now = new Date();
    let daysBack = 30;

    switch (preset) {
        case 'today':
            daysBack = 1;
            break;
        case 'week':
            daysBack = 7;
            break;
        case 'last7':
            daysBack = 7;
            break;
        case 'last30':
            daysBack = 30;
            break;
        case 'last90':
            daysBack = 90;
            break;
    }

    const currentStart = startOfDay(subDays(now, daysBack));
    const currentEnd = endOfDay(now);

    const previousStart = startOfDay(subDays(currentStart, daysBack));
    const previousEnd = endOfDay(subDays(currentEnd, daysBack));

    return {
        current: { start: currentStart, end: currentEnd },
        previous: { start: previousStart, end: previousEnd },
    };
}
