/**
 * DictamenesTab — Dictámenes médico-laborales con historial y generación de documentos
 * Conectado a dictamenService para datos reales de Supabase
 */
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ScrollText, CheckCircle, Clock, ChevronDown, ChevronUp,
    Calendar, User, AlertTriangle, Shield, ArrowRight, Download,
    Building2, FileCheck, Printer, FileText, Award, ShieldCheck,
    FileSignature, Briefcase
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'
import { dictamenService } from '@/services/dictamenService'
import type { DictamenMedico } from '@/types/dictamen'
import { getExpedienteDemoCompleto } from '@/data/demoPacienteCompleto'

const RESULTADO_STYLES: Record<string, { bg: string; text: string; border: string; badgeBg: string; label: string }> = {
    apto: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badgeBg: 'bg-emerald-100', label: 'APTO' },
    apto_restricciones: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badgeBg: 'bg-amber-100', label: 'APTO CON RESTRICCIONES' },
    no_apto_temporal: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', badgeBg: 'bg-orange-100', label: 'NO APTO TEMPORAL' },
    no_apto: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', badgeBg: 'bg-red-100', label: 'NO APTO' },
    evaluacion_complementaria: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badgeBg: 'bg-blue-100', label: 'EVALUACIÓN COMPLEMENTARIA' },
}

const TIPO_EVALUACION_LABELS: Record<string, string> = {
    preempleo: 'Pre-empleo',
    ingreso: 'Ingreso',
    periodico: 'Examen Periódico',
    retorno: 'Retorno a Trabajo',
    egreso: 'Egreso / Término',
    reubicacion: 'Reubicación',
    reincorporacion: 'Reincorporación',
}

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
    borrador: { label: 'Borrador', color: 'bg-slate-100 text-slate-600' },
    pendiente: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700' },
    completado: { label: 'Completado', color: 'bg-emerald-100 text-emerald-700' },
    firmado: { label: 'Firmado', color: 'bg-blue-100 text-blue-700' },
    anulado: { label: 'Anulado', color: 'bg-rose-100 text-rose-700' },
    vencido: { label: 'Vencido', color: 'bg-slate-100 text-slate-500' },
    cancelado: { label: 'Cancelado', color: 'bg-rose-100 text-rose-700' },
}

function generateDictamenPDF(dict: DictamenMedico) {
    const restriccionesText = dict.restricciones?.map(r => `• [${r.codigo}] ${r.descripcion} (${r.tipo})`).join('\n') || 'Ninguna'
    const eppText = dict.recomendaciones_epp?.join(', ') || 'N/A'
    const recsText = dict.recomendaciones_medicas?.map(r => `• ${r}`).join('\n') || 'Sin recomendaciones adicionales'
    const resLabel = RESULTADO_STYLES[dict.resultado]?.label || dict.resultado
    const tipoLabel = TIPO_EVALUACION_LABELS[dict.tipo_evaluacion] || dict.tipo_evaluacion

    const content = `
═══════════════════════════════════════════════
        DICTAMEN MÉDICO-LABORAL
   GPMedical ERP — Expediente Electrónico
═══════════════════════════════════════════════

Folio: ${dict.folio}
Tipo de Evaluación: ${tipoLabel}
Fecha de Emisión: ${dict.vigencia_inicio ? new Date(dict.vigencia_inicio).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}
Estado: ${dict.estado}
Versión: ${dict.version}

DATOS DEL TRABAJADOR
─────────────────────────
Nombre: ${dict.paciente?.nombre || ''} ${dict.paciente?.apellido_paterno || ''} ${dict.paciente?.apellido_materno || ''}
Puesto: ${dict.paciente?.puesto_trabajo || dict.paciente?.puesto || 'N/A'}
Área: ${dict.paciente?.area_trabajo || 'N/A'}
Empresa: ${dict.empresa?.nombre || 'N/A'}

RESULTADO DE LA EVALUACIÓN
─────────────────────────
${resLabel}
${dict.resultado_detalle || ''}

RESTRICCIONES MÉDICAS
─────────────────────────
${restriccionesText}
${dict.restricciones_otras ? `\nNotas adicionales: ${dict.restricciones_otras}` : ''}

RECOMENDACIONES MÉDICAS
─────────────────────────
${recsText}

EQUIPO DE PROTECCIÓN PERSONAL (EPP)
─────────────────────────
${eppText}

VIGENCIA DEL DICTAMEN
─────────────────────────
Inicio: ${dict.vigencia_inicio ? new Date(dict.vigencia_inicio).toLocaleDateString('es-MX') : 'N/A'}
Vencimiento: ${dict.vigencia_fin ? new Date(dict.vigencia_fin).toLocaleDateString('es-MX') : 'Sin vencimiento'}

═══════════════════════════════════════════════
MÉDICO RESPONSABLE
─────────────────────────
Nombre: ${dict.medico_nombre || 'N/A'}
Cédula Profesional: ${dict.cedula_profesional || 'N/A'}
Especialidad: ${dict.especialidad_medico || 'N/A'}
Firma Electrónica: ${dict.firma_digital_url ? '✓ Documento firmado digitalmente' : '✗ Sin firma electrónica'}

═══════════════════════════════════════════════
Documento generado electrónicamente el ${new Date().toLocaleString('es-MX')}
Este dictamen tiene validez médico-legal conforme a la NOM-030-STPS-2009
    `.trim()

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dictamen_${dict.folio}_${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Dictamen ${dict.folio} exportado correctamente`)
}

function calcularVigencia(dict: DictamenMedico): { label: string; color: string; dias: number } {
    const fin = dict.vigencia_fin || dict.fecha_vigencia_fin
    if (!fin) return { label: 'Sin vencimiento', color: 'text-blue-600', dias: 999 }
    const hoy = new Date()
    const vence = new Date(fin)
    const diff = Math.ceil((vence.getTime() - hoy.getTime()) / 86400000)
    if (diff < 0) return { label: `Vencido hace ${Math.abs(diff)}d`, color: 'text-rose-600', dias: diff }
    if (diff <= 30) return { label: `Vence en ${diff}d`, color: 'text-amber-600', dias: diff }
    if (diff <= 90) return { label: `Vence en ${diff}d`, color: 'text-blue-600', dias: diff }
    return { label: `Vigente (${diff}d)`, color: 'text-emerald-600', dias: diff }
}

interface DictamenesTabProps {
    pacienteId?: string
}

export default function DictamenesTab({ pacienteId }: DictamenesTabProps) {
    const [dictamenes, setDictamenes] = useState<DictamenMedico[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState<string | null>(null)

    React.useEffect(() => {
        if (!pacienteId) return
        async function fetchDictamenes() {
            try {
                setLoading(true)
                const { data } = await dictamenService.listar(
                    { paciente_id: pacienteId },
                    { ordenar_por: 'created_at', direccion: 'desc', limit: 50 }
                )
                if (data && data.length > 0) {
                    setDictamenes(data)
                    setExpandedId(data[0].id)
                } else if (pacienteId?.startsWith('demo')) {
                    const demoData = getExpedienteDemoCompleto()
                    const mappedDictamenes = demoData.dictamenes.map(d => ({
                        id: d.id,
                        folio: d.folio,
                        paciente_id: pacienteId,
                        empresa_id: 'demo',
                        tipo_evaluacion: d.tipo.includes('Ingreso') ? 'ingreso' : 'periodico',
                        resultado: d.resultado === 'APTO CON RESTRICCIONES' ? 'apto_restricciones' : d.resultado === 'APTO CON RESTRICCIÓN' ? 'apto_restricciones' : 'apto',
                        estado: 'completado',
                        fecha_vigencia_fin: d.vigencia,
                        vigencia_fin: d.vigencia,
                        vigencia_inicio: d.fecha,
                        firma_digital_url: d.firma_digital ? 'demo-url' : null,
                        medico_nombre: d.medico,
                        cedula_profesional: d.cedula,
                        created_at: d.fecha,
                        updated_at: d.fecha,
                        version: 1,
                        resultado_detalle: d.conclusion,
                        restricciones: d.restricciones?.map(r => ({ codigo: 'N/A', descripcion: r, tipo: 'Permanente' })) || [],
                        recomendaciones_medicas: [],
                        recomendaciones_epp: [],
                        empresa: { nombre: d.empresa },
                        paciente: {
                            nombre: 'Carlos Eduardo',
                            apellido_paterno: 'Ríos',
                            apellido_materno: 'Velázquez',
                            puesto_trabajo: d.puesto
                        }
                    })) as unknown as DictamenMedico[]

                    setDictamenes(mappedDictamenes)
                    if (mappedDictamenes.length > 0) setExpandedId(mappedDictamenes[0].id)
                }
            } catch (e) {
                console.error('Error cargando dictámenes:', e)
            } finally {
                setLoading(false)
            }
        }
        fetchDictamenes()
    }, [pacienteId])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100">
                <Clock className="w-10 h-10 animate-spin text-purple-500 mb-4" />
                <p className="text-sm font-semibold text-slate-500">Cargando dictámenes...</p>
            </div>
        )
    }

    if (dictamenes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <ScrollText className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Sin dictámenes emitidos</h3>
                <p className="text-sm text-slate-400 max-w-sm text-center mt-2">
                    No hay datos registrados. Es posible que estas evaluaciones no se hayan realizado o no correspondan debido al perfil de puesto del trabajador.
                </p>
            </div>
        )
    }

    const totalAptos = dictamenes.filter(d => d.resultado === 'apto').length
    const totalConRestricciones = dictamenes.filter(d => d.resultado === 'apto_restricciones').length
    const totalNoAptos = dictamenes.filter(d => d.resultado === 'no_apto' || d.resultado === 'no_apto_temporal').length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-lg shadow-purple-200">
                            <ScrollText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Dictámenes Médico-Laborales</h3>
                            <p className="text-xs text-slate-400 font-medium">{dictamenes.length} dictamen{dictamenes.length !== 1 ? 'es' : ''} emitido{dictamenes.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Aptos</p>
                            <p className="text-sm font-bold text-emerald-700">{totalAptos}</p>
                        </div>
                        <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Restr.</p>
                            <p className="text-sm font-bold text-amber-700">{totalConRestricciones}</p>
                        </div>
                        <div className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">No Aptos</p>
                            <p className="text-sm font-bold text-rose-700">{totalNoAptos}</p>
                        </div>
                        <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total</p>
                            <p className="text-sm font-bold text-slate-700">{dictamenes.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dictámenes list */}
            <div className="space-y-4">
                {dictamenes.map((dict, index) => {
                    const isExpanded = expandedId === dict.id
                    const resStyle = RESULTADO_STYLES[dict.resultado] || RESULTADO_STYLES.apto
                    const vigencia = calcularVigencia(dict)
                    const estadoInfo = ESTADO_LABELS[dict.estado] || ESTADO_LABELS.pendiente
                    const isLatest = index === 0

                    return (
                        <Card key={dict.id} className={`border-slate-100 shadow-sm overflow-hidden ${isLatest ? 'ring-2 ring-purple-200' : ''}`}>
                            <button
                                onClick={() => setExpandedId(isExpanded ? null : dict.id)}
                                className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition-colors text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${resStyle.bg} border ${resStyle.border}`}>
                                        <ScrollText className={`w-5 h-5 ${resStyle.text}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="text-sm font-bold text-slate-800">
                                                {TIPO_EVALUACION_LABELS[dict.tipo_evaluacion] || dict.tipo_evaluacion}
                                            </h4>
                                            <Badge className={`${resStyle.badgeBg} ${resStyle.text} border-0 text-[9px] font-black px-2 py-0.5`}>
                                                {resStyle.label}
                                            </Badge>
                                            <Badge className={`${estadoInfo.color} border-0 text-[9px] font-bold px-2 py-0.5`}>
                                                {estadoInfo.label}
                                            </Badge>
                                            {dict.firma_digital_url && (
                                                <Badge className="bg-blue-100 text-blue-700 border-0 text-[9px] font-bold px-2 py-0.5">
                                                    ✓ Firmado
                                                </Badge>
                                            )}
                                            {isLatest && (
                                                <Badge className="bg-purple-100 text-purple-700 border-0 text-[9px] font-black px-2 py-0.5">
                                                    Vigente
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-medium">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(dict.vigencia_inicio || dict.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </span>
                                            <span className="font-mono">{dict.folio}</span>
                                            <span className={`font-bold ${vigencia.color}`}>
                                                {vigencia.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                            </button>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-6 space-y-4 border-t border-slate-100 pt-4">
                                            {/* Result banner */}
                                            <div className={`flex items-center gap-3 p-4 rounded-xl ${resStyle.bg} border ${resStyle.border}`}>
                                                <FileCheck className={`w-5 h-5 ${resStyle.text} flex-shrink-0`} />
                                                <div>
                                                    <p className={`text-lg font-black ${resStyle.text}`}>{resStyle.label}</p>
                                                    <p className="text-xs text-slate-500 font-medium">
                                                        {dict.empresa?.nombre || 'Empresa'} — {dict.paciente?.puesto_trabajo || dict.paciente?.puesto || 'Puesto N/A'}
                                                    </p>
                                                    {dict.resultado_detalle && (
                                                        <p className="text-sm text-slate-600 mt-1">{dict.resultado_detalle}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Restricciones codificadas */}
                                            {dict.restricciones && dict.restricciones.length > 0 && (
                                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Briefcase className="w-4 h-4 text-amber-600" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                                                            Restricciones Codificadas ({dict.restricciones.length})
                                                        </p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {dict.restricciones.map((rest, i) => (
                                                            <div key={i} className="flex items-start gap-3 p-2.5 bg-white rounded-lg border border-amber-100">
                                                                <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded flex-shrink-0">
                                                                    {rest.codigo}
                                                                </span>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm text-amber-800 font-semibold">{rest.descripcion}</p>
                                                                    <div className="flex items-center gap-3 mt-1">
                                                                        <Badge variant="outline" className="text-[9px] font-bold uppercase border-amber-200 text-amber-600">
                                                                            {rest.tipo}
                                                                        </Badge>
                                                                        {rest.vigencia_fin && (
                                                                            <span className="text-[10px] text-amber-400 font-medium">
                                                                                Hasta: {new Date(rest.vigencia_fin).toLocaleDateString('es-MX')}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {dict.restricciones_otras && (
                                                        <p className="text-xs text-amber-600 mt-2 italic">{dict.restricciones_otras}</p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Recomendaciones Médicas */}
                                            {dict.recomendaciones_medicas && dict.recomendaciones_medicas.length > 0 && (
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Recomendaciones Médicas</p>
                                                    <ul className="space-y-1.5">
                                                        {dict.recomendaciones_medicas.map((rec, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                                                                <ArrowRight className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                                <span>{rec}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* EPP Recomendado */}
                                            {dict.recomendaciones_epp && dict.recomendaciones_epp.length > 0 && (
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">EPP Recomendado</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {dict.recomendaciones_epp.map((epp, i) => (
                                                            <Badge key={i} className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold px-2.5 py-1">
                                                                <Shield className="w-3 h-3 mr-1" /> {epp}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Motivo de no aptitud */}
                                            {dict.motivo_no_apto && (
                                                <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">Motivo de No Aptitud</p>
                                                    <p className="text-sm text-rose-700 font-medium">{dict.motivo_no_apto}</p>
                                                    {dict.cie10_no_apto && (
                                                        <Badge className="mt-2 bg-rose-100 text-rose-600 border-0 text-[10px] font-mono">
                                                            CIE-10: {dict.cie10_no_apto}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}

                                            {/* Médico, Cédula, Vigencia, Firma */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Médico</p>
                                                    <p className="text-xs text-slate-700 font-bold mt-0.5">{dict.medico_nombre || 'N/A'}</p>
                                                    {dict.especialidad_medico && (
                                                        <p className="text-[10px] text-slate-400 mt-0.5">{dict.especialidad_medico}</p>
                                                    )}
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                        <Award className="w-3 h-3" /> Cédula
                                                    </p>
                                                    <p className="text-xs text-slate-700 font-mono font-bold mt-0.5">{dict.cedula_profesional || 'N/A'}</p>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vigencia</p>
                                                    <p className={`text-xs font-bold mt-0.5 ${vigencia.color}`}>
                                                        {dict.vigencia_fin
                                                            ? new Date(dict.vigencia_fin).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
                                                            : 'Sin vencimiento'}
                                                    </p>
                                                    <p className={`text-[10px] font-bold ${vigencia.color}`}>{vigencia.label}</p>
                                                </div>
                                                <div className={`p-3 rounded-xl border ${dict.firma_digital_url ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                        <FileSignature className="w-3 h-3" /> Firma Digital
                                                    </p>
                                                    {dict.firma_digital_url ? (
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                                            <p className="text-xs text-emerald-700 font-bold">Firmado</p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-slate-400 font-medium mt-0.5">Pendiente</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Versión y auditoría */}
                                            <div className="flex items-center gap-4 text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-100">
                                                <span>Versión: {dict.version}</span>
                                                <span>Creado: {new Date(dict.created_at).toLocaleString('es-MX')}</span>
                                                {dict.updated_at !== dict.created_at && (
                                                    <span>Modificado: {new Date(dict.updated_at).toLocaleString('es-MX')}</span>
                                                )}
                                            </div>

                                            {/* Export button */}
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => generateDictamenPDF(dict)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-xl text-xs font-bold text-purple-700 transition-colors"
                                                >
                                                    <Download className="w-3.5 h-3.5" /> Exportar Dictamen
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    )
                })}
            </div>

            {/* Summary footer */}
            {dictamenes.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <p className="text-[11px] text-purple-600 font-medium">
                        Dictamen vigente ({dictamenes[0].folio}) — Resultado: <b>{RESULTADO_STYLES[dictamenes[0].resultado]?.label || dictamenes[0].resultado}</b>.
                        {dictamenes[0].vigencia_fin
                            ? ` Vigencia hasta ${new Date(dictamenes[0].vigencia_fin).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}.`
                            : ' Sin fecha de vencimiento.'}
                        {dictamenes[0].medico_nombre && ` Emitido por ${dictamenes[0].medico_nombre}`}
                        {dictamenes[0].cedula_profesional && ` (Céd. ${dictamenes[0].cedula_profesional})`}
                    </p>
                </div>
            )}
        </div>
    )
}
