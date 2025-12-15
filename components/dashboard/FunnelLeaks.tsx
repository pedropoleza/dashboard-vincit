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

    const m1ToM2Rate = metrics.m1Completed > 0 ? (metrics.m2Completed / metrics.m1Completed) : 0;
    if (m1ToM2Rate < 0.6) {
        const potentialGain = Math.round(metrics.m2Completed * 0.1);
        leaks.push({
            title: "Low M1 → M2 Conversion",
            value: `${(m1ToM2Rate * 100).toFixed(0)}%`,
            severity: "high",
            insight: `Only ${(m1ToM2Rate * 100).toFixed(0)}% of first meetings proceed to M2. Increasing this by 10% would add ~${Math.ceil(metrics.m1Completed * 0.1)} more M2s.`
        });
    }

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
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-rose-100 rounded-lg border border-rose-300">
                    <AlertCircle className="w-5 h-5 text-rose-700" />
                </div>
                <h3 className="text-rose-900 font-semibold text-lg">🚨 Funnel Leaks & Alerts</h3>
            </div>

            <div className="space-y-4">
                {leaks.map((leak, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-white/80 backdrop-blur rounded-xl border border-rose-200 shadow-sm">
                        <div className="shrink-0 pt-1">
                            <div className={`w-3 h-3 rounded-full ${leak.severity === 'high' ? 'bg-rose-500 shadow-lg shadow-rose-500/50' : 'bg-amber-500 shadow-lg shadow-amber-500/50'}`}></div>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between mb-2">
                                <h4 className="text-slate-900 font-semibold">{leak.title}</h4>
                                <span className="text-rose-700 font-bold">{leak.value}</span>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed mb-3">{leak.insight}</p>
                            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold cursor-pointer hover:text-emerald-800 transition-colors">
                                <TrendingUp className="w-3.5 h-3.5" /> View Fix Strategy
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
