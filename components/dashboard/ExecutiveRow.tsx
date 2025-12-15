'use client';

import React from 'react';
import { ArrowUp, ArrowDown, Target, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';
// Removed shadcn tooltip import for MVP simplicity
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; 

interface ExecutiveRowProps {
    metrics: {
        wProspects: { count: number; change: number };
        dsc: { value: number; revenue: number };
    };
    funnel: {
        m1s: number;
        m1c: number;
        m2s: number;
        m2c: number;
        dcs: number;
        dcc: number;
    };
}

export function ExecutiveRow({ metrics, funnel }: ExecutiveRowProps) {
    // Funnel Visualization Helper
    const maxVal = Math.max(funnel.m1s, funnel.m1c, funnel.m2s, funnel.m2c, funnel.dcs, funnel.dcc, 1);
    const getWidth = (val: number) => `${(val / maxVal) * 100}%`;

    // M2 Conversion Rate (M1C -> M2C)
    // Or M2 Conversion (M2S -> M2C)? Usually Funnel step conversion.
    // Prompt says: "M2 Conversion %"
    const m2Conversion = funnel.m1c > 0 ? Math.round((funnel.m2c / funnel.m1c) * 100) : 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

            {/* 1. W Prospects (Big Number) */}
            <div className="lg:col-span-3 bg-zinc-900 rounded-xl p-6 border border-zinc-800 flex flex-col justify-between">
                <div>
                    <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-2">W Prospects</h3>
                    <div className="text-4xl font-bold text-white mb-2">{metrics.wProspects.count}</div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={clsx("flex items-center text-sm font-medium", metrics.wProspects.change >= 0 ? "text-emerald-400" : "text-rose-400")}>
                        {metrics.wProspects.change >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                        {Math.abs(metrics.wProspects.change)}%
                    </span>
                    <span className="text-zinc-500 text-xs">vs last period</span>
                </div>
            </div>

            {/* 2. Funnel (Visual Bar) */}
            <div className="lg:col-span-6 bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Pipeline Funnel</h3>
                    <span className="text-xs text-zinc-500">Conv Rate: {m2Conversion}% (M1C → M2C)</span>
                </div>

                <div className="space-y-3">
                    {/* M1 */}
                    <FunnelBar label="M1 Scheduled" value={funnel.m1s} color="bg-blue-900/50" width={getWidth(funnel.m1s)} />
                    <FunnelBar label="M1 Completed" value={funnel.m1c} color="bg-blue-600" width={getWidth(funnel.m1c)} />

                    {/* M2 (Critical) */}
                    <div className="py-1">
                        <FunnelBar label="M2 Scheduled" value={funnel.m2s} color="bg-indigo-900/50" width={getWidth(funnel.m2s)} />
                        <FunnelBar label="M2 Completed" value={funnel.m2c} color="bg-indigo-500" width={getWidth(funnel.m2c)} />
                    </div>

                    {/* DC */}
                    <FunnelBar label="Deal Close S" value={funnel.dcs} color="bg-emerald-900/50" width={getWidth(funnel.dcs)} />
                    <FunnelBar label="Deal Close C" value={funnel.dcc} color="bg-emerald-500" width={getWidth(funnel.dcc)} />
                </div>
            </div>

            {/* 3. DSC Forecast (KPI) */}
            <div className="lg:col-span-3 bg-zinc-900/50 rounded-xl p-6 border border-dashed border-indigo-500/30 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Target className="w-24 h-24 text-indigo-400" />
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-indigo-400 text-sm font-bold uppercase tracking-wider">DSC Forecast</h3>
                        {/* Tooltip placeholder */}
                        <span className="text-zinc-600 text-xs cursor-help" title="Expected Deals based on M2 Completed x 40%">[?]</span>
                    </div>
                    <div className="text-4xl font-bold text-white mb-1">{metrics.dsc.value.toFixed(1)}</div>
                    <p className="text-zinc-500 text-sm">Expected Deals</p>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-800/50">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-zinc-400 text-xs mb-1">Proj. Revenue</p>
                            <p className="text-xl font-medium text-emerald-400">${metrics.dsc.revenue.toLocaleString()}</p>
                        </div>
                        <TrendingUp className="w-5 h-5 text-emerald-500/50" />
                    </div>
                </div>
            </div>

        </div>
    );
}

function FunnelBar({ label, value, color, width }: { label: string, value: number, color: string, width: string }) {
    return (
        <div className="flex items-center gap-3 text-xs">
            <span className="w-20 text-zinc-400 text-right shrink-0">{label}</span>
            <div className="flex-1 h-6 bg-zinc-800/50 rounded-sm overflow-hidden flex items-center relative">
                <div className={clsx("h-full transition-all duration-500", color)} style={{ width }}></div>
                <span className="absolute left-2 text-white font-medium drop-shadow-md">{value}</span>
            </div>
        </div>
    );
}
