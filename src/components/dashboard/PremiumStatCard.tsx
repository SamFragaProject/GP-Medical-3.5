import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface PremiumStatCardProps {
    title: string
    value: string | number | React.ReactNode
    subtext?: string
    trend?: number
    trendLabel?: string
    icon: React.ElementType
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
    delay?: number
}

const variantConfig = {
    primary: {
        iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-600',
        iconShadow: 'shadow-emerald-500/30',
        glowColor: 'rgba(16, 185, 129, 0.06)',
        borderHover: 'hover:border-emerald-200/60',
        accentLine: 'from-emerald-400 to-teal-500',
    },
    success: {
        iconBg: 'bg-gradient-to-br from-green-400 to-emerald-600',
        iconShadow: 'shadow-green-500/30',
        glowColor: 'rgba(34, 197, 94, 0.06)',
        borderHover: 'hover:border-green-200/60',
        accentLine: 'from-green-400 to-emerald-500',
    },
    warning: {
        iconBg: 'bg-gradient-to-br from-amber-400 to-orange-600',
        iconShadow: 'shadow-amber-500/30',
        glowColor: 'rgba(245, 158, 11, 0.06)',
        borderHover: 'hover:border-amber-200/60',
        accentLine: 'from-amber-400 to-orange-500',
    },
    danger: {
        iconBg: 'bg-gradient-to-br from-rose-400 to-red-600',
        iconShadow: 'shadow-rose-500/30',
        glowColor: 'rgba(244, 63, 94, 0.06)',
        borderHover: 'hover:border-rose-200/60',
        accentLine: 'from-rose-400 to-red-500',
    },
    default: {
        iconBg: 'bg-gradient-to-br from-slate-400 to-slate-600',
        iconShadow: 'shadow-slate-500/30',
        glowColor: 'rgba(100, 116, 139, 0.06)',
        borderHover: 'hover:border-slate-200/60',
        accentLine: 'from-slate-400 to-slate-500',
    },
}

export function PremiumStatCard({
    title,
    value,
    subtext,
    trend,
    trendLabel = 'vs mes anterior',
    icon: Icon,
    variant = 'default',
    delay = 0
}: PremiumStatCardProps) {
    const config = variantConfig[variant]

    return (
        <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                delay,
                duration: 0.5,
                type: 'spring',
                stiffness: 260,
                damping: 20,
            }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`
                group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6
                shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05),0_8px_24px_-4px_rgba(0,0,0,0.08)]
                hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.08),0_20px_48px_-8px_rgba(0,0,0,0.12)]
                border border-white/60 ${config.borderHover}
                transition-all duration-500 ease-out overflow-hidden
            `}
        >
            {/* Accent line on top */}
            <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${config.accentLine} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            {/* Subtle glow background on hover */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse at 30% 0%, ${config.glowColor} 0%, transparent 70%)`,
                }}
            />

            <div className="flex justify-between items-start mb-4 relative z-10">
                <motion.div
                    whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className={`p-3 rounded-2xl ${config.iconBg} shadow-lg ${config.iconShadow}`}
                >
                    <Icon className="w-6 h-6 text-white" />
                </motion.div>
            </div>

            <div className="space-y-1 relative z-10">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider group-hover:text-slate-500 transition-colors duration-300">{title}</h3>
                <div className="flex items-baseline space-x-2">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h2>
                    {subtext && <span className="text-sm text-slate-400 font-medium">{subtext}</span>}
                </div>
            </div>

            {trend !== undefined && (
                <div className="mt-4 flex items-center space-x-2 relative z-10">
                    <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${trend >= 0
                        ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60'
                        : 'bg-rose-50/80 text-rose-700 border-rose-200/60'
                        }`}>
                        {trend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                        {Math.abs(trend)}%
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{trendLabel}</span>
                </div>
            )}

            {/* Background icon decoration */}
            <motion.div
                className="absolute right-0 bottom-0 pointer-events-none text-slate-900"
                initial={{ opacity: 0.02 }}
                whileHover={{ opacity: 0.06, rotate: 6, scale: 1.05 }}
                transition={{ duration: 0.6 }}
            >
                <Icon className="w-28 h-28 -mr-6 -mb-6 transform rotate-12" />
            </motion.div>
        </motion.div>
    )
}
