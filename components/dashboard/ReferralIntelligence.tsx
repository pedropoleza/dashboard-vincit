'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Share2, AlertTriangle } from 'lucide-react';

interface ReferralIntelligenceProps {
    metrics: {
        meetingsCompleted: number; // Base for expectation
        referralsCollected: number;
    };
}

export function ReferralIntelligence({ metrics }: ReferralIntelligenceProps) {
    // Logic: 2 Refs expected per Meeting
    const expected = metrics.meetingsCompleted * 2;
    const collected = metrics.referralsCollected;
    const ratio = expected > 0 ? (collected / expected) : 0;

    // Traffic Light
    let statusColor = "text-rose-500";
    let statusBg = "bg-rose-500/10 border-rose-500/20";
    let message = "Critical: Leaving referrals on the table.";

    if (ratio > 0.8) {
        statusColor = "text-emerald-500";
        statusBg = "bg-emerald-500/10 border-emerald-500/20";
        message = "Great Job! High capture rate.";
    } else if (ratio > 0.5) {
        statusColor = "text-amber-500";
        statusBg = "bg-amber-500/10 border-amber-500/20";
        message = "Warning: Room for improvement.";
    }

    const missing = Math.max(0, expected - collected);

    return (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Share2 className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                    <h3 className="text-white font-medium">Referrals Intelligence</h3>
                    <p className="text-zinc-500 text-sm">Target: 2 Referrals per Meeting</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Expected */}
                <div className="p-4 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">RFR S (Expected)</p>
                    <p className="text-2xl font-bold text-zinc-300">{expected}</p>
                </div>

                {/* 2. Collected */}
                <div className="p-4 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">RFR C (Collected)</p>
                    <p className="text-2xl font-bold text-white">{collected}</p>
                </div>

                {/* 3. Performance Index (RPI) */}
                <div className={clsx("p-4 rounded-lg border flex flex-col justify-center", statusBg)}>
                    <div className="flex justify-between items-center mb-1">
                        <span className={clsx("font-bold text-3xl", statusColor)}>{(ratio * 100).toFixed(0)}%</span>
                        <span className={clsx("text-xs font-medium px-2 py-0.5 rounded-full border bg-black/20", statusColor, statusBg)}>RPI</span>
                    </div>
                    <p className={clsx("text-xs font-medium flex items-center gap-1", statusColor)}>
                        {ratio < 0.5 && <AlertTriangle className="w-3 h-3" />}
                        {message}
                    </p>
                    {missing > 0 && (
                        <p className="text-zinc-500 text-xs mt-2">
                            You missed approx <b>{missing}</b> potential referrals.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
