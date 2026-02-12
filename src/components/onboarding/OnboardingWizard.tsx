/**
 * OnboardingWizard - Wizard de configuración inicial para empresas nuevas
 * 
 * Flujo: Bienvenida → Datos de Empresa → Agregar Sedes → Importar Trabajadores
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Building2, MapPin, Users, CheckCircle2, ArrowRight, ArrowLeft,
    Sparkles, Plus, Trash2, UserPlus, Upload, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BulkImportWorkers } from './BulkImportWorkers'
import { NewPatientDialog } from '@/components/patients/NewPatientDialog'
import { dataService } from '@/services/dataService'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

type WizardStep = 'welcome' | 'empresa' | 'sedes' | 'importar'

interface SedeForm {
    nombre: string
    direccion: string
    ciudad: string
    estado: string
}

export function OnboardingWizard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState<WizardStep>('welcome')
    const [loading, setLoading] = useState(false)

    // Empresa data
    const [empresa, setEmpresa] = useState({
        nombre: '',
        rfc: '',
        razon_social: '',
        direccion: '',
        telefono: '',
        email_contacto: '',
        representante_legal: '',
        giro: ''
    })
    const [empresaId, setEmpresaId] = useState<string | null>(user?.empresa_id || null)

    // Sedes
    const [sedes, setSedes] = useState<SedeForm[]>([
        { nombre: '', direccion: '', ciudad: '', estado: '' }
    ])
    const [savedSedeIds, setSavedSedeIds] = useState<string[]>([])

    // Import mode
    const [importMode, setImportMode] = useState<'none' | 'bulk' | 'individual'>('none')
    const [showNewPatientDialog, setShowNewPatientDialog] = useState(false)
    const [importedCount, setImportedCount] = useState(0)

    // Check if empresa already exists
    useEffect(() => {
        const loadEmpresa = async () => {
            if (empresaId) {
                try {
                    const { data } = await supabase
                        .from('empresas')
                        .select('*')
                        .eq('id', empresaId)
                        .single()

                    if (data) {
                        setEmpresa({
                            nombre: data.nombre || '',
                            rfc: data.rfc || '',
                            razon_social: data.razon_social || '',
                            direccion: data.direccion || '',
                            telefono: data.telefono || '',
                            email_contacto: data.email_contacto || '',
                            representante_legal: data.representante_legal || '',
                            giro: data.giro || ''
                        })
                    }
                } catch (err) {
                    console.error('Error loading empresa:', err)
                }
            }
        }
        loadEmpresa()
    }, [empresaId])

    const steps: { key: WizardStep; label: string; icon: React.ElementType }[] = [
        { key: 'welcome', label: 'Bienvenida', icon: Sparkles },
        { key: 'empresa', label: 'Empresa', icon: Building2 },
        { key: 'sedes', label: 'Sedes', icon: MapPin },
        { key: 'importar', label: 'Trabajadores', icon: Users },
    ]

    const stepIndex = steps.findIndex(s => s.key === currentStep)

    const handleSaveEmpresa = async () => {
        if (!empresa.nombre.trim()) {
            toast.error('El nombre de la empresa es obligatorio')
            return
        }
        setLoading(true)
        try {
            if (empresaId) {
                // Update existing
                await supabase
                    .from('empresas')
                    .update({
                        nombre: empresa.nombre,
                        rfc: empresa.rfc,
                        razon_social: empresa.razon_social,
                        direccion: empresa.direccion,
                        telefono: empresa.telefono,
                        email_contacto: empresa.email_contacto,
                        representante_legal: empresa.representante_legal,
                        giro: empresa.giro
                    })
                    .eq('id', empresaId)
                toast.success('Empresa actualizada')
            } else {
                // Create new
                const { data, error } = await supabase
                    .from('empresas')
                    .insert({
                        nombre: empresa.nombre,
                        rfc: empresa.rfc,
                        razon_social: empresa.razon_social,
                        direccion: empresa.direccion,
                        telefono: empresa.telefono,
                        email_contacto: empresa.email_contacto,
                        representante_legal: empresa.representante_legal,
                        giro: empresa.giro
                    })
                    .select()
                    .single()

                if (error) throw error
                setEmpresaId(data.id)
                toast.success('Empresa creada exitosamente')
            }
            setCurrentStep('sedes')
        } catch (err: any) {
            toast.error(err.message || 'Error al guardar empresa')
        } finally {
            setLoading(false)
        }
    }

    const handleSaveSedes = async () => {
        const validSedes = sedes.filter(s => s.nombre.trim())
        if (validSedes.length === 0) {
            toast.error('Agrega al menos una sede')
            return
        }
        if (!empresaId) {
            toast.error('Primero configura la empresa')
            return
        }

        setLoading(true)
        try {
            const ids: string[] = []
            for (const sede of validSedes) {
                const { data, error } = await supabase
                    .from('sedes')
                    .insert({
                        empresa_id: empresaId,
                        nombre: sede.nombre,
                        direccion: sede.direccion,
                        ciudad: sede.ciudad,
                        estado: sede.estado
                    })
                    .select()
                    .single()

                if (error) throw error
                ids.push(data.id)
            }
            setSavedSedeIds(ids)
            toast.success(`${validSedes.length} sede(s) creada(s)`)
            setCurrentStep('importar')
        } catch (err: any) {
            toast.error(err.message || 'Error al guardar sedes')
        } finally {
            setLoading(false)
        }
    }

    const handleComplete = () => {
        toast.success('🎉 ¡Configuración completada!')
        navigate('/medicina/expediente')
    }

    const handlePatientSubmit = async (patientData: any) => {
        try {
            await dataService.pacientes.create({
                ...patientData,
                empresa_id: empresaId
            })
            setImportedCount(prev => prev + 1)
            toast.success('Trabajador registrado')
        } catch (err: any) {
            toast.error(err.message || 'Error al registrar trabajador')
        }
    }

    const addSede = () => {
        setSedes(prev => [...prev, { nombre: '', direccion: '', ciudad: '', estado: '' }])
    }

    const removeSede = (index: number) => {
        if (sedes.length <= 1) return
        setSedes(prev => prev.filter((_, i) => i !== index))
    }

    const updateSede = (index: number, field: keyof SedeForm, value: string) => {
        setSedes(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 flex flex-col">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-slate-800">Configuración Inicial</h1>
                            <p className="text-xs text-slate-500">GPMedical ERP</p>
                        </div>
                    </div>
                    {/* Step indicators */}
                    <div className="flex items-center gap-2">
                        {steps.map((step, i) => (
                            <React.Fragment key={step.key}>
                                <div className={`
                                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all
                                    ${i <= stepIndex
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-slate-100 text-slate-400'
                                    }
                                `}>
                                    {i < stepIndex ? (
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                    ) : (
                                        <step.icon className="h-3.5 w-3.5" />
                                    )}
                                    <span className="hidden md:inline">{step.label}</span>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className={`w-6 h-0.5 rounded-full ${i < stepIndex ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-2xl">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* STEP: Welcome */}
                            {currentStep === 'welcome' && (
                                <div className="text-center space-y-8">
                                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
                                        <Sparkles className="w-12 h-12 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-800 mb-3">¡Bienvenido a GPMedical!</h2>
                                        <p className="text-lg text-slate-500 max-w-md mx-auto">
                                            Vamos a configurar tu cuenta en pocos minutos. Solo necesitamos la información básica de tu empresa, sedes y trabajadores.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                                        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                            <Building2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                                            <p className="text-xs font-bold text-slate-600">Empresa</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                            <MapPin className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                                            <p className="text-xs font-bold text-slate-600">Sedes</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                            <Users className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                                            <p className="text-xs font-bold text-slate-600">Trabajadores</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => setCurrentStep('empresa')}
                                        className="btn-premium-primary px-12 py-4 text-lg rounded-2xl h-auto"
                                    >
                                        Comenzar configuración
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            )}

                            {/* STEP: Empresa */}
                            {currentStep === 'empresa' && (
                                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                            <Building2 className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800">Datos de la Empresa</h2>
                                            <p className="text-sm text-slate-500">Información básica del centro de trabajo</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2 col-span-2">
                                                <Label>Nombre de la Empresa *</Label>
                                                <Input
                                                    value={empresa.nombre}
                                                    onChange={e => setEmpresa(p => ({ ...p, nombre: e.target.value }))}
                                                    placeholder="Ej: Industrias Acme S.A. de C.V."
                                                    className="h-12 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>RFC</Label>
                                                <Input
                                                    value={empresa.rfc}
                                                    onChange={e => setEmpresa(p => ({ ...p, rfc: e.target.value.toUpperCase() }))}
                                                    placeholder="AAA000000XX0"
                                                    maxLength={13}
                                                    className="rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Giro / Sector</Label>
                                                <Input
                                                    value={empresa.giro}
                                                    onChange={e => setEmpresa(p => ({ ...p, giro: e.target.value }))}
                                                    placeholder="Ej: Manufactura"
                                                    className="rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2 col-span-2">
                                                <Label>Razón Social</Label>
                                                <Input
                                                    value={empresa.razon_social}
                                                    onChange={e => setEmpresa(p => ({ ...p, razon_social: e.target.value }))}
                                                    placeholder="Razón social completa"
                                                    className="rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2 col-span-2">
                                                <Label>Dirección</Label>
                                                <Input
                                                    value={empresa.direccion}
                                                    onChange={e => setEmpresa(p => ({ ...p, direccion: e.target.value }))}
                                                    placeholder="Dirección del corporativo"
                                                    className="rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Teléfono</Label>
                                                <Input
                                                    value={empresa.telefono}
                                                    onChange={e => setEmpresa(p => ({ ...p, telefono: e.target.value }))}
                                                    placeholder="(33) 1234-5678"
                                                    className="rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Email de Contacto</Label>
                                                <Input
                                                    type="email"
                                                    value={empresa.email_contacto}
                                                    onChange={e => setEmpresa(p => ({ ...p, email_contacto: e.target.value }))}
                                                    placeholder="contacto@empresa.com"
                                                    className="rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2 col-span-2">
                                                <Label>Representante Legal</Label>
                                                <Input
                                                    value={empresa.representante_legal}
                                                    onChange={e => setEmpresa(p => ({ ...p, representante_legal: e.target.value }))}
                                                    placeholder="Nombre completo"
                                                    className="rounded-xl"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-8">
                                        <Button variant="outline" onClick={() => setCurrentStep('welcome')} className="rounded-xl">
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Atrás
                                        </Button>
                                        <Button
                                            onClick={handleSaveEmpresa}
                                            disabled={loading || !empresa.nombre.trim()}
                                            className="flex-1 btn-premium-primary rounded-xl h-12"
                                        >
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                            Guardar y continuar
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* STEP: Sedes */}
                            {currentStep === 'sedes' && (
                                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                            <MapPin className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800">Sedes / Sucursales</h2>
                                            <p className="text-sm text-slate-500">Agrega al menos una sede o planta de trabajo</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {sedes.map((sede, index) => (
                                            <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-bold text-slate-600">Sede {index + 1}</span>
                                                    {sedes.length > 1 && (
                                                        <button
                                                            onClick={() => removeSede(index)}
                                                            className="text-rose-400 hover:text-rose-600 transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1 col-span-2">
                                                        <Label className="text-xs">Nombre de la Sede *</Label>
                                                        <Input
                                                            value={sede.nombre}
                                                            onChange={e => updateSede(index, 'nombre', e.target.value)}
                                                            placeholder="Ej: Planta Norte"
                                                            className="rounded-xl"
                                                        />
                                                    </div>
                                                    <div className="space-y-1 col-span-2">
                                                        <Label className="text-xs">Dirección</Label>
                                                        <Input
                                                            value={sede.direccion}
                                                            onChange={e => updateSede(index, 'direccion', e.target.value)}
                                                            placeholder="Dirección completa"
                                                            className="rounded-xl"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Ciudad</Label>
                                                        <Input
                                                            value={sede.ciudad}
                                                            onChange={e => updateSede(index, 'ciudad', e.target.value)}
                                                            placeholder="Ciudad"
                                                            className="rounded-xl"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Estado</Label>
                                                        <Input
                                                            value={sede.estado}
                                                            onChange={e => updateSede(index, 'estado', e.target.value)}
                                                            placeholder="Estado"
                                                            className="rounded-xl"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            onClick={addSede}
                                            className="w-full p-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-emerald-500 hover:border-emerald-300 transition-all flex items-center justify-center gap-2 text-sm font-bold"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Agregar otra sede
                                        </button>
                                    </div>

                                    <div className="flex gap-3 mt-8">
                                        <Button variant="outline" onClick={() => setCurrentStep('empresa')} className="rounded-xl">
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Atrás
                                        </Button>
                                        <Button
                                            onClick={handleSaveSedes}
                                            disabled={loading || !sedes.some(s => s.nombre.trim())}
                                            className="flex-1 btn-premium-primary rounded-xl h-12"
                                        >
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                            Guardar sedes y continuar
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* STEP: Importar Trabajadores */}
                            {currentStep === 'importar' && (
                                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                            <Users className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800">Importar Trabajadores</h2>
                                            <p className="text-sm text-slate-500">
                                                {importedCount > 0
                                                    ? `${importedCount} trabajadores registrados`
                                                    : 'Elige cómo quieres registrar a tus trabajadores'
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {importMode === 'none' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            <button
                                                onClick={() => setImportMode('bulk')}
                                                className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left group"
                                            >
                                                <Upload className="h-8 w-8 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
                                                <h3 className="font-bold text-slate-800 mb-1">Carga Masiva</h3>
                                                <p className="text-sm text-slate-500">Sube un archivo CSV o Excel con todos los trabajadores</p>
                                            </button>
                                            <button
                                                onClick={() => { setImportMode('individual'); setShowNewPatientDialog(true) }}
                                                className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left group"
                                            >
                                                <UserPlus className="h-8 w-8 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
                                                <h3 className="font-bold text-slate-800 mb-1">Uno por Uno</h3>
                                                <p className="text-sm text-slate-500">Registra trabajadores individualmente con el formulario completo</p>
                                            </button>
                                        </div>
                                    )}

                                    {importMode === 'bulk' && empresaId && (
                                        <BulkImportWorkers
                                            empresaId={empresaId}
                                            sedeId={savedSedeIds[0]}
                                            onComplete={(count) => {
                                                setImportedCount(prev => prev + count)
                                                setImportMode('none')
                                            }}
                                            onCancel={() => setImportMode('none')}
                                        />
                                    )}

                                    {importMode === 'individual' && (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-emerald-800">Registrados: {importedCount}</p>
                                                    <p className="text-xs text-emerald-600">Puedes seguir agregando o finalizar</p>
                                                </div>
                                                <Button
                                                    onClick={() => setShowNewPatientDialog(true)}
                                                    className="btn-premium-primary rounded-xl"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Agregar otro
                                                </Button>
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={() => setImportMode('none')}
                                                className="w-full rounded-xl"
                                            >
                                                Cambiar método de importación
                                            </Button>
                                        </div>
                                    )}

                                    <div className="flex gap-3 mt-8">
                                        <Button variant="outline" onClick={() => setCurrentStep('sedes')} className="rounded-xl">
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Atrás
                                        </Button>
                                        <Button
                                            onClick={handleComplete}
                                            className="flex-1 btn-premium-primary rounded-xl h-12"
                                        >
                                            {importedCount > 0 ? (
                                                <>
                                                    <CheckCircle2 className="h-5 w-5 mr-2" />
                                                    Finalizar configuración
                                                </>
                                            ) : (
                                                'Omitir y finalizar después'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* NewPatientDialog for individual import */}
            <NewPatientDialog
                open={showNewPatientDialog}
                onOpenChange={setShowNewPatientDialog}
                onSubmit={handlePatientSubmit}
                empresas={empresaId ? [{ id: empresaId, nombre: empresa.nombre }] : []}
            />
        </div>
    )
}
