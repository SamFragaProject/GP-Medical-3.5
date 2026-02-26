/**
 * WizardAltaPaciente - Wizard estilo install para registrar pacientes
 * 
 * Pasos:
 * 1. Datos Personales (nombre, CURP, fecha nacimiento, género)
 * 2. Datos Laborales (empresa, sede, puesto, turno, etc.)
 * 3. Datos Médicos (tipo sangre, alergias, contacto emergencia)
 * 4. Contacto (email, teléfono, foto)
 * 5. Exámenes Médicos (Laboratorios y Exámenes de ingreso)
 * 6. Revisión y Confirmación
 */
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User, Building2, Heart, Phone, CheckCircle,
    ArrowLeft, ArrowRight, X, Save, Loader2,
    Calendar, Fingerprint, MapPin, Briefcase,
    Droplets, AlertTriangle, Users, Mail, Camera,
    Shield, FileText, Clock, ClipboardList,
    LogIn, LogOut, ArrowRightLeft, RotateCcw,
    Brain, ShieldAlert, Sparkles, HardHat, TestTube, Microscope
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import toast from 'react-hot-toast'
import {
    analyzeJobPosition, EMPTY_RISKS, RISK_CATEGORIES,
    type OccupationalRisks, type AIJobAnalysis
} from '@/services/aiService'

// =============================================
// TYPES
// =============================================
interface WizardProps {
    onComplete: (data: any) => Promise<void>
    onCancel: () => void
    empresaId?: string
}

interface PatientFormData {
    // Tipo de examen
    tipo_examen: string
    // Paso 1: Personales
    nombre: string
    apellido_paterno: string
    apellido_materno: string
    curp: string
    rfc: string
    nss: string
    fecha_nacimiento: string
    genero: string
    estado_civil: string
    // Paso 2: Laborales
    empresa_id: string
    sede_id: string
    numero_empleado: string
    puesto: string
    area: string
    departamento: string
    turno: string
    fecha_ingreso: string
    tipo_contrato: string
    jornada_horas: string
    supervisor_nombre: string
    // Paso 3: Médicos
    tipo_sangre: string
    alergias: string
    contacto_emergencia_nombre: string
    contacto_emergencia_parentesco: string
    contacto_emergencia_telefono: string
    // Nuevas adiciones médicas
    antecedentes_heredofamiliares: string
    antecedentes_zootecnicos: boolean
    mascotas: string
    // Paso 4: Contacto
    email: string
    telefono: string
    foto_url: string
    estatus: string
    // Paso 5: Exámenes y Laboratorios
    examenes_fisicos_completados: boolean
    laboratorios_completados: boolean
    notas_examenes: string
    examenes_no_aplica: boolean
}

const INITIAL_DATA: PatientFormData = {
    tipo_examen: '',
    nombre: '', apellido_paterno: '', apellido_materno: '',
    curp: '', rfc: '', nss: '',
    fecha_nacimiento: '', genero: '', estado_civil: '',
    empresa_id: '', sede_id: '', numero_empleado: '',
    puesto: '', area: '', departamento: '',
    turno: '', fecha_ingreso: '', tipo_contrato: '',
    jornada_horas: '', supervisor_nombre: '',
    tipo_sangre: '', alergias: '',
    antecedentes_heredofamiliares: '',
    antecedentes_zootecnicos: false, mascotas: '',
    contacto_emergencia_nombre: '', contacto_emergencia_parentesco: '',
    contacto_emergencia_telefono: '',
    email: '', telefono: '', foto_url: '', estatus: 'activo',
    examenes_fisicos_completados: false, laboratorios_completados: false, notas_examenes: '', examenes_no_aplica: false
}

const STEPS = [
    { id: 1, title: 'Datos Personales', subtitle: 'Identidad del paciente', icon: User, color: 'from-emerald-500 to-teal-600' },
    { id: 2, title: 'Datos Laborales', subtitle: 'Información de la empresa', icon: Building2, color: 'from-blue-500 to-indigo-600' },
    { id: 3, title: 'Datos Médicos', subtitle: 'Salud y emergencia', icon: Heart, color: 'from-rose-500 to-pink-600' },
    { id: 4, title: 'Contacto', subtitle: 'Email, teléfono y foto', icon: Phone, color: 'from-violet-500 to-purple-600' },
    { id: 5, title: 'Exámenes', subtitle: 'Laboratorios y físicos', icon: Microscope, color: 'from-cyan-500 to-blue-600' },
    { id: 6, title: 'Confirmar', subtitle: 'Revisión final', icon: CheckCircle, color: 'from-emerald-400 to-green-600' },
]

const GENEROS = [
    { value: 'masculino', label: 'Masculino', emoji: '♂' },
    { value: 'femenino', label: 'Femenino', emoji: '♀' },
    { value: 'otro', label: 'Otro', emoji: '⚧' },
]

const TIPOS_EXAMEN = [
    { value: 'periodico', label: 'Periódico', description: 'Examen médico de rutina anual/semestral', icon: RotateCcw, color: 'from-emerald-500 to-teal-600', bgActive: 'bg-emerald-50 border-emerald-500', textActive: 'text-emerald-700' },
    { value: 'ingreso', label: 'Ingreso', description: 'Examen de nuevo ingreso laboral', icon: LogIn, color: 'from-blue-500 to-indigo-600', bgActive: 'bg-blue-50 border-blue-500', textActive: 'text-blue-700' },
    { value: 'egreso', label: 'Egreso', description: 'Examen de salida / baja laboral', icon: LogOut, color: 'from-amber-500 to-orange-600', bgActive: 'bg-amber-50 border-amber-500', textActive: 'text-amber-700' },
    { value: 'cambio_puesto', label: 'Cambio de Puesto', description: 'Reubicación o cambio de funciones', icon: ArrowRightLeft, color: 'from-violet-500 to-purple-600', bgActive: 'bg-violet-50 border-violet-500', textActive: 'text-violet-700' },
]

const ESTADO_CIVIL_OPTIONS = ['Soltero(a)', 'Casado(a)', 'Divorciado(a)', 'Viudo(a)', 'Unión Libre']
const TURNOS = ['Matutino', 'Vespertino', 'Nocturno', 'Mixto']
const CONTRATOS = ['Indefinido', 'Temporal', 'Por Obra', 'Honorarios', 'Outsourcing']
const TIPOS_SANGRE = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

// =============================================
// COMPONENTS
// =============================================

function FormField({ label, children, required, hint }: { label: string; children: React.ReactNode; required?: boolean; hint?: string }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            {children}
            {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
        </div>
    )
}

function SelectField({ value, onChange, options, placeholder }: {
    value: string; onChange: (v: string) => void; options: string[] | { value: string; label: string }[]; placeholder?: string
}) {
    return (
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
        >
            <option value="">{placeholder || 'Seleccionar...'}</option>
            {options.map(opt => {
                const val = typeof opt === 'string' ? opt : opt.value
                const label = typeof opt === 'string' ? opt : opt.label
                return <option key={val} value={val}>{label}</option>
            })}
        </select>
    )
}

// =============================================
// MAIN COMPONENT
// =============================================
export default function WizardAltaPaciente({ onComplete, onCancel, empresaId }: WizardProps) {
    const [step, setStep] = useState(1)
    const [data, setData] = useState<PatientFormData>(() => {
        // AUTOSAVE: Load from localStorage on mount
        const saved = localStorage.getItem('wizard_alta_paciente')
        if (saved) {
            try {
                return { ...JSON.parse(saved), empresa_id: empresaId || '' }
            } catch (e) {
                // Ignore parse errors
            }
        }
        return {
            ...INITIAL_DATA,
            empresa_id: empresaId || '',
        }
    })
    const [saving, setSaving] = useState(false)

    // Autosave sync to localStorage
    useEffect(() => {
        if (data && Object.values(data).some(val => val !== '' && val !== false)) {
            localStorage.setItem('wizard_alta_paciente', JSON.stringify(data))
        }
    }, [data])

    // Riesgos Laborales - AI powered
    const [riesgos, setRiesgos] = useState<OccupationalRisks>({ ...EMPTY_RISKS })
    const [aiAnalysis, setAiAnalysis] = useState<AIJobAnalysis | null>(null)
    const [isAnalyzingAI, setIsAnalyzingAI] = useState(false)
    const [showRiesgos, setShowRiesgos] = useState(false)

    const updateField = (field: keyof PatientFormData, value: string) => {
        setData(prev => ({ ...prev, [field]: value }))
    }

    const handleAnalyzeWithAI = async () => {
        if (!data.puesto.trim()) {
            toast.error('Primero ingresa un puesto de trabajo')
            return
        }
        setIsAnalyzingAI(true)
        setShowRiesgos(true)
        try {
            const result = await analyzeJobPosition(data.puesto)
            setRiesgos(result.riesgos)
            setAiAnalysis(result)
            toast.success(`Riesgos analizados para "${data.puesto}"`)
        } catch (error: any) {
            console.error('AI analysis error:', error)
            toast.error(error.message || 'Error al analizar el puesto')
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

    const canAdvance = (): boolean => {
        switch (step) {
            case 1: return !!(data.tipo_examen && data.nombre && data.apellido_paterno)
            case 2: return true // Laboral data can be optional
            case 3: return true
            case 4: return true
            case 5: return true
            case 6: return true
            default: return false
        }
    }

    const handleNext = () => {
        if (step < 6) setStep(step + 1)
    }

    const handlePrev = () => {
        if (step > 1) setStep(step - 1)
    }

    const handleSubmit = async () => {
        setSaving(true)
        try {
            const cleanData: any = {}
            for (const [k, v] of Object.entries(data)) {
                if (v !== '' && v !== undefined && v !== null) {
                    cleanData[k] = v
                }
            }
            if (cleanData.jornada_horas) cleanData.jornada_horas = parseInt(cleanData.jornada_horas)

            // Incluir riesgos identificados y análisis IA
            cleanData.riesgos_ocupacionales = riesgos
            cleanData.analisis_puesto_ai = aiAnalysis

            await onComplete(cleanData)
            // Clear autosave progress after success
            localStorage.removeItem('wizard_alta_paciente')
        } catch {
            // parent handles error
        } finally {
            setSaving(false)
        }
    }

    const progress = (step / 6) * 100

    return (
        <div className="min-h-[80vh] flex flex-col">
            {/* ── HEADER ── */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 mb-6 border border-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.1),transparent_50%)]" />

                <div className="relative z-10 flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-white mb-1">Alta de Paciente</h1>
                        <p className="text-sm text-slate-400">Wizard de registro paso a paso</p>
                    </div>
                    <Button variant="ghost" onClick={onCancel} className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Step Indicators */}
                <div className="relative z-10 flex items-center justify-between gap-2">
                    {STEPS.map((s, idx) => {
                        const isActive = step === s.id
                        const isCompleted = step > s.id
                        const StepIcon = s.icon

                        return (
                            <button
                                key={s.id}
                                onClick={() => s.id < step && setStep(s.id)}
                                className={`flex-1 flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white/10 backdrop-blur-md border border-white/20 shadow-lg' :
                                    isCompleted ? 'bg-emerald-500/10 border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/20' :
                                        'bg-white/5 border border-white/5'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${isActive ? `bg-gradient-to-br ${s.color} shadow-lg` :
                                    isCompleted ? 'bg-emerald-500/20' : 'bg-white/5'
                                    }`}>
                                    {isCompleted ? (
                                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                                    ) : (
                                        <StepIcon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                                    )}
                                </div>
                                <div className="hidden lg:block text-left min-w-0">
                                    <p className={`text-[10px] font-bold uppercase tracking-wider truncate ${isActive ? 'text-white' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                                        }`}>{s.title}</p>
                                    <p className="text-[9px] text-slate-500 truncate">{s.subtitle}</p>
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Progress Bar */}
                <div className="relative z-10 mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* ── CONTENT ── */}
            <Card className="flex-1 border-0 shadow-xl bg-white rounded-3xl overflow-hidden flex flex-col min-h-0">
                <CardContent className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* STEP 1: Datos Personales */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                            <User className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800">Datos Personales</h2>
                                            <p className="text-sm text-slate-500">Tipo de examen e información de identidad</p>
                                        </div>
                                    </div>

                                    {/* Tipo de Examen Selector */}
                                    <div className="mb-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-3 block">
                                            <ClipboardList className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                                            Tipo de Examen <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {TIPOS_EXAMEN.map(tipo => {
                                                const isSelected = data.tipo_examen === tipo.value
                                                const TipoIcon = tipo.icon
                                                return (
                                                    <motion.button
                                                        key={tipo.value}
                                                        type="button"
                                                        onClick={() => updateField('tipo_examen', tipo.value)}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 ${isSelected
                                                            ? `${tipo.bgActive} shadow-lg`
                                                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                                                            }`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isSelected
                                                            ? `bg-gradient-to-br ${tipo.color} shadow-md`
                                                            : 'bg-slate-100'
                                                            }`}>
                                                            <TipoIcon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                                                        </div>
                                                        <p className={`font-bold text-sm ${isSelected ? tipo.textActive : 'text-slate-700'}`}>
                                                            {tipo.label}
                                                        </p>
                                                        <p className={`text-[10px] mt-0.5 leading-tight ${isSelected ? 'text-slate-500' : 'text-slate-400'}`}>
                                                            {tipo.description}
                                                        </p>
                                                        {isSelected && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center"
                                                            >
                                                                <CheckCircle className="w-3.5 h-3.5 text-white" />
                                                            </motion.div>
                                                        )}
                                                    </motion.button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Separator */}
                                    <div className="border-t border-slate-100" />

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <FormField label="Nombre(s)" required>
                                            <Input
                                                value={data.nombre}
                                                onChange={e => updateField('nombre', e.target.value)}
                                                placeholder="Juan Carlos"
                                                className="h-11 rounded-xl"
                                            />
                                        </FormField>

                                        <FormField label="Apellido Paterno" required>
                                            <Input
                                                value={data.apellido_paterno}
                                                onChange={e => updateField('apellido_paterno', e.target.value)}
                                                placeholder="Hernández"
                                                className="h-11 rounded-xl"
                                            />
                                        </FormField>

                                        <FormField label="Apellido Materno">
                                            <Input
                                                value={data.apellido_materno}
                                                onChange={e => updateField('apellido_materno', e.target.value)}
                                                placeholder="García"
                                                className="h-11 rounded-xl"
                                            />
                                        </FormField>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <FormField label="CURP" hint="18 caracteres alfanuméricos">
                                            <Input
                                                value={data.curp}
                                                onChange={e => updateField('curp', e.target.value.toUpperCase())}
                                                placeholder="HEGJ950101HDFRRN09"
                                                maxLength={18}
                                                className="h-11 rounded-xl font-mono"
                                            />
                                        </FormField>

                                        <FormField label="RFC">
                                            <Input
                                                value={data.rfc}
                                                onChange={e => updateField('rfc', e.target.value.toUpperCase())}
                                                placeholder="HEGJ950101XXX"
                                                maxLength={13}
                                                className="h-11 rounded-xl font-mono"
                                            />
                                        </FormField>

                                        <FormField label="NSS (IMSS)">
                                            <Input
                                                value={data.nss}
                                                onChange={e => updateField('nss', e.target.value)}
                                                placeholder="12345678901"
                                                maxLength={11}
                                                className="h-11 rounded-xl font-mono"
                                            />
                                        </FormField>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <FormField label="Fecha de Nacimiento">
                                            <Input
                                                type="date"
                                                value={data.fecha_nacimiento}
                                                onChange={e => updateField('fecha_nacimiento', e.target.value)}
                                                className="h-11 rounded-xl"
                                            />
                                        </FormField>

                                        <FormField label="Género">
                                            <div className="flex gap-2">
                                                {GENEROS.map(g => (
                                                    <button
                                                        key={g.value}
                                                        onClick={() => updateField('genero', g.value)}
                                                        className={`flex-1 h-11 rounded-xl border-2 font-bold text-sm transition-all ${data.genero === g.value
                                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                                            }`}
                                                    >
                                                        {g.emoji} {g.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </FormField>

                                        <FormField label="Estado Civil">
                                            <SelectField
                                                value={data.estado_civil}
                                                onChange={v => updateField('estado_civil', v)}
                                                options={ESTADO_CIVIL_OPTIONS}
                                            />
                                        </FormField>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: Datos Laborales */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                            <Building2 className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800">Datos Laborales</h2>
                                            <p className="text-sm text-slate-500">Empresa, puesto y turno de trabajo</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <FormField label="Número de Empleado" hint={data.tipo_examen !== 'periodico' ? 'Solo habilitado para examen periódico' : undefined}>
                                            <Input
                                                value={data.numero_empleado}
                                                onChange={e => updateField('numero_empleado', e.target.value)}
                                                placeholder={data.tipo_examen === 'periodico' ? 'EMP-0042' : 'N/A — Solo examen periódico'}
                                                disabled={data.tipo_examen !== 'periodico'}
                                                className={`h-11 rounded-xl transition-all ${data.tipo_examen !== 'periodico'
                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                                                    : ''
                                                    }`}
                                            />
                                        </FormField>

                                        <FormField label="Puesto">
                                            <Input
                                                value={data.puesto}
                                                onChange={e => updateField('puesto', e.target.value)}
                                                onBlur={() => {
                                                    // Trigger AI automatically on blur if not analyzed yet
                                                    if (data.puesto.trim() && !showRiesgos && !isAnalyzingAI) {
                                                        handleAnalyzeWithAI()
                                                    }
                                                }}
                                                placeholder="Ingeniero de Producción"
                                                className="h-11 rounded-xl"
                                            />
                                        </FormField>

                                        <FormField label="Área">
                                            <Input
                                                value={data.area}
                                                onChange={e => updateField('area', e.target.value)}
                                                placeholder="Producción"
                                                className="h-11 rounded-xl"
                                            />
                                        </FormField>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <FormField label="Departamento">
                                            <Input
                                                value={data.departamento}
                                                onChange={e => updateField('departamento', e.target.value)}
                                                placeholder="Mantenimiento"
                                                className="h-11 rounded-xl"
                                            />
                                        </FormField>

                                        <FormField label="Turno">
                                            <SelectField value={data.turno} onChange={v => updateField('turno', v)} options={TURNOS} />
                                        </FormField>

                                        <FormField label="Fecha de Ingreso">
                                            <Input
                                                type="date"
                                                value={data.fecha_ingreso}
                                                onChange={e => updateField('fecha_ingreso', e.target.value)}
                                                className="h-11 rounded-xl"
                                            />
                                        </FormField>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <FormField label="Tipo de Contrato">
                                            <SelectField value={data.tipo_contrato} onChange={v => updateField('tipo_contrato', v)} options={CONTRATOS} />
                                        </FormField>

                                        <FormField label="Jornada (horas)">
                                            <Input
                                                type="number"
                                                value={data.jornada_horas}
                                                onChange={e => updateField('jornada_horas', e.target.value)}
                                                placeholder="8"
                                                min={1}
                                                max={24}
                                                className="h-11 rounded-xl"
                                            />
                                        </FormField>

                                        <FormField label="Supervisor">
                                            <Input
                                                value={data.supervisor_nombre}
                                                onChange={e => updateField('supervisor_nombre', e.target.value)}
                                                placeholder="Ing. Ramírez"
                                                className="h-11 rounded-xl"
                                            />
                                        </FormField>
                                    </div>

                                    {/* ── RIESGOS LABORALES ── */}
                                    <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
                                                    <ShieldAlert className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-800">Riesgos Laborales</h3>
                                                    <p className="text-xs text-slate-500">Análisis automático con IA basado en el puesto</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleAnalyzeWithAI}
                                                disabled={isAnalyzingAI || !data.puesto.trim()}
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 hover:shadow-lg hover:shadow-violet-500/30"
                                            >
                                                {isAnalyzingAI ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Analizando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Brain className="w-4 h-4" />
                                                        <Sparkles className="w-3 h-3" />
                                                        Analizar con IA
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {!showRiesgos && !isAnalyzingAI && (
                                            <div className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                                <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                                <p className="text-sm text-slate-500 font-medium">Ingresa un puesto y presiona "Analizar con IA"</p>
                                                <p className="text-xs text-slate-400 mt-1">La IA identificará automáticamente los riesgos del puesto</p>
                                            </div>
                                        )}

                                        {isAnalyzingAI && (
                                            <div className="text-center py-10 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-200">
                                                <div className="relative inline-flex">
                                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 animate-pulse">
                                                        <Brain className="w-8 h-8 text-white" />
                                                    </div>
                                                </div>
                                                <p className="text-sm text-violet-700 font-bold mt-4">Analizando puesto: "{data.puesto}"</p>
                                                <p className="text-xs text-violet-500 mt-1">OpenAI está identificando los riesgos laborales...</p>
                                            </div>
                                        )}

                                        {showRiesgos && !isAnalyzingAI && (
                                            <div className="space-y-4">
                                                {/* AI Results banner */}
                                                {aiAnalysis && (
                                                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Sparkles className="w-4 h-4 text-emerald-600" />
                                                            <span className="text-sm font-bold text-emerald-800">Análisis completado — {totalRisksCount} riesgos identificados</span>
                                                        </div>
                                                        {aiAnalysis.detalles.descripcionFunciones && (
                                                            <p className="text-xs text-emerald-700 mt-1">
                                                                <strong>Funciones:</strong> {aiAnalysis.detalles.descripcionFunciones.substring(0, 200)}...
                                                            </p>
                                                        )}
                                                        {aiAnalysis.detalles.eppRecomendado.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                                <HardHat className="w-3.5 h-3.5 text-emerald-600 mt-0.5" />
                                                                {aiAnalysis.detalles.eppRecomendado.map((epp, i) => (
                                                                    <span key={i} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">{epp}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Risk categories grid */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    {Object.entries(RISK_CATEGORIES).map(([catKey, cat]) => {
                                                        const catRisks = (riesgos as any)[catKey] || {}
                                                        const activeCount = Object.values(catRisks).filter(Boolean).length
                                                        return (
                                                            <div key={catKey} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                                <div className={`px-3 py-2 flex items-center justify-between ${activeCount > 0 ? 'bg-amber-50 border-b border-amber-200' : 'bg-slate-50 border-b border-slate-200'}`}>
                                                                    <span className="text-xs font-bold text-slate-700">{cat.emoji} {cat.label}</span>
                                                                    {activeCount > 0 && (
                                                                        <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-bold">{activeCount}</span>
                                                                    )}
                                                                </div>
                                                                <div className="p-2 space-y-1">
                                                                    {Object.entries(cat.items).map(([riskKey, riskLabel]) => (
                                                                        <label key={riskKey} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded px-1 py-0.5 transition-colors">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={catRisks[riskKey] || false}
                                                                                onChange={() => toggleRisk(catKey, riskKey)}
                                                                                className="w-3.5 h-3.5 rounded border-slate-300 text-amber-500 focus:ring-amber-500/30"
                                                                            />
                                                                            <span className={`text-xs ${catRisks[riskKey] ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                                                                                {riskLabel}
                                                                            </span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Datos Médicos */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
                                            <Heart className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800">Datos Médicos</h2>
                                            <p className="text-sm text-slate-500">Información de salud y contacto de emergencia</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FormField label="Tipo de Sangre">
                                            <div className="grid grid-cols-4 gap-2">
                                                {TIPOS_SANGRE.map(ts => (
                                                    <button
                                                        key={ts}
                                                        onClick={() => updateField('tipo_sangre', ts)}
                                                        className={`h-11 rounded-xl border-2 font-bold text-sm transition-all ${data.tipo_sangre === ts
                                                            ? 'border-rose-500 bg-rose-50 text-rose-700'
                                                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                                            }`}
                                                    >
                                                        {ts}
                                                    </button>
                                                ))}
                                            </div>
                                        </FormField>

                                        <FormField label="Alergias Conocidas" hint="Separar con comas">
                                            <textarea
                                                value={data.alergias}
                                                onChange={e => updateField('alergias', e.target.value)}
                                                placeholder="Penicilina, Polvo, Mariscos..."
                                                rows={3}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm resize-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                                            />
                                        </FormField>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FormField label="Antecedentes Heredofamiliares" hint="Diabetes, Hipertensión, Cáncer, Cardiopatías...">
                                            <textarea
                                                value={data.antecedentes_heredofamiliares}
                                                onChange={e => updateField('antecedentes_heredofamiliares', e.target.value)}
                                                placeholder="Madre finada por cáncer, Padre hipertenso..."
                                                rows={4}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm resize-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                                            />
                                        </FormField>

                                        <div className="space-y-4">
                                            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-all mt-6">
                                                <input
                                                    type="checkbox"
                                                    checked={data.antecedentes_zootecnicos}
                                                    onChange={e => updateField('antecedentes_zootecnicos', e.target.checked ? "true" : "false")}
                                                    className="w-5 h-5 text-purple-500 rounded border-slate-300 focus:ring-purple-500"
                                                />
                                                <span className="text-sm font-medium text-slate-700">Antecedentes Zootécnicos (Tiene mascotas)</span>
                                            </label>
                                            <AnimatePresence>
                                                {data.antecedentes_zootecnicos && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                    >
                                                        <FormField label="Especifique las mascotas" hint="Perros, gatos, aves, etc. y condiciones">
                                                            <Input
                                                                value={data.mascotas}
                                                                onChange={e => updateField('mascotas', e.target.value)}
                                                                placeholder="2 perros (vacunados), 1 gato..."
                                                                className="h-11 rounded-xl"
                                                            />
                                                        </FormField>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Contacto de Emergencia */}
                                    <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
                                        <div className="flex items-center gap-2 mb-4">
                                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                                            <h3 className="font-bold text-amber-800 text-sm">Contacto de Emergencia</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <FormField label="Nombre completo">
                                                <Input
                                                    value={data.contacto_emergencia_nombre}
                                                    onChange={e => updateField('contacto_emergencia_nombre', e.target.value)}
                                                    placeholder="María García López"
                                                    className="h-11 rounded-xl bg-white"
                                                />
                                            </FormField>
                                            <FormField label="Parentesco">
                                                <SelectField
                                                    value={data.contacto_emergencia_parentesco}
                                                    onChange={v => updateField('contacto_emergencia_parentesco', v)}
                                                    options={['Esposo(a)', 'Padre/Madre', 'Hermano(a)', 'Hijo(a)', 'Otro']}
                                                />
                                            </FormField>
                                            <FormField label="Teléfono">
                                                <Input
                                                    value={data.contacto_emergencia_telefono}
                                                    onChange={e => updateField('contacto_emergencia_telefono', e.target.value)}
                                                    placeholder="55 1234 5678"
                                                    className="h-11 rounded-xl bg-white"
                                                />
                                            </FormField>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: Contacto */}
                            {step === 4 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                                            <Phone className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800">Contacto</h2>
                                            <p className="text-sm text-slate-500">Datos de contacto del paciente</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FormField label="Correo Electrónico">
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <Input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={e => updateField('email', e.target.value)}
                                                    placeholder="paciente@email.com"
                                                    className="h-11 rounded-xl pl-10"
                                                />
                                            </div>
                                        </FormField>

                                        <FormField label="Teléfono">
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <Input
                                                    value={data.telefono}
                                                    onChange={e => updateField('telefono', e.target.value)}
                                                    placeholder="55 1234 5678"
                                                    className="h-11 rounded-xl pl-10"
                                                />
                                            </div>
                                        </FormField>
                                    </div>

                                    <FormField label="URL de Foto (opcional)">
                                        <Input
                                            value={data.foto_url}
                                            onChange={e => updateField('foto_url', e.target.value)}
                                            placeholder="https://..."
                                            className="h-11 rounded-xl"
                                        />
                                    </FormField>
                                </div>
                            )}

                            {/* STEP 5: Exámenes Médicos y Laboratorios */}
                            {step === 5 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                            <Microscope className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800">Laboratorios y Exámenes</h2>
                                            <p className="text-sm text-slate-500">Ingreso de todos los exámenes y laboratorios iniciales en la misma sesión.</p>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 mb-6">
                                        <div className="flex gap-3">
                                            <div className="bg-blue-100 rounded-lg p-2 flex-shrink-0 h-10 w-10 flex items-center justify-center">
                                                <TestTube className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-blue-900">Ingreso Integral</h3>
                                                <p className="text-xs text-blue-700 mt-1">
                                                    Para el alta de este paciente, debes registrar tanto la exploración física como los resultados de laboratorio en este primer paso. Cualquier ajuste posterior requerirá solicitud al médico o administrador de la empresa.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-all">
                                            <input
                                                type="checkbox"
                                                checked={data.examenes_no_aplica}
                                                onChange={e => updateField('examenes_no_aplica', e.target.checked ? "true" : "false")}
                                                className="w-5 h-5 text-amber-500 rounded border-amber-300 focus:ring-amber-500"
                                            />
                                            <span className="text-sm font-bold text-amber-800">No aplica — Omitir captura de exámenes y laboratorios en este momento</span>
                                        </label>
                                    </div>

                                    {!data.examenes_no_aplica && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                                <div className="space-y-4 rounded-xl border border-slate-200 p-5 bg-white">
                                                    <div className="flex items-center gap-2 text-slate-700 font-bold mb-2">
                                                        <Heart className="w-5 h-5 text-rose-500" />
                                                        Exploración Física
                                                    </div>
                                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all">
                                                        <input
                                                            type="checkbox"
                                                            checked={data.examenes_fisicos_completados}
                                                            onChange={e => updateField('examenes_fisicos_completados', e.target.checked ? "true" : "false")}
                                                            className="w-5 h-5 text-emerald-500 rounded border-slate-300 focus:ring-emerald-500"
                                                        />
                                                        <span className="text-sm font-medium text-slate-700">Exploración física inicial capturada</span>
                                                    </label>
                                                </div>

                                                <div className="space-y-4 rounded-xl border border-slate-200 p-5 bg-white">
                                                    <div className="flex items-center gap-2 text-slate-700 font-bold mb-2">
                                                        <TestTube className="w-5 h-5 text-indigo-500" />
                                                        Laboratorios clínicos
                                                    </div>
                                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all">
                                                        <input
                                                            type="checkbox"
                                                            checked={data.laboratorios_completados}
                                                            onChange={e => updateField('laboratorios_completados', e.target.checked ? "true" : "false")}
                                                            className="w-5 h-5 text-emerald-500 rounded border-slate-300 focus:ring-emerald-500"
                                                        />
                                                        <span className="text-sm font-medium text-slate-700">Muestras y resultados iniciales registrados</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <FormField label="Notas adicionales sobre los exámenes de ingreso" hint="Cualquier observación general para el expediente integral">
                                                <textarea
                                                    value={data.notas_examenes}
                                                    onChange={e => updateField('notas_examenes', e.target.value)}
                                                    placeholder="El paciente reporta haber estado en ayuno de 12 horas. Se tomaron signos vitales..."
                                                    rows={4}
                                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm resize-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                                                />
                                            </FormField>
                                        </motion.div>
                                    )}

                                </div>
                            )}

                            {/* STEP 6: Revisión */}
                            {step === 6 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                            <CheckCircle className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800">Revisión Final</h2>
                                            <p className="text-sm text-slate-500">Confirma que los datos sean correctos antes de guardar</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Personal */}
                                        <ReviewSection
                                            title="Datos Personales"
                                            icon={User}
                                            color="emerald"
                                            items={[
                                                { label: 'Tipo Examen', value: TIPOS_EXAMEN.find(t => t.value === data.tipo_examen)?.label || '' },
                                                { label: 'Nombre', value: `${data.nombre} ${data.apellido_paterno} ${data.apellido_materno}` },
                                                { label: 'CURP', value: data.curp },
                                                { label: 'RFC', value: data.rfc },
                                                { label: 'NSS', value: data.nss },
                                                { label: 'Nacimiento', value: data.fecha_nacimiento },
                                                { label: 'Género', value: data.genero },
                                                { label: 'Estado Civil', value: data.estado_civil },
                                            ]}
                                        />

                                        {/* Laboral */}
                                        <ReviewSection
                                            title="Datos Laborales"
                                            icon={Building2}
                                            color="blue"
                                            items={[
                                                { label: 'No. Empleado', value: data.numero_empleado },
                                                { label: 'Puesto', value: data.puesto },
                                                { label: 'Área', value: data.area },
                                                { label: 'Departamento', value: data.departamento },
                                                { label: 'Turno', value: data.turno },
                                                { label: 'Ingreso', value: data.fecha_ingreso },
                                                { label: 'Contrato', value: data.tipo_contrato },
                                                { label: 'Riesgos Identificados', value: totalRisksCount > 0 ? `${totalRisksCount} riesgos laborales` : '' },
                                            ]}
                                        />

                                        {/* Médico */}
                                        <ReviewSection
                                            title="Datos Médicos"
                                            icon={Heart}
                                            color="rose"
                                            items={[
                                                { label: 'Tipo Sangre', value: data.tipo_sangre },
                                                { label: 'Alergias', value: data.alergias },
                                                { label: 'Heredofamiliares', value: data.antecedentes_heredofamiliares },
                                                { label: 'Mascotas (Zootécnicos)', value: data.antecedentes_zootecnicos ? data.mascotas || 'Sí' : 'No' },
                                                { label: 'Contacto Emergencia', value: data.contacto_emergencia_nombre },
                                                { label: 'Parentesco', value: data.contacto_emergencia_parentesco },
                                                { label: 'Tel. Emergencia', value: data.contacto_emergencia_telefono },
                                            ]}
                                        />

                                        {/* Exámenes */}
                                        <ReviewSection
                                            title="Exámenes Integrales"
                                            icon={Microscope}
                                            color="emerald"
                                            items={[
                                                { label: 'Examen Físico', value: data.examenes_fisicos_completados ? 'Recabado' : 'Pendiente' },
                                                { label: 'Laboratorios', value: data.laboratorios_completados ? 'Recabados' : 'Pendientes' },
                                                { label: 'Notas', value: data.notas_examenes },
                                            ]}
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </CardContent>
            </Card>

            {/* ── FOOTER NAVIGATION ── */}
            <div className="flex items-center justify-between mt-6 p-4 bg-white rounded-2xl shadow-lg border border-slate-100">
                <Button
                    variant="outline"
                    onClick={step === 1 ? onCancel : handlePrev}
                    className="h-11 px-6 rounded-xl gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {step === 1 ? 'Cancelar' : 'Anterior'}
                </Button>

                <div className="flex items-center gap-2">
                    {STEPS.map(s => (
                        <div
                            key={s.id}
                            className={`w-2 h-2 rounded-full transition-all ${step === s.id ? 'w-6 bg-emerald-500' : step > s.id ? 'bg-emerald-300' : 'bg-slate-200'
                                }`}
                        />
                    ))}
                </div>

                {step < 6 ? (
                    <Button
                        onClick={handleNext}
                        disabled={!canAdvance()}
                        className="h-11 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white gap-2 font-bold"
                    >
                        Siguiente
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="h-11 px-8 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white gap-2 font-black shadow-lg shadow-emerald-500/30"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Guardando...' : 'Registrar Paciente'}
                    </Button>
                )}
            </div>
        </div>
    )
}

// =============================================
// REVIEW SECTION COMPONENT
// =============================================
function ReviewSection({ title, icon: Icon, color, items }: {
    title: string
    icon: any
    color: string
    items: { label: string; value: string }[]
}) {
    const colorMap: Record<string, string> = {
        emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        blue: 'bg-blue-50 border-blue-200 text-blue-800',
        rose: 'bg-rose-50 border-rose-200 text-rose-800',
        violet: 'bg-violet-50 border-violet-200 text-violet-800',
    }
    const iconColorMap: Record<string, string> = {
        emerald: 'text-emerald-500',
        blue: 'text-blue-500',
        rose: 'text-rose-500',
        violet: 'text-violet-500',
    }

    return (
        <div className={`p-5 rounded-2xl border ${colorMap[color]}`}>
            <div className="flex items-center gap-2 mb-4">
                <Icon className={`w-5 h-5 ${iconColorMap[color]}`} />
                <h3 className="font-bold text-sm">{title}</h3>
            </div>
            <div className="space-y-2">
                {items.filter(i => i.value).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                        <span className="text-slate-500">{item.label}</span>
                        <span className="font-semibold text-slate-700">{item.value}</span>
                    </div>
                ))}
                {items.filter(i => i.value).length === 0 && (
                    <p className="text-xs text-slate-400 italic">Sin datos ingresados</p>
                )}
            </div>
        </div>
    )
}
