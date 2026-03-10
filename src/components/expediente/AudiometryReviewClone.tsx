// @ts-nocheck
/**
 * AudiometryReviewClone — Réplica digital fiel del formato GP Medical de audiometría.
 * Diseño: Header GP Medical → Datos paciente → Audiogramas OD/OI lado a lado →
 * Simbología → Tablas VA → Diagnóstico → Equipo — Exactamente como el reporte original.
 */
import React from 'react'
import { motion } from 'framer-motion'

/* ── Frecuencias estándar NOM-011 ── */
const FREQS = ['125', '250', '500', '750', '1000', '1500', '2000', '3000', '4000', '6000', '8000']
const FREQ_LABELS: Record<string, string> = {
    '125': '125', '250': '250', '500': '500', '750': '750',
    '1000': '1k', '1500': '1.5k', '2000': '2k', '3000': '3k',
    '4000': '4k', '6000': '6k', '8000': '8k'
}

/* ── Tipos ── */
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

/* ══════════════════════════════════════════════════════
   Audiograma SVG — Un solo oído (como el reporte original)
   ══════════════════════════════════════════════════════ */
function SingleEarAudiogram({ thresholds, ear, color }: {
    thresholds: Record<string, number>
    ear: 'right' | 'left'
    color: string
}) {
    const W = 340, H = 320
    const PAD_L = 42, PAD_R = 14, PAD_T = 24, PAD_B = 30
    const chartW = W - PAD_L - PAD_R
    const chartH = H - PAD_T - PAD_B
    const dbMin = -10, dbMax = 120

    const xFor = (i: number) => PAD_L + (i / (FREQS.length - 1)) * chartW
    const yFor = (db: number) => PAD_T + ((db - dbMin) / (dbMax - dbMin)) * chartH

    const dbs = [-10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]
    const validFreqs = FREQS.filter(f => thresholds[f] !== undefined)
    const pts = validFreqs.map(f => `${xFor(FREQS.indexOf(f))},${yFor(thresholds[f])}`).join(' ')

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Título */}
            <text x={W / 2} y={14} textAnchor="middle" fontSize="11" fontWeight="800" fill="#334155">
                {ear === 'right' ? 'Derecho' : 'Izquierdo'}
            </text>

            {/* Grid horizontal + etiquetas dB */}
            {dbs.map(db => (
                <g key={db}>
                    <line x1={PAD_L} y1={yFor(db)} x2={W - PAD_R} y2={yFor(db)}
                        stroke={db % 10 === 0 ? '#cbd5e1' : '#f1f5f9'}
                        strokeWidth={db === 0 ? 1.2 : 0.5} />
                    {db % 10 === 0 && (
                        <text x={PAD_L - 5} y={yFor(db) + 3.5} textAnchor="end"
                            fontSize="8" fontWeight="600" fill="#94a3b8">{db}</text>
                    )}
                </g>
            ))}

            {/* Grid vertical + frecuencias */}
            {FREQS.map((f, i) => (
                <g key={f}>
                    <line x1={xFor(i)} y1={PAD_T} x2={xFor(i)} y2={H - PAD_B}
                        stroke="#e2e8f0" strokeWidth="0.7" />
                    <text x={xFor(i)} y={H - PAD_B + 14} textAnchor="middle"
                        fontSize="7.5" fontWeight="700" fill="#64748b">{FREQ_LABELS[f]}</text>
                </g>
            ))}

            {/* Borde */}
            <rect x={PAD_L} y={PAD_T} width={chartW} height={chartH}
                fill="none" stroke="#94a3b8" strokeWidth="1" />

            {/* Eje Y label */}
            <text x={8} y={PAD_T - 6} fontSize="8" fontWeight="700" fill="#64748b">dB HL</text>
            {/* Eje X label */}
            <text x={W / 2} y={H - 2} textAnchor="middle" fontSize="8" fontWeight="700" fill="#64748b">Hz</text>

            {/* Línea del oído */}
            {validFreqs.length > 1 && (
                <motion.polyline
                    points={pts} fill="none" stroke={color} strokeWidth="2.2"
                    strokeLinejoin="round" strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.0, ease: 'easeOut' }}
                />
            )}

            {/* Marcadores */}
            {validFreqs.map((f, idx) => {
                const cx = xFor(FREQS.indexOf(f)), cy = yFor(thresholds[f])
                if (ear === 'right') {
                    // OD: Círculos rojos (O)
                    return (
                        <motion.circle key={f} cx={cx} cy={cy} r="5"
                            fill="none" stroke={color} strokeWidth="2.2"
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ delay: idx * 0.05 + 0.3, duration: 0.25, type: 'spring' }}
                        />
                    )
                } else {
                    // OI: X azules
                    const r = 4.5
                    return (
                        <motion.g key={f}
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ delay: idx * 0.05 + 0.3, duration: 0.25, type: 'spring' }}
                        >
                            <line x1={cx - r} y1={cy - r} x2={cx + r} y2={cy + r} stroke={color} strokeWidth="2.2" />
                            <line x1={cx + r} y1={cy - r} x2={cx - r} y2={cy + r} stroke={color} strokeWidth="2.2" />
                        </motion.g>
                    )
                }
            })}
        </svg>
    )
}

/* ══════════════════════════════════════════════════════
   Tabla de simbología (como el original)
   ══════════════════════════════════════════════════════ */
function SymbolLegend() {
    return (
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 text-[10px]">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-slate-200">
                        <th className="py-1 text-left text-slate-500 font-bold"></th>
                        <th className="py-1 text-center font-bold text-red-500">DCHA.</th>
                        <th className="py-1 text-center font-bold text-blue-500">IZQ.</th>
                        <th className="py-1 text-center font-bold text-slate-500">BIL.</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    <tr><td className="py-1 font-semibold text-slate-600">VA</td><td className="text-center text-red-500 text-sm">○</td><td className="text-center text-blue-500 text-sm">✕</td><td className="text-center text-emerald-500 text-sm">⊗</td></tr>
                    <tr><td className="py-1 font-semibold text-slate-600">VA Enmasc.</td><td className="text-center text-red-500 text-sm">△</td><td className="text-center text-blue-500 text-sm">□</td><td className="text-center text-emerald-500 text-sm">△</td></tr>
                    <tr><td className="py-1 font-semibold text-slate-600">UCL</td><td className="text-center text-red-500 font-bold">U</td><td className="text-center text-blue-500 font-bold">U</td><td className="text-center">—</td></tr>
                    <tr><td className="py-1 font-semibold text-slate-600">VO</td><td className="text-center text-red-500 text-sm">&lt;</td><td className="text-center text-blue-500 text-sm">&gt;</td><td className="text-center">—</td></tr>
                    <tr><td className="py-1 font-semibold text-slate-600">VO Enmasc.</td><td className="text-center text-red-500">[</td><td className="text-center text-blue-500">]</td><td className="text-center">—</td></tr>
                    <tr><td className="py-1 font-semibold text-slate-600">FF</td><td className="text-center text-red-500">&lt;</td><td className="text-center text-blue-500">&gt;</td><td className="text-center text-slate-500">M</td></tr>
                    <tr><td className="py-1 font-semibold text-slate-600">FF Enmasc.</td><td className="text-center text-red-500 font-bold">S</td><td className="text-center text-blue-500 font-bold">S</td><td className="text-center text-slate-500 font-bold">S</td></tr>
                    <tr><td className="py-1 font-semibold text-slate-600">FF Ayudada</td><td className="text-center text-red-500 font-bold">A</td><td className="text-center text-blue-500 font-bold">A</td><td className="text-center text-slate-500 font-bold">A</td></tr>
                </tbody>
            </table>
        </div>
    )
}

/* ══════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL — Clon GP Medical Audiometría
   ══════════════════════════════════════════════════════ */
export default function AudiometryReviewClone({ data }: { data: AudioCloneData }) {
    // Mapear umbrales → Records
    const od: Record<string, number> = {}
    const oi: Record<string, number> = {}
    ;(data.thresholds?.right || []).forEach(t => {
        if (t.value !== null && t.value !== undefined) od[t.frequency] = t.value
    })
    ;(data.thresholds?.left || []).forEach(t => {
        if (t.value !== null && t.value !== undefined) oi[t.frequency] = t.value
    })

    const patientDisplay = `${data.patient?.name || '—'} - ${data.patient?.dob || '—'} (${data.patient?.age || '—'} años) - ${data.patient?.sex || '—'}`

    return (
        <div className="bg-white text-slate-800 w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

            {/* ══ HEADER GP MEDICAL ══ */}
            <div className="px-8 py-6 border-b border-slate-200">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="text-teal-600">
                            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                                <path d="M22 2 L26 14 L22 10 L18 14 Z" fill="currentColor" opacity="0.8" />
                                <path d="M10 18 L22 14 L18 22 L14 18 Z" fill="currentColor" opacity="0.6" />
                                <path d="M34 18 L22 14 L26 22 L30 18 Z" fill="currentColor" opacity="0.6" />
                                <path d="M22 42 L18 30 L22 34 L26 30 Z" fill="currentColor" opacity="0.8" />
                                <rect x="20" y="10" width="4" height="24" rx="1" fill="currentColor" />
                                <rect x="10" y="20" width="24" height="4" rx="1" fill="currentColor" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-teal-600 tracking-tight">
                                GP Medical Health
                            </h1>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-lg font-black text-slate-800 tracking-tight">GP MEDICINA LABORAL</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {data.testDetails?.doctor || 'Dr. Especialista en Medicina Laboral'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ══ PACIENTE ══ */}
            <div className="px-8 py-3 bg-slate-50 border-b border-slate-200">
                <p className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    PACIENTE: {patientDisplay}
                </p>
            </div>

            {/* ══ SECCIÓN: Audiometría Tonal ══ */}
            <div className="px-8 py-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-700">
                    1: Audiometría tonal — {data.testDetails?.audiometryDate || '—'} — {data.testDetails?.doctor || '—'}
                </p>
            </div>

            {/* ══ AUDIOGRAMAS LADO A LADO + SIMBOLOGÍA ══ */}
            <div className="px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-start">
                    {/* Audiograma OD */}
                    <div className="bg-white rounded-xl border border-slate-100 p-2">
                        <SingleEarAudiogram thresholds={od} ear="right" color="#ef4444" />
                    </div>

                    {/* Simbología (centro) */}
                    <div className="hidden lg:block self-start mt-4">
                        <SymbolLegend />
                    </div>

                    {/* Audiograma OI */}
                    <div className="bg-white rounded-xl border border-slate-100 p-2">
                        <SingleEarAudiogram thresholds={oi} ear="left" color="#3b82f6" />
                    </div>
                </div>

                {/* Simbología en mobile */}
                <div className="lg:hidden mt-4 flex justify-center">
                    <div className="w-48"><SymbolLegend /></div>
                </div>
            </div>

            {/* ══ TABLAS VA (Umbrales — formato original) ══ */}
            <div className="px-6 pb-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* VA DCHA */}
                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                        <div className="bg-red-50 px-4 py-2 border-b border-red-100 flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-700">VA DCHA — Oído Derecho</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="py-2 px-2 text-left text-[9px] font-bold text-slate-500">Umbral</th>
                                        {FREQS.map(f => (
                                            <th key={f} className="py-2 px-1.5 text-center text-[9px] font-bold text-slate-600">{FREQ_LABELS[f]}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="py-2 px-2 font-bold text-red-600 text-[10px]">dB</td>
                                        {FREQS.map(f => (
                                            <td key={f} className={`py-2 px-1.5 text-center font-bold tabular-nums ${od[f] !== undefined ? (od[f] > 25 ? 'text-red-600' : 'text-slate-800') : 'text-slate-300'}`}>
                                                {od[f] !== undefined ? od[f] : '—'}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* VA IZQ */}
                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                        <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">VA IZQ — Oído Izquierdo</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="py-2 px-2 text-left text-[9px] font-bold text-slate-500">Umbral</th>
                                        {FREQS.map(f => (
                                            <th key={f} className="py-2 px-1.5 text-center text-[9px] font-bold text-slate-600">{FREQ_LABELS[f]}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="py-2 px-2 font-bold text-blue-600 text-[10px]">dB</td>
                                        {FREQS.map(f => (
                                            <td key={f} className={`py-2 px-1.5 text-center font-bold tabular-nums ${oi[f] !== undefined ? (oi[f] > 25 ? 'text-red-600' : 'text-slate-800') : 'text-slate-300'}`}>
                                                {oi[f] !== undefined ? oi[f] : '—'}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══ DIAGNÓSTICO ══ */}
            <div className="px-6 pb-4">
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            2: Ficha reconocimiento médico — {data.testDetails?.medicalRecordDate || data.testDetails?.audiometryDate || '—'} — {data.testDetails?.doctor || '—'}
                        </p>
                    </div>
                    <div className="p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-x-6 gap-y-3">
                            <p className="text-xs font-bold text-slate-500 uppercase">Información General</p>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Diagnóstico</p>
                                {data.diagnosis?.rightEar && (
                                    <div className="flex items-start gap-2 mb-1.5">
                                        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">OIDO DERECHO:</span>
                                        <span className="text-xs font-medium text-slate-800">{data.diagnosis.rightEar}</span>
                                    </div>
                                )}
                                {data.diagnosis?.leftEar && (
                                    <div className="flex items-start gap-2 mb-1.5">
                                        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">OIDO IZQUIERDO:</span>
                                        <span className="text-xs font-medium text-slate-800">{data.diagnosis.leftEar}</span>
                                    </div>
                                )}
                                {data.diagnosis?.general && (
                                    <div className="flex items-start gap-2 mt-2">
                                        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">GENERAL:</span>
                                        <span className="text-xs font-medium text-slate-800">{data.diagnosis.general}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══ EQUIPO ══ */}
            {data.equipment?.device && (
                <div className="px-6 pb-6">
                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 px-5 py-2 border-b border-slate-200">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Equipo</p>
                        </div>
                        <div className="p-5">
                            <table className="text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="py-1.5 pr-6 text-left font-bold text-slate-500">Exámenes</th>
                                        <th className="py-1.5 pr-6 text-left font-bold text-slate-500">Dispositivo</th>
                                        <th className="py-1.5 pr-6 text-left font-bold text-slate-500">SN</th>
                                        <th className="py-1.5 text-left font-bold text-slate-500">Información adicional</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="py-2 pr-6 font-medium text-slate-700">1</td>
                                        <td className="py-2 pr-6 font-medium text-slate-700">{data.equipment.device}</td>
                                        <td className="py-2 pr-6 font-medium text-slate-700">{data.equipment.serialNumber || '—'}</td>
                                        <td className="py-2 font-medium text-slate-700">
                                            Fecha calibración dispositivo: {data.equipment.calibrationDate || '—'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ FIRMA ══ */}
            <div className="px-6 pb-6 flex justify-end">
                <div className="text-right border-t-2 border-slate-300 pt-3 px-8">
                    <p className="text-xs font-bold text-slate-500 italic">Firma</p>
                    <p className="text-xs font-bold text-slate-700 mt-1">{data.testDetails?.doctor || '—'}</p>
                    <p className="text-[10px] text-slate-500">Medicina del Trabajo y Salud Ocupacional</p>
                </div>
            </div>
        </div>
    )
}
