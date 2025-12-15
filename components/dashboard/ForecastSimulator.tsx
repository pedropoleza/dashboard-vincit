'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, DollarSign, RefreshCw } from 'lucide-react';

interface ForecastSimulatorProps {
    currentMetrics: {
        m2Completed: number;
        avgTicket: number;
        closeRate: number;
    };
}

export function ForecastSimulator({ currentMetrics }: ForecastSimulatorProps) {
    const [conversionRate, setConversionRate] = useState(currentMetrics.closeRate * 100);
    const [ticketSize, setTicketSize] = useState(currentMetrics.avgTicket);

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
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500 rounded-l-2xl"></div>

            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white rounded-xl border border-indigo-200 shadow-sm">
                        <Sliders className="w-5 h-5 text-indigo-700" />
                    </div>
                    <h3 className="text-indigo-900 font-semibold text-lg">Forecast Simulator</h3>
                </div>
                {isModified && (
                    <button onClick={reset} className="text-sm flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-medium transition-colors bg-white px-3 py-1.5 rounded-lg border border-indigo-200">
                        <RefreshCw className="w-3.5 h-3.5" /> Reset
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Slider 1 */}
                <div>
                    <div className="flex justify-between mb-3">
                        <label className="text-sm text-indigo-800 font-semibold">M2 → Closed Rate</label>
                        <span className="text-indigo-700 font-bold">{conversionRate.toFixed(0)}%</span>
                    </div>
                    <input
                        type="range" min="10" max="90" step="1"
                        value={conversionRate}
                        onChange={(e) => setConversionRate(Number(e.target.value))}
                        className="w-full h-2 bg-white border border-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-[10px] text-indigo-500 mt-2 font-medium">
                        <span>Pessimistic</span>
                        <span>Optimistic</span>
                    </div>
                </div>

                {/* Slider 2 */}
                <div>
                    <div className="flex justify-between mb-3">
                        <label className="text-sm text-indigo-800 font-semibold">Avg. Ticket</label>
                        <span className="text-indigo-700 font-bold">${ticketSize.toLocaleString()}</span>
                    </div>
                    <input
                        type="range" min="1000" max="50000" step="1000"
                        value={ticketSize}
                        onChange={(e) => setTicketSize(Number(e.target.value))}
                        className="w-full h-2 bg-white border border-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>
            </div>

            {/* Result Area */}
            <div className="bg-white border border-indigo-200 rounded-xl p-5 flex justify-between items-center shadow-sm">
                <div>
                    <p className="text-indigo-600 text-xs font-semibold mb-1">Projected Deals</p>
                    <p className="text-2xl font-bold text-indigo-900">{projectedDeals.toFixed(1)}</p>
                </div>
                <div className="text-right">
                    <p className="text-indigo-600 text-xs font-semibold mb-1">Projected Revenue</p>
                    <p className="text-3xl font-bold text-emerald-700 flex items-center justify-end gap-1">
                        <DollarSign className="w-6 h-6" />
                        {projectedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                </div>
            </div>
        </div>
    );
}
