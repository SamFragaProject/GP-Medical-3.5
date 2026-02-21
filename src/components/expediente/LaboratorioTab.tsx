/**
 * LaboratorioTab — Resultados de laboratorio con semáforo y comparación
 */
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    FlaskConical, ChevronDown, ChevronUp, TrendingUp, TrendingDown,
    Minus, AlertTriangle, CheckCircle, Clock, BarChart3
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { Loader2, Inbox } from 'lucide-react'
import { getExpedienteDemoCompleto } from '@/data/demoPacienteCompleto'

const FLAG_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    normal: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Normal' },
    alto: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Alto' },
    bajo: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Bajo' },
    critico: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Crítico' },
}

function getFlagForParam(param: string, prevLab: any | null): string | null {
    if (!prevLab) return null
    for (const grupo of prevLab.grupos || []) {
        const found = grupo.resultados?.find((r: any) => r.parametro === param)
        if (found) return found.resultado
    }
    return null
}

function ResultRow({ r, prevValue }: { r: any; prevValue: string | null }) {
    const flag = FLAG_STYLES[r.bandera] || FLAG_STYLES.normal
    const currNum = parseFloat(r.resultado?.replace(/,/g, '') || '0')
    const prevNum = prevValue ? parseFloat(prevValue.replace(/,/g, '')) : NaN

    let trend: 'up' | 'down' | 'same' | null = null
    if (!isNaN(currNum) && !isNaN(prevNum)) {
        if (currNum > prevNum) trend = 'up'
        else if (currNum < prevNum) trend = 'down'
        else trend = 'same'
    }

    return (
        <div className="flex items-center gap-2 py-2.5 px-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
            <div className={`w-2 h-2 rounded-full ${flag.dot} flex-shrink-0`} />
            <span className="text-sm font-semibold text-slate-700 flex-1 min-w-0">{r.parametro}</span>
            <span className={`text-sm font-black tabular-nums ${r.bandera !== 'normal' ? flag.text : 'text-slate-900'}`}>
                {r.resultado}
            </span>
            {r.unidad && <span className="text-[10px] text-slate-400 font-medium w-14 text-left">{r.unidad}</span>}
            <span className="text-[10px] text-slate-400 font-mono w-24 text-right hidden sm:block">{r.valor_referencia}</span>
            {trend && (
                <div className="w-5 flex-shrink-0">
                    {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-amber-500" />}
                    {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />}
                    {trend === 'same' && <Minus className="w-3.5 h-3.5 text-slate-300" />}
                </div>
            )}
            {r.bandera !== 'normal' && (
                <Badge className={`${flag.bg} ${flag.text} border-0 text-[9px] font-black px-1.5 py-0.5`}>
                    {flag.label}
                </Badge>
            )}
        </div>
    )
}

function GrupoCard({ grupo, prevLab }: { grupo: any; prevLab: any | null }) {
    const [expanded, setExpanded] = React.useState(true)
    const abnormalCount = grupo.resultados?.filter((r: any) => r.bandera !== 'normal').length || 0
    const total = grupo.resultados?.length || 0

    return (
        <Card className="border-slate-100 shadow-sm overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${abnormalCount > 0 ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                        <FlaskConical className={`w-4 h-4 ${abnormalCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`} />
                    </div>
                    <div className="text-left">
                        <h4 className="text-sm font-bold text-slate-800">{grupo.grupo}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{total} parámetros</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {abnormalCount > 0 && (
                        <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] font-black">
                            <AlertTriangle className="w-3 h-3 mr-1" />{abnormalCount} fuera de rango
                        </Badge>
                    )}
                    {abnormalCount === 0 && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] font-black">
                            <CheckCircle className="w-3 h-3 mr-1" />Todo normal
                        </Badge>
                    )}
                    {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
            </button>
            {expanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="flex items-center gap-2 py-1.5 px-3 bg-slate-50 border-y border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <span className="w-2" />
                        <span className="flex-1">Parámetro</span>
                        <span className="w-16">Resultado</span>
                        <span className="w-14 hidden sm:block">Unidad</span>
                        <span className="w-24 text-right hidden sm:block">Ref.</span>
                        <span className="w-5" />
                    </div>
                    {grupo.resultados?.map((r: any, i: number) => (
                        <ResultRow key={i} r={r} prevValue={getFlagForParam(r.parametro, prevLab)} />
                    ))}
                </motion.div>
            )}
        </Card>
    )
}

export default function LaboratorioTab({ pacienteId }: { pacienteId: string }) {
    const [loading, setLoading] = React.useState(true)
    const [lab, setLab] = React.useState<any>(null)
    const [prevLab, setPrevLab] = React.useState<any>(null)

    React.useEffect(() => {
        if (pacienteId) loadData()
    }, [pacienteId])

    const loadData = async () => {
        try {
            setLoading(true)
            const { data: records, error } = await supabase
                .from('examenes_laboratorio')
                .select('*')
                .eq('paciente_id', pacienteId)
                .order('fecha', { ascending: false })
                .limit(2)

            if (records && records.length > 0) {
                setLab(records[0])
                if (records.length > 1) setPrevLab(records[1])
            } else if (pacienteId?.startsWith('demo')) {
                const demoData = getExpedienteDemoCompleto()
                setLab(demoData.laboratorio)
                setPrevLab(demoData.laboratorioPrevio)
            }
        } catch (err) {
            console.error('Error loading lab results:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <p className="text-slate-500 text-xs font-medium">Cargando resultados de laboratorio...</p>
            </div>
        )
    }

    if (!lab) {
        return (
            <Card className="border-0 shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Inbox className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-slate-800 font-bold">Sin resultados de laboratorio</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
                    Este paciente aún no cuenta con resultados de laboratorio registrados.
                </p>
            </Card>
        )
    }

    const totalParams = lab.grupos?.reduce((acc: number, g: any) => acc + g.resultados?.length, 0) || 0
    const abnormalTotal = lab.grupos?.reduce((acc: number, g: any) => acc + g.resultados?.filter((r: any) => r.bandera !== 'normal').length, 0) || 0

    return (
        <div className="space-y-6">
            {/* Summary header */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                            <FlaskConical className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Resultados de Laboratorio</h3>
                            <p className="text-xs text-slate-400 font-medium">{lab.laboratorio_nombre} — Solicitado por {lab.medico_solicita}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha</p>
                            <p className="text-sm font-bold text-slate-700">
                                {new Date(lab.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Parámetros</p>
                            <p className="text-sm font-bold text-slate-700">{totalParams}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl border text-center ${abnormalTotal > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alertas</p>
                            <p className={`text-sm font-bold ${abnormalTotal > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>{abnormalTotal}</p>
                        </div>
                    </div>
                </div>

                {/* Comparison note */}
                {prevLab && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <BarChart3 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <p className="text-xs text-blue-700 font-medium">
                            Comparación con estudio previo del {new Date(prevLab.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
                            {' '}— Las flechas <TrendingUp className="w-3 h-3 inline text-amber-500" /> <TrendingDown className="w-3 h-3 inline text-emerald-500" /> indican tendencia.
                        </p>
                    </div>
                )}
            </div>

            {/* Lab results by group */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {lab.grupos.map((grupo, i) => (
                    <GrupoCard key={i} grupo={grupo} prevLab={prevLab} />
                ))}
            </div>

            {/* Previous results reference */}
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Clock className="w-4 h-4 text-slate-400" />
                <p className="text-[11px] text-slate-500 font-medium">
                    Historial de estudios: {lab.fecha} (actual) • {prevLab.fecha} (previo) — Se conservan automáticamente para análisis de tendencias.
                </p>
            </div>
        </div>
    )
}
