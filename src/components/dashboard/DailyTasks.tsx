/**
 * DailyTasks — Tareas pendientes del día
 * Conectado a Supabase: muestra tareas pendientes reales.
 * Sin datos hardcodeados — vacío limpio si no hay tareas.
 */
import React, { useState, useEffect } from 'react'
import { CheckCircle, Circle, Loader2, ClipboardList } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Task {
    id: string
    title: string
    patient: string
    status: string
    priority: string
}

export function DailyTasks() {
    const { user } = useAuth()
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchTasks() {
            try {
                setLoading(true)
                // Intentar obtener tareas pendientes del médico
                const { data, error } = await supabase
                    .from('tareas_medicas')
                    .select('*')
                    .eq('medico_id', user?.id || '')
                    .in('estado', ['pendiente', 'en_proceso'])
                    .order('created_at', { ascending: false })
                    .limit(6)

                if (data && data.length > 0) {
                    const mapped = data.map((t: any) => ({
                        id: t.id,
                        title: t.titulo || t.descripcion || 'Tarea',
                        patient: t.paciente_nombre || '',
                        status: t.estado === 'completada' ? 'completed' : 'pending',
                        priority: t.prioridad || 'medium'
                    }))
                    setTasks(mapped)
                }
            } catch (err) {
                // Si la tabla no existe, simplemente no mostramos tareas
                console.log('Tareas no disponibles aún:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchTasks()
    }, [user])

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-full">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Tareas Pendientes</h3>
                <div className="flex flex-col items-center justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
                    <p className="text-sm text-slate-400 font-medium">Cargando...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Tareas Pendientes</h3>

            {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl flex items-center justify-center mb-4 border border-emerald-100">
                        <ClipboardList className="w-8 h-8 text-emerald-300" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-500 mb-1">Todo al día</h4>
                    <p className="text-xs text-slate-400 text-center max-w-[220px]">
                        No tienes tareas pendientes. Las nuevas tareas aparecerán automáticamente.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors rounded-xl">
                            <div className="flex items-start space-x-3">
                                {task.status === 'completed' ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                ) : (
                                    <Circle className="w-5 h-5 text-slate-300 mt-0.5 flex-shrink-0" />
                                )}
                                <div>
                                    <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                        {task.title}
                                    </p>
                                    {task.patient && (
                                        <p className="text-xs text-slate-500">{task.patient}</p>
                                    )}
                                </div>
                            </div>
                            {task.status === 'pending' && (
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.priority === 'high' ? 'bg-rose-500' :
                                        task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
