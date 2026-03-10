/**
 * EcgReviewClone — Réplica visual del ECG para fase de review
 * Porta los componentes EcgVisualReport + EcgReport de la app standalone
 * Sección 1: Vista Escáner (cuadrícula roja + trazados + parámetros)
 * Sección 2: Reporte de texto (interpretación, ritmo, conclusión)
 */
import React, { useState } from 'react'
import { Activity, Heart, FileText, Zap, LayoutTemplate, AlignLeft, Waves } from 'lucide-react'
import type { LeadWaveform } from '@/services/ecgWaveformExtractor'

interface EcgCloneData {
    patient?: { name?: string; dob?: string; age?: string; sex?: string }
    studyDetails?: { date?: string; type?: string; provider?: string }
    electricalParameters?: {
        heartRate?: string; rrInterval?: string; pWave?: string
        prInterval?: string; qrsComplex?: string; qtInterval?: string
        qtc?: string; pAxis?: string; qrsAxis?: string; tAxis?: string
    }
    cardiacRhythm?: { rhythm?: string; characteristics?: string; conduction?: string; morphology?: string }
    morphologicalAnalysis?: string[]
    globalInterpretation?: string
    conclusion?: string
    doctor?: { name?: string; credentials?: string }
}

interface Props {
    data: EcgCloneData
    waveforms?: LeadWaveform[]
}

// ── SVG Grid Pattern (papel milimétrico ECG rojo) ──
const GridPattern = () => (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 pointer-events-none">
        <defs>
            <pattern id="ecgSmallGridR" width="4" height="4" patternUnits="userSpaceOnUse">
                <path d="M 4 0 L 0 0 0 4" fill="none" stroke="#ffdbdb" strokeWidth="0.5" />
            </pattern>
            <pattern id="ecgLargeGridR" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect width="20" height="20" fill="url(#ecgSmallGridR)" />
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffb3b3" strokeWidth="1" />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ecgLargeGridR)" />
    </svg>
)

// ── Render waveform path from points ──
const renderWaveformPath = (points: number[], width: number, height: number) => {
    const baseline = height / 2
    const amplitude = height * 0.45
    const d = points.map((p, i) => {
        const x = (i / points.length) * width
        const y = baseline - (p * amplitude)
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    }).join(' ')
    return <path d={d} fill="none" stroke="#000" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" />
}

// ── Simulated ECG beat ──
const renderSimulatedBeat = (width: number, height: number, segments: number) => {
    let d = `M 0 ${height / 2} `
    const segW = width / segments
    for (let i = 0; i < segments; i++) {
        const sx = i * segW
        const mid = height / 2
        d += `L ${sx + segW * 0.1} ${mid} `
        d += `Q ${sx + segW * 0.15} ${mid - 4} ${sx + segW * 0.2} ${mid} `
        d += `L ${sx + segW * 0.3} ${mid} `
        d += `L ${sx + segW * 0.35} ${mid + 2} `
        d += `L ${sx + segW * 0.4} ${mid - 20} `
        d += `L ${sx + segW * 0.45} ${mid + 6} `
        d += `L ${sx + segW * 0.5} ${mid} `
        d += `L ${sx + segW * 0.65} ${mid} `
        d += `Q ${sx + segW * 0.75} ${mid - 8} ${sx + segW * 0.85} ${mid} `
        d += `L ${sx + segW} ${mid} `
    }
    return <path d={d} fill="none" stroke="#000" strokeWidth="1" strokeLinejoin="round" />
}

export default function EcgReviewClone({ data, waveforms }: Props) {
    const [viewMode, setViewMode] = useState<'visual' | 'text'>('visual')

    const getLeadWaveform = (leadName: string): number[] | null => {
        if (!waveforms) return null
        const found = waveforms.find(w => w.lead === leadName)
        if (!found || found.points.length === 0) return null
        const range = Math.max(...found.points) - Math.min(...found.points)
        return range > 0.05 ? found.points : null
    }

    const hasRealData = waveforms?.some(w => {
        const range = Math.max(...w.points) - Math.min(...w.points)
        return range > 0.05
    })

    const renderLead = (leadName: string, w: number, h: number) => {
        const real = getLeadWaveform(leadName)
        return real ? renderWaveformPath(real, w, h) : renderSimulatedBeat(w, h, 3)
    }

    const ep = data.electricalParameters || {}

    return (
        <div className="space-y-4">
            {/* Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                <button onClick={() => setViewMode('visual')}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'visual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <LayoutTemplate size={16} /> Vista Original
                </button>
                <button onClick={() => setViewMode('text')}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'text' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <AlignLeft size={16} /> Reporte de Texto
                </button>
            </div>

            {viewMode === 'visual' ? (
                /* ═══════════════════════════════════════════
                   VISTA ORIGINAL — Réplica del formato BTL
                ═══════════════════════════════════════════ */
                <div className="bg-white w-full border border-slate-300 shadow-lg text-[10px] font-sans text-black flex flex-col" style={{ aspectRatio: '1.414 / 1' }}>
                    <div className="p-2 sm:p-4 h-full flex flex-col">

                        {/* Header */}
                        <div className="flex border border-black mb-1 shrink-0">
                            <div className="flex-1 p-1 sm:p-2 border-r border-black flex items-center">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 mr-2 sm:mr-4 flex-shrink-0">
                                    <svg viewBox="0 0 100 100" className="w-full h-full">
                                        <path d="M50 10 L90 50 L50 90 L10 50 Z" fill="none" stroke="black" strokeWidth="6" />
                                        <path d="M30 50 L50 30 L70 50 L50 70 Z" fill="none" stroke="black" strokeWidth="6" />
                                        <path d="M40 50 L50 40 L60 50 L50 60 Z" fill="black" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-sm sm:text-base font-bold leading-tight uppercase">{data.patient?.name || 'PACIENTE'}</h1>
                                    <div className="leading-tight mt-0.5">
                                        <span className="font-semibold">Fecha de nacimiento:</span> {data.patient?.dob || ''} ({data.patient?.sex || ''} {data.patient?.age || ''})
                                    </div>
                                    <div className="leading-tight">
                                        <span className="font-semibold">Fecha del Examen:</span> {data.studyDetails?.date || ''}
                                    </div>
                                    <div className="leading-tight">
                                        <span className="font-semibold">Tipo de estudio:</span> {data.studyDetails?.type || 'ECG en reposo'}
                                    </div>
                                </div>
                            </div>
                            <div className="w-32 sm:w-64 p-1 sm:p-2 border-r border-black font-semibold text-xs sm:text-sm">
                                {data.studyDetails?.provider || 'GP MEDICAL HEALTH'}
                            </div>
                            <div className="w-16 sm:w-32 p-1 sm:p-2"></div>
                        </div>

                        {/* Parameters table */}
                        <div className="flex border border-black mb-1 shrink-0">
                            <div className="w-24 sm:w-32 p-1 border-r border-black grid grid-cols-2 gap-x-1 items-center">
                                <div className="font-semibold">FC</div><div>{ep.heartRate || ''}lpm</div>
                                <div className="font-semibold">RR</div><div>{ep.rrInterval || ''}ms</div>
                                <div className="font-semibold">SpO2</div><div></div>
                                <div className="font-semibold">BP</div><div></div>
                            </div>
                            <div className="w-24 sm:w-32 p-1 border-r border-black grid grid-cols-2 gap-x-1 items-center">
                                <div className="font-semibold">P</div><div>{ep.pWave || ''}ms</div>
                                <div className="font-semibold">PQ (PR)</div><div>{ep.prInterval || ''}ms</div>
                                <div className="font-semibold">QRS</div><div>{ep.qrsComplex || ''}ms</div>
                                <div className="font-semibold">QT</div><div>{ep.qtInterval || ''}ms</div>
                            </div>
                            <div className="w-28 sm:w-36 p-1 border-r border-black grid grid-cols-2 gap-x-1 items-center">
                                <div className="font-semibold">Eje P</div><div>{ep.pAxis || ''}°</div>
                                <div className="font-semibold">Eje QRS</div><div>{ep.qrsAxis || ''}°</div>
                                <div className="font-semibold">Eje T</div><div>{ep.tAxis || ''}°</div>
                                <div className="font-semibold">QTc(Baz)</div><div>{ep.qtc || ''}ms</div>
                            </div>
                            <div className="flex-1 p-1 flex flex-col justify-between ml-1">
                                <div>
                                    <div>{data.cardiacRhythm?.characteristics || ''}</div>
                                    <div>{data.globalInterpretation || ''}</div>
                                </div>
                                <div className="mt-1">Médico: {data.doctor?.name || ''}</div>
                            </div>
                        </div>

                        {/* ECG Grid + Waveforms */}
                        <div className="flex-1 border border-black relative flex flex-col overflow-hidden min-h-0">
                            <GridPattern />

                            {/* Watermark */}
                            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-15">
                                <div className={`font-bold text-3xl sm:text-5xl md:text-7xl transform -rotate-12 whitespace-nowrap tracking-widest ${hasRealData ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {hasRealData ? 'TRAZO DIGITALIZADO' : 'TRAZO SIMULADO'}
                                </div>
                            </div>

                            {/* 12-lead area */}
                            <div className="flex flex-1 relative z-10 min-h-0">
                                {/* Left column */}
                                <div className="flex-1 border-r border-black/20 flex flex-col min-h-0">
                                    {['I', 'II', 'III', 'aVR', 'aVL', 'aVF'].map(lead => (
                                        <div key={lead} className="flex-1 relative min-h-0">
                                            <div className={`absolute left-1 top-1 font-bold text-xs px-0.5 leading-none z-10 ${getLeadWaveform(lead) ? 'bg-emerald-100 text-emerald-800' : 'bg-white/80'}`}>{lead}</div>
                                            <svg className="w-full h-full" preserveAspectRatio="none">{renderLead(lead, 400, 40)}</svg>
                                        </div>
                                    ))}
                                </div>
                                {/* Right column */}
                                <div className="flex-1 flex flex-col min-h-0">
                                    {['V1', 'V2', 'V3', 'V4', 'V5', 'V6'].map(lead => (
                                        <div key={lead} className="flex-1 relative min-h-0">
                                            <div className={`absolute left-1 top-1 font-bold text-xs px-0.5 leading-none z-10 ${getLeadWaveform(lead) ? 'bg-emerald-100 text-emerald-800' : 'bg-white/80'}`}>{lead}</div>
                                            <svg className="w-full h-full" preserveAspectRatio="none">{renderLead(lead, 400, 40)}</svg>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Calibration */}
                            <div className="h-5 shrink-0 flex justify-between items-center px-1 relative z-10 text-[8px] sm:text-[9px] bg-white/50 border-t border-black/20">
                                <span>10.0 mm/mV &nbsp; 25.00 mm/sec</span>
                                <span>Filtro: 0.07 Spline - 90 Adapt, ~50 [Hz]</span>
                            </div>

                            {/* Rhythm strip (II) */}
                            <div className="h-[15%] shrink-0 border-t border-black relative z-10 bg-white/10 flex flex-col">
                                <div className="flex-1 relative">
                                    <div className={`absolute left-1 top-1 font-bold text-xs px-0.5 leading-none z-10 ${getLeadWaveform('II') ? 'bg-emerald-100 text-emerald-800' : 'bg-white/80'}`}>II</div>
                                    <svg className="w-full h-full" preserveAspectRatio="none">{renderLead('II', 1000, 60)}</svg>
                                </div>
                                <div className="h-4 flex justify-between items-end px-1 pb-0.5 text-[8px]">
                                    <span>10.0 mm/mV</span>
                                    <span>[Ms] [Ppm]</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-1 shrink-0 flex justify-between text-[8px] sm:text-[9px]">
                            <div>{data.studyDetails?.provider || 'GP Medical Health'}</div>
                            <div className="text-right">
                                <span className="mr-4">25.00 mm/sec</span>
                                BTL CardioPoint &nbsp; ECG10s &nbsp; Página: 1/1
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* ═══════════════════════════════════════════
                   REPORTE DE TEXTO — Interpretación completa
                ═══════════════════════════════════════════ */
                <div className="bg-white p-8 font-sans text-slate-800 space-y-8 border border-slate-200 rounded-xl">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-blue-600 pb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-blue-800 uppercase tracking-wide flex items-center gap-2">
                                <Activity className="text-blue-600" size={28} />
                                Reporte de Electrocardiograma
                            </h1>
                            {data.studyDetails?.provider && <p className="text-slate-500 mt-1 font-medium">{data.studyDetails.provider}</p>}
                        </div>
                        <div className="text-right text-sm text-slate-600">
                            {data.studyDetails?.date && <div>{data.studyDetails.date}</div>}
                        </div>
                    </div>

                    {/* Patient */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div><span className="text-slate-500">Nombre:</span> <span className="font-semibold">{data.patient?.name || '—'}</span></div>
                            <div><span className="text-slate-500">Sexo:</span> <span className="font-semibold">{data.patient?.sex || '—'}</span></div>
                            <div><span className="text-slate-500">F. Nac.:</span> <span className="font-semibold">{data.patient?.dob || '—'}</span></div>
                            <div><span className="text-slate-500">Edad:</span> <span className="font-semibold">{data.patient?.age || '—'}</span></div>
                        </div>
                    </div>

                    {/* Electrical Parameters */}
                    {ep && Object.values(ep).some(v => v) && (
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                                <Zap size={20} className="text-yellow-500" /> 1. Parámetros Eléctricos
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {[
                                    { label: 'FC', val: ep.heartRate }, { label: 'RR', val: ep.rrInterval },
                                    { label: 'Onda P', val: ep.pWave }, { label: 'PR', val: ep.prInterval },
                                    { label: 'QRS', val: ep.qrsComplex }, { label: 'QT', val: ep.qtInterval },
                                    { label: 'QTc', val: ep.qtc }, { label: 'Eje P', val: ep.pAxis },
                                    { label: 'Eje QRS', val: ep.qrsAxis }, { label: 'Eje T', val: ep.tAxis },
                                ].filter(p => p.val).map(({ label, val }) => (
                                    <div key={label} className="bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
                                        <div className="text-xs text-slate-500 mb-1">{label}</div>
                                        <div className="font-semibold text-slate-900">{val}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Cardiac Rhythm */}
                    {data.cardiacRhythm && Object.values(data.cardiacRhythm).some(v => v) && (
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                                <Heart size={20} className="text-red-500" /> 2. Ritmo Cardiaco
                            </h2>
                            <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside">
                                {data.cardiacRhythm.rhythm && <li><span className="font-semibold">Ritmo:</span> {data.cardiacRhythm.rhythm}</li>}
                                {data.cardiacRhythm.characteristics && <li><span className="font-semibold">Características:</span> {data.cardiacRhythm.characteristics}</li>}
                                {data.cardiacRhythm.conduction && <li><span className="font-semibold">Conducción:</span> {data.cardiacRhythm.conduction}</li>}
                                {data.cardiacRhythm.morphology && <li><span className="font-semibold">Morfología:</span> {data.cardiacRhythm.morphology}</li>}
                            </ul>
                        </div>
                    )}

                    {/* Morphological Analysis */}
                    {data.morphologicalAnalysis?.length ? (
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                                <Activity size={20} className="text-indigo-500" /> 3. Análisis Morfológico
                            </h2>
                            <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside">
                                {data.morphologicalAnalysis.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                    ) : null}

                    {/* Global Interpretation */}
                    {data.globalInterpretation && (
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-blue-500" /> 4. Interpretación Global
                            </h2>
                            <p className="text-sm text-slate-700 leading-relaxed">{data.globalInterpretation}</p>
                        </div>
                    )}

                    {/* Conclusion */}
                    {data.conclusion && (
                        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                            <h2 className="text-lg font-bold text-blue-900 mb-2">5. Conclusión</h2>
                            <p className="text-sm text-blue-800 leading-relaxed font-medium">{data.conclusion}</p>
                        </div>
                    )}

                    {/* Doctor */}
                    {data.doctor?.name && (
                        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
                            <div className="text-center">
                                <div className="w-48 h-12 border-b border-slate-300 mb-2 mx-auto"></div>
                                <p className="font-bold text-slate-900 text-sm">{data.doctor.name}</p>
                                {data.doctor.credentials && <p className="text-xs text-slate-500 mt-1">{data.doctor.credentials}</p>}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
