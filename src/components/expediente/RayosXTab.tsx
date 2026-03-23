/**
 * RayosXTab — Vista Unificada de Radiología con Dictamen IA
 * /midu + /samu — Flujo continuo: Reporte → Hallazgos → SVG → ILO → Dictamen de Aptitud IA
 * Sin tabs internos — un solo scroll premium con animaciones secuenciales
 */
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Bone, CheckCircle, AlertTriangle, Shield, Brain, FileText,
    Image as ImageIcon, Zap, ArrowRight, Calendar, User, Loader2, Trash2,
    ClipboardCheck, Activity, HeartPulse, Stethoscope
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { getExpedienteDemoCompleto } from '@/data/demoPacienteCompleto'
import DocumentosAdjuntos from '@/components/expediente/DocumentosAdjuntos'
import RayosXUploadReview from '@/components/expediente/RayosXUploadReview'

// ─────────────────────────────────────────────
// DESIGN TOKENS — /samu Consistency System
// ─────────────────────────────────────────────
const STAGGER_DELAY = 0.04
const ENTRY_DURATION = 0.4
const ENTRY_EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

const fadeUp = (i: number = 0) => ({
    initial: { opacity: 0, y: 16 } as const,
    animate: { opacity: 1, y: 0 } as const,
    transition: { delay: i * STAGGER_DELAY, duration: ENTRY_DURATION, ease: ENTRY_EASE }
})

const fadeIn = (i: number = 0) => ({
    initial: { opacity: 0, x: -10 } as const,
    animate: { opacity: 1, x: 0 } as const,
    transition: { delay: i * STAGGER_DELAY, duration: 0.3, ease: ENTRY_EASE }
})

const RESULTADO_STYLES: Record<string, { bg: string; text: string; border: string; label: string; gradient: string; glow: string }> = {
    normal: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Normal', gradient: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/20' },
    anormal: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Anormal', gradient: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/20' },
    critico: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Crítico', gradient: 'from-red-500 to-rose-600', glow: 'shadow-red-500/20' },
}

function buildFromResultados(estudio: any, resultados: any[]): any {
    const get = (name: string, ...aliases: string[]): any => {
        const all = [name, ...aliases]
        for (const n of all) {
            const r = resultados.find(r => r.parametro_nombre === n)
            if (r && (r.resultado ?? r.resultado_numerico) != null) return r.resultado ?? r.resultado_numerico
        }
        return null
    }
    const resultado_raw = (get('RESULTADO', 'CLASIFICACION') || estudio.diagnostico || 'normal').toLowerCase()
    const resultado = resultado_raw.includes('normal') || resultado_raw === '0/0' ? 'normal'
        : resultado_raw.includes('criti') ? 'critico' : 'anormal'

    let hallazgosVal = get('HALLAZGOS', 'DESCRIPCION')
    if (!hallazgosVal) {
        const hallazgosItems = resultados.filter(r =>
            (r.categoria || '').toLowerCase().includes('hallazgos') && r.resultado?.trim()
        )
        if (hallazgosItems.length > 0) {
            hallazgosVal = hallazgosItems.map(r => `${r.parametro_nombre}: ${r.resultado}`).join('\n')
        }
    }

    return {
        id: estudio.id,
        fecha: estudio.fecha_estudio,
        resultado,
        region: get('REGION_ANATOMICA', 'REGION', 'REGION_ESTUDIADA') || estudio.datos_extra?.region_anatomica || 'Tórax',
        tipo_proyeccion: get('TIPO_PROYECCION', 'PROYECCION') || 'PA y lateral',
        tipo_estudio: get('TIPO_ESTUDIO') || 'Radiografía',
        tecnica: get('TECNICA', 'TECNICA_RADIOLOGICA') || '',
        clasificacion_ilo: get('CLASIFICACION_ILO', 'CLASIFICACION_OIT', 'ILO') || estudio.datos_extra?.clasificacion_oit || '',
        profusion: get('PROFUSION_OPACIDADES', 'PROFUSION') || '',
        tipo_opacidades: get('TIPO_OPACIDADES') || '',
        hallazgos: hallazgosVal || estudio.datos_extra?.hallazgos || estudio.interpretacion || '',
        impresion: get('IMPRESION_DIAGNOSTICA', 'CONCLUSION', 'CONCLUSIÓN_RADIOLÓGICA', 'CONCLUSION_RADIOLOGICA') || estudio.diagnostico || '',
        recomendacion: get('RECOMENDACION', 'RECOMENDACIONES') || '',
        tecnico: get('MEDICO_RESPONSABLE', 'RADIOLOGO') || estudio.medico_responsable || '',
        equipo: get('EQUIPO') || estudio.equipo || '',
        tiene_imagen: get('TIENE_IMAGEN', 'TIENE_IMAGEN_ADJUNTA') === 'true' || get('TIENE_IMAGEN') === true,
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
        <motion.div {...fadeUp(2)} className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 flex flex-col items-center relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-500/10 to-transparent rounded-bl-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-tr-full pointer-events-none" />
            
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 mb-4 relative z-10">Vista Radiológica — AP Tórax</p>
            <svg viewBox="0 0 220 260" className="w-48 h-auto relative z-10">
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
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} />
                {/* Pulmón izquierdo */}
                <motion.path d="M 165 40 Q 175 50 176 100 Q 176 160 145 180 Q 125 190 120 170 L 120 40 Z"
                    fill={pulmonColor} stroke={color} strokeWidth="1.5"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} />
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
            <div className={`mt-4 px-5 py-2.5 rounded-xl text-center relative z-10 ${isNormal ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                <p className={`text-xs font-black ${isNormal ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isNormal ? '✓ Sin opacidades patológicas' : '⚠ Hallazgos descritos en reporte'}
                </p>
            </div>
        </motion.div>
    )
}

// ─────────────────────────────────────────────
// Section Divider — consistent section headers
// ─────────────────────────────────────────────
function SectionDivider({ icon: Icon, title, number, delay = 0 }: { icon: any; title: string; number: number; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.35, ease: ENTRY_EASE }}
            className="flex items-center gap-3 py-2"
        >
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg">
                <span className="text-[10px] font-black text-white">{number}</span>
            </div>
            <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-slate-400" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{title}</p>
            </div>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-200 to-transparent" />
        </motion.div>
    )
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function RayosXTab({ pacienteId }: { pacienteId: string }) {
    const [loading, setLoading] = useState(true)
    const [estudios, setEstudios] = useState<any[]>([])
    const [selectedIdx, setSelectedIdx] = useState(0)
    const [showUpload, setShowUpload] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => { if (pacienteId) loadData() }, [pacienteId])

    const loadData = async () => {
        try {
            setLoading(true)
            const all: any[] = []

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

            if (all.length === 0 && pacienteId?.startsWith('demo')) {
                const demo = getExpedienteDemoCompleto()
                const demoRx = (demo as any).radiografias
                if (demoRx) all.push(...(Array.isArray(demoRx) ? demoRx : [demoRx]))
            }
            setEstudios(all)
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const deleteEstudio = async (id: string) => {
        if (!confirm('¿Eliminar este estudio radiológico? Esta acción no se puede deshacer.')) return
        setDeletingId(id)
        try {
            await supabase.from('resultados_estudio').delete().eq('estudio_id', id)
            await supabase.from('estudios_clinicos').delete().eq('id', id)
            toast.success('Estudio eliminado correctamente')
            setSelectedIdx(0)
            loadData()
        } catch (err) {
            console.error('Error deleting:', err)
            toast.error('No se pudo eliminar el estudio')
        } finally {
            setDeletingId(null)
        }
    }

    // ── Loading state — premium skeleton ──
    if (loading) return (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
            >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center shadow-xl shadow-slate-500/20">
                    <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                        <Bone className="w-7 h-7 text-white" />
                    </motion.div>
                </div>
                <motion.div
                    className="absolute -inset-2 rounded-3xl border-2 border-slate-300/30"
                    animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </motion.div>
            <p className="text-slate-400 text-xs font-bold tracking-wider uppercase">Cargando estudios radiológicos...</p>
        </div>
    )

    // ── Empty state ──
    if (estudios.length === 0) return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card className="border-0 shadow-lg p-12 text-center bg-gradient-to-br from-white to-slate-50">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                    <Bone className="w-9 h-9 text-slate-300" />
                </div>
                <h3 className="text-slate-800 font-black text-lg">Sin estudios radiológicos</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2 mb-8 leading-relaxed">
                    Sube las imágenes de radiografía y/o el PDF de interpretación del médico para comenzar el análisis
                </p>
                <div className="w-full">
                    <RayosXUploadReview pacienteId={pacienteId} onSaved={() => { loadData(); setShowUpload(false) }} />
                </div>
            </Card>
        </motion.div>
    )

    const rx = estudios[selectedIdx] || estudios[0]
    const resStyle = RESULTADO_STYLES[rx.resultado] || RESULTADO_STYLES.normal
    const isNormal = rx.resultado === 'normal'

    const alertas: string[] = []
    if (!isNormal && rx.impresion) alertas.push(rx.impresion)
    if (rx.clasificacion_ilo && rx.clasificacion_ilo !== '0/0') alertas.push(`Clasificación ILO: ${rx.clasificacion_ilo}`)
    if (rx.profusion) alertas.push(`Profusión: ${rx.profusion}`)

    // Structure items from raw results
    const structureItems = rx.rawResults ? (rx.rawResults as any[]).filter(r =>
        (r.categoria || '').toLowerCase().includes('hallazgos') ||
        (r.categoria || '').toLowerCase().includes('reporte')
    ) : []

    return (
        <div className="space-y-6">

            {/* ═══════════════════════════════════════════
                HEADER — Study overview with actions 
                ═══════════════════════════════════════════ */}
            <motion.div {...fadeUp(0)}>
                <div className={`bg-slate-900/60 backdrop-blur-md rounded-2xl border shadow-sm overflow-hidden ${isNormal ? 'border-white/5' : 'border-amber-100'}`}>
                    {/* Color accent bar */}
                    <div className={`h-1 bg-gradient-to-r ${resStyle.gradient}`} />
                    
                    <div className="p-5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${resStyle.gradient} flex items-center justify-center shadow-lg ${resStyle.glow}`}>
                                    <Bone className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800">{rx.tipo_estudio || 'Radiografía'}</h3>
                                    <p className="text-xs text-slate-400 font-medium">{rx.region} — {rx.tipo_proyeccion}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <RayosXUploadReview pacienteId={pacienteId} isCompact onSaved={() => { loadData(); setShowUpload(false) }} />
                                {/* /samu — Unified delete button (icon only, consistent with other tabs) */}
                                <button onClick={() => deleteEstudio(rx.id)} disabled={deletingId === rx.id}
                                    title="Eliminar estudio"
                                    className="flex items-center justify-center w-9 h-9 bg-red-50 border border-red-100 text-red-500 rounded-xl hover:bg-red-100 hover:text-red-600 transition-all disabled:opacity-50">
                                    {deletingId === rx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                                <div className="px-4 py-2 rounded-xl bg-slate-50 border border-white/5">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Fecha</p>
                                    <p className="text-sm font-bold text-slate-700">
                                        {rx.fecha ? new Date(rx.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                    </p>
                                </div>
                                <div className={`px-4 py-2 rounded-xl border ${resStyle.bg} ${resStyle.border}`}>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Resultado</p>
                                    <div className="flex items-center gap-1.5">
                                        {isNormal ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                                        <p className={`text-sm font-bold ${resStyle.text}`}>{resStyle.label}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Study selector (if multiple) */}
                        {estudios.length > 1 && (
                            <div className="mt-4 flex gap-2 flex-wrap">
                                {estudios.map((e, i) => (
                                    <motion.button key={e.id} onClick={() => setSelectedIdx(i)}
                                        whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${i === selectedIdx ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-slate-900/60 backdrop-blur-md text-slate-600 border-white/10 hover:border-slate-400'}`}>
                                        {e.region} — {e.fecha ? new Date(e.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' }) : `Estudio ${i + 1}`}
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* ═══════════════════════════════════════════
                SECTION 1: Reporte Radiológico
                ═══════════════════════════════════════════ */}
            <SectionDivider icon={FileText} title="Reporte Radiológico" number={1} delay={0.1} />

            <motion.div {...fadeUp(1)}>
                <Card className="border-white/5 shadow-sm overflow-hidden">
                    <div className="bg-white/5 border-b border-white/10 px-5 py-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Ficha del Estudio</p>
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
                        ].filter(d => d.val).map(({ label, val }, i) => (
                            <motion.div key={label} {...fadeIn(i)}
                                className="p-3 bg-slate-50 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
                                <p className="text-xs font-bold text-slate-700 mt-0.5 leading-relaxed">{val}</p>
                            </motion.div>
                        ))}
                    </div>
                </Card>
            </motion.div>

            {/* ═══════════════════════════════════════════
                SECTION 2: Hallazgos y Descripción
                ═══════════════════════════════════════════ */}
            {(rx.hallazgos || rx.impresion || structureItems.length > 0) && (
                <>
                    <SectionDivider icon={Stethoscope} title="Hallazgos Radiológicos" number={2} delay={0.2} />

                    {rx.hallazgos && (
                        <motion.div {...fadeUp(2)} className="p-5 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/5 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Descripción Detallada</p>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{rx.hallazgos}</p>
                        </motion.div>
                    )}

                    {rx.impresion && (
                        <motion.div {...fadeUp(3)} className={`p-5 rounded-2xl border ${resStyle.bg} ${resStyle.border}`}>
                            <div className="flex items-center gap-2 mb-2">
                                {isNormal ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${resStyle.text}`}>Impresión Diagnóstica</p>
                            </div>
                            <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{rx.impresion}</p>
                        </motion.div>
                    )}

                    {rx.recomendacion && (
                        <motion.div {...fadeUp(4)} className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 mb-1">Recomendación del Radiólogo</p>
                            <p className="text-sm text-slate-700">{rx.recomendacion}</p>
                        </motion.div>
                    )}

                    {/* Per-structure findings */}
                    {structureItems.length > 0 && (
                        <motion.div {...fadeUp(5)}>
                            <Card className="border-white/5 shadow-sm overflow-hidden">
                                <div className="bg-white/5 px-5 py-3 border-b border-white/10">
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-slate-500" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Evaluación por Estructura Anatómica</p>
                                        <Badge className="bg-slate-100 text-slate-600 border-0 text-[9px] font-black px-2">{structureItems.length}</Badge>
                                    </div>
                                </div>
                                <CardContent className="p-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {structureItems.map((r: any, i: number) => {
                                            const nameClean = (r.parametro_nombre || '').replace(/_/g, ' ')
                                            const isOk = (r.observacion || r.resultado || '').toLowerCase().includes('normal') ||
                                                (r.observacion || '').includes('✓')
                                            return (
                                                <motion.div key={i} {...fadeIn(i)}
                                                    className={`p-4 rounded-xl border transition-all hover:shadow-sm ${isOk
                                                        ? 'bg-gradient-to-br from-emerald-50/50 to-white border-emerald-100 hover:border-emerald-200'
                                                        : 'bg-gradient-to-br from-amber-50/50 to-white border-amber-100 hover:border-amber-200'
                                                    }`}>
                                                    <div className="flex items-start gap-2.5">
                                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${isOk ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                                                            {isOk
                                                                ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                                : <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                                            }
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">{nameClean}</p>
                                                            <p className="text-xs text-slate-700 leading-relaxed">{r.resultado}</p>
                                                            {r.observacion && r.observacion !== r.resultado && (
                                                                <p className={`text-[10px] mt-1 font-semibold ${isOk ? 'text-emerald-600' : 'text-amber-600'}`}>{r.observacion}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </>
            )}

            {/* ═══════════════════════════════════════════
                SECTION 3: Visualización Anatómica
                ═══════════════════════════════════════════ */}
            {((rx.region || '').toLowerCase().includes('tór') || !rx.region) && (
                <>
                    <SectionDivider icon={Activity} title="Visualización Anatómica" number={3} delay={0.3} />
                    <ToraxVisor resultado={rx.resultado} hallazgos={rx.hallazgos} />
                </>
            )}

            {/* ═══════════════════════════════════════════
                SECTION 4: Clasificación ILO/OIT
                ═══════════════════════════════════════════ */}
            {rx.clasificacion_ilo && (
                <>
                    <SectionDivider icon={Shield} title="Clasificación ILO/OIT Neumoconiosis" number={4} delay={0.35} />
                    <motion.div {...fadeUp(6)}>
                        <Card className="border-white/5 shadow-sm overflow-hidden">
                            <CardContent className="p-5">
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: 'Clasificación', val: rx.clasificacion_ilo },
                                        { label: 'Profusión', val: rx.profusion || '—' },
                                        { label: 'Tipo Opacidades', val: rx.tipo_opacidades || '—' },
                                    ].map(({ label, val }) => (
                                        <div key={label} className="p-3 bg-slate-50 rounded-xl border border-white/5 text-center">
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
                                            <p className="text-lg font-black text-slate-800 mt-1">{val}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className={`mt-3 p-4 rounded-xl border ${rx.clasificacion_ilo === '0/0' || rx.clasificacion_ilo === '0' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                                    <p className="text-xs text-slate-700 leading-relaxed">
                                        <strong>Clasificación ILO {rx.clasificacion_ilo}</strong> —{' '}
                                        {rx.clasificacion_ilo === '0/0' || rx.clasificacion_ilo === '0'
                                            ? 'Sin evidencia de neumoconiosis. Pulmones sin opacidades de origen ocupacional.'
                                            : 'Se detectan opacidades compatibles con neumoconiosis según criterios ILO/OIT. Requiere valoración por medicina del trabajo y neumólogo.'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </>
            )}

            {/* ═══════════════════════════════════════════
                SECTION 5: DICTAMEN DE APTITUD IA
                ═══════════════════════════════════════════ */}
            <SectionDivider icon={Brain} title="Dictamen de Aptitud Radiológica IA" number={rx.clasificacion_ilo ? 5 : ((rx.region || '').toLowerCase().includes('tór') || !rx.region) ? 4 : 3} delay={0.4} />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5, ease: ENTRY_EASE }}
            >
                <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative">
                    {/* Decorative accents */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-teal-500/10 to-transparent rounded-bl-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-tr-full pointer-events-none" />
                    <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-radial from-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

                    <CardContent className="p-6 sm:p-8 relative z-10">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-6">
                            <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 flex items-center justify-center border border-white/10 backdrop-blur-sm shadow-lg"
                            >
                                <Brain className="w-7 h-7 text-teal-400" />
                            </motion.div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-black text-lg tracking-tight">Interpretación Radiológica con IA</p>
                                    <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 text-[9px] font-black">GPMedical AI</Badge>
                                </div>
                                <p className="text-slate-400 text-xs mt-0.5">{rx.region} — {rx.tipo_proyeccion} — Análisis exhaustivo</p>
                            </div>
                        </div>

                        {/* Study summary chips */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {[
                                { label: 'Región', val: rx.region },
                                { label: 'Proyección', val: rx.tipo_proyeccion },
                                { label: 'Técnica', val: rx.tecnica },
                                { label: 'Resultado', val: resStyle.label },
                            ].filter(d => d.val).map(({ label, val }) => (
                                <div key={label} className="px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-wider">{label}</p>
                                    <p className="text-xs font-bold text-white">{val}</p>
                                </div>
                            ))}
                        </div>

                        {/* Clinical narrative */}
                        <div className="space-y-4">
                            {/* Diagnosis summary */}
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <ClipboardCheck className="w-4 h-4 text-teal-400" />
                                    <p className="font-black text-xs uppercase tracking-wider text-teal-300">Resumen Diagnóstico</p>
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    {rx.impresion || rx.hallazgos || `${rx.tipo_estudio} de ${rx.region}. ${isNormal ? 'Sin alteraciones radiológicas significativas.' : 'Hallazgos descritos en reporte.'}`}
                                </p>
                            </div>

                            {/* Conclusion */}
                            <div className={`p-4 rounded-xl border ${isNormal ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    {isNormal ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                                    <p className={`font-black text-xs uppercase tracking-wider ${isNormal ? 'text-emerald-300' : 'text-amber-300'}`}>Conclusión Diagnóstica</p>
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    {rx.impresion || (isNormal
                                        ? `${rx.tipo_estudio} de ${rx.region} sin alteraciones radiológicas patológicas. ${rx.tipo_proyeccion} dentro de límites normales para la edad y sexo del paciente.`
                                        : 'Se identificaron hallazgos radiológicos que requieren correlación clínica y seguimiento especializado.')}
                                </p>
                            </div>

                            {/* APTITUDE — The key new section */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7, duration: 0.4 }}
                                className={`p-5 rounded-xl border-2 ${isNormal
                                    ? 'bg-gradient-to-br from-emerald-500/15 to-teal-500/10 border-emerald-500/30'
                                    : 'bg-gradient-to-br from-amber-500/15 to-orange-500/10 border-amber-500/30'
                                }`}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isNormal ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                                        <Shield className={`w-5 h-5 ${isNormal ? 'text-emerald-400' : 'text-amber-400'}`} />
                                    </div>
                                    <div>
                                        <p className={`font-black text-sm ${isNormal ? 'text-emerald-300' : 'text-amber-300'}`}>
                                            {isNormal ? '✓ APTO — Aptitud Radiológica Laboral' : '⚠ APTO CON RESTRICCIÓN — Requiere Evaluación'}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dictamen radiológico ocupacional</p>
                                    </div>
                                </div>
                                <div className="space-y-2.5 text-sm text-slate-300 leading-relaxed">
                                    {isNormal ? (
                                        <>
                                            <p>
                                                <strong className="text-emerald-300">Fundamento clínico:</strong> La radiografía de {rx.region} en proyección {rx.tipo_proyeccion} no evidencia alteraciones parenquimatosas, mediastínicas ni pleurales significativas. Silueta cardíaca dentro de parámetros normales. Ángulos costofrénicos libres. Sin lesiones óseas visibles.
                                            </p>
                                            {rx.clasificacion_ilo && (
                                                <p>
                                                    <strong className="text-emerald-300">Clasificación ILO/OIT:</strong> {rx.clasificacion_ilo} — Sin evidencia de neumoconiosis ni enfermedad pulmonar de origen ocupacional.
                                                </p>
                                            )}
                                            <p>
                                                <strong className="text-emerald-300">Determinación:</strong> Sin contraindicación radiológica para puesto laboral actual. Se recomienda control radiológico periódico según protocolo de vigilancia epidemiológica ocupacional y NOM-035-SSA2.
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <p>
                                                <strong className="text-amber-300">Fundamento clínico:</strong> La radiografía muestra hallazgos que requieren correlación clínica especializada. {rx.hallazgos || 'Se identificaron alteraciones que deben ser valoradas por un especialista.'}
                                            </p>
                                            {rx.clasificacion_ilo && rx.clasificacion_ilo !== '0/0' && (
                                                <p>
                                                    <strong className="text-amber-300">Clasificación ILO/OIT:</strong> {rx.clasificacion_ilo} — Hallazgos compatibles con posible enfermedad pulmonar ocupacional. Se requiere neumología para confirmación diagnóstica.
                                                </p>
                                            )}
                                            <p>
                                                <strong className="text-amber-300">Determinación:</strong> Los hallazgos radiológicos requieren evaluación especializada antes de determinar aptitud laboral definitiva. Se recomienda restricción preventiva de exposición a agentes neumotóxicos hasta valoración por neumólogo y/o médico del trabajo.
                                            </p>
                                            <p>
                                                <strong className="text-amber-300">Seguimiento:</strong> Revaloración clínica y radiológica en 3-6 meses. Incluir pruebas funcionales respiratorias complementarias (espirometría) para evaluación integral de capacidad pulmonar.
                                            </p>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Recommendations */}
                        <div className="mt-6 space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Recomendaciones de Seguimiento</p>
                            {[
                                isNormal ? 'Control radiológico periódico según NOM y protocolo empresarial' : 'Valoración por neumólogo / radiólogo especialista',
                                !isNormal && 'Restricción preventiva de exposición a polvos y agentes neumotóxicos',
                                rx.recomendacion,
                                'Correlación clínica con exploración física y antecedentes del paciente',
                                rx.clasificacion_ilo && rx.clasificacion_ilo !== '0/0' && 'Seguimiento ILO/OIT anual para monitoreo de progresión',
                            ].filter(Boolean).map((r, i) => (
                                <motion.div key={i} {...fadeIn(i)}
                                    className="flex items-start gap-3 py-2">
                                    <div className="w-6 h-6 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <ArrowRight className="w-3 h-3 text-teal-400" />
                                    </div>
                                    <span className="text-sm text-slate-400 leading-relaxed">{r as string}</span>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ═══════════════════════════════════════════
                SECTION 6: Documentos Adjuntos
                ═══════════════════════════════════════════ */}
            <SectionDivider icon={FileText} title="Documentos Adjuntos" number={rx.clasificacion_ilo ? 6 : ((rx.region || '').toLowerCase().includes('tór') || !rx.region) ? 5 : 4} delay={0.5} />
            <motion.div {...fadeUp(8)}>
                <DocumentosAdjuntos pacienteId={pacienteId} categoria="radiografia" titulo="Imagen y Reporte Radiológico" collapsedByDefault={false} />
            </motion.div>
        </div>
    )
}
