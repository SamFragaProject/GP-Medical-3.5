import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react'

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

    const getColors = () => {
        switch (variant) {
            case 'primary': return 'bg-brand-50 text-brand-600 border-brand-100'
            case 'success': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
            case 'warning': return 'bg-amber-50 text-amber-600 border-amber-100'
            case 'danger': return 'bg-red-50 text-red-600 border-red-100'
            default: return 'bg-slate-50 text-slate-600 border-slate-100'
        }
    }

    const iconColors = getColors()

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 overflow-hidden"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${iconColors} border transition-transform group-hover:scale-105 duration-300`}>
                    <Icon className="w-6 h-6" />
                </div>
                {/* Optional: Add functionality or remove if unused */}
                {/* <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button> */}
            </div>

            <div className="space-y-1 relative z-10">
                <h3 className="text-sm font-medium text-slate-500 group-hover:text-slate-600 transition-colors">{title}</h3>
                <div className="flex items-baseline space-x-2">
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h2>
                    {subtext && <span className="text-sm text-slate-400 font-medium">{subtext}</span>}
                </div>
            </div>

            {trend !== undefined && (
                <div className="mt-4 flex items-center space-x-2 relative z-10">
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs font-bold border ${trend >= 0
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                        {trend >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {Math.abs(trend)}%
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{trendLabel}</span>
                </div>
            )}

            {/* Decoración de fondo sutil */}
            <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-500">
                <Icon className="w-32 h-32 -mr-8 -mb-8 transform rotate-12 text-slate-900" />
            </div>
        </motion.div>
    )
}
