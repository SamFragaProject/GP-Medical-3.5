/**
 * PatientDashboardTab — Dashboard Clínico Ejecutivo con Datos Reales
 *
 * DESIGN: Premium glassmorphism medical dashboard
 * DATA: Multi-source (estudios_clinicos, pacientes.laboratorio JSONB, legacy tables)
 * ALERTS: Calculated from RANGOS_REF (same logic as LaboratorioTab)
 * ANALYSIS: eGFR (CKD-EPI), IMC, Col/HDL, LDL (Friedewald), Glucosa, TA
 */
import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Activity, Ear, Wind, Heart, FlaskConical, Eye, Bone,
    AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown,
    Loader2, Shield, Sparkles, Minus, ArrowRight, ChevronRight,
    Thermometer, Calculator, Brain, Gauge, Droplets, Beaker, Zap
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { getUltimoEstudioCompleto, getEstudios, type EstudioCompleto, type Bandera, BANDERA_STYLES } from '@/services/estudiosService'

// ── RANGOS DE REFERENCIA (mismos que LaboratorioTab) ──
const RANGOS_REF: Record<string, { min: number; max: number; unidad: string; label: string; grupo: string }> = {
    hemoglobina: { min: 13, max: 17.5, unidad: 'g/dL', label: 'Hemoglobina', grupo: 'Biometría Hemática' },
    hematocrito: { min: 38, max: 52, unidad: '%', label: 'Hematocrito', grupo: 'Biometría Hemática' },
    leucocitos: { min: 4500, max: 11000, unidad: '/µL', label: 'Leucocitos', grupo: 'Biometría Hemática' },
    eritrocitos: { min: 4.2, max: 5.8, unidad: 'M/µL', label: 'Eritrocitos', grupo: 'Biometría Hemática' },
    plaquetas: { min: 150000, max: 400000, unidad: '/µL', label: 'Plaquetas', grupo: 'Biometría Hemática' },
    vcm: { min: 80, max: 100, unidad: 'fL', label: 'VCM', grupo: 'Biometría Hemática' },
    hcm: { min: 27, max: 33, unidad: 'pg', label: 'HCM', grupo: 'Biometría Hemática' },
    cmhc: { min: 32, max: 36, unidad: 'g/dL', label: 'CMHC', grupo: 'Biometría Hemática' },
    neutrofilos_totales: { min: 40, max: 70, unidad: '%', label: 'Neutrófilos', grupo: 'Fórmula Blanca' },
    linfocitos: { min: 20, max: 45, unidad: '%', label: 'Linfocitos', grupo: 'Fórmula Blanca' },
    monocitos: { min: 2, max: 10, unidad: '%', label: 'Monocitos', grupo: 'Fórmula Blanca' },
    eosinofilos: { min: 0, max: 5, unidad: '%', label: 'Eosinófilos', grupo: 'Fórmula Blanca' },
    basofilos: { min: 0, max: 2, unidad: '%', label: 'Basófilos', grupo: 'Fórmula Blanca' },
    vpm: { min: 7, max: 12, unidad: 'fL', label: 'VPM', grupo: 'Biometría Hemática' },
    rdw_cv: { min: 11.5, max: 14.5, unidad: '%', label: 'RDW-CV', grupo: 'Biometría Hemática' },
    glucosa: { min: 70, max: 100, unidad: 'mg/dL', label: 'Glucosa', grupo: 'Química Sanguínea' },
    urea: { min: 15, max: 45, unidad: 'mg/dL', label: 'Urea', grupo: 'Química Sanguínea' },
    bun: { min: 7, max: 20, unidad: 'mg/dL', label: 'BUN', grupo: 'Química Sanguínea' },
    creatinina: { min: 0.7, max: 1.3, unidad: 'mg/dL', label: 'Creatinina', grupo: 'Química Sanguínea' },
    acido_urico: { min: 2.4, max: 7, unidad: 'mg/dL', label: 'Ácido Úrico', grupo: 'Química Sanguínea' },
    colesterol_total: { min: 0, max: 200, unidad: 'mg/dL', label: 'Colesterol Total', grupo: 'Perfil Lipídico' },
    trigliceridos: { min: 0, max: 150, unidad: 'mg/dL', label: 'Triglicéridos', grupo: 'Perfil Lipídico' },
    hdl: { min: 40, max: 300, unidad: 'mg/dL', label: 'HDL', grupo: 'Perfil Lipídico' },
    ldl: { min: 0, max: 130, unidad: 'mg/dL', label: 'LDL', grupo: 'Perfil Lipídico' },
    hgm: { min: 27, max: 33, unidad: 'pg', label: 'HGM', grupo: 'Biometría Hemática' },
}

// ── STATUS STYLES (premium) ──
const STATUS = {
    ok: { bg: 'bg-emerald-500', ring: 'ring-emerald-300/50', text: 'text-emerald-400', bgCard: 'from-emerald-500/10 to-emerald-600/5', border: 'border-emerald-500/20', label: 'Normal' },
    warning: { bg: 'bg-amber-500', ring: 'ring-amber-300/50', text: 'text-amber-400', bgCard: 'from-amber-500/10 to-amber-600/5', border: 'border-amber-500/20', label: 'Precaución' },
    alert: { bg: 'bg-orange-500', ring: 'ring-orange-300/50', text: 'text-orange-400', bgCard: 'from-orange-500/10 to-orange-600/5', border: 'border-orange-500/20', label: 'Alerta' },
    critical: { bg: 'bg-red-500', ring: 'ring-red-300/50', text: 'text-red-400', bgCard: 'from-red-500/10 to-red-600/5', border: 'border-red-500/20', label: 'Crítico' },
    pending: { bg: 'bg-slate-400', ring: 'ring-slate-300/30', text: 'text-slate-400', bgCard: 'from-slate-500/5 to-slate-600/5', border: 'border-slate-500/10', label: 'Sin datos' },
}

const STUDY_TYPES = [
    { key: 'laboratorio', label: 'Labs', icon: FlaskConical, color: 'from-teal-400 to-emerald-500' },
    { key: 'audiometria', label: 'Audiometría', icon: Ear, color: 'from-violet-400 to-purple-500' },
    { key: 'espirometria', label: 'Espirometría', icon: Wind, color: 'from-sky-400 to-blue-500' },
    { key: 'ecg', label: 'ECG', icon: Heart, color: 'from-rose-400 to-pink-500' },
    { key: 'radiografia', label: 'Radiografía', icon: Bone, color: 'from-amber-400 to-orange-500' },
    { key: 'optometria', label: 'Optometría', icon: Eye, color: 'from-cyan-400 to-blue-500' },
]

// ── Types ──
interface AlertItem { level: Bandera; parametro: string; valor: string; unidad: string; tipo: string }
interface ClinicalMetric { key: string; label: string; value: string | number; unit: string; interpretation: string; status: 'ok' | 'warning' | 'alert' | 'critical'; icon: any; formula?: string }

// ── HELPERS ──
function findLabValue(results: any[], ...names: string[]): number | null {
    for (const name of names) {
        const found = results.find((r: any) => {
            const pName = (r.parametro_nombre || r.nombre_display || r.parametro || r.label || '').toLowerCase()
            return pName.includes(name.toLowerCase())
        })
        if (found) {
            const num = found.resultado_numerico ?? parseFloat(String(found.resultado || found.value || '0').replace(/,/g, ''))
            if (!isNaN(num)) return num
        }
    }
    return null
}

function processJsonbWithRangos(lab: Record<string, any>): any[] {
    const results: any[] = []
    for (const [key, value] of Object.entries(lab)) {
        if (value === null || value === undefined || value === 0 || value === '') continue
        const ref = RANGOS_REF[key]
        if (ref) {
            const numVal = typeof value === 'number' ? value : parseFloat(String(value))
            if (isNaN(numVal)) continue
            const bandera: Bandera = numVal < ref.min ? 'bajo' : numVal > ref.max ? 'alto' : 'normal'
            results.push({
                parametro_nombre: ref.label, nombre_display: ref.label,
                resultado: String(numVal), resultado_numerico: numVal,
                unidad: ref.unidad, bandera,
                rango_ref_min: ref.min, rango_ref_max: ref.max,
            })
        }
    }
    return results
}

function calcIMC(peso: number, talla: number): { v: number; c: string; s: ClinicalMetric['status'] } {
    const t = talla > 3 ? talla / 100 : talla
    const imc = peso / (t * t)
    if (imc < 18.5) return { v: Math.round(imc * 10) / 10, c: 'Bajo peso', s: 'warning' }
    if (imc < 25) return { v: Math.round(imc * 10) / 10, c: 'Normal', s: 'ok' }
    if (imc < 30) return { v: Math.round(imc * 10) / 10, c: 'Sobrepeso', s: 'warning' }
    if (imc < 35) return { v: Math.round(imc * 10) / 10, c: 'Obesidad I', s: 'alert' }
    return { v: Math.round(imc * 10) / 10, c: 'Obesidad II+', s: 'critical' }
}

function calcEGFR(cr: number, edad: number, fem: boolean): { v: number; e: string; s: ClinicalMetric['status'] } {
    const k = fem ? 0.7 : 0.9, a = fem ? -0.329 : -0.411, sf = fem ? 1.018 : 1.0
    const r = cr / k
    const egfr = Math.round(141 * Math.pow(Math.min(r, 1), a) * Math.pow(Math.max(r, 1), -1.209) * Math.pow(0.993, edad) * sf)
    if (egfr >= 90) return { v: egfr, e: 'G1 Normal', s: 'ok' }
    if (egfr >= 60) return { v: egfr, e: 'G2 Leve ↓', s: 'warning' }
    if (egfr >= 30) return { v: egfr, e: 'G3 Moderada', s: 'alert' }
    return { v: egfr, e: 'G4-G5 Severa', s: 'critical' }
}

// ── BAR INDICATOR (premium animated) ──
function BarIndicator({ value, min, max, unit, label, bandera }: {
    value: number; min?: number | null; max?: number | null; unit: string; label: string; bandera: string
}) {
    const isAbnormal = bandera !== 'normal'
    const rangeMin = min ?? 0, rangeMax = max ?? (value * 1.5)
    const range = rangeMax - rangeMin
    const totalMin = rangeMin - range * 0.3, totalMax = rangeMax + range * 0.3
    const totalRange = totalMax - totalMin
    const pos = totalRange > 0 ? Math.max(0, Math.min(100, ((value - totalMin) / totalRange) * 100)) : 50
    const refLeft = totalRange > 0 ? Math.max(0, ((rangeMin - totalMin) / totalRange) * 100) : 20
    const refWidth = totalRange > 0 ? Math.max(0, ((rangeMax - rangeMin) / totalRange) * 100) : 60
    const dotColor = isAbnormal ? '#fbbf24' : '#34d399'

    return (
        <div className="flex items-center gap-3 py-2 group hover:bg-white/5 rounded-lg px-2 -mx-2 transition-colors">
            <span className={`text-[11px] font-bold w-28 truncate ${isAbnormal ? 'text-amber-300' : 'text-slate-300'}`}>{label}</span>
            <div className="flex-1 h-3 bg-slate-700/60 rounded-full relative overflow-hidden">
                {/* Normal range zone */}
                <div className="absolute h-full bg-emerald-500/15 rounded-full" style={{ left: `${refLeft}%`, width: `${refWidth}%` }} />
                {/* Animated fill bar */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pos}%` }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                    className={`absolute top-0 h-full rounded-full ${isAbnormal ? 'bg-gradient-to-r from-amber-500/30 to-amber-400/50' : 'bg-gradient-to-r from-emerald-500/20 to-emerald-400/40'}`}
                />
                {/* Indicator dot */}
                <motion.div
                    initial={{ left: '0%', opacity: 0 }}
                    animate={{ left: `${pos}%`, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-lg -ml-1.5"
                    style={{ backgroundColor: dotColor, boxShadow: `0 0 8px ${dotColor}80` }}
                />
            </div>
            <span className={`text-[11px] font-black tabular-nums w-20 text-right ${isAbnormal ? 'text-amber-300' : 'text-emerald-300'}`}>
                {value} <span className="text-[8px] text-slate-500 font-medium">{unit}</span>
            </span>
        </div>
    )
}

// ══════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════
export default function PatientDashboardTab({ pacienteId, onNavigate }: { pacienteId: string; onNavigate?: (tab: string) => void }) {
    const [loading, setLoading] = useState(true)
    const [labResults, setLabResults] = useState<any[]>([])
    const [labFecha, setLabFecha] = useState<string | null>(null)
    const [audioData, setAudioData] = useState<any>(null)
    const [spiroData, setSpiroData] = useState<any>(null)
    const [ecgData, setEcgData] = useState<any>(null)
    const [rxData, setRxData] = useState<any>(null)
    const [optoData, setOptoData] = useState<any>(null)
    const [signosVitales, setSV] = useState<any>(null)
    const [paciente, setPaciente] = useState<any>(null)

    useEffect(() => { load() }, [pacienteId])

    async function load() {
        setLoading(true)
        try {
            // Helper: query estudios_clinicos with multiple tipo_estudio variants
            const getEstudioMulti = async (tipos: string[]) => {
                const { data } = await supabase.from('estudios_clinicos').select('*').eq('paciente_id', pacienteId).in('tipo_estudio', tipos).order('fecha_estudio', { ascending: false }).limit(1)
                if (!data || data.length === 0) return null
                const est = data[0]
                const [resRes, grafRes] = await Promise.all([
                    supabase.from('resultados_estudio').select('*').eq('estudio_id', est.id).order('created_at'),
                    supabase.from('graficas_estudio').select('*').eq('estudio_id', est.id),
                ])
                return { estudio: est, resultados: resRes.data || [], graficas: grafRes.data || [] }
            }

            const [pacRes, newLab, audioE, spiroE, ecgE, rxE, optoE, svRes, jsonbRes, legacyLabRes, legacyAud, legacySpi, legacyEcg] = await Promise.all([
                supabase.from('pacientes').select('nombre,apellido_paterno,genero,fecha_nacimiento,laboratorio').eq('id', pacienteId).single(),
                getEstudioMulti(['laboratorio', 'labs', 'laboratorio_directo']),
                getUltimoEstudioCompleto(pacienteId, 'audiometria'),
                getUltimoEstudioCompleto(pacienteId, 'espirometria'),
                getEstudioMulti(['electrocardiograma', 'ecg']),
                getEstudioMulti(['radiografia', 'rayosx', 'rayos_x']),
                getUltimoEstudioCompleto(pacienteId, 'optometria'),
                supabase.from('exploraciones_fisicas').select('*').eq('paciente_id', pacienteId).order('fecha_exploracion', { ascending: false }).limit(1),
                supabase.from('pacientes').select('laboratorio').eq('id', pacienteId).single(),
                supabase.from('laboratorios').select('*').eq('paciente_id', pacienteId).order('fecha_resultados', { ascending: false }).limit(1),
                supabase.from('audiometrias').select('*').eq('paciente_id', pacienteId).order('fecha_estudio', { ascending: false }).limit(1),
                supabase.from('espirometrias').select('*').eq('paciente_id', pacienteId).order('fecha_estudio', { ascending: false }).limit(1),
                supabase.from('electrocardiogramas').select('*').eq('paciente_id', pacienteId).order('fecha_estudio', { ascending: false }).limit(1),
            ])

            setPaciente(pacRes?.data || null)
            setSV(svRes?.data?.length ? svRes.data[0] : null)
            setAudioData(audioE || (legacyAud?.data?.length ? legacyAud.data[0] : null))
            setSpiroData(spiroE || (legacySpi?.data?.length ? legacySpi.data[0] : null))
            // Legacy ECG: normalize interpretacion_medica → interpretacion for semaphore
            const legacyEcgRow = legacyEcg?.data?.length ? legacyEcg.data[0] : null
            if (legacyEcgRow && !legacyEcgRow.interpretacion && legacyEcgRow.interpretacion_medica) {
                legacyEcgRow.interpretacion = legacyEcgRow.interpretacion_medica
            }
            setEcgData(ecgE || legacyEcgRow)
            setRxData(rxE)
            setOptoData(optoE)

            // ── LAB: prioritize new arch → datos_extra fallback → JSONB with RANGOS_REF → legacy table ──
            if (newLab && newLab.resultados.length > 0) {
                setLabResults(newLab.resultados)
                setLabFecha(newLab.estudio.fecha_estudio)
            } else if (newLab && newLab.estudio?.datos_extra) {
                // Study exists but results are in datos_extra JSONB (common with laboratorio_directo)
                const extra = newLab.estudio.datos_extra as Record<string, any>
                let extractedResults: any[] = []
                if (extra.resultados && Array.isArray(extra.resultados)) {
                    // Grouped format: [{grupo, resultados: [{parametro, resultado, ...}]}]
                    extractedResults = extra.resultados.flatMap((g: any) =>
                        g.resultados ? g.resultados.map((r: any) => ({ ...r, parametro_nombre: r.parametro || r.parametro_nombre, bandera: r.bandera || 'normal' })) :
                        [{ ...g, parametro_nombre: g.parametro || g.parametro_nombre, bandera: g.bandera || 'normal' }]
                    )
                } else {
                    // Try flat key-value extraction from datos_extra directly
                    const withRangos = processJsonbWithRangos(extra)
                    if (withRangos.length > 0) extractedResults = withRangos
                }
                if (extractedResults.length > 0) {
                    setLabResults(extractedResults)
                    setLabFecha(newLab.estudio.fecha_estudio)
                }
            } else if (jsonbRes?.data?.laboratorio && typeof jsonbRes.data.laboratorio === 'object') {
                const raw = jsonbRes.data.laboratorio as Record<string, any>
                const withRangos = processJsonbWithRangos(raw)
                if (withRangos.length > 0) {
                    setLabResults(withRangos)
                    setLabFecha(null)
                }
            } else if (legacyLabRes?.data?.length) {
                const rec = legacyLabRes.data[0]
                try {
                    const raw = rec.resultados
                    if (typeof raw === 'string') {
                        const parsed = JSON.parse(raw)
                        if (Array.isArray(parsed)) {
                            setLabResults(parsed.flatMap((g: any) => (g.resultados || []).map((r: any) => ({ ...r, bandera: r.bandera || 'normal' }))))
                        }
                    } else if (Array.isArray(raw)) {
                        setLabResults(raw.flatMap((g: any) => (g.resultados || []).map((r: any) => ({ ...r, bandera: r.bandera || 'normal' }))))
                    } else if (typeof raw === 'object' && raw !== null) {
                        // Flat JSONB object: { hemoglobina: 14.5, ... }
                        const withRangos = processJsonbWithRangos(raw as Record<string, any>)
                        if (withRangos.length > 0) setLabResults(withRangos)
                    }
                } catch { }
                setLabFecha(rec.fecha_resultados || rec.fecha_toma)
            }
        } catch (e) { console.error('[Dashboard] Error:', e) }
        setLoading(false)
    }

    // ── SEMAPHORE ──
    const systems = useMemo(() => STUDY_TYPES.map(st => {
        let status: keyof typeof STATUS = 'pending', detail = 'Sin datos', fecha: string | null = null

        if (st.key === 'laboratorio' && labResults.length > 0) {
            const crit = labResults.filter(r => r.bandera === 'critico').length
            const outOfRange = labResults.filter(r => r.bandera && r.bandera !== 'normal').length
            if (crit > 0) { status = 'critical'; detail = `${crit} crítico(s)` }
            else if (outOfRange > 2) { status = 'alert'; detail = `${outOfRange} fuera de rango` }
            else if (outOfRange > 0) { status = 'warning'; detail = `${outOfRange} en precaución` }
            else { status = 'ok'; detail = `${labResults.length} normales` }
            fecha = labFecha
        } else if (st.key === 'audiometria' && audioData) {
            const c = (audioData.estudio?.clasificacion || audioData.clasificacion || audioData.diagnostico_general || '').toLowerCase()
            status = c.includes('normal') ? 'ok' : c.includes('leve') ? 'warning' : c.includes('moderada') ? 'alert' : 'ok'
            detail = c ? c.slice(0, 30) : 'Disponible'
            fecha = audioData.estudio?.fecha_estudio || audioData.fecha_estudio
        } else if (st.key === 'espirometria' && spiroData) {
            const c = (spiroData.estudio?.clasificacion || spiroData.clasificacion || '').toLowerCase()
            status = c.includes('normal') ? 'ok' : c.includes('leve') ? 'warning' : 'alert'
            detail = c ? c.slice(0, 30) : 'Disponible'
            fecha = spiroData.estudio?.fecha_estudio || spiroData.fecha_estudio
        } else if (st.key === 'ecg' && ecgData) {
            const i = (ecgData.estudio?.interpretacion || ecgData.interpretacion || ecgData.interpretacion_medica || ecgData.hallazgos || '').toLowerCase()
            status = i.includes('normal') || i.includes('sinusal') ? 'ok' : i ? 'alert' : 'ok'
            detail = i ? i.slice(0, 30) : 'Disponible'
            fecha = ecgData.estudio?.fecha_estudio || ecgData.fecha_estudio
        } else if (st.key === 'radiografia' && rxData) {
            status = 'ok'; detail = 'Disponible'; fecha = rxData?.estudio?.fecha_estudio
        } else if (st.key === 'optometria' && optoData) {
            status = 'ok'; detail = 'Disponible'; fecha = optoData?.estudio?.fecha_estudio
        }
        return { ...st, status, detail, fecha }
    }), [labResults, labFecha, audioData, spiroData, ecgData, rxData, optoData])

    // ── ALERTS (from real lab data with banderas) ──
    const alerts: AlertItem[] = useMemo(() => {
        return labResults
            .filter(r => r.bandera && r.bandera !== 'normal')
            .map(r => ({
                level: r.bandera as Bandera,
                parametro: r.nombre_display || r.parametro_nombre || r.parametro || r.label || '',
                valor: r.resultado || String(r.resultado_numerico ?? ''),
                unidad: r.unidad || '',
                tipo: 'Lab',
            }))
            .sort((a, b) => {
                const order = { critico: 0, alto: 1, bajo: 2, anormal: 3 }
                return (order[a.level as keyof typeof order] ?? 4) - (order[b.level as keyof typeof order] ?? 4)
            })
    }, [labResults])

    // ── CLINICAL METRICS ──
    const metrics: ClinicalMetric[] = useMemo(() => {
        const m: ClinicalMetric[] = []
        const sv = signosVitales

        if (sv?.peso && sv?.talla) {
            const { v, c, s } = calcIMC(sv.peso, sv.talla)
            m.push({ key: 'imc', label: 'IMC', value: v, unit: 'kg/m²', interpretation: c, status: s, icon: Gauge, formula: `${sv.peso}kg / ${sv.talla > 3 ? sv.talla + 'cm' : sv.talla + 'm'}` })
        }
        const cr = findLabValue(labResults, 'creatinina')
        if (cr && paciente?.fecha_nacimiento) {
            const edad = Math.floor((Date.now() - new Date(paciente.fecha_nacimiento).getTime()) / 31557600000)
            const { v, e, s } = calcEGFR(cr, edad, paciente.genero === 'femenino')
            m.push({ key: 'egfr', label: 'eGFR', value: v, unit: 'ml/min', interpretation: e, status: s, icon: Droplets, formula: 'CKD-EPI' })
        }
        const ct = findLabValue(labResults, 'colesterol total', 'colesterol'), h = findLabValue(labResults, 'hdl')
        if (ct && h && h > 0) {
            const ratio = Math.round((ct / h) * 10) / 10
            const s: ClinicalMetric['status'] = ratio > 5 ? 'alert' : ratio > 4.5 ? 'warning' : 'ok'
            m.push({ key: 'colhdl', label: 'Col/HDL', value: ratio, unit: 'ratio', interpretation: ratio > 5 ? 'Riesgo Alto' : ratio > 3.5 ? 'Moderado' : 'Bajo', status: s, icon: Heart })
        }
        const tg = findLabValue(labResults, 'triglicéridos', 'trigliceridos')
        if (ct && h && tg && tg < 400) {
            const ldl = Math.round(ct - h - (tg / 5))
            const s: ClinicalMetric['status'] = ldl >= 190 ? 'critical' : ldl >= 160 ? 'alert' : ldl >= 130 ? 'warning' : 'ok'
            m.push({ key: 'ldl', label: 'LDL', value: ldl, unit: 'mg/dL', interpretation: ldl < 100 ? 'Óptimo' : ldl < 130 ? 'Normal' : 'Alto', status: s, icon: Calculator, formula: 'Friedewald' })
        }
        const glu = findLabValue(labResults, 'glucosa')
        if (glu) {
            const s: ClinicalMetric['status'] = glu >= 126 ? 'critical' : glu >= 100 ? 'warning' : 'ok'
            m.push({ key: 'glu', label: 'Glucosa', value: glu, unit: 'mg/dL', interpretation: glu >= 126 ? 'Diabetes' : glu >= 100 ? 'Prediabetes' : 'Normal', status: s, icon: Beaker })
        }
        if (sv?.presion_sistolica && sv?.presion_diastolica) {
            const sys = sv.presion_sistolica, dia = sv.presion_diastolica
            const s: ClinicalMetric['status'] = (sys >= 180 || dia >= 120) ? 'critical' : (sys >= 140 || dia >= 90) ? 'alert' : (sys >= 130 || dia >= 80) ? 'warning' : 'ok'
            const interp = sys >= 180 ? 'Crisis HTA' : sys >= 140 ? 'HTA 2' : sys >= 130 ? 'HTA 1' : sys >= 120 ? 'Elevada' : 'Normal'
            m.push({ key: 'ta', label: 'T/A', value: `${sys}/${dia}`, unit: 'mmHg', interpretation: interp, status: s, icon: Thermometer })
        }
        return m
    }, [labResults, signosVitales, paciente])

    // ── Lab highlights ──
    const highlights = useMemo(() => {
        const prio = ['Hemoglobina', 'Hematocrito', 'Glucosa', 'Creatinina', 'Colesterol Total', 'Triglicéridos', 'Plaquetas', 'Leucocitos', 'Eritrocitos']
        return labResults
            .filter(r => r.resultado_numerico != null || !isNaN(parseFloat(String(r.resultado || '').replace(/,/g, ''))))
            .map(r => ({ ...r, resultado_numerico: r.resultado_numerico ?? parseFloat(String(r.resultado || '0').replace(/,/g, '')) }))
            .sort((a, b) => {
                const ai = prio.findIndex(n => (a.parametro_nombre || a.nombre_display || '').includes(n))
                const bi = prio.findIndex(n => (b.parametro_nombre || b.nombre_display || '').includes(n))
                if (ai >= 0 && bi >= 0) return ai - bi
                if (ai >= 0) return -1; if (bi >= 0) return 1
                return (a.bandera === 'normal' ? 1 : 0) - (b.bandera === 'normal' ? 1 : 0)
            }).slice(0, 10)
    }, [labResults])

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <span className="ml-3 text-sm text-slate-400 font-bold">Cargando dashboard clínico...</span>
        </div>
    )

    const okCount = systems.filter(s => s.status === 'ok').length
    const totalActive = systems.filter(s => s.status !== 'pending').length

    const sv = signosVitales
    const vitalOrbs = [
        { label: 'T/A', value: sv?.ta_sistolica && sv?.ta_diastolica ? `${sv.ta_sistolica}/${sv.ta_diastolica}` : sv?.presion_sistolica && sv?.presion_diastolica ? `${sv.presion_sistolica}/${sv.presion_diastolica}` : null, unit: 'mmHg', ok: () => { const sys = Number(sv?.ta_sistolica || sv?.presion_sistolica); return sys < 130; }, pulse: true, gradient: 'from-rose-500 to-pink-600' },
        { label: 'FC', value: sv?.fc || sv?.frecuencia_cardiaca, unit: 'lpm', ok: () => { const v = Number(sv?.fc || sv?.frecuencia_cardiaca); return v >= 60 && v <= 100; }, pulse: true, gradient: 'from-red-500 to-rose-600' },
        { label: 'SpO₂', value: sv?.spo2 || sv?.saturacion_o2, unit: '%', ok: () => Number(sv?.spo2 || sv?.saturacion_o2) >= 95, gradient: 'from-cyan-500 to-blue-600' },
        { label: 'Temp', value: sv?.temperatura, unit: '°C', ok: () => { const v = Number(sv?.temperatura); return v >= 36.5 && v <= 37.5; }, gradient: 'from-amber-500 to-orange-600' },
        { label: 'Peso', value: sv?.peso_kg || sv?.peso, unit: 'kg', ok: () => true, gradient: 'from-violet-500 to-purple-600' },
        { label: 'Glucosa', value: sv?.glucosa, unit: 'mg/dL', ok: () => { const v = Number(sv?.glucosa); return v >= 70 && v <= 100; }, gradient: 'from-emerald-500 to-teal-600' },
    ].filter(o => o.value !== null && o.value !== undefined && o.value !== '' && o.value !== '—')

    return (
        <div className="space-y-5">

            {/* ═══ HEALTH SCORE + VITALES ═══ */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-[#0a0e17] via-[#0d1321] to-[#0a0e17] rounded-[1.5rem] border border-slate-700/40 p-6 shadow-2xl relative overflow-hidden">
                {/* Ambient glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.04] rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/[0.04] rounded-full blur-[80px] pointer-events-none" />

                <div className="relative flex flex-col lg:flex-row items-center gap-6">
                    {/* Health Score Ring */}
                    <div className="flex-shrink-0">
                        <div className="relative w-32 h-32">
                            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                                <circle cx="60" cy="60" r="52" fill="none" stroke="#1e293b" strokeWidth="8" />
                                <motion.circle
                                    cx="60" cy="60" r="52" fill="none"
                                    stroke="url(#healthGrad)" strokeWidth="8" strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 52}`}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                                    animate={{ strokeDashoffset: totalActive > 0 ? (2 * Math.PI * 52) * (1 - okCount / totalActive) : 2 * Math.PI * 52 }}
                                    transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
                                />
                                <defs>
                                    <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#10b981" />
                                        <stop offset="100%" stopColor="#06b6d4" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="text-3xl font-black text-white tabular-nums"
                                >
                                    {totalActive > 0 ? Math.round((okCount / totalActive) * 100) : 0}
                                </motion.span>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Score</span>
                            </div>
                        </div>
                    </div>

                    {/* Vitals Grid */}
                    <div className="flex-1 w-full">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.15em]">Signos Vitales</h3>
                            <span className="text-[9px] text-slate-500 ml-auto font-medium">Última exploración</span>
                        </div>
                        {vitalOrbs.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                {vitalOrbs.map((orb, i) => {
                                    const isOk = orb.ok ? orb.ok() : true
                                    return (
                                        <motion.div key={orb.label}
                                            initial={{ scale: 0.7, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.2 + i * 0.08, type: 'spring', stiffness: 200 }}
                                            className="flex flex-col items-center gap-2"
                                        >
                                            <div className="relative">
                                                <div className={`w-[3.5rem] h-[3.5rem] rounded-2xl bg-gradient-to-br ${isOk ? orb.gradient : 'from-amber-500 to-orange-600'} flex flex-col items-center justify-center shadow-lg relative z-10`}>
                                                    <span className="text-[11px] font-black text-white leading-none">{orb.value}</span>
                                                    <span className="text-[7px] text-white/60 font-medium mt-0.5">{orb.unit}</span>
                                                </div>
                                                {orb.pulse && (
                                                    <motion.div className="absolute inset-0 rounded-2xl z-0"
                                                        animate={{ boxShadow: isOk
                                                            ? ['0 0 0 0px rgba(52,211,153,0)', '0 0 0 6px rgba(52,211,153,0.2)', '0 0 0 0px rgba(52,211,153,0)']
                                                            : ['0 0 0 0px rgba(245,158,11,0)', '0 0 0 8px rgba(245,158,11,0.3)', '0 0 0 0px rgba(245,158,11,0)']
                                                        }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                    />
                                                )}
                                                {!isOk && <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-[#0a0e17] z-20 animate-pulse" />}
                                            </div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{orb.label}</p>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-600 italic">Sin datos de exploración física</p>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* ═══ SEMÁFORO CLÍNICO — Connected Pipeline ═══ */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-[#0a0e17] via-[#0f1525] to-[#0a0e17] rounded-[1.5rem] p-6 border border-slate-700/40 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.03),transparent_50%)] pointer-events-none" />
                <div className="relative">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Shield className="w-4.5 h-4.5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white tracking-wide">SEMÁFORO CLÍNICO</h3>
                                <p className="text-[10px] text-slate-500 font-medium">Estado integral • Clic para navegar</p>
                            </div>
                        </div>
                        {totalActive > 0 && (
                            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <span className="text-[11px] font-black text-emerald-400">{okCount}/{totalActive} OK</span>
                            </motion.div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        {systems.map((sys, idx) => {
                            const st = STATUS[sys.status]
                            const tabMap: Record<string, string> = { laboratorio: 'laboratorio', audiometria: 'audiometria', espirometria: 'espirometria', ecg: 'electrocardiograma', radiografia: 'rayosx', optometria: 'vision' }
                            const statusColors: Record<string, string> = { ok: '#10b981', warning: '#f59e0b', alert: '#f97316', critical: '#ef4444', pending: '#475569' }
                            const glowColor = statusColors[sys.status] || '#475569'
                            return (
                                <motion.div key={sys.key}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 + idx * 0.06 }}
                                    whileHover={{ scale: 1.04, y: -2 }}
                                    onClick={() => onNavigate && onNavigate(tabMap[sys.key] || sys.key)}
                                    className={`relative rounded-2xl bg-gradient-to-br ${st.bgCard} backdrop-blur-sm border ${st.border} p-4 transition-all ${onNavigate ? 'cursor-pointer' : 'cursor-default'} group`}
                                    style={{ boxShadow: `0 4px 24px -8px ${glowColor}20` }}
                                >
                                    {/* Status glow on hover */}
                                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                        style={{ boxShadow: `inset 0 0 20px ${glowColor}10, 0 0 20px ${glowColor}15` }} />

                                    <div className="relative flex items-center justify-between mb-3">
                                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${sys.color} flex items-center justify-center shadow-lg`}>
                                            <sys.icon className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="relative">
                                            <div className={`w-3 h-3 rounded-full ${st.bg}`} />
                                            {sys.status === 'critical' && (
                                                <motion.div className="absolute inset-0 rounded-full"
                                                    animate={{ boxShadow: [`0 0 0 0px ${glowColor}00`, `0 0 0 6px ${glowColor}40`, `0 0 0 0px ${glowColor}00`] }}
                                                    transition={{ duration: 1, repeat: Infinity }} />
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-[11px] font-black text-white mb-0.5 leading-tight">{sys.label}</p>
                                    <p className={`text-[9px] font-semibold ${st.text} leading-snug`}>{sys.detail}</p>
                                    {sys.fecha && (
                                        <p className="text-[9px] text-slate-600 mt-1.5 flex items-center gap-1">
                                            <Clock className="w-2.5 h-2.5" />
                                            {new Date(sys.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                                        </p>
                                    )}
                                    {onNavigate && sys.status !== 'pending' && (
                                        <div className="flex items-center gap-1 mt-2 text-[9px] font-bold text-slate-600 group-hover:text-slate-300 transition-colors">
                                            <span>Ver detalle</span>
                                            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </motion.div>

            {/* ═══ CLINICAL ANALYSIS — Premium Metric Cards ═══ */}
            {metrics.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <Brain className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Análisis Clínico</h3>
                        <Badge className="bg-violet-50 text-violet-600 border-violet-200 text-[10px] font-black ml-auto">{metrics.length} métricas</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                        {metrics.map((m, idx) => {
                            const st = STATUS[m.status]
                            const statusColors: Record<string, string> = { ok: '#10b981', warning: '#f59e0b', alert: '#f97316', critical: '#ef4444' }
                            const color = statusColors[m.status] || '#64748b'
                            return (
                                <motion.div key={m.key}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 + idx * 0.05 }}
                                    className={`rounded-2xl bg-white border ${st.border} p-4 hover:shadow-lg transition-all group relative overflow-hidden`}
                                >
                                    <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, ${color}60, ${color}20)` }} />
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <m.icon className={`w-3.5 h-3.5 ${st.text}`} />
                                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{m.label}</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xl font-black text-slate-800">{m.value}</span>
                                        <span className="text-[9px] text-slate-400 font-medium">{m.unit}</span>
                                    </div>
                                    <p className={`text-[10px] font-bold mt-1 ${st.text}`}>{m.interpretation}</p>
                                    {m.formula && <p className="text-[8px] text-slate-400 mt-0.5 italic">{m.formula}</p>}
                                </motion.div>
                            )
                        })}
                    </div>
                </motion.div>
            )}

            {/* ═══ ALERTS + LABS ═══ */}
            <div className="grid grid-cols-1 gap-4">
                {/* Alerts Card */}
                <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                    className={`rounded-[1.5rem] p-5 border shadow-lg ${alerts.length > 0 ? 'bg-gradient-to-br from-red-950 via-red-900/90 to-orange-950 border-red-800/30' : 'bg-slate-900/60 border border-white/5 backdrop-blur-xl shadow-lg'}`}>
                    <div className="flex items-center gap-2.5 mb-4">
                        {alerts.length > 0 ? <AlertTriangle className="w-4.5 h-4.5 text-red-400" /> : <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />}
                        <h3 className={`text-sm font-black ${alerts.length > 0 ? 'text-white' : 'text-slate-700'}`}>
                            {alerts.length > 0 ? `${alerts.length} Alertas Activas` : 'Sin Alertas'}
                        </h3>
                    </div>
                    {alerts.length === 0 ? (
                        <div className="text-center py-5">
                            <CheckCircle className="w-12 h-12 text-emerald-200 mx-auto mb-2" />
                            <p className="text-xs text-emerald-600 font-semibold">Todos los valores dentro de rango normal</p>
                        </div>
                    ) : (
                        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                            {alerts.map((a, i) => {
                                const flag = BANDERA_STYLES[a.level] || BANDERA_STYLES.normal
                                return (
                                    <motion.div key={i}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.25 + i * 0.04 }}
                                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/5 hover:bg-white/15 transition-colors"
                                    >
                                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${a.level === 'critico' ? 'bg-red-400 animate-pulse' : a.level === 'alto' ? 'bg-orange-400' : 'bg-amber-400'}`} />
                                        <span className="text-xs font-bold text-white/90 flex-1 truncate">{a.parametro}</span>
                                        <span className="text-xs font-black text-white tabular-nums">{a.valor} <span className="text-white/40 text-[9px]">{a.unidad}</span></span>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${a.level === 'bajo' ? 'bg-blue-500/20 text-blue-300' : a.level === 'alto' ? 'bg-orange-500/20 text-orange-300' : 'bg-red-500/20 text-red-300'}`}>
                                            {flag.label}
                                        </span>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </motion.div>

                {/* Labs Highlights — Premium Dark */}
                <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
                    className="rounded-[1.5rem] bg-gradient-to-br from-[#0a0e17] via-[#0f1525] to-[#0a0e17] border border-slate-700/40 p-5 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/[0.03] rounded-full blur-[60px] pointer-events-none" />
                    <div className="relative">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-md">
                                <FlaskConical className="w-3.5 h-3.5 text-white" />
                            </div>
                            <h3 className="text-sm font-black text-white">Labs Destacados</h3>
                            {labFecha && <span className="text-[9px] text-slate-500 ml-auto font-medium">{new Date(labFecha).toLocaleDateString('es-MX')}</span>}
                        </div>
                        {highlights.length === 0 ? (
                            <div className="text-center py-6">
                                <FlaskConical className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                                <p className="text-xs text-slate-500">Sin resultados de laboratorio</p>
                            </div>
                        ) : (
                            <div className="space-y-0.5">
                                {highlights.map((r, i) => (
                                    <BarIndicator key={i} label={r.nombre_display || r.parametro_nombre || r.parametro || r.label} value={r.resultado_numerico}
                                        min={r.rango_ref_min} max={r.rango_ref_max} unit={r.unidad || ''} bandera={r.bandera || 'normal'} />
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* ═══ DISCLAIMER ═══ */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-violet-50 via-indigo-50 to-violet-50 rounded-xl border border-violet-100/60 p-3.5 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                    <strong className="text-violet-600">⚕️ Herramienta de apoyo:</strong> Los análisis e interpretaciones no constituyen un diagnóstico médico.
                    La decisión diagnóstica y terapéutica es responsabilidad exclusiva del médico tratante.
                </p>
            </motion.div>
        </div>
    )
}
