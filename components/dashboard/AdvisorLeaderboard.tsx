'use client';

import React from 'react';
import { Advisor } from './types';
import { clsx } from 'clsx';
import { Trophy, Award } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

interface AdvisorLeaderboardProps {
    advisors: Advisor[];
}

export function AdvisorLeaderboard({ advisors }: AdvisorLeaderboardProps) {
    const sorted = [...advisors].sort((a, b) => b.meetingsCompleted - a.meetingsCompleted);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-yellow-50">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white rounded-xl border border-amber-200 shadow-sm">
                            <Trophy className="w-5 h-5 text-amber-600" />
                        </div>
                        <h3 className="text-slate-900 font-semibold text-lg">Advisor Leaderboard</h3>
                    </div>
                    <span className="text-xs text-slate-500 bg-white px-3 py-1.5 rounded-full font-medium border border-slate-200">
                        Sorted by Meetings Completed
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-slate-600 font-semibold uppercase text-xs tracking-wider">Rank</th>
                            <th className="px-6 py-4 text-slate-600 font-semibold uppercase text-xs tracking-wider">Advisor</th>
                            <th className="px-6 py-4 text-slate-600 font-semibold uppercase text-xs tracking-wider text-right">Meetings</th>
                            <th className="px-6 py-4 text-slate-600 font-semibold uppercase text-xs tracking-wider text-right">M2 Conv %</th>
                            <th className="px-6 py-4 text-slate-600 font-semibold uppercase text-xs tracking-wider text-right">DSC Contrib</th>
                            <th className="px-6 py-4 text-slate-600 font-semibold uppercase text-xs tracking-wider text-right">Ref Collected</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sorted.map((adv, idx) => (
                            <tr key={adv.name} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    {idx < 3 ? (
                                        <div className={clsx(
                                            "w-9 h-9 flex items-center justify-center rounded-full font-bold border-2",
                                            idx === 0 ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white border-yellow-600 shadow-lg shadow-yellow-500/30" :
                                                idx === 1 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-white border-slate-500 shadow-lg shadow-slate-400/30" :
                                                    "bg-gradient-to-br from-amber-600 to-amber-700 text-white border-amber-800 shadow-lg shadow-amber-600/30"
                                        )}>
                                            {idx === 0 && <Award className="w-5 h-5" />}
                                            {idx > 0 && (idx + 1)}
                                        </div>
                                    ) : (
                                        <span className="text-slate-500 font-medium">{idx + 1}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar name={adv.name} size="sm" />
                                        <span className="font-semibold text-slate-900">{adv.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right font-semibold text-slate-700">{adv.meetingsCompleted}</td>
                                <td className="px-6 py-4 text-right">
                                    <span className={clsx(
                                        "px-2.5 py-1 rounded-full text-xs font-bold",
                                        adv.m2Conversion > 50 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                                    )}>
                                        {adv.m2Conversion}%
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right text-indigo-700 font-bold">{adv.dscContribution.toFixed(1)}</td>
                                <td className="px-6 py-4 text-right font-semibold text-slate-700">{adv.referralsCollected}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
