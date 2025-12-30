import React from 'react';
import { Card, Text, Metric, AreaChart, Badge, Flex } from '@tremor/react';
import { LucideIcon } from 'lucide-react';

interface VitalSignCardProps {
    title: string;
    value: string;
    unit: string;
    icon: LucideIcon;
    color: "blue" | "cyan" | "indigo" | "violet" | "fuchsia" | "pink" | "rose" | "red" | "orange" | "amber" | "yellow" | "lime" | "green" | "emerald" | "teal" | "sky" | "slate" | "gray" | "zinc" | "neutral" | "stone";
    trend: 'up' | 'down' | 'stable';
    trendValue?: string;
    data: { date: string; value: number }[];
    status?: 'Normal' | 'Warning' | 'Critical';
}

export function VitalSignCard({ title, value, unit, icon: Icon, color, trend, trendValue, data, status = 'Normal' }: VitalSignCardProps) {
    return (
        <Card className="p-4 ring-0 shadow-lg shadow-slate-200/50 border-none bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden relative group hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600`}>
                        <Icon size={18} />
                    </div>
                    <Text className="font-medium text-slate-600">{title}</Text>
                </div>
                {status !== 'Normal' && (
                    <Badge color={status === 'Critical' ? 'rose' : 'amber'} size="xs">
                        {status}
                    </Badge>
                )}
            </div>

            <Flex alignItems="baseline" className="space-x-1 mb-4">
                <Metric className="text-slate-900">{value}</Metric>
                <Text className="text-slate-400 text-sm font-medium">{unit}</Text>
            </Flex>

            <div className="h-16 -mx-4 -mb-4">
                <AreaChart
                    className="h-20 w-full"
                    data={data}
                    index="date"
                    categories={["value"]}
                    colors={[color]}
                    showXAxis={false}
                    showYAxis={false}
                    showLegend={false}
                    showGridLines={false}
                    showTooltip={false}
                    curveType="monotone"
                    startEndOnly={true}
                    showAnimation={true}
                />
            </div>
        </Card>
    );
}
