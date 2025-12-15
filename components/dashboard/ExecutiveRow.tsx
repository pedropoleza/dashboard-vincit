'use client';

import React from 'react';
import { ArrowUp, ArrowDown, Target, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';

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
    const maxVal = Math.max(funnel.m1s, funnel.m1c, funnel.m2s, funnel.m2c, funnel.dcs, funnel.dcc, 1);
    const getWidth = (val: number) => `${(val / maxVal) * 100}%`;

    const m2Conversion = funnel.m1c > 0 ? Math.round((funnel.m2c / funnel.m1c) * 100) : 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

            {/* 1. W Prospects */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div>
                    <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-3">W Prospects</h3>
                    <div className="text-4xl font-bold text-slate-900 mb-3">{metrics.wProspects.count}</div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={clsx(
                        "flex items-center text-sm font-semibold px-2.5 py-1 rounded-full",
                        metrics.wProspects.change >= 0 ? "text-emerald-700 bg-emerald-100" : "text-rose-700 bg-rose-100"
                    )}>
                        {metrics.wProspects.change >= 0 ? <ArrowUp className="w-3.5 h-3.5 mr-1" /> : <ArrowDown className="w-3.5 h-3.5 mr-1" />}
                        {Math.abs(metrics.wProspects.change)}%
                    </span>
                    <span className="text-slate-500 text-xs">vs last period</span>
                </div>
            </div>

            {/* 2. Funnel */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-slate-700 text-sm font-semibold uppercase tracking-wider">Pipeline Funnel</h3>
                    <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
                        Conv Rate: {m2Conversion}% (M1C → M2C)
                    </span>
                </div>

                <div className="space-y-3">
                    <FunnelBar label="M1 Scheduled" value={funnel.m1s} color="bg-blue-400" width={getWidth(funnel.m1s)} />
                    <FunnelBar label="M1 Completed" value={funnel.m1c} color="bg-blue-600" width={getWidth(funnel.m1c)} />

                    <div className="py-1">
                        <FunnelBar label="M2 Scheduled" value={funnel.m2s} color="bg-indigo-400" width={getWidth(funnel.m2s)} />
                        <FunnelBar label="M2 Completed" value={funnel.m2c} color="bg-indigo-600" width={getWidth(funnel.m2c)} />
                    </div>

                    <FunnelBar label="Deal Close S" value={funnel.dcs} color="bg-emerald-400" width={getWidth(funnel.dcs)} />
                    <FunnelBar label="Deal Close C" value={funnel.dcc} color="bg-emerald-600" width={getWidth(funnel.dcc)} />
                </div>
            </div>

            {/* 3. DSC Forecast */}
            <div className="lg:col-span-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200 shadow-sm hover:shadow-lg transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-5">
                    <Target className="w-24 h-24 text-indigo-600" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-indigo-800 text-sm font-bold uppercase tracking-wider">DSC Forecast</h3>
                        <span className="text-indigo-400 text-xs cursor-help bg-white px-2 py-0.5 rounded-full" title="Expected Deals based on M2 Completed × 40%">
                            ℹ
                        </span>
                    </div>
                    <div className="text-4xl font-bold text-indigo-900 mb-1">{metrics.dsc.value.toFixed(1)}</div>
                    <p className="text-indigo-700 text-sm font-medium">Expected Deals</p>
                </div>

                <div className="mt-5 pt-4 border-t border-indigo-200/50 relative z-10">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-indigo-600 text-xs mb-1 font-medium">Proj. Revenue</p>
                            <p className="text-2xl font-bold text-emerald-700">${metrics.dsc.revenue.toLocaleString()}</p>
                        </div>
                        <TrendingUp className="w-6 h-6 text-emerald-500" />
                    </div>
                </div>
            </div>

        </div>
    );
}

function FunnelBar({ label, value, color, width }: { label: string, value: number, color: string, width: string }) {
    return (
        <div className="flex items-center gap-3 text-xs">
            <span className="w-24 text-slate-600 text-right shrink-0 font-medium">{label}</span>
            <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden flex items-center relative border border-slate-200">
                <div className={clsx("h-full transition-all duration-700 rounded-r-md", color)} style={{ width }}></div>
                <span className="absolute left-3 text-slate-900 font-bold text-sm drop-shadow-sm">{value}</span>
            </div>
        </div>
    );
}
