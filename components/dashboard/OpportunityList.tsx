'use client';

import React from 'react';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { ExternalLink, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface Opportunity {
    id: string;
    contactName: string;
    contactEmail?: string;
    advisorName: string;
    stageName: string;
    status: 'open' | 'won' | 'lost' | 'abandoned';
    createdAt: string;
}

interface OpportunityListProps {
    opportunities: Opportunity[];
    limit?: number;
}

export function OpportunityList({ opportunities, limit = 10 }: OpportunityListProps) {
    const displayed = opportunities.slice(0, limit);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'won': return 'success';
            case 'lost': return 'danger';
            case 'abandoned': return 'warning';
            default: return 'default';
        }
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return 'Just now';
    };

    return (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800">
            <div className="p-6 border-b border-zinc-800">
                <h3 className="text-white font-medium">Recent Opportunities</h3>
                <p className="text-zinc-500 text-sm">Latest deals in the pipeline</p>
            </div>

            <div className="divide-y divide-zinc-800">
                {displayed.map((opp) => (
                    <div key={opp.id} className="p-4 hover:bg-zinc-800/20 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <Avatar name={opp.contactName} size="sm" />
                                <div>
                                    <p className="font-medium text-white text-sm">{opp.contactName}</p>
                                    {opp.contactEmail && (
                                        <p className="text-zinc-500 text-xs">{opp.contactEmail}</p>
                                    )}
                                </div>
                            </div>
                            <Badge variant={getStatusVariant(opp.status)}>
                                {opp.status}
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-zinc-400">
                                    <Avatar name={opp.advisorName} size="sm" />
                                    <span>{opp.advisorName}</span>
                                </div>
                                <Badge size="sm" variant="info">
                                    {opp.stageName}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-2 text-zinc-500">
                                <Clock className="w-3 h-3" />
                                <span>{timeAgo(opp.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {opportunities.length > limit && (
                <div className="p-4 border-t border-zinc-800 text-center">
                    <button className="text-sm text-zinc-400 hover:text-white transition-colors">
                        View all {opportunities.length} opportunities →
                    </button>
                </div>
            )}
        </div>
    );
}
