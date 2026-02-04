import React from 'react';
import { Package, AlertTriangle, AlertOctagon, DollarSign, Activity, TrendingDown, Clock, Wallet } from 'lucide-react';
import { InventoryStats } from '@/types/inventory';
import { PremiumMetricCard } from '@/components/ui/PremiumMetricCard';

interface InventoryStatsCardsProps {
    stats: InventoryStats;
}

export function InventoryStatsCards({ stats }: InventoryStatsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PremiumMetricCard
                title="Total Productos"
                value={stats.totalItems}
                subtitle="Items registrados"
                icon={Package}
                gradient="blue"
            />

            <PremiumMetricCard
                title="Stock Bajo"
                value={stats.lowStockItems}
                subtitle="Nivel de reabastecimiento"
                icon={TrendingDown}
                gradient="amber"
                trend={{
                    value: stats.lowStockItems > 0 ? 15 : 0,
                    isPositive: false
                }}
            />

            <PremiumMetricCard
                title="Vencimientos"
                value={stats.expiredItems}
                subtitle="Críticos / Por caducar"
                icon={Clock}
                gradient="rose"
            />

            <PremiumMetricCard
                title="Valor Inventario"
                value={new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(stats.totalValue)}
                subtitle="Valorización actual"
                icon={Wallet}
                gradient="emerald"
            />
        </div>
    );
}
