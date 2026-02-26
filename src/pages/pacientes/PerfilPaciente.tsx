/**
 * PerfilPaciente - Vista UNIFICADA del Expediente Maestro del Paciente
 * 
 * Todo editable inline con guardado automático:
 * - Datos personales, laborales, contacto
 * - Analizador de riesgos con IA (OpenAI)
 * - Historial Clínico completo
 * - Recetas, Dictámenes, Incapacidades
 */
import React, { useState, useEffect, Suspense, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User, Building2, Heart, Phone, Mail, Calendar,
    ArrowLeft, Download, Edit, Shield, Save,
    MapPin, Briefcase, Clock, Activity, FileText,
    Droplets, AlertTriangle, CheckCircle, ChevronRight,
    Users, Clipboard, Eye, Stethoscope, Loader2,
    Wind, Bone, Pill, FileBarChart, ScrollText,
    Plus, FlaskConical, BarChart3, Ear, Printer, FileCheck,
    FolderOpen, Pencil, X, Zap, Brain
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
import { supabase } from '@/lib/supabase'
import { printCertificadoAptitud, printExpedienteCompleto } from '@/components/expediente/ExportarPDFPaciente'
import {
    analyzeJobPosition,
    type OccupationalRisks, type AIJobAnalysis,
    EMPTY_RISKS, RISK_CATEGORIES
} from '@/services/aiService'

// Lazy-load clinical sub-modules for performance
const HistorialClinicoCompleto = React.lazy(() => import('@/components/expediente/HistorialClinicoCompleto'))
const RecetasTab = React.lazy(() => import('@/components/expediente/RecetasTab'))
const IncapacidadesTab = React.lazy(() => import('@/components/expediente/IncapacidadesTab'))
const DictamenesTab = React.lazy(() => import('@/components/expediente/DictamenesTab'))
const DocumentosExpedienteTab = React.lazy(() => import('@/components/expediente/DocumentosExpedienteTab'))

// =============================================
// HELPERS
// =============================================
const calcularEdad = (fechaNac: string): number => {
    const hoy = new Date()
    const nacimiento = new Date(fechaNac)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const m = hoy.getMonth() - nacimiento.getMonth()
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--
    return edad
}

const formatDate = (date?: string | null): string =>
    date ? new Date(date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'

const GENERO_GRADIENT: Record<string, string> = {
    masculino: 'from-blue-500 to-indigo-600',
    femenino: 'from-pink-500 to-rose-600',
    otro: 'from-purple-500 to-violet-600',
}

// =============================================
// TAB CONFIGURATION
// =============================================
interface TabConfig {
    value: string; label: string; icon: any; group: 'info' | 'clinico' | 'diagnostico'; description?: string
}

const TABS: TabConfig[] = [
    { value: 'general', label: 'General', icon: User, group: 'info' },
    { value: 'laboral', label: 'Laboral', icon: Building2, group: 'info' },
    { value: 'contacto', label: 'Contacto', icon: Phone, group: 'info' },
    { value: 'expediente', label: 'Expediente', icon: Stethoscope, group: 'clinico', description: 'Exploración física, APNP, AHF, AGO, estudios' },
    { value: 'documentos', label: 'Documentos', icon: FolderOpen, group: 'clinico', description: 'Documentos cifrados del paciente' },
    { value: 'recetas', label: 'Recetas', icon: Pill, group: 'diagnostico', description: 'Prescripciones médicas' },
    { value: 'dictamenes', label: 'Dictámenes', icon: FileText, group: 'diagnostico', description: 'Dictámenes de aptitud laboral' },
    { value: 'incapacidades', label: 'Incapacidades', icon: FileBarChart, group: 'diagnostico', description: 'Certificados de incapacidad' },
]

// =============================================
// EDITABLE FIELD COMPONENT
// =============================================
function EditableField({ icon: Icon, label, value, field, type = 'text', options, editing, onChange }: {
    icon: any; label: string; value: string; field: string; type?: string
    options?: string[]; editing: boolean; onChange: (field: string, value: string) => void
}) {
    if (!editing) {
        return (
            <div className="group relative flex items-start gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-sm border border-slate-100">
                    <Icon className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-0.5">{label}</p>
                    <p className={`text-sm font-semibold text-slate-800 truncate ${type === 'mono' ? 'font-mono tracking-wider' : ''}`}>{value || '—'}</p>
                </div>
            </div>
        )
    }

    if (options) {
        return (
            <div className="flex items-start gap-3 p-4 bg-emerald-50/50 rounded-2xl border-2 border-emerald-200 transition-all">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-sm border border-emerald-200">
                    <Icon className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-600 mb-1">{label}</p>
                    <select
                        value={value || ''}
                        onChange={(e) => onChange(field, e.target.value)}
                        className="w-full bg-white border border-emerald-200 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                        <option value="">— Seleccionar —</option>
                        {options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-start gap-3 p-4 bg-emerald-50/50 rounded-2xl border-2 border-emerald-200 transition-all">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-sm border border-emerald-200">
                <Icon className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-600 mb-1">{label}</p>
                <input
                    type={type === 'date' ? 'date' : type === 'number' ? 'number' : 'text'}
                    value={value || ''}
                    onChange={(e) => onChange(field, e.target.value)}
                    className="w-full bg-white border border-emerald-200 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder={label}
                />
            </div>
        </div>
    )
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
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [editData, setEditData] = useState<Partial<Paciente>>({})

    // Risk analyzer state
    const [isAnalyzingAI, setIsAnalyzingAI] = useState(false)
    const [riesgos, setRiesgos] = useState<OccupationalRisks>({ ...EMPTY_RISKS })
    const [showRiesgos, setShowRiesgos] = useState(false)

    // Load patient data
    useEffect(() => {
        if (!paciente && id) {
            setLoading(true)
            pacientesService.getById(id)
                .then((found) => {
                    setPaciente(found)
                    if (found.riesgos_ocupacionales && typeof found.riesgos_ocupacionales === 'object') {
                        setRiesgos({ ...EMPTY_RISKS, ...found.riesgos_ocupacionales })
                        setShowRiesgos(Object.values(found.riesgos_ocupacionales).some((cat: any) =>
                            typeof cat === 'object' && Object.values(cat).some(Boolean)
                        ))
                    }
                })
                .catch(() => toast.error('No se pudo cargar el paciente'))
                .finally(() => setLoading(false))
        } else if (paciente?.riesgos_ocupacionales) {
            setRiesgos({ ...EMPTY_RISKS, ...paciente.riesgos_ocupacionales })
            setShowRiesgos(Object.values(paciente.riesgos_ocupacionales).some((cat: any) =>
                typeof cat === 'object' && Object.values(cat).some(Boolean)
            ))
        }
    }, [id])

    const startEditing = () => {
        setEditData({ ...paciente })
        setEditing(true)
    }

    const cancelEditing = () => {
        setEditing(false)
        setEditData({})
    }

    const handleFieldChange = (field: string, value: string) => {
        setEditData(prev => ({ ...prev, [field]: value }))
    }

    const handleSave = async () => {
        if (!id || !paciente) return
        setSaving(true)
        try {
            // Include risk data
            const updates = {
                ...editData,
                riesgos_ocupacionales: riesgos,
            }
            const updated = await pacientesService.update(id, updates)
            setPaciente(updated)
            setEditing(false)
            setEditData({})
            toast.success('Paciente actualizado correctamente')
        } catch (err: any) {
            console.error('Error saving:', err)
            toast.error(err.message || 'Error al guardar')
        } finally {
            setSaving(false)
        }
    }

    const handleAnalyzeRisks = async () => {
        const puesto = editing ? (editData.puesto || paciente?.puesto) : paciente?.puesto
        if (!puesto?.trim()) {
            toast.error('El paciente necesita un puesto de trabajo para analizar riesgos')
            return
        }
        setIsAnalyzingAI(true)
        setShowRiesgos(true)
        try {
            const result = await analyzeJobPosition(puesto)
            setRiesgos(result.riesgos)
            toast.success(`Riesgos analizados para "${puesto}"`)
        } catch (error: any) {
            console.error('AI analysis error:', error)
            toast.error(error.message || 'Error al analizar riesgos')
        } finally {
            setIsAnalyzingAI(false)
        }
    }

    const toggleRisk = (category: string, risk: string) => {
        setRiesgos(prev => ({
            ...prev,
            [category]: {
                ...prev[category as keyof OccupationalRisks],
                [risk]: !((prev as any)[category]?.[risk] ?? false)
            }
        }))
    }

    const totalRisksCount = Object.values(riesgos).reduce((total, cat) =>
        total + Object.values(cat).filter(Boolean).length, 0
    )

    const saveRisksOnly = async () => {
        if (!id) return
        setSaving(true)
        try {
            const updated = await pacientesService.update(id, { riesgos_ocupacionales: riesgos } as any)
            setPaciente(updated)
            toast.success('Riesgos guardados correctamente')
        } catch (err: any) {
            toast.error(err.message || 'Error al guardar riesgos')
        } finally {
            setSaving(false)
        }
    }

    const edad = paciente?.fecha_nacimiento ? calcularEdad(paciente.fecha_nacimiento) : null
    const gradient = GENERO_GRADIENT[paciente?.genero || ''] || 'from-slate-400 to-slate-600'
    const initials = paciente ? `${(paciente.nombre || '')[0] || ''}${(paciente.apellido_paterno || '')[0] || ''}`.toUpperCase() : ''
    const v = (field: string) => editing ? ((editData as any)[field] ?? (paciente as any)?.[field] ?? '') : ((paciente as any)?.[field] ?? '')

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
            riesgos_ocupacionales: riesgos,
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

    const [printing, setPrinting] = useState(false)

    const handlePrintCertificate = async () => {
        if (!paciente || !id) return
        try {
            setPrinting(true)
            const { data: examData } = await supabase
                .from('examenes')
                .select('*')
                .eq('paciente_id', id)
                .order('fecha', { ascending: false })
                .limit(1)
                .maybeSingle()

            printCertificadoAptitud(paciente, examData)
            toast.success('Certificado generado')
        } catch (err) {
            toast.error('Error al generar certificado')
        } finally {
            setPrinting(false)
        }
    }

    const handlePrintFullExpediente = async () => {
        if (!paciente || !id) return
        try {
            setPrinting(true)
            const [examRes, recetaRes, incapRes] = await Promise.all([
                supabase.from('examenes').select('*').eq('paciente_id', id).order('fecha', { ascending: false }),
                supabase.from('recetas').select('*').eq('paciente_id', id).order('created_at', { ascending: false }),
                supabase.from('incapacidades').select('*').eq('paciente_id', id).order('fecha_inicio', { ascending: false }),
            ])

            printExpedienteCompleto(paciente, {
                examenes: examRes.data || [],
                recetas: recetaRes.data || [],
                incapacidades: incapRes.data || [],
            })
            toast.success('Expediente PDF generado')
        } catch (err) {
            toast.error('Error al generar expediente')
        } finally {
            setPrinting(false)
        }
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
                            {editing ? (
                                <>
                                    <Button
                                        variant="ghost"
                                        onClick={cancelEditing}
                                        className="text-slate-400 hover:text-white hover:bg-red-500/20 rounded-xl gap-2"
                                    >
                                        <X className="w-4 h-4" /> Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-2"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Guardar Todo
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        onClick={startEditing}
                                        className="text-slate-400 hover:text-white hover:bg-violet-500/20 rounded-xl gap-2"
                                    >
                                        <Pencil className="w-4 h-4" /> Editar
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={handlePrintCertificate}
                                        disabled={printing}
                                        className="text-slate-400 hover:text-white hover:bg-emerald-500/20 rounded-xl gap-2"
                                    >
                                        {printing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                                        Certificado
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={handlePrintFullExpediente}
                                        disabled={printing}
                                        className="text-slate-400 hover:text-white hover:bg-blue-500/20 rounded-xl gap-2"
                                    >
                                        {printing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                                        Expediente PDF
                                    </Button>
                                    <Button variant="ghost" onClick={handleExport} className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl gap-2">
                                        <Download className="w-4 h-4" /> JSON
                                    </Button>
                                </>
                            )}
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
                                    <Badge className="bg-white/10 text-white/70 border-white/10 text-xs">#{paciente.numero_empleado}</Badge>
                                )}
                                {edad && (
                                    <Badge className="bg-white/10 text-white/70 border-white/10 text-xs">{edad} años</Badge>
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
                                {editing && (
                                    <Badge className="bg-violet-500/30 text-violet-300 border-violet-500/40 text-xs animate-pulse">
                                        <Pencil className="w-3 h-3 mr-1" /> Modo Edición
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
                <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 p-2">
                    <div className="flex flex-wrap items-center gap-1 mb-1 px-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mr-1">📋 Información</span>
                        <span className="text-slate-200 mx-1">|</span>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 mr-1">🩺 Expediente</span>
                        <span className="text-slate-200 mx-1">|</span>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">💊 Tratamiento</span>
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
                        {/* ═══ GENERAL TAB ═══ */}
                        <TabsContent value="general" className="space-y-6 mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <EditableField icon={User} label="Nombre" value={v('nombre')} field="nombre" editing={editing} onChange={handleFieldChange} />
                                <EditableField icon={User} label="Apellido Paterno" value={v('apellido_paterno')} field="apellido_paterno" editing={editing} onChange={handleFieldChange} />
                                <EditableField icon={User} label="Apellido Materno" value={v('apellido_materno')} field="apellido_materno" editing={editing} onChange={handleFieldChange} />
                                <EditableField icon={Calendar} label="Fecha de Nacimiento" value={editing ? v('fecha_nacimiento') : formatDate(paciente.fecha_nacimiento)} field="fecha_nacimiento" type={editing ? 'date' : 'text'} editing={editing} onChange={handleFieldChange} />
                                <EditableField icon={Users} label="Género" value={v('genero')} field="genero" editing={editing} onChange={handleFieldChange} options={['masculino', 'femenino', 'otro']} />
                                <EditableField icon={Shield} label="CURP" value={v('curp')} field="curp" type="mono" editing={editing} onChange={handleFieldChange} />
                                <EditableField icon={FileText} label="RFC" value={v('rfc')} field="rfc" type="mono" editing={editing} onChange={handleFieldChange} />
                                <EditableField icon={Shield} label="NSS (IMSS)" value={v('nss')} field="nss" type="mono" editing={editing} onChange={handleFieldChange} />
                                <EditableField icon={Heart} label="Estado Civil" value={v('estado_civil')} field="estado_civil" editing={editing} onChange={handleFieldChange} options={['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión libre']} />
                                <EditableField icon={Droplets} label="Tipo de Sangre" value={v('tipo_sangre')} field="tipo_sangre" editing={editing} onChange={handleFieldChange} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} />
                                <EditableField icon={AlertTriangle} label="Alergias" value={v('alergias')} field="alergias" editing={editing} onChange={handleFieldChange} />
                                <EditableField icon={CheckCircle} label="Estatus" value={v('estatus')} field="estatus" editing={editing} onChange={handleFieldChange} options={['activo', 'inactivo', 'baja']} />
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
                                        <EditableField icon={User} label="Nombre" value={v('contacto_emergencia_nombre')} field="contacto_emergencia_nombre" editing={editing} onChange={handleFieldChange} />
                                        <EditableField icon={Users} label="Parentesco" value={v('contacto_emergencia_parentesco')} field="contacto_emergencia_parentesco" editing={editing} onChange={handleFieldChange} />
                                        <EditableField icon={Phone} label="Teléfono" value={v('contacto_emergencia_telefono')} field="contacto_emergencia_telefono" editing={editing} onChange={handleFieldChange} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ═══ LABORAL TAB ═══ */}
                        <TabsContent value="laboral" className="space-y-6 mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <EditableField icon={Clipboard} label="Número de Empleado" value={v('numero_empleado')} field="numero_empleado" type="mono" editing={editing} onChange={handleFieldChange} />
                                <EditableField icon={Building2} label="Empresa" value={v('empresa_nombre')} field="empresa_nombre" editing={false} onChange={() => { }} />
                                <EditableField icon={MapPin} label="Sede" value={v('sede_nombre')} field="sede_nombre" editing={false} onChange={() => { }} />
                                <EditableField icon={Briefcase} label="Puesto" value={v('puesto')} field="puesto" editing={editing} onChange={handleFieldChange} />
                                <EditableField icon={Users} label="Área" value={v('area')} field="area" editing={editing} onChange={handleFieldChange} />
                                <EditableField icon={Users} label="Departamento" value={v('departamento')} field="departamento" editing={editing} onChange={handleFieldChange} />
                                <EditableField icon={Clock} label="Turno" value={v('turno')} field="turno" editing={editing} onChange={handleFieldChange} options={['Matutino', 'Vespertino', 'Nocturno', 'Mixto']} />
                                <EditableField icon={FileText} label="Tipo de Contrato" value={v('tipo_contrato')} field="tipo_contrato" editing={editing} onChange={handleFieldChange} options={['Indeterminado', 'Temporal', 'Prueba', 'Capacitación', 'De obra']} />
                                <EditableField icon={Calendar} label="Fecha de Ingreso" value={editing ? v('fecha_ingreso') : formatDate(paciente.fecha_ingreso)} field="fecha_ingreso" type={editing ? 'date' : 'text'} editing={editing} onChange={handleFieldChange} />
                                <EditableField icon={Clock} label="Jornada (horas)" value={v('jornada_horas')?.toString() || ''} field="jornada_horas" type="number" editing={editing} onChange={handleFieldChange} />
                                <EditableField icon={User} label="Supervisor" value={v('supervisor_nombre')} field="supervisor_nombre" editing={editing} onChange={handleFieldChange} />
                            </div>

                            {/* ═══ RISK ANALYZER SECTION ═══ */}
                            <Card className="border-violet-200 bg-gradient-to-br from-violet-50/80 to-indigo-50/50 shadow-lg">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-violet-800 text-base">
                                            <Brain className="w-5 h-5 text-violet-500" />
                                            Analizador de Riesgos Laborales
                                            <Badge className="bg-violet-100 text-violet-700 border-violet-200 text-[10px]">IA</Badge>
                                        </CardTitle>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleAnalyzeRisks}
                                                disabled={isAnalyzingAI}
                                                size="sm"
                                                className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white rounded-xl gap-2 text-xs shadow-md"
                                            >
                                                {isAnalyzingAI ? (
                                                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analizando...</>
                                                ) : (
                                                    <><Zap className="w-3.5 h-3.5" /> Analizar con IA</>
                                                )}
                                            </Button>
                                            {showRiesgos && totalRisksCount > 0 && (
                                                <Button
                                                    onClick={saveRisksOnly}
                                                    disabled={saving}
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-xl gap-2 text-xs"
                                                >
                                                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                                    Guardar Riesgos
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {isAnalyzingAI && (
                                        <div className="flex flex-col items-center py-8">
                                            <div className="relative">
                                                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 animate-pulse flex items-center justify-center">
                                                    <Brain className="w-8 h-8 text-white animate-bounce" />
                                                </div>
                                            </div>
                                            <p className="text-sm font-bold text-violet-700 mt-4">OpenAI analizando riesgos para "{v('puesto')}"...</p>
                                            <p className="text-xs text-violet-400 mt-1">Identificando riesgos físicos, químicos, ergonómicos y más</p>
                                        </div>
                                    )}

                                    {!isAnalyzingAI && !showRiesgos && (
                                        <div className="text-center py-6">
                                            <Zap className="w-10 h-10 mx-auto text-violet-300 mb-2" />
                                            <p className="text-sm font-semibold text-slate-500">Presiona "Analizar con IA" para identificar riesgos del puesto</p>
                                            <p className="text-xs text-slate-400 mt-1">La IA analizará el puesto "{v('puesto') || '(sin puesto)'}" y determinará los riesgos laborales</p>
                                        </div>
                                    )}

                                    {!isAnalyzingAI && showRiesgos && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                                <span className="text-sm font-bold text-emerald-800">
                                                    Análisis completado — {totalRisksCount} riesgos identificados
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                                {Object.entries(RISK_CATEGORIES).map(([catKey, cat]) => {
                                                    const catRisks = (riesgos as any)[catKey] || {}
                                                    const activeCount = Object.values(catRisks).filter(Boolean).length
                                                    return (
                                                        <div key={catKey} className={`rounded-xl border p-3 transition-all ${activeCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-lg">{cat.emoji}</span>
                                                                <span className="text-xs font-bold text-slate-700">{cat.label}</span>
                                                                {activeCount > 0 && (
                                                                    <Badge className="bg-amber-200 text-amber-800 text-[9px] ml-auto">{activeCount}</Badge>
                                                                )}
                                                            </div>
                                                            <div className="space-y-1">
                                                                {Object.entries(cat.items).map(([riskKey, riskLabel]) => {
                                                                    const active = catRisks[riskKey] || false
                                                                    return (
                                                                        <button
                                                                            key={riskKey}
                                                                            onClick={() => toggleRisk(catKey, riskKey)}
                                                                            className={`w-full text-left px-2 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 ${active
                                                                                ? 'bg-amber-200/80 text-amber-900'
                                                                                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                                                                }`}
                                                                        >
                                                                            <span className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${active ? 'bg-amber-500 border-amber-500' : 'border-slate-300'}`} />
                                                                            {riskLabel}
                                                                        </button>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ═══ CONTACTO TAB ═══ */}
                        <TabsContent value="contacto" className="space-y-6 mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <EditableField icon={Mail} label="Correo Electrónico" value={v('email')} field="email" editing={editing} onChange={handleFieldChange} />
                                <EditableField icon={Phone} label="Teléfono" value={v('telefono')} field="telefono" editing={editing} onChange={handleFieldChange} />
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
                                <HistorialClinicoCompleto pacienteId={id!} />
                            </Suspense>
                        </TabsContent>

                        {/* ═══ TREATMENT TABS ═══ */}
                        <TabsContent value="recetas" className="mt-0">
                            <Suspense fallback={<TabLoader label="Cargando recetas..." />}>
                                <RecetasTab pacienteId={id!} />
                            </Suspense>
                        </TabsContent>

                        <TabsContent value="incapacidades" className="mt-0">
                            <Suspense fallback={<TabLoader label="Cargando incapacidades..." />}>
                                <IncapacidadesTab pacienteId={id!} />
                            </Suspense>
                        </TabsContent>

                        <TabsContent value="dictamenes" className="mt-0">
                            <Suspense fallback={<TabLoader label="Cargando dictámenes..." />}>
                                <DictamenesTab pacienteId={id!} />
                            </Suspense>
                        </TabsContent>

                        <TabsContent value="documentos" className="mt-0">
                            <Suspense fallback={<TabLoader label="Cargando documentos cifrados..." />}>
                                <DocumentosExpedienteTab
                                    pacienteId={id!}
                                    empresaId={user?.empresa_id || ''}
                                    pacienteNombre={`${paciente.nombre} ${paciente.apellido_paterno}`}
                                />
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
        <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
            <p className="text-sm font-semibold text-slate-400">{label}</p>
        </div>
    )
}
