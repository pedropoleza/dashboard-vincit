'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Share2, AlertTriangle } from 'lucide-react';

interface ReferralIntelligenceProps {
    metrics: {
        meetingsCompleted: number;
        referralsCollected: number;
    };
}

export function ReferralIntelligence({ metrics }: ReferralIntelligenceProps) {
    const expected = metrics.meetingsCompleted * 2;
    const collected = metrics.referralsCollected;
    const ratio = expected > 0 ? (collected / expected) : 0;

    let statusColor = "text-rose-700";
    let statusBg = "bg-rose-100 border-rose-300";
    let message = "Critical: Leaving referrals on the table.";

    if (ratio > 0.8) {
        statusColor = "text-emerald-700";
        statusBg = "bg-emerald-100 border-emerald-300";
        message = "Great Job! High capture rate.";
    } else if (ratio > 0.5) {
        statusColor = "text-amber-700";
        statusBg = "bg-amber-100 border-amber-300";
        message = "Warning: Room for improvement.";
    }

    const missing = Math.max(0, expected - collected);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-xl border border-purple-200">
                    <Share2 className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                    <h3 className="text-slate-900 font-semibold text-lg">Referrals Intelligence</h3>
                    <p className="text-slate-500 text-sm">Target: 2 Referrals per Meeting</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Expected */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-slate-500 text-xs uppercase font-semibold tracking-wide mb-2">RFR S (Expected)</p>
                    <p className="text-3xl font-bold text-slate-700">{expected}</p>
                </div>

                {/* 2. Collected */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-slate-500 text-xs uppercase font-semibold tracking-wide mb-2">RFR C (Collected)</p>
                    <p className="text-3xl font-bold text-slate-900">{collected}</p>
                </div>

                {/* 3. Performance Index (RPI) */}
                <div className={clsx("p-4 rounded-xl border-2 flex flex-col justify-center", statusBg)}>
                    <div className="flex justify-between items-center mb-2">
                        <span className={clsx("font-bold text-4xl", statusColor)}>{(ratio * 100).toFixed(0)}%</span>
                        <span className={clsx("text-xs font-bold px-2.5 py-1 rounded-full border bg-white/60", statusColor)}>RPI</span>
                    </div>
                    <p className={clsx("text-xs font-semibold flex items-center gap-1", statusColor)}>
                        {ratio < 0.5 && <AlertTriangle className="w-3.5 h-3.5" />}
                        {message}
                    </p>
                    {missing > 0 && (
                        <p className="text-slate-600 text-xs mt-3 pt-3 border-t border-slate-300/50">
                            You missed approx <strong className="text-slate-900">{missing}</strong> potential referrals.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
