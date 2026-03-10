/**
 * RayosXTab — Scanner fiel + Análisis IA
 * Sección 1: Reporte radiológico completo (región, técnica, clasificación OIT, hallazgos, impresión)
 * Sección 2: Visualización anatómica SVG, clasificación ILO, análisis IA sin límite
 */
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Bone, CheckCircle, AlertTriangle, Shield, Brain, FileText,
    Image as ImageIcon, Zap, ArrowRight, Calendar, User, Loader2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { getExpedienteDemoCompleto } from '@/data/demoPacienteCompleto'
import DocumentosAdjuntos from '@/components/expediente/DocumentosAdjuntos'
import EstudioUploadReview from '@/components/expediente/EstudioUploadReview'

const RESULTADO_STYLES: Record<string, { bg: string; text: string; border: string; label: string; gradient: string }> = {
    normal: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Normal', gradient: 'from-emerald-500 to-teal-600' },
    anormal: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Anormal', gradient: 'from-amber-500 to-orange-600' },
    critico: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Crítico', gradient: 'from-red-500 to-rose-600' },
}

function buildFromResultados(estudio: any, resultados: any[]): any {
    const get = (name: string): any => {
        const r = resultados.find(r => r.parametro_nombre === name)
        return r?.resultado ?? r?.resultado_numerico ?? null
    }
    const resultado_raw = (get('RESULTADO') || get('CLASIFICACION') || estudio.diagnostico || 'normal').toLowerCase()
    const resultado = resultado_raw.includes('normal') || resultado_raw === '0/0' ? 'normal'
        : resultado_raw.includes('criti') ? 'critico' : 'anormal'

    return {
        id: estudio.id,
        fecha: estudio.fecha_estudio,
        resultado,
        region: get('REGION_ANATOMICA') || get('REGION') || 'Tórax',
        tipo_proyeccion: get('TIPO_PROYECCION') || get('PROYECCION') || 'PA y lateral',
        tipo_estudio: get('TIPO_ESTUDIO') || 'Radiografía',
        tecnica: get('TECNICA') || '',
        clasificacion_ilo: get('CLASIFICACION_ILO') || get('CLASIFICACION_OIT') || get('ILO') || '',
        profusion: get('PROFUSION_OPACIDADES') || '',
        tipo_opacidades: get('TIPO_OPACIDADES') || '',
        hallazgos: get('HALLAZGOS') || get('DESCRIPCION') || estudio.interpretacion || '',
        impresion: get('IMPRESION_DIAGNOSTICA') || get('CONCLUSION') || estudio.diagnostico || '',
        recomendacion: get('RECOMENDACION') || '',
        tecnico: get('MEDICO_RESPONSABLE') || estudio.medico_responsable || '',
        equipo: get('EQUIPO') || estudio.equipo || '',
        tiene_imagen: get('TIENE_IMAGEN') === 'true' || get('TIENE_IMAGEN') === true,
        rawResults: resultados,
    }
}

// ─────────────────────────────────────────────
// COMPONENTE: Silueta tórax SVG simplificada
// ─────────────────────────────────────────────
function ToraxVisor({ resultado, hallazgos }: { resultado: string; hallazgos: string }) {
    const isNormal = resultado === 'normal'
    const color = isNormal ? '#10b981' : '#f59e0b'
    const pulmonColor = isNormal ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.15)'

    return (
        <div className="bg-slate-900 rounded-2xl p-4 flex flex-col items-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">Vista Radiológica — AP Tórax</p>
            <svg viewBox="0 0 220 260" className="w-48 h-auto">
                {/* Caja torácica */}
                {[30, 50, 70, 90, 110, 130].map((y, i) => (
                    <g key={i}>
                        <path d={`M 50 ${y} Q 35 ${y + 10} 32 ${y + 22}`} fill="none" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
                        <path d={`M 170 ${y} Q 185 ${y + 10} 188 ${y + 22}`} fill="none" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
                    </g>
                ))}
                {/* Columna */}
                <rect x="103" y="20" width="14" height="200" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                    <rect key={i} x="101" y={26 + i * 20} width="18" height="14" rx="3" fill="#334155" />
                ))}
                {/* Pulmón derecho */}
                <motion.path d="M 55 40 Q 45 50 44 100 Q 44 160 75 180 Q 95 190 100 170 L 100 40 Z"
                    fill={pulmonColor} stroke={color} strokeWidth="1.5"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
                {/* Pulmón izquierdo */}
                <motion.path d="M 165 40 Q 175 50 176 100 Q 176 160 145 180 Q 125 190 120 170 L 120 40 Z"
                    fill={pulmonColor} stroke={color} strokeWidth="1.5"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }} />
                {/* Corazón */}
                <motion.ellipse cx="110" cy="140" rx="22" ry="28" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1"
                    animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                {/* Clavículas */}
                <path d="M 60 35 Q 90 28 110 30" fill="none" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
                <path d="M 160 35 Q 130 28 110 30" fill="none" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
                {/* Diafragma */}
                <path d="M 45 185 Q 110 200 175 185" fill="none" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
                {/* Marcadores de hallazgos si anormal */}
                {!isNormal && (
                    <motion.circle cx="75" cy="90" r="8" fill="rgba(245,158,11,0.3)" stroke="#f59e0b" strokeWidth="1.5"
                        animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} />
                )}
                {/* Labels */}
                <text x="70" y="215" textAnchor="middle" fontSize="8" fontWeight="800" fill="#475569">D</text>
                <text x="150" y="215" textAnchor="middle" fontSize="8" fontWeight="800" fill="#475569">I</text>
                <text x="110" y="235" textAnchor="middle" fontSize="8" fontWeight="800" fill="#475569">AP Tórax</text>
            </svg>
            <div className={`mt-3 px-4 py-2 rounded-xl text-center ${isNormal ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                <p className={`text-xs font-black ${isNormal ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isNormal ? '✓ Sin opacidades patológicas' : '⚠ Hallazgos descritos en reporte'}
                </p>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function RayosXTab({ pacienteId }: { pacienteId: string }) {
    const [loading, setLoading] = useState(true)
    const [estudios, setEstudios] = useState<any[]>([])
    const [selectedIdx, setSelectedIdx] = useState(0)
    const [activeSection, setActiveSection] = useState<'scanner' | 'analisis'>('scanner')

    useEffect(() => { if (pacienteId) loadData() }, [pacienteId])

    const loadData = async () => {
        try {
            setLoading(true)
            const all: any[] = []

            // FUENTE 1: Nueva arquitectura
            const { data: estudiosDB } = await supabase
                .from('estudios_clinicos').select('*')
                .eq('paciente_id', pacienteId)
                .in('tipo_estudio', ['radiografia', 'rayos_x', 'rx'])
                .order('fecha_estudio', { ascending: false }).limit(5)

            if (estudiosDB && estudiosDB.length > 0) {
                for (const est of estudiosDB) {
                    const { data: res } = await supabase.from('resultados_estudio').select('*').eq('estudio_id', est.id)
                    if (res && res.length > 0) { all.push(buildFromResultados(est, res)); continue }
                    all.push({
                        id: est.id, fecha: est.fecha_estudio,
                        resultado: est.diagnostico?.toLowerCase().includes('normal') ? 'normal' : 'anormal',
                        region: est.datos_extra?.region_anatomica || 'Tórax',
                        tipo_proyeccion: 'PA y lateral', tipo_estudio: 'Radiografía',
                        hallazgos: est.datos_extra?.hallazgos || '', impresion: est.interpretacion || est.diagnostico || '',
                        clasificacion_ilo: est.datos_extra?.clasificacion_oit || '',
                        tecnico: est.medico_responsable || '', equipo: est.equipo || '', tiene_imagen: false,
                    })
                }
            }

            // FUENTE 2: radiografias legacy
            if (all.length === 0) {
                const { data: legacy } = await supabase.from('radiografias').select('*').eq('paciente_id', pacienteId).order('created_at', { ascending: false }).limit(3)
                if (legacy && legacy.length > 0) {
                    legacy.forEach((r: any) => all.push({
                        id: r.id, fecha: r.fecha_estudio || r.fecha, resultado: r.resultado || 'normal',
                        region: r.region || 'Tórax', tipo_proyeccion: r.tipo_proyeccion || 'PA y lateral',
                        tipo_estudio: r.tipo_estudio || 'Radiografía', hallazgos: r.hallazgos || '',
                        impresion: r.impresion || '', clasificacion_ilo: r.clasificacion_ilo || '',
                        profusion: r.profusion || '', tecnico: r.tecnico || '', equipo: r.equipo || '', tiene_imagen: !!r.imagen_url,
                    }))
                }
            }

            // Demo
            if (all.length === 0 && pacienteId?.startsWith('demo')) {
                const demo = getExpedienteDemoCompleto()
                const demoRx = (demo as any).radiografias
                if (demoRx) all.push(...(Array.isArray(demoRx) ? demoRx : [demoRx]))
            }
            setEstudios(all)
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                <Bone className="w-8 h-8 text-slate-400" />
            </motion.div>
            <p className="text-slate-400 text-xs font-medium">Cargando estudios radiológicos...</p>
        </div>
    )

    if (estudios.length === 0) return (
        <Card className="border-0 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bone className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-slate-800 font-bold">Sin estudios radiológicos</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2 mb-6">
                Sube la imagen de la radiografía y/o su reporte de interpretación. El sistema extrae todos los datos disponibles.
            </p>
            <div className="w-full">
                <EstudioUploadReview pacienteId={pacienteId} tipoEstudio="radiografia" onSaved={loadData} />
            </div>
        </Card>
    )

    const rx = estudios[selectedIdx] || estudios[0]
    const resStyle = RESULTADO_STYLES[rx.resultado] || RESULTADO_STYLES.normal
    const isNormal = rx.resultado === 'normal'

    const alertas: string[] = []
    if (!isNormal && rx.impresion) alertas.push(rx.impresion)
    if (rx.clasificacion_ilo && rx.clasificacion_ilo !== '0/0') alertas.push(`Clasificación ILO: ${rx.clasificacion_ilo}`)
    if (rx.profusion) alertas.push(`Profusión: ${rx.profusion}`)

    return (
        <div className="space-y-5">

            {/* HEADER */}
            <div className={`bg-white rounded-2xl border shadow-sm p-5 ${isNormal ? 'border-slate-100' : 'border-amber-100'}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${resStyle.gradient} flex items-center justify-center shadow-lg`}>
                            <Bone className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">{rx.tipo_estudio || 'Radiografía'}</h3>
                            <p className="text-xs text-slate-400 font-medium">{rx.region} — {rx.tipo_proyeccion}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <EstudioUploadReview pacienteId={pacienteId} tipoEstudio="radiografia" onSaved={loadData} isCompact />
                        <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Fecha</p>
                            <p className="text-sm font-bold text-slate-700">
                                {rx.fecha ? new Date(rx.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                            </p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl border ${resStyle.bg} ${resStyle.border}`}>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Resultado</p>
                            <div className="flex items-center gap-1.5">
                                {isNormal ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                                <p className={`text-sm font-bold ${resStyle.text}`}>{resStyle.label}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {rx.impresion && (
                    <div className={`mt-4 p-3 rounded-xl border ${resStyle.bg} ${resStyle.border}`}>
                        <p className={`text-sm font-medium ${resStyle.text}`}>{rx.impresion}</p>
                    </div>
                )}

                {!isNormal && alertas.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                        {alertas.map((a, i) => (
                            <motion.div key={i} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.07 }}
                                className="flex items-start gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
                                <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs font-medium text-amber-700">{a}</p>
                            </motion.div>
                        ))}
                    </div>
                )}

                {estudios.length > 1 && (
                    <div className="mt-4 flex gap-2 flex-wrap">
                        {estudios.map((e, i) => (
                            <button key={e.id} onClick={() => setSelectedIdx(i)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${i === selectedIdx ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
                                {e.region} — {e.fecha ? new Date(e.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' }) : `Estudio ${i + 1}`}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* TABS */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
                {(['scanner', 'analisis'] as const).map(s => (
                    <button key={s} onClick={() => setActiveSection(s)}
                        className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeSection === s ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        {s === 'scanner' ? '📋 Vista Escáner' : '🧠 Análisis IA'}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">

                {/* ESCÁNER */}
                {activeSection === 'scanner' && (
                    <motion.div key="sc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">

                        {/* Ficha del estudio */}
                        <Card className="border-slate-100 shadow-sm overflow-hidden">
                            <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Reporte Radiológico</p>
                            </div>
                            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {[
                                    { label: 'Región Anatómica', val: rx.region },
                                    { label: 'Proyección', val: rx.tipo_proyeccion },
                                    { label: 'Tipo de Estudio', val: rx.tipo_estudio },
                                    { label: 'Técnica', val: rx.tecnica },
                                    { label: 'Clasificación ILO/OIT', val: rx.clasificacion_ilo },
                                    { label: 'Profusión Opacidades', val: rx.profusion },
                                    { label: 'Tipo Opacidades', val: rx.tipo_opacidades },
                                    { label: 'Médico Radiólogo', val: rx.tecnico },
                                    { label: 'Equipo', val: rx.equipo },
                                ].filter(d => d.val).map(({ label, val }) => (
                                    <div key={label} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                                        <p className="text-xs font-bold text-slate-700 mt-0.5 leading-relaxed">{val}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Hallazgos */}
                        {rx.hallazgos && (
                            <div className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Descripción / Hallazgos Radiológicos</p>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{rx.hallazgos}</p>
                            </div>
                        )}

                        {/* Impresión diagnóstica */}
                        {rx.impresion && (
                            <div className={`p-5 rounded-xl border ${resStyle.bg} ${resStyle.border}`}>
                                <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${resStyle.text}`}>Impresión Diagnóstica</p>
                                <p className="text-sm text-slate-700 font-medium leading-relaxed">{rx.impresion}</p>
                            </div>
                        )}

                        {/* Recomendación */}
                        {rx.recomendacion && (
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-1">Recomendación</p>
                                <p className="text-sm text-slate-700">{rx.recomendacion}</p>
                            </div>
                        )}

                        <DocumentosAdjuntos pacienteId={pacienteId} categoria="radiografia" titulo="Imagen y Reporte Radiológico" collapsedByDefault={false} />
                    </motion.div>
                )}

                {/* ANÁLISIS IA */}
                {activeSection === 'analisis' && (
                    <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">

                        {/* Header IA */}
                        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 text-white">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><Brain className="w-5 h-5" /></div>
                                <div>
                                    <p className="font-black text-sm">Análisis Radiológico IA</p>
                                    <p className="text-slate-400 text-xs">Interpretación clínica sin límite — {rx.region}</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">{rx.impresion || rx.hallazgos || `${rx.tipo_estudio} de ${rx.region}. ${isNormal ? 'Sin alteraciones radiológicas significativas.' : 'Hallazgos descritos en reporte.'}`}</p>
                        </div>

                        {/* Visor tórax SVG */}
                        {(rx.region || '').toLowerCase().includes('tór') || !rx.region ? (
                            <ToraxVisor resultado={rx.resultado} hallazgos={rx.hallazgos} />
                        ) : null}

                        {/* Clasificación ILO */}
                        {rx.clasificacion_ilo && (
                            <Card className="border-slate-100 shadow-sm">
                                <CardContent className="p-5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Clasificación ILO/OIT Neumoconiosis</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: 'Clasificación', val: rx.clasificacion_ilo },
                                            { label: 'Profusión', val: rx.profusion || '—' },
                                            { label: 'Tipo Opacidades', val: rx.tipo_opacidades || '—' },
                                        ].map(({ label, val }) => (
                                            <div key={label} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                                <p className="text-[9px] font-black uppercase text-slate-400">{label}</p>
                                                <p className="text-lg font-black text-slate-800 mt-1">{val}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={`mt-3 p-3 rounded-xl border ${rx.clasificacion_ilo === '0/0' || rx.clasificacion_ilo === '0' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                                        <p className="text-xs text-slate-700 leading-relaxed">
                                            <strong>Clasificación ILO {rx.clasificacion_ilo}</strong> —{' '}
                                            {rx.clasificacion_ilo === '0/0' || rx.clasificacion_ilo === '0'
                                                ? 'Sin evidencia de neumoconiosis. Pulmones sin opacidades de origen ocupacional.'
                                                : 'Se detectan opacidades compatibles con neumoconiosis según criterios ILO/OIT. Requiere valoración por medicina del trabajo y neumólogo.'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Interpretación completa */}
                        <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-slate-50 to-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Brain className="w-4 h-4 text-slate-600" />
                                    <p className="text-sm font-black text-slate-800 uppercase">Interpretación Radiológica Completa</p>
                                </div>
                                <div className="space-y-3">
                                    {rx.hallazgos && (
                                        <div className="p-3 bg-white rounded-xl border border-slate-200">
                                            <p className="font-black text-slate-600 text-xs uppercase mb-1">Descripción Detallada</p>
                                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{rx.hallazgos}</p>
                                        </div>
                                    )}
                                    <div className={`p-4 rounded-xl border ${isNormal ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                                        <p className={`font-black text-xs uppercase mb-2 ${isNormal ? 'text-emerald-700' : 'text-amber-700'}`}>Conclusión</p>
                                        <p className="text-sm text-slate-700 leading-relaxed">
                                            {rx.impresion || (isNormal
                                                ? `${rx.tipo_estudio} de ${rx.region} sin alteraciones radiológicas patológicas. ${rx.tipo_proyeccion} dentro de límites normales para la edad y sexo del paciente.`
                                                : 'Se identificaron hallazgos radiológicos que requieren correlación clínica y seguimiento especializado.')}
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-xl border ${isNormal ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                                        <p className={`font-black text-xs uppercase mb-1 ${isNormal ? 'text-emerald-700' : 'text-amber-700'}`}>Aptitud Laboral</p>
                                        <p className="text-sm text-slate-700">
                                            {isNormal
                                                ? 'Sin contraindicación radiológica para puesto laboral actual. Control radiológico según protocolo de vigilancia.'
                                                : 'Los hallazgos radiológicos requieren evaluación especializada antes de determinar aptitud laboral definitiva. Posible restricción de exposición a agentes neumotóxicos.'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-emerald-100 shadow-sm">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-3"><Shield className="w-4 h-4 text-emerald-500" /><p className="text-sm font-black text-slate-800 uppercase">Recomendaciones</p></div>
                                <ul className="space-y-2">
                                    {[
                                        isNormal ? 'Control radiológico periódico según NOM y protocolo empresarial' : 'Valoración por neumólogo / radiólogo especialista',
                                        !isNormal && 'Restricción preventiva de exposición a polvos y agentes neumotóxicos',
                                        rx.recomendacion,
                                    ].filter(Boolean).map((r, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                            <ArrowRight className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /><span>{r as string}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
