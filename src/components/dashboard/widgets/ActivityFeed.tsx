import React from 'react'
import { motion } from 'framer-motion'
import { Bell, FileText, UserPlus, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ActivityFeed() {
    const activities = [
        {
            id: 1,
            type: 'appointment',
            message: 'Nueva cita agendada para Roberto Martínez',
            time: 'Hace 5 min',
            icon: CalendarIcon,
            color: 'text-blue-500',
            bg: 'bg-blue-100'
        },
        {
            id: 2,
            type: 'report',
            message: 'Resultados de laboratorio disponibles',
            time: 'Hace 15 min',
            icon: FileText,
            color: 'text-purple-500',
            bg: 'bg-purple-100'
        },
        {
            id: 3,
            type: 'patient',
            message: 'Nuevo paciente registrado: Laura Silva',
            time: 'Hace 1 hora',
            icon: UserPlus,
            color: 'text-green-500',
            bg: 'bg-green-100'
        },
        {
            id: 4,
            type: 'system',
            message: 'Copia de seguridad completada',
            time: 'Hace 2 horas',
            icon: CheckCircle,
            color: 'text-emerald-500',
            bg: 'bg-emerald-100'
        },
        {
            id: 5,
            type: 'alert',
            message: 'Stock bajo en Inventario: Paracetamol',
            time: 'Hace 3 horas',
            icon: AlertCircle,
            color: 'text-amber-500',
            bg: 'bg-amber-100'
        }
    ]

    return (
        <Card className="h-full border-none shadow-lg bg-white/50 backdrop-blur-xl">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-600" />
                    Actividad Reciente
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                    <div className="space-y-6 pl-2">
                        {activities.map((activity, index) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative flex gap-4 group"
                            >
                                {/* Timeline line */}
                                {index !== activities.length - 1 && (
                                    <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-gray-200 group-hover:bg-indigo-200 transition-colors" />
                                )}

                                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.bg} ${activity.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                    <activity.icon className="w-5 h-5" />
                                </div>

                                <div className="flex-1 pt-1">
                                    <p className="text-sm font-medium text-gray-800 group-hover:text-indigo-700 transition-colors">
                                        {activity.message}
                                    </p>
                                    <span className="text-xs text-gray-500 font-medium">
                                        {activity.time}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function CalendarIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    )
}
