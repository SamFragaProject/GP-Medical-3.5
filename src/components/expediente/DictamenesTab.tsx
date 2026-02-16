/**
 * DictamenesTab — Dictámenes médico-laborales con historial y generación de documentos
 */
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ScrollText, CheckCircle, Clock, ChevronDown, ChevronUp,
    Calendar, User, AlertTriangle, Shield, ArrowRight, Download,
    Building2, FileCheck, Printer, FileText
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DICTAMENES_DEMO } from '@/data/demoPacienteCompleto'
import toast from 'react-hot-toast'

const RESULTADO_STYLES: Record<string, { bg: string; text: string; border: string; badgeBg: string }> = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badgeBg: 'bg-emerald-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badgeBg: 'bg-amber-100' },
    red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', badgeBg: 'bg-red-100' },
}

function generateDictamenPDF(dict: typeof DICTAMENES_DEMO[0]) {
    const content = `
═══════════════════════════════════════════════
DICTAMEN MÉDICO-LABORAL
GPMedical ERP — Sistema de Expediente Electrónico
═══════════════════════════════════════════════

Folio: ${dict.folio}
Tipo: ${dict.tipo}
Fecha: ${new Date(dict.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}

DATOS DEL TRABAJADOR
─────────────────────────
Empresa: ${dict.empresa}
Puesto: ${dict.puesto}

RESULTADO: ${dict.resultado}

ESTUDIOS BASE
─────────────────────────
${dict.estudios_base.map(e => `• ${e}`).join('\n')}

DIAGNÓSTICOS
─────────────────────────
${dict.diagnosticos.map(d => `• ${d}`).join('\n')}

RESTRICCIONES
─────────────────────────
${dict.restricciones.map(r => `• ${r}`).join('\n')}

CONCLUSIÓN
─────────────────────────
${dict.conclusion}

─────────────────────────
Médico: ${dict.medico}
Cédula: ${dict.cedula}
Vigencia: ${new Date(dict.vigencia).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
Firma digital: ${dict.firma_digital ? 'Sí' : 'No'}

═══════════════════════════════════════════════
Generado el ${new Date().toLocaleString('es-MX')}
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

export default function DictamenesTab() {
    const dictamenes = DICTAMENES_DEMO
    const [expandedId, setExpandedId] = useState<string | null>(dictamenes[0]?.id || null)

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
                        <div className="px-4 py-2 rounded-xl bg-purple-50 border border-purple-200 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Último</p>
                            <p className="text-sm font-bold text-purple-700">
                                {new Date(dictamenes[0].fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
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
                    const resStyle = RESULTADO_STYLES[dict.resultado_color] || RESULTADO_STYLES.emerald
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
                                            <h4 className="text-sm font-bold text-slate-800">{dict.tipo}</h4>
                                            <Badge className={`${resStyle.badgeBg} ${resStyle.text} border-0 text-[9px] font-black px-2 py-0.5`}>
                                                {dict.resultado}
                                            </Badge>
                                            {isLatest && (
                                                <Badge className="bg-purple-100 text-purple-700 border-0 text-[9px] font-black px-2 py-0.5">
                                                    Vigente
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-medium">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(dict.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </span>
                                            <span className="font-mono">{dict.folio}</span>
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
                                                    <p className={`text-lg font-black ${resStyle.text}`}>{dict.resultado}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{dict.empresa} — {dict.puesto}</p>
                                                </div>
                                            </div>

                                            {/* Studies base */}
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Estudios base del dictamen</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {dict.estudios_base.map((estudio, i) => (
                                                        <Badge key={i} className="bg-slate-100 text-slate-600 border-0 text-[10px] font-medium px-2.5 py-1">
                                                            {estudio}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Diagnoses */}
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Diagnósticos</p>
                                                <ul className="space-y-1.5">
                                                    {dict.diagnosticos.map((diag, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                                                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                                            <span>{diag}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Restrictions */}
                                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2">Restricciones</p>
                                                <ul className="space-y-1.5">
                                                    {dict.restricciones.map((rest, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm text-amber-800 font-medium">
                                                            <Shield className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                                                            <span>{rest}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Conclusion */}
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Conclusión</p>
                                                <p className="text-sm text-slate-700 font-medium leading-relaxed">{dict.conclusion}</p>
                                            </div>

                                            {/* Meta */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Médico</p>
                                                    <p className="text-xs text-slate-700 font-medium mt-0.5">{dict.medico}</p>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cédula</p>
                                                    <p className="text-xs text-slate-700 font-mono font-medium mt-0.5">{dict.cedula}</p>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vigencia</p>
                                                    <p className="text-xs text-slate-700 font-medium mt-0.5">
                                                        {new Date(dict.vigencia).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                                <div className={`p-3 rounded-xl border ${dict.firma_digital ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Firma Digital</p>
                                                    <p className={`text-xs font-bold mt-0.5 ${dict.firma_digital ? 'text-emerald-700' : 'text-slate-400'}`}>
                                                        {dict.firma_digital ? '✓ Firmado' : 'Pendiente'}
                                                    </p>
                                                </div>
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
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl border border-purple-100">
                <Shield className="w-4 h-4 text-purple-400" />
                <p className="text-[11px] text-purple-600 font-medium">
                    El dictamen vigente ({dictamenes[0].folio}) tiene validez hasta {new Date(dictamenes[0].vigencia).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}.
                    Resultado actual: <b>{dictamenes[0].resultado}</b>.
                </p>
            </div>
        </div>
    )
}
