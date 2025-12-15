'use client';

import React from 'react';
import { Calendar, Users, Filter } from 'lucide-react';
import { DashboardFilter, DateRange } from './types';
import { clsx } from 'clsx';

interface GlobalControlsProps {
    filter: DashboardFilter;
    onFilterChange: (newFilter: DashboardFilter) => void;
    advisors: string[];
}

export function GlobalControls({ filter, onFilterChange, advisors }: GlobalControlsProps) {

    const handleRangeChange = (range: DateRange) => {
        onFilterChange({ ...filter, dateRange: range });
    };

    const toggleAdvisor = (advisor: string) => {
        const current = filter.selectedAdvisors;
        const next = current.includes(advisor)
            ? current.filter(a => a !== advisor)
            : [...current, advisor];
        onFilterChange({ ...filter, selectedAdvisors: next });
    };

    const toggleUnique = () => {
        onFilterChange({ ...filter, uniqueContactsOnly: !filter.uniqueContactsOnly });
    };

    return (
        <div className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-50 text-zinc-100 shadow-md">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between max-w-7xl mx-auto">

                {/* Date Range */}
                <div className="flex items-center gap-2 bg-zinc-800 rounded-lg p-1">
                    {(['today', 'week', 'last7', 'last30', 'last90'] as DateRange[]).map((range) => (
                        <button
                            key={range}
                            onClick={() => handleRangeChange(range)}
                            className={clsx(
                                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                                filter.dateRange === range
                                    ? "bg-zinc-700 text-white shadow-sm"
                                    : "text-zinc-400 hover:text-zinc-200"
                            )}
                        >
                            {range === 'last7' ? '7D' : range === 'last30' ? '30D' : range === 'last90' ? '90D' : range.charAt(0).toUpperCase() + range.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Advisor Selector */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg text-sm text-zinc-300">
                        <Users className="w-4 h-4" />
                        <span className="mr-2">Advisors:</span>
                        <div className="flex gap-1">
                            {advisors.map(adv => (
                                <button
                                    key={adv}
                                    onClick={() => toggleAdvisor(adv)}
                                    className={clsx(
                                        "w-6 h-6 rounded-full flex items-center justify-center text-xs border border-zinc-600",
                                        filter.selectedAdvisors.includes(adv)
                                            ? "bg-blue-600 border-blue-500 text-white"
                                            : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600"
                                    )}
                                    title={adv}
                                >
                                    {adv.charAt(0)}
                                </button>
                            ))}
                            <button
                                onClick={() => onFilterChange({ ...filter, selectedAdvisors: advisors })}
                                className="text-xs text-zinc-500 hover:text-white ml-1"
                            >
                                All
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleUnique}
                        className={clsx(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors",
                            filter.uniqueContactsOnly
                                ? "bg-emerald-900/30 border-emerald-800 text-emerald-400"
                                : "bg-zinc-800 border-zinc-700 text-zinc-400"
                        )}
                    >
                        <Filter className="w-3 h-3" />
                        {filter.uniqueContactsOnly ? "Unique Prospects" : "All Meetings"}
                    </button>
                </div>
            </div>
        </div>
    );
}
