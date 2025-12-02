import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
    title: string
    value: string
    trend: number
    icon: React.ElementType
    color: string
    delay: number
}

function StatCard({ title, value, trend, icon: Icon, color, delay }: StatCardProps) {
    const isPositive = trend > 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <Card className="border-none shadow-lg bg-white/50 backdrop-blur-xl hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />

                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl bg-${color}-100 text-${color}-600 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(trend)}%
                        </div>
                    </div>

                    <div className="space-y-1 relative z-10">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
                        <div className="text-2xl font-bold text-gray-800">{value}</div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export function QuickStats() {
    const stats = [
        {
            title: 'Pacientes Totales',
            value: '1,284',
            trend: 12.5,
            icon: Users,
            color: 'blue'
        },
        {
            title: 'Citas Hoy',
            value: '42',
            trend: 8.2,
            icon: Calendar,
            color: 'purple'
        },
        {
            title: 'Ingresos Mes',
            value: '$45.2k',
            trend: 15.3,
            icon: DollarSign,
            color: 'emerald'
        },
        {
            title: 'Eficiencia',
            value: '94%',
            trend: -2.4,
            icon: Activity,
            color: 'amber'
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} delay={index * 0.1} />
            ))}
        </div>
    )
}
