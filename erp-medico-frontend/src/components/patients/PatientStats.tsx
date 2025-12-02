import React from 'react'
import { motion } from 'framer-motion'
import { Users, UserCheck, UserX, Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function PatientStats() {
    const stats = [
        {
            title: 'Total Pacientes',
            value: '1,248',
            trend: '+12%',
            trendUp: true,
            icon: Users,
            color: 'blue',
            bg: 'bg-blue-100',
            text: 'text-blue-600'
        },
        {
            title: 'Aptos',
            value: '856',
            trend: '+5%',
            trendUp: true,
            icon: UserCheck,
            color: 'emerald',
            bg: 'bg-emerald-100',
            text: 'text-emerald-600'
        },
        {
            title: 'Con Restricciones',
            value: '142',
            trend: '-2%',
            trendUp: false,
            icon: Activity,
            color: 'amber',
            bg: 'bg-amber-100',
            text: 'text-amber-600'
        },
        {
            title: 'No Aptos',
            value: '24',
            trend: '-8%',
            trendUp: false,
            icon: UserX,
            color: 'rose',
            bg: 'bg-rose-100',
            text: 'text-rose-600'
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                                    <span className={`text-xs font-medium ${stat.trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {stat.trend}
                                    </span>
                                </div>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.text}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    )
}
