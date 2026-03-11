// @ts-nocheck
/**
 * ElectrocardiogramaTab — Unified Design (mirrors EspirometriaTab)
 *
 * Flow:
 *   1. Upload PDF/Image → AI extracts ECG parameters → save to Supabase
 *   2. Display extracted data with KPIs, charts, classification
 *   3. No PDF/image viewer — only extracted clinical data
 *
 * /samu: Unified visual system (same cards, KPIs, charts, tabs as Espirometria)
 * /midu: Clean hooks, Recharts, no inline styles, event delegation
 */
import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    HeartPulse, Activity, Upload, Loader2, CheckCircle, AlertTriangle,
    RefreshCw, Shield, Heart, Brain, TrendingUp, Zap, Table2, Trash2,
    Target, BarChart3, FileCheck
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import DocumentosAdjuntos from '@/components/expediente/DocumentosAdjuntos'
import EstudioUploadReview from '@/components/expediente/EstudioUploadReview'
import {
    BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Cell, ReferenceLine
} from 'recharts'

// ── Rangos de referencia ECG ──
const ECG_REFS: Record<string, { min?: number; max?: number; unit: string; label: string }> = {
    FC: { min: 60, max: 100, unit: 'lpm', label: 'Frecuencia Cardíaca' },
    ONDA_P: { min: 80, max: 120, unit: 'ms', label: 'Onda P' },
    INTERVALO_PR: { min: 120, max: 200, unit: 'ms', label: 'Intervalo PR' },
    COMPLEJO_QRS: { min: 60, max: 100, unit: 'ms', label: 'Complejo QRS' },
    INTERVALO_QT: { min: 350, max: 450, unit: 'ms', label: 'Intervalo QT' },
    INTERVALO_QTC: { max: 450, unit: 'ms', label: 'QTc (Bazett)' },
    EJE_QRS: { min: -30, max: 90, unit: '°', label: 'Eje QRS' },
}

// ── Transformer: de resultados_estudio → objeto interno ──
function buildFromResultados(estudio: any, resultados: any[]): any {
    const get = (name: string): any => {
        const r = resultados.find(r => r.parametro_nombre === name)
        return r?.resultado_numerico ?? r?.resultado ?? null
    }
    const num = (name: string): number | null => {
        const v = get(name)
        return v !== null ? Number(v) : null
    }

    return {
        id: estudio.id,
        fecha: estudio.fecha_estudio,
        fc: num('FC'),
        rr: num('RR'),
        onda_p: num('ONDA_P'),
        intervalo_pr: num('INTERVALO_PR'),
        complejo_qrs: num('COMPLEJO_QRS'),
        intervalo_qt: num('INTERVALO_QT'),
        intervalo_qtc: num('INTERVALO_QTC'),
        eje_p: num('EJE_P'),
        eje_qrs: num('EJE_QRS'),
        eje_t: num('EJE_T'),
        ritmo_automatico: get('RITMO_AUTOMATICO') || get('RITMO') || '',
        conduccion: get('CONDUCCION') || '',
        morfologia: get('MORFOLOGIA') || '',
        resultado_global: get('RESULTADO_GLOBAL') || estudio.diagnostico || '',
        descripcion_ritmo: get('DESCRIPCION_RITMO') || get('RITMO_DESCRIPCION') || '',
        analisis_morfologico: get('ANALISIS_MORFOLOGICO') || '',
        segmento_st: get('SEGMENTO_ST') || '',
        onda_t_desc: get('ONDA_T_DESC') || '',
        conclusion: get('CONCLUSION_ECG') || estudio.interpretacion || '',
        tipo_estudio: get('TIPO_ESTUDIO') || 'ECG en reposo',
        equipo: get('EQUIPO_ECG') || estudio.equipo || '',
        medico: get('MEDICO_RESPONSABLE') || estudio.medico_responsable || '',
        clasificacion: estudio.clasificacion ||
            ((get('RESULTADO_GLOBAL') || '').toLowerCase().includes('normal') ? 'normal' : 'con_hallazgos'),
        rawResults: resultados,
    }
}

// ── Clasificación de Ritmo ──
const classifyRhythm = (fc: number | null): { label: string; color: string; bg: string; border: string; desc: string } => {
    if (fc === null) return { label: 'Sin datos', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', desc: 'No hay datos de frecuencia cardíaca' }
    if (fc < 60) return { label: 'Bradicardia', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', desc: `FC ${fc} lpm — por debajo de 60 lpm` }
    if (fc > 100) return { label: 'Taquicardia', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', desc: `FC ${fc} lpm — por encima de 100 lpm` }
    return { label: 'Ritmo Normal', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', desc: `FC ${fc} lpm — rango sinusal normal` }
}

// ── Clasificación del Eje ──
const classifyAxis = (deg: number | null): { label: string; color: string } => {
    if (deg === null) return { label: 'Sin datos', color: 'text-slate-400' }
    if (deg >= -30 && deg <= 90) return { label: 'Normal', color: 'text-emerald-600' }
    if (deg > 90 && deg <= 180) return { label: 'Desv. Derecha', color: 'text-amber-600' }
    return { label: 'Desv. Izquierda', color: 'text-amber-600' }
}

// ── Clasificación Global ──
const classifyGlobal = (ecg: any): { pattern: string; icon: string; color: string } => {
    const global = (ecg.resultado_global || '').toLowerCase()
    if (global.includes('normal') && !global.includes('anormal')) return { pattern: 'Normal', icon: '✅', color: 'text-emerald-600' }
    if (global.includes('anormal') || global.includes('hallazgos')) return { pattern: 'Con Hallazgos', icon: '⚠️', color: 'text-amber-600' }
    // Fallback: check parameters
    const fc = ecg.fc
    if (fc && fc >= 60 && fc <= 100) return { pattern: 'Normal', icon: '✅', color: 'text-emerald-600' }
    return { pattern: 'Indeterminado', icon: '❓', color: 'text-slate-500' }
}

// ──────────────────────────────────
// ANALYTICS SECTION (matches Espirometria design)
// ──────────────────────────────────
function ECGAnalytics({ ecg }: { ecg: any }) {
    const analytics = useMemo(() => {
        const rhythm = classifyRhythm(ecg.fc)
        const axis = classifyAxis(ecg.eje_qrs)
        const global = classifyGlobal(ecg)

        // Bar chart: intervals vs reference
        const barData = [
            { name: 'FC', value: ecg.fc ?? 0, ref: 80, fill: ecg.fc && ecg.fc >= 60 && ecg.fc <= 100 ? '#10b981' : '#f59e0b' },
            { name: 'PR', value: ecg.intervalo_pr ?? 0, ref: 160, fill: ecg.intervalo_pr && ecg.intervalo_pr >= 120 && ecg.intervalo_pr <= 200 ? '#10b981' : '#f59e0b' },
            { name: 'QRS', value: ecg.complejo_qrs ?? 0, ref: 80, fill: ecg.complejo_qrs && ecg.complejo_qrs >= 60 && ecg.complejo_qrs <= 100 ? '#10b981' : '#f59e0b' },
            { name: 'QTc', value: ecg.intervalo_qtc ?? 0, ref: 400, fill: ecg.intervalo_qtc && ecg.intervalo_qtc <= 450 ? '#10b981' : '#f59e0b' },
        ]

        // Radar chart: normalized percentages
        const normalize = (val: number | null, min: number, max: number) => {
            if (val === null) return 0
            const mid = (min + max) / 2
            const range = max - min
            return Math.max(0, Math.min(100, 50 + ((val - mid) / range) * 100))
        }
        const radarData = [
            { param: 'FC', value: normalize(ecg.fc, 60, 100), fullMark: 100 },
            { param: 'PR', value: normalize(ecg.intervalo_pr, 120, 200), fullMark: 100 },
            { param: 'QRS', value: normalize(ecg.complejo_qrs, 60, 100), fullMark: 100 },
            { param: 'QTc', value: normalize(ecg.intervalo_qtc, 350, 450), fullMark: 100 },
            { param: 'Eje', value: normalize(ecg.eje_qrs, -30, 90), fullMark: 100 },
        ]

        // Detailed parameters table
        const params = [
            { name: 'Frecuencia Cardíaca', key: 'FC', value: ecg.fc, unit: 'lpm', ref: '60–100' },
            { name: 'Onda P', key: 'ONDA_P', value: ecg.onda_p, unit: 'ms', ref: '80–120' },
            { name: 'Intervalo PR', key: 'INTERVALO_PR', value: ecg.intervalo_pr, unit: 'ms', ref: '120–200' },
            { name: 'Complejo QRS', key: 'COMPLEJO_QRS', value: ecg.complejo_qrs, unit: 'ms', ref: '60–100' },
            { name: 'Intervalo QT', key: 'INTERVALO_QT', value: ecg.intervalo_qt, unit: 'ms', ref: '350–450' },
            { name: 'QTc (Bazett)', key: 'INTERVALO_QTC', value: ecg.intervalo_qtc, unit: 'ms', ref: '< 450' },
            { name: 'Eje QRS', key: 'EJE_QRS', value: ecg.eje_qrs, unit: '°', ref: '-30 a +90' },
            { name: 'Eje P', key: 'EJE_P', value: ecg.eje_p, unit: '°', ref: '0 a +75' },
            { name: 'Eje T', key: 'EJE_T', value: ecg.eje_t, unit: '°', ref: '' },
        ].filter(p => p.value !== null)

        return { rhythm, axis, global, barData, radarData, params }
    }, [ecg])

    const { rhythm, axis, global, barData, radarData, params } = analytics

    const isParamLow = (key: string, val: number | null): boolean => {
        if (val === null) return false
        const ref = ECG_REFS[key]
        if (!ref) return false
        if (ref.min !== undefined && val < ref.min) return true
        if (ref.max !== undefined && val > ref.max) return true
        return false
    }

    return (
        <div className="space-y-6">
            {/* Section header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg">
                    <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-800">Análisis Clínico</h3>
                    <p className="text-xs text-slate-400 font-medium">Interpretación automática de parámetros electrocardiográficos</p>
                </div>
            </div>

            {/* KPI Cards — same style as Espirometria */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Freq. Cardíaca</p>
                    <p className="text-3xl font-black text-slate-800">
                        {ecg.fc ?? '—'}
                        <span className="text-sm font-bold text-slate-400 ml-1">lpm</span>
                    </p>
                    <p className={`text-xs font-bold mt-1 ${ecg.fc && ecg.fc >= 60 && ecg.fc <= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {ecg.fc && ecg.fc >= 60 && ecg.fc <= 100 ? '✅ Normal' : ecg.fc ? '⚠️ Fuera de rango' : '—'}
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Intervalo PR</p>
                    <p className="text-3xl font-black text-slate-800">
                        {ecg.intervalo_pr ?? '—'}
                        <span className="text-sm font-bold text-slate-400 ml-1">ms</span>
                    </p>
                    <p className={`text-xs font-bold mt-1 ${ecg.intervalo_pr && ecg.intervalo_pr >= 120 && ecg.intervalo_pr <= 200 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {ecg.intervalo_pr && ecg.intervalo_pr >= 120 && ecg.intervalo_pr <= 200 ? '✅ Normal' : ecg.intervalo_pr ? '⚠️ Anormal' : '—'}
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Complejo QRS</p>
                    <p className="text-3xl font-black text-slate-800">
                        {ecg.complejo_qrs ?? '—'}
                        <span className="text-sm font-bold text-slate-400 ml-1">ms</span>
                    </p>
                    <p className={`text-xs font-bold mt-1 ${ecg.complejo_qrs && ecg.complejo_qrs >= 60 && ecg.complejo_qrs <= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {ecg.complejo_qrs && ecg.complejo_qrs >= 60 && ecg.complejo_qrs <= 100 ? '✅ Normal' : ecg.complejo_qrs ? '⚠️ Anormal' : '—'}
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">QTc (Bazett)</p>
                    <p className="text-3xl font-black text-slate-800">
                        {ecg.intervalo_qtc ?? '—'}
                        <span className="text-sm font-bold text-slate-400 ml-1">ms</span>
                    </p>
                    <p className={`text-xs font-bold mt-1 ${ecg.intervalo_qtc && ecg.intervalo_qtc <= 450 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {ecg.intervalo_qtc && ecg.intervalo_qtc <= 450 ? '✅ Normal' : ecg.intervalo_qtc ? '⚠️ Prolongado' : '—'}
                    </p>
                </div>
            </div>

            {/* Classification Cards: Rhythm + Global + Axis — same layout as Espirometria GOLD/Pattern/Risk */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Rhythm Classification */}
                <div className={`rounded-2xl border p-5 ${rhythm.bg} ${rhythm.border}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-5 h-5 text-slate-600" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Clasificación Rítmica</p>
                    </div>
                    <p className={`text-xl font-black ${rhythm.color}`}>{rhythm.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{rhythm.desc}</p>
                </div>

                {/* Global Result */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-slate-600" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Resultado Global</p>
                    </div>
                    <p className={`text-xl font-black ${global.color}`}>
                        {global.icon} {global.pattern}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        {ecg.resultado_global || 'Basado en parámetros extraídos'}
                    </p>
                </div>

                {/* Axis + Conduction */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Heart className="w-5 h-5 text-slate-600" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Vectores Eléctricos</p>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600">Eje QRS</span>
                            <span className={`font-bold ${axis.color}`}>{ecg.eje_qrs !== null ? `${ecg.eje_qrs}°` : '—'} ({axis.label})</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600">Eje P</span>
                            <span className="font-bold text-slate-700">{ecg.eje_p !== null ? `${ecg.eje_p}°` : '—'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600">Eje T</span>
                            <span className="font-bold text-slate-700">{ecg.eje_t !== null ? `${ecg.eje_t}°` : '—'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600">Ritmo</span>
                            <span className="font-bold text-slate-700">{ecg.ritmo_automatico || '—'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts — same grid as Espirometria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bar Chart: Intervals */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <h4 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-rose-500" />
                        Intervalos Cardíacos
                    </h4>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" tick={{ fontSize: 11 }} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} />
                                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
                                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                                    {barData.map((entry, idx) => (
                                        <Cell key={idx} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Radar Chart */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <h4 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-indigo-500" />
                        Perfil Cardíaco (Radar)
                    </h4>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart outerRadius={70} data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="param" tick={{ fontSize: 11, fontWeight: 600 }} />
                                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                                <Radar name="Paciente" dataKey="value" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} strokeWidth={2} />
                                <Radar name="Normal (50%)" dataKey="fullMark" stroke="#10b981" fill="#10b981" fillOpacity={0.05} strokeWidth={1} strokeDasharray="4 4" />
                                <Legend wrapperStyle={{ fontSize: 10 }} />
                                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Rhythm Visualizer — ECG waveform strip */}
            <div className="bg-slate-950 rounded-2xl p-5 overflow-hidden relative border border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 rounded-full border border-rose-500/20">
                        <motion.div className="w-2 h-2 rounded-full bg-rose-500"
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: ecg.fc ? 60 / ecg.fc : 0.8, repeat: Infinity }} />
                        <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">
                            {ecg.fc ?? '—'} lpm
                        </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {ecg.fc && ecg.fc > 100 ? 'Taquicárdico' : ecg.fc && ecg.fc < 60 ? 'Bradicárdico' : 'Sinusal Normal'}
                    </span>
                </div>
                <svg viewBox="0 0 500 60" className="w-full opacity-80">
                    <defs>
                        <linearGradient id="ecgLine" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.1" />
                            <stop offset="50%" stopColor="#f43f5e" stopOpacity="1" />
                            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.1" />
                        </linearGradient>
                    </defs>
                    {[...Array(20)].map((_, i) => <line key={`v${i}`} x1={i * 25} y1="0" x2={i * 25} y2="60" stroke="#1e293b" strokeWidth="0.5" />)}
                    {[...Array(3)].map((_, i) => <line key={`h${i}`} x1="0" y1={i * 20} x2="500" y2={i * 20} stroke="#1e293b" strokeWidth="0.5" />)}
                    <motion.path
                        d={[0, 125, 250, 375].map(x => {
                            const m = 30
                            return `M ${x} ${m} L ${x + 25} ${m} L ${x + 31} ${m + 6} L ${x + 44} ${m - 2} L ${x + 50} ${m - 28} L ${x + 54} ${m + 10} L ${x + 60} ${m} L ${x + 69} ${m - 6} L ${x + 81} ${m} L ${x + 125} ${m}`
                        }).join(' ')}
                        fill="none" stroke="url(#ecgLine)" strokeWidth="2" strokeLinecap="round"
                        animate={{ x: [0, -125] }}
                        transition={{ duration: ecg.fc ? 60 / ecg.fc : 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                </svg>
            </div>

            {/* Detailed Parameters Table — same style as Espirometria */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm overflow-x-auto">
                <h4 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                    <Table2 className="w-4 h-4 text-slate-500" />
                    Tabla Detallada de Parámetros
                </h4>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b-2 border-slate-200">
                            <th className="text-left py-2 px-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Parámetro</th>
                            <th className="text-right py-2 px-2 text-[10px] font-black uppercase tracking-wider text-blue-600">Valor</th>
                            <th className="text-right py-2 px-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Unidad</th>
                            <th className="text-right py-2 px-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Referencia</th>
                            <th className="text-center py-2 px-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {params.map((row, idx) => {
                            const low = isParamLow(row.key, row.value)
                            return (
                                <tr key={idx} className={`border-b border-slate-100 ${low ? 'bg-red-50/50' : 'hover:bg-slate-50'}`}>
                                    <td className="py-2 px-2 font-semibold text-slate-700">{row.name}</td>
                                    <td className="py-2 px-2 text-right font-bold text-blue-700">{row.value}</td>
                                    <td className="py-2 px-2 text-right text-slate-500">{row.unit}</td>
                                    <td className="py-2 px-2 text-right text-slate-500">{row.ref}</td>
                                    <td className="py-2 px-2 text-center">
                                        {low ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">⚠️ Anormal</span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">✅ Normal</span>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* AI Interpretation — same style as Espirometria doctor notes */}
            {(ecg.conclusion || ecg.descripcion_ritmo || ecg.analisis_morfologico) && (
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl border border-rose-200 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-5 h-5 text-rose-600" />
                        <p className="text-xs font-black uppercase tracking-widest text-rose-600">Interpretación Médica</p>
                    </div>
                    <div className="space-y-3">
                        {ecg.descripcion_ritmo && (
                            <div>
                                <p className="text-[10px] font-black uppercase text-rose-400 mb-1">Ritmo</p>
                                <p className="text-sm text-rose-900 font-medium leading-relaxed">{ecg.descripcion_ritmo}</p>
                            </div>
                        )}
                        {ecg.analisis_morfologico && (
                            <div>
                                <p className="text-[10px] font-black uppercase text-rose-400 mb-1">Morfología</p>
                                <p className="text-sm text-rose-900 font-medium leading-relaxed">{ecg.analisis_morfologico}</p>
                            </div>
                        )}
                        {ecg.conclusion && (
                            <div>
                                <p className="text-[10px] font-black uppercase text-rose-400 mb-1">Conclusión</p>
                                <p className="text-sm text-rose-900 font-medium leading-relaxed">{ecg.conclusion}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Rhythm Strip Visualizer (compact, for scanner tab) ──
function RhythmStrip({ ecg }: { ecg: any }) {
    const bpm = ecg.fc || 75

    return (
        <div className="bg-slate-950 rounded-2xl p-5 overflow-hidden relative border border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 rounded-full border border-rose-500/20">
                    <motion.div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                        animate={{ opacity: [1, 0.3, 1], scale: [1, 1.15, 1] }}
                        transition={{ duration: 60 / bpm, repeat: Infinity }} />
                    <span className="text-[11px] font-black text-rose-400 uppercase tracking-widest">
                        {bpm} lpm
                    </span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Ritmo {bpm > 100 ? 'Taquicárdico' : bpm < 60 ? 'Bradicárdico' : 'Sinusal Normal'}
                </span>
            </div>
            <svg viewBox="0 0 500 70" className="w-full opacity-80 filter drop-shadow-[0_0_6px_rgba(244,63,94,0.2)]">
                <defs>
                    <linearGradient id="ecgGradScanner" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0" />
                        <stop offset="50%" stopColor="#f43f5e" stopOpacity="1" />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {[...Array(20)].map((_, i) => <line key={`v${i}`} x1={i * 25} y1="0" x2={i * 25} y2="70" stroke="#1e293b" strokeWidth="0.5" />)}
                {[...Array(4)].map((_, i) => <line key={`h${i}`} x1="0" y1={i * 17.5} x2="500" y2={i * 17.5} stroke="#1e293b" strokeWidth="0.5" />)}
                <motion.path
                    d={[0, 125, 250, 375].map(x => {
                        const m = 35
                        return `M ${x} ${m} L ${x + 25} ${m} L ${x + 31} ${m + 7} L ${x + 44} ${m - 2} L ${x + 50} ${m - 32} L ${x + 54} ${m + 12} L ${x + 60} ${m} L ${x + 69} ${m - 7} L ${x + 81} ${m} L ${x + 125} ${m}`
                    }).join(' ')}
                    fill="none" stroke="url(#ecgGradScanner)" strokeWidth="2.5" strokeLinecap="round"
                    animate={{ x: [0, -125] }}
                    transition={{ duration: 60 / bpm, repeat: Infinity, ease: 'linear' }}
                />
            </svg>
        </div>
    )
}

// ── Scanner View: extracted data display (no file viewer) ──
function ECGScannerView({ ecg }: { ecg: any }) {
    const isNormal = (ecg.resultado_global || '').toLowerCase().includes('normal')

    return (
        <div className="space-y-5">
            {/* Rhythm strip */}
            <RhythmStrip ecg={ecg} />

            {/* Parameters Grid — clean KPI style */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Freq. Cardíaca', value: ecg.fc, unit: 'lpm', min: 60, max: 100 },
                    { label: 'Intervalo PR', value: ecg.intervalo_pr, unit: 'ms', min: 120, max: 200 },
                    { label: 'Complejo QRS', value: ecg.complejo_qrs, unit: 'ms', min: 60, max: 100 },
                    { label: 'QTc (Bazett)', value: ecg.intervalo_qtc, unit: 'ms', min: 350, max: 450 },
                ].map((p, i) => {
                    const isWarn = p.value !== null && (p.value < p.min || p.value > p.max)
                    return (
                        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{p.label}</p>
                            <p className="text-3xl font-black text-slate-800">
                                {p.value ?? '—'}
                                <span className="text-sm font-bold text-slate-400 ml-1">{p.unit}</span>
                            </p>
                            <p className={`text-xs font-bold mt-1 ${p.value === null ? 'text-slate-400' : isWarn ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {p.value === null ? '—' : isWarn ? '⚠️ Fuera de rango' : '✅ Normal'}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">Ref: {p.min}–{p.max} {p.unit}</p>
                        </div>
                    )
                })}
            </div>

            {/* Interpretation narrative */}
            {(ecg.descripcion_ritmo || ecg.analisis_morfologico || ecg.conclusion) && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reporte de Interpretación Médica</p>
                    {ecg.descripcion_ritmo && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Ritmo Cardiaco</p>
                            <p className="text-sm text-slate-700 leading-relaxed">{ecg.descripcion_ritmo}</p>
                        </div>
                    )}
                    {ecg.analisis_morfologico && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Análisis Morfológico</p>
                            <p className="text-sm text-slate-700 leading-relaxed">{ecg.analisis_morfologico}</p>
                        </div>
                    )}
                    {ecg.segmento_st && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Segmento ST</p>
                            <p className="text-sm text-slate-700 leading-relaxed">{ecg.segmento_st}</p>
                        </div>
                    )}
                    {ecg.conclusion && (
                        <div className={`p-4 rounded-xl border ${isNormal ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                            <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isNormal ? 'text-emerald-500' : 'text-amber-500'}`}>Conclusión</p>
                            <p className={`text-sm font-medium leading-relaxed ${isNormal ? 'text-emerald-800' : 'text-amber-800'}`}>{ecg.conclusion}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Study metadata */}
            {(ecg.medico || ecg.equipo || ecg.tipo_estudio) && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Datos del Estudio</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {ecg.medico && <div><p className="text-slate-400 text-xs">Médico</p><p className="font-bold text-slate-700">{ecg.medico}</p></div>}
                        {ecg.equipo && <div><p className="text-slate-400 text-xs">Equipo</p><p className="font-bold text-slate-700">{ecg.equipo}</p></div>}
                        {ecg.tipo_estudio && <div><p className="text-slate-400 text-xs">Tipo</p><p className="font-bold text-slate-700">{ecg.tipo_estudio}</p></div>}
                        {ecg.fecha && <div><p className="text-slate-400 text-xs">Fecha</p><p className="font-bold text-slate-700">{ecg.fecha}</p></div>}
                    </div>
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function ElectrocardiogramaTab({ pacienteId, paciente }: { pacienteId: string; paciente?: any }) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [estudios, setEstudios] = useState<any[]>([])
    const [activeView, setActiveView] = useState<'scanner' | 'analisis'>('scanner')
    const [selectedIdx, setSelectedIdx] = useState(0)

    const currentEcg = estudios[selectedIdx] || {}
    const isNormalEcg = currentEcg.resultado_global?.toLowerCase().includes('normal') || (currentEcg.fc && currentEcg.fc >= 60 && currentEcg.fc <= 100)

    useEffect(() => { if (pacienteId) loadECG() }, [pacienteId])

    const loadECG = async () => {
        setLoading(true)
        try {
            const all: any[] = []

            // Source 1: unified architecture
            const { data: estudiosDB } = await supabase
                .from('estudios_clinicos').select('*')
                .eq('paciente_id', pacienteId)
                .in('tipo_estudio', ['ecg', 'electrocardiograma'])
                .order('fecha_estudio', { ascending: false }).limit(5)

            if (estudiosDB && estudiosDB.length > 0) {
                for (const est of estudiosDB) {
                    const { data: resultados } = await supabase
                        .from('resultados_estudio').select('*').eq('estudio_id', est.id)
                    if (resultados && resultados.length > 0) {
                        all.push(buildFromResultados(est, resultados))
                    }
                }
            }

            // Source 2: legacy service
            if (all.length === 0) {
                try {
                    const { electrocardiogramaService } = await import('@/services/electrocardiogramaService')
                    const legacyData = await electrocardiogramaService.listar({ paciente_id: pacienteId })
                    for (const ecg of legacyData) {
                        all.push({
                            id: ecg.id,
                            fecha: ecg.fecha_estudio,
                            fc: ecg.frecuencia_cardiaca,
                            rr: null, onda_p: null,
                            intervalo_pr: ecg.intervalo_pr,
                            complejo_qrs: ecg.complejo_qrs,
                            intervalo_qt: ecg.intervalo_qt,
                            intervalo_qtc: ecg.intervalo_qtc,
                            eje_p: null, eje_qrs: ecg.eje_qrs, eje_t: null,
                            ritmo_automatico: ecg.ritmo,
                            resultado_global: ecg.clasificacion,
                            conclusion: ecg.hallazgos,
                            analisis_morfologico: ecg.onda_t ? `Onda T: ${ecg.onda_t}. ST: ${ecg.segmento_st || 'sin alteraciones'}` : '',
                            segmento_st: ecg.segmento_st,
                            medico: ecg.realizado_por,
                            clasificacion: ecg.clasificacion,
                        })
                    }
                } catch (legacyErr) {
                    console.warn('Legacy ECG service unavailable:', legacyErr)
                }
            }

            setEstudios(all)
        } catch (e) {
            console.error('ECG loadError:', e)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!currentEcg.id) return
        if (!window.confirm('¿Eliminar este electrocardiograma? Esta acción no se puede deshacer.')) return

        setLoading(true)
        try {
            await supabase.from('resultados_estudio').delete().eq('estudio_id', currentEcg.id)
            const { error } = await supabase.from('estudios_clinicos').delete().eq('id', currentEcg.id)
            if (error) throw error
            await supabase.from('electrocardiogramas').delete().eq('id', currentEcg.id)
            setEstudios(prev => prev.filter(e => e.id !== currentEcg.id))
            setSelectedIdx(0)
            alert('Estudio eliminado con éxito')
        } catch (err: any) {
            console.error('Error eliminando ECG:', err)
            alert('No se pudo eliminar: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    // ── Loading ──
    if (loading) return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                <HeartPulse className="w-8 h-8 text-rose-500" />
            </motion.div>
            <p className="text-slate-400 text-xs font-medium">Cargando electrocardiograma...</p>
        </div>
    )

    // ── No data → Upload CTA ──
    if (estudios.length === 0) return (
        <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <HeartPulse className="w-8 h-8 text-rose-300" />
                </div>
                <h3 className="text-slate-800 font-bold text-lg">Sin registros de electrocardiograma</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2 mb-8">
                    Sube el PDF del reporte de ECG y la IA extraerá automáticamente
                    todos los parámetros cardíacos para generar la réplica digital completa.
                </p>
                <EstudioUploadReview pacienteId={pacienteId} tipoEstudio="ecg" onSaved={loadECG} />
                <p className="text-[10px] text-slate-400 mt-6">
                    Powered by Gemini Pro — Extracción completa de intervalos, ejes y diagnóstico
                </p>
            </CardContent>
        </Card>
    )

    // ── With data → Header + Tabs + Content (mirrors EspirometriaTab exactly) ──
    return (
        <div className="space-y-5">

            {/* Header — same style as Espirometria */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-200">
                            <HeartPulse className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Electrocardiograma</h3>
                            <p className="text-xs text-slate-400 font-medium">
                                {currentEcg.medico || 'GP Medical Health'} — {currentEcg.fecha || ''}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDelete}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            title="Eliminar estudio"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>

                        {/* Result badge */}
                        <div className={`px-4 py-2 rounded-xl ${isNormalEcg ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Interpretación</p>
                            <p className={`text-sm font-bold ${isNormalEcg ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {currentEcg.resultado_global || (isNormalEcg ? 'Normal' : 'Con hallazgos')}
                            </p>
                        </div>

                        {/* Upload new */}
                        <EstudioUploadReview pacienteId={pacienteId} tipoEstudio="ecg" onSaved={loadECG} isCompact />
                    </div>
                </div>

                {/* Conclusion note */}
                {currentEcg.conclusion && (
                    <div className={`mt-4 flex items-start gap-3 p-3 rounded-xl ${isNormalEcg ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
                        <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isNormalEcg ? 'text-emerald-600' : 'text-amber-600'}`} />
                        <p className={`text-sm font-medium ${isNormalEcg ? 'text-emerald-700' : 'text-amber-700'}`}>{currentEcg.conclusion}</p>
                    </div>
                )}
            </div>

            {/* Study Selector (when multiple) */}
            {estudios.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {estudios.map((e, i) => (
                        <button
                            key={e.id || i}
                            onClick={() => setSelectedIdx(i)}
                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${i === selectedIdx
                                ? 'bg-rose-500 text-white shadow-lg shadow-rose-200'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-rose-200'
                            }`}
                        >
                            {e.fecha ? new Date(e.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : `Estudio ${i + 1}`}
                        </button>
                    ))}
                </div>
            )}

            {/* Tabs — same style as Espirometria */}
            <div className="flex bg-slate-100 p-1.5 rounded-xl w-fit">
                <button
                    onClick={() => setActiveView('scanner')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeView === 'scanner'
                        ? 'bg-white text-rose-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                >
                    <HeartPulse className="w-4 h-4" />
                    Datos Extraídos
                </button>
                <button
                    onClick={() => setActiveView('analisis')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeView === 'analisis'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                >
                    <Activity className="w-4 h-4" />
                    Análisis Clínico
                </button>
            </div>

            {/* Content */}
            {activeView === 'scanner' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <ECGScannerView ecg={currentEcg} />
                </div>
            )}

            {activeView === 'analisis' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <ECGAnalytics ecg={currentEcg} />
                </div>
            )}

            {/* Documents — same as Espirometria */}
            <DocumentosAdjuntos
                pacienteId={pacienteId}
                categoria="electrocardiograma"
                titulo="Reporte Original ECG"
                collapsedByDefault={false}
            />
        </div>
    )
}
