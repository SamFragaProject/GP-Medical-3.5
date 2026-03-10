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
function Section({ title, icon: Icon, color, children, defaultOpen = true }: {
    title: string; icon: any; color: string; children: React.ReactNode; defaultOpen?: boolean
}) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <button onClick={() => setOpen(!open)}
                className={`w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-slate-50`}>
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
                        <Icon className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-sm font-black text-slate-800">{title}</h4>
                </div>
                {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-4">{children}</div>
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
        <div className={`p-2.5 rounded-xl border ${warn ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
            <p className={`text-xs font-bold mt-0.5 leading-relaxed ${warn ? 'text-amber-700' : 'text-slate-700'}`}>
                {value}{unit ? ` ${unit}` : ''}
            </p>
        </div>
    )
}

// Indicador binario Sí/No
function YesNo({ label, value, isWarning }: { label: string; value: string; isWarning?: boolean }) {
    if (!value) return null
    const isSi = value.toLowerCase().startsWith('sí') || value.toLowerCase().startsWith('si') || value === 'true'
    const color = isSi && isWarning ? 'bg-amber-50 border-amber-200 text-amber-700' : isSi ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
    return (
        <div className={`flex items-center justify-between px-3 py-2 rounded-xl border ${color}`}>
            <span className="text-xs font-medium text-slate-700">{label}</span>
            <Badge variant="outline" className={`text-[9px] font-black ${isSi ? 'bg-rose-100 border-rose-300 text-rose-700' : 'bg-emerald-100 border-emerald-300 text-emerald-700'}`}>
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
        <Card className="border-0 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-8 h-8 text-emerald-300" />
            </div>
            <h3 className="text-slate-800 font-bold">Sin historia clínica registrada</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2 mb-6">
                Sube el formulario de Historia Clínica / Examen Médico Ocupacional. El sistema extraerá todos los campos automáticamente.
            </p>
            <div className="w-full">
                <EstudioUploadReview pacienteId={pacienteId} tipoEstudio={'historia_clinica' as any} onSaved={loadData} />
            </div>
        </Card>
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
            <div className={`bg-white rounded-2xl border shadow-sm p-5 ${alertas.length > 0 ? 'border-amber-200' : 'border-slate-100'}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                            <ClipboardList className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Historia Clínica</h3>
                            <p className="text-xs text-slate-400 font-medium">
                                {nombre || 'Examen Médico Ocupacional'} {estudio?.fecha_estudio ? `• ${new Date(estudio.fecha_estudio).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <EstudioUploadReview pacienteId={pacienteId} tipoEstudio={'historia_clinica' as any} onSaved={loadData} isCompact />
                        {aptitud && (
                            <div className={`px-4 py-2 rounded-xl border ${aptitudOk ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Aptitud Laboral</p>
                                <div className="flex items-center gap-1.5">
                                    {aptitudOk
                                        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                        : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                                    <p className={`text-sm font-bold ${aptitudOk ? 'text-emerald-700' : 'text-amber-700'}`}>{aptitud}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {alertas.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                        {alertas.map((a, i) => (
                            <motion.div key={i} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.06 }}
                                className="flex items-start gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
                                <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs font-medium text-amber-700">{a}</p>
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
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
                {(['scanner', 'analisis'] as const).map(s => (
                    <button key={s} onClick={() => setActiveSection(s)}
                        className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeSection === s ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
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
                        <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-5 text-white">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><Brain className="w-5 h-5" /></div>
                                <div>
                                    <p className="font-black text-sm">Análisis Integrado de Historia Clínica</p>
                                    <p className="text-emerald-200 text-xs">Interpretación clínica — Medicina Ocupacional</p>
                                </div>
                            </div>
                            <p className="text-sm text-emerald-100 leading-relaxed">
                                {getField(resultados, 'DIAGNOSTICOS') ||
                                    `Examen médico ocupacional completado. ${alertas.length === 0 ? 'Sin hallazgos clínicos de relevancia.' : `${alertas.length} hallazgos que requieren atención.`}`}
                            </p>
                        </div>

                        {/* Alertas clínicas */}
                        {alertas.length > 0 && (
                            <Card className="border-amber-200 bg-amber-50 shadow-sm">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                                        <p className="text-sm font-black text-amber-800 uppercase">Alertas Clínicas</p>
                                    </div>
                                    <ul className="space-y-2">
                                        {alertas.map((a, i) => (
                                            <li key={i} className="flex items-start gap-2.5 text-sm text-amber-700">
                                                <Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{a}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* Análisis por sistemas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Metabólico */}
                            <Card className="border-slate-100 shadow-sm">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-2 mb-3"><Gauge className="w-4 h-4 text-amber-500" /><p className="text-sm font-black text-slate-800 uppercase">Perfil Metabólico</p></div>
                                    <div className="space-y-2 text-sm text-slate-700">
                                        {(() => {
                                            const imc = vitales.find(v => v.name === 'IMC')
                                            const glu = vitales.find(v => v.name === 'GLUCOSA_CAPILAR')
                                            const ta = vitales.find(v => v.name === 'TENSION_ARTERIAL')
                                            return (
                                                <>
                                                    {imc && <p>• <strong>IMC {imc.value} kg/m²</strong> — {Number(imc.value) > 30 ? 'Obesidad — riesgo cardiovascular elevado' : Number(imc.value) > 25 ? 'Sobrepeso — control nutricional recomendado' : 'IMC dentro de rango normal'}</p>}
                                                    {glu && <p>• <strong>Glucosa capilar {glu.value} mg/dL</strong> — {Number(glu.value) >= 126 ? 'Compatible con diabetes — laboratorio confirmatorio' : Number(glu.value) >= 100 ? 'Prediabetes — cambios en estilo de vida' : 'Glucemia normal en ayuno'}</p>}
                                                    {ta && <p>• <strong>T/A {ta.value} mmHg</strong> — {Number(ta.value.split('/')[0]) >= 140 ? 'Hipertensión grado 2 — tratamiento médico' : Number(ta.value.split('/')[0]) >= 130 ? 'Hipertensión grado 1 — monitoreo' : 'Presión arterial normal'}</p>}
                                                    {!imc && !glu && !ta && <p className="text-slate-400">Sin datos de signos vitales disponibles</p>}
                                                </>
                                            )
                                        })()}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Riesgos ocupacionales */}
                            <Card className="border-slate-100 shadow-sm">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-2 mb-3"><Briefcase className="w-4 h-4 text-indigo-500" /><p className="text-sm font-black text-slate-800 uppercase">Riesgo Ocupacional</p></div>
                                    <div className="space-y-1.5">
                                        {[
                                            { key: 'RIESGOS_FISICOS', label: 'Físicos', color: 'blue' },
                                            { key: 'RIESGOS_QUIMICOS', label: 'Químicos', color: 'amber' },
                                            { key: 'RIESGOS_BIOLOGICOS', label: 'Biológicos', color: 'green' },
                                            { key: 'RIESGOS_ERGONOMICOS', label: 'Ergonómicos', color: 'violet' },
                                            { key: 'RIESGOS_PSICOSOCIALES', label: 'Psicosociales', color: 'rose' },
                                        ].map(({ key, label, color }) => {
                                            const val = getField(resultados, key)
                                            if (!val || val.toLowerCase().includes('ninguno') || val === 'No aplica') return null
                                            return (
                                                <div key={key} className={`p-2 rounded-lg bg-${color}-50 border border-${color}-100`}>
                                                    <p className={`text-[9px] font-black uppercase text-${color}-500 mb-0.5`}>{label}</p>
                                                    <p className="text-xs text-slate-700 leading-relaxed">{val}</p>
                                                </div>
                                            )
                                        }).filter(Boolean)}
                                        {!laboral.some(l => l.name.includes('RIESGO')) && (
                                            <p className="text-xs text-slate-400 text-center py-2">Sin riesgos registrados</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Antecedentes relevantes para salud ocupacional */}
                        <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-slate-50 to-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Brain className="w-4 h-4 text-violet-500" />
                                    <p className="text-sm font-black text-slate-800 uppercase">Interpretación Clínica Integral</p>
                                </div>
                                <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                                    <p>
                                        <strong className="text-slate-800">Antecedentes patológicos:</strong>{' '}
                                        {appat.filter(a => a.value.toLowerCase().startsWith('sí') || a.value.toLowerCase().startsWith('si')).length === 0
                                            ? 'Sin antecedentes patológicos de relevancia reportados.'
                                            : `Se identifican: ${appat.filter(a => a.value.toLowerCase().startsWith('sí') || a.value.toLowerCase().startsWith('si')).map(a => a.name.replace(/_/g, ' ')).join(', ')}.`}
                                    </p>
                                    {tabaco && (
                                        <p><strong className="text-slate-800">Tabaquismo:</strong> Factor de riesgo cardiovascular y respiratorio. Considerar espirometría de control y educación para cesación tabáquica.</p>
                                    )}
                                    {laboral.some(l => l.name === 'EPP_UTILIZADO') && (
                                        <p><strong className="text-slate-800">EPP:</strong> {getField(resultados, 'EPP_UTILIZADO')}</p>
                                    )}
                                    <div className={`p-4 rounded-xl border ${aptitudOk ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                                        <p className={`font-black text-xs uppercase mb-1 ${aptitudOk ? 'text-emerald-700' : 'text-amber-700'}`}>Dictamen de Aptitud</p>
                                        <p>{aptitud || (aptitudOk ? 'APTO para el puesto de trabajo sin restricciones.' : 'Pendiente de evaluación definitiva.')}</p>
                                        {getField(resultados, 'RESTRICCIONES_LABORALES') && (
                                            <p className="text-amber-600 mt-1"><strong>Restricciones:</strong> {getField(resultados, 'RESTRICCIONES_LABORALES')}</p>
                                        )}
                                    </div>
                                    {getField(resultados, 'PLAN_SEGUIMIENTO') && (
                                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                            <p className="font-black text-xs text-blue-600 uppercase mb-1">Plan de Seguimiento</p>
                                            <p className="text-slate-700">{getField(resultados, 'PLAN_SEGUIMIENTO')}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recomendaciones */}
                        <Card className="border-emerald-100 shadow-sm">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-3"><Shield className="w-4 h-4 text-emerald-500" /><p className="text-sm font-black text-slate-800 uppercase">Recomendaciones</p></div>
                                <ul className="space-y-2">
                                    {[
                                        getField(resultados, 'RECOMENDACIONES_MEDICAS'),
                                        !aptitudOk && 'Valoración médica especializada antes de reiniciar actividades',
                                        tabaco && 'Programa de cesación tabáquica — Clínica del tabaco',
                                        diabDx && 'Control glucémico — HbA1c + consulta con endocrinólogo',
                                        htaDx && 'Control de presión arterial — MAPA o automonitoreo domiciliario',
                                        getField(resultados, 'PROXIMO_EXAMEN') ? `Próxima revisión: ${getField(resultados, 'PROXIMO_EXAMEN')}` : 'Control anual según protocolo de salud ocupacional',
                                    ].filter(Boolean).map((r, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                            <ArrowRight className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /><span>{r as string}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
