import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react'

interface PremiumStatCardProps {
    title: string
    value: string | number
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
            case 'primary': return 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-blue-500/20'
            case 'success': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/20'
            case 'warning': return 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-amber-500/20'
            case 'danger': return 'bg-red-500/20 text-red-400 border-red-500/30 shadow-red-500/20'
            default: return 'bg-white/10 text-gray-300 border-white/10 shadow-white/5'
        }
    }

    const colors = getColors()

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className="group relative glass-card rounded-3xl p-6 hover:bg-white/10 transition-all duration-300 border border-white/5"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${colors} border shadow-lg backdrop-blur-md transition-transform group-hover:scale-105 duration-300`}>
                    <Icon className="w-6 h-6" />
                </div>
                <button className="text-gray-500 hover:text-white transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">{title}</h3>
                <div className="flex items-baseline space-x-2">
                    <h2 className="text-3xl font-bold text-white tracking-tight text-glow">{value}</h2>
                    {subtext && <span className="text-sm text-gray-500 font-medium">{subtext}</span>}
                </div>
            </div>

            {trend !== undefined && (
                <div className="mt-4 flex items-center space-x-2">
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs font-bold border ${trend >= 0
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                        {trend >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {Math.abs(trend)}%
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{trendLabel}</span>
                </div>
            )}

            {/* Decoración de fondo sutil */}
            <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-500">
                <Icon className="w-32 h-32 -mr-8 -mb-8 transform rotate-12 text-white" />
            </div>
        </motion.div>
    )
}
