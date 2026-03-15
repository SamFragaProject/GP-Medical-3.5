/**
 * HistoriaClinicaTab — Formulario clínico auto-rellenable + Análisis IA
 *
 * Sección 1 (Scanner): Muestra todos los campos extraídos del formulario subido,
 *   organizados por sección, idéntico al formato original.
 * Sección 2 (Análisis IA): Interpretación integrada de todos los datos,
 *   riesgos ocupacionales, aptitud laboral, alertas clínicas.
 * Ambas secciones son editables.
 */
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText, User, Heart, Shield, Briefcase, Stethoscope,
    CheckCircle, AlertTriangle, Brain, Zap, ArrowRight,
    Activity, Thermometer, Scale, Gauge, Edit3, Save,
    ChevronDown, ChevronUp, Loader2, Upload, Pill, Cigarette,
    Dumbbell, Baby, ClipboardList, Eye, Ear, Bone
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import EstudioUploadReview from '@/components/expediente/EstudioUploadReview'
import DocumentosAdjuntos from '@/components/expediente/DocumentosAdjuntos'

// ─────────────────────────────────────────────
// Helpers — extrae campo de resultados por nombre
// ─────────────────────────────────────────────
function getField(results: any[], name: string): string {
    const r = results.find(r =>
        r.parametro_nombre?.toUpperCase() === name.toUpperCase() ||
        r.nombre?.toUpperCase() === name.toUpperCase()
    )
    return r?.resultado ?? r?.value ?? ''
}

function getGroup(results: any[], category: string): Array<{ name: string; value: string; unit: string; desc: string }> {
    return results
        .filter(r => (r.categoria || r.category || '').toLowerCase() === category.toLowerCase())
        .map(r => ({
            name: r.parametro_nombre || r.nombre || r.name || '',
            value: r.resultado ?? r.value ?? '',
            unit: r.unidad || r.unit || '',
            desc: r.observacion || r.description || '',
        }))
}

// ─────────────────────────────────────────────
// Componente: Sección colapsable
// ─────────────────────────────────────────────
function Section({ title, icon: Icon, color, children, defaultOpen = false }: {
    title: string; icon: any; color: string; children: React.ReactNode; defaultOpen?: boolean
}) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div className="bg-slate-900/60 rounded-[2rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl overflow-hidden mb-4 transition-transform hover:shadow-lg">
            <button onClick={() => setOpen(!open)}
                className={`w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-white/[0.04] active:bg-white/[0.08]`}>
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-5 h-5 text-white drop-shadow-md" />
                    </div>
                    <h4 className="text-sm font-bold tracking-tight text-white">{title}</h4>
                </div>
                {open ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-5 pb-5">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Campo individual de formulario
function Field({ label, value, unit, warn }: { label: string; value: string; unit?: string; warn?: boolean }) {
    if (!value || value === '—' || value === '') return null
    return (
        <div className={`p-3 rounded-2xl border ${warn ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-800/50 border-white/10'} backdrop-blur-sm relative overflow-hidden group`}>
            {warn && <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/20 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />}
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 relative z-10">{label}</p>
            <p className={`text-sm font-bold mt-1 leading-relaxed relative z-10 ${warn ? 'text-rose-400' : 'text-white'}`}>
                {value}{unit ? <span className="text-slate-500 text-xs ml-1">{unit}</span> : ''}
            </p>
        </div>
    )
}

// Indicador binario Sí/No
function YesNo({ label, value, isWarning }: { label: string; value: string; isWarning?: boolean }) {
    if (!value) return null
    const isSi = value.toLowerCase().startsWith('sí') || value.toLowerCase().startsWith('si') || value === 'true'
    const color = isSi && isWarning ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : isSi ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
    return (
        <div className={`flex items-center justify-between p-3 rounded-2xl border ${color} backdrop-blur-sm mb-2`}>
            <span className="text-xs font-bold">{label}</span>
            <Badge className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 border shadow-sm ${isSi ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'}`}>
                {isSi ? 'Sí' : 'No'}
            </Badge>
        </div>
    )
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function HistoriaClinicaTab({ pacienteId }: { pacienteId: string }) {
    const [loading, setLoading] = useState(true)
    const [resultados, setResultados] = useState<any[]>([])
    const [estudio, setEstudio] = useState<any>(null)
    const [activeSection, setActiveSection] = useState<'scanner' | 'analisis'>('scanner')
    const [hasData, setHasData] = useState(false)

    useEffect(() => { if (pacienteId) loadData() }, [pacienteId])

    const loadData = async () => {
        try {
            setLoading(true)
            const { data: estudios } = await supabase
                .from('estudios_clinicos').select('*')
                .eq('paciente_id', pacienteId)
                .in('tipo_estudio', ['historia_clinica', 'historia', 'formulario', 'examen_medico_ocupacional'])
                .order('fecha_estudio', { ascending: false }).limit(1)

            if (estudios && estudios.length > 0) {
                setEstudio(estudios[0])
                const { data: res } = await supabase.from('resultados_estudio').select('*').eq('estudio_id', estudios[0].id)
                if (res && res.length > 0) {
                    setResultados(res)
                    setHasData(true)
                    return
                }
            }

            // Legacy: buscar en tabla pacientes campos de historia clínica
            const { data: pac } = await supabase.from('pacientes').select('*').eq('id', pacienteId).single()
            if (pac) {
                // Convertir datos del paciente a formato de resultados
                const fields: any[] = []
                const map: any = {
                    'NOMBRE_COMPLETO': `${pac.nombre} ${pac.apellido_paterno} ${pac.apellido_materno || ''}`.trim(),
                    'FECHA_NACIMIENTO': pac.fecha_nacimiento,
                    'CURP': pac.curp,
                    'NSS': pac.nss,
                    'RFC': pac.rfc,
                    'SEXO': pac.genero,
                    'EMPRESA': pac.empresa,
                    'PUESTO': pac.puesto,
                    'ALERGIAS': pac.alergias,
                }
                for (const [key, val] of Object.entries(map)) {
                    if (val) fields.push({ parametro_nombre: key, resultado: val, categoria: key.toLowerCase().includes('nom') || key.toLowerCase().includes('nac') || key.toLowerCase().includes('cur') ? 'Datos Personales' : 'Datos Personales' })
                }
                if (pac.signos_vitales || pac.signosVitales) {
                    const sv = pac.signos_vitales || pac.signosVitales
                    for (const [k, v] of Object.entries(sv || {})) {
                        if (v) fields.push({ parametro_nombre: k.toUpperCase(), resultado: String(v), categoria: 'Signos Vitales' })
                    }
                }
                if (fields.length > 0) { setResultados(fields); setHasData(true) }
            }
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                <ClipboardList className="w-8 h-8 text-emerald-500" />
            </motion.div>
            <p className="text-slate-400 text-xs font-medium">Cargando historia clínica...</p>
        </div>
    )

    if (!hasData) return (
        <div className="bg-slate-900/60 rounded-[2rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl p-12 text-center transition-transform hover:shadow-lg">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-500/20">
                <ClipboardList className="w-10 h-10 text-emerald-400 drop-shadow-md" />
            </div>
            <h3 className="text-xl text-white font-extrabold tracking-tight">Sin historia clínica registrada</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mt-3 mb-8 leading-relaxed font-medium">
                Sube el formulario de Historia Clínica / Examen Médico Ocupacional. El sistema extraerá todos los campos automáticamente empleando nuestro motor de Inteligencia Artificial.
            </p>
            <div className="w-full relative z-10">
                <EstudioUploadReview pacienteId={pacienteId} tipoEstudio={'historia_clinica' as any} onSaved={loadData} />
            </div>
        </div>
    )

    // Extraer grupos
    const personales = getGroup(resultados, 'Datos Personales')
    const vitales = getGroup(resultados, 'Signos Vitales')
    const appat = getGroup(resultados, 'Antecedentes Patológicos')
    const apnp = getGroup(resultados, 'APNP')
    const ahf = getGroup(resultados, 'AHF')
    const laboral = getGroup(resultados, 'Historia Laboral')
    const efisica = getGroup(resultados, 'Exploración Física')
    const diagnosticos = getGroup(resultados, 'Diagnóstico')

    const aptitud = getField(resultados, 'APTITUD_LABORAL')
    const aptitudOk = aptitud.toLowerCase().startsWith('apto') && !aptitud.toLowerCase().includes('restricci')
    const nombre = getField(resultados, 'NOMBRE_COMPLETO') || `${(resultados.find(r => r.parametro_nombre === 'NOMBRE_COMPLETO')?.resultado) || ''}`

    // Alertas
    const alertas: string[] = []
    const diabDx = appat.find(r => r.name === 'DIABETES' && (r.value.startsWith('Sí') || r.value.startsWith('Si')))
    if (diabDx) alertas.push('Diabetes mellitus — requiere control glucémico')
    const htaDx = appat.find(r => r.name === 'HIPERTENSION' && (r.value.startsWith('Sí') || r.value.startsWith('Si')))
    if (htaDx) alertas.push('Hipertensión arterial — monitoreo periódico')
    const tabaco = apnp.find(r => r.name === 'TABACO' && r.value.toLowerCase().includes('í'))
    if (tabaco) alertas.push(`Tabaquismo activo: ${tabaco.desc || tabaco.value}`)
    if (!aptitudOk && aptitud) alertas.push(`Aptitud: ${aptitud}`)

    // Signos vitales para orbs
    const svMap: Record<string, string> = {}
    vitales.forEach(v => { svMap[v.name] = v.value })

    return (
        <div className="space-y-5">

            {/* HEADER */}
            <div className={`bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 ${alertas.length > 0 ? 'border-amber-500/30' : 'border-white/10'}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                            <ClipboardList className="w-7 h-7 text-white drop-shadow-md" />
                        </div>
                        <div>
                            <h3 className="text-xl font-extrabold text-white tracking-tight">Historia Clínica</h3>
                            <p className="text-sm font-medium text-slate-400 mt-0.5">
                                {nombre || 'Examen Médico Ocupacional'} {estudio?.fecha_estudio ? <><span className="text-emerald-400/80 mx-1.5">•</span>{new Date(estudio.fecha_estudio).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</> : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <EstudioUploadReview pacienteId={pacienteId} tipoEstudio={'historia_clinica' as any} onSaved={loadData} isCompact />
                        {aptitud && (
                            <div className={`px-4 py-2.5 rounded-2xl border backdrop-blur-md flex flex-col justify-center ${aptitudOk ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Aptitud Laboral</p>
                                <div className="flex items-center gap-1.5">
                                    {aptitudOk
                                        ? <CheckCircle className="w-4 h-4 text-emerald-400 drop-shadow-sm" />
                                        : <AlertTriangle className="w-4 h-4 text-amber-400 drop-shadow-sm" />}
                                    <p className={`text-sm font-bold ${aptitudOk ? 'text-emerald-300' : 'text-amber-300'}`}>{aptitud}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {alertas.length > 0 && (
                    <div className="mt-4 space-y-1.5">
                        {alertas.map((a, i) => (
                            <motion.div key={i} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.06 }}
                                className="flex items-start gap-2.5 px-3.5 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl backdrop-blur-md">
                                <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                                <p className="text-sm font-semibold text-amber-100/90">{a}</p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* SIGNOS VITALES — orb cards */}
            {vitales.length > 0 && (
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-black text-white uppercase tracking-widest">Signos Vitales y Somatometría</h4>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {vitales.filter(v => v.value).map((v, i) => {
                            const warn =
                                (v.name === 'IMC' && (Number(v.value) > 25 || Number(v.value) < 18.5)) ||
                                (v.name === 'TENSION_ARTERIAL' && Number(v.value.split('/')[0]) >= 130) ||
                                (v.name === 'GLUCOSA_CAPILAR' && Number(v.value) >= 100) ||
                                (v.name === 'SPO2' && Number(v.value) < 95) ||
                                (v.name === 'FRECUENCIA_CARDIACA' && (Number(v.value) > 100 || Number(v.value) < 60))

                            const label = v.name.replace(/_/g, ' ').replace('FRECUENCIA ', 'F.')
                            const gradients = ['from-rose-500 to-pink-600', 'from-red-500 to-rose-600', 'from-amber-500 to-orange-500', 'from-cyan-500 to-blue-600', 'from-violet-500 to-purple-600', 'from-emerald-500 to-teal-600']

                            return (
                                <motion.div key={v.name} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.05 }}
                                    className="flex flex-col items-center gap-1.5">
                                    <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${warn ? 'from-amber-500 to-orange-600' : gradients[i % 6]} flex flex-col items-center justify-center shadow-lg`}>
                                        <span className="text-[10px] font-black text-white leading-none px-1 text-center">{v.value}</span>
                                        {v.unit && <span className="text-[7px] text-white/70">{v.unit}</span>}
                                        {warn && <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-300 rounded-full border-2 border-slate-900" />}
                                    </div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-wide text-center leading-tight">{label}</p>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* TABS */}
            <div className="flex gap-1.5 p-1.5 bg-slate-900/40 border border-white/10 rounded-2xl w-fit backdrop-blur-md">
                {(['scanner', 'analisis'] as const).map(s => (
                    <button key={s} onClick={() => setActiveSection(s)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSection === s ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                        {s === 'scanner' ? '📋 Vista Formulario' : '🧠 Análisis IA'}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">

                {/* ══════════════ FORMULARIO / SCANNER ══════════════ */}
                {activeSection === 'scanner' && (
                    <motion.div key="sc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">

                        {personales.length > 0 && (
                            <Section title="Datos Personales e Identificación" icon={User} color="from-blue-500 to-indigo-600">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                                    {personales.map(f => <Field key={f.name} label={f.name.replace(/_/g, ' ')} value={f.value} unit={f.unit} />)}
                                </div>
                            </Section>
                        )}

                        {appat.length > 0 && (
                            <Section title="Antecedentes Personales Patológicos" icon={Heart} color="from-rose-500 to-pink-600">
                                <div className="space-y-1.5 pt-1">
                                    {appat.map(f => (
                                        <div key={f.name}>
                                            <YesNo label={f.name.replace(/_/g, ' ')} value={f.value} isWarning />
                                            {f.desc && (
                                                <p className="text-[10px] text-slate-500 pl-4 mt-0.5 leading-relaxed">{f.desc}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        )}

                        {apnp.length > 0 && (
                            <Section title="Antecedentes Personales No Patológicos" icon={Dumbbell} color="from-amber-500 to-orange-600">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                                    {apnp.map(f => (
                                        <div key={f.name}>
                                            {['TABACO', 'ALCOHOL', 'DROGAS', 'EJERCICIO', 'CAFE'].includes(f.name)
                                                ? <YesNo label={f.name.replace(/_/g, ' ')} value={f.value} />
                                                : <Field label={f.name.replace(/_/g, ' ')} value={f.value} unit={f.unit} />}
                                            {f.desc && <p className="text-[10px] text-slate-500 pl-2 leading-tight">{f.desc}</p>}
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        )}

                        {ahf.length > 0 && (
                            <Section title="Antecedentes Heredofamiliares" icon={Shield} color="from-violet-500 to-purple-600">
                                <div className="space-y-1.5 pt-1">
                                    {ahf.map(f => (
                                        <div key={f.name}>
                                            <YesNo label={f.name.replace(/^AHF_/, '').replace(/_/g, ' ')} value={f.value} isWarning />
                                            {f.desc && <p className="text-[10px] text-slate-500 pl-4 mt-0.5">{f.desc}</p>}
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        )}

                        {laboral.length > 0 && (
                            <Section title="Historia Laboral y Riesgos Ocupacionales" icon={Briefcase} color="from-indigo-500 to-blue-600">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                    {laboral.map(f => <Field key={f.name} label={f.name.replace(/_/g, ' ')} value={f.value} unit={f.unit} warn={f.name.includes('RIESGO') || f.name.includes('ACCIDENTE')} />)}
                                </div>
                            </Section>
                        )}

                        {efisica.length > 0 && (
                            <Section title="Exploración Física" icon={Stethoscope} color="from-cyan-500 to-blue-600">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                    {efisica.map(f => <Field key={f.name} label={f.name.replace(/^EF_/, '').replace(/_/g, ' ')} value={f.value} warn={f.name.includes('HALLAZGO')} />)}
                                </div>
                            </Section>
                        )}

                        {diagnosticos.length > 0 && (
                            <Section title="Diagnóstico y Aptitud Laboral" icon={ClipboardList} color="from-emerald-500 to-teal-600">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                    {diagnosticos.map(f => <Field key={f.name} label={f.name.replace(/_/g, ' ')} value={f.value} warn={f.name.includes('RESTRICCION') || f.name.includes('NO_APTO')} />)}
                                </div>
                            </Section>
                        )}

                        <DocumentosAdjuntos pacienteId={pacienteId} categoria="historia_clinica" titulo="Historia Clínica Original" collapsedByDefault={false} />
                    </motion.div>
                )}

                {/* ══════════════ ANÁLISIS IA ══════════════ */}
                {activeSection === 'analisis' && (
                    <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">

                        {/* Header IA */}
                        <div className="bg-gradient-to-br from-emerald-950 via-teal-900/50 to-slate-900/80 rounded-[2rem] border border-emerald-500/20 backdrop-blur-xl p-6 text-white shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
                            <div className="flex items-center gap-4 mb-4 relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center"><Brain className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" /></div>
                                <div>
                                    <p className="font-extrabold text-lg text-white tracking-tight">Análisis Integrado de Historia Clínica</p>
                                    <p className="text-emerald-400/80 text-sm font-medium">Interpretación clínica — Medicina Ocupacional</p>
                                </div>
                            </div>
                            <p className="text-sm font-medium text-emerald-100/70 leading-relaxed max-w-4xl relative z-10">
                                {getField(resultados, 'DIAGNOSTICOS') ||
                                    `Examen médico ocupacional completado. ${alertas.length === 0 ? 'Sin hallazgos clínicos de relevancia.' : `${alertas.length} hallazgos que requieren atención.`}`}
                            </p>
                        </div>

                        {/* Alertas clínicas */}
                        {alertas.length > 0 && (
                            <div className="rounded-[2rem] border border-amber-500/30 bg-amber-500/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-md p-6 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-50 pointer-events-none" />
                                <div className="flex items-center gap-3 mb-4 relative z-10">
                                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex flex-col items-center justify-center">
                                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <p className="text-sm font-black text-amber-400 tracking-widest uppercase">Alertas Clínicas</p>
                                </div>
                                <ul className="space-y-2 relative z-10">
                                    {alertas.map((a, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm font-semibold text-amber-100/90 bg-amber-500/5 p-3 rounded-xl border border-amber-500/20">
                                            <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5 drop-shadow-md" />{a}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Análisis por sistemas */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 z-10 relative">

                            {/* Metabólico */}
                            <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl p-6">
                                <div className="flex items-center gap-3 mb-5"><Gauge className="w-5 h-5 text-amber-500 drop-shadow-md" /><p className="text-sm font-black text-white uppercase tracking-widest">Perfil Metabólico</p></div>
                                <div className="space-y-3 text-sm text-slate-300 font-medium">
                                    {(() => {
                                        const imc = vitales.find(v => v.name === 'IMC')
                                        const glu = vitales.find(v => v.name === 'GLUCOSA_CAPILAR')
                                        const ta = vitales.find(v => v.name === 'TENSION_ARTERIAL')
                                        return (
                                            <>
                                                {imc && <div className="p-3 bg-white/5 border border-white/10 rounded-xl leading-relaxed"><strong>IMC {imc.value} kg/m²</strong> — {Number(imc.value) > 30 ? <span className="text-amber-400">Obesidad — riesgo cardiovascular elevado</span> : Number(imc.value) > 25 ? <span className="text-yellow-400">Sobrepeso — control nutricional recomendado</span> : <span className="text-emerald-400">IMC dentro de rango normal</span>}</div>}
                                                {glu && <div className="p-3 bg-white/5 border border-white/10 rounded-xl leading-relaxed"><strong>Glucosa capilar {glu.value} mg/dL</strong> — {Number(glu.value) >= 126 ? <span className="text-rose-400">Compatible con diabetes — laboratorio confirmatorio</span> : Number(glu.value) >= 100 ? <span className="text-amber-400">Prediabetes — cambios en estilo de vida</span> : <span className="text-emerald-400">Glucemia normal en ayuno</span>}</div>}
                                                {ta && <div className="p-3 bg-white/5 border border-white/10 rounded-xl leading-relaxed"><strong>T/A {ta.value} mmHg</strong> — {Number(ta.value.split('/')[0]) >= 140 ? <span className="text-rose-400">Hipertensión grado 2 — tratamiento médico</span> : Number(ta.value.split('/')[0]) >= 130 ? <span className="text-amber-400">Hipertensión grado 1 — monitoreo</span> : <span className="text-emerald-400">Presión arterial normal</span>}</div>}
                                                {!imc && !glu && !ta && <p className="text-slate-500 py-4 text-center border border-white/5 rounded-xl border-dashed">Sin datos de signos vitales disponibles</p>}
                                            </>
                                        )
                                    })()}
                                </div>
                            </div>

                            {/* Riesgos ocupacionales */}
                            <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl p-6">
                                <div className="flex items-center gap-3 mb-5"><Briefcase className="w-5 h-5 text-indigo-400 drop-shadow-md" /><p className="text-sm font-black text-white uppercase tracking-widest">Riesgo Ocupacional</p></div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {[
                                        { key: 'RIESGOS_FISICOS', label: 'Físicos', color: 'blue' },
                                        { key: 'RIESGOS_QUIMICOS', label: 'Químicos', color: 'amber' },
                                        { key: 'RIESGOS_BIOLOGICOS', label: 'Biológicos', color: 'emerald' },
                                        { key: 'RIESGOS_ERGONOMICOS', label: 'Ergonómicos', color: 'violet' },
                                        { key: 'RIESGOS_PSICOSOCIALES', label: 'Psicosociales', color: 'rose' },
                                    ].map(({ key, label, color }) => {
                                        const val = getField(resultados, key)
                                        if (!val || val.toLowerCase().includes('ninguno') || val === 'No aplica') return null
                                        return (
                                            <div key={key} className={`p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
                                                <p className={`text-[10px] font-black uppercase tracking-widest text-${color}-400 mb-1`}>{label}</p>
                                                <p className="text-xs font-medium text-white/90 leading-relaxed">{val}</p>
                                            </div>
                                        )
                                    }).filter(Boolean)}
                                    {!laboral.some(l => l.name.includes('RIESGO')) && (
                                        <div className="col-span-full py-8 text-center border border-white/5 rounded-xl border-dashed">
                                            <p className="text-sm font-bold text-slate-500">Sin riesgos registrados</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Antecedentes relevantes para salud ocupacional */}
                        <div className="rounded-[2rem] border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-slate-900/60 to-slate-900/80 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl p-6 relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-5 relative z-10">
                                <Brain className="w-5 h-5 text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.6)]" />
                                <p className="text-sm font-black text-white uppercase tracking-widest">Interpretación Clínica Integral</p>
                            </div>
                            <div className="space-y-4 text-sm font-medium text-slate-300 leading-relaxed relative z-10">
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                    <strong className="text-white block mb-1">Antecedentes patológicos:</strong>
                                    {appat.filter(a => a.value.toLowerCase().startsWith('sí') || a.value.toLowerCase().startsWith('si')).length === 0
                                        ? 'Sin antecedentes patológicos de relevancia reportados.'
                                        : <span className="text-violet-200">Se identifican: {appat.filter(a => a.value.toLowerCase().startsWith('sí') || a.value.toLowerCase().startsWith('si')).map(a => a.name.replace(/_/g, ' ')).join(', ')}.</span>}
                                </div>
                                {tabaco && (
                                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-200/90">
                                        <strong className="text-amber-400 block mb-1">Tabaquismo:</strong> Factor de riesgo cardiovascular y respiratorio. Considerar espirometría de control y educación para cesación tabáquica.
                                    </div>
                                )}
                                {laboral.some(l => l.name === 'EPP_UTILIZADO') && (
                                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                        <strong className="text-white block mb-1">EPP:</strong> {getField(resultados, 'EPP_UTILIZADO')}
                                    </div>
                                )}
                                <div className={`p-4 rounded-2xl border flex flex-col justify-center ${aptitudOk ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                                    <p className={`font-black text-xs tracking-widest uppercase mb-1 ${aptitudOk ? 'text-emerald-400' : 'text-amber-400'}`}>Dictamen de Aptitud</p>
                                    <p className="text-white font-semibold text-base">{aptitud || (aptitudOk ? 'APTO para el puesto de trabajo sin restricciones.' : 'Pendiente de evaluación definitiva.')}</p>
                                    {getField(resultados, 'RESTRICCIONES_LABORALES') && (
                                        <p className="text-amber-300 mt-2 p-2 bg-amber-500/20 rounded-lg text-xs leading-relaxed border border-amber-500/30"><strong className="text-amber-400 uppercase tracking-widest font-black text-[10px]">Restricciones:</strong><br />{getField(resultados, 'RESTRICCIONES_LABORALES')}</p>
                                    )}
                                </div>
                                {getField(resultados, 'PLAN_SEGUIMIENTO') && (
                                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                                        <p className="font-black text-xs text-blue-400 tracking-widest uppercase mb-1">Plan de Seguimiento</p>
                                        <p className="text-blue-100/90 leading-relaxed font-semibold">{getField(resultados, 'PLAN_SEGUIMIENTO')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recomendaciones */}
                        <div className="rounded-[2rem] border border-cyan-500/30 bg-gradient-to-br from-cyan-900/40 via-slate-900/60 to-slate-900/80 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl p-6">
                            <div className="flex items-center gap-3 mb-5"><Shield className="w-5 h-5 text-cyan-400 drop-shadow-md" /><p className="text-sm font-black text-white uppercase tracking-widest">Recomendaciones</p></div>
                            <ul className="space-y-3">
                                {[
                                    getField(resultados, 'RECOMENDACIONES_MEDICAS'),
                                    !aptitudOk && 'Valoración médica especializada antes de reiniciar actividades',
                                    tabaco && 'Programa de cesación tabáquica — Clínica del tabaco',
                                    diabDx && 'Control glucémico — HbA1c + consulta con endocrinólogo',
                                    htaDx && 'Control de presión arterial — MAPA o automonitoreo domiciliario',
                                    getField(resultados, 'PROXIMO_EXAMEN') ? `Próxima revisión: ${getField(resultados, 'PROXIMO_EXAMEN')}` : 'Control anual según protocolo de salud ocupacional',
                                ].filter(Boolean).map((r, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm font-semibold text-cyan-100/90 bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/20">
                                        <ArrowRight className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5 drop-shadow-md" /><span className="leading-relaxed">{r as string}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
