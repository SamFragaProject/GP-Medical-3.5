/**
 * PatientDashboardTab — Dashboard Clínico Ejecutivo con Datos Reales
 *
 * DESIGN: Premium glassmorphism medical dashboard
 * DATA: Multi-source (estudios_clinicos, pacientes.laboratorio JSONB, legacy tables)
 * ALERTS: Calculated from RANGOS_REF (same logic as LaboratorioTab)
 * ANALYSIS: eGFR (CKD-EPI), IMC, Col/HDL, LDL (Friedewald), Glucosa, TA
 */
import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    Activity, Ear, Wind, Heart, FlaskConical, Eye, Bone,
    AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown,
    Loader2, Shield, Sparkles, Minus,
    Thermometer, Calculator, Brain, Gauge, Droplets, Beaker
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

// ── BAR INDICATOR (premium) ──
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

    return (
        <div className="flex items-center gap-3 py-1.5 group">
            <span className={`text-xs font-bold w-28 truncate ${isAbnormal ? 'text-amber-300' : 'text-slate-300'}`}>{label}</span>
            <div className="flex-1 h-2.5 bg-slate-700/50 rounded-full relative overflow-hidden">
                <div className="absolute h-full bg-emerald-500/20 rounded-full" style={{ left: `${refLeft}%`, width: `${refWidth}%` }} />
                <div className={`absolute top-0 h-full w-2 rounded-full shadow-lg ${isAbnormal ? 'bg-amber-400 shadow-amber-400/30' : 'bg-emerald-400 shadow-emerald-400/30'}`}
                    style={{ left: `${pos}%`, transform: 'translateX(-50%)' }} />
            </div>
            <span className={`text-xs font-black tabular-nums w-16 text-right ${isAbnormal ? 'text-amber-300' : 'text-white'}`}>
                {value} <span className="text-[8px] text-slate-500 font-medium">{unit}</span>
            </span>
        </div>
    )
}

// ══════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════
export default function PatientDashboardTab({ pacienteId }: { pacienteId: string }) {
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
            const [pacRes, newLab, audioE, spiroE, ecgE, rxE, optoE, svRes, jsonbRes, legacyLabRes, legacyAud, legacySpi, legacyEcg] = await Promise.all([
                supabase.from('pacientes').select('nombre,apellido_paterno,genero,fecha_nacimiento,laboratorio').eq('id', pacienteId).single(),
                getUltimoEstudioCompleto(pacienteId, 'laboratorio'),
                getUltimoEstudioCompleto(pacienteId, 'audiometria'),
                getUltimoEstudioCompleto(pacienteId, 'espirometria'),
                getUltimoEstudioCompleto(pacienteId, 'electrocardiograma'),
                getUltimoEstudioCompleto(pacienteId, 'radiografia'),
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
            setEcgData(ecgE || (legacyEcg?.data?.length ? legacyEcg.data[0] : null))
            setRxData(rxE)
            setOptoData(optoE)

            // ── LAB: prioritize new arch → JSONB with RANGOS_REF → legacy table ──
            if (newLab && newLab.resultados.length > 0) {
                setLabResults(newLab.resultados)
                setLabFecha(newLab.estudio.fecha_estudio)
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
                    const grupos = typeof rec.resultados === 'string' ? JSON.parse(rec.resultados) : (Array.isArray(rec.resultados) ? rec.resultados : [])
                    setLabResults(grupos.flatMap((g: any) => (g.resultados || []).map((r: any) => ({ ...r, bandera: r.bandera || 'normal' }))))
                } catch { }
                setLabFecha(rec.fecha_resultados)
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
            const c = (audioData.estudio?.clasificacion || audioData.clasificacion || '').toLowerCase()
            status = c.includes('normal') ? 'ok' : c.includes('leve') ? 'warning' : c.includes('moderada') ? 'alert' : 'ok'
            detail = c ? c.slice(0, 30) : 'Disponible'
            fecha = audioData.estudio?.fecha_estudio || audioData.fecha_estudio
        } else if (st.key === 'espirometria' && spiroData) {
            const c = (spiroData.estudio?.clasificacion || spiroData.clasificacion || '').toLowerCase()
            status = c.includes('normal') ? 'ok' : c.includes('leve') ? 'warning' : 'alert'
            detail = c ? c.slice(0, 30) : 'Disponible'
            fecha = spiroData.estudio?.fecha_estudio || spiroData.fecha_estudio
        } else if (st.key === 'ecg' && ecgData) {
            const i = (ecgData.estudio?.interpretacion || ecgData.interpretacion || '').toLowerCase()
            status = i.includes('normal') || i.includes('sinusal') ? 'ok' : 'alert'
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

    return (
        <div className="space-y-5">
            {/* ═══ SEMÁFORO CLÍNICO — Premium Dark Glass ═══ */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 border border-slate-700/50 shadow-2xl shadow-slate-900/50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white tracking-wide">SEMÁFORO CLÍNICO</h3>
                            <p className="text-[10px] text-slate-400 font-medium">Estado integral de sistemas</p>
                        </div>
                    </div>
                    {totalActive > 0 && (
                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <span className="text-[10px] font-black text-emerald-400">{okCount}/{totalActive} OK</span>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {systems.map((sys) => {
                        const st = STATUS[sys.status]
                        return (
                            <div key={sys.key} className={`rounded-xl bg-gradient-to-br ${st.bgCard} backdrop-blur-sm border ${st.border} p-3 transition-all hover:scale-[1.02] cursor-pointer`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${sys.color} flex items-center justify-center shadow-md`}>
                                        <sys.icon className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <div className={`w-2.5 h-2.5 rounded-full ${st.bg} ring-2 ${st.ring} ${sys.status === 'critical' ? 'animate-pulse' : ''}`} />
                                </div>
                                <p className="text-[11px] font-black text-white">{sys.label}</p>
                                <p className={`text-[9px] font-semibold ${st.text} mt-0.5 truncate`}>{sys.detail}</p>
                                {sys.fecha && (
                                    <p className="text-[8px] text-slate-500 mt-1 flex items-center gap-0.5">
                                        <Clock className="w-2 h-2" />
                                        {new Date(sys.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                                    </p>
                                )}
                            </div>
                        )
                    })}
                </div>
            </motion.div>

            {/* ═══ CLINICAL ANALYSIS — Glassmorphism Cards ═══ */}
            {metrics.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
                    <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-4 h-4 text-violet-500" />
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Análisis Clínico</h3>
                        <Badge className="bg-violet-50 text-violet-600 border-violet-200 text-[10px] font-black ml-auto">{metrics.length} métricas</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {metrics.map(m => {
                            const st = STATUS[m.status]
                            return (
                                <div key={m.key} className={`rounded-xl bg-gradient-to-br ${st.bgCard} backdrop-blur border ${st.border} p-3.5 hover:shadow-lg transition-all`}>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <m.icon className={`w-4 h-4 ${st.text}`} />
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{m.label}</span>
                                    </div>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-2xl font-black text-slate-800">{m.value}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">{m.unit}</span>
                                    </div>
                                    <p className={`text-[10px] font-bold mt-0.5 ${st.text}`}>{m.interpretation}</p>
                                    {m.formula && <p className="text-[8px] text-slate-400 mt-0.5 italic">{m.formula}</p>}
                                </div>
                            )
                        })}
                    </div>
                </motion.div>
            )}

            {/* ═══ ALERTS + LABS ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Alerts Card — Dark theme */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                    className={`rounded-2xl p-4 border shadow-lg ${alerts.length > 0 ? 'bg-gradient-to-br from-red-950 via-red-900/90 to-orange-950 border-red-800/30' : 'bg-gradient-to-br from-slate-50 to-emerald-50/50 border-emerald-100'}`}>
                    <div className="flex items-center gap-2 mb-3">
                        {alerts.length > 0 ? <AlertTriangle className="w-4 h-4 text-red-400" /> : <CheckCircle className="w-4 h-4 text-emerald-500" />}
                        <h3 className={`text-sm font-black ${alerts.length > 0 ? 'text-white' : 'text-slate-700'}`}>
                            {alerts.length > 0 ? `${alerts.length} Alertas Activas` : 'Sin Alertas'}
                        </h3>
                    </div>
                    {alerts.length === 0 ? (
                        <div className="text-center py-4">
                            <CheckCircle className="w-10 h-10 text-emerald-200 mx-auto mb-2" />
                            <p className="text-xs text-emerald-600 font-semibold">Todos los valores dentro de rango normal</p>
                        </div>
                    ) : (
                        <div className="space-y-1.5 max-h-52 overflow-y-auto">
                            {alerts.map((a, i) => {
                                const flag = BANDERA_STYLES[a.level] || BANDERA_STYLES.normal
                                return (
                                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/5">
                                        <div className={`w-2 h-2 rounded-full ${a.level === 'critico' ? 'bg-red-400 animate-pulse' : a.level === 'alto' ? 'bg-orange-400' : 'bg-amber-400'}`} />
                                        <span className="text-xs font-bold text-white/90 flex-1">{a.parametro}</span>
                                        <span className="text-xs font-black text-white">{a.valor} <span className="text-white/50 text-[9px]">{a.unidad}</span></span>
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${a.level === 'bajo' ? 'bg-blue-500/20 text-blue-300' : a.level === 'alto' ? 'bg-orange-500/20 text-orange-300' : 'bg-red-500/20 text-red-300'}`}>
                                            {flag.label}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </motion.div>

                {/* Labs Highlights — Dark theme */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                    className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-3">
                        <FlaskConical className="w-4 h-4 text-teal-400" />
                        <h3 className="text-sm font-black text-white">Labs Destacados</h3>
                        {labFecha && <span className="text-[9px] text-slate-500 ml-auto">{new Date(labFecha).toLocaleDateString('es-MX')}</span>}
                    </div>
                    {highlights.length === 0 ? (
                        <div className="text-center py-6">
                            <FlaskConical className="w-10 h-10 text-slate-600 mx-auto mb-2" />
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
                </motion.div>
            </div>

            {/* ═══ DISCLAIMER ═══ */}
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-100 p-3 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                    <strong className="text-violet-600">⚕️ Herramienta de apoyo:</strong> Los análisis e interpretaciones no constituyen un diagnóstico médico.
                    La decisión diagnóstica y terapéutica es responsabilidad exclusiva del médico tratante.
                </p>
            </div>
        </div>
    )
}
