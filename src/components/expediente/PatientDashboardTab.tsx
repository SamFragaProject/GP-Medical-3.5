/**
 * PatientDashboardTab — Semáforo Clínico + Alertas + Mini-gráficas
 *
 * Vista de resumen ejecutivo del paciente con:
 * - Semáforo clínico por tipo de estudio (verde/amarillo/rojo)
 * - Alertas activas priorizadas
 * - Signos vitales (último registro)
 * - Mini audiograma inline
 * - Labs destacados con bar-indicator
 * - Timeline de estudios recientes
 */
import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Activity, Ear, Wind, Heart, FlaskConical, Eye, Bone,
    AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown,
    Loader2, Zap, Shield, Sparkles, ChevronRight, FileText,
    Thermometer, Droplets
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { getEstudios, getUltimoEstudioCompleto, type EstudioClinico, type EstudioCompleto, type Bandera, BANDERA_STYLES } from '@/services/estudiosService'

// ── Types ──
interface SystemStatus {
    key: string
    label: string
    icon: any
    status: 'ok' | 'warning' | 'alert' | 'critical' | 'pending'
    detail: string
    count?: string
    fecha?: string
}

interface AlertItem {
    level: 'critico' | 'alto' | 'bajo' | 'anormal'
    parametro: string
    valor: string
    unidad: string
    tipo: string
}

// ── CONSTANTS ──
const STATUS_STYLES = {
    ok: { bg: 'bg-emerald-500', ring: 'ring-emerald-200', text: 'text-emerald-700', bgLight: 'bg-emerald-50', border: 'border-emerald-200', label: 'Normal' },
    warning: { bg: 'bg-amber-500', ring: 'ring-amber-200', text: 'text-amber-700', bgLight: 'bg-amber-50', border: 'border-amber-200', label: 'Precaución' },
    alert: { bg: 'bg-orange-500', ring: 'ring-orange-200', text: 'text-orange-700', bgLight: 'bg-orange-50', border: 'border-orange-200', label: 'Alerta' },
    critical: { bg: 'bg-red-500', ring: 'ring-red-200', text: 'text-red-700', bgLight: 'bg-red-50', border: 'border-red-200', label: 'Crítico' },
    pending: { bg: 'bg-slate-300', ring: 'ring-slate-200', text: 'text-slate-500', bgLight: 'bg-slate-50', border: 'border-slate-200', label: 'Sin datos' },
}

const STUDY_TYPES = [
    { key: 'laboratorio', label: 'Laboratorios', icon: FlaskConical },
    { key: 'audiometria', label: 'Audiometría', icon: Ear },
    { key: 'espirometria', label: 'Espirometría', icon: Wind },
    { key: 'ecg', label: 'ECG', icon: Heart },
    { key: 'radiografia', label: 'Radiografía', icon: Bone },
    { key: 'optometria', label: 'Optometría', icon: Eye },
]

// ── MINI BAR INDICATOR ──
function BarIndicator({ value, min, max, unit, label, bandera }: {
    value: number; min?: number | null; max?: number | null; unit: string; label: string; bandera: Bandera
}) {
    const flag = BANDERA_STYLES[bandera] || BANDERA_STYLES.normal
    const rangeMin = min ?? 0
    const rangeMax = max ?? (value * 1.5)
    const range = rangeMax - rangeMin
    const totalMin = rangeMin - range * 0.3
    const totalMax = rangeMax + range * 0.3
    const totalRange = totalMax - totalMin
    const pos = totalRange > 0 ? Math.max(0, Math.min(100, ((value - totalMin) / totalRange) * 100)) : 50
    const refLeft = totalRange > 0 ? Math.max(0, ((rangeMin - totalMin) / totalRange) * 100) : 20
    const refWidth = totalRange > 0 ? Math.max(0, ((rangeMax - rangeMin) / totalRange) * 100) : 60

    return (
        <div className="flex items-center gap-3 py-1.5 group">
            <span className="text-xs font-semibold text-slate-600 w-28 truncate">{label}</span>
            <div className="flex-1 h-3 bg-slate-100 rounded-full relative overflow-hidden">
                {/* Normal range zone */}
                <div className="absolute h-full bg-emerald-100 rounded-full"
                    style={{ left: `${refLeft}%`, width: `${refWidth}%` }} />
                {/* Value marker */}
                <div className={`absolute top-0 h-full w-1.5 rounded-full ${flag.bg.replace('bg-', 'bg-')} shadow-sm`}
                    style={{ left: `${pos}%`, transform: 'translateX(-50%)' }} />
            </div>
            <span className={`text-xs font-black tabular-nums w-16 text-right ${bandera !== 'normal' ? flag.text : 'text-slate-800'}`}>
                {value} <span className="text-[9px] text-slate-400 font-medium">{unit}</span>
            </span>
        </div>
    )
}

// ── MAIN COMPONENT ──
export default function PatientDashboardTab({ pacienteId }: { pacienteId: string }) {
    const [loading, setLoading] = useState(true)
    const [studies, setStudies] = useState<Record<string, EstudioCompleto | null>>({})
    const [allStudies, setAllStudies] = useState<EstudioClinico[]>([])

    useEffect(() => {
        loadDashboard()
    }, [pacienteId])

    async function loadDashboard() {
        setLoading(true)
        try {
            // Load latest study of each type + all studies for timeline
            const [lab, audio, espiro, ecg, rx, opto, ...allTypesRes] = await Promise.all([
                getUltimoEstudioCompleto(pacienteId, 'laboratorio'),
                getUltimoEstudioCompleto(pacienteId, 'audiometria'),
                getUltimoEstudioCompleto(pacienteId, 'espirometria'),
                getUltimoEstudioCompleto(pacienteId, 'ecg'),
                getUltimoEstudioCompleto(pacienteId, 'radiografia'),
                getUltimoEstudioCompleto(pacienteId, 'optometria'),
                ...STUDY_TYPES.map(t => getEstudios(pacienteId, t.key as any, 3)),
            ])
            setStudies({
                laboratorio: lab, audiometria: audio, espirometria: espiro,
                ecg: ecg, radiografia: rx, optometria: opto,
            })
            // Flatten all studies for timeline
            const all = allTypesRes.flat().sort((a, b) =>
                new Date(b.fecha_estudio).getTime() - new Date(a.fecha_estudio).getTime()
            )
            setAllStudies(all)
        } catch (e) {
            console.error('[Dashboard] Error loading:', e)
        }
        setLoading(false)
    }

    // ── Compute semáforo for each study type ──
    const systemStatuses: SystemStatus[] = useMemo(() => {
        return STUDY_TYPES.map(st => {
            const study = studies[st.key]
            if (!study) {
                return { key: st.key, label: st.label, icon: st.icon, status: 'pending' as const, detail: 'Sin estudios registrados' }
            }
            const results = study.resultados || []
            const criticos = results.filter(r => r.bandera === 'critico').length
            const altos = results.filter(r => r.bandera === 'alto').length
            const bajos = results.filter(r => r.bandera === 'bajo').length
            const anormales = results.filter(r => r.bandera === 'anormal').length
            const normales = results.filter(r => r.bandera === 'normal').length
            const total = results.length

            let status: SystemStatus['status'] = 'ok'
            let detail = `${normales}/${total} normal`
            if (criticos > 0) { status = 'critical'; detail = `${criticos} críticos` }
            else if (altos + bajos > 2) { status = 'alert'; detail = `${altos + bajos} fuera de rango` }
            else if (altos + bajos + anormales > 0) { status = 'warning'; detail = `${altos + bajos + anormales} precaución` }

            // Use interpretation if available
            if (study.estudio?.interpretacion) {
                const interp = study.estudio.interpretacion.toLowerCase()
                if (interp.includes('normal') && status === 'ok') detail = 'Normal'
                if (interp.includes('compatible') || interp.includes('conservad')) detail = study.estudio.interpretacion.slice(0, 50)
            }

            return {
                key: st.key, label: st.label, icon: st.icon, status, detail,
                count: `${normales}/${total}`,
                fecha: study.estudio?.fecha_estudio,
            }
        })
    }, [studies])

    // ── Collect all alerts from all studies ──
    const alerts: AlertItem[] = useMemo(() => {
        const items: AlertItem[] = []
        for (const [tipo, study] of Object.entries(studies)) {
            if (!study?.resultados) continue
            for (const r of study.resultados) {
                if (r.bandera && r.bandera !== 'normal') {
                    items.push({
                        level: r.bandera as AlertItem['level'],
                        parametro: r.parametro_nombre || r.nombre_display || 'Parámetro',
                        valor: r.resultado,
                        unidad: r.unidad || '',
                        tipo: STUDY_TYPES.find(s => s.key === tipo)?.label || tipo,
                    })
                }
            }
        }
        // Sort: critico > alto > bajo > anormal
        const order = { critico: 0, alto: 1, bajo: 2, anormal: 3 }
        return items.sort((a, b) => (order[a.level] ?? 4) - (order[b.level] ?? 4))
    }, [studies])

    // ── Lab highlights (top 8 most important params) ──
    const labHighlights = useMemo(() => {
        const lab = studies.laboratorio
        if (!lab?.resultados) return []
        const important = ['Hemoglobina', 'Hematocrito', 'Glucosa', 'Creatinina', 'Colesterol Total', 'Triglicéridos', 'Plaquetas', 'Leucocitos']
        const highlighted = lab.resultados
            .filter(r => r.resultado_numerico != null)
            .sort((a, b) => {
                const aIdx = important.indexOf(a.parametro_nombre)
                const bIdx = important.indexOf(b.parametro_nombre)
                if (aIdx >= 0 && bIdx >= 0) return aIdx - bIdx
                if (aIdx >= 0) return -1
                if (bIdx >= 0) return 1
                return (a.bandera === 'normal' ? 1 : 0) - (b.bandera === 'normal' ? 1 : 0)
            })
        return highlighted.slice(0, 8)
    }, [studies])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-3" />
                    <p className="text-sm text-slate-400 font-semibold">Cargando dashboard clínico...</p>
                </div>
            </div>
        )
    }

    const totalAlerts = alerts.length
    const okSystems = systemStatuses.filter(s => s.status === 'ok').length
    const totalSystems = systemStatuses.filter(s => s.status !== 'pending').length

    return (
        <div className="space-y-5">
            {/* ── TOP: Semáforo Clínico ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Semáforo Clínico</h3>
                    {totalSystems > 0 && (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-black ml-auto">
                            {okSystems}/{totalSystems} sistemas OK
                        </Badge>
                    )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    {systemStatuses.map((sys, i) => {
                        const style = STATUS_STYLES[sys.status]
                        return (
                            <motion.div
                                key={sys.key}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.05 * i }}
                                className={`rounded-xl border ${style.border} ${style.bgLight} p-3 transition-all hover:shadow-md cursor-pointer group`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${style.bgLight}`}>
                                        <sys.icon className={`w-4 h-4 ${style.text}`} />
                                    </div>
                                    <div className={`w-2.5 h-2.5 rounded-full ${style.bg} ring-2 ${style.ring}`} />
                                </div>
                                <p className="text-xs font-black text-slate-700">{sys.label}</p>
                                <p className={`text-[10px] font-semibold ${style.text} mt-0.5`}>{sys.detail}</p>
                                {sys.fecha && (
                                    <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
                                        <Clock className="w-2.5 h-2.5" />
                                        {new Date(sys.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' })}
                                    </p>
                                )}
                            </motion.div>
                        )
                    })}
                </div>
            </motion.div>

            {/* ── ROW 2: Alerts + Lab Highlights ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Alerts */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="border-0 shadow-lg shadow-slate-100">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                {totalAlerts > 0 ? (
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                ) : (
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                )}
                                <h3 className="text-sm font-black text-slate-700">
                                    {totalAlerts > 0 ? `${totalAlerts} Alertas Activas` : 'Sin Alertas'}
                                </h3>
                            </div>
                            {totalAlerts === 0 ? (
                                <div className="text-center py-6">
                                    <CheckCircle className="w-10 h-10 text-emerald-200 mx-auto mb-2" />
                                    <p className="text-xs text-slate-400">Todos los valores dentro de rango normal</p>
                                </div>
                            ) : (
                                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                                    {alerts.slice(0, 10).map((a, i) => {
                                        const flag = BANDERA_STYLES[a.level as Bandera] || BANDERA_STYLES.normal
                                        return (
                                            <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${flag.bg} transition-colors`}>
                                                <div className={`w-2 h-2 rounded-full ${flag.dot} ${a.level === 'critico' ? 'animate-pulse' : ''}`} />
                                                <span className={`text-xs font-bold ${flag.text} flex-1`}>{a.parametro}</span>
                                                <span className="text-xs font-black text-slate-800">{a.valor} {a.unidad}</span>
                                                <Badge className={`${flag.bg} ${flag.text} border-0 text-[8px] font-black`}>{flag.label}</Badge>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Lab Highlights */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="border-0 shadow-lg shadow-slate-100">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <FlaskConical className="w-4 h-4 text-violet-500" />
                                <h3 className="text-sm font-black text-slate-700">Labs Destacados</h3>
                                {studies.laboratorio?.estudio?.fecha_estudio && (
                                    <span className="text-[9px] text-slate-400 ml-auto">
                                        {new Date(studies.laboratorio.estudio.fecha_estudio).toLocaleDateString('es-MX')}
                                    </span>
                                )}
                            </div>
                            {labHighlights.length === 0 ? (
                                <div className="text-center py-6">
                                    <FlaskConical className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                                    <p className="text-xs text-slate-400">Sin resultados de laboratorio</p>
                                </div>
                            ) : (
                                <div className="space-y-0.5">
                                    {labHighlights.map((r, i) => (
                                        <BarIndicator
                                            key={i}
                                            label={r.nombre_display || r.parametro_nombre}
                                            value={r.resultado_numerico ?? 0}
                                            min={r.rango_ref_min}
                                            max={r.rango_ref_max}
                                            unit={r.unidad || ''}
                                            bandera={r.bandera as Bandera}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* ── ROW 3: Timeline ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="border-0 shadow-lg shadow-slate-100">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <h3 className="text-sm font-black text-slate-700">Estudios Recientes</h3>
                            <Badge className="bg-blue-50 text-blue-600 border-blue-200 text-[10px] ml-auto">{allStudies.length} estudios</Badge>
                        </div>
                        {allStudies.length === 0 ? (
                            <div className="text-center py-6">
                                <FileText className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                                <p className="text-xs text-slate-400">No hay estudios registrados aún</p>
                                <p className="text-[10px] text-slate-300 mt-1">Sube documentos desde MedExtract Pro o directamente en cada sección</p>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
                                <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                                    {allStudies.slice(0, 12).map((s, i) => {
                                        const typeInfo = STUDY_TYPES.find(t => t.key === s.tipo_estudio)
                                        const TypeIcon = typeInfo?.icon || FileText
                                        return (
                                            <motion.div
                                                key={s.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.05 * i }}
                                                className="flex items-center gap-3 pl-1 relative"
                                            >
                                                <div className="w-7 h-7 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center z-10">
                                                    <TypeIcon className="w-3.5 h-3.5 text-slate-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-slate-700">{typeInfo?.label || s.tipo_estudio}</p>
                                                    <p className="text-[10px] text-slate-400">
                                                        {new Date(s.fecha_estudio).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        {s.archivo_origen && ` · ${s.archivo_origen}`}
                                                    </p>
                                                </div>
                                                {s.interpretacion && (
                                                    <p className="text-[10px] text-slate-500 max-w-[200px] truncate hidden md:block">{s.interpretacion.slice(0, 60)}...</p>
                                                )}
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* ── DISCLAIMER ── */}
            <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                    <strong className="text-slate-500">⚕️ Aviso:</strong> Los análisis e interpretaciones son generados por IA como herramienta de apoyo clínico.
                    No constituyen un diagnóstico médico. La decisión diagnóstica y terapéutica es responsabilidad exclusiva del médico tratante.
                </p>
            </div>
        </div>
    )
}
