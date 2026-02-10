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
        bg: 'bg-white border-blue-50/50',
        glow: 'after:absolute after:inset-0 after:bg-blue-500/5 after:rounded-[2rem]',
        shadow: 'shadow-blue-500/10 hover:shadow-blue-500/20',
        icon: 'bg-gradient-to-br from-blue-400 to-indigo-600',
        text: 'text-blue-600',
    },
    rose: {
        bg: 'bg-white border-rose-50/50',
        glow: 'after:absolute after:inset-0 after:bg-rose-500/5 after:rounded-[2rem]',
        shadow: 'shadow-rose-500/10 hover:shadow-rose-500/20',
        icon: 'bg-gradient-to-br from-rose-400 to-pink-600',
        text: 'text-rose-600',
    },
    amber: {
        bg: 'bg-white border-amber-50/50',
        glow: 'after:absolute after:inset-0 after:bg-amber-500/5 after:rounded-[2rem]',
        shadow: 'shadow-amber-500/10 hover:shadow-amber-500/20',
        icon: 'bg-gradient-to-br from-amber-400 to-orange-600',
        text: 'text-amber-600',
    },
    emerald: {
        bg: 'bg-white border-emerald-50/50',
        glow: 'after:absolute after:inset-0 after:bg-emerald-500/5 after:rounded-[2rem]',
        shadow: 'shadow-emerald-500/10 hover:shadow-emerald-500/20',
        icon: 'bg-gradient-to-br from-emerald-400 to-green-600',
        text: 'text-emerald-600',
    },
    purple: {
        bg: 'bg-white border-purple-50/50',
        glow: 'after:absolute after:inset-0 after:bg-purple-500/5 after:rounded-[2rem]',
        shadow: 'shadow-purple-500/10 hover:shadow-purple-500/20',
        icon: 'bg-gradient-to-br from-purple-400 to-violet-600',
        text: 'text-purple-600',
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
                'relative rounded-[2rem] p-6 border transition-all duration-300',
                colors.bg,
                colors.glow,
                'shadow-lg',
                colors.shadow,
                className
            )}
        >
            <div className="relative z-10 flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-500 mb-2 truncate uppercase tracking-wider">{title}</p>
                    <h3 className={cn(
                        'text-4xl font-black mb-1 tracking-tighter',
                        colors.text
                    )}>
                        {value}
                    </h3>
                    {subtitle && (
                        <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
                    )}
                    {trend && (
                        <div className={cn(
                            'inline-flex items-center gap-1 mt-2 text-xs font-bold px-2 py-0.5 rounded-full',
                            trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        )}>
                            <span>{trend.isPositive ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend.value)}%</span>
                        </div>
                    )}
                </div>
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={cn(
                        'w-14 h-14 rounded-full flex items-center justify-center shadow-lg',
                        colors.icon
                    )}
                >
                    <Icon className="w-7 h-7 text-white" />
                </motion.div>
            </div>
        </motion.div>
    );
}
