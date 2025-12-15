export type DateRange = 'today' | 'week' | 'last7' | 'last30' | 'last90' | 'custom';

export interface DashboardFilter {
    dateRange: DateRange;
    selectedAdvisors: string[]; // IDs or Names
    uniqueContactsOnly: boolean;
}

export interface MetricData {
    label: string;
    value: number;
    change?: number; // percentage
    trend?: 'up' | 'down' | 'neutral';
}

export interface FunnelStage {
    name: string;
    count: number;
    conversionRate?: number; // from previous step
}

export interface Advisor {
    name: string;
    meetingsCompleted: number;
    m2Conversion: number; // percentage
    dscContribution: number;
    referralsExpected: number;
    referralsCollected: number;
    revenue: number;
}
