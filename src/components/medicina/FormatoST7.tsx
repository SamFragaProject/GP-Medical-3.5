import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    AlertTriangle,
    Calendar,
    MapPin,
    User,
    Briefcase,
    FileText,
    Clock,
    Save,
    Printer,
    ChevronRight,
    Shield,
    Building2,
    Activity,
    Pen
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SignaturePad, SignatureDisplay, SignatureModal } from '@/components/ui/SignaturePad'
import { pdfGeneratorService } from '@/services/pdfGeneratorService'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface FormatoST7Props {
    paciente: any
    empresa: any
    encuentroId?: string
    onSave?: (data: any) => void
    onGeneratePDF?: () => void
}

const tiposRiesgo = [
    { id: 'accidente_trabajo', label: 'Accidente de Trabajo', icon: '🏭' },
    { id: 'accidente_trayecto', label: 'Accidente en Trayecto', icon: '🚗' },
    { id: 'enfermedad_trabajo', label: 'Enfermedad de Trabajo', icon: '🦠' },
]

const lugaresAccidente = [
    { id: 'centro_trabajo', label: 'Centro de Trabajo' },
    { id: 'trayecto_ida', label: 'Trayecto Casa → Trabajo' },
    { id: 'trayecto_regreso', label: 'Trayecto Trabajo → Casa' },
    { id: 'comision', label: 'En Comisión de Servicio' },
    { id: 'otro', label: 'Otro Lugar' },
]

const regionesAnatomicas = [
    'Cabeza', 'Cuello', 'Tórax', 'Abdomen', 'Espalda/Columna',
    'Hombro', 'Brazo', 'Codo', 'Antebrazo', 'Muñeca', 'Mano', 'Dedos (mano)',
    'Cadera', 'Muslo', 'Rodilla', 'Pierna', 'Tobillo', 'Pie', 'Dedos (pie)',
    'Múltiples Regiones', 'Lesiones Sistémicas'
]

const tiposLesion = [
    'Fractura', 'Luxación', 'Esguince', 'Contusión', 'Herida cortante',
    'Herida punzante', 'Quemadura', 'Amputación', 'Aplastamiento',
    'Intoxicación', 'Asfixia', 'Electrocución', 'Trauma craneoencefálico',
    'Lumbalgia traumática', 'Otro'
]

export function FormatoST7({ paciente, empresa, encuentroId, onSave, onGeneratePDF }: FormatoST7Props) {
    const { user } = useAuth()
    const [saving, setSaving] = useState(false)
    const [step, setStep] = useState(1)
    const [signatureModalOpen, setSignatureModalOpen] = useState<'trabajador' | 'patron' | 'medico' | null>(null)
    const [firmas, setFirmas] = useState<{
        trabajador?: string
        patron?: string
        medico?: string
    }>({})

    const [formData, setFormData] = useState({
        // Tipo de riesgo
        tipo_riesgo: 'accidente_trabajo',

        // Fechas
        fecha_ocurrencia: new Date().toISOString().split('T')[0],
        hora_accidente: new Date().toTimeString().slice(0, 5),
        fecha_atencion: new Date().toISOString().split('T')[0],

        // Lugar
        lugar_accidente: 'centro_trabajo',
        direccion_accidente: '',

        // Descripción
        descripcion_accidente: '',
        causa_externa: '',

        // Lesiones
        region_anatomica: '',
        tipo_lesion: '',
        diagnostico_inicial: '',
        diagnostico_cie10: '',

        // Testigo
        testigo_nombre: '',
        testigo_puesto: '',

        // Datos laborales
        jornada_trabajo: 'diurna',
        salario_diario: paciente?.salario_diario || '',
        antiguedad_empresa: '',

        // Observaciones
        observaciones_medicas: ''
    })

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSave = async () => {
        if (!formData.descripcion_accidente || !formData.diagnostico_inicial) {
            toast.error('Por favor complete la descripción del accidente y el diagnóstico')
            return
        }

        setSaving(true)
        try {
            // Aquí iría la llamada al servicio para guardar
            const payload = {
                ...formData,
                paciente_id: paciente.id,
                empresa_id: empresa?.id || user?.empresa_id,
                encuentro_id: encuentroId,
                medico_id: user?.id
            }

            if (onSave) {
                await onSave(payload)
            }

            toast.success('Formato ST-7 guardado correctamente')
        } catch (error) {
            toast.error('Error al guardar el formato')
        } finally {
            setSaving(false)
        }
    }

    const handleGeneratePDF = () => {
        const html = pdfGeneratorService.generateST7({
            folio: `ST7-${new Date().getFullYear()}-PREVIEW`,
            paciente,
            empresa,
            riesgo: formData,
            medico: user,
            firmas
        })
        pdfGeneratorService.printDocument(html, `ST7_${paciente?.nombre || 'documento'}.pdf`)
    }

    const handleSaveSignature = (dataUrl: string) => {
        if (signatureModalOpen) {
            setFirmas(prev => ({ ...prev, [signatureModalOpen]: dataUrl }))
            setSignatureModalOpen(null)
            toast.success('Firma capturada')
        }
    }

    const renderStep1 = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
        >
            {/* Tipo de Riesgo */}
            <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Tipo de Riesgo de Trabajo
                </Label>
                <div className="grid grid-cols-3 gap-4">
                    {tiposRiesgo.map(tipo => (
                        <motion.button
                            key={tipo.id}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleChange('tipo_riesgo', tipo.id)}
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.tipo_riesgo === tipo.id
                                ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-500/10'
                                : 'border-slate-100 bg-white hover:border-slate-200'
                                }`}
                        >
                            <span className="text-3xl">{tipo.icon}</span>
                            <span className={`text-sm font-bold text-center ${formData.tipo_riesgo === tipo.id ? 'text-amber-700' : 'text-slate-600'
                                }`}>
                                {tipo.label}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Fecha del Accidente *</Label>
                    <Input
                        type="date"
                        value={formData.fecha_ocurrencia}
                        onChange={(e) => handleChange('fecha_ocurrencia', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Hora del Accidente</Label>
                    <Input
                        type="time"
                        value={formData.hora_accidente}
                        onChange={(e) => handleChange('hora_accidente', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Jornada Laboral</Label>
                    <Select value={formData.jornada_trabajo} onValueChange={(v) => handleChange('jornada_trabajo', v)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="diurna">Diurna (6:00 - 20:00)</SelectItem>
                            <SelectItem value="nocturna">Nocturna (20:00 - 6:00)</SelectItem>
                            <SelectItem value="mixta">Mixta</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Lugar del Accidente */}
            <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Lugar del Accidente
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {lugaresAccidente.map(lugar => (
                        <button
                            key={lugar.id}
                            type="button"
                            onClick={() => handleChange('lugar_accidente', lugar.id)}
                            className={`p-3 rounded-xl border text-sm font-medium transition-all ${formData.lugar_accidente === lugar.id
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                                }`}
                        >
                            {lugar.label}
                        </button>
                    ))}
                </div>
                {formData.lugar_accidente === 'otro' && (
                    <Input
                        placeholder="Especifique el lugar del accidente..."
                        value={formData.direccion_accidente}
                        onChange={(e) => handleChange('direccion_accidente', e.target.value)}
                        className="mt-2"
                    />
                )}
            </div>
        </motion.div>
    )

    const renderStep2 = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
        >
            {/* Descripción del Accidente */}
            <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Descripción Detallada del Accidente *
                </Label>
                <Textarea
                    value={formData.descripcion_accidente}
                    onChange={(e) => handleChange('descripcion_accidente', e.target.value)}
                    placeholder="Describa cómo ocurrió el accidente, qué estaba haciendo el trabajador, qué lo causó, qué pasó después..."
                    className="min-h-[150px]"
                />
                <p className="text-xs text-slate-400">
                    Sea lo más detallado posible. Esta descripción es fundamental para el dictamen del IMSS.
                </p>
            </div>

            {/* Lesiones */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Región Anatómica Afectada *</Label>
                    <Select value={formData.region_anatomica} onValueChange={(v) => handleChange('region_anatomica', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione..." />
                        </SelectTrigger>
                        <SelectContent>
                            {regionesAnatomicas.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Tipo de Lesión *</Label>
                    <Select value={formData.tipo_lesion} onValueChange={(v) => handleChange('tipo_lesion', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione..." />
                        </SelectTrigger>
                        <SelectContent>
                            {tiposLesion.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Diagnóstico */}
            <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Diagnóstico Médico Inicial *
                </Label>
                <Textarea
                    value={formData.diagnostico_inicial}
                    onChange={(e) => handleChange('diagnostico_inicial', e.target.value)}
                    placeholder="Diagnóstico médico completo según hallazgos clínicos y estudios..."
                    className="min-h-[100px]"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Código CIE-10</Label>
                    <Input
                        value={formData.diagnostico_cie10}
                        onChange={(e) => handleChange('diagnostico_cie10', e.target.value)}
                        placeholder="Ej: S52.5"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Causa Externa (CIE-10)</Label>
                    <Input
                        value={formData.causa_externa}
                        onChange={(e) => handleChange('causa_externa', e.target.value)}
                        placeholder="Ej: W01.0 (Caída)"
                    />
                </div>
            </div>
        </motion.div>
    )

    const renderStep3 = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
        >
            {/* Testigos */}
            <div className="p-4 bg-slate-50 rounded-2xl space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <User size={14} /> Datos del Testigo (Opcional)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Nombre del Testigo</Label>
                        <Input
                            value={formData.testigo_nombre}
                            onChange={(e) => handleChange('testigo_nombre', e.target.value)}
                            placeholder="Nombre completo"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Puesto del Testigo</Label>
                        <Input
                            value={formData.testigo_puesto}
                            onChange={(e) => handleChange('testigo_puesto', e.target.value)}
                            placeholder="Puesto o cargo"
                        />
                    </div>
                </div>
            </div>

            {/* Datos Laborales */}
            <div className="p-4 bg-blue-50 rounded-2xl space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                    <Briefcase size={14} /> Datos Laborales para IMSS
                </h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Salario Diario Integrado ($)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={formData.salario_diario}
                            onChange={(e) => handleChange('salario_diario', e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Antigüedad en la Empresa</Label>
                        <Input
                            value={formData.antiguedad_empresa}
                            onChange={(e) => handleChange('antiguedad_empresa', e.target.value)}
                            placeholder="Ej: 2 años 3 meses"
                        />
                    </div>
                </div>
            </div>

            {/* Observaciones Médicas */}
            <div className="space-y-2">
                <Label>Observaciones Médicas Adicionales</Label>
                <Textarea
                    value={formData.observaciones_medicas}
                    onChange={(e) => handleChange('observaciones_medicas', e.target.value)}
                    placeholder="Observaciones adicionales, antecedentes relevantes, hallazgos complementarios..."
                    className="min-h-[80px]"
                />
            </div>

            {/* Resumen */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <h4 className="text-xs font-black uppercase tracking-widest text-amber-700 mb-3">Resumen del Formato ST-7</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-amber-600 text-xs">Tipo de Riesgo</p>
                        <p className="font-bold text-amber-900">{tiposRiesgo.find(t => t.id === formData.tipo_riesgo)?.label}</p>
                    </div>
                    <div>
                        <p className="text-amber-600 text-xs">Fecha del Accidente</p>
                        <p className="font-bold text-amber-900">{formData.fecha_ocurrencia} {formData.hora_accidente}</p>
                    </div>
                    <div>
                        <p className="text-amber-600 text-xs">Región Afectada</p>
                        <p className="font-bold text-amber-900">{formData.region_anatomica || 'No especificada'}</p>
                    </div>
                    <div>
                        <p className="text-amber-600 text-xs">Tipo de Lesión</p>
                        <p className="font-bold text-amber-900">{formData.tipo_lesion || 'No especificada'}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    )

    return (
        <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden">
            {/* Header */}
            <CardHeader className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black">Formato ST-7</CardTitle>
                            <p className="text-amber-100 text-sm font-medium">Aviso de Atención Médica y Calificación de Probable Riesgo de Trabajo</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <Badge className="bg-white/20 text-white border-none">IMSS</Badge>
                        <p className="text-xs text-amber-100 mt-1">Art. 51-54 LSS</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                {/* Info del Paciente */}
                <div className="mb-6 p-4 bg-slate-50 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center text-slate-600 font-bold text-lg">
                        {paciente?.nombre?.[0]}{paciente?.apellido_paterno?.[0]}
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-slate-900">{paciente?.nombre} {paciente?.apellido_paterno} {paciente?.apellido_materno}</p>
                        <div className="flex gap-4 text-xs text-slate-500">
                            <span>NSS: {paciente?.nss || 'Sin NSS'}</span>
                            <span>CURP: {paciente?.curp || 'Sin CURP'}</span>
                            <span>Puesto: {paciente?.puesto || 'No especificado'}</span>
                        </div>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {[1, 2, 3].map(s => (
                        <React.Fragment key={s}>
                            <button
                                onClick={() => setStep(s)}
                                className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${step === s
                                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                    : step > s
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-slate-100 text-slate-400'
                                    }`}
                            >
                                {s}
                            </button>
                            {s < 3 && (
                                <div className={`w-16 h-1 rounded ${step > s ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Step Content */}
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                    <Button
                        variant="outline"
                        onClick={() => setStep(s => Math.max(1, s - 1))}
                        disabled={step === 1}
                        className="rounded-full"
                    >
                        Anterior
                    </Button>

                    <div className="flex gap-3">
                        {step < 3 ? (
                            <Button
                                onClick={() => setStep(s => Math.min(3, s + 1))}
                                className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-8"
                            >
                                Siguiente <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handleGeneratePDF}
                                    className="rounded-full"
                                >
                                    <Printer className="w-4 h-4 mr-2" /> Vista Previa PDF
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? 'Guardando...' : 'Guardar ST-7'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Sección de Firmas Digitales */}
                {step === 3 && (
                    <div className="mt-6 p-4 bg-slate-50 rounded-2xl">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                            <Pen size={14} /> Firmas Digitales (Opcional)
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                {firmas.trabajador ? (
                                    <SignatureDisplay
                                        signatureUrl={firmas.trabajador}
                                        label="Trabajador"
                                        onRemove={() => setFirmas(prev => ({ ...prev, trabajador: undefined }))}
                                    />
                                ) : (
                                    <Button
                                        variant="outline"
                                        onClick={() => setSignatureModalOpen('trabajador')}
                                        className="w-full h-20 border-dashed"
                                    >
                                        <Pen className="w-4 h-4 mr-2" /> Firma Trabajador
                                    </Button>
                                )}
                            </div>
                            <div className="text-center">
                                {firmas.patron ? (
                                    <SignatureDisplay
                                        signatureUrl={firmas.patron}
                                        label="Patrón"
                                        onRemove={() => setFirmas(prev => ({ ...prev, patron: undefined }))}
                                    />
                                ) : (
                                    <Button
                                        variant="outline"
                                        onClick={() => setSignatureModalOpen('patron')}
                                        className="w-full h-20 border-dashed"
                                    >
                                        <Pen className="w-4 h-4 mr-2" /> Firma Patrón
                                    </Button>
                                )}
                            </div>
                            <div className="text-center">
                                {firmas.medico ? (
                                    <SignatureDisplay
                                        signatureUrl={firmas.medico}
                                        label="Médico"
                                        onRemove={() => setFirmas(prev => ({ ...prev, medico: undefined }))}
                                    />
                                ) : (
                                    <Button
                                        variant="outline"
                                        onClick={() => setSignatureModalOpen('medico')}
                                        className="w-full h-20 border-dashed"
                                    >
                                        <Pen className="w-4 h-4 mr-2" /> Firma Médico
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>

            {/* Modal de Firma */}
            <SignatureModal
                open={signatureModalOpen !== null}
                onClose={() => setSignatureModalOpen(null)}
                onSave={handleSaveSignature}
                title={`Capturar Firma - ${signatureModalOpen === 'trabajador' ? 'Trabajador' : signatureModalOpen === 'patron' ? 'Patrón' : 'Médico'}`}
            />
        </Card>
    )
}
