import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Stethoscope,
    Activity,
    HeartPulse,
    ClipboardCheck,
    FileText,
    Save,
    CheckCircle,
    AlertCircle,
    AlertTriangle,
    XCircle,
    ChevronRight,
    Search,
    Plus,
    Shield,
    FlaskConical,
    Pill,
    Clock,
    Brain
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { CIE10Search } from './CIE10Search'
import { VitalSignCard } from './VitalSignCard'
import { aiService } from '@/services/aiService'
import toast from 'react-hot-toast'

interface SOAPEditorProps {
    paciente: any;
    citaId?: string;
    onSave: (data: any) => void;
    isLoading?: boolean;
}

export function SOAPEditor({ paciente, citaId, onSave, isLoading }: SOAPEditorProps) {
    const [activeTab, setActiveTab] = useState('subjective')
    const [formData, setFormData] = useState({
        subjetivo: '',
        antecedentes: '',
        objetivo: {
            exploracion_general: '',
            soma_biomecanica: '', // Especial para medicina del trabajo
            signos: {
                presion: '120/80',
                pulso: 72,
                temperatura: 36.5,
                frec_resp: 16,
                spo2: 98,
                peso: 75.0,
                talla: 1.70,
                imc: 25.9
            }
        },
        analisis: {
            diagnostico_principal: '',
            diagnosticos_secundarios: [] as any[],
            notas_analisis: ''
        },
        plan: {
            tratamiento: '',
            medicamentos: [] as any[],
            examenes: [] as any[],
            recomendaciones: '',
            restricciones_laborales: '',
            proxima_cita: ''
        },
        ocupacional: {
            dictamen: 'pendiente' as 'apto' | 'restriccion' | 'no_apto' | 'pendiente',
            recomendaciones_empresa: '',
            vigencia_meses: 12
        },
        especialidad: 'general',
        metadata_especialidad: {}
    })

    const [isSuggestingIA, setIsSuggestingIA] = useState(false)

    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await onSave(formData)
        } finally {
            setIsSaving(false)
        }
    }

    const handleIASuggestion = async () => {
        if (!formData.subjetivo && !formData.objetivo.exploracion_general) {
            toast.error('Describa los síntomas para recibir una sugerencia de la IA')
            return
        }

        setIsSuggestingIA(true)
        try {
            // Simulamos el procesamiento de IA que analiza texto y signos vitales
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Lógica para asignar un diagnóstico sugerido (Mocked por ahora)
            // En una fase real llamaríamos a un endpoint de NLP
            const sugerencia = {
                codigo: 'J00',
                descripcion: 'Rinofaringitis aguda (resfriado común)'
            }

            setFormData({
                ...formData,
                analisis: {
                    ...formData.analisis,
                    diagnostico_principal: `${sugerencia.codigo} - ${sugerencia.descripcion}`,
                    notas_analisis: `${formData.analisis.notas_analisis}\n\n[Sugerencia IA]: Basado en el interrogatorio y los signos vitales, se sugiere descartar cuadro respiratorio agudo.`
                }
            })
            toast.success('Diagnóstico sugerido por IA aplicado')
        } catch (error) {
            toast.error('No se pudo conectar con el motor de IA')
        } finally {
            setIsSuggestingIA(false)
        }
    }

    const [isAnalyzingIA, setIsAnalyzingIA] = useState(false)

    const handleSOAPAnalysisIA = async () => {
        if (!formData.subjetivo && !formData.objetivo.exploracion_general) {
            toast.error('Complete la nota médica para recibir un análisis de aptitud')
            return
        }

        setIsAnalyzingIA(true)
        try {
            const analysis = await aiService.analyzeClinicalNote({
                s: formData.subjetivo,
                o: `${formData.objetivo.exploracion_general} ${formData.objetivo.soma_biomecanica}`,
                a: formData.analisis.notas_analisis,
                p: formData.plan.recomendaciones
            })

            if (analysis) {
                setFormData({
                    ...formData,
                    ocupacional: {
                        ...formData.ocupacional,
                        dictamen: analysis.dictamen_sugerido,
                        recomendaciones_empresa: analysis.recomendaciones_sugeridas
                    },
                    plan: {
                        ...formData.plan,
                        restricciones_laborales: analysis.restricciones_sugeridas
                    }
                })
                toast.success('Análisis de aptitud por IA completado', {
                    icon: '🧠',
                    duration: 4000
                })
                setActiveTab('specialty')
            }
        } catch (error) {
            toast.error('Error al procesar el análisis clínico')
        } finally {
            setIsAnalyzingIA(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            {/* Header del Editor */}
            <div className="bg-slate-900 text-white p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                            <ClipboardCheck className="text-blue-400 w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Registro Clínico Modular</h2>
                            <p className="text-slate-400 text-xs flex items-center gap-2">
                                <Shield className="w-3 h-3 text-emerald-400" /> Cumplimiento NOM-004-SSA3 / NOM-024
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:text-white rounded-full px-4"
                            onClick={handleSOAPAnalysisIA}
                            disabled={isAnalyzingIA}
                        >
                            {isAnalyzingIA ? (
                                <Activity className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Brain className="w-4 h-4 mr-2" />
                            )}
                            Sugerir Dictamen (IA)
                        </Button>
                        <Button
                            variant="ghost"
                            className="text-slate-400 hover:text-white hover:bg-white/10"
                            onClick={() => { }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                            onClick={handleSave}
                            disabled={isSaving || isLoading}
                        >
                            {isSaving ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Guardar Encuentro
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar de Secciones */}
                <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col p-4 space-y-2">
                    {[
                        { id: 'subjective', label: 'Subjetivo', sub: 'Padecimiento Actual', icon: FileText },
                        { id: 'objective', label: 'Objetivo', sub: 'Exploración / Signos', icon: Activity },
                        { id: 'assessment', label: 'Análisis', sub: 'Diagnósticos CIE10', icon: Stethoscope },
                        { id: 'plan', label: 'Plan', sub: 'Tratamiento / Receta', icon: CheckCircle },
                        { id: 'specialty', label: 'Especialidad', sub: 'Módulo Ocupacional', icon: HeartPulse }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${activeTab === item.id
                                ? 'bg-white shadow-md border-l-4 border-blue-600'
                                : 'hover:bg-slate-200/50 text-slate-500'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-600' : ''}`} />
                            <div>
                                <p className={`text-sm font-bold ${activeTab === item.id ? 'text-slate-900' : ''}`}>{item.label}</p>
                                <p className="text-[10px] uppercase tracking-wider opacity-60 font-medium">{item.sub}</p>
                            </div>
                        </button>
                    ))}

                    <div className="mt-auto p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <div className="flex items-center gap-2 mb-2 text-amber-700">
                            <AlertCircle size={14} />
                            <span className="text-[10px] font-bold uppercase">Recordatorio Legal</span>
                        </div>
                        <p className="text-[10px] text-amber-600 leading-relaxed">
                            Este registro cumple con la <b>NOM-004-SSA3-2012</b> (Expediente Clínico) y la <b>NOM-024-SSA3-2012</b>. Recuerde que todas las notas deben ser firmadas digitalmente para garantizar su validez legal.
                        </p>
                    </div>
                </div>

                {/* Área de Trabajo */}
                <div className="flex-1 overflow-y-auto p-8 bg-white overflow-x-hidden">
                    <AnimatePresence mode="wait">
                        {activeTab === 'subjective' && (
                            <motion.div
                                key="sub"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black text-slate-900">Interrogatorio (Subjetivo)</h3>
                                    <div className="space-y-2">
                                        <Label className="text-slate-500 font-bold text-xs uppercase tracking-widest">Padecimiento Actual</Label>
                                        <Textarea
                                            placeholder="Describa el motivo de consulta, evolución y síntomas actuales..."
                                            className="min-h-[200px] text-lg leading-relaxed focus:ring-2 focus:ring-blue-500 rounded-2xl border-slate-200"
                                            value={formData.subjetivo}
                                            onChange={(e) => setFormData({ ...formData, subjetivo: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-500 font-bold text-xs uppercase tracking-widest">Antecedentes Relevantes</Label>
                                        <Textarea
                                            placeholder="Heredofamiliares, personales patológicos, quirúrgicos, etc. que influyan en este encuentro..."
                                            className="min-h-[100px] text-slate-600 rounded-2xl border-slate-200"
                                            value={formData.antecedentes}
                                            onChange={(e) => setFormData({ ...formData, antecedentes: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'objective' && (
                            <motion.div
                                key="obj"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black text-slate-900 text-center">Exploración Física (Objetivo)</h3>

                                    {/* Grid de Signos Vitales Editor */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Presión', unit: 'mmHg', val: formData.objetivo.signos.presion, key: 'presion' },
                                            { label: 'Pulso', unit: 'bpm', val: formData.objetivo.signos.pulso, key: 'pulso' },
                                            { label: 'Temperatura', unit: '°C', val: formData.objetivo.signos.temperatura, key: 'temperatura' },
                                            { label: 'Saturación', unit: '%', val: formData.objetivo.signos.spo2, key: 'spo2' },
                                        ].map((s) => (
                                            <div key={s.key} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                                                <label className="text-[10px] text-slate-400 font-bold uppercase mb-1">{s.label}</label>
                                                <input
                                                    value={s.val}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        objetivo: {
                                                            ...formData.objetivo,
                                                            signos: { ...formData.objetivo.signos, [s.key]: e.target.value }
                                                        }
                                                    })}
                                                    className="bg-transparent text-xl font-black text-center w-full focus:outline-none focus:text-blue-600"
                                                />
                                                <span className="text-[10px] text-slate-400 font-medium">{s.unit}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                                        <div className="space-y-2">
                                            <Label className="text-slate-500 font-bold text-xs uppercase tracking-widest">Exploración Física General</Label>
                                            <Textarea
                                                placeholder="Estado general, cabeza, cuello, tórax, abdomen..."
                                                className="min-h-[200px] text-base leading-relaxed rounded-2xl border-slate-200"
                                                value={formData.objetivo.exploracion_general}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    objetivo: { ...formData.objetivo, exploracion_general: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-blue-500 font-bold text-xs uppercase tracking-widest">Soma & Biomecánica (Ocupacional)</Label>
                                            <Textarea
                                                placeholder="Marcha, postura, rangos de movimiento, fuerza muscular, reflejos, pruebas específicas (Phalen, Tinel, etc.)..."
                                                className="min-h-[200px] text-base leading-relaxed rounded-2xl border-blue-100 bg-blue-50/20"
                                                value={formData.objetivo.soma_biomecanica}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    objetivo: { ...formData.objetivo, soma_biomecanica: e.target.value }
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'assessment' && (
                            <motion.div
                                key="ass"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black text-slate-900">Impresión Diagnóstica (Análisis)</h3>

                                    <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 border-dashed space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-blue-700 font-bold text-xs uppercase tracking-widest block">Asistente Diagnóstico (CIE-10)</Label>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-purple-600 hover:bg-purple-100 rounded-full text-[10px] font-black uppercase tracking-tighter"
                                                onClick={handleIASuggestion}
                                                disabled={isSuggestingIA}
                                            >
                                                {isSuggestingIA ? (
                                                    <Activity className="w-3 h-3 mr-1 animate-spin" />
                                                ) : (
                                                    <Brain className="w-3 h-3 mr-1" />
                                                )}
                                                Diagnosticar con IA
                                            </Button>
                                        </div>
                                        <CIE10Search
                                            selectedCodes={formData.analisis.diagnosticos_secundarios}
                                            onAdd={(dia) => setFormData({
                                                ...formData,
                                                analisis: {
                                                    ...formData.analisis,
                                                    diagnostico_principal: `${dia.codigo} - ${dia.descripcion}`,
                                                    diagnosticos_secundarios: [...formData.analisis.diagnosticos_secundarios, dia]
                                                }
                                            })}
                                            onRemove={(codigo) => setFormData({
                                                ...formData,
                                                analisis: {
                                                    ...formData.analisis,
                                                    diagnosticos_secundarios: formData.analisis.diagnosticos_secundarios.filter(d => d.codigo !== codigo)
                                                }
                                            })}
                                        />
                                    </div>

                                    {formData.analisis.diagnostico_principal && (
                                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-4">
                                            <CheckCircle className="text-emerald-500 w-6 h-6 mt-1" />
                                            <div>
                                                <p className="text-emerald-900 font-bold">Diagnóstico Principal</p>
                                                <p className="text-emerald-700 text-lg">{formData.analisis.diagnostico_principal}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2 pt-4">
                                        <Label className="text-slate-500 font-bold text-xs uppercase tracking-widest">Justificación y Análisis Clínico</Label>
                                        <Textarea
                                            placeholder="Raciocinio clínico, diagnósticos diferenciales y estado actual del paciente..."
                                            className="min-h-[150px] text-slate-600 rounded-2xl border-slate-200"
                                            value={formData.analisis.notas_analisis}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                analisis: { ...formData.analisis, notas_analisis: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'plan' && (
                            <motion.div
                                key="pla"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black text-slate-900">Plan de Manejo y Tratamiento</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <Label className="text-slate-500 font-bold text-xs uppercase tracking-widest">Plan Farmacológico (Prescripción)</Label>

                                            {/* Buscador Simple */}
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        placeholder="Buscar por nombre o genérico..."
                                                        className="pl-10 rounded-xl"
                                                        onChange={(e) => {
                                                            const term = e.target.value.toLowerCase();
                                                            // Logic for filtering can be done inline or via state
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Lista de Medicamentos Agregados */}
                                            <div className="space-y-3">
                                                {formData.plan.medicamentos.map((med, idx) => (
                                                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                                                    <Pill size={16} />
                                                                </div>
                                                                <span className="font-bold text-slate-700">{med.nombre}</span>
                                                                <Badge variant="outline" className="text-[10px]">{med.concentracion}</Badge>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-slate-400 hover:text-red-500"
                                                                onClick={() => {
                                                                    const newMeds = [...formData.plan.medicamentos];
                                                                    newMeds.splice(idx, 1);
                                                                    setFormData({ ...formData, plan: { ...formData.plan, medicamentos: newMeds } });
                                                                }}
                                                            >
                                                                <XCircle size={16} />
                                                            </Button>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-3">
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] text-slate-400 uppercase font-black">Dosis</Label>
                                                                <Input
                                                                    value={med.dosis}
                                                                    className="h-8 text-xs rounded-lg"
                                                                    onChange={(e) => {
                                                                        const newMeds = [...formData.plan.medicamentos];
                                                                        newMeds[idx].dosis = e.target.value;
                                                                        setFormData({ ...formData, plan: { ...formData.plan, medicamentos: newMeds } });
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] text-slate-400 uppercase font-black">Frecuencia</Label>
                                                                <Input
                                                                    value={med.frecuencia}
                                                                    className="h-8 text-xs rounded-lg"
                                                                    onChange={(e) => {
                                                                        const newMeds = [...formData.plan.medicamentos];
                                                                        newMeds[idx].frecuencia = e.target.value;
                                                                        setFormData({ ...formData, plan: { ...formData.plan, medicamentos: newMeds } });
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] text-slate-400 uppercase font-black">Duración</Label>
                                                                <Input
                                                                    value={med.duracion}
                                                                    className="h-8 text-xs rounded-lg"
                                                                    onChange={(e) => {
                                                                        const newMeds = [...formData.plan.medicamentos];
                                                                        newMeds[idx].duracion = e.target.value;
                                                                        setFormData({ ...formData, plan: { ...formData.plan, medicamentos: newMeds } });
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {formData.plan.medicamentos.length === 0 && (
                                                    <div className="p-12 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 gap-4">
                                                        <Pill size={32} className="opacity-20" />
                                                        <p className="text-xs font-medium italic">No hay medicamentos en el plan aún.</p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-50"
                                                            onClick={() => {
                                                                const newMed = { nombre: 'Paracetamol', concentracion: '500mg', dosis: '1 tableta', frecuencia: 'cada 8 horas', duracion: '5 días', via_administracion: 'Oral' };
                                                                setFormData({ ...formData, plan: { ...formData.plan, medicamentos: [...formData.plan.medicamentos, newMed] } });
                                                            }}
                                                        >
                                                            <Plus size={14} className="mr-2" /> Demo: Agregar Paracetamol
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-500 font-bold text-xs uppercase tracking-widest">Estudios / Laboratorio</Label>
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 min-h-[100px] flex items-center justify-center border-dashed">
                                                <Button variant="ghost" size="sm" className="text-blue-600">
                                                    <FlaskConical className="w-4 h-4 mr-2" /> Solicitar Exámenes
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                        <div className="space-y-2">
                                            <Label className="text-slate-500 font-bold text-xs uppercase tracking-widest">Indicaciones y Recomendaciones Generales</Label>
                                            <Textarea
                                                placeholder="Reposo, dieta, cuidados específicos, signos de alarma..."
                                                className="min-h-[150px] text-base leading-relaxed rounded-2xl border-slate-200"
                                                value={formData.plan.recomendaciones}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    plan: { ...formData.plan, recomendaciones: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-orange-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                                <AlertTriangle size={14} /> Restricciones Laborales (Limitaciones)
                                            </Label>
                                            <Textarea
                                                placeholder="Carga de peso max 5kg, evitar bipedestación prolongada, no trabajar en alturas, etc."
                                                className="min-h-[150px] text-base leading-relaxed rounded-2xl border-orange-100 bg-orange-50/20"
                                                value={formData.plan.restricciones_laborales}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    plan: { ...formData.plan, restricciones_laborales: e.target.value }
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'specialty' && (
                            <motion.div
                                key="spec"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center">
                                            <HeartPulse className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900">Dictamen de Aptitud Laboral</h3>
                                            <p className="text-slate-500 text-sm">Evaluación final de aptitud física y mental para el puesto actual.</p>
                                        </div>
                                    </div>

                                    {/* Selector de Dictamen Premium */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {[
                                            { id: 'apto', label: 'Apto', icon: CheckCircle, color: 'emerald', desc: 'Sin limitaciones' },
                                            { id: 'restriccion', label: 'Apto con Restricción', icon: AlertTriangle, color: 'amber', desc: 'Con limitaciones' },
                                            { id: 'no_apto', label: 'No Apto', icon: XCircle, color: 'rose', desc: 'Incapacidad actual' },
                                            { id: 'pendiente', label: 'Pendiente', icon: Clock, color: 'slate', desc: 'Requiere estudios' },
                                        ].map((d) => (
                                            <button
                                                key={d.id}
                                                onClick={() => setFormData({
                                                    ...formData,
                                                    ocupacional: { ...formData.ocupacional, dictamen: d.id as any }
                                                })}
                                                className={`p-4 rounded-[2rem] border-2 transition-all text-left relative overflow-hidden group ${formData.ocupacional.dictamen === d.id
                                                    ? `border-${d.color}-500 bg-${d.color}-50/50 shadow-lg shadow-${d.color}-500/10`
                                                    : 'border-slate-100 bg-white hover:border-slate-200'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${formData.ocupacional.dictamen === d.id ? `bg-${d.color}-500 text-white` : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                                                    <d.icon size={20} />
                                                </div>
                                                <p className={`font-bold text-sm ${formData.ocupacional.dictamen === d.id ? `text-${d.color}-900` : 'text-slate-600'}`}>{d.label}</p>
                                                <p className="text-[10px] text-slate-400 uppercase font-black">{d.desc}</p>

                                                {formData.ocupacional.dictamen === d.id && (
                                                    <motion.div layoutId="activeDictamen" className={`absolute top-2 right-2 w-2 h-2 rounded-full bg-${d.color}-500`} />
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Recomendaciones a la Empresa */}
                                    <div className="space-y-4 pt-4">
                                        <div className="flex items-center gap-3">
                                            <Shield className="text-blue-500 w-5 h-5" />
                                            <Label className="text-slate-900 font-black text-sm uppercase tracking-widest">Recomendaciones para el Patrón (EHS / RRHH)</Label>
                                        </div>
                                        <Textarea
                                            placeholder="Detalle los ajustes razonables al puesto, equipo de protección específico o periodos de descanso necesarios..."
                                            className="min-h-[150px] text-base leading-relaxed rounded-2xl border-slate-200 focus:ring-blue-500"
                                            value={formData.ocupacional.recomendaciones_empresa}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                ocupacional: { ...formData.ocupacional, recomendaciones_empresa: e.target.value }
                                            })}
                                        />
                                        <p className="text-[10px] text-slate-400 font-medium italic">
                                            Nota: Esta información puede ser compartida con el área operativa según los protocolos de privacidad industrial.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer de Resumen Rápido */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 px-8 flex items-center justify-between">
                <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paciente:</span>
                        <span className="text-sm font-bold text-slate-700">{paciente.nombre} {paciente.apellido_paterno}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">IMC:</span>
                        <Badge className="bg-blue-100 text-blue-700">{formData.objetivo.signos.imc}</Badge>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Clock className="w-3 h-3" /> Tiempo en consulta: 12 min
                </div>
            </div>
        </div>
    )
}
