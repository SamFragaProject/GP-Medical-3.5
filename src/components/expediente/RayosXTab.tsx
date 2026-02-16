/**
 * RayosXTab — Estudios radiológicos con historial y reportes
 */
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Bone, CheckCircle, Clock, ChevronDown, ChevronUp,
    FileText, Calendar, User, Shield, ArrowRight, Download
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RAYOS_X_DEMO } from '@/data/demoPacienteCompleto'

const RESULTADO_STYLES: Record<string, { bg: string; text: string; border: string; label: string; dot: string }> = {
    normal: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Normal', dot: 'bg-emerald-500' },
    anormal: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Anormal', dot: 'bg-amber-500' },
    critico: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Crítico', dot: 'bg-red-500' },
}

export default function RayosXTab() {
    const estudios = RAYOS_X_DEMO
    const [expandedId, setExpandedId] = useState<string | null>(estudios[0]?.id || null)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-lg shadow-slate-300">
                            <Bone className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Estudios Radiológicos</h3>
                            <p className="text-xs text-slate-400 font-medium">{estudios.length} estudio{estudios.length !== 1 ? 's' : ''} registrado{estudios.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Último</p>
                            <p className="text-sm font-bold text-emerald-700">
                                {new Date(estudios[0].fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total</p>
                            <p className="text-sm font-bold text-slate-700">{estudios.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Studies list */}
            <div className="space-y-4">
                {estudios.map((rx, index) => {
                    const isExpanded = expandedId === rx.id
                    const style = RESULTADO_STYLES[rx.resultado] || RESULTADO_STYLES.normal
                    const isLatest = index === 0

                    return (
                        <Card key={rx.id} className={`border-slate-100 shadow-sm overflow-hidden ${isLatest ? 'ring-2 ring-blue-200' : ''}`}>
                            <button
                                onClick={() => setExpandedId(isExpanded ? null : rx.id)}
                                className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition-colors text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.bg} border ${style.border}`}>
                                        <Bone className={`w-5 h-5 ${style.text}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-slate-800">{rx.tipo}</h4>
                                            <Badge className={`${style.bg} ${style.text} border-0 text-[9px] font-black px-2 py-0.5`}>
                                                {style.label}
                                            </Badge>
                                            {isLatest && (
                                                <Badge className="bg-blue-100 text-blue-700 border-0 text-[9px] font-black px-2 py-0.5">
                                                    Más reciente
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-medium">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(rx.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </span>
                                            <span>{rx.region}</span>
                                        </div>
                                    </div>
                                </div>
                                {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                            </button>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-6 space-y-4 border-t border-slate-100 pt-4">
                                            {/* Motivo */}
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Motivo del estudio</p>
                                                <p className="text-sm text-slate-700 font-medium">{rx.motivo}</p>
                                            </div>

                                            {/* Hallazgos */}
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Hallazgos radiológicos</p>
                                                <p className="text-sm text-slate-700 font-medium leading-relaxed">{rx.hallazgos}</p>
                                            </div>

                                            {/* Impresión diagnóstica */}
                                            <div className={`p-4 rounded-xl ${style.bg} border ${style.border}`}>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Impresión diagnóstica</p>
                                                <p className={`text-sm font-bold ${style.text}`}>{rx.impresion}</p>
                                            </div>

                                            {/* ILO Classification */}
                                            {rx.clasificacion_ilo && (
                                                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">Clasificación ILO (Neumoconiosis)</p>
                                                    <p className="text-sm font-bold text-blue-700">{rx.clasificacion_ilo}</p>
                                                </div>
                                            )}

                                            {/* Meta */}
                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Técnico</p>
                                                    <p className="text-slate-700 font-medium mt-0.5">{rx.tecnico}</p>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipo</p>
                                                    <p className="text-slate-700 font-medium mt-0.5">{rx.equipo}</p>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interpretación</p>
                                                    <p className="text-slate-700 font-medium mt-0.5">{rx.medico_interpreta}</p>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cédula</p>
                                                    <p className="text-slate-700 font-mono font-medium mt-0.5">{rx.cedula_rad}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    )
                })}
            </div>

            {/* Timeline footer */}
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Clock className="w-4 h-4 text-slate-400" />
                <p className="text-[11px] text-slate-500 font-medium">
                    Historial radiológico: {estudios.map(e => e.fecha).join(' • ')} — Se conservan para comparación temporal y vigilancia de neumoconiosis.
                </p>
            </div>
        </div>
    )
}
