/**
 * NotasMedicasVersionadas — Auditoría Legal de Notas Médicas
 * Muestra el historial de notas con versionado y diff visual
 */
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText, Clock, CheckCircle, AlertTriangle, XCircle,
    ChevronDown, ChevronUp, Shield, User, GitBranch, Eye,
    Pen, Calendar, Hash
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { NotaMedicaVersion } from '@/data/demoPacienteCompleto'

interface Props {
    notas: NotaMedicaVersion[]
}

const TIPO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    ingreso: { label: 'Ingreso', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    consulta: { label: 'Consulta', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    nota_evolucion: { label: 'Nota de Evolución', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
    dictamen: { label: 'Dictamen', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
    interconsulta: { label: 'Interconsulta', color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-200' },
    alta: { label: 'Alta', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
}

const ESTADO_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
    vigente: { label: 'Vigente', icon: CheckCircle, color: 'text-emerald-600' },
    enmendada: { label: 'Enmendada', icon: AlertTriangle, color: 'text-amber-600' },
    cancelada: { label: 'Cancelada', icon: XCircle, color: 'text-rose-600' },
}

export function NotasMedicasVersionadas({ notas }: Props) {
    const [expandedNota, setExpandedNota] = useState<string | null>(null)
    const [showVersions, setShowVersions] = useState<string | null>(null)

    // Agrupar por nota_id para versionado
    const notasAgrupadas = notas.reduce((acc, nota) => {
        if (!acc[nota.nota_id]) acc[nota.nota_id] = []
        acc[nota.nota_id].push(nota)
        return acc
    }, {} as Record<string, NotaMedicaVersion[]>)

    // Ordenar cada grupo por versión descendente, luego ordenar grupos por fecha de última versión
    const gruposOrdenados = Object.entries(notasAgrupadas)
        .map(([notaId, versions]) => ({
            notaId,
            versions: versions.sort((a, b) => b.version - a.version),
            latest: versions.sort((a, b) => b.version - a.version)[0],
        }))
        .sort((a, b) => new Date(b.latest.fecha).getTime() - new Date(a.latest.fecha).getTime())

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <GitBranch className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800">Notas Médicas — Versionado Legal</h3>
                        <p className="text-xs text-slate-500">{gruposOrdenados.length} notas · {notas.length} versiones totales · Auditoría NOM-004-SSA3</p>
                    </div>
                </div>
                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 border">
                    <Shield className="w-3 h-3 mr-1" /> Inmutable
                </Badge>
            </div>

            <div className="space-y-3">
                {gruposOrdenados.map(({ notaId, versions, latest }) => {
                    const isExpanded = expandedNota === notaId
                    const showVers = showVersions === notaId
                    const tipoConf = TIPO_CONFIG[latest.tipo] || TIPO_CONFIG.consulta
                    const estadoConf = ESTADO_CONFIG[latest.estado] || ESTADO_CONFIG.vigente
                    const EstadoIcon = estadoConf.icon
                    const hasMultipleVersions = versions.length > 1

                    return (
                        <motion.div key={notaId} layout>
                            <Card className={`border shadow-sm hover:shadow-md transition-shadow ${latest.estado === 'enmendada' ? 'border-amber-200' : 'border-slate-100'}`}>
                                {/* Header */}
                                <div
                                    className="p-4 cursor-pointer flex items-center justify-between"
                                    onClick={() => setExpandedNota(isExpanded ? null : notaId)}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${tipoConf.bg} ${tipoConf.color}`}>
                                            {tipoConf.label}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-slate-800 text-sm truncate">{latest.motivo_consulta}</p>
                                            <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                                                <span className="flex items-center gap-1"><User className="w-3 h-3" />{latest.medico}</span>
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(latest.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                <span className="flex items-center gap-1"><Hash className="w-3 h-3" />CED: {latest.cedula}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                                        <span className={`flex items-center gap-1 text-xs font-bold ${estadoConf.color}`}>
                                            <EstadoIcon className="w-3.5 h-3.5" /> {estadoConf.label}
                                        </span>
                                        {hasMultipleVersions && (
                                            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                                                v{latest.version} · {versions.length} versiones
                                            </Badge>
                                        )}
                                        {latest.firma_medico && (
                                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border text-[10px]">
                                                ✓ Firmada
                                            </Badge>
                                        )}
                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <Separator />
                                            <CardContent className="p-5 space-y-4">
                                                {/* Cambio / Enmienda */}
                                                {latest.cambio_descripcion && (
                                                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                                                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-xs font-bold text-amber-700">Enmienda registrada</p>
                                                            <p className="text-xs text-amber-600 mt-0.5">{latest.cambio_descripcion}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <NoteField label="Padecimiento Actual" value={latest.padecimiento_actual} />
                                                    <NoteField label="Diagnóstico (CIE-10)" value={`${latest.diagnostico_cie10} — ${latest.diagnostico_texto}`} />
                                                    <NoteField label="Plan de Tratamiento" value={latest.plan_tratamiento} />
                                                    <NoteField label="Pronóstico" value={latest.pronostico} />
                                                </div>

                                                {latest.proxima_cita && (
                                                    <div className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-xl border border-blue-200">
                                                        <Calendar className="w-4 h-4 text-blue-500" />
                                                        <span className="text-xs font-bold text-blue-700">Próxima cita: {new Date(latest.proxima_cita).toLocaleDateString('es-MX')}</span>
                                                    </div>
                                                )}

                                                {/* Toggle versiones anteriores */}
                                                {hasMultipleVersions && (
                                                    <div>
                                                        <Button
                                                            variant="outline" size="sm"
                                                            onClick={(e) => { e.stopPropagation(); setShowVersions(showVers ? null : notaId) }}
                                                            className="text-xs gap-1.5 rounded-lg"
                                                        >
                                                            <GitBranch className="w-3.5 h-3.5" />
                                                            {showVers ? 'Ocultar' : 'Ver'} versiones anteriores ({versions.length - 1})
                                                        </Button>

                                                        <AnimatePresence>
                                                            {showVers && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    className="overflow-hidden mt-3 space-y-3"
                                                                >
                                                                    {versions.slice(1).map((v) => {
                                                                        const vEstado = ESTADO_CONFIG[v.estado] || ESTADO_CONFIG.vigente
                                                                        return (
                                                                            <div key={v.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 opacity-75">
                                                                                <div className="flex items-center justify-between mb-2">
                                                                                    <span className="text-xs font-bold text-slate-500">Versión {v.version} — {new Date(v.fecha).toLocaleString('es-MX')}</span>
                                                                                    <Badge variant="outline" className={`text-[10px] ${vEstado.color}`}>{vEstado.label}</Badge>
                                                                                </div>
                                                                                <p className="text-xs text-slate-600">{v.diagnostico_texto}</p>
                                                                                <p className="text-xs text-slate-500 mt-1">{v.plan_tratamiento}</p>
                                                                                {v.cambio_descripcion && (
                                                                                    <p className="text-xs text-amber-600 mt-1 italic">⚠ {v.cambio_descripcion}</p>
                                                                                )}
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}

function NoteField({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
            <p className="text-sm text-slate-700 leading-relaxed">{value}</p>
        </div>
    )
}
