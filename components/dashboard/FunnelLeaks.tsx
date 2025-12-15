'use client';

import React from 'react';
import { AlertCircle, TrendingUp } from 'lucide-react';

interface FunnelLeaksProps {
    metrics: {
        m1Completed: number;
        m2Completed: number;
        referralsCollected: number;
        meetingsCompleted: number;
    };
}

export function FunnelLeaks({ metrics }: FunnelLeaksProps) {
    const leaks = [];

    // Logic 1: M1 -> M2 Conversion
    const m1ToM2Rate = metrics.m1Completed > 0 ? (metrics.m2Completed / metrics.m1Completed) : 0;
    if (m1ToM2Rate < 0.6) { // Alert if < 60%
        const potentialGain = Math.round(metrics.m2Completed * 0.1); // simplistic gain
        leaks.push({
            title: "Low M1 → M2 Conversion",
            value: `${(m1ToM2Rate * 100).toFixed(0)}%`,
            severity: "high",
            insight: `Only ${(m1ToM2Rate * 100).toFixed(0)}% of first meetings proceed to M2. Increasing this by 10% would add ~${Math.ceil(metrics.m1Completed * 0.1)} more M2s.`
        });
    }

    // Logic 2: Referral Capture
    const referralRate = metrics.meetingsCompleted > 0 ? (metrics.referralsCollected / (metrics.meetingsCompleted * 2)) : 0;
    if (referralRate < 0.5) {
        leaks.push({
            title: "Referral Capture Leaking",
            value: `${(referralRate * 100).toFixed(0)}%`,
            severity: "medium",
            insight: "You are capturing less than 1 referral per meeting (Target: 2). Focus on the ask script."
        });
    }

    if (leaks.length === 0) return null;

    return (
        <div className="bg-zinc-900 border border-rose-900/30 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                <h3 className="text-white font-medium">🚨 Funnel Leaks & Alerts</h3>
            </div>

            <div className="space-y-4">
                {leaks.map((leak, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-zinc-950/50 rounded-lg border border-zinc-800">
                        <div className="shrink-0 pt-1">
                            <div className={`w-2 h-2 rounded-full ${leak.severity === 'high' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between mb-1">
                                <h4 className="text-zinc-200 text-sm font-medium">{leak.title}</h4>
                                <span className="text-rose-400 font-bold text-sm">{leak.value}</span>
                            </div>
                            <p className="text-zinc-400 text-xs leading-relaxed">{leak.insight}</p>
                            <div className="mt-2 flex items-center gap-1 text-emerald-500 text-[10px] uppercase font-bold tracking-wide cursor-pointer hover:underline">
                                <TrendingUp className="w-3 h-3" /> View Fix Strategy
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
