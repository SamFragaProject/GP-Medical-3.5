/**
 * PerfilPaciente - Vista UNIFICADA del Expediente Maestro del Paciente
 * 
 * Centro neurálgico donde se visualiza toda la información del paciente:
 * - Datos personales, laborales, contacto
 * - Historial Clínico completo (APNP, AHF, Consultas, etc.)
 * - Estudios Visuales (con escala Jaeger)
 * - Espirometría
 * - Rayos X
 * - Recetas Médicas
 * - Incapacidades
 * - Dictámenes
 * 
 * Todo desde un solo lugar, unificado y centrado en el paciente.
 */
import React, { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User, Building2, Heart, Phone, Mail, Calendar,
    ArrowLeft, Download, Edit, Shield,
    MapPin, Briefcase, Clock, Activity, FileText,
    Droplets, AlertTriangle, CheckCircle, ChevronRight,
    Users, Clipboard, Eye, Stethoscope, Loader2,
    Wind, Bone, Pill, FileBarChart, ScrollText,
    Plus, FlaskConical, BarChart3, Ear, Printer, FileCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Paciente, pacientesService } from '@/services/dataService'
import toast from 'react-hot-toast'
import FotoPaciente from '@/components/expediente/FotoPaciente'
import { printCertificadoAptitud, printExpedienteCompleto } from '@/components/expediente/ExportarPDFPaciente'

// Lazy-load clinical sub-modules for performance
const HistorialClinicoCompleto = React.lazy(() => import('@/components/expediente/HistorialClinicoCompleto'))
const LaboratorioTab = React.lazy(() => import('@/components/expediente/LaboratorioTab'))
const AudiometriaTab = React.lazy(() => import('@/components/expediente/AudiometriaTab'))
const EstudiosVisualesTab = React.lazy(() => import('@/components/expediente/EstudiosVisualesTab'))
const EspirometriaTab = React.lazy(() => import('@/components/expediente/EspirometriaTab'))
const RayosXTab = React.lazy(() => import('@/components/expediente/RayosXTab'))
const RecetasTab = React.lazy(() => import('@/components/expediente/RecetasTab'))
const IncapacidadesTab = React.lazy(() => import('@/components/expediente/IncapacidadesTab'))
const DictamenesTab = React.lazy(() => import('@/components/expediente/DictamenesTab'))

// =============================================
// HELPERS
// =============================================
function calcularEdad(fechaNac: string): number {
    const birth = new Date(fechaNac)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
}

function formatDate(date?: string | null): string {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
}

const GENERO_GRADIENT: Record<string, string> = {
    masculino: 'from-blue-500 to-indigo-600',
    femenino: 'from-pink-500 to-rose-600',
    otro: 'from-purple-500 to-violet-600',
}

// =============================================
// TAB CONFIGURATION
// =============================================
interface TabConfig {
    value: string
    label: string
    icon: any
    group: 'info' | 'clinico' | 'diagnostico'
    description?: string
}

const TABS: TabConfig[] = [
    // Info Group
    { value: 'general', label: 'General', icon: User, group: 'info' },
    { value: 'laboral', label: 'Laboral', icon: Building2, group: 'info' },
    { value: 'contacto', label: 'Contacto', icon: Phone, group: 'info' },
    // Clinical Group  
    { value: 'expediente', label: 'Expediente', icon: Stethoscope, group: 'clinico', description: 'Historial clínico completo' },
    // Diagnostic Group
    { value: 'laboratorio', label: 'Laboratorio', icon: FlaskConical, group: 'diagnostico', description: 'Resultados de laboratorio clínico' },
    { value: 'audiometria', label: 'Audiometría', icon: Ear, group: 'diagnostico', description: 'Audiograma y semáforo NOM-011' },
    { value: 'vision', label: 'Estudios Visuales', icon: Eye, group: 'diagnostico', description: 'Agudeza visual y Escala Jaeger' },
    { value: 'espirometria', label: 'Espirometría', icon: Wind, group: 'diagnostico', description: 'Pruebas de función pulmonar' },
    { value: 'rayos_x', label: 'Rayos X', icon: Bone, group: 'diagnostico', description: 'Estudios radiológicos' },
    { value: 'recetas', label: 'Recetas', icon: Pill, group: 'diagnostico', description: 'Prescripciones médicas' },
    { value: 'incapacidades', label: 'Incapacidades', icon: FileBarChart, group: 'diagnostico', description: 'Certificados de incapacidad' },
    { value: 'dictamenes', label: 'Dictámenes', icon: ScrollText, group: 'diagnostico', description: 'Dictámenes médico-laborales' },
]

// Group colors for visual differentiation
const GROUP_COLORS = {
    info: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Información' },
    clinico: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Clínico' },
    diagnostico: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Diagnóstico' },
}

// =============================================
// MAIN COMPONENT
// =============================================
export default function PerfilPaciente() {
    const { id } = useParams<{ id: string }>()
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [paciente, setPaciente] = useState<Paciente | null>(
        (location.state as any)?.paciente || null
    )
    const [loading, setLoading] = useState(!paciente)
    const [activeTab, setActiveTab] = useState('general')

    // Load patient data if not passed via state
    useEffect(() => {
        if (!paciente && id) {
            setLoading(true)
            pacientesService.getAll().then((allPacientes) => {
                const found = allPacientes.find((p) => p.id === id)
                if (found) setPaciente(found)
                setLoading(false)
            }).catch(() => setLoading(false))
        }
    }, [id, paciente])

    const edad = paciente?.fecha_nacimiento ? calcularEdad(paciente.fecha_nacimiento) : null
    const gradient = GENERO_GRADIENT[paciente?.genero || ''] || 'from-slate-400 to-slate-600'
    const initials = paciente ? `${(paciente.nombre || '')[0] || ''}${(paciente.apellido_paterno || '')[0] || ''}`.toUpperCase() : ''

    // Export patient data
    const handleExport = () => {
        if (!paciente) return
        const exportData = {
            expediente: 'GPMedical ERP - Expediente del Paciente',
            fecha_exportacion: new Date().toLocaleString('es-MX'),
            datos_personales: {
                nombre_completo: `${paciente.nombre} ${paciente.apellido_paterno} ${paciente.apellido_materno || ''}`,
                curp: paciente.curp, rfc: paciente.rfc, nss: paciente.nss,
                fecha_nacimiento: paciente.fecha_nacimiento, genero: paciente.genero, estado_civil: paciente.estado_civil,
            },
            datos_laborales: {
                numero_empleado: paciente.numero_empleado, empresa: paciente.empresa_nombre,
                sede: paciente.sede_nombre, puesto: paciente.puesto, area: paciente.area,
                departamento: paciente.departamento, turno: paciente.turno,
                tipo_contrato: paciente.tipo_contrato, fecha_ingreso: paciente.fecha_ingreso,
            },
            datos_medicos: { tipo_sangre: paciente.tipo_sangre, alergias: paciente.alergias },
            contacto: { email: paciente.email, telefono: paciente.telefono },
        }
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `expediente_${paciente.apellido_paterno}_${paciente.nombre}_${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Expediente exportado correctamente')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-40">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            </div>
        )
    }

    if (!paciente) {
        return (
            <div className="text-center py-40">
                <User className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h2 className="text-xl font-bold text-slate-700 mb-2">Paciente no encontrado</h2>
                <Button onClick={() => navigate('/pacientes')} variant="outline" className="mt-4 rounded-xl gap-2">
                    <ArrowLeft className="w-4 h-4" /> Regresar
                </Button>
            </div>
        )
    }

    const activeTabConfig = TABS.find(t => t.value === activeTab)

    return (
        <div className="space-y-6 pb-12">
            {/* ── HEADER / HERO ── */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.15),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.1),transparent_50%)]" />

                <div className="relative z-10 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/pacientes')}
                            className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl gap-2 -ml-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> Regresar
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => printCertificadoAptitud(paciente)}
                                className="text-slate-400 hover:text-white hover:bg-emerald-500/20 rounded-xl gap-2"
                            >
                                <FileCheck className="w-4 h-4" /> Certificado
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => printExpedienteCompleto(paciente)}
                                className="text-slate-400 hover:text-white hover:bg-blue-500/20 rounded-xl gap-2"
                            >
                                <Printer className="w-4 h-4" /> Expediente PDF
                            </Button>
                            <Button variant="ghost" onClick={handleExport} className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl gap-2">
                                <Download className="w-4 h-4" /> JSON
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <FotoPaciente
                            currentUrl={paciente.foto_url}
                            nombre={`${paciente.nombre} ${paciente.apellido_paterno}`}
                            initials={initials}
                            gradient={gradient}
                            size="lg"
                            editable={true}
                            onPhotoChange={(url) => {
                                setPaciente(prev => prev ? { ...prev, foto_url: url } : prev)
                            }}
                        />

                        <div className="flex-1">
                            <h1 className="text-3xl font-black text-white mb-1">
                                {paciente.nombre} {paciente.apellido_paterno} {paciente.apellido_materno || ''}
                            </h1>
                            <p className="text-sm text-white/40 font-medium mb-2">Expediente Maestro — Centro de Información Clínica</p>
                            <div className="flex flex-wrap gap-3 mt-2">
                                {paciente.numero_empleado && (
                                    <Badge className="bg-white/10 text-white/70 border-white/10 text-xs">
                                        #{paciente.numero_empleado}
                                    </Badge>
                                )}
                                {edad && (
                                    <Badge className="bg-white/10 text-white/70 border-white/10 text-xs">
                                        {edad} años
                                    </Badge>
                                )}
                                {paciente.genero && (
                                    <Badge className={`bg-gradient-to-r ${gradient} text-white border-0 text-xs`}>
                                        {paciente.genero === 'masculino' ? '♂' : paciente.genero === 'femenino' ? '♀' : '⚧'} {paciente.genero}
                                    </Badge>
                                )}
                                {paciente.tipo_sangre && (
                                    <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-xs">
                                        <Droplets className="w-3 h-3 mr-1" /> {paciente.tipo_sangre}
                                    </Badge>
                                )}
                                {paciente.estatus && (
                                    <Badge className={`text-xs ${paciente.estatus === 'activo' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                                        'bg-slate-500/20 text-slate-300 border-slate-500/30'
                                        }`}>
                                        {paciente.estatus === 'activo' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                                        {paciente.estatus}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {paciente.empresa_nombre && (
                                <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                                    <Building2 className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                                    <p className="text-xs text-white/60 font-bold">{paciente.empresa_nombre}</p>
                                </div>
                            )}
                            {paciente.puesto && (
                                <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                                    <Briefcase className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                                    <p className="text-xs text-white/60 font-bold">{paciente.puesto}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── UNIFIED TABS ── */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                {/* Tab navigation with visual grouping */}
                <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 p-2">
                    {/* Group labels */}
                    <div className="flex flex-wrap items-center gap-1 mb-1 px-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mr-1">📋 Información</span>
                        <span className="text-slate-200 mx-1">|</span>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 mr-1">🩺 Clínico</span>
                        <span className="text-slate-200 mx-1">|</span>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">🔬 Diagnóstico</span>
                    </div>
                    <TabsList className="bg-transparent w-full h-auto flex-wrap gap-1 p-0">
                        {TABS.map(tab => {
                            const groupStyle = tab.group === 'clinico'
                                ? 'data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:border-emerald-200'
                                : tab.group === 'diagnostico'
                                    ? 'data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200'
                                    : 'data-[state=active]:bg-slate-50 data-[state=active]:text-slate-800 data-[state=active]:border-slate-200'

                            return (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-transparent data-[state=active]:shadow-sm transition-all ${groupStyle}`}
                                >
                                    <tab.icon className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </TabsTrigger>
                            )
                        })}
                    </TabsList>
                </div>

                {/* Active tab description bar */}
                {activeTabConfig?.description && (
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100"
                    >
                        <activeTabConfig.icon className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-500">{activeTabConfig.description}</span>
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* ═══ INFO TABS ═══ */}
                        <TabsContent value="general" className="space-y-6 mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <InfoCard icon={User} label="Nombre Completo" value={`${paciente.nombre} ${paciente.apellido_paterno} ${paciente.apellido_materno || ''}`} />
                                <InfoCard icon={Calendar} label="Fecha de Nacimiento" value={formatDate(paciente.fecha_nacimiento)} />
                                <InfoCard icon={Users} label="Género" value={paciente.genero || '—'} />
                                <InfoCard icon={Shield} label="CURP" value={paciente.curp || '—'} mono />
                                <InfoCard icon={FileText} label="RFC" value={paciente.rfc || '—'} mono />
                                <InfoCard icon={Shield} label="NSS (IMSS)" value={paciente.nss || '—'} mono />
                                <InfoCard icon={Heart} label="Estado Civil" value={paciente.estado_civil || '—'} />
                                <InfoCard icon={Droplets} label="Tipo de Sangre" value={paciente.tipo_sangre || '—'} highlight="rose" />
                                <InfoCard icon={AlertTriangle} label="Alergias" value={paciente.alergias || 'Ninguna conocida'} highlight={paciente.alergias ? 'amber' : undefined} />
                                <InfoCard icon={CheckCircle} label="Estatus" value={paciente.estatus || '—'} highlight={paciente.estatus === 'activo' ? 'emerald' : undefined} />
                                <InfoCard icon={Calendar} label="Fecha de Registro" value={formatDate(paciente.created_at)} />
                            </div>

                            {/* Emergency Contact */}
                            <Card className="border-amber-200 bg-amber-50/50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-amber-800 text-base">
                                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                                        Contacto de Emergencia
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Nombre</p>
                                            <p className="text-sm font-semibold text-amber-900">{paciente.contacto_emergencia_nombre || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Parentesco</p>
                                            <p className="text-sm font-semibold text-amber-900">{paciente.contacto_emergencia_parentesco || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Teléfono</p>
                                            <p className="text-sm font-semibold text-amber-900">{paciente.contacto_emergencia_telefono || '—'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="laboral" className="space-y-6 mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <InfoCard icon={Clipboard} label="Número de Empleado" value={paciente.numero_empleado || '—'} mono />
                                <InfoCard icon={Building2} label="Empresa" value={paciente.empresa_nombre || '—'} />
                                <InfoCard icon={MapPin} label="Sede" value={paciente.sede_nombre || '—'} />
                                <InfoCard icon={Briefcase} label="Puesto" value={paciente.puesto || '—'} />
                                <InfoCard icon={Users} label="Área" value={paciente.area || '—'} />
                                <InfoCard icon={Users} label="Departamento" value={paciente.departamento || '—'} />
                                <InfoCard icon={Clock} label="Turno" value={paciente.turno || '—'} />
                                <InfoCard icon={FileText} label="Tipo de Contrato" value={paciente.tipo_contrato || '—'} />
                                <InfoCard icon={Calendar} label="Fecha de Ingreso" value={formatDate(paciente.fecha_ingreso)} />
                                <InfoCard icon={Clock} label="Jornada" value={paciente.jornada_horas ? `${paciente.jornada_horas} horas` : '—'} />
                                <InfoCard icon={User} label="Supervisor" value={paciente.supervisor_nombre || '—'} />
                            </div>
                        </TabsContent>

                        <TabsContent value="contacto" className="space-y-6 mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoCard icon={Mail} label="Correo Electrónico" value={paciente.email || '—'} />
                                <InfoCard icon={Phone} label="Teléfono" value={paciente.telefono || '—'} />
                            </div>
                            <Card className="border-0 shadow-lg">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-bold text-slate-600">Fotografía del Paciente</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FotoPaciente
                                        currentUrl={paciente.foto_url}
                                        nombre={`${paciente.nombre} ${paciente.apellido_paterno}`}
                                        initials={initials}
                                        gradient={gradient}
                                        size="lg"
                                        editable={true}
                                        onPhotoChange={(url) => {
                                            setPaciente(prev => prev ? { ...prev, foto_url: url } : prev)
                                        }}
                                    />
                                    <p className="text-[10px] text-slate-400 mt-2 font-medium">Click para subir o cambiar la fotografía</p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ═══ CLINICAL TAB ═══ */}
                        <TabsContent value="expediente" className="mt-0">
                            <Suspense fallback={<TabLoader label="Cargando expediente clínico..." />}>
                                <HistorialClinicoCompleto pacienteId={id} />
                            </Suspense>
                        </TabsContent>

                        {/* ═══ DIAGNOSTIC TABS ═══ */}
                        <TabsContent value="laboratorio" className="mt-0">
                            <Suspense fallback={<TabLoader label="Cargando laboratorio..." />}>
                                <LaboratorioTab />
                            </Suspense>
                        </TabsContent>

                        <TabsContent value="audiometria" className="mt-0">
                            <Suspense fallback={<TabLoader label="Cargando audiometría..." />}>
                                <AudiometriaTab />
                            </Suspense>
                        </TabsContent>

                        <TabsContent value="vision" className="mt-0">
                            <Suspense fallback={<TabLoader label="Cargando estudios visuales..." />}>
                                <EstudiosVisualesTab />
                            </Suspense>
                        </TabsContent>

                        <TabsContent value="espirometria" className="mt-0">
                            <Suspense fallback={<TabLoader label="Cargando espirometría..." />}>
                                <EspirometriaTab />
                            </Suspense>
                        </TabsContent>

                        <TabsContent value="rayos_x" className="mt-0">
                            <Suspense fallback={<TabLoader label="Cargando rayos X..." />}>
                                <RayosXTab />
                            </Suspense>
                        </TabsContent>

                        <TabsContent value="recetas" className="mt-0">
                            <Suspense fallback={<TabLoader label="Cargando recetas..." />}>
                                <RecetasTab />
                            </Suspense>
                        </TabsContent>

                        <TabsContent value="incapacidades" className="mt-0">
                            <Suspense fallback={<TabLoader label="Cargando incapacidades..." />}>
                                <IncapacidadesTab />
                            </Suspense>
                        </TabsContent>

                        <TabsContent value="dictamenes" className="mt-0">
                            <Suspense fallback={<TabLoader label="Cargando dictámenes..." />}>
                                <DictamenesTab />
                            </Suspense>
                        </TabsContent>
                    </motion.div>
                </AnimatePresence>
            </Tabs>
        </div>
    )
}

// =============================================
// LOADING COMPONENT
// =============================================
function TabLoader({ label }: { label: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
            <p className="text-sm font-semibold text-slate-500">{label}</p>
        </div>
    )
}

// =============================================
// COMING SOON CARD
// =============================================
function ComingSoonCard({ icon: Icon, title, description, color }: {
    icon: any; title: string; description: string; color: string
}) {
    const colorMap: Record<string, { gradient: string; iconBg: string; iconText: string; textColor: string; border: string }> = {
        cyan: { gradient: 'from-cyan-500 to-blue-600', iconBg: 'bg-cyan-100', iconText: 'text-cyan-600', textColor: 'text-cyan-800', border: 'border-cyan-200' },
        slate: { gradient: 'from-slate-500 to-slate-700', iconBg: 'bg-slate-100', iconText: 'text-slate-600', textColor: 'text-slate-800', border: 'border-slate-200' },
        teal: { gradient: 'from-teal-500 to-green-600', iconBg: 'bg-teal-100', iconText: 'text-teal-600', textColor: 'text-teal-800', border: 'border-teal-200' },
        rose: { gradient: 'from-rose-500 to-pink-600', iconBg: 'bg-rose-100', iconText: 'text-rose-600', textColor: 'text-rose-800', border: 'border-rose-200' },
        purple: { gradient: 'from-purple-500 to-violet-600', iconBg: 'bg-purple-100', iconText: 'text-purple-600', textColor: 'text-purple-800', border: 'border-purple-200' },
    }
    const c = colorMap[color] || colorMap.slate
    return (
        <div className={`bg-white rounded-3xl border ${c.border} p-12 flex flex-col items-center justify-center text-center`}>
            <div className={`w-20 h-20 rounded-3xl ${c.iconBg} flex items-center justify-center mb-6 shadow-lg`}>
                <Icon className={`w-10 h-10 ${c.iconText}`} />
            </div>
            <h3 className={`text-2xl font-black ${c.textColor} mb-3`}>{title}</h3>
            <p className="text-sm text-slate-500 max-w-md mb-6">{description}</p>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-700">Integración en progreso — datos se vincularán a este paciente</span>
            </div>
        </div>
    )
}

// =============================================
// INFO CARD COMPONENT
// =============================================
function InfoCard({ icon: Icon, label, value, mono, highlight }: {
    icon: any; label: string; value: string; mono?: boolean;
    highlight?: 'emerald' | 'rose' | 'amber'
}) {
    const highlightStyles: Record<string, string> = {
        emerald: 'bg-emerald-50 border-emerald-200',
        rose: 'bg-rose-50 border-rose-200',
        amber: 'bg-amber-50 border-amber-200',
    }

    return (
        <Card className={`border shadow-sm ${highlight ? highlightStyles[highlight] : 'bg-white/90 border-slate-100'}`}>
            <CardContent className="p-4 flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${highlight
                    ? highlight === 'emerald' ? 'bg-emerald-100 text-emerald-600'
                        : highlight === 'rose' ? 'bg-rose-100 text-rose-600'
                            : 'bg-amber-100 text-amber-600'
                    : 'bg-slate-100 text-slate-500'
                    }`}>
                    <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
                    <p className={`text-sm font-semibold text-slate-800 ${mono ? 'font-mono' : ''} ${value === '—' ? 'text-slate-400' : ''}`}>
                        {value}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
