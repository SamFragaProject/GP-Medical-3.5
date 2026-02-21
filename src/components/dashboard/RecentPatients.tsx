/**
 * RecentPatients — Pacientes recientes en sala
 * Conectado a Supabase: muestra los últimos pacientes atendidos.
 * Si no hay pacientes, muestra estado vacío profesional.
 */
import React, { useState, useEffect } from 'react'
import { User, Clock, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface RecentPatient {
    id: string
    name: string
    condition: string
    status: string
    time: string
}

export function RecentPatients() {
    const [patients, setPatients] = useState<RecentPatient[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchRecentPatients() {
            try {
                setLoading(true)
                const today = new Date().toISOString().split('T')[0]

                // Intentar obtener citas de hoy con datos del paciente
                const { data, error } = await supabase
                    .from('citas')
                    .select(`
                        id,
                        fecha_hora,
                        motivo_consulta,
                        estado,
                        paciente:paciente_id (nombre, apellido_paterno)
                    `)
                    .gte('fecha_hora', `${today}T00:00:00`)
                    .lte('fecha_hora', `${today}T23:59:59`)
                    .order('fecha_hora', { ascending: true })
                    .limit(6)

                if (data && data.length > 0) {
                    const mapped = data.map((c: any) => ({
                        id: c.id,
                        name: c.paciente
                            ? `${c.paciente.nombre || ''} ${c.paciente.apellido_paterno || ''}`.trim()
                            : 'Paciente',
                        condition: c.motivo_consulta || 'Consulta General',
                        status: c.estado === 'completada' ? 'completed' :
                            c.estado === 'en_proceso' ? 'active' : 'waiting',
                        time: new Date(c.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
                    }))
                    setPatients(mapped)
                }
            } catch (err) {
                console.error('Error fetching recent patients:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchRecentPatients()
    }, [])

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Pacientes en Sala</h3>
                <div className="flex flex-col items-center justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-3" />
                    <p className="text-sm text-slate-400 font-medium">Cargando...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">Pacientes en Sala</h3>
                {patients.length > 0 && (
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                        {patients.length} Total
                    </span>
                )}
            </div>

            {patients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center mb-4 border border-blue-100">
                        <User className="w-8 h-8 text-blue-300" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-500 mb-1">Sin pacientes en sala</h4>
                    <p className="text-xs text-slate-400 text-center max-w-[220px]">
                        Los pacientes con citas hoy aparecerán aquí automáticamente.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {patients.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors rounded-xl">
                            <div className="flex items-center space-x-3">
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                    {item.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                                    <p className="text-xs text-slate-500">{item.condition}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${item.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                        item.status === 'waiting' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                            'bg-slate-100 text-slate-500 border border-slate-200'
                                    }`}>
                                    {item.status === 'active' ? 'En Consulta' : item.status === 'waiting' ? 'Espera' : 'Finalizado'}
                                </span>
                                <div className="flex items-center text-slate-400 text-xs">
                                    <Clock size={12} className="mr-1" />
                                    {item.time}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
