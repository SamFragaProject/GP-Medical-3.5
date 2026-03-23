import { motion } from 'framer-motion';
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
        bg: 'bg-white/80 backdrop-blur-sm border-blue-100/40',
        glow: 'rgba(59, 130, 246, 0.06)',
        shadow: 'shadow-[0_2px_8px_-2px_rgba(59,130,246,0.08),0_8px_24px_-4px_rgba(59,130,246,0.12)] hover:shadow-[0_8px_16px_-4px_rgba(59,130,246,0.12),0_20px_48px_-8px_rgba(59,130,246,0.18)]',
        icon: 'bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg shadow-blue-500/30',
        text: 'bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent',
        accent: 'from-blue-400 to-indigo-500',
        borderHover: 'hover:border-blue-200/60',
    },
    rose: {
        bg: 'bg-white/80 backdrop-blur-sm border-rose-100/40',
        glow: 'rgba(244, 63, 94, 0.06)',
        shadow: 'shadow-[0_2px_8px_-2px_rgba(244,63,94,0.08),0_8px_24px_-4px_rgba(244,63,94,0.12)] hover:shadow-[0_8px_16px_-4px_rgba(244,63,94,0.12),0_20px_48px_-8px_rgba(244,63,94,0.18)]',
        icon: 'bg-gradient-to-br from-rose-400 to-pink-600 shadow-lg shadow-rose-500/30',
        text: 'bg-gradient-to-br from-rose-600 to-pink-600 bg-clip-text text-transparent',
        accent: 'from-rose-400 to-pink-500',
        borderHover: 'hover:border-rose-200/60',
    },
    amber: {
        bg: 'bg-white/80 backdrop-blur-sm border-amber-100/40',
        glow: 'rgba(245, 158, 11, 0.06)',
        shadow: 'shadow-[0_2px_8px_-2px_rgba(245,158,11,0.08),0_8px_24px_-4px_rgba(245,158,11,0.12)] hover:shadow-[0_8px_16px_-4px_rgba(245,158,11,0.12),0_20px_48px_-8px_rgba(245,158,11,0.18)]',
        icon: 'bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg shadow-amber-500/30',
        text: 'bg-gradient-to-br from-amber-600 to-orange-600 bg-clip-text text-transparent',
        accent: 'from-amber-400 to-orange-500',
        borderHover: 'hover:border-amber-200/60',
    },
    emerald: {
        bg: 'bg-white/80 backdrop-blur-sm border-emerald-100/40',
        glow: 'rgba(16, 185, 129, 0.06)',
        shadow: 'shadow-[0_2px_8px_-2px_rgba(16,185,129,0.08),0_8px_24px_-4px_rgba(16,185,129,0.12)] hover:shadow-[0_8px_16px_-4px_rgba(16,185,129,0.12),0_20px_48px_-8px_rgba(16,185,129,0.18)]',
        icon: 'bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-500/30',
        text: 'bg-gradient-to-br from-emerald-600 to-green-600 bg-clip-text text-transparent',
        accent: 'from-emerald-400 to-green-500',
        borderHover: 'hover:border-emerald-200/60',
    },
    purple: {
        bg: 'bg-white/80 backdrop-blur-sm border-purple-100/40',
        glow: 'rgba(168, 85, 247, 0.06)',
        shadow: 'shadow-[0_2px_8px_-2px_rgba(168,85,247,0.08),0_8px_24px_-4px_rgba(168,85,247,0.12)] hover:shadow-[0_8px_16px_-4px_rgba(168,85,247,0.12),0_20px_48px_-8px_rgba(168,85,247,0.18)]',
        icon: 'bg-gradient-to-br from-purple-400 to-violet-600 shadow-lg shadow-purple-500/30',
        text: 'bg-gradient-to-br from-purple-600 to-violet-600 bg-clip-text text-transparent',
        accent: 'from-purple-400 to-violet-500',
        borderHover: 'hover:border-purple-200/60',
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
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className={cn(
                'group relative rounded-2xl p-6 border overflow-hidden',
                'transition-all duration-500 ease-out',
                colors.bg,
                colors.shadow,
                colors.borderHover,
                className
            )}
        >
            {/* Accent line on top */}
            <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${colors.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            {/* Subtle glow background */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse at 70% 0%, ${colors.glow} 0%, transparent 70%)`,
                }}
            />

            <div className="relative z-10 flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest group-hover:text-slate-500 transition-colors duration-300">
                        {title}
                    </p>
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
                            'inline-flex items-center gap-1 mt-3 text-xs font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm',
                            trend.isPositive
                                ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60'
                                : 'bg-rose-50/80 text-rose-700 border-rose-200/60'
                        )}>
                            <span>{trend.isPositive ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend.value)}%</span>
                        </div>
                    )}
                </div>
                <motion.div
                    whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.4 }}
                    className={cn(
                        'w-14 h-14 rounded-2xl flex items-center justify-center',
                        colors.icon
                    )}
                >
                    <Icon className="w-7 h-7 text-white" />
                </motion.div>
            </div>
        </motion.div>
    );
}
