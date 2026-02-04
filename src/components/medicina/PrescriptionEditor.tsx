import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Plus,
    Trash2,
    Printer,
    Save,
    ArrowLeft,
    Sparkles,
    Mic,
    StopCircle,
    ChevronRight,
    Pill,
    Clock,
    Calendar as CalendarIcon,
    FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PrescriptionEditorProps {
    patient: any
    onCancel: () => void
    onSave: () => void
}

// Datos simulados para la selección en cascada
const MED_CATEGORIES = {
    'Analgesicos': ['Paracetamol', 'Ibuprofeno', 'Ketorolaco'],
    'Antibioticos': ['Amoxicilina', 'Azitromicina', 'Ciprofloxacino'],
    'Gastroenterologia': ['Omeprazol', 'Pantoprazol', 'Ranitidina'],
    'Respiratorio': ['Loratadina', 'Salbutamol', 'Montelukast']
}

const DOSAGES = ['500 mg', '400 mg', '10 mg', '20 mg', '1 g']
const FREQUENCIES = ['Cada 8 horas', 'Cada 12 horas', 'Cada 24 horas', 'En ayunas', 'PRN (Por razón necesaria)']
const DURATIONS = ['3 días', '5 días', '7 días', '14 días', '30 días']

export function PrescriptionEditor({ patient, onCancel, onSave }: PrescriptionEditorProps) {
    const [medications, setMedications] = useState<any[]>([])
    const [isListening, setIsListening] = useState(false)
    const [diagnosis, setDiagnosis] = useState('')

    // Structured Input State
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedDrug, setSelectedDrug] = useState('')
    const [selectedDosage, setSelectedDosage] = useState('')
    const [selectedFreq, setSelectedFreq] = useState('')
    const [selectedDuration, setSelectedDuration] = useState('')

    const handleAddMedication = () => {
        if (selectedDrug && selectedDosage && selectedFreq && selectedDuration) {
            setMedications([...medications, {
                id: Date.now(),
                name: selectedDrug,
                dosage: selectedDosage,
                frequency: selectedFreq,
                duration: selectedDuration,
                category: selectedCategory
            }])
            // Reset fields
            setSelectedDrug('')
            setSelectedDosage('')
            setSelectedFreq('')
            setSelectedDuration('')
        }
    }

    const toggleVoice = () => {
        setIsListening(!isListening)
        if (!isListening) {
            // Simulación de dictado
            setTimeout(() => {
                setDiagnosis(prev => prev + (prev ? ' ' : '') + "Paciente presenta cuadro agudo de...")
            }, 1500)
        }
    }

    const enhanceWithAI = () => {
        // Simulación de mejora por IA
        setDiagnosis("Diagnóstico: Rinofaringitis Aguda (J00). Se sugiere reposo relativo y tratamiento sintomático.")
    }

    return (
        <div className="h-full flex flex-col glass-panel rounded-3xl overflow-hidden">

            {/* Professional Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={onCancel} className="hover:bg-gray-100/50 rounded-full">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Button>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-primary" />
                            Receta Médica Profesional
                        </h2>
                        <div className="flex items-center text-xs text-gray-500 space-x-2">
                            <Badge variant="outline" className="text-[10px] h-5 border-primary/20 text-primary bg-primary/5">
                                Medicina del Trabajo
                            </Badge>
                            <span>•</span>
                            <span>{patient.nombre} {patient.apellido_paterno}</span>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" className="text-gray-600 border-gray-200 hover:bg-gray-50/50">
                        <Save className="w-4 h-4 mr-2" />
                        Guardar
                    </Button>
                    <Button onClick={onSave} className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20">
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimir (Carta)
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden bg-transparent">

                {/* Left Panel: Clinical Input */}
                {/* Left Panel: Clinical Input */}
                <div className="w-[45%] p-6 overflow-y-auto border-r border-gray-200/50 bg-white/30 backdrop-blur-sm flex flex-col gap-8">

                    {/* Diagnosis & Dictation */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Diagnóstico e Indicaciones</label>
                            <div className="flex space-x-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={enhanceWithAI}
                                    className="h-7 text-secondary hover:bg-secondary/10 hover:text-secondary"
                                >
                                    <Sparkles className="w-3 h-3 mr-1.5" />
                                    Mejorar con IA
                                </Button>
                                <Button
                                    size="sm"
                                    variant={isListening ? "destructive" : "outline"}
                                    onClick={toggleVoice}
                                    className={cn("h-7 transition-all", isListening && "animate-pulse")}
                                >
                                    {isListening ? <StopCircle className="w-3 h-3 mr-1.5" /> : <Mic className="w-3 h-3 mr-1.5" />}
                                    {isListening ? "Grabando..." : "Dictar"}
                                </Button>
                            </div>
                        </div>
                        <div className="relative">
                            <textarea
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                                placeholder="Escriba o dicte el diagnóstico..."
                                className="w-full min-h-[100px] p-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Structured Medication Input */}
                    <div className="space-y-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center space-x-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Pill className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900">Agregar Medicamento</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold text-gray-500 uppercase">Categoría</label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="bg-white border-gray-200 h-9 text-sm">
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(MED_CATEGORIES).map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold text-gray-500 uppercase">Medicamento</label>
                                <Select value={selectedDrug} onValueChange={setSelectedDrug} disabled={!selectedCategory}>
                                    <SelectTrigger className="bg-white border-gray-200 h-9 text-sm">
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedCategory && (MED_CATEGORIES as any)[selectedCategory].map((drug: string) => (
                                            <SelectItem key={drug} value={drug}>{drug}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold text-gray-500 uppercase">Dosis</label>
                                <Select value={selectedDosage} onValueChange={setSelectedDosage}>
                                    <SelectTrigger className="bg-white border-gray-200 h-9 text-sm">
                                        <SelectValue placeholder="Ej. 500mg" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DOSAGES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold text-gray-500 uppercase">Frecuencia</label>
                                <Select value={selectedFreq} onValueChange={setSelectedFreq}>
                                    <SelectTrigger className="bg-white border-gray-200 h-9 text-sm">
                                        <SelectValue placeholder="Ej. Cada 8h" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FREQUENCIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5 col-span-2">
                                <label className="text-[10px] font-semibold text-gray-500 uppercase">Duración</label>
                                <div className="flex gap-2">
                                    <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                                        <SelectTrigger className="bg-white border-gray-200 h-9 text-sm flex-1">
                                            <SelectValue placeholder="Ej. 5 días" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DURATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        onClick={handleAddMedication}
                                        disabled={!selectedDrug || !selectedDuration}
                                        className="bg-primary text-white hover:bg-primary/90 h-9 px-6"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Agregar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active List */}
                    <div className="flex-1 overflow-y-auto">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Medicamentos en Receta</h4>
                        <div className="space-y-2">
                            <AnimatePresence>
                                {medications.map((med) => (
                                    <motion.div
                                        key={med.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-primary/30 transition-colors"
                                    >
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{med.name} <span className="text-gray-500 font-normal">{med.dosage}</span></p>
                                            <p className="text-xs text-gray-500 mt-0.5">{med.frequency} • {med.duration}</p>
                                        </div>
                                        <button
                                            onClick={() => setMedications(medications.filter(m => m.id !== med.id))}
                                            className="text-gray-400 hover:text-red-500 p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {medications.length === 0 && (
                                <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-xl">
                                    No hay medicamentos agregados
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Letter Size Preview */}
                <div className="w-[55%] bg-transparent p-8 flex items-start justify-center overflow-y-auto">
                    {/* Letter Size Container (8.5in x 11in approx ratio) */}
                    <div className="bg-white shadow-2xl shadow-gray-300/50 w-full max-w-[500px] aspect-[8.5/11] p-12 relative flex flex-col text-gray-900">

                        {/* Header */}
                        <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-8">
                            <div>
                                <h1 className="text-2xl font-serif font-bold tracking-tight">Dr. Carlos Ramírez</h1>
                                <p className="text-sm font-serif text-gray-600 font-medium mt-1">Medicina del Trabajo • Céd. Prof. 12345678</p>
                                <p className="text-xs text-gray-500 mt-1">Certificado por el Consejo Mexicano de Medicina del Trabajo</p>
                            </div>
                            <div className="text-right">
                                <div className="w-16 h-16 bg-gray-900 text-white flex items-center justify-center font-serif text-2xl font-bold rounded-sm">
                                    CR
                                </div>
                            </div>
                        </div>

                        {/* Patient Data */}
                        <div className="grid grid-cols-2 gap-y-2 text-sm font-serif mb-8 pb-6 border-b border-gray-100">
                            <div className="col-span-2">
                                <span className="font-bold text-gray-900">Paciente:</span> {patient.nombre} {patient.apellido_paterno} {patient.apellido_materno}
                            </div>
                            <div>
                                <span className="font-bold text-gray-900">Edad:</span> {new Date().getFullYear() - new Date(patient.fecha_nacimiento).getFullYear()} años
                            </div>
                            <div>
                                <span className="font-bold text-gray-900">Fecha:</span> {new Date().toLocaleDateString()}
                            </div>
                            <div className="col-span-2">
                                <span className="font-bold text-gray-900">Puesto:</span> {patient.puesto_trabajo?.nombre || 'No especificado'}
                            </div>
                            {diagnosis && (
                                <div className="col-span-2 mt-2 pt-2 border-t border-gray-100">
                                    <span className="font-bold text-gray-900">Dx:</span> {diagnosis}
                                </div>
                            )}
                        </div>

                        {/* Body */}
                        <div className="flex-1 space-y-6 font-serif">
                            {medications.length === 0 ? (
                                <div className="h-full flex items-center justify-center opacity-10">
                                    <FileText className="w-32 h-32" />
                                </div>
                            ) : (
                                medications.map((med, idx) => (
                                    <div key={med.id} className="flex items-start space-x-4">
                                        <span className="font-bold text-lg text-gray-300 w-6">{idx + 1}.</span>
                                        <div>
                                            <p className="font-bold text-lg text-gray-900">{med.name} {med.dosage}</p>
                                            <p className="text-gray-700 mt-1">{med.frequency}</p>
                                            <p className="text-sm text-gray-500 italic">Durante: {med.duration}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="mt-auto pt-8 border-t border-gray-300 flex justify-between items-end">
                            <div className="text-[10px] text-gray-400 max-w-[200px]">
                                <p>Av. Reforma 222, Piso 15, CDMX</p>
                                <p>Tel: 55 1234 5678 • Urgencias: 55 9999 8888</p>
                                <p className="mt-1">Este documento es una receta médica oficial.</p>
                            </div>
                            <div className="text-center">
                                <div className="h-16 w-32 flex items-end justify-center mb-2">
                                    {/* Espacio para firma */}
                                    <p className="font-dancing-script text-2xl text-blue-900 transform -rotate-3 opacity-80">Carlos Ramírez</p>
                                </div>
                                <div className="w-40 border-t border-gray-900"></div>
                                <p className="text-xs font-bold text-gray-900 mt-1 uppercase tracking-widest">Firma del Médico</p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}
