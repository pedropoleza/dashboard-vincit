'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { GlobalControls } from '@/components/dashboard/GlobalControls';
import { ExecutiveRow } from '@/components/dashboard/ExecutiveRow';
import { ReferralIntelligence } from '@/components/dashboard/ReferralIntelligence';
import { FunnelLeaks } from '@/components/dashboard/FunnelLeaks';
import { ForecastSimulator } from '@/components/dashboard/ForecastSimulator';
import { AdvisorLeaderboard } from '@/components/dashboard/AdvisorLeaderboard';
import { DashboardFilter } from '@/components/dashboard/types';

// Initialize Supabase Client (Client Side)
// Note: In production, use Context or a Hook. For MVP, direct init.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function DashboardPage() {
    const [filter, setFilter] = useState<DashboardFilter>({
        dateRange: 'last30',
        selectedAdvisors: ['Pedro', 'Ana', 'Carlos', 'Mariana'],
        uniqueContactsOnly: false
    });

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchDashboardData();
    }, [filter.dateRange]); // Basic refetch on range change

    async function fetchDashboardData() {
        setLoading(true);

        // Calculate Date Range
        const now = new Date();
        let startDate = new Date();
        if (filter.dateRange === 'last30') startDate.setDate(now.getDate() - 30);
        if (filter.dateRange === 'last7') startDate.setDate(now.getDate() - 7);
        if (filter.dateRange === 'today') startDate.setDate(now.getDate() - 0); // Simplified
        // ... other ranges

        const startIso = startDate.toISOString().split('T')[0];

        // 1. Fetch KPI Metrics (daily_metrics)
        const { data: metricsRaw } = await supabase
            .from('daily_metrics')
            .select('*')
            .gte('date', startIso);

        // 2. Fetch Funnel Data (pipeline_stage_daily)
        const { data: funnelRaw } = await supabase
            .from('pipeline_stage_daily')
            .select('*')
            .gte('date', startIso);

        // 3. Fetch Opportunities (for Advisor Leaderboard & W Prospect Details)
        // Note: Fetching ALL opportunities might be heavy. For MVP it's fine.
        // In prod, use RPC or specific queries.
        const { data: oppsRaw } = await supabase
            .from('ghl_opportunities')
            .select('*')
            .gte('created_at', startIso);

        // --- TRANSFORM DATA ---
        // Filter by Advisors if needed (Clientside filter for MVP)
        const filteredOpps = (oppsRaw || []).filter(o =>
            filter.selectedAdvisors.includes(o.assigned_to || 'Unknown')
        );

        // A. Executive Metrics
        const wProspectsCount = filteredOpps.filter(o => o.stage_id === 'stage_w_prospect').length;

        // Funnel Aggregation
        // We sum up the DAILY counts for the selected period?
        // OR we count unique opportunities in that stage?
        // "Manifesto" says: M1 S, M1 C, M2 S, M2 C...
        // Let's use the `pipeline_stage_daily` sums for general funnel, but filtered by Location.
        // However, `pipeline_stage_daily` doesn't split by Advisor. 
        // IF advisor filter is active, we MUST use `ghl_opportunities` aggregation.
        // Let's use `ghl_opportunities` for everything to be consistent with Advisor filter.

        const countStage = (stageId: string) => filteredOpps.filter(o => o.stage_id === stageId).length;

        const funnel = {
            m1s: countStage('stage_m1_sched'),
            m1c: countStage('stage_m1_comp'),
            m2s: countStage('stage_m2_sched'),
            m2c: countStage('stage_m2_comp'),
            dcs: countStage('stage_dc_sched'),
            dcc: countStage('stage_dc_comp') + countStage('won'), // Treat 'won' as DC Completed/Close
        };

        // DSC Calc
        const dscValue = funnel.m2c * 0.40;
        const avgTicket = 15000; // Assumption for now

        // B. Referral Intelligence
        // From seed data, we used 'appointments_created' in daily_metrics as pseudo 'Referrals Collected'
        // But since we are using Opportunity data primarily now...
        // Let's count Opportunities with source='Referral' as "Collected".
        const referralsCollected = filteredOpps.filter(o => o.source === 'Referral').length;
        const meetingsCompleted = funnel.m1c + funnel.m2c; // Total completed metrics

        // C. Advisor Leaderboard
        // Group filteredOpps by advisor
        const advisorMap = new Map();
        filter.selectedAdvisors.forEach(name => {
            advisorMap.set(name, {
                name, meetingsCompleted: 0, m2c: 0, m1c: 0, referrals: 0, dsc: 0
            });
        });

        filteredOpps.forEach(o => {
            const adv = advisorMap.get(o.assigned_to);
            if (adv) {
                if (o.stage_id === 'stage_m1_comp' || o.stage_id === 'stage_m2_comp') {
                    adv.meetingsCompleted++;
                }
                if (o.stage_id === 'stage_m1_comp') adv.m1c++;
                if (o.stage_id === 'stage_m2_comp') adv.m2c++;
                if (o.source === 'Referral') adv.referrals++;
            }
        });

        const advisors = Array.from(advisorMap.values()).map((a: any) => ({
            name: a.name,
            meetingsCompleted: a.meetingsCompleted,
            m2Conversion: a.m1c > 0 ? Math.round((a.m2c / a.m1c) * 100) : 0,
            dscContribution: a.m2c * 0.40,
            referralsExpected: a.meetingsCompleted * 2,
            referralsCollected: a.referrals,
            revenue: (a.m2c * 0.40) * avgTicket
        }));

        setData({
            metrics: {
                wProspects: { count: wProspectsCount, change: 12 }, // Mock change %
                dsc: { value: dscValue, revenue: dscValue * avgTicket }
            },
            funnel,
            referrals: {
                meetingsCompleted,
                referralsCollected
            },
            advisors
        });

        setLoading(false);
    }

    if (loading || !data) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Dashboard...</div>;
    }

    return (
        <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-purple-900">
            <GlobalControls
                filter={filter}
                onFilterChange={setFilter}
                advisors={['Pedro', 'Ana', 'Carlos', 'Mariana']}
            />

            <div className="max-w-7xl mx-auto p-4 md:p-8">

                {/* Header Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Management Dashboard</h1>
                    <p className="text-zinc-500">Financial Performance & Forecasting</p>
                </div>

                {/* 1. Executive Row */}
                <ExecutiveRow metrics={data.metrics} funnel={data.funnel} />

                {/* 2. Intelligence Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div>
                        <ReferralIntelligence metrics={data.referrals} />
                        <FunnelLeaks metrics={{
                            m1Completed: data.funnel.m1c,
                            m2Completed: data.funnel.m2c,
                            referralsCollected: data.referrals.referralsCollected,
                            meetingsCompleted: data.referrals.meetingsCompleted
                        }} />
                    </div>

                    <div>
                        <ForecastSimulator currentMetrics={{
                            m2Completed: data.funnel.m2c,
                            avgTicket: 15000,
                            closeRate: 0.4
                        }} />
                    </div>
                </div>

                {/* 3. Advisor Leaderboard */}
                <AdvisorLeaderboard advisors={data.advisors} />

            </div>
        </div>
    );
}
