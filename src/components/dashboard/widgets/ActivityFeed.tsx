/**
 * ActivityFeed — Feed de actividad reciente
 * Muestra estado vacío si no hay actividad real.
 * Listo para conectarse a un sistema de auditoría real.
 */
import React from 'react'
import { Bell, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ActivityFeed() {
    // Sin actividades hardcodeadas — estado vacío limpio
    return (
        <Card className="h-full border-none shadow-lg bg-white/50 backdrop-blur-xl">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-600" />
                    Actividad Reciente
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100">
                        <Activity className="w-8 h-8 text-indigo-300" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-500 mb-1">Sin actividad reciente</h4>
                    <p className="text-xs text-slate-400 text-center max-w-[240px]">
                        Las acciones del sistema como nuevas citas, registros y resultados aparecerán aquí automáticamente.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
