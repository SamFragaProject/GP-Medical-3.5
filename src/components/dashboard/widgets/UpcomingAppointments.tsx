/**
 * UpcomingAppointments — Widget de próximas citas
 * Conectado a Supabase: muestra citas reales del módulo de agenda.
 * Si no hay citas, muestra un estado vacío profesional.
 */
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, Video, MapPin, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Appointment {
    id: string
    paciente_nombre: string
    tipo: string
    hora: string
    modalidad: string
    estado: string
}

export function UpcomingAppointments() {
    const { user } = useAuth()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchAppointments() {
            try {
                setLoading(true)
                const today = new Date().toISOString().split('T')[0]

                const { data, error } = await supabase
                    .from('citas')
                    .select(`
                        id,
                        fecha_hora,
                        motivo_consulta,
                        modalidad,
                        estado,
                        paciente:paciente_id (nombre, apellido_paterno)
                    `)
                    .gte('fecha_hora', `${today}T00:00:00`)
                    .lte('fecha_hora', `${today}T23:59:59`)
                    .order('fecha_hora', { ascending: true })
                    .limit(5)

                if (data && data.length > 0) {
                    const mapped = data.map((c: any) => ({
                        id: c.id,
                        paciente_nombre: c.paciente
                            ? `${c.paciente.nombre || ''} ${c.paciente.apellido_paterno || ''}`.trim()
                            : 'Paciente',
                        tipo: c.motivo_consulta || 'Consulta',
                        hora: new Date(c.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
                        modalidad: c.modalidad || 'Presencial',
                        estado: c.estado || 'programada'
                    }))
                    setAppointments(mapped)
                }
            } catch (err) {
                console.error('Error fetching appointments:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchAppointments()
    }, [user])

    return (
        <Card className="h-full border-none shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    Próximas Citas
                </CardTitle>
                {appointments.length > 0 && (
                    <Badge variant="secondary" className="text-xs font-bold">
                        {appointments.length} hoy
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-3" />
                        <p className="text-sm text-slate-400 font-medium">Cargando agenda...</p>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100">
                            <Calendar className="w-8 h-8 text-indigo-300" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-500 mb-1">Sin citas para hoy</h4>
                        <p className="text-xs text-slate-400 text-center max-w-[200px]">
                            Las citas programadas aparecerán aquí automáticamente.
                        </p>
                    </div>
                ) : (
                    appointments.map((apt, index) => (
                        <motion.div
                            key={apt.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/60 hover:bg-white/80 transition-all duration-200 border border-gray-100 hover:border-indigo-100 group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                        {apt.paciente_nombre.charAt(0).toUpperCase()}
                                    </div>
                                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${apt.estado === 'completada' ? 'bg-green-500' :
                                            apt.estado === 'en_proceso' ? 'bg-blue-500' : 'bg-amber-500'
                                        }`} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors text-sm">
                                        {apt.paciente_nombre}
                                    </h4>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        {apt.tipo}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1 text-sm font-medium text-gray-700 bg-gray-100/50 px-2 py-1 rounded-md">
                                    <Clock className="w-3 h-3" />
                                    {apt.hora}
                                </div>
                                <Badge variant={apt.modalidad === 'Virtual' ? 'secondary' : 'outline'} className="text-[10px]">
                                    {apt.modalidad === 'Virtual' ? (
                                        <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Virtual</span>
                                    ) : (
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Presencial</span>
                                    )}
                                </Badge>
                            </div>
                        </motion.div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}
