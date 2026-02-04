import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumMetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    gradient: 'blue' | 'rose' | 'amber' | 'emerald' | 'purple';
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

const gradientClasses = {
    blue: {
        bg: 'bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-white',
        border: 'border-blue-100/50',
        shadow: 'shadow-blue-500/20 hover:shadow-blue-500/30',
        icon: 'bg-gradient-to-br from-blue-500 to-indigo-600',
        text: 'from-blue-600 to-indigo-600',
    },
    rose: {
        bg: 'bg-gradient-to-br from-rose-500/10 via-pink-400/5 to-white',
        border: 'border-rose-100/50',
        shadow: 'shadow-rose-500/20 hover:shadow-rose-500/30',
        icon: 'bg-gradient-to-br from-rose-500 to-pink-600',
        text: 'from-rose-600 to-pink-600',
    },
    amber: {
        bg: 'bg-gradient-to-br from-amber-500/10 via-yellow-400/5 to-white',
        border: 'border-amber-100/50',
        shadow: 'shadow-amber-500/20 hover:shadow-amber-500/30',
        icon: 'bg-gradient-to-br from-amber-500 to-orange-600',
        text: 'from-amber-600 to-orange-600',
    },
    emerald: {
        bg: 'bg-gradient-to-br from-emerald-500/10 via-green-400/5 to-white',
        border: 'border-emerald-100/50',
        shadow: 'shadow-emerald-500/20 hover:shadow-emerald-500/30',
        icon: 'bg-gradient-to-br from-emerald-500 to-green-600',
        text: 'from-emerald-600 to-green-600',
    },
    purple: {
        bg: 'bg-gradient-to-br from-purple-500/10 via-violet-400/5 to-white',
        border: 'border-purple-100/50',
        shadow: 'shadow-purple-500/20 hover:shadow-purple-500/30',
        icon: 'bg-gradient-to-br from-purple-500 to-violet-600',
        text: 'from-purple-600 to-violet-600',
    },
};

export function PremiumMetricCard({
    title,
    value,
    subtitle,
    icon: Icon,
    gradient,
    trend,
    className = '',
}: PremiumMetricCardProps) {
    const colors = gradientClasses[gradient];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={cn(
                'rounded-3xl p-6 border transition-all duration-300',
                colors.bg,
                colors.border,
                'shadow-lg',
                colors.shadow,
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
                    <h3 className={cn(
                        'text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-1',
                        colors.text
                    )}>
                        {value}
                    </h3>
                    {subtitle && (
                        <p className="text-xs text-slate-500">{subtitle}</p>
                    )}
                    {trend && (
                        <div className={cn(
                            'inline-flex items-center gap-1 mt-2 text-xs font-semibold',
                            trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
                        )}>
                            <span>{trend.isPositive ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend.value)}%</span>
                        </div>
                    )}
                </div>
                <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                        'p-3 rounded-2xl shadow-lg',
                        colors.icon
                    )}
                >
                    <Icon className="w-6 h-6 text-white" />
                </motion.div>
            </div>
        </motion.div>
    );
}
