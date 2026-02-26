/**
 * PatientDashboardTab — Dashboard Clínico Ejecutivo con Datos Reales
 *
 * Conecta a TODAS las fuentes de datos (nuevas y legacy):
 * - estudios_clinicos + resultados_estudio (nueva arquitectura)
 * - pacientes.laboratorio JSONB (legacy)
 * - laboratorios table (legacy)
 * - audiometrias, espirometrias, electrocardiogramas (legacy)
 * - exploraciones_fisicas (signos vitales)
 *
 * Análisis clínico calculado:
 * - eGFR (CKD-EPI), Riesgo Cardiovascular, IMC, PTA, Col/HDL, LDL
 */
import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    Activity, Ear, Wind, Heart, FlaskConical, Eye, Bone,
    AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown,
    Loader2, Shield, Sparkles, FileText, Minus,
    Thermometer, Calculator, Brain, Gauge
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { getUltimoEstudioCompleto, getEstudios, type EstudioCompleto, type Bandera, BANDERA_STYLES } from '@/services/estudiosService'

// ── Types ──
interface DashboardData {
    labResults: any[]
    labFecha: string | null
    labSource: 'new' | 'jsonb' | 'legacy' | null
    audioData: any | null
    spiroData: any | null
    ecgData: any | null
    rxData: any | null
    optoData: any | null
    signosVitales: any | null
    paciente: any | null
}

interface ClinicalMetric {
    key: string
    label: string
    value: string | number
    unit: string
    interpretation: string
    status: 'ok' | 'warning' | 'alert' | 'critical'
    icon: any
    formula?: string
}

interface AlertItem {
    level: Bandera
    parametro: string
    valor: string
    unidad: string
    tipo: string
}

// ── STATUS STYLES ──
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

// ── HELPERS ──
function findLabValue(results: any[], ...names: string[]): number | null {
    for (const name of names) {
        const found = results.find((r: any) => {
            const pName = (r.parametro_nombre || r.nombre_display || r.parametro || '').toLowerCase()
            return pName.includes(name.toLowerCase())
        })
        if (found) {
            const num = found.resultado_numerico ?? parseFloat(String(found.resultado || '0').replace(/,/g, ''))
            if (!isNaN(num)) return num
        }
    }
    return null
}

function calcularIMC(peso: number, talla: number): { imc: number; clasificacion: string; status: ClinicalMetric['status'] } {
    const tallaMt = talla > 3 ? talla / 100 : talla
    const imc = peso / (tallaMt * tallaMt)
    let clasificacion = 'Normal'
    let status: ClinicalMetric['status'] = 'ok'
    if (imc < 18.5) { clasificacion = 'Bajo peso'; status = 'warning' }
    else if (imc >= 25 && imc < 30) { clasificacion = 'Sobrepeso'; status = 'warning' }
    else if (imc >= 30 && imc < 35) { clasificacion = 'Obesidad I'; status = 'alert' }
    else if (imc >= 35 && imc < 40) { clasificacion = 'Obesidad II'; status = 'critical' }
    else if (imc >= 40) { clasificacion = 'Obesidad III'; status = 'critical' }
    return { imc: Math.round(imc * 10) / 10, clasificacion, status }
}

function calcularEGFR(creatinina: number, edad: number, esFemenino: boolean): { egfr: number; etapa: string; status: ClinicalMetric['status'] } {
    // CKD-EPI simplified
    const k = esFemenino ? 0.7 : 0.9
    const alpha = esFemenino ? -0.329 : -0.411
    const sexFactor = esFemenino ? 1.018 : 1.0
    const ratio = creatinina / k
    const egfr = Math.round(141 * Math.pow(Math.min(ratio, 1), alpha) * Math.pow(Math.max(ratio, 1), -1.209) * Math.pow(0.993, edad) * sexFactor)

    let etapa = 'G1 - Normal'
    let status: ClinicalMetric['status'] = 'ok'
    if (egfr >= 90) { etapa = 'G1 Normal'; status = 'ok' }
    else if (egfr >= 60) { etapa = 'G2 Leve ↓'; status = 'warning' }
    else if (egfr >= 45) { etapa = 'G3a Moderada'; status = 'alert' }
    else if (egfr >= 30) { etapa = 'G3b Moderada-Severa'; status = 'alert' }
    else if (egfr >= 15) { etapa = 'G4 Severa'; status = 'critical' }
    else { etapa = 'G5 Falla Renal'; status = 'critical' }
    return { egfr, etapa, status }
}

function calcularRatioColHDL(colTotal: number, hdl: number): { ratio: number; riesgo: string; status: ClinicalMetric['status'] } {
    const ratio = Math.round((colTotal / hdl) * 10) / 10
    let riesgo = 'Bajo'
    let status: ClinicalMetric['status'] = 'ok'
    if (ratio > 5) { riesgo = 'Alto'; status = 'alert' }
    else if (ratio > 4.5) { riesgo = 'Moderado-Alto'; status = 'warning' }
    else if (ratio > 3.5) { riesgo = 'Moderado'; status = 'ok' }
    return { ratio, riesgo, status }
}

function calcularLDL(colTotal: number, hdl: number, trigliceridos: number): { ldl: number; status: ClinicalMetric['status'] } {
    // Friedewald: LDL = CT - HDL - (TG/5)
    const ldl = Math.round(colTotal - hdl - (trigliceridos / 5))
    let status: ClinicalMetric['status'] = 'ok'
    if (ldl >= 190) status = 'critical'
    else if (ldl >= 160) status = 'alert'
    else if (ldl >= 130) status = 'warning'
    return { ldl, status }
}

// ── BAR INDICATOR ──
function BarIndicator({ value, min, max, unit, label, bandera }: {
    value: number; min?: number | null; max?: number | null; unit: string; label: string; bandera: string
}) {
    const flag = BANDERA_STYLES[bandera as Bandera] || BANDERA_STYLES.normal
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
        <div className="flex items-center gap-3 py-1.5">
            <span className="text-xs font-semibold text-slate-600 w-32 truncate">{label}</span>
            <div className="flex-1 h-3 bg-slate-100 rounded-full relative overflow-hidden">
                <div className="absolute h-full bg-emerald-100 rounded-full" style={{ left: `${refLeft}%`, width: `${refWidth}%` }} />
                <div className={`absolute top-0 h-full w-1.5 rounded-full ${flag.dot} shadow-sm`}
                    style={{ left: `${pos}%`, transform: 'translateX(-50%)' }} />
            </div>
            <span className={`text-xs font-black tabular-nums w-20 text-right ${bandera !== 'normal' ? flag.text : 'text-slate-800'}`}>
                {value} <span className="text-[9px] text-slate-400 font-medium">{unit}</span>
            </span>
        </div>
    )
}

// ── CLINICAL METRIC CARD ──
function MetricCard({ metric }: { metric: ClinicalMetric }) {
    const style = STATUS_STYLES[metric.status]
    return (
        <div className={`rounded-xl border ${style.border} ${style.bgLight} p-3.5`}>
            <div className="flex items-center gap-2 mb-1.5">
                <metric.icon className={`w-4 h-4 ${style.text}`} />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{metric.label}</span>
            </div>
            <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black ${style.text}`}>{metric.value}</span>
                <span className="text-xs text-slate-400 font-medium">{metric.unit}</span>
            </div>
            <p className={`text-[10px] font-semibold mt-1 ${style.text}`}>{metric.interpretation}</p>
            {metric.formula && <p className="text-[9px] text-slate-400 mt-0.5 italic">{metric.formula}</p>}
        </div>
    )
}

// ══════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════
export default function PatientDashboardTab({ pacienteId }: { pacienteId: string }) {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<DashboardData>({
        labResults: [], labFecha: null, labSource: null,
        audioData: null, spiroData: null, ecgData: null, rxData: null, optoData: null,
        signosVitales: null, paciente: null,
    })

    useEffect(() => { loadDashboard() }, [pacienteId])

    async function loadDashboard() {
        setLoading(true)
        try {
            // ─── Parallel load from ALL sources ───
            const [
                pacienteRes,
                newLabEstudio,
                audioEstudio, spiroEstudio, ecgEstudio, rxEstudio, optoEstudio,
                signosRes,
                legacyLabJsonb,
                legacyLabTable,
                legacyAudio, legacySpiro, legacyEcg,
            ] = await Promise.all([
                supabase.from('pacientes').select('nombre,apellido_paterno,genero,fecha_nacimiento,laboratorio').eq('id', pacienteId).single(),
                getUltimoEstudioCompleto(pacienteId, 'laboratorio'),
                getUltimoEstudioCompleto(pacienteId, 'audiometria'),
                getUltimoEstudioCompleto(pacienteId, 'espirometria'),
                getUltimoEstudioCompleto(pacienteId, 'electrocardiograma'),
                getUltimoEstudioCompleto(pacienteId, 'radiografia'),
                getUltimoEstudioCompleto(pacienteId, 'optometria'),
                supabase.from('exploraciones_fisicas').select('*').eq('paciente_id', pacienteId).order('fecha_exploracion', { ascending: false }).limit(1),
                // Legacy sources
                supabase.from('pacientes').select('laboratorio').eq('id', pacienteId).single(),
                supabase.from('laboratorios').select('*').eq('paciente_id', pacienteId).order('fecha_resultados', { ascending: false }).limit(1),
                supabase.from('audiometrias').select('*').eq('paciente_id', pacienteId).order('fecha_estudio', { ascending: false }).limit(1),
                supabase.from('espirometrias').select('*').eq('paciente_id', pacienteId).order('fecha_estudio', { ascending: false }).limit(1),
                supabase.from('electrocardiogramas').select('*').eq('paciente_id', pacienteId).order('fecha_estudio', { ascending: false }).limit(1),
            ])

            // ─── Resolve LAB data from best source ───
            let labResults: any[] = []
            let labFecha: string | null = null
            let labSource: DashboardData['labSource'] = null

            // Source 1: New architecture
            if (newLabEstudio && newLabEstudio.resultados.length > 0) {
                labResults = newLabEstudio.resultados.map(r => ({
                    ...r, bandera: r.bandera || 'normal',
                }))
                labFecha = newLabEstudio.estudio.fecha_estudio
                labSource = 'new'
            }
            // Source 2: JSONB in pacientes.laboratorio
            else if (legacyLabJsonb?.data?.laboratorio && typeof legacyLabJsonb.data.laboratorio === 'object') {
                const raw = legacyLabJsonb.data.laboratorio as Record<string, any>
                const validKeys = Object.keys(raw).filter(k => raw[k] !== null && raw[k] !== '' && raw[k] !== 0)
                if (validKeys.length > 3) {
                    labResults = validKeys.map(k => {
                        const val = raw[k]
                        const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, ''))
                        return {
                            parametro_nombre: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                            nombre_display: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                            resultado: String(val),
                            resultado_numerico: isNaN(num) ? null : num,
                            unidad: '',
                            bandera: 'normal' as Bandera,
                        }
                    })
                    labFecha = null
                    labSource = 'jsonb'
                }
            }
            // Source 3: laboratorios table
            else if (legacyLabTable?.data?.length) {
                const record = legacyLabTable.data[0]
                try {
                    const grupos = typeof record.resultados === 'string' ? JSON.parse(record.resultados) : (Array.isArray(record.resultados) ? record.resultados : [])
                    labResults = grupos.flatMap((g: any) => (g.resultados || []).map((r: any) => ({
                        ...r, bandera: r.bandera || 'normal',
                    })))
                } catch { }
                labFecha = record.fecha_resultados
                labSource = 'legacy'
            }

            // ─── Resolve other study data ───
            const audioData = audioEstudio || (legacyAudio?.data?.length ? legacyAudio.data[0] : null)
            const spiroData = spiroEstudio || (legacySpiro?.data?.length ? legacySpiro.data[0] : null)
            const ecgData = ecgEstudio || (legacyEcg?.data?.length ? legacyEcg.data[0] : null)

            setData({
                labResults, labFecha, labSource,
                audioData: audioData,
                spiroData: spiroData,
                ecgData: ecgData,
                rxData: rxEstudio,
                optoData: optoEstudio,
                signosVitales: signosRes?.data?.length ? signosRes.data[0] : null,
                paciente: pacienteRes?.data || null,
            })

        } catch (e) {
            console.error('[Dashboard] Error loading:', e)
        }
        setLoading(false)
    }

    // ── COMPUTE SEMÁFORO ──
    const systemStatuses = useMemo(() => {
        return STUDY_TYPES.map(st => {
            let status: 'ok' | 'warning' | 'alert' | 'critical' | 'pending' = 'pending'
            let detail = 'Sin estudios registrados'
            let fecha: string | null = null

            if (st.key === 'laboratorio' && data.labResults.length > 0) {
                const criticos = data.labResults.filter(r => r.bandera === 'critico').length
                const altos = data.labResults.filter(r => r.bandera === 'alto').length
                const bajos = data.labResults.filter(r => r.bandera === 'bajo').length
                const anormales = data.labResults.filter(r => r.bandera === 'anormal').length
                const total = data.labResults.length
                const fdr = altos + bajos + anormales

                if (criticos > 0) { status = 'critical'; detail = `${criticos} valor(es) crítico(s)` }
                else if (fdr > 2) { status = 'alert'; detail = `${fdr} fuera de rango` }
                else if (fdr > 0) { status = 'warning'; detail = `${fdr} en precaución` }
                else { status = 'ok'; detail = `${total} parámetros normales` }
                fecha = data.labFecha
            }
            else if (st.key === 'audiometria' && data.audioData) {
                const ad = data.audioData
                if (ad.estudio?.clasificacion || ad.clasificacion) {
                    const clasif = (ad.estudio?.clasificacion || ad.clasificacion || '').toLowerCase()
                    if (clasif.includes('normal')) { status = 'ok'; detail = 'Audición normal' }
                    else if (clasif.includes('leve')) { status = 'warning'; detail = 'Hipoacusia leve' }
                    else if (clasif.includes('moderada')) { status = 'alert'; detail = 'Hipoacusia moderada' }
                    else { status = 'critical'; detail = clasif.slice(0, 40) }
                } else { status = 'ok'; detail = 'Registro disponible' }
                fecha = ad.estudio?.fecha_estudio || ad.fecha_estudio
            }
            else if (st.key === 'espirometria' && data.spiroData) {
                const sp = data.spiroData
                const clasif = (sp.estudio?.clasificacion || sp.clasificacion || '').toLowerCase()
                if (clasif.includes('normal') || clasif.includes('compatible')) { status = 'ok'; detail = 'Función pulmonar normal' }
                else if (clasif.includes('leve')) { status = 'warning'; detail = 'Restricción leve' }
                else { status = 'alert'; detail = clasif.slice(0, 40) || 'Registro disponible' }
                fecha = sp.estudio?.fecha_estudio || sp.fecha_estudio
            }
            else if (st.key === 'ecg' && data.ecgData) {
                const ecg = data.ecgData
                const interp = (ecg.estudio?.interpretacion || ecg.interpretacion || '').toLowerCase()
                if (interp.includes('normal') || interp.includes('sinusal')) { status = 'ok'; detail = 'Ritmo sinusal normal' }
                else if (interp.includes('arritmia') || interp.includes('bloqueo')) { status = 'alert'; detail = interp.slice(0, 40) }
                else { status = 'ok'; detail = 'Registro disponible' }
                fecha = ecg.estudio?.fecha_estudio || ecg.fecha_estudio
            }
            else if (st.key === 'radiografia' && data.rxData) {
                status = 'ok'; detail = 'Estudio disponible'
                fecha = data.rxData?.estudio?.fecha_estudio
            }
            else if (st.key === 'optometria' && data.optoData) {
                status = 'ok'; detail = 'Estudio disponible'
                fecha = data.optoData?.estudio?.fecha_estudio
            }

            return { key: st.key, label: st.label, icon: st.icon, status, detail, fecha }
        })
    }, [data])

    // ── COLLECT ALL ALERTS ──
    const alerts: AlertItem[] = useMemo(() => {
        const items: AlertItem[] = []
        for (const r of data.labResults) {
            if (r.bandera && r.bandera !== 'normal') {
                items.push({
                    level: r.bandera,
                    parametro: r.nombre_display || r.parametro_nombre || r.parametro || 'Parámetro',
                    valor: r.resultado || String(r.resultado_numerico ?? ''),
                    unidad: r.unidad || '',
                    tipo: 'Laboratorio',
                })
            }
        }
        const order = { critico: 0, alto: 1, bajo: 2, anormal: 3 }
        return items.sort((a, b) => (order[a.level as keyof typeof order] ?? 4) - (order[b.level as keyof typeof order] ?? 4))
    }, [data])

    // ── CLINICAL ANALYSIS METRICS ──
    const clinicalMetrics: ClinicalMetric[] = useMemo(() => {
        const metrics: ClinicalMetric[] = []
        const pac = data.paciente
        const sv = data.signosVitales

        // IMC from signos vitales
        if (sv?.peso && sv?.talla) {
            const { imc, clasificacion, status } = calcularIMC(sv.peso, sv.talla)
            metrics.push({ key: 'imc', label: 'IMC', value: imc, unit: 'kg/m²', interpretation: clasificacion, status, icon: Gauge, formula: `Peso ${sv.peso}kg / Talla ${sv.talla > 3 ? sv.talla + 'cm' : sv.talla + 'm'}` })
        }

        // eGFR from creatinine
        const creatinina = findLabValue(data.labResults, 'creatinina')
        if (creatinina && pac?.fecha_nacimiento) {
            const edad = Math.floor((Date.now() - new Date(pac.fecha_nacimiento).getTime()) / 31557600000)
            const esFemenino = pac.genero === 'femenino'
            const { egfr, etapa, status } = calcularEGFR(creatinina, edad, esFemenino)
            metrics.push({ key: 'egfr', label: 'eGFR', value: egfr, unit: 'ml/min/1.73m²', interpretation: etapa, status, icon: Activity, formula: 'Fórmula CKD-EPI' })
        }

        // Cholesterol / HDL ratio
        const colTotal = findLabValue(data.labResults, 'colesterol total', 'colesterol')
        const hdl = findLabValue(data.labResults, 'hdl', 'colesterol hdl')
        if (colTotal && hdl && hdl > 0) {
            const { ratio, riesgo, status } = calcularRatioColHDL(colTotal, hdl)
            metrics.push({ key: 'col_hdl', label: 'Col/HDL', value: ratio, unit: 'ratio', interpretation: `Riesgo ${riesgo}`, status, icon: Heart, formula: `${colTotal}/${hdl}` })
        }

        // LDL calculated (Friedewald)
        const trigliceridos = findLabValue(data.labResults, 'triglicéridos', 'trigliceridos')
        if (colTotal && hdl && trigliceridos && trigliceridos < 400) {
            const { ldl, status } = calcularLDL(colTotal, hdl, trigliceridos)
            metrics.push({ key: 'ldl', label: 'LDL Calculado', value: ldl, unit: 'mg/dL', interpretation: ldl < 100 ? 'Óptimo' : ldl < 130 ? 'Cercano a óptimo' : ldl < 160 ? 'Límite alto' : 'Alto', status, icon: Calculator, formula: 'Friedewald: CT-HDL-(TG/5)' })
        }

        // Glucosa
        const glucosa = findLabValue(data.labResults, 'glucosa')
        if (glucosa) {
            let status: ClinicalMetric['status'] = 'ok'
            let interp = 'Normal'
            if (glucosa >= 126) { status = 'critical'; interp = 'Diabetes' }
            else if (glucosa >= 100) { status = 'warning'; interp = 'Prediabetes' }
            metrics.push({ key: 'glucosa', label: 'Glucosa', value: glucosa, unit: 'mg/dL', interpretation: interp, status, icon: Thermometer })
        }

        // Blood pressure from signos vitales
        if (sv?.presion_sistolica && sv?.presion_diastolica) {
            const sys = sv.presion_sistolica
            const dia = sv.presion_diastolica
            let status: ClinicalMetric['status'] = 'ok'
            let interp = 'Normal'
            if (sys >= 180 || dia >= 120) { status = 'critical'; interp = 'Crisis Hipertensiva' }
            else if (sys >= 140 || dia >= 90) { status = 'alert'; interp = 'HTA Etapa 2' }
            else if (sys >= 130 || dia >= 80) { status = 'warning'; interp = 'HTA Etapa 1' }
            else if (sys >= 120) { status = 'warning'; interp = 'Elevada' }
            metrics.push({ key: 'ta', label: 'Presión Arterial', value: `${sys}/${dia}`, unit: 'mmHg', interpretation: interp, status, icon: Heart })
        }

        return metrics
    }, [data])

    // ── Lab highlights ──
    const labHighlights = useMemo(() => {
        if (data.labResults.length === 0) return []
        const important = ['Hemoglobina', 'Hematocrito', 'Glucosa', 'Creatinina', 'Colesterol Total', 'Triglicéridos', 'Plaquetas', 'Leucocitos', 'Eritrocitos', 'Ácido Úrico']
        return data.labResults
            .filter(r => r.resultado_numerico != null || !isNaN(parseFloat(String(r.resultado || '').replace(/,/g, ''))))
            .map(r => ({ ...r, resultado_numerico: r.resultado_numerico ?? parseFloat(String(r.resultado || '0').replace(/,/g, '')) }))
            .sort((a, b) => {
                const aIdx = important.findIndex(n => (a.parametro_nombre || a.nombre_display || '').includes(n))
                const bIdx = important.findIndex(n => (b.parametro_nombre || b.nombre_display || '').includes(n))
                if (aIdx >= 0 && bIdx >= 0) return aIdx - bIdx
                if (aIdx >= 0) return -1
                if (bIdx >= 0) return 1
                return (a.bandera === 'normal' ? 1 : 0) - (b.bandera === 'normal' ? 1 : 0)
            })
            .slice(0, 10)
    }, [data])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-semibold ml-3">Cargando dashboard clínico...</p>
            </div>
        )
    }

    const totalAlerts = alerts.length
    const okSystems = systemStatuses.filter(s => s.status === 'ok').length
    const totalSystems = systemStatuses.filter(s => s.status !== 'pending').length

    return (
        <div className="space-y-5">
            {/* ── SEMÁFORO CLÍNICO ── */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
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
                            <div key={sys.key} className={`rounded-xl border ${style.border} ${style.bgLight} p-3 transition-all hover:shadow-md cursor-pointer`}>
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
                            </div>
                        )
                    })}
                </div>
            </motion.div>

            {/* ── CLINICAL ANALYSIS ── */}
            {clinicalMetrics.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                    <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-4 h-4 text-violet-500" />
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Análisis Clínico Calculado</h3>
                        <Badge className="bg-violet-50 text-violet-600 border-violet-200 text-[10px] font-black ml-auto">
                            {clinicalMetrics.length} métricas
                        </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {clinicalMetrics.map(m => <MetricCard key={m.key} metric={m} />)}
                    </div>
                </motion.div>
            )}

            {/* ── ALERTS + LAB HIGHLIGHTS ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Alerts */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                    <Card className="border-0 shadow-lg shadow-slate-100">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                {totalAlerts > 0 ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : <CheckCircle className="w-4 h-4 text-emerald-500" />}
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
                                    {alerts.slice(0, 12).map((a, i) => {
                                        const flag = BANDERA_STYLES[a.level] || BANDERA_STYLES.normal
                                        return (
                                            <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${flag.bg}`}>
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
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <Card className="border-0 shadow-lg shadow-slate-100">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <FlaskConical className="w-4 h-4 text-violet-500" />
                                <h3 className="text-sm font-black text-slate-700">Labs Destacados</h3>
                                {data.labFecha && (
                                    <span className="text-[9px] text-slate-400 ml-auto">
                                        {new Date(data.labFecha).toLocaleDateString('es-MX')}
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
                                            value={r.resultado_numerico}
                                            min={r.rango_ref_min}
                                            max={r.rango_ref_max}
                                            unit={r.unidad || ''}
                                            bandera={r.bandera || 'normal'}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* ── DISCLAIMER ── */}
            <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                    <strong className="text-slate-500">⚕️ Aviso:</strong> Los análisis e interpretaciones son generados como herramienta de apoyo clínico.
                    No constituyen un diagnóstico médico. La decisión diagnóstica y terapéutica es responsabilidad exclusiva del médico tratante.
                </p>
            </div>
        </div>
    )
}
