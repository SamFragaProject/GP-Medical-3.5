/**
 * AudiometriaTab — Scanner fiel + Análisis IA de máxima representación
 * Sección 1: Replica exacta del formato GP Medical (audiograma, tabla, equipo)
 * Sección 2: Análisis clínico sin límite — gráficas animadas, alertas, interpretación
 *
 * ⚡ /midu — Upload flow unificado con EspirometriaTab:
 * Upload → AudioClone preview → Confirmar → Guardar datos + archivo → Tabs
 */
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Ear, AlertTriangle, CheckCircle, Clock, Shield, RefreshCw,
    ArrowRight, ChevronDown, ChevronUp, Brain, Activity, TrendingUp,
    TrendingDown, Minus, FileText, Zap, Volume2, VolumeX, Info, Download,
    Upload, Loader2, Inbox, X, Save, Eye, Target, Trash2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { getExpedienteDemoCompleto } from '@/data/demoPacienteCompleto'
import DocumentosAdjuntos from '@/components/expediente/DocumentosAdjuntos'
import AudiometryReviewClone from '@/components/expediente/AudiometryReviewClone'
import { analyzeAudiometryDirect } from '@/services/geminiDocumentService'
import { secureStorageService } from '@/services/secureStorageService'
import { useAuth } from '@/contexts/AuthContext'
import { EMPRESA_PRINCIPAL_ID } from '@/config/empresa'

// ── Frecuencias estándar audiograma ──
const FREQS_ALL = ['125', '250', '500', '750', '1000', '1500', '2000', '3000', '4000', '6000', '8000']
const FREQS_PTA = ['500', '1000', '2000', '4000'] // ISO 1999 PTA
const FREQ_LABELS: Record<string, string> = {
    '125': '125', '250': '250', '500': '500', '750': '750',
    '1000': '1K', '1500': '1.5K', '2000': '2K', '3000': '3K',
    '4000': '4K', '6000': '6K', '8000': '8K'
}

const classifyDb = (db: number): { label: string; color: string; bg: string; border: string } => {
    if (db <= 25) return { label: 'Normal', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
    if (db <= 40) return { label: 'Pérdida Leve', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
    if (db <= 55) return { label: 'Pérdida Moderada', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' }
    if (db <= 70) return { label: 'Pérdida Mod-Severa', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' }
    if (db <= 90) return { label: 'Pérdida Severa', color: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500/30' }
    return { label: 'Pérdida Profunda', color: 'text-red-600', bg: 'bg-red-500/30', border: 'border-red-500/40' }
}

const getSemaforo = (pta: number) => {
    if (pta <= 25) return 'verde'
    if (pta <= 40) return 'amarillo'
    return 'rojo'
}
const SEMAFORO_STYLES = {
    verde: { bg: 'bg-emerald-500', ring: 'ring-emerald-500/30', text: 'text-emerald-400', label: 'Normal', bgLight: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    amarillo: { bg: 'bg-amber-500', ring: 'ring-amber-500/30', text: 'text-amber-400', label: 'Vigilancia', bgLight: 'bg-amber-500/10', border: 'border-amber-500/20' },
    rojo: { bg: 'bg-red-500', ring: 'ring-red-500/30', text: 'text-red-400', label: 'Riesgo', bgLight: 'bg-red-500/10', border: 'border-red-500/20' },
}

// ─────────────────────────────────────────────
// COMPONENTE: Audiograma SVG animado
// ─────────────────────────────────────────────
function AudiogramSVG({ od, oi, animated = true }: {
    od: Record<string, number>
    oi: Record<string, number>
    animated?: boolean
}) {
    const W = 500, H = 260
    const PAD_L = 44, PAD_R = 16, PAD_T = 30, PAD_B = 36
    const chartW = W - PAD_L - PAD_R
    const chartH = H - PAD_T - PAD_B
    const dbMin = -10, dbMax = 120

    const xFor = (i: number) => PAD_L + (i / (FREQS_ALL.length - 1)) * chartW
    const yFor = (db: number) => PAD_T + ((db - dbMin) / (dbMax - dbMin)) * chartH

    const zones = [
        { from: -10, to: 25, color: 'rgba(16,185,129,0.07)', label: 'Normal' },
        { from: 25, to: 40, color: 'rgba(251,191,36,0.10)', label: 'Leve' },
        { from: 40, to: 55, color: 'rgba(249,115,22,0.10)', label: 'Moderada' },
        { from: 55, to: 120, color: 'rgba(239,68,68,0.08)', label: 'Severa' },
    ]
    const dbs = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110]

    const odPts = FREQS_ALL.map((f, i) => `${xFor(i)},${yFor(od[f] ?? 0)}`).join(' ')
    const oiPts = FREQS_ALL.map((f, i) => `${xFor(i)},${yFor(oi[f] ?? 0)}`).join(' ')

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-3 overflow-x-auto relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none rounded-2xl" />
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto min-w-[340px] relative z-10">
                {/* Fondos de zona */}
                {zones.map((z, i) => (
                    <rect key={i} x={PAD_L} y={yFor(z.from)} width={chartW}
                        height={Math.max(0, yFor(z.to) - yFor(z.from))} fill={z.color} />
                ))}
                {/* Etiquetas de zona */}
                {zones.map((z, i) => (
                    <text key={`zl-${i}`} x={PAD_L + 6} y={yFor(z.from) + 12}
                        fontSize="6.5" fontWeight="800" fill="rgba(255,255,255,0.4)">{z.label}</text>
                ))}

                {/* Grid horizontal */}
                {dbs.map(db => (
                    <g key={db}>
                        <line x1={PAD_L} y1={yFor(db)} x2={W - PAD_R} y2={yFor(db)}
                            stroke={db % 20 === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}
                            strokeWidth={db % 20 === 0 ? 1 : 0.5} />
                        {db % 10 === 0 && (
                            <text x={PAD_L - 8} y={yFor(db) + 3} textAnchor="end"
                                fontSize="7" fontWeight="700" fill="rgba(255,255,255,0.5)">{db}</text>
                        )}
                    </g>
                ))}

                {/* Grid vertical + etiquetas frecuencia */}
                {FREQS_ALL.map((f, i) => (
                    <g key={f}>
                        <line x1={xFor(i)} y1={PAD_T} x2={xFor(i)} y2={H - PAD_B}
                            stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
                        <text x={xFor(i)} y={H - PAD_B + 16} textAnchor="middle"
                            fontSize="7.5" fontWeight="800" fill="rgba(255,255,255,0.5)">{FREQ_LABELS[f]}</text>
                    </g>
                ))}

                {/* Borde del área de gráfica */}
                <rect x={PAD_L} y={PAD_T} width={chartW} height={chartH}
                    fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

                {/* OD - Oído Derecho (Rojo, círculos) */}
                <motion.polyline
                    points={odPts} fill="none" stroke="#f43f5e" strokeWidth="2.5"
                    strokeLinejoin="round" strokeLinecap="round"
                    initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
                    animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    style={{ filter: 'drop-shadow(0 0 6px rgba(244,63,94,0.6))' }}
                />
                {FREQS_ALL.map((f, i) => (
                    <motion.circle key={`od-${f}`} cx={xFor(i)} cy={yFor(od[f] ?? 0)} r="4.5"
                        fill="#f43f5e" stroke="#1e293b" strokeWidth="2"
                        initial={animated ? { scale: 0 } : undefined}
                        animate={animated ? { scale: 1 } : undefined}
                        transition={{ delay: i * 0.08 + 0.5, duration: 0.3, type: 'spring' }}
                        style={{ filter: 'drop-shadow(0 0 4px rgba(244,63,94,0.8))' }}
                    />
                ))}

                {/* OI - Oído Izquierdo (Azul/Cyan, X) */}
                <motion.polyline
                    points={oiPts} fill="none" stroke="#22d3ee" strokeWidth="2.5"
                    strokeDasharray="7,4" strokeLinejoin="round"
                    initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
                    animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                    style={{ filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.6))' }}
                />
                {FREQS_ALL.map((f, i) => {
                    const cx = xFor(i), cy = yFor(oi[f] ?? 0), r = 4.5
                    return (
                        <motion.g key={`oi-${f}`}
                            initial={animated ? { scale: 0 } : undefined}
                            animate={animated ? { scale: 1 } : undefined}
                            transition={{ delay: i * 0.08 + 0.7, duration: 0.3, type: 'spring' }}
                            style={{ filter: 'drop-shadow(0 0 4px rgba(34,211,238,0.8))' }}
                        >
                            <line x1={cx - r} y1={cy - r} x2={cx + r} y2={cy + r} stroke="#22d3ee" strokeWidth="2.5" />
                            <line x1={cx + r} y1={cy - r} x2={cx - r} y2={cy + r} stroke="#22d3ee" strokeWidth="2.5" />
                        </motion.g>
                    )
                })}

                {/* Eje Y label */}
                <text x={11} y={H / 2} textAnchor="middle" fontSize="7.5" fontWeight="800" fill="rgba(255,255,255,0.4)"
                    transform={`rotate(-90, 11, ${H / 2})`}>dB HL</text>
                {/* Eje X label */}
                <text x={PAD_L + chartW / 2} y={H - 4} textAnchor="middle"
                    fontSize="7.5" fontWeight="800" fill="rgba(255,255,255,0.4)">FRECUENCIA (Hz)</text>

                {/* Leyenda */}
                <circle cx={PAD_L + 6} cy={PAD_T - 12} r="4" fill="#f43f5e" />
                <text x={PAD_L + 14} y={PAD_T - 9} fontSize="8" fontWeight="800" fill="rgba(255,255,255,0.6)">OD — Oído Derecho</text>
                <line x1={PAD_L + 115} y1={PAD_T - 16} x2={PAD_L + 123} y2={PAD_T - 8} stroke="#22d3ee" strokeWidth="2.5" />
                <line x1={PAD_L + 123} y1={PAD_T - 16} x2={PAD_L + 115} y2={PAD_T - 8} stroke="#22d3ee" strokeWidth="2.5" />
                <text x={PAD_L + 130} y={PAD_T - 9} fontSize="8" fontWeight="800" fill="rgba(255,255,255,0.6)">OI — Oído Izquierdo</text>
            </svg>
        </div>
    )
}

// ─────────────────────────────────────────────
// COMPONENTE: Barra animada por frecuencia
// ─────────────────────────────────────────────
function FreqBar({ freq, od, oi, delay = 0 }: { freq: string; od: number; oi: number; delay?: number }) {
    const odClass = classifyDb(od)
    const oiClass = classifyDb(oi)
    const maxDb = 120
    return (
        <div className="text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-2">{FREQ_LABELS[freq]}</p>
            <div className="flex gap-1 justify-center items-end h-24">
                {/* OD bar */}
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[8px] font-black text-red-600">{od}</span>
                    <div className="w-5 bg-slate-100 rounded-t-sm overflow-hidden" style={{ height: '80px' }}>
                        <motion.div
                            className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t-sm"
                            style={{ marginTop: 'auto' }}
                            initial={{ height: 0 }}
                            animate={{ height: `${(od / maxDb) * 100}%` }}
                            transition={{ delay, duration: 0.6, ease: 'easeOut' }}
                        />
                    </div>
                </div>
                {/* OI bar */}
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[8px] font-black text-blue-600">{oi}</span>
                    <div className="w-5 bg-slate-100 rounded-t-sm overflow-hidden" style={{ height: '80px' }}>
                        <motion.div
                            className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm"
                            initial={{ height: 0 }}
                            animate={{ height: `${(oi / maxDb) * 100}%` }}
                            transition={{ delay: delay + 0.1, duration: 0.6, ease: 'easeOut' }}
                        />
                    </div>
                </div>
            </div>
            <div className={`mt-1 w-2 h-2 rounded-full mx-auto ${od > 25 || oi > 25 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
        </div>
    )
}

// ─────────────────────────────────────────────
// COMPONENTE: Gauge circular animado (PTA)
// ─────────────────────────────────────────────
function PTAGauge({ value, label, color }: { value: number; label: string; color: 'red' | 'blue' }) {
    const max = 90
    const pct = Math.min(value / max, 1)
    const r = 42, cx = 56, cy = 56
    const circ = 2 * Math.PI * r
    const strokeColors = { red: '#ef4444', blue: '#3b82f6' }
    const cls = classifyDb(value)

    return (
        <div className={`p-4 rounded-2xl ${cls.bg} border ${cls.border} text-center backdrop-blur-md`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
            <div className="relative mx-auto w-28 h-28">
                <svg viewBox="0 0 112 112" className="w-full h-full -rotate-90">
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                    <motion.circle
                        cx={cx} cy={cy} r={r} fill="none"
                        stroke={strokeColors[color]} strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        initial={{ strokeDashoffset: circ }}
                        animate={{ strokeDashoffset: circ * (1 - pct) }}
                        transition={{ duration: 1.0, ease: 'easeOut', delay: 0.3 }}
                        style={{ filter: `drop-shadow(0 0 8px ${color === 'red' ? 'rgba(239,68,68,0.5)' : 'rgba(59,130,246,0.5)'})` }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className={`text-2xl font-black ${color === 'red' ? 'text-red-400' : 'text-blue-400'} drop-shadow-md`}>{value}</p>
                    <p className="text-[9px] font-bold text-slate-300">dB HL</p>
                </div>
            </div>
            <p className={`text-xs font-black mt-2 ${cls.color}`}>{cls.label}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">PTA (500-4kHz)</p>
        </div>
    )
}

// ─────────────────────────────────────────────
// TRANSFORMER: De resultados_estudio → formato interno
// ─────────────────────────────────────────────
function buildFromResultados(estudio: any, resultados: any[]): any {
    const get = (name: string) => {
        const r = resultados.find(r => r.parametro_nombre === name)
        return r?.resultado_numerico ?? r?.resultado ?? null
    }

    // Intentar leer AUDIOGRAMA_DATOS primero (array JSON)
    let od: Record<string, number> = {}
    let oi: Record<string, number> = {}

    const audioDatos = get('AUDIOGRAMA_DATOS')
    if (audioDatos) {
        try {
            const arr = typeof audioDatos === 'string' ? JSON.parse(audioDatos) : audioDatos
            if (Array.isArray(arr)) {
                arr.forEach((pt: any) => {
                    const f = String(pt.frecuencia || pt.freq || '')
                    if (pt.od !== undefined && pt.od !== null) od[f] = Number(pt.od)
                    if (pt.oi !== undefined && pt.oi !== null) oi[f] = Number(pt.oi)
                    // Compatibilidad con derecho/izquierdo
                    if (pt.derecho !== undefined) od[f] = Number(pt.derecho)
                    if (pt.izquierdo !== undefined) oi[f] = Number(pt.izquierdo)
                })
            }
        } catch (e) { }
    }

    // Si no hay AUDIOGRAMA_DATOS, leer campos individuales OD_XXXHz / OI_XXXHz
    if (Object.keys(od).length === 0) {
        FREQS_ALL.forEach(f => {
            const vOd = get(`OD_${f}Hz`) ?? get(`od_${f}`) ?? get(`oido_derecho_${f}`)
            const vOi = get(`OI_${f}Hz`) ?? get(`oi_${f}`) ?? get(`oido_izquierdo_${f}`)
            if (vOd !== null) od[f] = Number(vOd)
            if (vOi !== null) oi[f] = Number(vOi)
        })
    }

    // PTA
    const ptaOd = FREQS_PTA.some(f => od[f] !== undefined)
        ? Math.round(FREQS_PTA.reduce((s, f) => s + (od[f] || 0), 0) / FREQS_PTA.length) : 0
    const ptaOi = FREQS_PTA.some(f => oi[f] !== undefined)
        ? Math.round(FREQS_PTA.reduce((s, f) => s + (oi[f] || 0), 0) / FREQS_PTA.length) : 0

    return {
        id: estudio.id,
        fecha: estudio.fecha_estudio,
        diagnostico: get('DIAGNOSTICO_GENERAL') || estudio.diagnostico || '',
        diagnostico_od: get('DIAGNOSTICO_OD') || '',
        diagnostico_oi: get('DIAGNOSTICO_OI') || '',
        medico: get('MEDICO_RESPONSABLE') || estudio.medico_responsable || '',
        equipo: get('EQUIPO') || estudio.equipo || '',
        archivo_url: estudio.archivo_origen || null,
        oido_derecho: od,
        oido_izquierdo: oi,
        pta_od: ptaOd,
        pta_oi: ptaOi,
        semaforo_od: getSemaforo(ptaOd),
        semaforo_oi: getSemaforo(ptaOi),
        semaforo_general: getSemaforo(Math.max(ptaOd, ptaOi)),
        // Props extra para análisis IA
        resumen: estudio.interpretacion || '',
        requiere_reevaluacion: ptaOd > 25 || ptaOi > 25,
        rawResults: resultados,
    }
}

// ─── Hook: upload + extracción AudioClone (con preview antes de guardar) ───
// ⚡ /midu — Patrón idéntico a useSpirometryUpload de EspirometriaTab
const useAudiometryUpload = (pacienteId: string, empresaId: string, userId: string | undefined, userName: string | undefined, userRol: string | undefined, onComplete: () => void) => {
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [previewData, setPreviewData] = useState<any>(null)
    const [originalFile, setOriginalFile] = useState<File | null>(null)
    const [saving, setSaving] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (file: File) => {
        setUploading(true)
        setError(null)
        setPreviewData(null)
        setOriginalFile(file)
        setProgress('Analizando audiometría con AudioClone IA...')

        try {
            const audioData = await analyzeAudiometryDirect('', [file])
            if (!audioData?.thresholds) {
                throw new Error('La IA no pudo extraer los datos audiométricos del documento.')
            }
            setProgress(`✅ Audiometría extraída. Revisa y confirma.`)
            setPreviewData(audioData)
        } catch (err: any) {
            console.error('[AudioUpload] Error:', err)
            setError(err.message || 'Error al procesar el documento')
            setOriginalFile(null)
        } finally {
            setUploading(false)
        }
    }

    const confirmSave = async () => {
        if (!previewData) return
        setSaving(true)
        try {
            // 1. Guardar datos extraídos en estudios_clinicos
            // ⚡ /midu — Patrón IDÉNTICO a EspirometriaTab: todo en datos_extra JSONB
            const { error: dbErr } = await supabase.from('estudios_clinicos').insert({
                paciente_id: pacienteId,
                tipo_estudio: 'audiometria',
                fecha_estudio: new Date().toISOString().split('T')[0],
                datos_extra: {
                    audioclone_data: previewData,
                    _source: 'AudioClone Pipeline',
                    _extracted_at: new Date().toISOString(),
                }
            })
            if (dbErr) throw dbErr

            if (originalFile) {
                try {
                    let eid = empresaId
                    if (!eid) {
                        const { data: pac } = await supabase.from('pacientes').select('empresa_id').eq('id', pacienteId).single()
                        eid = pac?.empresa_id || ''
                    }
                    if (!eid) eid = EMPRESA_PRINCIPAL_ID
                    if (eid) {
                        const patientName = previewData.patient?.name || 'Paciente'
                        const fecha = new Date().toISOString().split('T')[0]
                        const ext = originalFile.name.split('.').pop() || 'pdf'
                        const renamedFile = new File(
                            [originalFile],
                            `Audiometria_${patientName.replace(/\s+/g, '_')}_${fecha}.${ext}`,
                            { type: originalFile.type }
                        )
                        await secureStorageService.upload(renamedFile, {
                            pacienteId, empresaId: eid,
                            categoria: 'audiometria',
                            subcategoria: 'reporte_original',
                            descripcion: `Audiometría de ${patientName} — ${fecha}`,
                            userId, userNombre: userName, userRol: userRol,
                        })
                        console.log('📎 Archivo audiometría guardado en Storage')
                    }
                } catch (storageErr) {
                    console.warn('⚠️ No se pudo guardar el archivo original:', storageErr)
                }
            }

            setPreviewData(null)
            setOriginalFile(null)
            onComplete()
        } catch (err: any) {
            setError(err.message || 'Error al guardar en base de datos')
        } finally {
            setSaving(false)
        }
    }

    const cancelPreview = () => {
        setPreviewData(null)
        setOriginalFile(null)
        setProgress('')
        setError(null)
    }

    const triggerUpload = () => fileInputRef.current?.click()

    const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleUpload(file)
        if (e.target) e.target.value = ''
    }

    return { uploading, saving, progress, error, previewData, fileInputRef, triggerUpload, onFileSelected, confirmSave, cancelPreview }
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function AudiometriaTab({ pacienteId }: { pacienteId: string }) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [audio, setAudio] = useState<any>(null)
    const [prev, setPrev] = useState<any>(null)
    const [activeSection, setActiveSection] = useState<'scanner' | 'analisis'>('scanner')
    const [showPrev, setShowPrev] = useState(false)

    const loadData = async () => {
        try {
            setLoading(true)

            // FUENTE 1: datos_extra.audioclone_data (nuevo pipeline — idéntico a espirometría)
            const { data: estudios } = await supabase
                .from('estudios_clinicos')
                .select('*')
                .eq('paciente_id', pacienteId)
                .eq('tipo_estudio', 'audiometria')
                .order('fecha_estudio', { ascending: false })
                .limit(2)

            if (estudios && estudios.length > 0) {
                for (let idx = 0; idx < estudios.length; idx++) {
                    const est = estudios[idx]
                    const clone = est.datos_extra?.audioclone_data

                    // ─── Ruta A: AudioClone JSONB (nuevo) ───
                    if (clone?.thresholds) {
                        const od: Record<string, number> = {}
                        const oi: Record<string, number> = {}
                            ; (clone.thresholds.right || []).forEach((t: any) => {
                                if (t.value !== null && t.value !== undefined) od[String(t.frequency)] = Number(t.value)
                            })
                            ; (clone.thresholds.left || []).forEach((t: any) => {
                                if (t.value !== null && t.value !== undefined) oi[String(t.frequency)] = Number(t.value)
                            })
                        const ptaOd = FREQS_PTA.some(f => od[f] !== undefined)
                            ? Math.round(FREQS_PTA.reduce((s, f) => s + (od[f] || 0), 0) / FREQS_PTA.length) : 0
                        const ptaOi = FREQS_PTA.some(f => oi[f] !== undefined)
                            ? Math.round(FREQS_PTA.reduce((s, f) => s + (oi[f] || 0), 0) / FREQS_PTA.length) : 0

                        const built = {
                            id: est.id,
                            fecha: est.fecha_estudio,
                            diagnostico: clone.diagnosis?.general || est.diagnostico || '',
                            diagnostico_od: clone.diagnosis?.rightEar || '',
                            diagnostico_oi: clone.diagnosis?.leftEar || '',
                            medico: clone.testDetails?.doctor || est.medico_responsable || '',
                            equipo: clone.equipment?.device || est.equipo || '',
                            archivo_url: est.archivo_origen || null,
                            oido_derecho: od,
                            oido_izquierdo: oi,
                            pta_od: ptaOd,
                            pta_oi: ptaOi,
                            semaforo_od: getSemaforo(ptaOd),
                            semaforo_oi: getSemaforo(ptaOi),
                            semaforo_general: getSemaforo(Math.max(ptaOd, ptaOi)),
                            resumen: est.interpretacion || clone.diagnosis?.general || '',
                            requiere_reevaluacion: ptaOd > 25 || ptaOi > 25,
                            rawClone: clone,
                        }
                        if (idx === 0) setAudio(built)
                        else setPrev(built)
                        continue
                    }

                    // ─── Ruta B: resultados_estudio (legacy) ───
                    const { data: resultados } = await supabase
                        .from('resultados_estudio').select('*').eq('estudio_id', est.id)
                    if (resultados && resultados.length > 0) {
                        const built = buildFromResultados(est, resultados)
                        if (idx === 0) setAudio(built)
                        else setPrev(built)
                    }
                }
                // Si ya tenemos datos, no seguir buscando
                setLoading(false)
                return
            }

            // FUENTE 2: tabla audiometrias legacy
            const { data: legacy } = await supabase
                .from('audiometrias').select('*')
                .eq('paciente_id', pacienteId)
                .order('created_at', { ascending: false }).limit(2)

            if (legacy && legacy.length > 0) {
                const map = (d: any): any => {
                    const od: Record<string, number> = {}, oi: Record<string, number> = {}
                    FREQS_ALL.forEach(f => {
                        if (d[`od_${f}`] !== undefined) od[f] = Number(d[`od_${f}`])
                        if (d[`oi_${f}`] !== undefined) oi[f] = Number(d[`oi_${f}`])
                    })
                    const ptaOd = FREQS_PTA.reduce((s, f) => s + (od[f] || 0), 0) / FREQS_PTA.length
                    const ptaOi = FREQS_PTA.reduce((s, f) => s + (oi[f] || 0), 0) / FREQS_PTA.length
                    return { ...d, fecha: d.fecha_estudio || d.fecha, oido_derecho: od, oido_izquierdo: oi, pta_od: Math.round(ptaOd), pta_oi: Math.round(ptaOi), semaforo_od: getSemaforo(ptaOd), semaforo_oi: getSemaforo(ptaOi), semaforo_general: getSemaforo(Math.max(ptaOd, ptaOi)) }
                }
                setAudio(map(legacy[0]))
                if (legacy[1]) setPrev(map(legacy[1]))
                return
            }

            // Demo
            if (pacienteId?.startsWith('demo')) {
                const demo = getExpedienteDemoCompleto()
                setAudio(demo.audiometria)
                setPrev(demo.audiometriaPrevio)
            }
        } catch (err) { console.error('AudiometriaTab error:', err) }
        finally { setLoading(false) }
    }

    useEffect(() => { if (pacienteId) loadData() }, [pacienteId])

    const reload = () => { setAudio(null); setPrev(null); loadData() }

    // ── Delete ──
    const [deleting, setDeleting] = useState(false)
    const handleDeleteAudio = async () => {
        if (!audio?.id) return
        if (!confirm('¿Eliminar esta audiometría? Esta acción no se puede deshacer.')) return
        setDeleting(true)
        try {
            await supabase.from('resultados_estudio').delete().eq('estudio_id', audio.id)
            await supabase.from('estudios_clinicos').delete().eq('id', audio.id)
            toast.success('Audiometría eliminada')
            reload()
        } catch (err: any) { toast.error('Error: ' + (err.message || '')) }
        finally { setDeleting(false) }
    }
    const upload = useAudiometryUpload(
        pacienteId,
        user?.empresa_id || '',
        user?.id,
        user?.nombre ? `${user.nombre} ${user.apellido_paterno || ''}`.trim() : undefined,
        user?.rol,
        reload
    )

    // ── Loading ──
    if (loading) return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                <Ear className="w-8 h-8 text-violet-500" />
            </motion.div>
            <p className="text-slate-400 text-xs font-medium">Cargando audiometría...</p>
        </div>
    )

    // ── Preview mode (extraído pero no guardado) ── Idéntico a EspirometriaTab
    if (upload.previewData) return (
        <div className="space-y-5">
            {/* Confirmation banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-500/10 backdrop-blur-md rounded-2xl border border-amber-500/30 p-5 shadow-[0_8px_32px_rgba(245,158,11,0.15)]"
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-amber-900">Vista previa — Sin guardar</h3>
                            <p className="text-xs text-amber-700">{upload.progress}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={upload.cancelPreview}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-300 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl transition-colors backdrop-blur-sm"
                        >
                            <X className="w-4 h-4" />
                            Cancelar
                        </button>
                        <button
                            onClick={upload.confirmSave}
                            disabled={upload.saving}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-xl shadow-lg shadow-emerald-200/50 transition-all disabled:opacity-50"
                        >
                            {upload.saving ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                            ) : (
                                <><Save className="w-4 h-4" /> Confirmar y Guardar</>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>

            {upload.error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{upload.error}</p>
                </div>
            )}

            {/* Preview of AudiometryReviewClone */}
            <div className="overflow-x-auto bg-gradient-to-br from-violet-50/30 to-purple-50/30 p-2 md:p-6 rounded-2xl border border-violet-200 shadow-inner">
                <div className="min-w-[800px]">
                    <AudiometryReviewClone data={upload.previewData} />
                </div>
            </div>
        </div>
    )

    // ── Sin datos → Subir PDF ── Idéntico a EspirometriaTab
    if (!audio) return (
        <Card className="border-white/10 shadow-lg bg-white/5 backdrop-blur-md">
            <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mx-auto mb-4">
                    <Ear className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="text-white font-bold text-lg">Sin registros de audiometría</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2 mb-8">
                    Sube el PDF del reporte de audiometría y la IA extraerá automáticamente
                    todos los datos, audiogramas y diagnóstico para crear la réplica digital.
                </p>

                {/* Upload */}
                <input
                    ref={upload.fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf,image/*"
                    onChange={upload.onFileSelected}
                    className="hidden"
                />

                {upload.uploading ? (
                    <div className="max-w-sm mx-auto space-y-4">
                        <div className="flex items-center justify-center gap-3 p-4 bg-violet-50 rounded-xl border border-violet-200">
                            <Loader2 className="w-5 h-5 text-violet-600 animate-spin" />
                            <p className="text-sm font-medium text-violet-800">{upload.progress}</p>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={upload.triggerUpload}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-200/50 hover:shadow-xl hover:scale-[1.02] transition-all"
                    >
                        <Upload className="w-5 h-5" />
                        Subir Reporte de Audiometría
                    </button>
                )}

                {upload.error && (
                    <div className="mt-6 max-w-sm mx-auto flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{upload.error}</p>
                    </div>
                )}

                <p className="text-[10px] text-slate-400 mt-6">
                    Powered by Gemini Pro — AudioClone: extracción completa con audiogramas, umbrales y diagnóstico
                </p>
            </CardContent>
        </Card>
    )

    const semStyle = SEMAFORO_STYLES[audio.semaforo_general as keyof typeof SEMAFORO_STYLES] || SEMAFORO_STYLES.verde
    const odData = audio.oido_derecho || {}
    const oiData = audio.oido_izquierdo || {}

    // Alertas automáticas por frecuencia
    const alertas: string[] = []
    if ((odData['4000'] || 0) > 25 || (oiData['4000'] || 0) > 25)
        alertas.push('Pérdida en 4000 Hz — posible daño por ruido (DPN)')
    if ((odData['2000'] || 0) > 25 || (oiData['2000'] || 0) > 25)
        alertas.push('Pérdida en 2000 Hz — afecta la inteligibilidad del habla')
    if (audio.pta_od > 40 || audio.pta_oi > 40)
        alertas.push('PTA > 40 dB — hipoacusia moderada — requiere evaluación especializada')
    if (Math.abs((audio.pta_od || 0) - (audio.pta_oi || 0)) > 15)
        alertas.push('Asimetría significativa entre oídos (>15 dB) — descartar patología unilateral')

    return (
        <div className="space-y-5">

            {/* ── HEADER ── */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)] border border-white/10">
                            <Ear className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white drop-shadow-sm">Audiometría Tonal</h3>
                            <p className="text-xs text-slate-300 font-medium">
                                {audio.medico || 'GP Medical Health'} — {audio.equipo || 'Audiómetro clínico'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Re-upload button */}
                        <input
                            ref={upload.fileInputRef}
                            type="file"
                            accept=".pdf,application/pdf,image/*"
                            onChange={upload.onFileSelected}
                            className="hidden"
                        />
                        <button
                            onClick={upload.triggerUpload}
                            disabled={upload.uploading}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-bold hover:bg-violet-500/30 transition-colors disabled:opacity-50"
                        >
                            {upload.uploading ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Procesando...</>
                            ) : (
                                <><RefreshCw className="w-3.5 h-3.5" /> Actualizar Estudio</>
                            )}
                        </button>
                        <button onClick={handleDeleteAudio} disabled={deleting || !audio?.id}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold hover:bg-red-500/30 transition disabled:opacity-50">
                            {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                            Eliminar
                        </button>
                        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Fecha</p>
                            <p className="text-sm font-bold text-slate-200">
                                {audio.fecha ? new Date(audio.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                            </p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl ${semStyle.bgLight} border ${semStyle.border} backdrop-blur-sm`}>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Resultado</p>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-3 h-3 rounded-full ${semStyle.bg}`} style={{ boxShadow: `0 0 8px ${semStyle.bg.replace('bg-', '')}` }} />
                                <p className={`text-sm font-bold ${semStyle.text}`}>{semStyle.label}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Diagnóstico */}
                {audio.diagnostico && (
                    <div className={`mt-4 flex items-start gap-3 p-3 rounded-xl ${semStyle.bgLight} border ${semStyle.border} backdrop-blur-sm`}>
                        <Volume2 className={`w-4 h-4 ${semStyle.text} flex-shrink-0 mt-0.5`} />
                        <p className={`text-sm font-bold ${semStyle.text}`}>{audio.diagnostico}</p>
                    </div>
                )}

                {/* Alertas */}
                {alertas.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                        {alertas.map((a, i) => (
                            <motion.div key={i}
                                initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.07 }}
                                className="flex items-start gap-2 px-3 py-2 bg-amber-500/10 backdrop-blur-md rounded-lg border border-amber-500/20">
                                <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs font-medium text-amber-400">{a}</p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── TABS: ESCÁNER / ANÁLISIS ── */}
            <div className="flex gap-1 p-1 bg-white/5 backdrop-blur-md rounded-xl w-fit border border-white/10">
                {(['scanner', 'analisis'] as const).map(s => (
                    <button key={s} onClick={() => setActiveSection(s)}
                        className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeSection === s
                            ? 'bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}>
                        {s === 'scanner' ? '📋 Vista Escáner' : '🧠 Análisis IA'}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">

                {/* ══════════════════════════════════════
                    SECCIÓN 1: ESCÁNER — Replica del formato
                ══════════════════════════════════════ */}
                {activeSection === 'scanner' && (
                    <motion.div key="scanner"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }} className="space-y-5">

                        {/* Audiograma principal */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">
                                Audiograma — Vía Aérea Bilateral
                            </p>
                            <AudiogramSVG od={odData} oi={oiData} animated />
                        </div>

                        {/* Tabla de umbrales — igual que en el formato */}
                        <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg overflow-hidden">
                            <div className="px-4 pt-4 pb-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Tabla de Umbrales — Vía Aérea (dB HL)
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-white/5 border-y border-white/10">
                                            <th className="text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Oído</th>
                                            {FREQS_ALL.map(f => (
                                                <th key={f} className="px-2 py-2.5 text-center text-[10px] font-black uppercase text-slate-400 whitespace-nowrap">
                                                    {FREQ_LABELS[f]}
                                                </th>
                                            ))}
                                            <th className="px-3 py-2.5 text-center text-[10px] font-black uppercase text-slate-400">PTA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { key: 'OD', data: odData, pta: audio.pta_od, color: 'text-rose-400', dot: 'bg-rose-500' },
                                            { key: 'OI', data: oiData, pta: audio.pta_oi, color: 'text-cyan-400', dot: 'bg-cyan-500' },
                                        ].map(({ key, data, pta, color, dot }) => (
                                            <tr key={key} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2.5 h-2.5 rounded-full ${dot} shadow-[0_0_8px_${dot.replace('bg-', '')}]`} />
                                                        <span className={`font-black text-xs ${color}`}>{key}</span>
                                                    </div>
                                                </td>
                                                {FREQS_ALL.map(f => {
                                                    const val = data[f]
                                                    const cls = val !== undefined ? classifyDb(val) : null
                                                    return (
                                                        <td key={f} className={`px-2 py-3 text-center font-bold tabular-nums text-sm ${cls ? cls.color : 'text-slate-500'}`}>
                                                            {val !== undefined ? val : '—'}
                                                        </td>
                                                    )
                                                })}
                                                <td className={`px-3 py-3 text-center font-black text-sm ${color}`}>
                                                    {pta !== undefined ? pta : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        {/* Datos del estudio — igual que pie de página del formato */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                                { label: 'Diagnóstico OD', value: audio.diagnostico_od || audio.diagnostico || '—' },
                                { label: 'Diagnóstico OI', value: audio.diagnostico_oi || audio.diagnostico || '—' },
                                { label: 'Médico / Técnico', value: audio.medico || '—' },
                                { label: 'Equipo', value: audio.equipo || '—' },
                                { label: 'Fecha del Estudio', value: audio.fecha ? new Date(audio.fecha).toLocaleString('es-MX') : '—' },
                            ].map(({ label, value }) => (
                                <div key={label} className="p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                                    <p className="text-xs font-bold text-slate-200 mt-0.5 leading-relaxed">{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Archivo original */}
                        <DocumentosAdjuntos pacienteId={pacienteId} categoria="audiometria" titulo="Archivo Original (PDF/Imagen)" collapsedByDefault={false} />

                        {/* Comparación con estudio previo */}
                        {prev && (
                            <>
                                <button onClick={() => setShowPrev(!showPrev)}
                                    className="w-full flex items-center justify-between p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <span className="text-xs font-bold text-slate-300">
                                            Estudio previo — {new Date(prev.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                    {showPrev ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                </button>
                                <AnimatePresence>
                                    {showPrev && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                            <AudiogramSVG od={prev.oido_derecho || {}} oi={prev.oido_izquierdo || {}} animated={false} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </motion.div>
                )}

                {/* ══════════════════════════════════════
                    SECCIÓN 2: ANÁLISIS IA AVANZADO
                ══════════════════════════════════════ */}
                {activeSection === 'analisis' && (() => {
                    // ── Cálculos avanzados ──
                    const od4k = odData['4000'] ?? 0, oi4k = oiData['4000'] ?? 0
                    const od3k = odData['3000'] ?? 0, oi3k = oiData['3000'] ?? 0
                    const od6k = odData['6000'] ?? 0, oi6k = oiData['6000'] ?? 0
                    const od2k = odData['2000'] ?? 0, oi2k = oiData['2000'] ?? 0
                    const od1k = odData['1000'] ?? 0, oi1k = oiData['1000'] ?? 0
                    const od500 = odData['500'] ?? 0, oi500 = oiData['500'] ?? 0

                    // DPN (Daño por ruido) — muesca en 4kHz
                    const dpnOd = od4k > 25 && od4k > od2k && od4k > od6k
                    const dpnOi = oi4k > 25 && oi4k > oi2k && oi4k > oi6k
                    const hasDPN = dpnOd || dpnOi

                    // Perfil de curva
                    const getProfile = (d: Record<string, number>) => {
                        const low = ((d['250'] ?? 0) + (d['500'] ?? 0)) / 2
                        const mid = ((d['1000'] ?? 0) + (d['2000'] ?? 0)) / 2
                        const high = ((d['4000'] ?? 0) + (d['8000'] ?? 0)) / 2
                        if (Math.abs(low - high) < 10 && Math.abs(low - mid) < 10) return 'Plano'
                        if (high > low + 15) return 'Descendente'
                        if (low > high + 15) return 'Ascendente'
                        const d4k = d['4000'] ?? 0, d2k = d['2000'] ?? 0, d6k = d['6000'] ?? 0
                        if (d4k > d2k + 10 && d4k > d6k + 10) return 'Muesca (Notch)'
                        return 'Irregular'
                    }
                    const profileOd = getProfile(odData)
                    const profileOi = getProfile(oiData)

                    // Índice de inteligibilidad del habla (SII proxy: 500+1K+2K)
                    const siiOd = Math.round((od500 + od1k + od2k) / 3)
                    const siiOi = Math.round((oi500 + oi1k + oi2k) / 3)
                    const siiLabel = (v: number) => v <= 15 ? 'Excelente' : v <= 25 ? 'Buena' : v <= 40 ? 'Reducida' : v <= 55 ? 'Deficiente' : 'Severa'
                    const siiColor = (v: number) => v <= 15 ? 'text-emerald-600' : v <= 25 ? 'text-blue-600' : v <= 40 ? 'text-amber-600' : 'text-red-600'

                    // Índice de discapacidad auditiva (AMA/WHO)
                    const betterPTA = Math.min(audio.pta_od || 0, audio.pta_oi || 0)
                    const worsePTA = Math.max(audio.pta_od || 0, audio.pta_oi || 0)
                    const binaural = Math.round((betterPTA * 5 + worsePTA) / 6)
                    const disabilityPct = binaural > 25 ? Math.min(Math.round((binaural - 25) * 1.5), 100) : 0

                    // Asimetría bilateral
                    const asymmetry = Math.abs((audio.pta_od || 0) - (audio.pta_oi || 0))
                    const asymLabel = asymmetry <= 10 ? 'Simétrica' : asymmetry <= 15 ? 'Leve asimetría' : asymmetry <= 25 ? 'Asimetría significativa' : 'Asimetría severa'
                    const asymColor = asymmetry <= 10 ? 'text-emerald-600' : asymmetry <= 15 ? 'text-amber-600' : 'text-red-600'

                    // Frecuencias del habla vs altas frecuencias
                    const speechOd = Math.round((od500 + od1k + od2k) / 3)
                    const speechOi = Math.round((oi500 + oi1k + oi2k) / 3)
                    const highOd = Math.round((od3k + od4k + od6k) / 3)
                    const highOi = Math.round((oi3k + oi4k + oi6k) / 3)

                    // Nivel de riesgo global
                    const riskScore = (() => {
                        let s = 0
                        if (hasDPN) s += 30
                        if (worsePTA > 25) s += 20
                        if (worsePTA > 40) s += 20
                        if (asymmetry > 15) s += 15
                        if (siiOd > 25 || siiOi > 25) s += 15
                        return Math.min(s, 100)
                    })()
                    const riskLabel = riskScore <= 20 ? 'Bajo' : riskScore <= 50 ? 'Moderado' : riskScore <= 75 ? 'Alto' : 'Crítico'
                    const riskColors = riskScore <= 20
                        ? { bg: 'bg-emerald-500', text: 'text-emerald-400', light: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
                        : riskScore <= 50
                            ? { bg: 'bg-amber-500', text: 'text-amber-400', light: 'bg-amber-500/10', border: 'border-amber-500/20' }
                            : riskScore <= 75
                                ? { bg: 'bg-orange-500', text: 'text-orange-400', light: 'bg-orange-500/10', border: 'border-orange-500/20' }
                                : { bg: 'bg-red-500', text: 'text-red-400', light: 'bg-red-500/10', border: 'border-red-500/20' }

                    return (
                        <motion.div key="analisis"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }} className="space-y-5">

                            {/* Header IA */}
                            <div className="bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 rounded-2xl p-5 text-white relative overflow-hidden">
                                <div className="absolute inset-0 opacity-10">
                                    {Array.from({ length: 20 }).map((_, i) => (
                                        <motion.div key={i}
                                            className="absolute w-1 rounded-full bg-white"
                                            style={{ left: `${i * 5 + 2}%`, bottom: 0, height: `${20 + Math.random() * 60}%` }}
                                            animate={{ height: [`${20 + Math.random() * 60}%`, `${20 + Math.random() * 60}%`], opacity: [0.3, 0.8, 0.3] }}
                                            transition={{ duration: 1.5 + Math.random(), repeat: Infinity, delay: Math.random() * 2 }}
                                        />
                                    ))}
                                </div>
                                <div className="relative">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                            <Brain className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-black text-sm">Análisis Audiológico IA Avanzado</p>
                                            <p className="text-violet-200 text-xs">8 módulos de inteligencia clínica — NOM-011 · OMS · AMA</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-violet-100 leading-relaxed">
                                        {audio.resumen || `Audiometría tonal de vía aérea. PTA OD: ${audio.pta_od} dB — PTA OI: ${audio.pta_oi} dB. ${audio.diagnostico || 'Resultado registrado.'}`}
                                    </p>
                                </div>
                            </div>

                            {/* ── 1. RIESGO GLOBAL ── */}
                            <Card className={`${riskColors.light} ${riskColors.border} border shadow-sm`}>
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Target className="w-4 h-4 text-slate-400" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nivel de Riesgo Auditivo</p>
                                        </div>
                                        <Badge className={`${riskColors.bg} text-white text-xs font-black px-3 py-1`}>{riskLabel} — {riskScore}%</Badge>
                                    </div>
                                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${riskScore}%` }}
                                            transition={{ duration: 1.2, ease: 'easeOut' }}
                                            className={`h-full rounded-full ${riskColors.bg} shadow-[0_0_10px_${riskColors.bg.replace('bg-', '')}]`}
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 gap-1 mt-3">
                                        {[{ l: 'Bajo', r: '0-20%' }, { l: 'Moderado', r: '21-50%' }, { l: 'Alto', r: '51-75%' }, { l: 'Crítico', r: '76-100%' }].map(({ l, r }) => (
                                            <div key={l} className="text-center">
                                                <p className="text-[8px] font-bold text-slate-400">{l}</p>
                                                <p className="text-[8px] text-slate-300">{r}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ── 2. GAUGES PTA ── */}
                            <div className="grid grid-cols-2 gap-4">
                                <PTAGauge value={audio.pta_od || 0} label="PTA Oído Derecho" color="red" />
                                <PTAGauge value={audio.pta_oi || 0} label="PTA Oído Izquierdo" color="blue" />
                            </div>

                            {/* ── 3. KPIs CLÍNICOS ── */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <Card className={`shadow-sm backdrop-blur-md ${hasDPN ? 'border-red-500/30 bg-red-500/10' : 'border-emerald-500/30 bg-emerald-500/10'}`}>
                                    <CardContent className="p-4 text-center">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">DPN (Daño Ruido)</p>
                                        <p className={`text-lg font-black mt-1 ${hasDPN ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {hasDPN ? '⚠️ Detectado' : '✅ No'}
                                        </p>
                                        <p className="text-[9px] text-slate-400 mt-1">{hasDPN ? `Muesca 4kHz ${dpnOd ? 'OD' : ''}${dpnOd && dpnOi ? '+' : ''}${dpnOi ? 'OI' : ''}` : 'Sin patrón de ruido'}</p>
                                    </CardContent>
                                </Card>
                                <Card className={`shadow-sm backdrop-blur-md ${disabilityPct > 0 ? 'border-amber-500/30 bg-amber-500/10' : 'border-emerald-500/30 bg-emerald-500/10'}`}>
                                    <CardContent className="p-4 text-center">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Discapacidad AMA</p>
                                        <p className={`text-lg font-black mt-1 ${disabilityPct > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{disabilityPct}%</p>
                                        <p className="text-[9px] text-slate-400 mt-1">PTA binaural: {binaural} dB</p>
                                    </CardContent>
                                </Card>
                                <Card className="shadow-sm border-white/10 bg-white/5 backdrop-blur-md">
                                    <CardContent className="p-4 text-center">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Habla OD / OI</p>
                                        <p className="text-lg font-black mt-1">
                                            <span className={siiColor(siiOd)}>{siiOd}</span>
                                            <span className="text-slate-400 mx-1">/</span>
                                            <span className={siiColor(siiOi)}>{siiOi}</span>
                                            <span className="text-xs text-slate-400"> dB</span>
                                        </p>
                                        <p className="text-[9px] text-slate-400 mt-1">{siiLabel(Math.max(siiOd, siiOi))}</p>
                                    </CardContent>
                                </Card>
                                <Card className={`shadow-sm backdrop-blur-md ${asymmetry > 15 ? 'border-red-500/30 bg-red-500/10' : 'border-white/10 bg-white/5'}`}>
                                    <CardContent className="p-4 text-center">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Simetría</p>
                                        <p className={`text-lg font-black mt-1 ${asymColor}`}>Δ {asymmetry} dB</p>
                                        <p className="text-[9px] text-slate-400 mt-1">{asymLabel}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* ── 4. PERFIL DE CURVA + BANDAS ── */}
                            <details className="group border border-white/10 bg-white/5 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
                                <summary className="w-full p-5 flex items-center justify-between cursor-pointer list-none hover:bg-white/[0.02] focus:outline-none [&::-webkit-details-marker]:hidden">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0">Perfil Audiométrico y Bandas de Frecuencia</p>
                                    <ChevronDown className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180 flex-shrink-0" />
                                </summary>
                                <div className="p-5 pt-0 border-t border-white/5">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        {[{ label: 'Oído Derecho', profile: profileOd, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
                                        { label: 'Oído Izquierdo', profile: profileOi, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' }].map(({ label, profile, color, bg, border }) => (
                                            <div key={label} className={`p-3 rounded-xl ${bg} border ${border} backdrop-blur-sm`}>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">{label}</p>
                                                <p className={`text-sm font-black ${color} mt-1`}>{profile}</p>
                                                <p className="text-[9px] text-slate-400 mt-0.5">
                                                    {profile === 'Descendente' ? 'Típico de presbiacusia o exposición crónica'
                                                        : profile === 'Muesca (Notch)' ? 'Patrón de trauma acústico (4kHz)'
                                                            : profile === 'Plano' ? 'Curva uniforme — puede ser conductiva'
                                                                : profile === 'Ascendente' ? 'Pérdida en graves — evaluar patología media'
                                                                    : 'Patrón no uniforme'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[{ ear: 'OD', speech: speechOd, high: highOd, dotColor: 'bg-rose-500' },
                                        { ear: 'OI', speech: speechOi, high: highOi, dotColor: 'bg-cyan-500' }].map(({ ear, speech, high, dotColor }) => (
                                            <div key={ear} className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${dotColor} shadow-[0_0_8px_${dotColor.replace('bg-', '')}]`} />
                                                    <p className="text-[9px] font-black text-slate-400 uppercase">{ear}</p>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] text-slate-400">Habla (0.5-2k)</span>
                                                        <span className={`text-xs font-black ${speech <= 25 ? 'text-emerald-400' : 'text-amber-400'}`}>{speech} dB</span>
                                                    </div>
                                                    <div className="h-1.5 bg-white/10 rounded-full">
                                                        <div className={`h-full rounded-full ${speech <= 25 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'}`} style={{ width: `${Math.min(speech / 90 * 100, 100)}%` }} />
                                                    </div>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="text-[10px] text-slate-400">Altas (3-6k)</span>
                                                        <span className={`text-xs font-black ${high <= 25 ? 'text-emerald-400' : high <= 40 ? 'text-amber-400' : 'text-red-400'}`}>{high} dB</span>
                                                    </div>
                                                    <div className="h-1.5 bg-white/10 rounded-full">
                                                        <div className={`h-full rounded-full ${high <= 25 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : high <= 40 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`} style={{ width: `${Math.min(high / 90 * 100, 100)}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </details>

                            {/* ── 5. ESPECTRO COMPLETO ── */}
                            <details className="group border border-white/10 bg-white/5 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
                                <summary className="w-full p-5 flex items-center justify-between cursor-pointer list-none hover:bg-white/[0.02] focus:outline-none [&::-webkit-details-marker]:hidden">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0">Espectro Completo — dB por Frecuencia</p>
                                    <ChevronDown className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180 flex-shrink-0" />
                                </summary>
                                <div className="p-5 pt-0 border-t border-white/5">
                                    <div className="flex justify-between items-end gap-1 overflow-x-auto pb-2">
                                        {FREQS_ALL.map((f, i) => (
                                            <FreqBar key={f} freq={f} od={odData[f] ?? 0} oi={oiData[f] ?? 0} delay={i * 0.05} />
                                        ))}
                                    </div>
                                    <div className="flex gap-4 mt-3 justify-center">
                                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" /><span className="text-[10px] font-bold text-slate-400">OD (Derecho)</span></div>
                                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.8)]" /><span className="text-[10px] font-bold text-slate-400">OI (Izquierdo)</span></div>
                                    </div>
                                </div>
                            </details>

                            {/* ── 6. CLASIFICACIÓN POR FRECUENCIA (NOM-011) ── */}
                            <details className="group border border-white/10 bg-white/5 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
                                <summary className="w-full p-5 flex items-center justify-between cursor-pointer list-none hover:bg-white/[0.02] focus:outline-none [&::-webkit-details-marker]:hidden">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0">Clasificación Clínica por Frecuencia (NOM-011-STPS)</p>
                                    <ChevronDown className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180 flex-shrink-0" />
                                </summary>
                                <div className="p-5 pt-0 border-t border-white/5">
                                    <div className="space-y-2">
                                        {FREQS_ALL.map((f) => {
                                            const od = odData[f], oi = oiData[f]
                                            if (od === undefined && oi === undefined) return null
                                            const odCls = od !== undefined ? classifyDb(od) : null
                                            const oiCls = oi !== undefined ? classifyDb(oi) : null
                                            const worst = Math.max(od ?? 0, oi ?? 0)
                                            const wCls = classifyDb(worst)
                                            return (
                                                <div key={f} className={`flex items-center gap-3 p-3 rounded-xl ${wCls.bg} border ${wCls.border}`}>
                                                    <div className="w-16 text-center"><p className="text-xs font-black text-white">{FREQ_LABELS[f]} Hz</p></div>
                                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                                        <div><p className="text-[9px] text-slate-400 font-bold uppercase">OD</p><p className={`text-sm font-black ${odCls?.color || 'text-slate-500'}`}>{od !== undefined ? `${od} dB` : '—'}</p></div>
                                                        <div><p className="text-[9px] text-slate-400 font-bold uppercase">OI</p><p className={`text-sm font-black ${oiCls?.color || 'text-slate-500'}`}>{oi !== undefined ? `${oi} dB` : '—'}</p></div>
                                                    </div>
                                                    <div className="text-right w-36"><p className={`text-xs font-black drop-shadow-sm ${wCls.color}`}>{wCls.label}</p></div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </details>

                            {/* ── 7. INTERPRETACIÓN INTEGRAL ── */}
                            <details className="group border border-violet-500/20 shadow-[0_8px_32px_rgba(139,92,246,0.15)] bg-gradient-to-br from-violet-900/30 to-purple-900/10 backdrop-blur-md rounded-xl overflow-hidden">
                                <summary className="w-full p-5 flex items-center justify-between cursor-pointer list-none hover:bg-white/[0.02] focus:outline-none [&::-webkit-details-marker]:hidden">
                                    <div className="flex items-center gap-2 pointer-events-none">
                                        <Brain className="w-4 h-4 text-violet-400" />
                                        <p className="text-sm font-black text-white uppercase tracking-wide mb-0">Interpretación Audiológica Integral</p>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180 flex-shrink-0" />
                                </summary>
                                <div className="p-5 pt-0 border-t border-white/5">
                                    <div className="space-y-3 text-sm text-slate-200">
                                        <div className="p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                                            <p className="font-black text-violet-400 text-xs uppercase tracking-widest mb-1">Perfil de Umbral</p>
                                            <p className="leading-relaxed">
                                                PTA bilateral: OD <strong>{audio.pta_od} dB</strong> — OI <strong>{audio.pta_oi} dB</strong>.
                                                PTA binaural ponderado: <strong>{binaural} dB</strong>.
                                                {' '}{classifyDb(Math.max(audio.pta_od || 0, audio.pta_oi || 0)).label}.
                                                {' '}{audio.diagnostico || ''}
                                            </p>
                                        </div>
                                        {hasDPN && (
                                            <div className="p-3 bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/20">
                                                <p className="font-black text-red-400 text-xs uppercase tracking-widest mb-1">🔴 Daño por Ruido (DPN)</p>
                                                <p className="leading-relaxed text-red-200">
                                                    Se detecta muesca audiométrica en 4000 Hz ({dpnOd ? `OD: ${od4k}dB` : ''}{dpnOd && dpnOi ? ' / ' : ''}{dpnOi ? `OI: ${oi4k}dB` : ''}).
                                                    Patrón compatible con trauma acústico crónico por exposición a ruido laboral.
                                                    Se recomienda audiometría de control en 3 meses y estudio de logoaudiometría.
                                                </p>
                                            </div>
                                        )}
                                        <div className="p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                                            <p className="font-black text-violet-400 text-xs uppercase tracking-widest mb-1">Relevancia Laboral (NOM-011-STPS)</p>
                                            <p className="leading-relaxed">
                                                {audio.pta_od <= 25 && audio.pta_oi <= 25
                                                    ? 'Audición dentro de límites normales (≤25 dB). Apto para cualquier puesto sin restricción auditiva.'
                                                    : audio.pta_od > 40 || audio.pta_oi > 40
                                                        ? `Hipoacusia ${classifyDb(worsePTA).label.toLowerCase()} (PTA peor oído: ${worsePTA}dB). Restricción laboral en puestos con exposición a ruido >85dB. Requiere EPP auditivo NRR≥25dB.`
                                                        : `Umbral en zona de vigilancia (PTA mejor: ${betterPTA}dB, peor: ${worsePTA}dB). Uso obligatorio de EPP auditivo en áreas >80dB. Monitoreo audiométrico semestral.`}
                                            </p>
                                        </div>
                                        {alertas.length > 0 && (
                                            <div className="p-3 bg-amber-500/10 backdrop-blur-sm rounded-xl border border-amber-500/20">
                                                <p className="font-black text-amber-500 text-xs uppercase tracking-widest mb-2">Hallazgos Clínicos Automáticos</p>
                                                <ul className="space-y-1">
                                                    {alertas.map((a, i) => (
                                                        <li key={i} className="flex items-start gap-2">
                                                            <Zap className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                                                            <span className="text-xs text-amber-300">{a}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {prev && (
                                            <div className="p-3 bg-blue-500/10 backdrop-blur-sm rounded-xl border border-blue-500/20">
                                                <p className="font-black text-blue-400 text-xs uppercase tracking-widest mb-1">Evolución vs Estudio Previo</p>
                                                <div className="grid grid-cols-2 gap-3 mt-2">
                                                    {[
                                                        { label: 'PTA OD', curr: audio.pta_od, prev: prev.pta_od },
                                                        { label: 'PTA OI', curr: audio.pta_oi, prev: prev.pta_oi },
                                                    ].map(({ label, curr, prev: p }) => {
                                                        const diff = (curr || 0) - (p || 0)
                                                        return (
                                                            <div key={label}>
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase">{label}</p>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-sm font-black text-slate-200">{p} → {curr}</span>
                                                                    <span className={`text-xs font-bold ${diff > 5 ? 'text-red-400' : diff < -5 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                                        {diff > 0 ? <TrendingUp className="w-3 h-3 inline" /> : diff < 0 ? <TrendingDown className="w-3 h-3 inline" /> : <Minus className="w-3 h-3 inline" />}
                                                                        {' '}{diff > 0 ? '+' : ''}{diff} dB
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </details>

                            {/* ── 8. RECOMENDACIONES DETALLADAS ── */}
                            <details className="group border border-emerald-500/20 bg-emerald-900/10 backdrop-blur-xl shadow-lg rounded-xl overflow-hidden">
                                <summary className="w-full p-5 flex items-center justify-between cursor-pointer list-none hover:bg-white/[0.02] focus:outline-none [&::-webkit-details-marker]:hidden">
                                    <div className="flex items-center gap-2 pointer-events-none">
                                        <Shield className="w-4 h-4 text-emerald-400" />
                                        <p className="text-sm font-black text-emerald-300 uppercase tracking-wide mb-0">Recomendaciones Clínicas</p>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180 flex-shrink-0" />
                                </summary>
                                <div className="p-5 pt-0 border-t border-emerald-500/10">
                                    <ul className="space-y-2">
                                        {[
                                            audio.pta_od > 25 || audio.pta_oi > 25
                                                ? 'Reevaluación audiométrica en 6 meses con audiometría de alta frecuencia'
                                                : 'Control audiométrico anual preventivo conforme NOM-011-STPS',
                                            (audio.pta_od > 25 || audio.pta_oi > 25) && 'Uso obligatorio de EPP auditivo certificado (NRR ≥ 25 dB) en áreas de riesgo',
                                            hasDPN && 'Incluir logoaudiometría y timpanometría para estudio complementario',
                                            hasDPN && 'Evaluar rotación de puesto a área con < 80 dB (NOM-011-STPS)',
                                            audio.pta_od > 40 || audio.pta_oi > 40 ? 'Referir a otorrinolaringólogo para valoración completa y posible auxiliar auditivo' : null,
                                            asymmetry > 15 && `Asimetría significativa (Δ${asymmetry}dB) — Descartar patología retrococlear o neurinoma`,
                                            disabilityPct > 0 && `Porcentaje de discapacidad AMA: ${disabilityPct}% — Documentar para dictamen ocupacional`,
                                            (siiOd > 40 || siiOi > 40) ? 'Umbral de habla reducido — Evaluar capacidad de comunicación para puesto actual' : null,
                                            'Verificar calibración del audiómetro (certificado vigente)',
                                            'Registrar en expediente ocupacional conforme NOM-030-STPS',
                                        ].filter(Boolean).map((r, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                                <ArrowRight className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                <span>{r as string}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </details>

                        </motion.div>
                    )
                })()}
            </AnimatePresence>
        </div>
    )
}

