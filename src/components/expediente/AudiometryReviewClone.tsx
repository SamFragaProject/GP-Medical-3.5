/**
 * AudiometryReviewClone — Clon Visual del Reporte de Audiometría
 * Se muestra en la fase REVIEW dentro de EstudioUploadReview
 * Renderiza: Audiograma SVG animado + Tabla de Umbrales + Diagnóstico + Equipo
 */
import React from 'react'
import { motion } from 'framer-motion'
import { Ear, CheckCircle, AlertTriangle, Volume2, VolumeX, Shield } from 'lucide-react'

// ── Frecuencias estándar ──
const FREQS = ['125', '250', '500', '750', '1000', '1500', '2000', '3000', '4000', '6000', '8000']
const FREQ_LABELS: Record<string, string> = {
    '125': '125', '250': '250', '500': '500', '750': '750',
    '1000': '1K', '1500': '1.5K', '2000': '2K', '3000': '3K',
    '4000': '4K', '6000': '6K', '8000': '8K'
}
const FREQS_PTA = ['500', '1000', '2000', '4000']

// ── Clasificación ──
const classifyDb = (db: number) => {
    if (db <= 25) return { label: 'Normal', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dotColor: '#10b981' }
    if (db <= 40) return { label: 'Leve', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dotColor: '#f59e0b' }
    if (db <= 55) return { label: 'Moderada', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', dotColor: '#f97316' }
    if (db <= 70) return { label: 'Mod-Severa', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dotColor: '#ef4444' }
    if (db <= 90) return { label: 'Severa', color: 'text-red-800', bg: 'bg-red-100', border: 'border-red-300', dotColor: '#dc2626' }
    return { label: 'Profunda', color: 'text-red-900', bg: 'bg-red-200', border: 'border-red-400', dotColor: '#991b1b' }
}

interface AudioCloneData {
    patient?: { name?: string; dob?: string; age?: string; sex?: string }
    testDetails?: { audiometryDate?: string; medicalRecordDate?: string; doctor?: string }
    thresholds?: {
        right?: { frequency: string; value: number | null }[]
        left?: { frequency: string; value: number | null }[]
    }
    diagnosis?: { rightEar?: string; leftEar?: string; general?: string }
    equipment?: { device?: string; serialNumber?: string; calibrationDate?: string }
}

// ── Audiograma SVG ──
function AudiogramSVG({ od, oi }: { od: Record<string, number>; oi: Record<string, number> }) {
    const W = 560, H = 300
    const PAD_L = 48, PAD_R = 20, PAD_T = 34, PAD_B = 40
    const chartW = W - PAD_L - PAD_R
    const chartH = H - PAD_T - PAD_B
    const dbMin = -10, dbMax = 120

    const xFor = (i: number) => PAD_L + (i / (FREQS.length - 1)) * chartW
    const yFor = (db: number) => PAD_T + ((db - dbMin) / (dbMax - dbMin)) * chartH

    const zones = [
        { from: -10, to: 25, color: 'rgba(16,185,129,0.08)', label: 'Normal' },
        { from: 25, to: 40, color: 'rgba(251,191,36,0.10)', label: 'Leve' },
        { from: 40, to: 55, color: 'rgba(249,115,22,0.10)', label: 'Moderada' },
        { from: 55, to: 120, color: 'rgba(239,68,68,0.08)', label: 'Severa+' },
    ]
    const dbs = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110]

    const validOdFreqs = FREQS.filter(f => od[f] !== undefined)
    const validOiFreqs = FREQS.filter(f => oi[f] !== undefined)
    const odPts = validOdFreqs.map(f => `${xFor(FREQS.indexOf(f))},${yFor(od[f])}`).join(' ')
    const oiPts = validOiFreqs.map(f => `${xFor(FREQS.indexOf(f))},${yFor(oi[f])}`).join(' ')

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            {/* Zonas de fondo */}
            {zones.map((z, i) => (
                <rect key={i} x={PAD_L} y={yFor(z.from)} width={chartW}
                    height={Math.max(0, yFor(z.to) - yFor(z.from))} fill={z.color} />
            ))}
            {zones.map((z, i) => (
                <text key={`zl-${i}`} x={PAD_L + 4} y={yFor(z.from) + 11}
                    fontSize="7" fontWeight="700" fill="rgba(100,116,139,0.5)">{z.label}</text>
            ))}

            {/* Grid horizontal */}
            {dbs.map(db => (
                <g key={db}>
                    <line x1={PAD_L} y1={yFor(db)} x2={W - PAD_R} y2={yFor(db)}
                        stroke={db % 20 === 0 ? '#cbd5e1' : '#f1f5f9'}
                        strokeWidth={db % 20 === 0 ? 0.8 : 0.5} />
                    {db % 10 === 0 && (
                        <text x={PAD_L - 6} y={yFor(db) + 3} textAnchor="end"
                            fontSize="7.5" fontWeight="700" fill="#94a3b8">{db}</text>
                    )}
                </g>
            ))}

            {/* Grid vertical + frecuencias */}
            {FREQS.map((f, i) => (
                <g key={f}>
                    <line x1={xFor(i)} y1={PAD_T} x2={xFor(i)} y2={H - PAD_B}
                        stroke="#f1f5f9" strokeWidth="0.8" />
                    <text x={xFor(i)} y={H - PAD_B + 14} textAnchor="middle"
                        fontSize="8" fontWeight="800" fill="#64748b">{FREQ_LABELS[f]}</text>
                </g>
            ))}

            {/* Borde */}
            <rect x={PAD_L} y={PAD_T} width={chartW} height={chartH}
                fill="none" stroke="#e2e8f0" strokeWidth="1" />

            {/* OD — Línea roja con círculos */}
            {validOdFreqs.length > 1 && (
                <motion.polyline
                    points={odPts} fill="none" stroke="#ef4444" strokeWidth="2.5"
                    strokeLinejoin="round" strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                />
            )}
            {validOdFreqs.map((f, idx) => (
                <motion.circle key={`od-${f}`} cx={xFor(FREQS.indexOf(f))} cy={yFor(od[f])} r="5.5"
                    fill="#ef4444" stroke="white" strokeWidth="2"
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.06 + 0.4, duration: 0.3, type: 'spring' }}
                />
            ))}

            {/* OI — Línea azul con X */}
            {validOiFreqs.length > 1 && (
                <motion.polyline
                    points={oiPts} fill="none" stroke="#3b82f6" strokeWidth="2.5"
                    strokeDasharray="7,4" strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                />
            )}
            {validOiFreqs.map((f, idx) => {
                const cx = xFor(FREQS.indexOf(f)), cy = yFor(oi[f]), r = 5
                return (
                    <motion.g key={`oi-${f}`}
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ delay: idx * 0.06 + 0.6, duration: 0.3, type: 'spring' }}
                    >
                        <line x1={cx - r} y1={cy - r} x2={cx + r} y2={cy + r} stroke="#3b82f6" strokeWidth="2.5" />
                        <line x1={cx + r} y1={cy - r} x2={cx - r} y2={cy + r} stroke="#3b82f6" strokeWidth="2.5" />
                    </motion.g>
                )
            })}

            {/* Ejes */}
            <text x={11} y={H / 2} textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#94a3b8"
                transform={`rotate(-90, 11, ${H / 2})`}>dB HL</text>
            <text x={PAD_L + chartW / 2} y={H - 4} textAnchor="middle"
                fontSize="7.5" fontWeight="800" fill="#94a3b8">FRECUENCIA (Hz)</text>

            {/* Leyenda */}
            <circle cx={PAD_L + 6} cy={PAD_T - 14} r="4.5" fill="#ef4444" />
            <text x={PAD_L + 15} y={PAD_T - 10} fontSize="8.5" fontWeight="700" fill="#64748b">OD — Oído Derecho</text>
            <line x1={PAD_L + 135} y1={PAD_T - 18} x2={PAD_L + 143} y2={PAD_T - 10} stroke="#3b82f6" strokeWidth="2.5" />
            <line x1={PAD_L + 143} y1={PAD_T - 18} x2={PAD_L + 135} y2={PAD_T - 10} stroke="#3b82f6" strokeWidth="2.5" />
            <text x={PAD_L + 150} y={PAD_T - 10} fontSize="8.5" fontWeight="700" fill="#64748b">OI — Oído Izquierdo</text>
        </svg>
    )
}

// ── PTA Gauge circular ──
function PTAGauge({ value, label, color }: { value: number; label: string; color: 'red' | 'blue' }) {
    const max = 90, pct = Math.min(value / max, 1)
    const r = 38, cx = 50, cy = 50, circ = 2 * Math.PI * r
    const strokeColors = { red: '#ef4444', blue: '#3b82f6' }
    const cls = classifyDb(value)
    return (
        <div className={`p-4 rounded-2xl ${cls.bg} border ${cls.border} text-center`}>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
            <div className="relative mx-auto w-24 h-24">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <motion.circle cx={cx} cy={cy} r={r} fill="none"
                        stroke={strokeColors[color]} strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={circ}
                        initial={{ strokeDashoffset: circ }}
                        animate={{ strokeDashoffset: circ * (1 - pct) }}
                        transition={{ duration: 1.0, ease: 'easeOut', delay: 0.3 }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className={`text-xl font-black ${color === 'red' ? 'text-red-600' : 'text-blue-600'}`}>{value}</p>
                    <p className="text-[8px] font-bold text-slate-400">dB HL</p>
                </div>
            </div>
            <p className={`text-[10px] font-black mt-1 ${cls.color}`}>{cls.label}</p>
        </div>
    )
}

// ── COMPONENTE PRINCIPAL ──
export default function AudiometryReviewClone({ data }: { data: AudioCloneData }) {
    // Mapear umbrales a Records
    const od: Record<string, number> = {}
    const oi: Record<string, number> = {}
    ;(data.thresholds?.right || []).forEach(t => {
        if (t.value !== null && t.value !== undefined) od[t.frequency] = t.value
    })
    ;(data.thresholds?.left || []).forEach(t => {
        if (t.value !== null && t.value !== undefined) oi[t.frequency] = t.value
    })

    // PTA
    const ptaOd = FREQS_PTA.some(f => od[f] !== undefined)
        ? Math.round(FREQS_PTA.reduce((s, f) => s + (od[f] || 0), 0) / FREQS_PTA.filter(f => od[f] !== undefined).length || 1)
        : 0
    const ptaOi = FREQS_PTA.some(f => oi[f] !== undefined)
        ? Math.round(FREQS_PTA.reduce((s, f) => s + (oi[f] || 0), 0) / FREQS_PTA.filter(f => oi[f] !== undefined).length || 1)
        : 0

    const diagOd = data.diagnosis?.rightEar || '—'
    const diagOi = data.diagnosis?.leftEar || '—'
    const generalCls = classifyDb(Math.max(ptaOd, ptaOi))
    const isNormal = ptaOd <= 25 && ptaOi <= 25

    return (
        <div className="space-y-5">
            {/* ── HEADER GP MEDICAL ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="text-teal-400 font-bold text-lg flex items-center gap-1">
                            ➕ <span className="text-white">GP Medical Health</span>
                        </div>
                    </div>
                    <div className="text-right text-white">
                        <p className="text-sm font-bold">AUDIOMETRÍA TONAL — CLON DIGITAL</p>
                        <p className="text-xs text-slate-400">{data.testDetails?.doctor || 'Medicina del Trabajo'}</p>
                    </div>
                </div>

                {/* Paciente */}
                <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-4">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Paciente</p>
                        <p className="text-sm font-bold text-slate-800">{data.patient?.name || '—'}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">F. Nacimiento</p>
                        <p className="text-sm font-bold text-slate-800">{data.patient?.dob || '—'}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Edad</p>
                        <p className="text-sm font-bold text-slate-800">{data.patient?.age || '—'}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sexo</p>
                        <p className="text-sm font-bold text-slate-800">{data.patient?.sex || '—'}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Fecha</p>
                        <p className="text-sm font-bold text-slate-800">{data.testDetails?.audiometryDate || '—'}</p>
                    </div>
                </div>
            </div>

            {/* ── AUDIOGRAMA ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-1">
                    Audiograma — Vía Aérea Bilateral
                </p>
                <AudiogramSVG od={od} oi={oi} />
            </div>

            {/* ── PTA GAUGES ── */}
            <div className="grid grid-cols-2 gap-4">
                <PTAGauge value={ptaOd} label="PTA Oído Derecho (500-4KHz)" color="red" />
                <PTAGauge value={ptaOi} label="PTA Oído Izquierdo (500-4KHz)" color="blue" />
            </div>

            {/* ── TABLA DE UMBRALES ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 pt-4 pb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Tabla de Umbrales — Vía Aérea (dB HL)
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-y border-slate-100">
                                <th className="text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Oído</th>
                                {FREQS.map(f => (
                                    <th key={f} className="px-2 py-2.5 text-center text-[10px] font-black uppercase text-slate-500 whitespace-nowrap">
                                        {FREQ_LABELS[f]}
                                    </th>
                                ))}
                                <th className="px-3 py-2.5 text-center text-[10px] font-black uppercase text-slate-500">PTA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { key: 'OD', dataMap: od, pta: ptaOd, color: 'text-red-600', dot: 'bg-red-500' },
                                { key: 'OI', dataMap: oi, pta: ptaOi, color: 'text-blue-600', dot: 'bg-blue-500' },
                            ].map(({ key, dataMap, pta, color, dot }) => (
                                <tr key={key} className="border-b border-slate-50 last:border-0">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                                            <span className={`font-black text-xs ${color}`}>{key}</span>
                                        </div>
                                    </td>
                                    {FREQS.map(f => {
                                        const val = dataMap[f]
                                        const cls = val !== undefined ? classifyDb(val) : null
                                        return (
                                            <td key={f} className={`px-2 py-3 text-center font-bold tabular-nums text-sm ${cls ? cls.color : 'text-slate-300'}`}>
                                                {val !== undefined ? val : '—'}
                                            </td>
                                        )
                                    })}
                                    <td className={`px-3 py-3 text-center font-black text-sm ${color}`}>
                                        {pta}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── DIAGNÓSTICO ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                    className={`p-4 rounded-2xl border ${classifyDb(ptaOd).bg} ${classifyDb(ptaOd).border}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Diagnóstico OD</p>
                    </div>
                    <p className={`text-sm font-black ${classifyDb(ptaOd).color}`}>{diagOd}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
                    className={`p-4 rounded-2xl border ${classifyDb(ptaOi).bg} ${classifyDb(ptaOi).border}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Diagnóstico OI</p>
                    </div>
                    <p className={`text-sm font-black ${classifyDb(ptaOi).color}`}>{diagOi}</p>
                </motion.div>
            </div>

            {/* ── SEMÁFORO GENERAL ── */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.0 }}
                className={`p-5 rounded-2xl border ${generalCls.bg} ${generalCls.border} flex items-center gap-4`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isNormal ? 'bg-emerald-500' : 'bg-red-500'} shadow-lg`}>
                    {isNormal ? <CheckCircle className="w-6 h-6 text-white" /> : <AlertTriangle className="w-6 h-6 text-white" />}
                </div>
                <div>
                    <p className={`text-sm font-black ${generalCls.color}`}>
                        Resultado General: {generalCls.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                        PTA OD: {ptaOd} dB — PTA OI: {ptaOi} dB
                        {data.diagnosis?.general && ` — ${data.diagnosis.general}`}
                    </p>
                </div>
            </motion.div>

            {/* ── EQUIPO ── */}
            {data.equipment?.device && (
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Equipo', value: data.equipment.device },
                        { label: 'N° Serie', value: data.equipment.serialNumber || '—' },
                        { label: 'Calibración', value: data.equipment.calibrationDate || '—' },
                    ].map(({ label, value }) => (
                        <div key={label} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                            <p className="text-xs font-bold text-slate-700 mt-0.5">{value}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
