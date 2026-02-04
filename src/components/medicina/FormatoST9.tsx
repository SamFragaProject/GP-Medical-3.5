import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    FileCheck,
    Calendar,
    Clock,
    User,
    Activity,
    Save,
    Printer,
    ChevronRight,
    AlertCircle,
    CheckCircle,
    XCircle,
    TrendingUp,
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

interface FormatoST9Props {
    paciente: any
    riesgoTrabajo?: any
    incapacidadPrevia?: any
    onSave?: (data: any) => void
    onGeneratePDF?: () => void
}

const tiposIncapacidad = [
    {
        id: 'temporal',
        label: 'Incapacidad Temporal',
        icon: Clock,
        color: 'bg-blue-500',
        desc: 'El trabajador no puede laborar temporalmente pero se espera recuperación total'
    },
    {
        id: 'parcial_permanente',
        label: 'Incapacidad Parcial Permanente',
        icon: AlertCircle,
        color: 'bg-amber-500',
        desc: 'Disminución de facultades o aptitudes para trabajar'
    },
    {
        id: 'total_permanente',
        label: 'Incapacidad Total Permanente',
        icon: XCircle,
        color: 'bg-red-500',
        desc: 'Pérdida de facultades o aptitudes que imposibilita cualquier trabajo'
    },
]

const pronosticos = [
    { id: 'favorable', label: 'Favorable', color: 'text-emerald-600 bg-emerald-50' },
    { id: 'reservado', label: 'Reservado', color: 'text-amber-600 bg-amber-50' },
    { id: 'malo', label: 'Malo', color: 'text-red-600 bg-red-50' },
]

const tiposDictamen = [
    { id: 'inicial', label: 'Dictamen Inicial' },
    { id: 'subsecuente', label: 'Dictamen Subsecuente' },
    { id: 'alta', label: 'Alta Médica' },
    { id: 'valuacion', label: 'Valuación de Secuelas' },
]

export function FormatoST9({ paciente, riesgoTrabajo, incapacidadPrevia, onSave, onGeneratePDF }: FormatoST9Props) {
    const { user } = useAuth()
    const [saving, setSaving] = useState(false)
    const [signatureModalOpen, setSignatureModalOpen] = useState<'medico' | null>(null)
    const [firmas, setFirmas] = useState<{
        medico?: string
    }>({})

    const diasAnteriores = incapacidadPrevia?.dias_acumulados || 0

    const [formData, setFormData] = useState({
        // Tipo de dictamen
        tipo_dictamen: incapacidadPrevia ? 'subsecuente' : 'inicial',

        // Tipo de incapacidad
        tipo_incapacidad: 'temporal',
        porcentaje_valuacion: '',

        // Fechas y días
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: '',
        dias_incapacidad: 7,
        dias_anteriores: diasAnteriores,

        // Diagnóstico
        diagnostico_definitivo: riesgoTrabajo?.diagnostico_inicial || '',
        pronostico: 'favorable',

        // Secuelas y recomendaciones
        secuelas: '',
        recomendaciones_reintegracion: '',

        // Seguimiento
        requiere_seguimiento: true,
        fecha_proxima_valoracion: '',

        // Observaciones
        observaciones: ''
    })

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // Calcular fecha fin cuando cambian días
    React.useEffect(() => {
        if (formData.fecha_inicio && formData.dias_incapacidad) {
            const inicio = new Date(formData.fecha_inicio)
            inicio.setDate(inicio.getDate() + formData.dias_incapacidad)
            handleChange('fecha_fin', inicio.toISOString().split('T')[0])
        }
    }, [formData.fecha_inicio, formData.dias_incapacidad])

    const handleSave = async () => {
        if (!formData.diagnostico_definitivo) {
            toast.error('Por favor complete el diagnóstico definitivo')
            return
        }

        setSaving(true)
        try {
            const payload = {
                ...formData,
                paciente_id: paciente.id,
                riesgo_trabajo_id: riesgoTrabajo?.id,
                dias_acumulados: diasAnteriores + formData.dias_incapacidad,
                medico_id: user?.id,
                cedula_medico: user?.cedula_profesional || ''
            }

            if (onSave) {
                await onSave(payload)
            }

            toast.success('Formato ST-9 guardado correctamente')
        } catch (error) {
            toast.error('Error al guardar el formato')
        } finally {
            setSaving(false)
        }
    }

    const handleGeneratePDF = () => {
        const html = pdfGeneratorService.generateST9({
            folio: `ST9-${new Date().getFullYear()}-PREVIEW`,
            paciente,
            incapacidad: formData,
            riesgo: riesgoTrabajo,
            medico: user,
            firmas
        })
        pdfGeneratorService.printDocument(html, `ST9_${paciente?.nombre || 'documento'}.pdf`)
    }

    const handleSaveSignature = (dataUrl: string) => {
        if (signatureModalOpen) {
            setFirmas(prev => ({ ...prev, [signatureModalOpen]: dataUrl }))
            setSignatureModalOpen(null)
            toast.success('Firma capturada')
        }
    }


    const diasAcumulados = diasAnteriores + (formData.dias_incapacidad || 0)

    return (
        <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden">
            {/* Header */}
            <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-white p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <FileCheck className="w-8 h-8" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black">Formato ST-9</CardTitle>
                            <p className="text-indigo-100 text-sm font-medium">Dictamen de Incapacidad por Riesgo de Trabajo</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <Badge className="bg-white/20 text-white border-none">IMSS</Badge>
                        <p className="text-xs text-indigo-100 mt-1">Art. 58-62 LSS</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
                {/* Info del Paciente y Riesgo */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                        <p className="text-xs font-bold uppercase text-slate-400 mb-2">Trabajador</p>
                        <p className="font-bold text-slate-900">{paciente?.nombre} {paciente?.apellido_paterno}</p>
                        <p className="text-sm text-slate-500">NSS: {paciente?.nss || 'Sin NSS'}</p>
                    </div>
                    {riesgoTrabajo && (
                        <div className="p-4 bg-amber-50 rounded-2xl">
                            <p className="text-xs font-bold uppercase text-amber-600 mb-2">Riesgo de Trabajo Asociado</p>
                            <p className="font-bold text-amber-900">Folio: {riesgoTrabajo.folio || riesgoTrabajo.id?.substring(0, 8)}</p>
                            <p className="text-sm text-amber-700">{riesgoTrabajo.tipo_riesgo?.replace('_', ' ')}</p>
                        </div>
                    )}
                </div>

                {/* Tipo de Dictamen */}
                <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500">
                        Tipo de Dictamen
                    </Label>
                    <div className="flex gap-2 flex-wrap">
                        {tiposDictamen.map(tipo => (
                            <button
                                key={tipo.id}
                                type="button"
                                onClick={() => handleChange('tipo_dictamen', tipo.id)}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${formData.tipo_dictamen === tipo.id
                                    ? 'bg-indigo-500 text-white shadow-lg'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {tipo.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tipo de Incapacidad */}
                <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500">
                        Tipo de Incapacidad
                    </Label>
                    <div className="grid grid-cols-3 gap-4">
                        {tiposIncapacidad.map(tipo => (
                            <motion.button
                                key={tipo.id}
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleChange('tipo_incapacidad', tipo.id)}
                                className={`p-4 rounded-2xl border-2 transition-all text-left ${formData.tipo_incapacidad === tipo.id
                                    ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-500/10'
                                    : 'border-slate-100 bg-white hover:border-slate-200'
                                    }`}
                            >
                                <div className={`w-10 h-10 ${tipo.color} rounded-xl flex items-center justify-center text-white mb-3`}>
                                    <tipo.icon size={20} />
                                </div>
                                <p className={`text-sm font-bold ${formData.tipo_incapacidad === tipo.id ? 'text-indigo-700' : 'text-slate-700'
                                    }`}>
                                    {tipo.label}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">{tipo.desc}</p>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Porcentaje de Valuación (solo para parcial permanente) */}
                {formData.tipo_incapacidad === 'parcial_permanente' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-4 bg-amber-50 rounded-2xl"
                    >
                        <Label className="text-xs font-black uppercase tracking-widest text-amber-600 mb-2 block">
                            Porcentaje de Valuación
                        </Label>
                        <div className="flex items-center gap-4">
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.porcentaje_valuacion}
                                onChange={(e) => handleChange('porcentaje_valuacion', e.target.value)}
                                className="w-32"
                                placeholder="0"
                            />
                            <span className="text-2xl font-black text-amber-700">%</span>
                            <p className="text-sm text-amber-600">Según Tabla de Valuación de Incapacidades (LFT Art. 514)</p>
                        </div>
                    </motion.div>
                )}

                {/* Días de Incapacidad */}
                {formData.tipo_incapacidad === 'temporal' && (
                    <div className="p-4 bg-blue-50 rounded-2xl space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                            <Calendar size={14} /> Período de Incapacidad
                        </h4>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label>Fecha Inicio</Label>
                                <Input
                                    type="date"
                                    value={formData.fecha_inicio}
                                    onChange={(e) => handleChange('fecha_inicio', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Días Incapacidad</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={formData.dias_incapacidad}
                                    onChange={(e) => handleChange('dias_incapacidad', parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha Fin (auto)</Label>
                                <Input
                                    type="date"
                                    value={formData.fecha_fin}
                                    readOnly
                                    className="bg-slate-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Días Acumulados</Label>
                                <div className="h-10 px-3 flex items-center bg-blue-100 rounded-md text-blue-800 font-black text-lg">
                                    {diasAcumulados} días
                                </div>
                            </div>
                        </div>
                        {diasAnteriores > 0 && (
                            <p className="text-xs text-blue-600">
                                ⚠️ El trabajador tiene {diasAnteriores} días de incapacidades previas por este riesgo.
                            </p>
                        )}
                    </div>
                )}

                {/* Diagnóstico y Pronóstico */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-500">
                            Diagnóstico Definitivo *
                        </Label>
                        <Textarea
                            value={formData.diagnostico_definitivo}
                            onChange={(e) => handleChange('diagnostico_definitivo', e.target.value)}
                            placeholder="Diagnóstico médico completo que sustenta la incapacidad..."
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-500">
                            Pronóstico
                        </Label>
                        <div className="flex gap-3">
                            {pronosticos.map(p => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => handleChange('pronostico', p.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${formData.pronostico === p.id
                                        ? p.color + ' ring-2 ring-offset-2 ring-current'
                                        : 'bg-slate-100 text-slate-500'
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Secuelas y Reintegración */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Secuelas Esperadas</Label>
                        <Textarea
                            value={formData.secuelas}
                            onChange={(e) => handleChange('secuelas', e.target.value)}
                            placeholder="Describa las secuelas esperadas o permanentes..."
                            className="min-h-[80px]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Recomendaciones para Reintegración</Label>
                        <Textarea
                            value={formData.recomendaciones_reintegracion}
                            onChange={(e) => handleChange('recomendaciones_reintegracion', e.target.value)}
                            placeholder="Condiciones para el regreso al trabajo..."
                            className="min-h-[80px]"
                        />
                    </div>
                </div>

                {/* Seguimiento */}
                <div className="p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.requiere_seguimiento}
                                onChange={(e) => handleChange('requiere_seguimiento', e.target.checked)}
                                className="w-5 h-5 rounded border-slate-300"
                            />
                            <span className="text-sm font-bold text-slate-700">Requiere Seguimiento Médico</span>
                        </label>
                    </div>
                    {formData.requiere_seguimiento && (
                        <div className="space-y-2">
                            <Label>Fecha de Próxima Valoración</Label>
                            <Input
                                type="date"
                                value={formData.fecha_proxima_valoracion}
                                onChange={(e) => handleChange('fecha_proxima_valoracion', e.target.value)}
                                className="max-w-xs"
                            />
                        </div>
                    )}
                </div>

                {/* Resumen */}
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                    <h4 className="text-xs font-black uppercase tracking-widest text-indigo-700 mb-3 flex items-center gap-2">
                        <TrendingUp size={14} /> Resumen del Dictamen ST-9
                    </h4>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-indigo-500 text-xs">Tipo</p>
                            <p className="font-bold text-indigo-900">{tiposIncapacidad.find(t => t.id === formData.tipo_incapacidad)?.label}</p>
                        </div>
                        <div>
                            <p className="text-indigo-500 text-xs">Días Otorgados</p>
                            <p className="font-bold text-indigo-900">{formData.dias_incapacidad} días</p>
                        </div>
                        <div>
                            <p className="text-indigo-500 text-xs">Días Acumulados</p>
                            <p className="font-bold text-indigo-900">{diasAcumulados} días</p>
                        </div>
                        <div>
                            <p className="text-indigo-500 text-xs">Pronóstico</p>
                            <p className="font-bold text-indigo-900 capitalize">{formData.pronostico}</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
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
                        className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full px-8"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Guardando...' : 'Guardar ST-9'}
                    </Button>
                </div>

                {/* Sección de Firma Digital */}
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                        <Pen size={14} /> Firma Médica (Opcional)
                    </h4>
                    <div className="flex justify-center">
                        <div className="text-center w-full max-w-xs">
                            {firmas.medico ? (
                                <SignatureDisplay
                                    signatureUrl={firmas.medico}
                                    label="Médico Dictaminador"
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
            </CardContent>

            {/* Modal de Firma */}
            <SignatureModal
                open={signatureModalOpen !== null}
                onClose={() => setSignatureModalOpen(null)}
                onSave={handleSaveSignature}
                title="Capturar Firma - Médico Dictaminador"
            />
        </Card>
    )
}
