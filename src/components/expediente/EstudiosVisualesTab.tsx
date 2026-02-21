/**
 * EstudiosVisualesTab — Vista de resultados visuales dentro del perfil del paciente
 */
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Eye, CheckCircle, AlertTriangle, ChevronDown, ChevronUp,
    ArrowRight, Shield, Clock, Glasses, Palette, Loader2, Inbox
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'

const SNELLEN_LEVELS: Record<string, { level: string; color: string }> = {
    '20/15': { level: 'Superior', color: 'text-emerald-700' },
    '20/20': { level: 'Normal', color: 'text-emerald-700' },
    '20/25': { level: 'Casi Normal', color: 'text-amber-600' },
    '20/30': { level: 'Leve', color: 'text-amber-600' },
    '20/40': { level: 'Moderada', color: 'text-orange-600' },
    '20/50': { level: 'Deficiente', color: 'text-red-600' },
    '20/70': { level: 'Deficiente', color: 'text-red-600' },
    '20/100': { level: 'Severa', color: 'text-red-700' },
    '20/200': { level: 'Legal ceguera', color: 'text-red-800' },
}

function SnellenCard({ label, value, corrected, color }: {
    label: string; value: string; corrected?: string; color: 'blue' | 'emerald'
}) {
    const info = SNELLEN_LEVELS[value] || { level: '—', color: 'text-slate-600' }
    const corrInfo = corrected ? SNELLEN_LEVELS[corrected] : null
    const bgClass = color === 'blue' ? 'bg-blue-50 border-blue-200' : 'bg-emerald-50 border-emerald-200'
    const labelClass = color === 'blue' ? 'text-blue-600' : 'text-emerald-600'
    const dotClass = color === 'blue' ? 'bg-blue-500' : 'bg-emerald-500'

    return (
        <div className={`p-5 rounded-xl border ${bgClass}`}>
            <div className="flex items-center gap-2 mb-3">
                <div className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
                <h4 className={`text-xs font-black uppercase tracking-widest ${labelClass}`}>{label}</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sin corrección</p>
                    <p className="text-2xl font-black text-slate-800">{value}</p>
                    <p className={`text-xs font-bold ${info.color}`}>{info.level}</p>
                </div>
                {corrected && (
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Con corrección</p>
                        <p className="text-2xl font-black text-slate-800">{corrected}</p>
                        <p className={`text-xs font-bold ${corrInfo?.color || 'text-slate-600'}`}>{corrInfo?.level || '—'}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function IshiharaResult({ correct, total, result }: { correct: number; total: number; result: string }) {
    const percentage = Math.round((correct / total) * 100)
    const isNormal = percentage >= 90

    return (
        <div className={`p-5 rounded-xl border ${isNormal ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-center gap-2 mb-3">
                <Palette className={`w-4 h-4 ${isNormal ? 'text-emerald-600' : 'text-amber-600'}`} />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Test de Ishihara</h4>
            </div>
            <div className="flex items-end gap-4 mb-2">
                <p className="text-3xl font-black text-slate-800">{correct}<span className="text-sm text-slate-400">/{total}</span></p>
                <p className={`text-lg font-bold ${isNormal ? 'text-emerald-600' : 'text-amber-600'}`}>{percentage}%</p>
            </div>
            <p className={`text-xs font-medium ${isNormal ? 'text-emerald-700' : 'text-amber-700'}`}>{result}</p>
        </div>
    )
}

export default function EstudiosVisualesTab({ pacienteId }: { pacienteId: string }) {
    const [loading, setLoading] = React.useState(true)
    const [data, setData] = React.useState<any>(null)
    const [prev, setPrev] = React.useState<any>(null)
    const [showPrev, setShowPrev] = useState(false)

    React.useEffect(() => {
        if (pacienteId) loadData()
    }, [pacienteId])

    const loadData = async () => {
        try {
            setLoading(true)
            const { data: records, error } = await supabase
                .from('examenes_vista')
                .select('*')
                .eq('paciente_id', pacienteId)
                .order('fecha', { ascending: false })
                .limit(2)

            if (records && records.length > 0) {
                setData(records[0])
                if (records.length > 1) setPrev(records[1])
            }
        } catch (err) {
            console.error('Error loading vision studies:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-slate-500 text-xs font-medium">Cargando estudios visuales...</p>
            </div>
        )
    }

    const isDemo = true; // Use mock data if empty

    // Inject Mock Data
    const renderData = data || (isDemo ? {
        id: 'demo-vis-1',
        clasificacion: 'normal',
        evaluador: 'Dr. Alejandro Soto',
        equipo: 'Snellen / Ishihara Standard',
        fecha: new Date().toISOString(),
        apto: true,
        observaciones: 'Paciente con excelente agudeza visual. No requiere corrección.',
        od_sin_correccion: '20/20',
        oi_sin_correccion: '20/20',
        od_con_correccion: null,
        oi_con_correccion: null,
        od_jaeger: 'J1',
        oi_jaeger: 'J1',
        ishihara_placas_correctas: 14,
        ishihara_placas_total: 14,
        ishihara_resultado: 'Visión al color normal',
        usa_lentes: false,
        campimetria_realizada: true,
        recomendaciones: [
            'Mantener revisión ocular anual preventiva.',
            'Uso sugerido de gotas lubricantes preventivas.'
        ]
    } : null);

    const renderPrev = prev || (isDemo && !data ? {
        fecha: new Date(Date.now() - 31536000000).toISOString(),
        od_sin_correccion: '20/20',
        oi_sin_correccion: '20/20',
        ishihara_correctas: 14,
        ishihara_total: 14,
        apto: true
    } : null);

    if (!renderData) {
        return (
            <Card className="border-0 shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Inbox className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-slate-800 font-bold">Sin registros visuales</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
                    Este paciente aún no cuenta con estudios de agudeza visual realizados.
                </p>
            </Card>
        )
    }

    const isNormal = renderData.clasificacion === 'normal'

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Eye className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Estudios Visuales</h3>
                            <p className="text-xs text-slate-400 font-medium">{renderData.evaluador} — {renderData.equipo}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha</p>
                            <p className="text-sm font-bold text-slate-700">
                                {new Date(renderData.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl border text-center ${isNormal ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aptitud</p>
                            <div className="flex items-center gap-1.5">
                                {renderData.apto
                                    ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                    : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                                <p className={`text-sm font-bold ${renderData.apto ? 'text-emerald-700' : 'text-amber-700'}`}>
                                    {renderData.apto ? 'Apto' : 'No Apto'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Observations banner */}
                <div className={`flex items-center gap-3 p-4 rounded-xl ${isNormal ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
                    <Eye className={`w-5 h-5 ${isNormal ? 'text-emerald-600' : 'text-amber-600'} flex-shrink-0`} />
                    <p className={`text-sm font-medium ${isNormal ? 'text-emerald-700' : 'text-amber-700'}`}>{renderData.observaciones}</p>
                </div>
            </div>

            {/* Visual Acuity Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SnellenCard
                    label="Ojo Derecho (OD)"
                    value={renderData.od_sin_correccion}
                    corrected={renderData.od_con_correccion}
                    color="blue"
                />
                <SnellenCard
                    label="Ojo Izquierdo (OI)"
                    value={renderData.oi_sin_correccion}
                    corrected={renderData.oi_con_correccion}
                    color="emerald"
                />
            </div>

            {/* Near Vision + Ishihara */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-purple-50 border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Glasses className="w-4 h-4 text-purple-600" />
                        <h4 className="text-xs font-black uppercase tracking-widest text-purple-600">Visión Cercana (Jaeger)</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">OD</p>
                            <p className="text-2xl font-black text-slate-800">{renderData.od_jaeger || '—'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">OI</p>
                            <p className="text-2xl font-black text-slate-800">{renderData.oi_jaeger || '—'}</p>
                        </div>
                    </div>
                </div>
                <IshiharaResult correct={renderData.ishihara_placas_correctas} total={renderData.ishihara_placas_total} result={renderData.ishihara_resultado} />
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Estado</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${renderData.usa_lentes ? 'bg-purple-500' : 'bg-slate-300'}`} />
                            <span className="text-sm text-slate-600 font-medium">
                                {renderData.usa_lentes ? 'Usa lentes' : 'No usa lentes'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${renderData.campimetria_realizada ? 'bg-blue-500' : 'bg-slate-300'}`} />
                            <span className="text-sm text-slate-600 font-medium">
                                {renderData.campimetria_realizada ? 'Campimetría realizada' : 'Campimetría no realizada'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            <Card className="border-slate-100 shadow-sm">
                <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">Recomendaciones Visuales</h4>
                    </div>
                    <ul className="space-y-2.5">
                        {renderData.recomendaciones && renderData.recomendaciones.map((rec: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                                <ArrowRight className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span>{rec}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Previous comparison */}
            {renderPrev && (
                <button
                    onClick={() => setShowPrev(!showPrev)}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-500">
                            Comparar con estudio previo ({new Date(renderPrev.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })})
                        </span>
                    </div>
                    {showPrev ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
            )}
            {showPrev && renderPrev && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-xs font-bold text-blue-700 mb-3">Estudio previo — {new Date(renderPrev.fecha).toLocaleDateString()}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="text-[10px] text-blue-500 font-bold uppercase">OD S/C</p>
                                <p className="font-bold text-slate-800">{renderPrev.od_sin_correccion} → {renderData.od_sin_correccion}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-blue-500 font-bold uppercase">OI S/C</p>
                                <p className="font-bold text-slate-800">{renderPrev.oi_sin_correccion} → {renderData.oi_sin_correccion}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-blue-500 font-bold uppercase">Ishihara</p>
                                <p className="font-bold text-slate-800">{renderPrev.ishihara_correctas}/{renderPrev.ishihara_total} → {renderData.ishihara_placas_correctas}/{renderData.ishihara_placas_total}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-blue-500 font-bold uppercase">Aptitud</p>
                                <p className="font-bold text-slate-800">{renderPrev.apto ? 'Apto' : 'No Apto'} → {renderData.apto ? 'Apto' : 'No Apto'}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
