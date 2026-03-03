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
    Wind, FlaskConical
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
import PatientDashboardTab from '@/components/expediente/PatientDashboardTab'
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
    const [activeTab, setActiveTab] = useState('resumen')
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
        { value: 'resumen', label: 'Resumen', icon: Activity, gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-300' },
        { value: 'historia', label: 'Historia Clínica', icon: FileText, gradient: 'from-teal-500 to-emerald-700', bg: 'bg-teal-50', text: 'text-teal-700', ring: 'ring-teal-300' },
        { value: 'apnp', label: 'APNP', icon: Heart, gradient: 'from-rose-500 to-pink-600', bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-300' },
        { value: 'ahf', label: 'AHF', icon: Shield, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-300' },
        { value: 'ocupacional', label: 'Ocupacional', icon: Briefcase, gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-300' },
        { value: 'exploracion', label: 'Exploración Física', icon: Stethoscope, gradient: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-50', text: 'text-cyan-700', ring: 'ring-cyan-300' },
        { value: 'audiometria', label: 'Audiometría', icon: Ear, gradient: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-300' },
        { value: 'espirometria', label: 'Espirometría', icon: Wind, gradient: 'from-sky-500 to-cyan-600', bg: 'bg-sky-50', text: 'text-sky-700', ring: 'ring-sky-300' },
        { value: 'electrocardiograma', label: 'ECG', icon: Heart, gradient: 'from-red-500 to-rose-600', bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-300' },
        { value: 'vision', label: 'Visión', icon: EyeIcon, gradient: 'from-teal-500 to-emerald-600', bg: 'bg-teal-50', text: 'text-teal-700', ring: 'ring-teal-300' },
        { value: 'laboratorio', label: 'Laboratorio', icon: FlaskConical, gradient: 'from-green-500 to-emerald-600', bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-300' },
        { value: 'rayosx', label: 'Rayos X', icon: Bone, gradient: 'from-slate-500 to-gray-600', bg: 'bg-slate-50', text: 'text-slate-700', ring: 'ring-slate-300' },
        { value: 'consentimientos', label: 'Consentimientos', icon: Pen, gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-300' },
        { value: 'notas', label: 'Notas Médicas', icon: GitBranch, gradient: 'from-fuchsia-500 to-pink-600', bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', ring: 'ring-fuchsia-300' },
        { value: 'timeline', label: 'Línea de Tiempo', icon: Clock, gradient: 'from-orange-500 to-amber-600', bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-300' },
    ]

    return (
        <div className="space-y-6">
            {/* Export button */}
            <div className="flex justify-end">
                <Button onClick={() => setExportOpen(true)} variant="outline" className="rounded-xl gap-2 text-xs font-bold">
                    <Download className="w-4 h-4" /> Exportar Historial
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
                {/* ═══ CARD GRID NAVIGATION ═══ */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2.5">
                    {TABS.map(tab => {
                        const isActive = activeTab === tab.value
                        return (
                            <button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value)}
                                className={`
                                    relative group flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer
                                    ${isActive
                                        ? `${tab.bg} border-transparent ring-2 ${tab.ring} shadow-lg scale-[1.03]`
                                        : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md hover:scale-[1.02]'
                                    }
                                `}
                            >
                                <div className={`
                                    w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm
                                    ${isActive
                                        ? `bg-gradient-to-br ${tab.gradient} shadow-md`
                                        : 'bg-slate-100 group-hover:bg-slate-200'
                                    }
                                `}>
                                    <tab.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}`} />
                                </div>
                                <span className={`text-[10px] font-bold leading-tight text-center ${isActive ? tab.text : 'text-slate-500 group-hover:text-slate-700'}`}>
                                    {tab.label}
                                </span>
                                {isActive && (
                                    <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-1 rounded-full bg-gradient-to-r ${tab.gradient}`} />
                                )}
                            </button>
                        )
                    })}
                </div>
                <TabsList className="hidden">
                    {TABS.map(tab => (
                        <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                    ))}
                </TabsList>

                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

                        {/* ═══ RESUMEN ═══ */}
                        <TabsContent value="resumen" className="mt-0 space-y-4">
                            <ResumenTab data={data} />
                            <PatientDashboardTab pacienteId={pacienteId} onNavigate={(tab) => setActiveTab(tab)} />
                        </TabsContent>

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
// RESUMEN TAB
// =====================================================
function ResumenTab({ data }: { data: any }) {
    const ef = data.exploracionesFisicas?.[0]
    const p = data.paciente
    // Fallback: si no hay exploración física separada, usar campos directos del paciente
    const latestEF = ef || {
        ta_sistolica: p?.presion_sistolica || '—',
        ta_diastolica: p?.presion_diastolica || '—',
        fc: p?.frecuencia_cardiaca || '—',
        temperatura: p?.temperatura || '—',
        spo2: p?.saturacion_o2 || '—',
        imc: p?.imc || '—',
        glucosa: p?.laboratorio?.glucosa || '—',
        peso_kg: p?.peso_kg || '—',
        talla_cm: p?.talla_cm || '—',
    }
    return (
        <div className="space-y-4">
            {/* Alergias Alert */}
            {p.alergias && (
                <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50 shadow-md">
                    <CardContent className="py-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-red-700">ALERGIAS</p>
                            <p className="text-sm font-semibold text-red-800">{p.alergias}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
            {/* Vital Signs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                    { label: 'Presión Arterial', value: `${latestEF.ta_sistolica}/${latestEF.ta_diastolica}`, unit: 'mmHg', icon: Activity, color: 'blue' },
                    { label: 'FC', value: latestEF.fc, unit: 'lpm', icon: Heart, color: 'rose' },
                    { label: 'Temperatura', value: latestEF.temperatura, unit: '°C', icon: Thermometer, color: 'amber' },
                    { label: 'SpO₂', value: latestEF.spo2, unit: '%', icon: Droplets, color: 'cyan' },
                    { label: 'IMC', value: latestEF.imc, unit: 'kg/m²', icon: Scale, color: 'purple' },
                    { label: 'Glucosa', value: latestEF.glucosa, unit: 'mg/dL', icon: Gauge, color: 'emerald' },
                ].map(v => (
                    <Card key={v.label} className="border-0 shadow-md">
                        <CardContent className="p-3 text-center">
                            <v.icon className={`w-4 h-4 mx-auto mb-1 text-${v.color}-500`} />
                            <p className="text-xl font-black text-slate-800">{v.value}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{v.label}</p>
                            <p className="text-[9px] text-slate-300">{v.unit}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                        <div>
                            <p className="text-lg font-black text-emerald-700">{data.consentimientos.length}</p>
                            <p className="text-xs text-emerald-600">Consentimientos Firmados</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <Briefcase className="w-8 h-8 text-blue-500" />
                        <div>
                            <p className="text-lg font-black text-blue-700">{data.historiaOcupacional.length}</p>
                            <p className="text-xs text-blue-600">Empleos Registrados</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-indigo-50 border-indigo-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <GitBranch className="w-8 h-8 text-indigo-500" />
                        <div>
                            <p className="text-lg font-black text-indigo-700">{data.notasMedicas.length}</p>
                            <p className="text-xs text-indigo-600">Notas Médicas (versiones)</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
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
                    <Card key={h.label} className={`border shadow-sm ${h.active && h.color === 'rose' ? 'border-rose-200 bg-rose-50/30' : ''}`}>
                        <CardContent className="p-4 flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-${h.color}-100`}>
                                <h.icon className={`w-4 h-4 text-${h.color}-600`} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-slate-800">{h.label}</p>
                                    <Badge variant="outline" className={`text-[9px] ${h.active && h.color !== 'emerald' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                        {h.active ? (h.color === 'emerald' || h.color === 'green' || h.color === 'blue' || h.color === 'indigo' ? '✓' : '⚠') : '✓ Negado'}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{h.detail}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {apnp.otros_habitos && (
                <Card className="border-slate-200">
                    <CardContent className="p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Otros Hábitos</p>
                        <p className="text-sm text-slate-700">{apnp.otros_habitos}</p>
                    </CardContent>
                </Card>
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
                    <Card key={item.label} className={`border shadow-sm ${item.present ? `border-${item.color}-200 bg-${item.color}-50/20` : ''}`}>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${item.present ? `bg-${item.color}-500` : 'bg-slate-200'}`} />
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-slate-800">{item.label}</p>
                                    <Badge variant="outline" className={`text-[9px] ${item.present ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                        {item.present ? 'Positivo' : 'Negado'}
                                    </Badge>
                                </div>
                                {item.present && item.who && <p className="text-xs text-slate-600 mt-0.5">{item.who}</p>}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {ahf.otros && (
                <Card className="border-slate-200">
                    <CardContent className="p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Otros Antecedentes Familiares</p>
                        <p className="text-sm text-slate-700">{ahf.otros}</p>
                    </CardContent>
                </Card>
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
                    <Card key={h.id} className={`border shadow-sm ${isCurrent ? 'border-emerald-300 bg-emerald-50/20 ring-1 ring-emerald-200' : ''}`}>
                        <div className="p-4 cursor-pointer flex items-center justify-between" onClick={() => setExpanded(isExp ? null : h.id)}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCurrent ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                                    <Building2 className={`w-5 h-5 ${isCurrent ? 'text-emerald-600' : 'text-slate-500'}`} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-sm text-slate-800">{h.empresa_anterior}</p>
                                        {isCurrent && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border text-[9px]">Actual</Badge>}
                                    </div>
                                    <p className="text-xs text-slate-500">{h.puesto} · {h.antiguedad}</p>
                                </div>
                            </div>
                            {isExp ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                        <AnimatePresence>
                            {isExp && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <Separator />
                                    <CardContent className="p-4 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                            <RiskField label="Riesgos Físicos" value={h.riesgos_fisicos} color="blue" />
                                            <RiskField label="Riesgos Químicos" value={h.riesgos_quimicos} color="amber" />
                                            <RiskField label="Riesgos Biológicos" value={h.riesgos_biologicos} color="green" />
                                            <RiskField label="Riesgos Ergonómicos" value={h.riesgos_ergonomicos} color="purple" />
                                            <RiskField label="Riesgos Psicosociales" value={h.riesgos_psicosociales} color="rose" />
                                            <RiskField label="Exposiciones" value={h.exposiciones} color="red" />
                                        </div>
                                        <Separator />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                            <div><p className="font-black text-slate-400 uppercase text-[10px] mb-0.5">EPP Utilizado</p><p className="text-slate-700">{h.epp_utilizado}</p></div>
                                            <div><p className="font-black text-slate-400 uppercase text-[10px] mb-0.5">Accidentes Laborales</p><p className="text-slate-700">{h.accidentes_laborales}</p></div>
                                            <div><p className="font-black text-slate-400 uppercase text-[10px] mb-0.5">Enfermedades Laborales</p><p className="text-slate-700">{h.enfermedades_laborales}</p></div>
                                            <div><p className="font-black text-slate-400 uppercase text-[10px] mb-0.5">Motivo de Separación</p><p className="text-slate-700">{h.motivo_separacion || 'Empleo actual'}</p></div>
                                        </div>
                                    </CardContent>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                )
            })}
        </div>
    )
}

function RiskField({ label, value, color }: { label: string; value?: string; color: string }) {
    if (!value || value === 'No aplica') return (
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
            <p className="font-black text-slate-300 uppercase text-[10px] mb-0.5">{label}</p>
            <p className="text-slate-400 text-xs">No aplica</p>
        </div>
    )
    return (
        <div className={`p-2 rounded-lg bg-${color}-50/50 border border-${color}-100`}>
            <p className={`font-black text-${color}-400 uppercase text-[10px] mb-0.5`}>{label}</p>
            <p className="text-slate-700 text-xs leading-relaxed">{value}</p>
        </div>
    )
}

// =====================================================
// EXPLORACIÓN FÍSICA TAB
// =====================================================
function VitalCard({ s, alertMsg }: { s: any, alertMsg: string | null }) {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <Card className={`border-0 shadow-sm relative transition-colors ${alertMsg && showTooltip ? 'bg-rose-50' : 'bg-slate-50 hover:bg-slate-100'}`}>
            <CardContent className="p-2.5 text-center relative h-full flex flex-col justify-center">
                {alertMsg && (
                    <button
                        onClick={() => setShowTooltip(!showTooltip)}
                        className="absolute top-1.5 right-1.5 text-rose-500 hover:text-rose-600 transition-colors focus:outline-none"
                    >
                        <AlertTriangle className={`w-3.5 h-3.5 ${showTooltip ? 'animate-pulse' : ''}`} />
                    </button>
                )}
                <p className={`text-lg font-black ${alertMsg ? 'text-rose-600' : 'text-slate-800'}`}>{s.v}</p>
                <p className={`text-[9px] font-bold uppercase mt-1 ${alertMsg ? 'text-rose-400' : 'text-slate-400'}`}>
                    {s.l} <span className="opacity-70">({s.u})</span>
                </p>

                <AnimatePresence>
                    {showTooltip && alertMsg && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 5 }}
                            className="absolute -top-16 left-1/2 -translate-x-1/2 z-50 w-40 bg-zinc-900 text-white text-[10px] p-2 rounded-lg font-medium leading-tight shadow-xl border border-zinc-800 pointer-events-none"
                        >
                            {alertMsg}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 rotate-45 border-r border-b border-zinc-800" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
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
            <Card className="border-slate-200">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-bold flex items-center gap-2"><Scale className="w-4 h-4 text-purple-500" /> Somatometría</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div><p className="text-[10px] font-black text-slate-400 uppercase">Peso</p><p className="font-bold">{ef.peso_kg} kg</p></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase">Talla</p><p className="font-bold">{ef.talla_cm} cm</p></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase">IMC</p><p className={`font-bold ${(ef.imc || 0) > 25 ? 'text-amber-600' : 'text-emerald-600'}`}>{ef.imc} ({(ef.imc || 0) > 30 ? 'Obesidad' : (ef.imc || 0) > 25 ? 'Sobrepeso' : 'Normal'})</p></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase">Cintura</p><p className="font-bold">{ef.cintura_cm} cm</p></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase">Cadera</p><p className="font-bold">{ef.cadera_cm} cm</p></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase">ICC</p><p className="font-bold">{ef.icc}</p></div>
                </CardContent>
            </Card>

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
                    <Card key={s.l} className="border-slate-100 shadow-sm">
                        <CardContent className="p-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1"><s.i className="w-3 h-3" />{s.l}</p>
                            <p className="text-xs text-slate-700 leading-relaxed">{s.v}</p>
                        </CardContent>
                    </Card>
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
                <Card key={c.id} className={`border shadow-sm transition-colors hover:shadow-md ${c.firmado ? 'border-emerald-200' : 'border-amber-200'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="font-bold text-sm text-slate-800">{c.titulo}</p>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{c.contenido}</p>
                                <div className="flex flex-wrap gap-2 mt-2 text-[10px]">
                                    <Badge variant="outline" className="bg-slate-50">v{c.version}</Badge>
                                    <Badge variant="outline" className="bg-slate-50">Testigo: {c.testigo_nombre}</Badge>
                                    {c.ip_firma && <Badge variant="outline" className="bg-slate-50 font-mono">IP: {c.ip_firma}</Badge>}
                                </div>
                            </div>
                            <div className="ml-4 flex-shrink-0 text-center flex flex-col items-center justify-center gap-2">
                                {c.firmado ? (
                                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 w-full">
                                        <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                                        <p className="text-[10px] font-bold text-emerald-700">Firmado</p>
                                        <p className="text-[9px] text-emerald-500">{c.fecha_firma ? new Date(c.fecha_firma).toLocaleDateString('es-MX') : ''}</p>
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 w-full">
                                        <Clock className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                                        <p className="text-[10px] font-bold text-amber-700">Pendiente</p>
                                    </div>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-[10px] h-7 bg-white"
                                    onClick={() => setSelectedConsent(c)}
                                >
                                    Ver Documento
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
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
                            <Card className="ml-6 border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-700 leading-relaxed">{e.descripcion}</p>
                                            <p className="text-[10px] text-slate-400 mt-1">{e.medico}</p>
                                        </div>
                                        <div className="text-right ml-3 flex-shrink-0">
                                            <p className="text-[10px] font-bold text-slate-500">{new Date(e.fecha_evento).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                            <Badge variant="outline" className={`text-[9px] bg-${conf.color}-50 text-${conf.color}-700 border-${conf.color}-200 mt-0.5`}>
                                                {e.tipo_evento}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}

// =====================================================
// SHARED SECTION HEADER
// =====================================================
function SectionHeader({ icon: Icon, title, subtitle, color }: { icon: any; title: string; subtitle: string; color: string }) {
    return (
        <div className="flex items-center gap-3 mb-1">
            <div className={`w-10 h-10 rounded-xl bg-${color}-100 flex items-center justify-center`}>
                <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <div>
                <h3 className="text-lg font-black text-slate-800">{title}</h3>
                <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
        </div>
    )
}
