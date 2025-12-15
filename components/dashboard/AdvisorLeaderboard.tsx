'use client';

import React from 'react';
import { Advisor } from './types';
import { clsx } from 'clsx';
import { Trophy } from 'lucide-react';

interface AdvisorLeaderboardProps {
    advisors: Advisor[];
}

export function AdvisorLeaderboard({ advisors }: AdvisorLeaderboardProps) {
    // Sort by DSC contribution by default? Or Meetings?
    const sorted = [...advisors].sort((a, b) => b.meetingsCompleted - a.meetingsCompleted);

    return (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="text-white font-medium flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    Advisor Leaderboard
                </h3>
                <span className="text-xs text-zinc-500">Sorted by Meetings Completed</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="bg-zinc-950/50 uppercase text-xs font-medium tracking-wider">
                        <tr>
                            <th className="px-6 py-3">Rank</th>
                            <th className="px-6 py-3">Advisor</th>
                            <th className="px-6 py-3 text-right">Meetings</th>
                            <th className="px-6 py-3 text-right">M2 Conv %</th>
                            <th className="px-6 py-3 text-right">DSC Contrib</th>
                            <th className="px-6 py-3 text-right">Ref Collected</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {sorted.map((adv, idx) => (
                            <tr key={adv.name} className="hover:bg-zinc-800/20 transition-colors">
                                <td className="px-6 py-4">
                                    <span className={clsx(
                                        "w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold",
                                        idx === 0 ? "bg-yellow-500/20 text-yellow-500" :
                                            idx === 1 ? "bg-zinc-400/20 text-zinc-400" :
                                                idx === 2 ? "bg-amber-700/20 text-amber-700" :
                                                    "text-zinc-600"
                                    )}>
                                        {idx + 1}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-white">{adv.name}</td>
                                <td className="px-6 py-4 text-right text-zinc-200">{adv.meetingsCompleted}</td>
                                <td className="px-6 py-4 text-right">
                                    <span className={clsx(
                                        adv.m2Conversion > 50 ? "text-emerald-400" : "text-zinc-400"
                                    )}>
                                        {adv.m2Conversion}%
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right text-indigo-400 font-medium">{adv.dscContribution.toFixed(1)}</td>
                                <td className="px-6 py-4 text-right">{adv.referralsCollected}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
