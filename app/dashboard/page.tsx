'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart3, TrendingUp, TrendingDown, Users, AlertCircle,
    Target, DollarSign, Share2, Sliders, Trophy, Filter
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { computeDashboardMetrics, getDateRange, DashboardMetrics } from '@/lib/dashboard-data';
import { clsx } from 'clsx';

export default function DashboardPage() {
    const [datePreset, setDatePreset] = useState('last30');
    const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>([]);
    const [uniqueOnly, setUniqueOnly] = useState(false);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

    // Scenario simulator state
    const [simM2Conversion, setSimM2Conversion] = useState(40);
    const [simTicket, setSimTicket] = useState(15000);

    useEffect(() => {
        loadData();
    }, [datePreset, selectedAdvisors]);

    async function loadData() {
        setLoading(true);
        const ranges = getDateRange(datePreset);
        const data = await computeDashboardMetrics(
            ranges.current,
            ranges.previous,
            selectedAdvisors.length > 0 ? selectedAdvisors : undefined
        );
        setMetrics(data);
        setLoading(false);
    }

    if (loading || !metrics) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    const advisorIds = metrics.advisors.map(a => a.userId);
    const toggleAdvisor = (id: string) => {
        setSelectedAdvisors(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // Funnel leak detection
    const leaks = [];
    if (metrics.funnel.m2Conversion < 60) {
        const impact = Math.ceil(metrics.funnel.m1c * 0.1);
        leaks.push({
            title: "Low M1 → M2 Conversion",
            value: `${metrics.funnel.m2Conversion.toFixed(0)}%`,
            insight: `If M2 conversion increases by 10%, you'd gain ~${impact} more M2 meetings.`,
            severity: "high"
        });
    }

    if (metrics.referrals.rpi < 50) {
        leaks.push({
            title: "Referral Capture Critical",
            value: `${metrics.referrals.rpi.toFixed(0)}%`,
            insight: `You're missing ${metrics.referrals.missing} potential referrals this period.`,
            severity: "high"
        });
    }

    // Scenario simulation
    const simDeals = metrics.funnel.m2c * (simM2Conversion / 100);
    const simRevenue = simDeals * simTicket;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">

            {/* Global Controls */}
            <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 shadow-xl">
                <div className="max-w-[1600px] mx-auto px-6 py-4">
                    <div className="flex flex-wrap gap-4 items-center justify-between">

                        {/* Date Range */}
                        <div className="flex gap-2 bg-slate-800 rounded-lg p-1 border border-slate-700">
                            {['today', 'week', 'last7', 'last30', 'last90'].map(preset => (
                                <button
                                    key={preset}
                                    onClick={() => setDatePreset(preset)}
                                    className={clsx(
                                        "px-4 py-2 text-sm font-medium rounded transition-all",
                                        datePreset === preset
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                                            : "text-slate-400 hover:text-white hover:bg-slate-700"
                                    )}
                                >
                                    {preset === 'last7' ? '7D' : preset === 'last30' ? '30D' : preset === 'last90' ? '90D' : preset}
                                </button>
                            ))}
                        </div>

                        {/* Toggle */}
                        <button
                            onClick={() => setUniqueOnly(!uniqueOnly)}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-lg border font-medium text-sm transition-all",
                                uniqueOnly
                                    ? "bg-emerald-600/20 border-emerald-500 text-emerald-400"
                                    : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                            )}
                        >
                            <Filter className="w-4 h-4" />
                            {uniqueOnly ? "Unique Contacts" : "All Meetings"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto p-6 space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                        <BarChart3 className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Management Dashboard</h1>
                        <p className="text-slate-400 text-sm">Vincit Capital · Financial Performance & Forecasting</p>
                    </div>
                </div>

                {/* Executive KPIs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* W Prospects */}
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 shadow-xl">
                        <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-3">W Prospects</h3>
                        <div className="text-4xl font-bold mb-3">{metrics.wProspects.current}</div>
                        <div className="flex items-center gap-2">
                            {metrics.wProspects.change >= 0 ? (
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-rose-400" />
                            )}
                            <span className={metrics.wProspects.change >= 0 ? "text-emerald-400" : "text-rose-400"}>
                                {Math.abs(metrics.wProspects.change).toFixed(1)}%
                            </span>
                            <span className="text-slate-500 text-sm">vs last period</span>
                        </div>
                    </div>

                    {/* DSC Forecast */}
                    <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-2 border-indigo-500/30 rounded-xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 opacity-10">
                            <Target className="w-32 h-32 text-white" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <h3 className="text-indigo-300 text-sm font-bold uppercase tracking-wider">DSC Forecast</h3>
                                <span className="text-xs text-indigo-400 cursor-help" title="M2 Completed × 40%">ℹ</span>
                            </div>
                            <div className="text-4xl font-bold mb-1">{metrics.dsc.expectedDeals.toFixed(1)}</div>
                            <p className="text-indigo-300 text-sm mb-4">Expected Deals</p>
                            <div className="flex justify-between items-center pt-4 border-t border-indigo-700/50">
                                <div>
                                    <p className="text-indigo-400 text-xs mb-1">Proj. Revenue</p>
                                    <p className="text-2xl font-bold text-emerald-400">${metrics.dsc.expectedRevenue.toLocaleString()}</p>
                                </div>
                                <DollarSign className="w-6 h-6 text-emerald-400" />
                            </div>
                        </div>
                    </div>

                    {/* Referrals */}
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 shadow-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Share2 className="w-4 h-4 text-purple-400" />
                            <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Referrals (RPI)</h3>
                        </div>
                        <div className="text-4xl font-bold mb-3">
                            <span className={clsx(
                                metrics.referrals.rpi > 80 ? "text-emerald-400" :
                                    metrics.referrals.rpi > 50 ? "text-amber-400" :
                                        "text-rose-400"
                            )}>
                                {metrics.referrals.rpi.toFixed(0)}%
                            </span>
                        </div>
                        <div className="text-sm text-slate-400">
                            {metrics.referrals.referralsCollected} / {metrics.referrals.referralsExpected} collected
                        </div>
                        {metrics.referrals.missing > 0 && (
                            <p className="text-rose-400 text-xs mt-3">Missing {metrics.referrals.missing} referrals</p>
                        )}
                    </div>
                </div>

                {/* Funnel + Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Funnel */}
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 shadow-xl">
                        <h3 className="text-slate-300 font-semibold mb-5 flex items-center gap-2">
                            Pipeline Funnel
                            <span className="text-xs text-slate-500 ml-auto">M1C→M2C: {metrics.funnel.m2Conversion.toFixed(0)}%</span>
                        </h3>
                        <div className="space-y-3">
                            <FunnelBar label="M1 S" value={metrics.funnel.m1s} max={Math.max(...Object.values(metrics.funnel).filter(v => typeof v === 'number'))} color="from-blue-500 to-blue-600" />
                            <FunnelBar label="M1 C" value={metrics.funnel.m1c} max={Math.max(...Object.values(metrics.funnel).filter(v => typeof v === 'number'))} color="from-blue-600 to-indigo-600" />
                            <FunnelBar label="M2 S" value={metrics.funnel.m2s} max={Math.max(...Object.values(metrics.funnel).filter(v => typeof v === 'number'))} color="from-indigo-500 to-purple-500" />
                            <FunnelBar label="M2 C" value={metrics.funnel.m2c} max={Math.max(...Object.values(metrics.funnel).filter(v => typeof v === 'number'))} color="from-purple-600 to-pink-600" />
                            <FunnelBar label="DC S" value={metrics.funnel.dcs} max={Math.max(...Object.values(metrics.funnel).filter(v => typeof v === 'number'))} color="from-emerald-500to-teal-500" />
                            <FunnelBar label="DC C" value={metrics.funnel.dcc} max={Math.max(...Object.values(metrics.funnel).filter(v => typeof v === 'number'))} color="from-emerald-600 to-green-600" />
                        </div>
                    </div>

                    {/* Advisor Bar Chart */}
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 shadow-xl">
                        <h3 className="text-slate-300 font-semibold mb-5">Meetings per Advisor</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={metrics.advisors.map(a => ({ name: a.name.slice(0, 15), meetings: a.meetingsCompleted }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                                    labelStyle={{ color: '#e2e8f0' }}
                                />
                                <Bar dataKey="meetings" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Funnel Leaks + Scenario */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Funnel Leaks */}
                    {leaks.length > 0 && (
                        <div className="bg-rose-950/20 border-2 border-rose-900/50 rounded-xl p-6 shadow-xl">
                            <div className="flex items-center gap-3 mb-5">
                                <AlertCircle className="w-5 h-5 text-rose-400" />
                                <h3 className="text-rose-300 font-semibold text-lg">🚨 Funnel Leaks</h3>
                            </div>
                            <div className="space-y-4">
                                {leaks.map((leak, i) => (
                                    <div key={i} className="bg-slate-900/50 border border-rose-800/30 rounded-lg p-4">
                                        <div className="flex justify-between mb-2">
                                            <h4 className="text-rose-300 font-medium">{leak.title}</h4>
                                            <span className="text-rose-400 font-bold">{leak.value}</span>
                                        </div>
                                        <p className="text-slate-400 text-sm">{leak.insight}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Scenario Simulator */}
                    <div className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border-2 border-indigo-700/30 rounded-xl p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-5">
                            <Sliders className="w-5 h-5 text-indigo-300" />
                            <h3 className="text-indigo-200 font-semibold text-lg">Forecast Simulator</h3>
                        </div>

                        <div className="space-y-5">
                            {/* Slider 1 */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm text-indigo-300">M2 → Closed Rate</label>
                                    <span className="text-indigo-400 font-bold">{simM2Conversion}%</span>
                                </div>
                                <input
                                    type="range" min="10" max="90" step="1"
                                    value={simM2Conversion}
                                    onChange={(e) => setSimM2Conversion(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>

                            {/* Slider 2 */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm text-indigo-300">Avg. Ticket</label>
                                    <span className="text-indigo-400 font-bold">${simTicket.toLocaleString()}</span>
                                </div>
                                <input
                                    type="range" min="1000" max="50000" step="1000"
                                    value={simTicket}
                                    onChange={(e) => setSimTicket(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>

                            {/* Result */}
                            <div className="bg-slate-900/70 border border-indigo-700/50 rounded-lg p-4 flex justify-between items-center mt-4">
                                <div>
                                    <p className="text-indigo-400 text-xs mb-1">Projected Deals</p>
                                    <p className="text-2xl font-bold">{simDeals.toFixed(1)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-emerald-400 text-xs mb-1">Projected Revenue</p>
                                    <p className="text-3xl font-bold text-emerald-400">${simRevenue.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advisor Leaderboard */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-amber-950/30 to-yellow-950/30">
                        <div className="flex items-center gap-3">
                            <Trophy className="w-5 h-5 text-amber-400" />
                            <h3 className="text-slate-200 font-semibold text-lg">Advisor Leaderboard</h3>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-900/50 border-b border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Rank</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Advisor</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase">Meetings</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase">M2 Conv %</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase">DSC</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase">Referrals</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {metrics.advisors
                                    .sort((a, b) => b.meetingsCompleted - a.meetingsCompleted)
                                    .map((adv, idx) => (
                                        <tr key={adv.userId} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                {idx < 3 ? (
                                                    <div className={clsx(
                                                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                                                        idx === 0 ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-slate-900" :
                                                            idx === 1 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900" :
                                                                "bg-gradient-to-br from-amber-600 to-amber-700 text-white"
                                                    )}>
                                                        {idx + 1}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500 font-medium">{idx + 1}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-200">{adv.name}</td>
                                            <td className="px-6 py-4 text-right font-semibold text-slate-300">{adv.meetingsCompleted}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={clsx(
                                                    "px-2 py-1 rounded-full text-xs font-bold",
                                                    adv.m2Conversion > 50 ? "bg-emerald-900/50 text-emerald-400" : "bg-slate-700 text-slate-400"
                                                )}>
                                                    {adv.m2Conversion.toFixed(0)}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-indigo-400 font-bold">{adv.dscContribution.toFixed(1)}</td>
                                            <td className="px-6 py-4 text-right text-slate-300">{adv.referralsCollected} / {adv.referralsExpected}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}

function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
    const width = max > 0 ? `${(value / max) * 100}%` : '0%';
    return (
        <div className="flex items-center gap-3">
            <span className="w-16 text-slate-400 text-xs text-right font-medium">{label}</span>
            <div className="flex-1 h-8 bg-slate-900 rounded-lg overflow-hidden relative border border-slate-700">
                <div className={`h-full bg-gradient-to-r ${color} transition-all duration-700`} style={{ width }}></div>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white font-bold text-sm drop-shadow-lg">{value}</span>
            </div>
        </div>
    );
}
