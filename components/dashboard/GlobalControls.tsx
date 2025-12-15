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
        <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

                    {/* Date Range */}
                    <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1 border border-slate-200">
                        {(['today', 'week', 'last7', 'last30', 'last90'] as DateRange[]).map((range) => (
                            <button
                                key={range}
                                onClick={() => handleRangeChange(range)}
                                className={clsx(
                                    "px-4 py-2 text-sm font-medium rounded-md transition-all",
                                    filter.dateRange === range
                                        ? "bg-white text-blue-600 shadow-sm border border-blue-100"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                )}
                            >
                                {range === 'last7' ? '7D' : range === 'last30' ? '30D' : range === 'last90' ? '90D' : range.charAt(0).toUpperCase() + range.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Advisor Selector */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                            <Users className="w-4 h-4 text-slate-500" />
                            <span className="text-sm font-medium text-slate-700">Advisors:</span>
                            <div className="flex gap-2">
                                {advisors.map(adv => (
                                    <button
                                        key={adv}
                                        onClick={() => toggleAdvisor(adv)}
                                        className={clsx(
                                            "w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all",
                                            filter.selectedAdvisors.includes(adv)
                                                ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/30"
                                                : "bg-white border-slate-300 text-slate-600 hover:border-blue-400"
                                        )}
                                        title={adv}
                                    >
                                        {adv.charAt(0)}
                                    </button>
                                ))}
                                <button
                                    onClick={() => onFilterChange({ ...filter, selectedAdvisors: advisors })}
                                    className="text-xs text-slate-500 hover:text-blue-600 ml-1 px-2 font-medium"
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
                                "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                                filter.uniqueContactsOnly
                                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                    : "bg-white border-slate-300 text-slate-700 hover:border-blue-400"
                            )}
                        >
                            <Filter className="w-4 h-4" />
                            {filter.uniqueContactsOnly ? "Unique Prospects" : "All Meetings"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
