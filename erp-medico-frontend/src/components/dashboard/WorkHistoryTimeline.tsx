import React from 'react'
import { motion } from 'framer-motion'
import { Briefcase, HardHat, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react'

interface WorkHistoryEvent {
    id: string
    date: string
    type: 'injury' | 'evaluation' | 'restriction' | 'clearance'
    title: string
    description: string
    department: string
    daysOff?: number
}

const workHistory: WorkHistoryEvent[] = [
    {
        id: '1',
        date: '2024-10-15',
        type: 'evaluation',
        title: 'Evaluación Ergonómica Anual',
        description: 'Evaluación completa de puesto de trabajo. Recomendaciones implementadas.',
        department: 'Producción',
    },
    {
        id: '2',
        date: '2024-08-22',
        type: 'injury',
        title: 'Lesión Menor - Espalda Baja',
        description: 'Lumbalgia por levantamiento incorrecto. Tratamiento con fisioterapia.',
        department: 'Almacén',
        daysOff: 3
    },
    {
        id: '3',
        date: '2024-06-10',
        type: 'clearance',
        title: 'Alta Médica - Retorno a Trabajo',
        description: 'Paciente apto para retomar actividades normales sin restricciones.',
        department: 'Producción',
    },
    {
        id: '4',
        date: '2024-03-15',
        type: 'restriction',
        title: 'Restricción Temporal',
        description: 'No levantar objetos >10kg por 2 semanas. Síndrome del túnel carpiano.',
        department: 'Ensamble',
        daysOff: 0
    }
]

export function WorkHistoryTimeline() {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Historial Laboral</h3>
                    <p className="text-sm text-gray-500">Eventos médicos relacionados con el trabajo</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        Lesión
                    </span>
                    <span className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        Restricción
                    </span>
                    <span className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        Alta
                    </span>
                    <span className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        Evaluación
                    </span>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                <div className="space-y-6">
                    {workHistory.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative pl-16"
                        >
                            {/* Icon */}
                            <div className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-lg ${event.type === 'injury' ? 'bg-red-500' :
                                    event.type === 'restriction' ? 'bg-amber-500' :
                                        event.type === 'clearance' ? 'bg-emerald-500' :
                                            'bg-blue-500'
                                }`}>
                                {event.type === 'injury' && <AlertTriangle className="w-5 h-5 text-white" />}
                                {event.type === 'restriction' && <Clock className="w-5 h-5 text-white" />}
                                {event.type === 'clearance' && <CheckCircle className="w-5 h-5 text-white" />}
                                {event.type === 'evaluation' && <Briefcase className="w-5 h-5 text-white" />}
                            </div>

                            {/* Content Card */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{event.title}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                    </div>
                                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                                        {new Date(event.date).toLocaleDateString('es-MX', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-md border border-gray-200">
                                        <HardHat className="w-3 h-3 text-gray-500" />
                                        {event.department}
                                    </span>
                                    {event.daysOff !== undefined && event.daysOff > 0 && (
                                        <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2 py-1 rounded-md border border-red-200">
                                            <Clock className="w-3 h-3" />
                                            {event.daysOff} días de incapacidad
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4">
                <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">4</p>
                    <p className="text-xs text-gray-500">Eventos Totales</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">127</p>
                    <p className="text-xs text-gray-500">Días Sin Incidentes</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">3</p>
                    <p className="text-xs text-gray-500">Días Incapacidad (Total)</p>
                </div>
            </div>
        </div>
    )
}
