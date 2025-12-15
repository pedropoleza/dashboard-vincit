'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, DollarSign, RefreshCw } from 'lucide-react';

interface ForecastSimulatorProps {
    currentMetrics: {
        m2Completed: number;
        avgTicket: number;
        closeRate: number; // 0.4 usually
    };
}

export function ForecastSimulator({ currentMetrics }: ForecastSimulatorProps) {
    // State for sliders
    const [conversionRate, setConversionRate] = useState(currentMetrics.closeRate * 100); // e.g. 40
    const [ticketSize, setTicketSize] = useState(currentMetrics.avgTicket);

    // Sync when props change (reset)
    useEffect(() => {
        setConversionRate(currentMetrics.closeRate * 100);
        setTicketSize(currentMetrics.avgTicket);
    }, [currentMetrics.closeRate, currentMetrics.avgTicket]);

    const projectedDeals = currentMetrics.m2Completed * (conversionRate / 100);
    const projectedRevenue = projectedDeals * ticketSize;

    const isModified = conversionRate !== (currentMetrics.closeRate * 100) || ticketSize !== currentMetrics.avgTicket;

    const reset = () => {
        setConversionRate(currentMetrics.closeRate * 100);
        setTicketSize(currentMetrics.avgTicket);
    };

    return (
        <div className="bg-zinc-900 border border-zinc-700/50 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-medium flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    Forecast Simulator
                </h3>
                {isModified && (
                    <button onClick={reset} className="text-xs flex items-center gap-1 text-zinc-400 hover:text-white transition-colors">
                        <RefreshCw className="w-3 h-3" /> Reset
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Slider 1: Conv Rate */}
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-xs text-zinc-400 uppercase tracking-wide">M2 → Closed Rate</label>
                        <span className="text-purple-400 font-bold">{conversionRate.toFixed(0)}%</span>
                    </div>
                    <input
                        type="range" min="10" max="90" step="1"
                        value={conversionRate}
                        onChange={(e) => setConversionRate(Number(e.target.value))}
                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                        <span>Pessimistic (10%)</span>
                        <span>Optimistic (90%)</span>
                    </div>
                </div>

                {/* Slider 2: Ticket Size */}
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-xs text-zinc-400 uppercase tracking-wide">Avg. Ticket</label>
                        <span className="text-purple-400 font-bold">${ticketSize.toLocaleString()}</span>
                    </div>
                    <input
                        type="range" min="1000" max="50000" step="1000"
                        value={ticketSize}
                        onChange={(e) => setTicketSize(Number(e.target.value))}
                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                </div>
            </div>

            {/* Result Area */}
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex justify-between items-center shadow-inner">
                <div>
                    <p className="text-zinc-500 text-xs">Projected Deals</p>
                    <p className="text-xl font-bold text-white">{projectedDeals.toFixed(1)}</p>
                </div>
                <div className="text-right">
                    <p className="text-zinc-500 text-xs mb-1">Projected Revenue</p>
                    <p className="text-2xl font-bold text-emerald-400 flex items-center justify-end gap-1">
                        <DollarSign className="w-5 h-5" />
                        {projectedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                </div>
            </div>
        </div>
    );
}
