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
    Upload, Loader2, Inbox, X, Save, Eye
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { getExpedienteDemoCompleto } from '@/data/demoPacienteCompleto'
import DocumentosAdjuntos from '@/components/expediente/DocumentosAdjuntos'
import AudiometryReviewClone from '@/components/expediente/AudiometryReviewClone'
import { analyzeAudiometryDirect } from '@/services/geminiDocumentService'
import { secureStorageService } from '@/services/secureStorageService'
import { useAuth } from '@/contexts/AuthContext'

// ── Frecuencias estándar audiograma ──
const FREQS_ALL = ['125', '250', '500', '750', '1000', '1500', '2000', '3000', '4000', '6000', '8000']
const FREQS_PTA = ['500', '1000', '2000', '4000'] // ISO 1999 PTA
const FREQ_LABELS: Record<string, string> = {
    '125': '125', '250': '250', '500': '500', '750': '750',
    '1000': '1K', '1500': '1.5K', '2000': '2K', '3000': '3K',
    '4000': '4K', '6000': '6K', '8000': '8K'
}

// ── Clasificación NOM-011 / ISO ──
const classifyDb = (db: number): { label: string; color: string; bg: string; border: string } => {
    if (db <= 25) return { label: 'Normal', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' }
    if (db <= 40) return { label: 'Pérdida Leve', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' }
    if (db <= 55) return { label: 'Pérdida Moderada', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' }
    if (db <= 70) return { label: 'Pérdida Moderada-Severa', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' }
    if (db <= 90) return { label: 'Pérdida Severa', color: 'text-red-800', bg: 'bg-red-100', border: 'border-red-300' }
    return { label: 'Pérdida Profunda', color: 'text-red-900', bg: 'bg-red-200', border: 'border-red-400' }
}

const getSemaforo = (pta: number) => {
    if (pta <= 25) return 'verde'
    if (pta <= 40) return 'amarillo'
    return 'rojo'
}
const SEMAFORO_STYLES = {
    verde: { bg: 'bg-emerald-500', ring: 'ring-emerald-200', text: 'text-emerald-700', label: 'Normal', bgLight: 'bg-emerald-50', border: 'border-emerald-200' },
    amarillo: { bg: 'bg-amber-500', ring: 'ring-amber-200', text: 'text-amber-700', label: 'Vigilancia', bgLight: 'bg-amber-50', border: 'border-amber-200' },
    rojo: { bg: 'bg-red-500', ring: 'ring-red-200', text: 'text-red-700', label: 'Riesgo', bgLight: 'bg-red-50', border: 'border-red-200' },
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
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto min-w-[340px]">
                {/* Fondos de zona */}
                {zones.map((z, i) => (
                    <rect key={i} x={PAD_L} y={yFor(z.from)} width={chartW}
                        height={Math.max(0, yFor(z.to) - yFor(z.from))} fill={z.color} />
                ))}
                {/* Etiquetas de zona */}
                {zones.map((z, i) => (
                    <text key={`zl-${i}`} x={PAD_L + 4} y={yFor(z.from) + 10}
                        fontSize="6" fontWeight="700" fill="rgba(100,116,139,0.6)">{z.label}</text>
                ))}

                {/* Grid horizontal */}
                {dbs.map(db => (
                    <g key={db}>
                        <line x1={PAD_L} y1={yFor(db)} x2={W - PAD_R} y2={yFor(db)}
                            stroke={db % 20 === 0 ? '#cbd5e1' : '#f1f5f9'}
                            strokeWidth={db % 20 === 0 ? 0.8 : 0.5} />
                        {db % 10 === 0 && (
                            <text x={PAD_L - 5} y={yFor(db) + 3} textAnchor="end"
                                fontSize="7" fontWeight="700" fill="#94a3b8">{db}</text>
                        )}
                    </g>
                ))}

                {/* Grid vertical + etiquetas frecuencia */}
                {FREQS_ALL.map((f, i) => (
                    <g key={f}>
                        <line x1={xFor(i)} y1={PAD_T} x2={xFor(i)} y2={H - PAD_B}
                            stroke="#f1f5f9" strokeWidth="0.8" />
                        <text x={xFor(i)} y={H - PAD_B + 14} textAnchor="middle"
                            fontSize="7.5" fontWeight="800" fill="#64748b">{FREQ_LABELS[f]}</text>
                    </g>
                ))}

                {/* Borde del área de gráfica */}
                <rect x={PAD_L} y={PAD_T} width={chartW} height={chartH}
                    fill="none" stroke="#e2e8f0" strokeWidth="1" />

                {/* OD - Oído Derecho (Rojo, círculos) */}
                <motion.polyline
                    points={odPts} fill="none" stroke="#ef4444" strokeWidth="2.5"
                    strokeLinejoin="round" strokeLinecap="round"
                    initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
                    animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                />
                {FREQS_ALL.map((f, i) => (
                    <motion.circle key={`od-${f}`} cx={xFor(i)} cy={yFor(od[f] ?? 0)} r="5"
                        fill="#ef4444" stroke="white" strokeWidth="2"
                        initial={animated ? { scale: 0 } : undefined}
                        animate={animated ? { scale: 1 } : undefined}
                        transition={{ delay: i * 0.08 + 0.5, duration: 0.3, type: 'spring' }}
                    />
                ))}

                {/* OI - Oído Izquierdo (Azul, X) */}
                <motion.polyline
                    points={oiPts} fill="none" stroke="#3b82f6" strokeWidth="2.5"
                    strokeDasharray="7,4" strokeLinejoin="round"
                    initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
                    animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                />
                {FREQS_ALL.map((f, i) => {
                    const cx = xFor(i), cy = yFor(oi[f] ?? 0), r = 5
                    return (
                        <motion.g key={`oi-${f}`}
                            initial={animated ? { scale: 0 } : undefined}
                            animate={animated ? { scale: 1 } : undefined}
                            transition={{ delay: i * 0.08 + 0.7, duration: 0.3, type: 'spring' }}
                        >
                            <line x1={cx - r} y1={cy - r} x2={cx + r} y2={cy + r} stroke="#3b82f6" strokeWidth="2.5" />
                            <line x1={cx + r} y1={cy - r} x2={cx - r} y2={cy + r} stroke="#3b82f6" strokeWidth="2.5" />
                        </motion.g>
                    )
                })}

                {/* Eje Y label */}
                <text x={11} y={H / 2} textAnchor="middle" fontSize="7" fontWeight="800" fill="#94a3b8"
                    transform={`rotate(-90, 11, ${H / 2})`}>dB HL</text>
                {/* Eje X label */}
                <text x={PAD_L + chartW / 2} y={H - 2} textAnchor="middle"
                    fontSize="7" fontWeight="800" fill="#94a3b8">FRECUENCIA (Hz)</text>

                {/* Leyenda */}
                <circle cx={PAD_L + 6} cy={PAD_T - 12} r="4" fill="#ef4444" />
                <text x={PAD_L + 14} y={PAD_T - 9} fontSize="8" fontWeight="700" fill="#64748b">OD — Oído Derecho</text>
                <line x1={PAD_L + 115} y1={PAD_T - 16} x2={PAD_L + 123} y2={PAD_T - 8} stroke="#3b82f6" strokeWidth="2.5" />
                <line x1={PAD_L + 123} y1={PAD_T - 16} x2={PAD_L + 115} y2={PAD_T - 8} stroke="#3b82f6" strokeWidth="2.5" />
                <text x={PAD_L + 130} y={PAD_T - 9} fontSize="8" fontWeight="700" fill="#64748b">OI — Oído Izquierdo</text>
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
        <div className={`p-4 rounded-2xl ${cls.bg} border ${cls.border} text-center`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{label}</p>
            <div className="relative mx-auto w-28 h-28">
                <svg viewBox="0 0 112 112" className="w-full h-full -rotate-90">
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
                    <motion.circle
                        cx={cx} cy={cy} r={r} fill="none"
                        stroke={strokeColors[color]} strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        initial={{ strokeDashoffset: circ }}
                        animate={{ strokeDashoffset: circ * (1 - pct) }}
                        transition={{ duration: 1.0, ease: 'easeOut', delay: 0.3 }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className={`text-2xl font-black ${color === 'red' ? 'text-red-600' : 'text-blue-600'}`}>{value}</p>
                    <p className="text-[9px] font-bold text-slate-400">dB HL</p>
                </div>
            </div>
            <p className={`text-xs font-black mt-1 ${cls.color}`}>{cls.label}</p>
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
            const resultados: any[] = []
            const od = previewData.thresholds?.right || []
            const oi = previewData.thresholds?.left || []

            od.forEach((t: any) => {
                if (t.value !== null && t.value !== undefined) {
                    resultados.push({ parametro_nombre: `OD_${t.frequency}Hz`, resultado_numerico: t.value, resultado: String(t.value), unidad: 'dB HL', categoria: 'Oído Derecho' })
                }
            })
            oi.forEach((t: any) => {
                if (t.value !== null && t.value !== undefined) {
                    resultados.push({ parametro_nombre: `OI_${t.frequency}Hz`, resultado_numerico: t.value, resultado: String(t.value), unidad: 'dB HL', categoria: 'Oído Izquierdo' })
                }
            })

            const audiogramBlob = FREQS_ALL.map(f => {
                const odVal = od.find((t: any) => t.frequency === f)?.value
                const oiVal = oi.find((t: any) => t.frequency === f)?.value
                return { frecuencia: f, od: odVal ?? null, oi: oiVal ?? null }
            })
            resultados.push({ parametro_nombre: 'AUDIOGRAMA_DATOS', resultado: JSON.stringify(audiogramBlob), categoria: 'Audiograma' })

            if (previewData.diagnosis?.rightEar) resultados.push({ parametro_nombre: 'DIAGNOSTICO_OD', resultado: previewData.diagnosis.rightEar, categoria: 'Diagnóstico' })
            if (previewData.diagnosis?.leftEar) resultados.push({ parametro_nombre: 'DIAGNOSTICO_OI', resultado: previewData.diagnosis.leftEar, categoria: 'Diagnóstico' })
            if (previewData.diagnosis?.general) resultados.push({ parametro_nombre: 'DIAGNOSTICO_GENERAL', resultado: previewData.diagnosis.general, categoria: 'Diagnóstico' })
            if (previewData.equipment?.device) resultados.push({ parametro_nombre: 'EQUIPO', resultado: previewData.equipment.device, categoria: 'Datos del Estudio' })
            if (previewData.testDetails?.doctor) resultados.push({ parametro_nombre: 'MEDICO_RESPONSABLE', resultado: previewData.testDetails.doctor, categoria: 'Datos del Estudio' })

            const { data: estudio, error: dbErr } = await supabase.from('estudios_clinicos').insert({
                paciente_id: pacienteId,
                tipo_estudio: 'audiometria',
                fecha_estudio: new Date().toISOString().split('T')[0],
                medico_responsable: previewData.testDetails?.doctor || '',
                equipo: previewData.equipment?.device || '',
                diagnostico: previewData.diagnosis?.general || `OD: ${previewData.diagnosis?.rightEar || '—'} | OI: ${previewData.diagnosis?.leftEar || '—'}`,
                datos_extra: {
                    audioclone_data: previewData,
                    _source: 'AudioClone Pipeline',
                    _extracted_at: new Date().toISOString(),
                }
            }).select('id').single()
            if (dbErr) throw dbErr

            if (estudio?.id && resultados.length > 0) {
                const rows = resultados.map(r => ({ estudio_id: estudio.id, ...r }))
                await supabase.from('resultados_estudio').insert(rows)
            }

            if (originalFile && empresaId) {
                try {
                    const patientName = previewData.patient?.name || 'Paciente'
                    const fecha = new Date().toISOString().split('T')[0]
                    const ext = originalFile.name.split('.').pop() || 'pdf'
                    const renamedFile = new File(
                        [originalFile],
                        `Audiometria_${patientName.replace(/\s+/g, '_')}_${fecha}.${ext}`,
                        { type: originalFile.type }
                    )
                    await secureStorageService.upload(renamedFile, {
                        pacienteId, empresaId,
                        categoria: 'audiometria',
                        subcategoria: 'reporte_original',
                        descripcion: `Audiometría de ${patientName} — ${fecha}`,
                        userId, userNombre: userName, userRol: userRol,
                    })
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

            // FUENTE 1: Nueva arquitectura unificada
            const { data: estudios } = await supabase
                .from('estudios_clinicos')
                .select('*')
                .eq('paciente_id', pacienteId)
                .eq('tipo_estudio', 'audiometria')
                .order('fecha_estudio', { ascending: false })
                .limit(2)

            if (estudios && estudios.length > 0) {
                for (let idx = 0; idx < estudios.length; idx++) {
                    const { data: resultados } = await supabase
                        .from('resultados_estudio').select('*').eq('estudio_id', estudios[idx].id)
                    if (resultados && resultados.length > 0) {
                        const built = buildFromResultados(estudios[idx], resultados)
                        if (idx === 0) setAudio(built)
                        else setPrev(built)
                    }
                }
                if (audio) return
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
                className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-300 p-5 shadow-lg"
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
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 border border-slate-300 bg-white hover:bg-slate-50 rounded-xl transition-colors"
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
            <div className="overflow-x-auto bg-slate-50/50 p-2 md:p-6 rounded-2xl border border-slate-200 shadow-inner">
                <div className="min-w-[800px]">
                    <AudiometryReviewClone data={upload.previewData} />
                </div>
            </div>
        </div>
    )

    // ── Sin datos → Subir PDF ── Idéntico a EspirometriaTab
    if (!audio) return (
        <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Ear className="w-8 h-8 text-violet-300" />
                </div>
                <h3 className="text-slate-800 font-bold text-lg">Sin registros de audiometría</h3>
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
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
                            <Ear className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Audiometría Tonal</h3>
                            <p className="text-xs text-slate-400 font-medium">
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
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 text-xs font-bold hover:bg-violet-100 transition-colors disabled:opacity-50"
                        >
                            {upload.uploading ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Procesando...</>
                            ) : (
                                <><RefreshCw className="w-3.5 h-3.5" /> Actualizar Estudio</>
                            )}
                        </button>
                        <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Fecha</p>
                            <p className="text-sm font-bold text-slate-700">
                                {audio.fecha ? new Date(audio.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                            </p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl ${semStyle.bgLight} border ${semStyle.border}`}>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Resultado</p>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-3 h-3 rounded-full ${semStyle.bg}`} />
                                <p className={`text-sm font-bold ${semStyle.text}`}>{semStyle.label}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Diagnóstico */}
                {audio.diagnostico && (
                    <div className={`mt-4 flex items-start gap-3 p-3 rounded-xl ${semStyle.bgLight} border ${semStyle.border}`}>
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
                                className="flex items-start gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
                                <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs font-medium text-amber-700">{a}</p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── TABS: ESCÁNER / ANÁLISIS ── */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
                {(['scanner', 'analisis'] as const).map(s => (
                    <button key={s} onClick={() => setActiveSection(s)}
                        className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeSection === s
                            ? 'bg-white text-violet-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
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
                        <Card className="border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-4 pt-4 pb-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Tabla de Umbrales — Vía Aérea (dB HL)
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-y border-slate-100">
                                            <th className="text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Oído</th>
                                            {FREQS_ALL.map(f => (
                                                <th key={f} className="px-2 py-2.5 text-center text-[10px] font-black uppercase text-slate-500 whitespace-nowrap">
                                                    {FREQ_LABELS[f]}
                                                </th>
                                            ))}
                                            <th className="px-3 py-2.5 text-center text-[10px] font-black uppercase text-slate-500">PTA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { key: 'OD', data: odData, pta: audio.pta_od, color: 'text-red-600', dot: 'bg-red-500' },
                                            { key: 'OI', data: oiData, pta: audio.pta_oi, color: 'text-blue-600', dot: 'bg-blue-500' },
                                        ].map(({ key, data, pta, color, dot }) => (
                                            <tr key={key} className="border-b border-slate-50 last:border-0">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                                                        <span className={`font-black text-xs ${color}`}>{key}</span>
                                                    </div>
                                                </td>
                                                {FREQS_ALL.map(f => {
                                                    const val = data[f]
                                                    const cls = val !== undefined ? classifyDb(val) : null
                                                    return (
                                                        <td key={f} className={`px-2 py-3 text-center font-bold tabular-nums text-sm ${cls ? cls.color : 'text-slate-300'}`}>
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
                                <div key={label} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                                    <p className="text-xs font-bold text-slate-700 mt-0.5 leading-relaxed">{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Archivo original */}
                        <DocumentosAdjuntos pacienteId={pacienteId} categoria="audiometria" titulo="Archivo Original (PDF/Imagen)" collapsedByDefault={false} />

                        {/* Comparación con estudio previo */}
                        {prev && (
                            <>
                                <button onClick={() => setShowPrev(!showPrev)}
                                    className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <span className="text-xs font-bold text-slate-500">
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
                    SECCIÓN 2: ANÁLISIS IA SIN LÍMITE
                ══════════════════════════════════════ */}
                {activeSection === 'analisis' && (
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
                                        <p className="font-black text-sm">Análisis Audiológico IA</p>
                                        <p className="text-violet-200 text-xs">Interpretación clínica avanzada — sin límite de argumentación</p>
                                    </div>
                                </div>
                                <p className="text-sm text-violet-100 leading-relaxed">
                                    {audio.resumen || `Audiometría tonal de vía aérea. PTA OD: ${audio.pta_od} dB — PTA OI: ${audio.pta_oi} dB. ${audio.diagnostico || 'Resultado registrado.'}`}
                                </p>
                            </div>
                        </div>

                        {/* Gauges PTA */}
                        <div className="grid grid-cols-2 gap-4">
                            <PTAGauge value={audio.pta_od || 0} label="PTA Oído Derecho" color="red" />
                            <PTAGauge value={audio.pta_oi || 0} label="PTA Oído Izquierdo" color="blue" />
                        </div>

                        {/* Barras por frecuencia — espectro completo */}
                        <Card className="border-slate-100 shadow-sm">
                            <CardContent className="p-5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                                    Espectro Completo — dB por Frecuencia
                                </p>
                                <div className="flex justify-between items-end gap-1 overflow-x-auto pb-2">
                                    {FREQS_ALL.map((f, i) => (
                                        <FreqBar key={f} freq={f}
                                            od={odData[f] ?? 0} oi={oiData[f] ?? 0}
                                            delay={i * 0.05} />
                                    ))}
                                </div>
                                <div className="flex gap-4 mt-3 justify-center">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-sm bg-red-500" />
                                        <span className="text-[10px] font-bold text-slate-500">OD (Derecho)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-sm bg-blue-500" />
                                        <span className="text-[10px] font-bold text-slate-500">OI (Izquierdo)</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Clasificación por frecuencia — tabla clínica */}
                        <Card className="border-slate-100 shadow-sm">
                            <CardContent className="p-5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                                    Clasificación Clínica por Frecuencia (NOM-011)
                                </p>
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
                                                <div className="w-16 text-center">
                                                    <p className="text-xs font-black text-slate-600">{FREQ_LABELS[f]} Hz</p>
                                                </div>
                                                <div className="flex-1 grid grid-cols-2 gap-2">
                                                    <div>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase">OD</p>
                                                        <p className={`text-sm font-black ${odCls?.color || 'text-slate-300'}`}>
                                                            {od !== undefined ? `${od} dB` : '—'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase">OI</p>
                                                        <p className={`text-sm font-black ${oiCls?.color || 'text-slate-300'}`}>
                                                            {oi !== undefined ? `${oi} dB` : '—'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right w-36">
                                                    <p className={`text-xs font-black ${wCls.color}`}>{wCls.label}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Interpretación clínica expandida */}
                        <Card className="border-violet-100 shadow-sm bg-gradient-to-br from-violet-50 to-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Brain className="w-4 h-4 text-violet-600" />
                                    <p className="text-sm font-black text-slate-800 uppercase tracking-wide">Interpretación Audiológica Completa</p>
                                </div>
                                <div className="space-y-3 text-sm text-slate-700">
                                    <div className="p-3 bg-white rounded-xl border border-violet-100">
                                        <p className="font-black text-violet-700 text-xs uppercase tracking-widest mb-1">Perfil de Umbral</p>
                                        <p className="leading-relaxed">
                                            PTA bilateral: OD <strong>{audio.pta_od} dB</strong> — OI <strong>{audio.pta_oi} dB</strong>.{' '}
                                            {classifyDb(Math.max(audio.pta_od || 0, audio.pta_oi || 0)).label}.{' '}
                                            {audio.diagnostico || ''}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-white rounded-xl border border-violet-100">
                                        <p className="font-black text-violet-700 text-xs uppercase tracking-widest mb-1">Relevancia Laboral</p>
                                        <p className="leading-relaxed">
                                            {audio.pta_od <= 25 && audio.pta_oi <= 25
                                                ? 'Audición dentro de límites normales. Sin restricción laboral por exposición a ruido.'
                                                : audio.pta_od > 40 || audio.pta_oi > 40
                                                    ? 'Hipoacusia que puede afectar la seguridad en entornos ruidosos. Se recomienda valoración especializada y EPP auditivo obligatorio.'
                                                    : 'Umbral auditivo en zona de vigilancia. Monitorео periódico recomendado. Uso de EPP auditivo preventivo.'}
                                        </p>
                                    </div>
                                    {alertas.length > 0 && (
                                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                                            <p className="font-black text-amber-700 text-xs uppercase tracking-widest mb-2">Hallazgos Clínicos</p>
                                            <ul className="space-y-1">
                                                {alertas.map((a, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <Zap className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                                                        <span className="text-xs text-amber-700">{a}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {prev && (
                                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                            <p className="font-black text-blue-700 text-xs uppercase tracking-widest mb-1">Evolución vs Estudio Previo</p>
                                            <div className="grid grid-cols-2 gap-3 mt-2">
                                                {[
                                                    { label: 'PTA OD', curr: audio.pta_od, prev: prev.pta_od, color: 'red' },
                                                    { label: 'PTA OI', curr: audio.pta_oi, prev: prev.pta_oi, color: 'blue' },
                                                ].map(({ label, curr, prev: p, color }) => {
                                                    const diff = (curr || 0) - (p || 0)
                                                    return (
                                                        <div key={label}>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase">{label}</p>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-sm font-black text-slate-700">{p} → {curr}</span>
                                                                <span className={`text-xs font-bold ${diff > 5 ? 'text-red-600' : diff < -5 ? 'text-emerald-600' : 'text-slate-400'}`}>
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
                            </CardContent>
                        </Card>

                        {/* Recomendaciones */}
                        <Card className="border-emerald-100 shadow-sm">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Shield className="w-4 h-4 text-emerald-500" />
                                    <p className="text-sm font-black text-slate-800 uppercase tracking-wide">Recomendaciones</p>
                                </div>
                                <ul className="space-y-2">
                                    {[
                                        audio.pta_od > 25 || audio.pta_oi > 25
                                            ? 'Reevaluación audiométrica en 6 meses'
                                            : 'Control audiométrico anual preventivo',
                                        (audio.pta_od > 25 || audio.pta_oi > 25) && 'Uso obligatorio de EPP auditivo en áreas de riesgo (NOM-011)',
                                        audio.pta_od > 40 || audio.pta_oi > 40 ? 'Referir a otorrinolaringólogo para valoración clínica completa' : null,
                                        'Evaluar nivel de exposición a ruido en puesto de trabajo',
                                    ].filter(Boolean).map((r, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                            <ArrowRight className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                            <span>{r as string}</span>
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
