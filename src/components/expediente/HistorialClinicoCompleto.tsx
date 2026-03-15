/**
 * HistorialClinicoCompleto — ECE Completo con datos demo
 * 
 * Integra: APNP, AHF, Historia Ocupacional, Exploración Física,
 * Consentimientos, Notas Médicas Versionadas, Línea de Tiempo,
 * y Exportación con filtros.
 */
import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Activity, Heart, Shield, Briefcase, Stethoscope, FileText,
    Calendar, Download, Clock, AlertTriangle, CheckCircle,
    User, Cigarette, Wine, Dumbbell, Coffee, Moon, Apple,
    Pill, GitBranch, ChevronDown, ChevronUp, Building2,
    Zap, Brain, Bone, Eye as EyeIcon, Ear, MapPin,
    Thermometer, Droplets, Scale, Ruler, Gauge, Pen, Loader2,
    Wind, FlaskConical, ArrowLeft
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { NotasMedicasVersionadas } from '@/components/expediente/NotasMedicasVersionadas'
import { ExportarHistorialDialog } from '@/components/expediente/ExportarHistorialDialog'
import { APNPForm } from '@/components/expediente/APNPForm'
import { AHFForm } from '@/components/expediente/AHFForm'
import { HistoriaOcupacionalList } from '@/components/expediente/HistoriaOcupacionalList'
import { ExploracionFisicaList } from '@/components/expediente/ExploracionFisicaList'
import AudiometriaTab from '@/components/expediente/AudiometriaTab'
import EspirometriaTab from '@/components/expediente/EspirometriaTab'
import ElectrocardiogramaTab from '@/components/expediente/ElectrocardiogramaTab'
import EstudiosVisualesTab from '@/components/expediente/EstudiosVisualesTab'
import LaboratorioTab from '@/components/expediente/LaboratorioTab'
import RayosXTab from '@/components/expediente/RayosXTab'
import OdontogramaTab from '@/components/expediente/OdontogramaTab'
// PatientDashboardTab moved to PerfilPaciente sidebar
import HistoriaClinicaTab from '@/components/expediente/HistoriaClinicaTab'
import { printExpedienteCompleto } from '@/components/expediente/ExportarPDFPaciente'
import { supabase } from '@/lib/supabase'
import { pacientesService } from '@/services/dataService'
import { getExpedienteDemoCompleto } from '@/data/demoPacienteCompleto'
import toast from 'react-hot-toast'

// =====================================================
// MAIN COMPONENT
// =====================================================
export default function HistorialClinicoCompleto({ pacienteId }: { pacienteId: string }) {
    const [activeTab, setActiveTab] = useState<string | null>(null)
    const [exportOpen, setExportOpen] = useState(false)
    const [loading, setLoading] = React.useState(true)
    const [expediente, setExpediente] = React.useState<any>(null)

    React.useEffect(() => {
        if (pacienteId) {
            loadExpedienteCompleto()
        }
    }, [pacienteId])

    const loadExpedienteCompleto = async () => {
        try {
            setLoading(true)

            // Cargar datos en paralelo para mayor velocidad
            const [
                { data: paciente },
                { data: apnp },
                { data: ahf },
                { data: historiaOcupacional },
                { data: exploracionesFisicas },
                { data: consentimientos },
                { data: notasMedicas },
                { data: eventosClinicos }
            ] = await Promise.all([
                supabase.from('pacientes').select('*').eq('id', pacienteId).single(),
                supabase.from('antecedentes_np').select('*').eq('paciente_id', pacienteId).maybeSingle(),
                supabase.from('antecedentes_hf').select('*').eq('paciente_id', pacienteId).maybeSingle(),
                supabase.from('historia_ocupacional').select('*').eq('paciente_id', pacienteId).order('fecha_inicio', { ascending: false }),
                supabase.from('exploraciones_fisicas').select('*').eq('paciente_id', pacienteId).order('fecha_exploracion', { ascending: false }),
                supabase.from('consentimientos_firmados').select('*').eq('paciente_id', pacienteId).order('fecha_firma', { ascending: false }),
                supabase.from('notas_medicas').select('*').eq('paciente_id', pacienteId).order('created_at', { ascending: false }),
                supabase.from('eventos_clinicos').select('*').eq('paciente_id', pacienteId).order('fecha_evento', { ascending: false })
            ])

            if ((!paciente && pacienteId !== 'demo-pac-1' && !pacienteId?.startsWith('demo')) || (!paciente && !pacienteId)) {
                toast.error('No se encontró el paciente')
                return
            }

            if (!paciente && pacienteId?.startsWith('demo')) {
                // Return full demo patient
                const demoData = getExpedienteDemoCompleto()
                setExpediente(demoData)
                return
            }

            const isDemoPatient = paciente?.nombre?.toLowerCase().includes('demo') ||
                paciente?.apellido_paterno?.toLowerCase().includes('demo') ||
                pacienteId?.startsWith('demo');

            const demoData = isDemoPatient ? getExpedienteDemoCompleto() : null;

            setExpediente({
                paciente,
                apnp: apnp || (isDemoPatient ? demoData?.apnp : {}),
                ahf: ahf || (isDemoPatient ? demoData?.ahf : {}),
                historiaOcupacional: historiaOcupacional?.length ? historiaOcupacional : (isDemoPatient ? demoData?.historiaOcupacional : []),
                exploracionesFisicas: exploracionesFisicas?.length ? exploracionesFisicas : (isDemoPatient ? demoData?.exploracionesFisicas : []),
                consentimientos: consentimientos?.length ? consentimientos : (isDemoPatient ? demoData?.consentimientos : []),
                notasMedicas: notasMedicas?.length ? notasMedicas : (isDemoPatient ? demoData?.notasMedicas : []),
                eventosClinicos: eventosClinicos?.length ? eventosClinicos : (isDemoPatient ? demoData?.eventosClinicos : [])
            })

        } catch (error) {
            console.error('Error cargando expediente:', error)
            toast.error('Error al cargar la historia clínica')
        } finally {
            setLoading(false)
        }
    }

    const handleExport = (filters: any, type: 'json' | 'pdf' = 'json') => {
        if (!expediente) return

        const exportData: any = {
            meta: {
                exportado_por: 'GPMedical ERP Pro',
                fecha_exportacion: new Date().toISOString(),
                paciente: `${expediente.paciente.nombre} ${expediente.paciente.apellido_paterno}`,
                filtros_aplicados: filters,
            },
            datos_personales: expediente.paciente,
        }
        if (filters.includeAPNP) exportData.apnp = expediente.apnp
        if (filters.includeAHF) exportData.ahf = expediente.ahf
        if (filters.includeHistoriaOcupacional) exportData.historia_ocupacional = expediente.historiaOcupacional
        if (filters.includeExploracionFisica) exportData.exploraciones_fisicas = expediente.exploracionesFisicas
        if (filters.includeConsentimientos) exportData.consentimientos = expediente.consentimientos
        if (filters.includeNotasMedicas) exportData.notas_medicas = expediente.notasMedicas
        if (filters.includeEventosClinicos) exportData.eventos_clinicos = expediente.eventosClinicos

        if (type === 'pdf') {
            printExpedienteCompleto(expediente.paciente, {
                laboratorio: { grupos: [] }, // You can pass actual labs if available
                exploracionFisica: expediente.exploracionesFisicas?.[0] || {},
                notasMedicas: expediente.notasMedicas || []
            })
            return;
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ECE_${expediente.paciente.apellido_paterno}_${expediente.paciente.nombre}_${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-slate-500 font-medium">Cargando expediente clínico...</p>
            </div>
        )
    }

    if (!expediente) {
        return (
            <Card className="border-0 shadow-lg text-center p-12">
                <p className="text-slate-500">No se pudo cargar la información del paciente.</p>
            </Card>
        )
    }

    const data = expediente

    const TABS = [
        { value: 'espirometria', label: 'Espirometría', icon: Wind, gradient: 'from-sky-400 to-blue-600', bg: 'bg-sky-50', text: 'text-sky-700', ring: 'ring-sky-300', desc: 'Análisis funcional respiratorio avanzado. FEV1 y gráficos dinámicos.', glow: '#0ea5e9', themeLight: '#00f2fe', themeDark: '#2563eb' },
        { value: 'audiometria', label: 'Audiometría', icon: Ear, gradient: 'from-emerald-400 to-green-600', bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-300', desc: 'Evaluación de frecuencias acústicas y daño timpánico.', glow: '#10b981', themeLight: '#34d399', themeDark: '#059669' },
        { value: 'rayosx', label: 'Rayos X Tórax', icon: Bone, gradient: 'from-purple-400 to-violet-600', bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-300', desc: 'Impresiones radiológicas digitalizadas y reporte estructurado.', glow: '#c084fc', themeLight: '#c084fc', themeDark: '#7e22ce' },
        { value: 'historia', label: 'Historia Clínica', icon: FileText, gradient: 'from-amber-400 to-orange-600', bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-300', desc: 'Ficha universal, antecedentes y registros base de salud.', glow: '#f59e0b', themeLight: '#fbbf24', themeDark: '#b45309' },
        { value: 'laboratorio', label: 'Laboratorio', icon: FlaskConical, gradient: 'from-green-500 to-emerald-600', bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-300', desc: 'Resultados de análisis clínicos y biometría hemática.', glow: '#22c55e', themeLight: '#4ade80', themeDark: '#166534' },
        { value: 'apnp', label: 'APNP', icon: Heart, gradient: 'from-rose-500 to-pink-600', bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-300', desc: 'Hábitos, estilo de vida y antecedentes personales.', glow: '#f43f5e', themeLight: '#fb7185', themeDark: '#be123c' },
        { value: 'ahf', label: 'AHF', icon: Shield, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-300', desc: 'Antecedentes hereditarios familiares y carga genética.', glow: '#8b5cf6', themeLight: '#a78bfa', themeDark: '#5b21b6' },
        { value: 'ocupacional', label: 'Ocupacional', icon: Briefcase, gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-300', desc: 'Empleos previos, riesgos de exposición y epp.', glow: '#f59e0b', themeLight: '#fbbf24', themeDark: '#b45309' },
        { value: 'exploracion', label: 'Exploración Física', icon: Stethoscope, gradient: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-50', text: 'text-cyan-700', ring: 'ring-cyan-300', desc: 'Signos vitales, somatometría y exploración detallada.', glow: '#06b6d4', themeLight: '#22d3ee', themeDark: '#0e7490' },
        { value: 'electrocardiograma', label: 'ECG', icon: Heart, gradient: 'from-red-500 to-rose-600', bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-300', desc: 'Electrocardiograma y análisis de ritmo cardiaco.', glow: '#ef4444', themeLight: '#f87171', themeDark: '#991b1b' },
        { value: 'vision', label: 'Visión', icon: EyeIcon, gradient: 'from-teal-500 to-emerald-600', bg: 'bg-teal-50', text: 'text-teal-700', ring: 'ring-teal-300', desc: 'Agudeza visual, campimetría y estudios optométricos.', glow: '#10b981', themeLight: '#2dd4bf', themeDark: '#0f766e' },
        { value: 'consentimientos', label: 'Consentimientos', icon: Pen, gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-300', desc: 'Consentimientos informados firmados digitalmente.', glow: '#3b82f6', themeLight: '#60a5fa', themeDark: '#1d4ed8' },
        { value: 'notas', label: 'Notas Médicas', icon: GitBranch, gradient: 'from-fuchsia-500 to-pink-600', bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', ring: 'ring-fuchsia-300', desc: 'Notas SOAPE clínicas con control de versiones GIT.', glow: '#d946ef', themeLight: '#f0abfc', themeDark: '#a21caf' },
        { value: 'timeline', label: 'Línea de Tiempo', icon: Clock, gradient: 'from-orange-500 to-amber-600', bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-300', desc: 'Cronología general de eventos, consultas y estudios.', glow: '#f97316', themeLight: '#fb923c', themeDark: '#c2410c' },
    ]

    return (
        <div className="space-y-4">
            {/* Export button */}
            <div className="flex justify-end mb-4">
                <Button onClick={() => setExportOpen(true)} variant="outline" className="rounded-xl gap-2 text-xs font-bold shadow-sm">
                    <Download className="w-4 h-4" /> Exportar Historial
                </Button>
            </div>

            <Tabs value={activeTab || 'none'} onValueChange={(val) => setActiveTab(val === 'none' ? null : val)} className="w-full">
                {/* ═══ PREMIUM ELITE GLASSMORPHISM CARDS GRID ═══ */}
                <AnimatePresence mode="wait">
                    {!activeTab && (
                        <motion.div
                            key="cards-grid"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10 w-full"
                        >
                            {TABS.map((tab, idx) => {
                                const isActive = activeTab === tab.value;
                        return (
                            <motion.button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value)}
                                style={{
                                    '--theme-light': tab.themeLight,
                                    '--theme-dark': tab.themeDark,
                                } as React.CSSProperties}
                                className="relative rounded-3xl p-6 flex flex-col z-[1] cursor-pointer text-left overflow-hidden group transition-transform duration-400 ease-out hover:-translate-y-2 hover:scale-[1.02] min-h-[240px]"
                                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: idx * 0.03, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                            >
                                {/* Base dark glassy background */}
                                <div className="absolute inset-0 bg-gradient-to-b from-slate-800/40 to-slate-950/80 -z-10 rounded-3xl" />
                                
                                {/* Gradient Mask Border (System Update Blue style) */}
                                <div className="absolute inset-0 rounded-3xl p-[2px] pointer-events-none z-[2]"
                                    style={{
                                        background: 'linear-gradient(135deg, var(--theme-light) 0%, transparent 40%, transparent 60%, var(--theme-dark) 100%)',
                                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                        WebkitMaskComposite: 'xor',
                                        maskComposite: 'exclude',
                                    }}
                                />

                                {/* Outer Glow Effect (Expands on hover) */}
                                <div className="absolute inset-0 rounded-3xl -z-10 opacity-25 group-hover:opacity-70 blur-[20px] group-hover:blur-[35px] transition-all duration-400 ease-out"
                                    style={{ background: 'linear-gradient(135deg, var(--theme-light) 0%, transparent 40%, transparent 60%, var(--theme-dark) 100%)' }}
                                />

                                {/* Internal Top Glare (Reflection for depth) */}
                                <div className="absolute top-0 left-0 right-0 h-[60%] rounded-t-3xl pointer-events-none"
                                    style={{ background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.03) 0%, transparent 70%)' }}
                                />

                                {/* Floating 3D Pro Icon Block */}
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center relative bg-slate-950 z-10 mb-5 shadow-[0_10px_20px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.15)] flex-shrink-0">
                                    <div className="absolute inset-[2px] rounded-[10px] flex items-center justify-center text-white"
                                        style={{ background: 'linear-gradient(135deg, var(--theme-light), var(--theme-dark))' }}>
                                        <div className="absolute inset-0 rounded-[10px]" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%)' }} />
                                        <tab.icon className="w-[22px] h-[22px] relative z-10" strokeWidth={1.8} style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }} />
                                    </div>
                                </div>

                                {/* Typography Stack */}
                                <div className="z-10 relative flex flex-col gap-1.5 flex-1">
                                    <h3 className="text-white text-base font-bold m-0 tracking-tight">{tab.label}</h3>
                                    <p className="text-slate-400 text-xs font-medium m-0 leading-relaxed line-clamp-3">{tab.desc}</p>
                                </div>

                                {/* White Pill Action Button */}
                                <div className="mt-auto pt-6 z-10 w-full relative">
                                    <div className="w-full h-10 rounded-full bg-white text-black font-extrabold text-[12px] flex justify-center items-center shadow-[0_4px_15px_rgba(255,255,255,0.15)] transition-transform duration-200 group-hover:scale-105">
                                        {isActive ? 'Estudio Activo' : 'Abrir Estudio'}
                                    </div>
                                </div>

                                {/* Active Highlight */}
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeEliteGlow"
                                            className="absolute bottom-0 left-[30%] right-[30%] h-[3px] rounded-t-full z-[3]"
                                            style={{ background: 'var(--theme-light)', boxShadow: '0 -2px 15px 1px var(--theme-light)' }}
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        />
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        );
                    })}
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <TabsList className="hidden">
                    {TABS.map(tab => (
                        <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                    ))}
                    <TabsTrigger value="none">None</TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                    {activeTab && (
                        <motion.div
                            key="active-tab-overlay"
                            initial={{ opacity: 0, scale: 0.98, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 15 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="relative w-full overflow-hidden rounded-3xl border border-white/5 shadow-2xl"
                            style={{
                                /* Premium Dark Glass Background Effect */
                                background: 'linear-gradient(135deg, rgba(15,23,42,0.6) 0%, rgba(2,6,23,0.8) 100%)',
                                backdropFilter: 'blur(40px) saturate(1.5)',
                                WebkitBackdropFilter: 'blur(40px) saturate(1.5)',
                            }}
                        >
                            {/* Sticky Back Button Aero Header (In-page) */}
                            <div className="sticky top-0 z-50 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 gap-4"
                                 style={{
                                     background: 'linear-gradient(to bottom, rgba(15,23,42,0.8) 0%, rgba(15,23,42,0.3) 100%)',
                                     backdropFilter: 'blur(20px)',
                                     boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
                                 }}
                            >
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setActiveTab(null)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all font-extrabold border border-white/10 shadow-sm group"
                                    >
                                        <ArrowLeft className="w-5 h-5 text-emerald-400 group-hover:-translate-x-1 transition-transform" />
                                        <span className="hidden sm:inline">Volver</span>
                                    </button>
                                    <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />
                                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                        {(() => {
                                            const t = TABS.find(t => t.value === activeTab);
                                            const Icon = t?.icon || FileText;
                                            return <div className="p-2 rounded-xl bg-white/5 border border-white/10 shadow-sm hidden sm:block"><Icon className="w-5 h-5 text-emerald-400" /></div>;
                                        })()}
                                        {TABS.find(t => t.value === activeTab)?.label}
                                    </h2>
                                </div>
                            </div>

                            {/* Content Container (Tab Contents) */}
                            <div className="p-4 sm:p-6 lg:p-8 min-h-[60vh]">
                                <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

                                    {/* ═══ HISTORIA CLÍNICA ═══ */}
                                    <TabsContent value="historia" className="mt-0">
                                        <HistoriaClinicaTab pacienteId={pacienteId} />
                                    </TabsContent>

                                    {/* ═══ APNP ═══ */}
                                    <TabsContent value="apnp" className="mt-0">
                                        <APNPTab apnp={data.apnp} pacienteId={pacienteId} reload={loadExpedienteCompleto} />
                                    </TabsContent>

                                    {/* ═══ AHF ═══ */}
                                    <TabsContent value="ahf" className="mt-0">
                                        <AHFTab ahf={data.ahf} pacienteId={pacienteId} reload={loadExpedienteCompleto} />
                                    </TabsContent>

                                    {/* ═══ OCUPACIONAL ═══ */}
                                    <TabsContent value="ocupacional" className="mt-0">
                                        <HistoriaOcupacionalList data={data.historiaOcupacional} expedienteId={pacienteId} />
                                    </TabsContent>

                                    {/* ═══ EXPLORACIÓN FÍSICA ═══ */}
                                    <TabsContent value="exploracion" className="mt-0 space-y-8">
                                        <ExploracionFisicaList data={data.exploracionesFisicas} expedienteId={pacienteId} />
                                        <Separator />
                                        <OdontogramaTab />
                                    </TabsContent>

                                    {/* ═══ AUDIOMETRÍA ═══ */}
                                    <TabsContent value="audiometria" className="mt-0">
                                        <AudiometriaTab pacienteId={pacienteId} />
                                    </TabsContent>

                                    {/* ═══ ESPIROMETRÍA ═══ */}
                                    <TabsContent value="espirometria" className="mt-0">
                                        <EspirometriaTab pacienteId={pacienteId} />
                                    </TabsContent>

                                    {/* ═══ ELECTROCARDIOGRAMA ═══ */}
                                    <TabsContent value="electrocardiograma" className="mt-0">
                                        <ElectrocardiogramaTab pacienteId={pacienteId} paciente={data.paciente} />
                                    </TabsContent>

                                    {/* ═══ VISIÓN ═══ */}
                                    <TabsContent value="vision" className="mt-0">
                                        <EstudiosVisualesTab pacienteId={pacienteId} />
                                    </TabsContent>

                                    {/* ═══ LABORATORIO ═══ */}
                                    <TabsContent value="laboratorio" className="mt-0">
                                        <LaboratorioTab pacienteId={pacienteId} />
                                    </TabsContent>

                                    {/* ═══ RAYOS X ═══ */}
                                    <TabsContent value="rayosx" className="mt-0">
                                        <RayosXTab pacienteId={pacienteId} />
                                    </TabsContent>

                                    {/* ═══ CONSENTIMIENTOS ═══ */}
                                    <TabsContent value="consentimientos" className="mt-0">
                                        <ConsentimientosTab consentimientos={data.consentimientos} />
                                    </TabsContent>

                                    {/* ═══ NOTAS MÉDICAS ═══ */}
                                    <TabsContent value="notas" className="mt-0">
                                        <NotasMedicasVersionadas notas={data.notasMedicas} />
                                    </TabsContent>

                                    {/* ═══ TIMELINE ═══ */}
                                    <TabsContent value="timeline" className="mt-0">
                                        <TimelineTab eventos={data.eventosClinicos} />
                                    </TabsContent>
                                    
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Tabs>

            <ExportarHistorialDialog
                open={exportOpen}
                onOpenChange={setExportOpen}
                pacienteNombre={`${data.paciente.nombre} ${data.paciente.apellido_paterno}`}
                onExport={handleExport}
            />
        </div>
    )
}



// =====================================================
// APNP TAB
// =====================================================
function APNPTab({ apnp, pacienteId, reload }: { apnp: any, pacienteId: string, reload: () => void }) {
    const [isEditing, setIsEditing] = useState(false);

    if (isEditing) {
        return <APNPForm
            expedienteId={pacienteId}
            data={apnp}
            onSuccess={() => { setIsEditing(false); reload() }}
            onCancel={() => setIsEditing(false)}
        />
    }

    const habits = [
        { icon: Cigarette, label: 'Tabaco', active: apnp.tabaco, detail: apnp.tabaco ? `${apnp.tabaco_cantidad} — ${apnp.tabaco_frecuencia}. ${apnp.tabaco_tiempo}` : 'Negado', color: apnp.tabaco ? 'amber' : 'emerald' },
        { icon: Wine, label: 'Alcohol', active: apnp.alcohol, detail: apnp.alcohol ? `${apnp.alcohol_frecuencia}. ${apnp.alcohol_cantidad}` : 'Negado', color: apnp.alcohol ? 'amber' : 'emerald' },
        { icon: Pill, label: 'Drogas', active: apnp.drogas, detail: apnp.drogas_tipo || 'Negado', color: apnp.drogas ? 'rose' : 'emerald' },
        { icon: Coffee, label: 'Café', active: apnp.cafe, detail: apnp.cafe ? `${apnp.cafe_tazas_diarias} tazas/día` : 'No consume', color: 'blue' },
        { icon: Dumbbell, label: 'Ejercicio', active: apnp.ejercicio, detail: apnp.ejercicio ? `${apnp.ejercicio_frecuencia}. ${apnp.ejercicio_tipo}` : 'Sedentario', color: apnp.ejercicio ? 'emerald' : 'amber' },
        { icon: Moon, label: 'Sueño', active: true, detail: `${apnp.sueno_horas}h — ${apnp.sueno_calidad}`, color: 'indigo' },
        { icon: Apple, label: 'Alimentación', active: true, detail: apnp.alimentacion_tipo, color: 'green' },
    ]

    return (
        <div className="space-y-3 relative">
            <div className="absolute right-0 top-0">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
                    <Pen className="w-4 h-4" /> Editar Datos
                </Button>
            </div>
            <SectionHeader icon={Heart} title="Antecedentes Personales No Patológicos" subtitle="Hábitos y estilo de vida" color="rose" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {habits.map(h => (
                    <EliteGlassCard key={h.label} className={`group transition-transform hover:scale-[1.02] ${h.active && h.color === 'rose' ? 'ring-1 ring-rose-500/30' : ''}`}>
                        <div className="p-4 flex items-start gap-3 relative z-10">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-${h.color}-500/10 border border-${h.color}-500/20`}>
                                <h.icon className={`w-4 h-4 text-${h.color}-400 drop-shadow-[0_0_8px_var(--tw-shadow-color)] shadow-${h.color}-500/50`} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-bold text-white/90">{h.label}</p>
                                    <Badge variant="outline" className={`text-[9px] bg-white/5 border-white/10 ${h.active && h.color !== 'emerald' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                        {h.active ? (h.color === 'emerald' || h.color === 'green' || h.color === 'blue' || h.color === 'indigo' ? '✓' : '⚠') : '✓ Negado'}
                                    </Badge>
                                </div>
                                <p className="text-xs text-white/50 leading-relaxed font-medium">{h.detail}</p>
                            </div>
                        </div>
                    </EliteGlassCard>
                ))}
            </div>
            {apnp.otros_habitos && (
                <EliteGlassCard>
                    <div className="p-4 relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Otros Hábitos</p>
                        <p className="text-sm text-white/80">{apnp.otros_habitos}</p>
                    </div>
                </EliteGlassCard>
            )}
        </div>
    )
}

// =====================================================
// AHF TAB
// =====================================================
function AHFTab({ ahf, pacienteId, reload }: { ahf: any, pacienteId: string, reload: () => void }) {
    const [isEditing, setIsEditing] = useState(false);

    if (isEditing) {
        return <AHFForm
            expedienteId={pacienteId}
            data={ahf}
            onSuccess={() => { setIsEditing(false); reload() }}
            onCancel={() => setIsEditing(false)}
        />
    }

    const items = [
        { label: 'Diabetes', present: ahf.diabetes, who: ahf.diabetes_quien, color: 'amber' },
        { label: 'Hipertensión', present: ahf.hipertension, who: ahf.hipertension_quien, color: 'rose' },
        { label: 'Cáncer', present: ahf.cancer, who: `${ahf.cancer_tipo} — ${ahf.cancer_quien}`, color: 'purple' },
        { label: 'Cardiopatías', present: ahf.cardiopatias, who: ahf.cardiopatias_quien, color: 'red' },
        { label: 'Enf. Mentales', present: ahf.enfermedades_mentales, who: ahf.enfermedades_mentales_quien, color: 'indigo' },
        { label: 'Enf. Respiratorias', present: ahf.enfermedades_respiratorias, who: ahf.enfermedades_respiratorias_quien, color: 'cyan' },
    ]

    return (
        <div className="space-y-3 relative">
            <div className="absolute right-0 top-0">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
                    <Pen className="w-4 h-4" /> Editar Datos
                </Button>
            </div>
            <SectionHeader icon={Shield} title="Antecedentes Heredofamiliares" subtitle="Carga genética y familiar" color="blue" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map(item => (
                    <EliteGlassCard key={item.label} className={`group transition-transform hover:scale-[1.02] ${item.present ? `ring-1 ring-${item.color}-500/30` : ''}`}>
                        <div className="p-4 flex items-center gap-3 relative z-10">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${item.present ? `bg-${item.color}-400 shadow-[0_0_10px_var(--tw-shadow-color)] shadow-${item.color}-500/50` : 'bg-white/10'}`} />
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-bold text-white/90">{item.label}</p>
                                    <Badge variant="outline" className={`text-[9px] bg-white/5 border-white/10 ${item.present ? 'text-amber-400' : 'text-emerald-400'}`}>
                                        {item.present ? 'Positivo' : 'Negado'}
                                    </Badge>
                                </div>
                                {item.present && item.who && <p className="text-xs text-white/50 leading-relaxed font-medium">{item.who}</p>}
                            </div>
                        </div>
                    </EliteGlassCard>
                ))}
            </div>
            {ahf.otros && (
                <EliteGlassCard>
                    <div className="p-4 relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Otros Antecedentes Familiares</p>
                        <p className="text-sm text-white/80 font-medium">{ahf.otros}</p>
                    </div>
                </EliteGlassCard>
            )}
        </div>
    )
}

// =====================================================
// OCUPACIONAL TAB
// =====================================================
function OcupacionalTab({ historias }: { historias: any[] }) {
    const [expanded, setExpanded] = useState<string | null>(historias[historias.length - 1]?.id || null)
    return (
        <div className="space-y-3">
            <SectionHeader icon={Briefcase} title="Historia Ocupacional" subtitle={`${historias.length} registros de empleo con riesgos y exposiciones`} color="amber" />
            {historias.map((h, idx) => {
                const isCurrent = !h.fecha_fin
                const isExp = expanded === h.id
                return (
                    <EliteGlassCard key={h.id} className={`transition-all ${isCurrent ? 'ring-1 ring-emerald-500/50' : ''}`}>
                        <div className="p-4 cursor-pointer flex items-center justify-between relative z-10" onClick={() => setExpanded(isExp ? null : h.id)}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCurrent ? 'bg-emerald-500/20 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-white/5 border border-white/10'}`}>
                                    <Building2 className={`w-5 h-5 ${isCurrent ? 'text-emerald-400' : 'text-white/60'}`} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-bold text-sm text-white/90">{h.empresa_anterior}</p>
                                        {isCurrent && <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border text-[9px] uppercase tracking-widest">Actual</Badge>}
                                    </div>
                                    <p className="text-xs text-white/50">{h.puesto} <span className="mx-1">•</span> {h.antiguedad}</p>
                                </div>
                            </div>
                            {isExp ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                        </div>
                        <AnimatePresence>
                            {isExp && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden relative z-10">
                                    <div className="h-px w-full bg-white/10" />
                                    <div className="p-4 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                            <RiskField label="Riesgos Físicos" value={h.riesgos_fisicos} color="blue" />
                                            <RiskField label="Riesgos Químicos" value={h.riesgos_quimicos} color="amber" />
                                            <RiskField label="Riesgos Biológicos" value={h.riesgos_biologicos} color="green" />
                                            <RiskField label="Riesgos Ergonómicos" value={h.riesgos_ergonomicos} color="purple" />
                                            <RiskField label="Riesgos Psicosociales" value={h.riesgos_psicosociales} color="rose" />
                                            <RiskField label="Exposiciones" value={h.exposiciones} color="red" />
                                        </div>
                                        <div className="h-px w-full bg-white/5" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                            <div className="bg-white/5 p-3 rounded-xl border border-white/5"><p className="font-black text-white/30 uppercase text-[10px] mb-1 tracking-wider">EPP Utilizado</p><p className="text-white/80 leading-relaxed font-medium">{h.epp_utilizado}</p></div>
                                            <div className="bg-white/5 p-3 rounded-xl border border-white/5"><p className="font-black text-white/30 uppercase text-[10px] mb-1 tracking-wider">Accidentes Laborales</p><p className="text-white/80 leading-relaxed font-medium">{h.accidentes_laborales}</p></div>
                                            <div className="bg-white/5 p-3 rounded-xl border border-white/5"><p className="font-black text-white/30 uppercase text-[10px] mb-1 tracking-wider">Enfermedades Laborales</p><p className="text-white/80 leading-relaxed font-medium">{h.enfermedades_laborales}</p></div>
                                            <div className="bg-white/5 p-3 rounded-xl border border-white/5"><p className="font-black text-white/30 uppercase text-[10px] mb-1 tracking-wider">Motivo de Separación</p><p className="text-white/80 leading-relaxed font-medium">{h.motivo_separacion || 'Empleo actual'}</p></div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </EliteGlassCard>
                )
            })}
        </div>
    )
}

function RiskField({ label, value, color }: { label: string; value?: string; color: string }) {
    if (!value || value === 'No aplica') return (
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <p className="font-black text-white/30 uppercase text-[10px] mb-0.5 tracking-widest">{label}</p>
            <p className="text-white/40 text-[11px] font-medium">No aplica</p>
        </div>
    )
    return (
        <div className={`p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/20 shadow-[inset_0_1px_4px_rgba(0,0,0,0.2)]`}>
            <p className={`font-black text-${color}-400 uppercase text-[10px] mb-1 tracking-widest`}>{label}</p>
            <p className="text-white/90 text-xs leading-relaxed font-medium">{value}</p>
        </div>
    )
}

// =====================================================
// EXPLORACIÓN FÍSICA TAB
// =====================================================
function VitalCard({ s, alertMsg }: { s: any, alertMsg: string | null }) {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <EliteGlassCard className={`relative transition-colors border-0 ${alertMsg && showTooltip ? 'ring-1 ring-rose-500/50' : 'hover:bg-white/[0.02]'}`}>
            <div className="p-3 text-center relative h-full flex flex-col justify-center z-10">
                {alertMsg && (
                    <button
                        onClick={() => setShowTooltip(!showTooltip)}
                        className="absolute top-1.5 right-1.5 text-rose-400 hover:text-rose-300 transition-colors focus:outline-none"
                    >
                        <AlertTriangle className={`w-3.5 h-3.5 ${showTooltip ? 'animate-pulse' : ''}`} />
                    </button>
                )}
                <p className={`text-xl font-black ${alertMsg ? 'text-rose-400' : 'text-white'}`}>{s.v}</p>
                <p className={`text-[9px] font-bold uppercase mt-1 ${alertMsg ? 'text-rose-400/70' : 'text-white/40'}`}>
                    {s.l} <span className="opacity-70">({s.u})</span>
                </p>

                <AnimatePresence>
                    {showTooltip && alertMsg && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 5 }}
                            className="absolute -top-16 left-1/2 -translate-x-1/2 z-50 w-40 bg-zinc-900/90 backdrop-blur-md text-white/90 text-[10px] p-2 rounded-lg font-medium leading-tight shadow-xl border border-white/10 pointer-events-none"
                        >
                            {alertMsg}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900/90 rotate-45 border-r border-b border-white/10" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </EliteGlassCard>
    );
}

function ExploracionTab({ exploraciones }: { exploraciones: any[] }) {
    const [selectedIdx, setSelectedIdx] = useState(0)
    const ef = exploraciones[selectedIdx]
    if (!ef) return null

    return (
        <div className="space-y-4">
            <SectionHeader icon={Stethoscope} title="Exploración Física Estructurada" subtitle="Signos vitales, somatometría, exploración por aparatos y sistemas" color="purple" />
            {/* Date selector */}
            <div className="flex gap-2 flex-wrap">
                {exploraciones.map((e, i) => (
                    <Button key={e.id} variant={selectedIdx === i ? 'default' : 'outline'}
                        size="sm" className={`rounded-xl text-xs ${selectedIdx === i ? 'bg-emerald-600' : ''}`}
                        onClick={() => setSelectedIdx(i)}>
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(e.fecha_exploracion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {i === 0 && <Badge className="ml-1 bg-white/20 text-[8px]">Última</Badge>}
                    </Button>
                ))}
            </div>

            {/* Vitals */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {[
                    { l: 'TA', v: `${ef.ta_sistolica}/${ef.ta_diastolica}`, u: 'mmHg', sys: ef.ta_sistolica, dia: ef.ta_diastolica },
                    { l: 'FC', v: ef.fc, u: 'lpm' },
                    { l: 'FR', v: ef.fr, u: 'rpm' },
                    { l: 'Temp', v: ef.temperatura, u: '°C' },
                    { l: 'SpO₂', v: ef.spo2, u: '%' },
                    { l: 'IMC', v: ef.imc, u: 'kg/m²' },
                    { l: 'Glucosa', v: ef.glucosa, u: 'mg/dL' },
                ].map(s => {
                    let alertMsg = null;
                    const val = Number(s.v);

                    if (s.l === 'TA') {
                        if (Number(s.sys) > 120 || Number(s.dia) > 80) alertMsg = 'Presión arterial elevada. Valores normales: sistólica < 120, diastólica < 80.';
                    } else if (!isNaN(val)) {
                        if (s.l === 'FC' && (val < 60 || val > 100)) alertMsg = 'Frecuencia cardíaca fuera de rango normal (60-100)';
                        if (s.l === 'FR' && (val < 12 || val > 20)) alertMsg = 'Frecuencia respiratoria fuera de rango normal (12-20)';
                        if (s.l === 'Temp' && (val < 36.5 || val > 37.5)) alertMsg = 'Temperatura anormal. Rango esperado: 36.5-37.5';
                        if (s.l === 'SpO₂' && val < 95) alertMsg = 'Saturación de oxígeno baja. Rango esperado: 95-100%';
                        if (s.l === 'IMC' && (val < 18.5 || val > 24.9)) alertMsg = 'IMC fuera de rango normal (18.5 - 24.9)';
                        if (s.l === 'Glucosa' && (val < 70 || val > 100)) alertMsg = 'Glucosa fuera de rango esperado (70 - 100)';
                    }

                    return (
                        <VitalCard key={s.l} s={s} alertMsg={alertMsg} />
                    );
                })}
            </div>

            {/* Somatometría */}
            <EliteGlassCard>
                <div className="p-4 pb-2"><h3 className="text-sm font-bold flex items-center gap-2 text-white"><Scale className="w-4 h-4 text-purple-400" /> Somatometría</h3></div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs p-4 pt-2">
                    <div><p className="text-[10px] font-black text-white/30 uppercase tracking-wider">Peso</p><p className="font-bold text-white/80">{ef.peso_kg} kg</p></div>
                    <div><p className="text-[10px] font-black text-white/30 uppercase tracking-wider">Talla</p><p className="font-bold text-white/80">{ef.talla_cm} cm</p></div>
                    <div><p className="text-[10px] font-black text-white/30 uppercase tracking-wider">IMC</p><p className={`font-bold ${(ef.imc || 0) > 25 ? 'text-amber-400' : 'text-emerald-400'}`}>{ef.imc} <span className="text-white/40 text-[10px]">({(ef.imc || 0) > 30 ? 'Obesidad' : (ef.imc || 0) > 25 ? 'Sobrepeso' : 'Normal'})</span></p></div>
                    <div><p className="text-[10px] font-black text-white/30 uppercase tracking-wider">Cintura</p><p className="font-bold text-white/80">{ef.cintura_cm} cm</p></div>
                    <div><p className="text-[10px] font-black text-white/30 uppercase tracking-wider">Cadera</p><p className="font-bold text-white/80">{ef.cadera_cm} cm</p></div>
                    <div><p className="text-[10px] font-black text-white/30 uppercase tracking-wider">ICC</p><p className="font-bold text-white/80">{ef.icc}</p></div>
                </div>
            </EliteGlassCard>

            {/* By System */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                    { l: 'Aspecto General', v: ef.aspecto_general, i: User },
                    { l: 'Piel', v: ef.piel, i: User },
                    { l: 'Cabeza', v: ef.cabeza, i: User },
                    { l: 'Ojos', v: ef.ojos, i: EyeIcon },
                    { l: 'Oídos', v: ef.oidos, i: Ear },
                    { l: 'Nariz y Boca', v: `${ef.nariz || ''} ${ef.boca || ''}`.trim(), i: User },
                    { l: 'Cuello', v: ef.cuello, i: User },
                    { l: 'Tórax', v: ef.torax, i: Activity },
                    { l: 'Abdomen', v: ef.abdomen, i: User },
                    { l: 'Columna Vertebral', v: ef.columna, i: Bone },
                    { l: 'Extremidades Superiores', v: ef.extremidades_superiores, i: User },
                    { l: 'Extremidades Inferiores', v: ef.extremidades_inferiores, i: User },
                    { l: 'Neurológico', v: ef.neurologico, i: Brain },
                    { l: 'Musculoesquelético', v: ef.osteomuscular_detalle, i: Bone },
                ].filter(s => s.v).map(s => (
                    <EliteGlassCard key={s.l}>
                        <div className="p-4 z-10 relative">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 flex items-center gap-1.5"><s.i className="w-3.5 h-3.5 text-white/40" />{s.l}</p>
                            <p className="text-sm text-white/80 leading-relaxed font-medium">{s.v}</p>
                        </div>
                    </EliteGlassCard>
                ))}
            </div>

            {ef.hallazgos_relevantes && (
                <Card className="border-amber-200 bg-amber-50/50">
                    <CardContent className="p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">⚠ Hallazgos Relevantes</p>
                        <p className="text-sm text-amber-800 font-medium">{ef.hallazgos_relevantes}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

// =====================================================
// CONSENTIMIENTOS TAB
// =====================================================
function ConsentimientosTab({ consentimientos }: { consentimientos: any[] }) {
    const [selectedConsent, setSelectedConsent] = useState<any | null>(null);

    return (
        <div className="space-y-3">
            <SectionHeader icon={Pen} title="Consentimientos Informados" subtitle="Firma digital con trazabilidad legal" color="cyan" />
            {consentimientos.map(c => (
                <EliteGlassCard key={c.id} className="transition-all hover:scale-[1.01] hover:brightness-110">
                    <div className="p-4 relative z-10">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="font-bold text-sm text-white/90">{c.titulo}</p>
                                <p className="text-xs text-white/50 mt-1 leading-relaxed">{c.contenido}</p>
                                <div className="flex flex-wrap gap-2 mt-3 text-[10px]">
                                    <Badge variant="outline" className="bg-white/5 text-white/60 border-white/10">v{c.version}</Badge>
                                    <Badge variant="outline" className="bg-white/5 text-white/60 border-white/10">Testigo: {c.testigo_nombre}</Badge>
                                    {c.ip_firma && <Badge variant="outline" className="bg-white/5 font-mono text-white/60 border-white/10">IP: {c.ip_firma}</Badge>}
                                </div>
                            </div>
                            <div className="ml-4 flex-shrink-0 text-center flex flex-col items-center justify-center gap-2">
                                {c.firmado ? (
                                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 w-full backdrop-blur-sm">
                                        <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-1 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <p className="text-[10px] font-bold text-emerald-400">Firmado</p>
                                        <p className="text-[9px] text-emerald-400/70">{c.fecha_firma ? new Date(c.fecha_firma).toLocaleDateString('es-MX') : ''}</p>
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 w-full backdrop-blur-sm">
                                        <Clock className="w-6 h-6 text-amber-500 mx-auto mb-1 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                        <p className="text-[10px] font-bold text-amber-500">Pendiente</p>
                                    </div>
                                )}
                                <Button
                                    size="sm"
                                    className="w-full text-[10px] font-bold h-7 bg-white text-black hover:bg-white/90"
                                    onClick={() => setSelectedConsent(c)}
                                >
                                    Ver Documento
                                </Button>
                            </div>
                        </div>
                    </div>
                </EliteGlassCard>
            ))}

            <Dialog open={!!selectedConsent} onOpenChange={(open) => !open && setSelectedConsent(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-none shadow-2xl">
                    {selectedConsent && (
                        <div className="bg-slate-50 relative">
                            <div className="sticky top-0 bg-white/80 backdrop-blur-md p-4 border-b border-slate-100 z-10 flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                        <Pen className="w-4 h-4 text-cyan-600" />
                                        {selectedConsent.titulo}
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                        Versión {selectedConsent.version} • {selectedConsent.fecha_firma ? new Date(selectedConsent.fecha_firma).toLocaleString('es-MX') : 'Borrador'}
                                    </p>
                                </div>
                            </div>

                            {/* Document Preview Mockup */}
                            <div className="p-8 bg-white mx-4 my-6 shadow-sm border border-slate-200 rounded-xl min-h-[400px]">
                                <div className="max-w-prose mx-auto text-sm text-slate-700 leading-relaxed font-serif">
                                    <div className="text-center mb-8 border-b border-slate-200 pb-4">
                                        <h1 className="text-xl font-bold uppercase mb-2">Consentimiento Informado</h1>
                                        <p className="text-slate-500">{selectedConsent.titulo}</p>
                                    </div>
                                    <p className="mb-4">
                                        Por medio de la presente, yo manifiesto mi conformidad y otórgo mi consentimiento informado para el procedimiento / investigación descrito a continuación:
                                    </p>
                                    <p className="p-4 bg-slate-50 rounded-lg italic text-slate-600 border border-slate-100 mb-8 whitespace-pre-wrap">
                                        {selectedConsent.contenido}
                                    </p>
                                    <p className="mb-12">
                                        Declaro que se me ha explicado claramente la naturaleza, propósitos, riesgos y beneficios del procedimiento en un lenguaje comprensible.
                                    </p>

                                    {/* Signatures Area */}
                                    <div className="mt-16 grid grid-cols-2 gap-12">
                                        <div className="text-center">
                                            <div className="h-20 border-b border-slate-300 relative flex items-end justify-center">
                                                {selectedConsent.firmado && (
                                                    <div className="font-[SignatureFont] text-3xl text-blue-900 absolute bottom-2 opacity-80 transform -rotate-3 mb-2 font-handwriting italic tracking-wider">
                                                        Firma Electrónica
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs font-bold mt-2">Paciente / Representante Legal</p>
                                            {selectedConsent.ip_firma && <p className="text-[9px] text-slate-400 font-mono mt-1">IP: {selectedConsent.ip_firma}</p>}
                                        </div>
                                        <div className="text-center">
                                            <div className="h-20 border-b border-slate-300 relative flex items-end justify-center">
                                                {selectedConsent.firmado && (
                                                    <div className="font-[SignatureFont] text-2xl text-slate-800 absolute bottom-2 opacity-60 mb-2 font-handwriting italic">
                                                        {selectedConsent.testigo_nombre}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs font-bold mt-2">Médico Responsable / Testigo</p>
                                        </div>
                                    </div>

                                    {/* Legal Metadata (Blockchain/Traceability simulation) */}
                                    {selectedConsent.firmado && (
                                        <div className="mt-12 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-center flex flex-col items-center">
                                            <Shield className="w-5 h-5 text-emerald-500 mb-1" />
                                            <p className="text-[9px] text-emerald-700 font-mono">
                                                Documento sellado digitalmente. SHA-256 Hash: {Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

// =====================================================
// TIMELINE TAB
// =====================================================
function TimelineTab({ eventos }: { eventos: any[] }) {
    const sorted = [...eventos].sort((a, b) => new Date(b.fecha_evento).getTime() - new Date(a.fecha_evento).getTime())
    const typeConfig: Record<string, { color: string; icon: any }> = {
        consulta: { color: 'emerald', icon: Stethoscope },
        examen: { color: 'blue', icon: FileText },
        prescripcion: { color: 'purple', icon: Pill },
        alerta: { color: 'amber', icon: AlertTriangle },
    }
    return (
        <div className="space-y-3">
            <SectionHeader icon={Clock} title="Línea de Tiempo Clínica" subtitle={`${eventos.length} eventos registrados`} color="slate" />
            <div className="relative pl-6 space-y-3">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-300 via-blue-300 to-slate-200" />
                {sorted.map((e, i) => {
                    const conf = typeConfig[e.tipo_evento] || typeConfig.consulta
                    const Icon = conf.icon
                    return (
                        <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                            className="relative">
                            <div className={`absolute -left-3 w-6 h-6 rounded-full bg-${conf.color}-100 border-2 border-${conf.color}-300 flex items-center justify-center z-10`}>
                                <Icon className={`w-3 h-3 text-${conf.color}-600`} />
                            </div>
                            <EliteGlassCard className="ml-6 transition-shadow group">
                                <div className="p-4 relative z-10">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white/80 leading-relaxed font-medium">{e.descripcion}</p>
                                            <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">{e.medico}</p>
                                        </div>
                                        <div className="text-right ml-3 flex-shrink-0">
                                            <p className="text-[10px] font-bold text-white/60">{new Date(e.fecha_evento).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                            <Badge variant="outline" className={`text-[9px] bg-${conf.color}-500/20 text-${conf.color}-400 border-${conf.color}-500/30 mt-1 uppercase tracking-widest`}>
                                                {e.tipo_evento}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </EliteGlassCard>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}

// =====================================================
// SHARED ELITE GLASS CARD
// =====================================================
export function EliteGlassCard({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`relative rounded-3xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.5)] bg-gradient-to-b from-[#1c1e2a]/60 to-[#12141e]/60 backdrop-blur-xl ${className}`}>
            {/* Edge lighting / Top Bevel */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.03)'
            }} />
            {children}
            {/* Glow Orb inside */}
            <div className="absolute bottom-[-60px] left-[-20px] w-48 h-48 bg-cyan-500/10 rounded-full blur-[50px] pointer-events-none" />
        </div>
    )
}

// =====================================================
// SHARED SECTION HEADER
// =====================================================
function SectionHeader({ icon: Icon, title, subtitle, color }: { icon: any; title: string; subtitle: string; color: string }) {
    return (
        <div className="flex items-center gap-3 mb-1">
            <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5`}>
                <Icon className={`w-5 h-5 text-white/80`} />
            </div>
            <div>
                <h3 className="text-lg font-black text-white">{title}</h3>
                <p className="text-xs text-white/50">{subtitle}</p>
            </div>
        </div>
    )
}
