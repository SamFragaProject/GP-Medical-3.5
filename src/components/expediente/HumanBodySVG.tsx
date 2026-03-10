/**
 * HumanBodySVG — Interactive anatomical navigation with real-time clinical alerts
 * 
 * /samu: Premium SVG with glow effects, pulse animations, zone highlighting
 * /midu: Inline SVG (0 network requests), CSS-only animations, parallel data loading
 * /romu: Each zone maps to a clinical module — instant visual triage
 */
import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

// ── Zone Configuration ──
export interface BodyZone {
    id: string
    module: string
    label: string
    cx: number
    cy: number
    r: number
    color: string
    colorHex: string
    icon: string
    category: 'clinico' | 'info' | 'diagnostico'
}

export const BODY_ZONES: BodyZone[] = [
    { id: 'brain',      module: 'dashboard',          label: 'Dashboard Clínico',   cx: 150, cy: 52,  r: 18, color: 'emerald', colorHex: '#059669', icon: '🧠', category: 'clinico' },
    { id: 'eye-l',      module: 'vision',             label: 'Estudios Visuales',   cx: 138, cy: 58,  r: 8,  color: 'cyan',    colorHex: '#06B6D4', icon: '👁', category: 'clinico' },
    { id: 'eye-r',      module: 'vision',             label: 'Estudios Visuales',   cx: 162, cy: 58,  r: 8,  color: 'cyan',    colorHex: '#06B6D4', icon: '👁', category: 'clinico' },
    { id: 'ear-l',      module: 'audiometria',        label: 'Audiometría',         cx: 125, cy: 56,  r: 10, color: 'indigo',   colorHex: '#6366F1', icon: '👂', category: 'clinico' },
    { id: 'ear-r',      module: 'audiometria',        label: 'Audiometría',         cx: 175, cy: 56,  r: 10, color: 'indigo',   colorHex: '#6366F1', icon: '👂', category: 'clinico' },
    { id: 'mouth',      module: 'exploracion',        label: 'Odontograma',         cx: 150, cy: 72,  r: 8,  color: 'amber',    colorHex: '#F59E0B', icon: '🦷', category: 'clinico' },
    { id: 'heart',      module: 'electrocardiograma', label: 'Electrocardiograma',  cx: 158, cy: 120, r: 14, color: 'red',      colorHex: '#EF4444', icon: '❤️', category: 'clinico' },
    { id: 'lungs',      module: 'espirometria',       label: 'Espirometría',        cx: 140, cy: 125, r: 14, color: 'sky',      colorHex: '#0EA5E9', icon: '🫁', category: 'clinico' },
    { id: 'abdomen',    module: 'exploracion',        label: 'Exploración Física',  cx: 150, cy: 160, r: 16, color: 'purple',   colorHex: '#A855F7', icon: '📋', category: 'clinico' },
    { id: 'blood',      module: 'laboratorio',        label: 'Laboratorio',         cx: 108, cy: 150, r: 12, color: 'green',    colorHex: '#10B981', icon: '🩸', category: 'clinico' },
    { id: 'spine',      module: 'rayosx',             label: 'Rayos X',             cx: 150, cy: 190, r: 12, color: 'slate',    colorHex: '#64748B', icon: '🦴', category: 'clinico' },
    { id: 'history',    module: 'historia',           label: 'Historia Clínica',    cx: 192, cy: 150, r: 12, color: 'pink',     colorHex: '#EC4899', icon: '📄', category: 'clinico' },
]

// ── Alert Status Types ──
export interface ZoneAlert {
    hasData: boolean
    hasAlert: boolean
    alertCount: number
    label?: string
}

export type AlertMap = Record<string, ZoneAlert>

// ── Hook: Calculate patient alerts from Supabase ──
export function usePatientAlerts(pacienteId: string): { alerts: AlertMap; loading: boolean } {
    const [alerts, setAlerts] = useState<AlertMap>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!pacienteId) return
        loadAlerts()
    }, [pacienteId])

    const loadAlerts = async () => {
        setLoading(true)
        const map: AlertMap = {}
        // Default everything to no data
        BODY_ZONES.forEach(z => {
            map[z.id] = { hasData: false, hasAlert: false, alertCount: 0 }
        })

        try {
            const [
                { data: labs },
                { data: estudios },
                { data: exploraciones },
                { data: paciente },
            ] = await Promise.all([
                // Labs
                supabase.from('estudios_clinicos').select('datos_extra')
                    .eq('paciente_id', pacienteId)
                    .in('tipo_estudio', ['laboratorio_directo', 'laboratorio'])
                    .order('fecha_estudio', { ascending: false }).limit(1),
                // All estudios (audio, espiro, ecg, vision, rx)
                supabase.from('estudios_clinicos').select('tipo_estudio, datos_extra')
                    .eq('paciente_id', pacienteId)
                    .order('fecha_estudio', { ascending: false }),
                // Exploraciones físicas
                supabase.from('exploraciones_fisicas').select('ta_sistolica, ta_diastolica, fc, spo2, glucosa, imc')
                    .eq('paciente_id', pacienteId)
                    .order('fecha_exploracion', { ascending: false }).limit(1),
                // Patient direct data
                supabase.from('pacientes').select('laboratorio, presion_sistolica, frecuencia_cardiaca, saturacion_o2, imc')
                    .eq('id', pacienteId).single(),
            ])

            // ── LABORATORIO ──
            if (labs?.[0]?.datos_extra) {
                const d = labs[0].datos_extra
                const labData = d.labclone_data || d
                const allResults = (labData.exams || []).flatMap((e: any) => (e.results || []))
                const abnormal = allResults.filter((r: any) => r.isAbnormal).length
                map['blood'] = { hasData: true, hasAlert: abnormal > 0, alertCount: abnormal, label: abnormal > 0 ? `${abnormal} alterados` : 'Normal' }
            }

            // ── ESTUDIOS CLÍNICOS ──
            const tipoMap: Record<string, string> = {
                'audiometria': 'ear-l',
                'audiometria_directa': 'ear-l',
                'espirometria': 'lungs',
                'espirometria_directa': 'lungs',
                'electrocardiograma': 'heart',
                'ecg': 'heart',
                'ecg_directo': 'heart',
                'vision': 'eye-l',
                'estudios_visuales': 'eye-l',
                'rayos_x': 'spine',
                'rx': 'spine',
                'rx_directo': 'spine',
            }

            if (estudios) {
                const seen = new Set<string>()
                for (const est of estudios) {
                    const zoneId = tipoMap[est.tipo_estudio]
                    if (!zoneId || seen.has(zoneId)) continue
                    seen.add(zoneId)
                    map[zoneId] = { hasData: true, hasAlert: false, alertCount: 0, label: 'Con datos' }

                    // Check for alerts in specific types
                    const extra = est.datos_extra || {}
                    if (zoneId === 'lungs' && extra.spiroclone_data) {
                        const sp = extra.spiroclone_data
                        const fev1 = parseFloat(sp.fev1_percent_predicted || sp.fev1_pct || '100')
                        if (fev1 < 80) {
                            map[zoneId] = { hasData: true, hasAlert: true, alertCount: 1, label: `FEV1: ${fev1}%` }
                        }
                    }
                    if (zoneId === 'heart' && extra.ecg_data) {
                        const ecg = extra.ecg_data
                        if (ecg.interpretation?.toLowerCase().includes('anormal') || ecg.hallazgos?.length > 0) {
                            map[zoneId] = { hasData: true, hasAlert: true, alertCount: 1, label: 'Hallazgos ECG' }
                        }
                    }
                    // Mirror ear-l to ear-r
                    if (zoneId === 'ear-l') map['ear-r'] = { ...map['ear-l'] }
                    if (zoneId === 'eye-l') map['eye-r'] = { ...map['eye-l'] }
                }
            }

            // ── EXPLORACIÓN FÍSICA ──
            const ef: any = exploraciones?.[0] || paciente || {}
            const hasSys = ef.ta_sistolica || ef.presion_sistolica
            if (hasSys) {
                const sys = Number(ef.ta_sistolica || ef.presion_sistolica || 0)
                const fc = Number(ef.fc || ef.frecuencia_cardiaca || 0)
                const spo2 = Number(ef.spo2 || ef.saturacion_o2 || 0)
                const imc = Number(ef.imc || 0)
                let alertCount = 0
                if (sys > 140 || sys < 90) alertCount++
                if (fc > 100 || (fc > 0 && fc < 50)) alertCount++
                if (spo2 > 0 && spo2 < 92) alertCount++
                if (imc > 30) alertCount++
                map['abdomen'] = { hasData: true, hasAlert: alertCount > 0, alertCount, label: alertCount > 0 ? `${alertCount} vitales alterados` : 'Vitales normales' }
            }

            // Dashboard always has data
            map['brain'] = { hasData: true, hasAlert: false, alertCount: 0, label: 'Panel clínico' }

        } catch (err) {
            console.error('[HumanBody] Error loading alerts:', err)
        } finally {
            setAlerts(map)
            setLoading(false)
        }
    }

    return { alerts, loading }
}

// ── CSS Animations (injected once) ──
const BODY_STYLES = `
@keyframes gpPulseAlert {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.3); }
}
@keyframes gpHeartbeat {
    0%, 100% { transform: scale(1); }
    15% { transform: scale(1.15); }
    30% { transform: scale(1); }
    45% { transform: scale(1.1); }
}
@keyframes gpFadeInUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes gpDrawPath {
    to { stroke-dashoffset: 0; }
}
.gp-zone-alert {
    animation: gpPulseAlert 2s ease-in-out infinite;
}
.gp-heartbeat {
    animation: gpHeartbeat 1.2s ease-in-out infinite;
}
.gp-body-enter {
    animation: gpFadeInUp 0.6s ease-out both;
}
`

// ── Main Component ──
interface HumanBodySVGProps {
    alerts: AlertMap
    loading: boolean
    onZoneClick: (module: string) => void
}

export default function HumanBodySVG({ alerts, loading, onZoneClick }: HumanBodySVGProps) {
    const [hoveredZone, setHoveredZone] = useState<string | null>(null)
    const [stylesInjected, setStylesInjected] = useState(false)

    useEffect(() => {
        if (!stylesInjected) {
            const style = document.createElement('style')
            style.textContent = BODY_STYLES
            document.head.appendChild(style)
            setStylesInjected(true)
            return () => { document.head.removeChild(style) }
        }
    }, [])

    // Deduplicate zones for click (ear-l and ear-r both go to audiometria)
    const uniqueZones = useMemo(() => {
        const seen = new Set<string>()
        return BODY_ZONES.filter(z => {
            if (seen.has(z.module + z.cx)) return false
            seen.add(z.module + z.cx)
            return true
        })
    }, [])

    const totalAlerts = useMemo(() => {
        return Object.values(alerts).reduce((sum, a) => sum + (a.hasAlert ? a.alertCount : 0), 0)
    }, [alerts])

    const areasWithData = useMemo(() => {
        return Object.values(alerts).filter(a => a.hasData).length
    }, [alerts])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative w-full max-w-md mx-auto gp-body-enter"
        >
            {/* Status bar */}
            <div className="flex items-center justify-center gap-4 mb-4">
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Normal</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alerta ({totalAlerts})</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sin datos</span>
                </div>
            </div>

            {/* SVG Body */}
            <svg viewBox="0 0 300 340" className="w-full h-auto" style={{ maxHeight: '420px' }}>
                <defs>
                    {/* Glow filters for each color */}
                    {BODY_ZONES.map(z => (
                        <filter key={`glow-${z.id}`} id={`glow-${z.id}`} x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feFlood floodColor={z.colorHex} floodOpacity="0.4" result="color" />
                            <feComposite in="color" in2="blur" operator="in" result="glow" />
                            <feMerge>
                                <feMergeNode in="glow" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    ))}
                </defs>

                {/* ── Human Body Silhouette ── */}
                <g transform="translate(0, 4)">
                    {/* Head */}
                    <ellipse cx="150" cy="42" rx="24" ry="28"
                        fill="none" stroke="#CBD5E1" strokeWidth="1.5"
                        className="transition-all duration-300" />
                    {/* Neck */}
                    <line x1="150" y1="70" x2="150" y2="85"
                        stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Torso */}
                    <path d="M 118 85 Q 115 120 118 170 Q 120 195 135 200 L 165 200 Q 180 195 182 170 Q 185 120 182 85 Z"
                        fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinejoin="round" />
                    {/* Shoulders & Arms - Left */}
                    <path d="M 118 85 Q 95 88 80 100 Q 68 115 65 145 Q 63 165 70 195 Q 72 210 75 220"
                        fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Left Hand */}
                    <ellipse cx="75" cy="225" rx="8" ry="10"
                        fill="none" stroke="#CBD5E1" strokeWidth="1.2" />
                    {/* Shoulders & Arms - Right */}
                    <path d="M 182 85 Q 205 88 220 100 Q 232 115 235 145 Q 237 165 230 195 Q 228 210 225 220"
                        fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Right Hand */}
                    <ellipse cx="225" cy="225" rx="8" ry="10"
                        fill="none" stroke="#CBD5E1" strokeWidth="1.2" />
                    {/* Pelvis */}
                    <path d="M 135 200 Q 130 210 125 215 L 150 218 L 175 215 Q 170 210 165 200"
                        fill="none" stroke="#CBD5E1" strokeWidth="1.2" />
                    {/* Left Leg */}
                    <path d="M 135 215 Q 128 250 125 280 Q 123 300 120 325"
                        fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Left Foot */}
                    <path d="M 120 325 Q 115 332 110 334 L 125 334"
                        fill="none" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
                    {/* Right Leg */}
                    <path d="M 165 215 Q 172 250 175 280 Q 177 300 180 325"
                        fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Right Foot */}
                    <path d="M 180 325 Q 185 332 190 334 L 175 334"
                        fill="none" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
                </g>

                {/* ── Interactive Zones ── */}
                {uniqueZones.map((zone, i) => {
                    const alert = alerts[zone.id] || { hasData: false, hasAlert: false, alertCount: 0 }
                    const isHovered = hoveredZone === zone.id
                    const isHeartZone = zone.id === 'heart'

                    // Status color
                    const dotColor = alert.hasAlert ? '#EF4444' : alert.hasData ? '#10B981' : '#94A3B8'

                    return (
                        <g key={zone.id}
                            style={{ cursor: 'pointer', animationDelay: `${i * 50}ms` }}
                            className="gp-body-enter"
                            onClick={() => onZoneClick(zone.module)}
                            onMouseEnter={() => setHoveredZone(zone.id)}
                            onMouseLeave={() => setHoveredZone(null)}
                        >
                            {/* Hover glow area */}
                            <circle
                                cx={zone.cx} cy={zone.cy} r={zone.r + 4}
                                fill={isHovered ? `${zone.colorHex}15` : 'transparent'}
                                stroke={isHovered ? `${zone.colorHex}40` : 'transparent'}
                                strokeWidth="1.5"
                                filter={isHovered ? `url(#glow-${zone.id})` : undefined}
                                className="transition-all duration-300"
                            />

                            {/* Clickable zone circle */}
                            <circle
                                cx={zone.cx} cy={zone.cy} r={zone.r}
                                fill={isHovered ? `${zone.colorHex}20` : `${zone.colorHex}08`}
                                stroke={isHovered ? zone.colorHex : `${zone.colorHex}30`}
                                strokeWidth={isHovered ? 2 : 1}
                                className="transition-all duration-200"
                            />

                            {/* Icon emoji */}
                            <text
                                x={zone.cx} y={zone.cy + 1}
                                textAnchor="middle" dominantBaseline="central"
                                fontSize={zone.r * 0.85}
                                className={isHeartZone && alert.hasData ? 'gp-heartbeat' : ''}
                                style={{ pointerEvents: 'none' }}
                            >
                                {zone.icon}
                            </text>

                            {/* Status dot */}
                            <circle
                                cx={zone.cx + zone.r * 0.7}
                                cy={zone.cy - zone.r * 0.7}
                                r={4}
                                fill={dotColor}
                                stroke="white" strokeWidth="1.5"
                                className={alert.hasAlert ? 'gp-zone-alert' : ''}
                            />

                            {/* Alert count badge */}
                            {alert.hasAlert && alert.alertCount > 0 && (
                                <>
                                    <circle
                                        cx={zone.cx + zone.r + 8}
                                        cy={zone.cy - zone.r * 0.3}
                                        r={8}
                                        fill="#EF4444"
                                    />
                                    <text
                                        x={zone.cx + zone.r + 8}
                                        y={zone.cy - zone.r * 0.3 + 1}
                                        textAnchor="middle" dominantBaseline="central"
                                        fill="white" fontSize="8" fontWeight="900"
                                        style={{ pointerEvents: 'none' }}
                                    >
                                        {alert.alertCount > 9 ? '9+' : alert.alertCount}
                                    </text>
                                </>
                            )}

                            {/* Hover tooltip */}
                            {isHovered && (
                                <g>
                                    <rect
                                        x={zone.cx - 60} y={zone.cy - zone.r - 28}
                                        width="120" height="22" rx="6"
                                        fill="#0F172A" fillOpacity="0.92"
                                    />
                                    <text
                                        x={zone.cx} y={zone.cy - zone.r - 15}
                                        textAnchor="middle" dominantBaseline="central"
                                        fill="white" fontSize="9" fontWeight="700"
                                        style={{ pointerEvents: 'none' }}
                                    >
                                        {zone.label}
                                    </text>
                                    {/* Tooltip arrow */}
                                    <polygon
                                        points={`${zone.cx - 4},${zone.cy - zone.r - 6} ${zone.cx + 4},${zone.cy - zone.r - 6} ${zone.cx},${zone.cy - zone.r - 1}`}
                                        fill="#0F172A" fillOpacity="0.92"
                                    />
                                </g>
                            )}
                        </g>
                    )
                })}
            </svg>

            {/* Loading overlay */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-bold text-slate-400">Cargando alertas...</span>
                    </div>
                </div>
            )}
        </motion.div>
    )
}
