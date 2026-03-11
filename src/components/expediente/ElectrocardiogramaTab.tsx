/**
 * ElectrocardiogramaTab — Scanner fiel + Análisis IA sin límite
 * Sección 1: Replica del reporte ECG (trazado imagen, tabla parámetros, interpretación)
 * Sección 2: Análisis cardiológico IA — gauges animados, ritmo visual, alertas clínicas
 */
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    HeartPulse, Activity, Zap, FileText, AlertTriangle, CheckCircle,
    Clock, Shield, Download, Brain, TrendingUp, TrendingDown, Minus,
    Calendar, ChevronDown, ChevronUp, Image as ImageIcon, Info, Trash2, Target
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { secureStorageService } from '@/services/secureStorageService'
import DocumentosAdjuntos from '@/components/expediente/DocumentosAdjuntos'
import EstudioUploadReview from '@/components/expediente/EstudioUploadReview'
import { printSeccionPDF } from '@/components/expediente/ExportarPDFPaciente'

// ── Rangos de referencia ECG ──
const ECG_REFS: Record<string, { min?: number; max?: number; unit: string; label: string; warn: string }> = {
    FC: { min: 60, max: 100, unit: 'lpm', label: 'Frecuencia Cardiaca', warn: 'FC anormal' },
    ONDA_P: { min: 80, max: 120, unit: 'ms', label: 'Onda P', warn: 'Onda P fuera de rango' },
    INTERVALO_PR: { min: 120, max: 200, unit: 'ms', label: 'Intervalo PR', warn: 'PR prolongado >200ms — Bloqueo 1° grado' },
    COMPLEJO_QRS: { min: 60, max: 100, unit: 'ms', label: 'Complejo QRS', warn: 'QRS ancho >100ms — descartar bloqueo de rama' },
    INTERVALO_QT: { min: 350, max: 450, unit: 'ms', label: 'Intervalo QT', warn: 'QT fuera de rango' },
    INTERVALO_QTC: { max: 450, unit: 'ms', label: 'QTc (Bazett)', warn: 'QTc prolongado >450ms — riesgo arrítmico' },
    EJE_QRS: { min: -30, max: 90, unit: '°', label: 'Eje QRS', warn: 'Desviación axial' },
}

const getParamStatus = (key: string, value: number | null): 'normal' | 'warn' | 'unknown' => {
    if (value === null || value === undefined) return 'unknown'
    const ref = ECG_REFS[key]
    if (!ref) return 'normal'
    if (ref.min !== undefined && value < ref.min) return 'warn'
    if (ref.max !== undefined && value > ref.max) return 'warn'
    return 'normal'
}

// ── Transformer: de resultados_estudio → objeto interno ──
function buildFromResultados(estudio: any, resultados: any[]): any {
    const get = (name: string): any => {
        const r = resultados.find(r => r.parametro_nombre === name)
        return r?.resultado_numerico ?? r?.resultado ?? null
    }
    const num = (name: string): number | null => {
        const v = get(name)
        return v !== null ? Number(v) : null
    }

    return {
        id: estudio.id,
        fecha: estudio.fecha_estudio,
        archivo_url: estudio.archivo_origen || null,
        // Parámetros numéricos
        fc: num('FC'),
        rr: num('RR'),
        onda_p: num('ONDA_P'),
        intervalo_pr: num('INTERVALO_PR'),
        complejo_qrs: num('COMPLEJO_QRS'),
        intervalo_qt: num('INTERVALO_QT'),
        intervalo_qtc: num('INTERVALO_QTC'),
        spo2: num('SPO2'),
        pa: get('PA'),
        // Ejes
        eje_p: num('EJE_P'),
        eje_qrs: num('EJE_QRS'),
        eje_t: num('EJE_T'),
        // Interpretación
        ritmo_automatico: get('RITMO_AUTOMATICO') || get('RITMO') || '',
        conduccion: get('CONDUCCION') || '',
        morfologia: get('MORFOLOGIA') || '',
        resultado_global: get('RESULTADO_GLOBAL') || estudio.diagnostico || '',
        descripcion_ritmo: get('DESCRIPCION_RITMO') || get('RITMO_DESCRIPCION') || '',
        analisis_morfologico: get('ANALISIS_MORFOLOGICO') || '',
        segmento_st: get('SEGMENTO_ST') || '',
        onda_t_desc: get('ONDA_T_DESC') || '',
        conclusion: get('CONCLUSION_ECG') || estudio.interpretacion || '',
        // Metadatos
        tipo_estudio: get('TIPO_ESTUDIO') || 'ECG en reposo',
        equipo: get('EQUIPO_ECG') || estudio.equipo || '',
        medico: get('MEDICO_RESPONSABLE') || estudio.medico_responsable || '',
        tiene_trazado: get('TIENE_TRAZADO_IMAGEN') === 'true' || get('TIENE_TRAZADO_IMAGEN') === true,
        clasificacion: estudio.clasificacion ||
            ((get('RESULTADO_GLOBAL') || '').toLowerCase().includes('normal') ? 'normal' : 'con_hallazgos'),
        // Waveform data (pixel-digitized leads)
        waveformData: (() => {
            const wfRow = resultados.find(r => r.parametro_nombre === 'WAVEFORM_DATA')
            if (!wfRow?.resultado) return null
            try {
                const parsed = typeof wfRow.resultado === 'string' ? JSON.parse(wfRow.resultado) : wfRow.resultado
                return Array.isArray(parsed) ? parsed : null
            } catch { return null }
        })(),
        rawResults: resultados,
    }
}

// ─────────────────────────────────────────────
// COMPONENTE: Simulación visual del ritmo cardiaco
// ─────────────────────────────────────────────
function RhythmVisualizer({ fc }: { fc: number | null }) {
    const bpm = fc || 75
    const period = 60000 / bpm // ms per beat

    // Genera una tira de ECG sintética (representación visual, no datos reales)
    const W = 500, H = 80
    const beats = 4
    const beatW = W / beats

    const ecgPath = (startX: number) => {
        const mid = H / 2
        return [
            `M ${startX} ${mid}`,
            `L ${startX + beatW * 0.2} ${mid}`,
            `L ${startX + beatW * 0.25} ${mid + 8}`,   // P wave
            `L ${startX + beatW * 0.35} ${mid - 2}`,
            `L ${startX + beatW * 0.4} ${mid - 40}`,   // QRS spike up
            `L ${startX + beatW * 0.43} ${mid + 15}`,  // S wave down
            `L ${startX + beatW * 0.48} ${mid}`,
            `L ${startX + beatW * 0.55} ${mid - 8}`,   // T wave
            `L ${startX + beatW * 0.65} ${mid}`,
            `L ${startX + beatW} ${mid}`,
        ].join(' ')
    }

    return (
        <div className="bg-slate-950 rounded-2xl p-6 overflow-hidden relative border border-slate-800 shadow-2xl">
            <div className="absolute top-4 left-5 flex items-center gap-3 z-10">
                <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 rounded-full border border-rose-500/20">
                    <motion.div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                        animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
                        transition={{ duration: period / 1000, repeat: Infinity }} />
                    <span className="text-[11px] font-black text-rose-400 uppercase tracking-[0.2em]">
                        Monitor en Vivo: {bpm} lpm
                    </span>
                </div>
                <Badge variant="outline" className="text-[9px] border-slate-700 text-slate-400 font-bold uppercase tracking-widest">
                    Ritmo {fc && fc > 100 ? 'Sinusal Taquicárdico' : fc && fc < 60 ? 'Sinusal Bradicárdico' : 'Sinusal Normal'}
                </Badge>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full opacity-80 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]">
                <defs>
                    <linearGradient id="ecgGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0" />
                        <stop offset="50%" stopColor="#f43f5e" stopOpacity="1" />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {/* Grid lines background */}
                {[...Array(20)].map((_, i) => (
                    <line key={i} x1={i * 25} y1="0" x2={i * 25} y2={H} stroke="#1e293b" strokeWidth="0.5" />
                ))}
                {[...Array(4)].map((_, i) => (
                    <line key={i} x1="0" y1={i * 20} x2={W} y2={i * 20} stroke="#1e293b" strokeWidth="0.5" />
                ))}
                {/* The ECG Line */}
                <motion.path
                    d={[...Array(beats)].map((_, i) => ecgPath(i * beatW)).join(' ')}
                    fill="none" stroke="url(#ecgGrad)" strokeWidth="2.5" strokeLinecap="round"
                    animate={{ x: [0, -beatW] }}
                    transition={{ duration: period / 1000, repeat: Infinity, ease: 'linear' }}
                />
            </svg>
        </div>
    )
}

// ─────────────────────────────────────────────
// COMPONENTE: Gauge ECG parámetro
// ─────────────────────────────────────────────
function ECGParamGauge({ label, value, unit, min, max, decimals = 0 }: {
    label: string; value: number | null; unit: string; min: number; max: number; decimals?: number
}) {
    if (value === null) return (
        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100/50 text-center flex flex-col justify-center min-h-[140px]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{label}</p>
            <p className="text-slate-300 font-black text-2xl">—</p>
        </div>
    )
    const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
    const isWarn = value < min || value > max
    const color = isWarn ? '#F59E0B' : '#10B981'
    const r = 44, cx = 50, cy = 50

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-[2.5rem] border text-center transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden ${isWarn ? 'bg-gradient-to-br from-amber-50 to-white border-amber-200' : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-100'}`}
        >
            {/* Background Glow */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${isWarn ? 'bg-amber-400' : 'bg-emerald-400'}`} />

            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 group-hover:text-amber-600 transition-colors">{label}</p>

            <div className="relative mx-auto" style={{ width: 140, height: 140 }}>
                <svg viewBox="0 0 100 100" className="-rotate-90 w-full h-full filter drop-shadow-sm">
                    {/* Background track */}
                    <circle cx="50" cy="50" r="44" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                    {/* Normal range mask (optional, subtle) */}
                    <circle cx="50" cy="50" r="44" fill="none" stroke={isWarn ? '#fdf2f2' : '#ecfdf5'} strokeWidth="12" strokeDasharray={`${2 * Math.PI * 44}`} />

                    <motion.circle cx="50" cy="50" r="44" fill="none"
                        stroke={color} strokeWidth="10" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 44}
                        initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - pct / 100) }}
                        transition={{ duration: 1.8, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-4xl font-black tracking-tighter sm:text-5xl ${isWarn ? 'text-amber-700' : 'text-slate-900'}`}>
                        {value.toFixed(decimals)}
                    </motion.span>
                    <span className="text-[11px] text-slate-400 font-black uppercase tracking-widest mt-1 group-hover:text-slate-600 transition-colors">{unit}</span>
                </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isWarn ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-pulse' : 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]'}`} />
                <p className={`text-[10px] font-black uppercase tracking-[0.1em] ${isWarn ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {isWarn ? 'Anomalía Detectada' : 'Parámetro Óptimo'}
                </p>
            </div>

            <div className={`mt-3 py-1.5 px-3 rounded-full inline-block border ${isWarn ? 'bg-amber-100/50 border-amber-200' : 'bg-emerald-100/30 border-emerald-100'}`}>
                <p className={`text-[10px] font-black ${isWarn ? 'text-amber-700' : 'text-emerald-600'}`}>Ref: {min}–{max} {unit}</p>
            </div>
        </motion.div>
    )
}

// ─────────────────────────────────────────────
// COMPONENTE: Eje eléctrico SVG (GRANDE)
// ─────────────────────────────────────────────
function EjesElectricos({ ejeP, ejeQRS, ejeT }: { ejeP: number | null; ejeQRS: number | null; ejeT: number | null }) {
    const cx = 100, cy = 100, r = 85

    const toXY = (deg: number) => ({
        x: cx + r * Math.cos((deg - 90) * Math.PI / 180),
        y: cy + r * Math.sin((deg - 90) * Math.PI / 180),
    })

    const axes = [
        { deg: ejeP, color: '#8B5CF6', label: 'P' },
        { deg: ejeQRS, color: '#10B981', label: 'QRS' },
        { deg: ejeT, color: '#3B82F6', label: 'T' },
    ]

    const getZona = (deg: number | null): string => {
        if (deg === null) return '—'
        if (deg >= -30 && deg <= 90) return 'Normal'
        if (deg > 90 && deg <= 180) return 'Desv. Derecha'
        return 'Desv. Izquierda'
    }

    return (
        <Card className="border-slate-100 shadow-sm">
            <CardContent className="p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Ejes Eléctricos Cardíacos
                </p>
                <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                    <div className="relative">
                        <svg viewBox="0 0 200 200" className="w-64 h-64 md:w-72 md:h-72">
                            {/* Círculo de referencia */}
                            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="1.5" />
                            {/* Cuadrantes */}
                            <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                            <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />

                            {/* Zona normal (−30° a +90°) */}
                            <path d={`M ${cx} ${cy} L ${toXY(-30).x} ${toXY(-30).y} A ${r} ${r} 0 0 1 ${toXY(90).x} ${toXY(90).y} Z`}
                                fill="rgba(16,185,129,0.06)" />

                            {/* Vectores */}
                            {axes.map(({ deg, color, label }) => {
                                if (deg === null) return null
                                const pt = toXY(deg)
                                return (
                                    <motion.g key={label}>
                                        <motion.line x1={cx} y1={cy} x2={pt.x} y2={pt.y}
                                            stroke={color} strokeWidth="3" strokeLinecap="round"
                                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                            transition={{ duration: 1, ease: 'easeOut' }} />
                                        <circle cx={pt.x} cy={pt.y} r="5" fill={color} stroke="white" strokeWidth="2" />
                                        <text x={pt.x + (pt.x > cx ? 6 : -14)} y={pt.y + (pt.y > cy ? 12 : -6)}
                                            fontSize="11" fontWeight="900" fill={color}>{label}</text>
                                    </motion.g>
                                )
                            })}

                            {/* Labels de orientación */}
                            <text x={cx} y={8} textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="800">−90°</text>
                            <text x={cx} y={cy + r + 15} textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="800">+90°</text>
                            <text x={0} y={cy + 4} fontSize="10" fill="#94a3b8" fontWeight="800">±180°</text>
                            <text x={cx + r + 5} y={cy + 4} fontSize="10" fill="#94a3b8" fontWeight="800">0°</text>
                        </svg>
                    </div>

                    <div className="space-y-4 w-full max-w-[200px]">
                        {axes.map(({ deg, color, label }) => (
                            <div key={label} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: color }} />
                                    <span className="text-xs font-black text-slate-500">Vector {label}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-black text-slate-800">
                                        {deg !== null ? `${deg}°` : '—'}
                                    </span>
                                    <p className={`text-[10px] font-bold ${getZona(deg) === 'Normal' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {getZona(deg)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function ElectrocardiogramaTab({ pacienteId, paciente }: { pacienteId: string; paciente?: any }) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [estudios, setEstudios] = useState<any[]>([])
    const [activeSection, setActiveSection] = useState<'scanner' | 'analisis'>('scanner')
    const [selectedIdx, setSelectedIdx] = useState(0)

    const currentEcg = estudios[selectedIdx] || {}
    const isNormalEcg = currentEcg.resultado_global?.toLowerCase().includes('normal') || (currentEcg.fc && currentEcg.fc >= 60 && currentEcg.fc <= 100)
    const isFileError = !currentEcg.archivo_url || 
                        currentEcg.archivo_url.includes('"error"') || 
                        currentEcg.archivo_url.includes('Bucket not found') || 
                        currentEcg.archivo_url.startsWith('{');

    useEffect(() => { if (pacienteId) loadECG() }, [pacienteId])

    const loadECG = async () => {
        setLoading(true)
        try {
            const all: any[] = []

            // FUENTE 1: Nueva arquitectura unificada
            const { data: estudiosDB } = await supabase
                .from('estudios_clinicos').select('*')
                .eq('paciente_id', pacienteId)
                .in('tipo_estudio', ['ecg', 'electrocardiograma'])
                .order('fecha_estudio', { ascending: false }).limit(5)

            if (estudiosDB && estudiosDB.length > 0) {
                for (const est of estudiosDB) {
                    const { data: resultados } = await supabase
                        .from('resultados_estudio').select('*').eq('estudio_id', est.id)
                    if (resultados && resultados.length > 0) {
                        const parsed = buildFromResultados(est, resultados)

                        // ── RECUPERAR URL SEGURA SI ES UN PATH ──
                        if (parsed.archivo_url && !parsed.archivo_url.startsWith('http') && !parsed.archivo_url.startsWith('blob:')) {
                            try {
                                const empresaId = user?.empresa_id || paciente?.empresa_id || ''
                                // Buscar el documento en la tabla de metadata para obtener el path exacto
                                const { data: docData } = await supabase
                                    .from('documentos_expediente')
                                    .select('*')
                                    .eq('paciente_id', pacienteId)
                                    .eq('categoria', 'electrocardiograma')
                                    .order('created_at', { ascending: false })
                                    .limit(1)
                                    .single()

                                if (docData && empresaId) {
                                    const secureUrl = await secureStorageService.view(docData, empresaId)
                                    parsed.archivo_url = secureUrl.objectUrl
                                }
                            } catch (e) {
                                console.warn('No se pudo obtener URL segura para el ECG trazado:', e)
                            }
                        }

                        all.push(parsed)
                    }
                }
            }

            // FUENTE 2: servicio legacy
            if (all.length === 0) {
                const { electrocardiogramaService } = await import('@/services/electrocardiogramaService')
                const legacyData = await electrocardiogramaService.listar({ paciente_id: pacienteId })
                for (const ecg of legacyData) {
                    all.push({
                        id: ecg.id,
                        fecha: ecg.fecha_estudio,
                        fc: ecg.frecuencia_cardiaca,
                        rr: null,
                        onda_p: null,
                        intervalo_pr: ecg.intervalo_pr,
                        complejo_qrs: ecg.complejo_qrs,
                        intervalo_qt: ecg.intervalo_qt,
                        intervalo_qtc: ecg.intervalo_qtc,
                        eje_p: null,
                        eje_qrs: ecg.eje_qrs,
                        eje_t: null,
                        ritmo_automatico: ecg.ritmo,
                        resultado_global: ecg.clasificacion,
                        conclusión: ecg.hallazgos,
                        analisis_morfologico: ecg.onda_t ? `Onda T: ${ecg.onda_t}. ST: ${ecg.segmento_st || 'sin alteraciones'}` : '',
                        segmento_st: ecg.segmento_st,
                        medico: ecg.realizado_por,
                        clasificacion: ecg.clasificacion,
                        tiene_trazado: false,
                    })
                }
            }

            setEstudios(all)
        } catch (e) {
            console.error('ECG loadError:', e)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!currentEcg.id) return
        if (!window.confirm('¿Estás seguro de que deseas eliminar este electrocardiograma? Esta acción no se puede deshacer.')) return

        setLoading(true)
        try {
            // Eliminar resultados asociados
            await supabase.from('resultados_estudio').delete().eq('estudio_id', currentEcg.id)
            // Eliminar estudio base
            const { error } = await supabase.from('estudios_clinicos').delete().eq('id', currentEcg.id)

            if (error) throw error

            // Eliminar de electrocardiogramas legacy si existe
            await supabase.from('electrocardiogramas').delete().eq('id', currentEcg.id)

            setEstudios(prev => prev.filter(e => e.id !== currentEcg.id))
            setSelectedIdx(0)
            alert('Estudio eliminado con éxito')
        } catch (err: any) {
            console.error('Error eliminando ECG:', err)
            alert('No se pudo eliminar el estudio: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="py-20 flex flex-col items-center gap-3">
            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                <HeartPulse className="w-8 h-8 text-rose-500" />
            </motion.div>
            <p className="text-slate-400 text-xs font-medium">Cargando electrocardiograma...</p>
        </div>
    )

    if (estudios.length === 0) return (
        <div className="w-full">
            <EstudioUploadReview pacienteId={pacienteId} tipoEstudio="ecg" onSaved={loadECG} />
        </div>
    )

    const alertas: { msg: string; level: 'warn' | 'info' }[] = []
    if (currentEcg.intervalo_qtc && currentEcg.intervalo_qtc > 450)
        alertas.push({ msg: `QTc prolongado (${currentEcg.intervalo_qtc} ms) — Riesgo de Torsades de Pointes`, level: 'warn' })
    if (currentEcg.fc && (currentEcg.fc < 60 || currentEcg.fc > 100))
        alertas.push({ msg: `FC ${currentEcg.fc < 60 ? 'Bradicardia' : 'Taquicardia'} (${currentEcg.fc} lpm)`, level: 'warn' })
    if (currentEcg.intervalo_pr && currentEcg.intervalo_pr > 200)
        alertas.push({ msg: `PR prolongado (${currentEcg.intervalo_pr} ms) — Bloqueo AV 1° grado`, level: 'warn' })
    if (currentEcg.complejo_qrs && currentEcg.complejo_qrs > 120)
        alertas.push({ msg: `QRS ancho (${currentEcg.complejo_qrs} ms) — Descartar bloqueo de rama`, level: 'warn' })
    if (currentEcg.eje_qrs !== null && currentEcg.eje_qrs !== undefined && (currentEcg.eje_qrs < -30 || currentEcg.eje_qrs > 90))
        alertas.push({ msg: `Eje QRS desviado (${currentEcg.eje_qrs}°) — ${currentEcg.eje_qrs > 90 ? 'Desviación Derecha' : 'Desviación Izquierda'}`, level: 'warn' })

    return (
        <div className="space-y-5">

            {/* ── HEADER ── */}
            <div className={`bg-white rounded-2xl border shadow-sm p-5 ${isNormalEcg ? 'border-slate-100' : 'border-rose-100'}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <motion.div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${isNormalEcg ? 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-200' : 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-200'}`}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 1.2 }}>
                            <HeartPulse className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Electrocardiograma</h3>
                            <p className="text-xs text-slate-400 font-medium">
                                {currentEcg.tipo_estudio || 'ECG en reposo'} — {currentEcg.medico || 'GP Medical Health'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDelete}
                            className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Eliminar estudio"
                        >
                            <Trash2 className="w-5 h-5" />
                        </Button>
                        <EstudioUploadReview pacienteId={pacienteId} tipoEstudio="ecg" onSaved={loadECG} isCompact />
                        <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Fecha</p>
                            <p className="text-sm font-bold text-slate-700">
                                {currentEcg.fecha ? new Date(currentEcg.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                            </p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl border ${isNormalEcg ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Resultado</p>
                            <div className="flex items-center gap-1.5">
                                {isNormalEcg
                                    ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                    : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                                <p className={`text-sm font-bold ${isNormalEcg ? 'text-emerald-700' : 'text-amber-700'}`}>
                                    {currentEcg.resultado_global || (isNormalEcg ? 'ECG Normal' : 'Con Hallazgos')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ritmo banner */}
                {currentEcg.ritmo_automatico && (
                    <div className={`mt-4 flex items-center gap-3 p-3 rounded-xl ${isNormalEcg ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'}`}>
                        <Activity className={`w-4 h-4 ${isNormalEcg ? 'text-emerald-600' : 'text-amber-600'}`} />
                        <p className={`text-sm font-bold ${isNormalEcg ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {currentEcg.ritmo_automatico}
                        </p>
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
                                <p className="text-xs font-medium text-amber-700">{a.msg}</p>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Selector de estudio — Timeline Horizontal */}
                {estudios.length > 1 && (
                    <div className="mt-6 pt-4 border-t border-slate-50">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">Historial de Estudios ECG</p>
                        <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide">
                            {estudios.map((e, i) => (
                                <motion.button
                                    key={e.id}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedIdx(i)}
                                    className={`flex-shrink-0 px-5 py-3 rounded-2xl border transition-all flex flex-col items-start gap-1 min-w-[140px] ${i === selectedIdx
                                        ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-200'
                                        : 'bg-white text-slate-600 border-slate-100 hover:border-rose-200 hover:bg-rose-50/30'
                                        }`}>
                                    <div className="flex items-center gap-2">
                                        <Calendar className={`w-3 h-3 ${i === selectedIdx ? 'text-white' : 'text-rose-400'}`} />
                                        <span className="text-[10px] font-black uppercase">{e.fecha ? new Date(e.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : 'S/F'}</span>
                                    </div>
                                    <p className={`text-xs font-bold ${i === selectedIdx ? 'text-white' : 'text-slate-800'}`}>
                                        {e.fecha ? new Date(e.fecha).getFullYear() : 'Reciente'}
                                    </p>
                                    <Badge className={`text-[8px] border-0 p-0 h-auto ${i === selectedIdx ? 'text-rose-200' : 'text-slate-400'}`}>
                                        {e.resultado_global || 'Estudio ECG'}
                                    </Badge>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── TABS ── */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
                {(['scanner', 'analisis'] as const).map(s => (
                    <button key={s} onClick={() => setActiveSection(s)}
                        className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeSection === s
                            ? 'bg-white text-rose-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}>
                        {s === 'scanner' ? '📋 Vista Escáner' : '🧠 Análisis IA'}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">

                {/* ══════════════════════════════════════
                    SECCIÓN 1: ESCÁNER — Replica del reporte
                ══════════════════════════════════════ */}
                {activeSection === 'scanner' && (
                    <motion.div key="scanner" initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                        className="space-y-6">

                        {/* Documento ECG Original — Preview del PDF/imagen subido */}
                        {!isFileError ? (
                            <Card className="border-slate-100 shadow-2xl overflow-hidden rounded-[2.5rem] bg-white border border-slate-200/50">
                                <div className="bg-white border-b border-slate-100 px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-rose-500" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Trazado Cardíaco / Reporte Médico</p>
                                            <p className="text-sm font-bold text-slate-800">Visualización de Alta Fidelidad</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge className="bg-emerald-500 text-white text-[10px] border-0 font-black px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/20">ARCHIVO SEGURO</Badge>
                                        <a href={currentEcg.archivo_url} target="_blank" rel="noreferrer"
                                            className="px-5 py-2 bg-slate-900 hover:bg-black rounded-full text-[10px] font-black text-white transition-all shadow-xl flex items-center gap-2 group">
                                            <Target className="w-4 h-4 group-hover:scale-125 transition-transform" /> ABRIR EN PANTALLA COMPLETA
                                        </a>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 min-h-[600px] flex items-center justify-center relative">
                                    {currentEcg.archivo_url && (currentEcg.archivo_url.toLowerCase().includes('.pdf') || (currentEcg.archivo_url.startsWith('blob:') && !currentEcg.archivo_url.includes('image'))) ? (
                                        <iframe
                                            src={`${currentEcg.archivo_url}#toolbar=0&navpanes=0`}
                                            className="w-full h-[800px] border-0 rounded-3xl shadow-inner bg-white"
                                            title="ECG Original PDF"
                                        />
                                    ) : currentEcg.archivo_url ? (
                                        <div className="w-full h-full flex justify-center bg-slate-950 rounded-[2rem] overflow-hidden p-6 shadow-2xl relative group">
                                            <img
                                                src={currentEcg.archivo_url}
                                                alt="ECG Trazado"
                                                className="max-w-full h-auto shadow-2xl rounded-lg cursor-zoom-in transition-transform duration-700 group-hover:scale-[1.01]"
                                                onClick={() => window.open(currentEcg.archivo_url, '_blank')}
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
                                            <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-2xl text-white text-[11px] font-black uppercase tracking-widest border border-white/20">
                                                    Haz clic para ampliar trazado
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </Card>
                        ) : (
                            <Card className="border-slate-100 shadow-xl p-20 text-center bg-white rounded-[2.5rem] border-dashed border-2 border-slate-200">
                                <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                    <AlertTriangle className="w-12 h-12 text-amber-500" />
                                </div>
                                <h3 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Archivo No Disponible</h3>
                                <p className="text-slate-500 max-w-lg mx-auto leading-relaxed font-medium">
                                    El trazado gráfico original no pudo ser recuperado del servidor. Esto suele ocurrir cuando el bucket de almacenamiento está en mantenimiento o la URL ha expirado por seguridad.
                                </p>
                                <div className="mt-12 flex justify-center gap-5">
                                    <Button variant="outline" className="rounded-2xl h-14 px-10 font-black text-xs uppercase tracking-widest border-2 hover:bg-slate-50 transition-colors" onClick={loadECG}>
                                        Reintentar Conexión
                                    </Button>
                                    <EstudioUploadReview pacienteId={pacienteId} tipoEstudio="ecg" onSaved={loadECG} isCompact />
                                </div>
                            </Card>
                        )}

                        {/* Tablero de parámetros — UX Avanzada */}
                        <div className="space-y-4">
                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-rose-500" /> Parametría Bioeléctrica Correlacionada
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <ECGParamGauge label="Freq. Cardíaca" value={currentEcg.fc} unit="bpm" min={60} max={100} />
                                <ECGParamGauge label="Intervalo PR" value={currentEcg.intervalo_pr} unit="ms" min={120} max={200} />
                                <ECGParamGauge label="Complejo QRS" value={currentEcg.complejo_qrs} unit="ms" min={60} max={100} />
                                <ECGParamGauge label="QT corregido" value={currentEcg.intervalo_qtc} unit="ms" min={350} max={450} />
                            </div>
                        </div>

                        {/* Interpretación narrativa — texto completo */}
                        {(currentEcg.descripcion_ritmo || currentEcg.analisis_morfologico || currentEcg.conclusion) && (
                            <Card className="border-slate-100 shadow-sm">
                                <CardContent className="p-5 space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reporte de Interpretación Médica</p>
                                    {currentEcg.descripcion_ritmo && (
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Ritmo Cardiaco</p>
                                            <p className="text-sm text-slate-700 leading-relaxed">{currentEcg.descripcion_ritmo}</p>
                                        </div>
                                    )}
                                    {currentEcg.analisis_morfologico && (
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Análisis Morfológico</p>
                                            <p className="text-sm text-slate-700 leading-relaxed">{currentEcg.analisis_morfologico}</p>
                                        </div>
                                    )}
                                    {currentEcg.segmento_st && (
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Segmento ST</p>
                                            <p className="text-sm text-slate-700">{currentEcg.segmento_st}</p>
                                        </div>
                                    )}
                                    {currentEcg.conclusion && (
                                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-1">Conclusión / Diagnóstico</p>
                                            <p className="text-sm text-slate-700 leading-relaxed font-medium">{currentEcg.conclusion}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Datos del estudio */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                                { label: 'Médico / Operador', value: currentEcg.medico || '—' },
                                { label: 'Equipo', value: currentEcg.equipo || '—' },
                                { label: 'Tipo de Estudio', value: currentEcg.tipo_estudio || '—' },
                                { label: 'Fecha', value: currentEcg.fecha ? new Date(currentEcg.fecha).toLocaleString('es-MX') : '—' },
                            ].map(({ label, value }) => (
                                <div key={label} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                                    <p className="text-xs font-bold text-slate-700 mt-0.5">{value}</p>
                                </div>
                            ))}
                        </div>

                        <DocumentosAdjuntos
                            pacienteId={pacienteId}
                            categoria="electrocardiograma"
                            titulo="Archivo ECG Original (Trazado / Reporte)"
                            collapsedByDefault={false}
                        />

                        {/* ── Todos los datos extraídos — texto verbatim ── */}
                        {currentEcg.rawResults && currentEcg.rawResults.length > 0 && (
                            <Card className="border-slate-100 shadow-2xl overflow-hidden rounded-[2.5rem] bg-white">
                                <div className="bg-slate-900 border-b border-slate-800 px-8 py-5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-md">
                                            <Activity className="w-5 h-5 text-rose-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-400">Especificaciones Técnicas IA</p>
                                            <p className="text-xs font-bold text-white/60">Extracción Verbatim Sin Filtro</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-white/10 text-white text-[9px] border-white/20 font-black px-3 py-1 uppercase tracking-widest leading-none">
                                        {currentEcg.rawResults.length} PARÁMETROS
                                    </Badge>
                                </div>
                                <div className="p-8 space-y-8 bg-gradient-to-b from-slate-50 to-white">
                                    {(() => {
                                        const HIDDEN_PARAMS = ['WAVEFORM_DATA', 'TIENE_TRAZADO_IMAGEN']
                                        const displayResults = currentEcg.rawResults.filter((r: any) => {
                                            if (HIDDEN_PARAMS.includes(r.parametro_nombre)) return false
                                            const val = String(r.resultado || '')
                                            if (val.startsWith('[{') || val.startsWith('{"')) return false
                                            return true
                                        })
                                        const cats = new Map<string, any[]>()
                                        for (const r of displayResults) {
                                            const cat = r.categoria || r.category || 'Metadatos Generales'
                                            if (!cats.has(cat)) cats.set(cat, [])
                                            cats.get(cat)!.push(r)
                                        }
                                        return Array.from(cats.entries()).map(([cat, items]) => (
                                            <div key={cat} className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-[1px] flex-1 bg-slate-200" />
                                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-100 rounded-full shadow-sm">
                                                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                                        {cat}
                                                    </p>
                                                    <div className="h-[1px] flex-1 bg-slate-200" />
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                    {items.map((r: any, i: number) => {
                                                        const rawText = r.resultado_numerico != null
                                                            ? `${r.resultado_numerico}${r.unidad ? ` ${r.unidad}` : ''}`
                                                            : typeof r.resultado === 'string'
                                                                ? r.resultado
                                                                : String(r.resultado || '—')
                                                        const isLong = rawText.length > 80
                                                        return (
                                                            <div key={i} className={`p-5 rounded-3xl bg-white border border-slate-100 hover:border-rose-200 hover:shadow-xl hover:-translate-y-1 transition-all group ${isLong ? 'col-span-2 md:col-span-3 lg:col-span-4' : ''}`}>
                                                                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 group-hover:text-rose-500 transition-colors">{r.parametro_nombre}</p>
                                                                <p className="text-sm font-black text-slate-800 mt-2 break-words whitespace-pre-wrap leading-tight">
                                                                    {rawText}
                                                                </p>
                                                                {r.observacion && (
                                                                    <div className="mt-3 pt-2 border-t border-slate-50">
                                                                        <p className="text-[10px] text-slate-400 font-medium italic leading-snug">{r.observacion}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        ))
                                    })()}
                                </div>
                            </Card>
                        )}
                    </motion.div>
                )}

                {/* ══════════════════════════════════════
                    SECCIÓN 2: ANÁLISIS IA SIN LÍMITE
                ══════════════════════════════════════ */}
                {activeSection === 'analisis' && (
                    <motion.div key="analisis" initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                        className="space-y-8">

                        {/* Header IA Futuristic */}
                        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl border border-white/5">
                            <div className="absolute top-0 right-0 p-12 opacity-5 translate-x-1/4 -translate-y-1/4">
                                <Activity className="w-80 h-80" />
                            </div>
                            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />

                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 backdrop-blur-md">
                                                <Brain className="w-7 h-7 text-emerald-400" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Motor de Diagnóstico IA GPMedical</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                                    <span className="text-[10px] font-bold text-emerald-100/60 uppercase">Análisis en tiempo real activo</span>
                                                </div>
                                            </div>
                                        </div>
                                        <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4 tracking-tight">
                                            {currentEcg.conclusion || currentEcg.resultado_global || 'Interpretación Clínica Detectada'}
                                        </h2>
                                        <p className="text-emerald-100/70 text-base font-medium leading-relaxed max-w-3xl">
                                            {currentEcg.ritmo_automatico || 'Analizando morfología de ondas'}. {isNormalEcg ? 'El estudio presenta parámetros dentro del rango fisiológico normal. Sin evidencia de arritmias o defectos de conducción.' : 'Se han identificado anomalías que requieren supervisión de un especialista.'}
                                        </p>
                                    </div>
                                    <div className="flex flex-row md:flex-col gap-3">
                                        <div className="px-6 py-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl text-center">
                                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Confianza IA</p>
                                            <p className="text-2xl font-black text-white">98.4%</p>
                                        </div>
                                        <Button className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest px-6 h-12 shadow-xl shadow-emerald-500/20 border-0">
                                            DESCARGAR INFORME IA
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Gauges Principales — UX Prioridad 1 */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <ECGParamGauge label="Freq. Cardíaca" value={currentEcg.fc} unit="bpm" min={60} max={100} />
                            <ECGParamGauge label="Intervalo PR" value={currentEcg.intervalo_pr} unit="ms" min={120} max={200} />
                            <ECGParamGauge label="Complejo QRS" value={currentEcg.complejo_qrs} unit="ms" min={60} max={100} />
                            <ECGParamGauge label="QT corregido" value={currentEcg.intervalo_qtc} unit="ms" min={350} max={450} decimals={0} />
                        </div>

                        {/* Rhythm Visualizer — Impacto Visual */}
                        <RhythmVisualizer fc={currentEcg.fc} />

                        {/* Gauges Secundarios */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <ECGParamGauge label="QT Nominal" value={currentEcg.intervalo_qt} unit="ms" min={350} max={450} />
                            <ECGParamGauge label="Amplitud P" value={currentEcg.onda_p} unit="ms" min={80} max={120} />
                            <ECGParamGauge label="Saturación O2" value={currentEcg.spo2} unit="%" min={95} max={100} />
                            <ECGParamGauge label="Intervalo RR" value={currentEcg.rr} unit="ms" min={600} max={1000} />
                        </div>
                        {/* Intervalos ECG - Bar Chart comparativo */}
                        {(currentEcg.intervalo_pr || currentEcg.complejo_qrs || currentEcg.intervalo_qt || currentEcg.intervalo_qtc) && (
                            <Card className="border-slate-100 shadow-sm">
                                <CardContent className="p-5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Intervalos ECG — Comparativa con Rangos Normales</p>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'PR', value: currentEcg.intervalo_pr, min: 120, max: 200, color: 'bg-blue-500' },
                                            { label: 'QRS', value: currentEcg.complejo_qrs, min: 60, max: 100, color: 'bg-purple-500' },
                                            { label: 'QT', value: currentEcg.intervalo_qt, min: 350, max: 450, color: 'bg-cyan-500' },
                                            { label: 'QTc', value: currentEcg.intervalo_qtc, min: 350, max: 450, color: 'bg-rose-500' },
                                        ].map(({ label, value, min, max, color }) => {
                                            if (!value) return null
                                            const pct = Math.min(100, (value / (max * 1.3)) * 100)
                                            const isWarn = value < min || value > max
                                            return (
                                                <div key={label} className="flex items-center gap-3">
                                                    <span className="text-xs font-black text-slate-500 w-10">{label}</span>
                                                    <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden relative">
                                                        {/* Normal range indicator */}
                                                        <div className="absolute h-full bg-emerald-100 rounded-full" style={{
                                                            left: `${(min / (max * 1.3)) * 100}%`,
                                                            width: `${((max - min) / (max * 1.3)) * 100}%`
                                                        }} />
                                                        <motion.div
                                                            className={`h-full rounded-full ${isWarn ? 'bg-amber-500' : color}`}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${pct}%` }}
                                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                                        />
                                                    </div>
                                                    <span className={`text-xs font-black w-16 text-right ${isWarn ? 'text-amber-600' : 'text-slate-700'}`}>
                                                        {value} ms
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <p className="text-[9px] text-slate-400 mt-3">█ Zona verde = rango normal de referencia</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* ── SECCIÓN CENTRAL: RADAR Y EJES (GRID RESPONSIVO) ── */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                            {/* 🎯 Radar Chart (GRANDE) */}
                            {(() => {
                                const radarParams = [
                                    { param: 'FC', value: currentEcg.fc, normalMin: 60, normalMax: 100, max: 150 },
                                    { param: 'PR', value: currentEcg.intervalo_pr, normalMin: 120, normalMax: 200, max: 300 },
                                    { param: 'QRS', value: currentEcg.complejo_qrs, normalMin: 60, normalMax: 100, max: 160 },
                                    { param: 'QTc', value: currentEcg.intervalo_qtc, normalMin: 350, normalMax: 450, max: 600 },
                                    { param: 'Ond P', value: currentEcg.onda_p, normalMin: 80, normalMax: 120, max: 180 },
                                ].filter(p => p.value != null)

                                if (radarParams.length < 3) return null

                                const cx = 150, cy = 150, r = 110
                                const angleStep = (2 * Math.PI) / radarParams.length
                                const getPoint = (idx: number, value: number, maxVal: number) => {
                                    const angle = (idx * angleStep) - Math.PI / 2
                                    const ratio = Math.min(value / maxVal, 1)
                                    return {
                                        x: cx + r * ratio * Math.cos(angle),
                                        y: cy + r * ratio * Math.sin(angle)
                                    }
                                }

                                const valuePoints = radarParams.map((p, i) => getPoint(i, p.value!, p.max))
                                const valuePolygon = valuePoints.map(p => `${p.x},${p.y}`).join(' ')
                                const normalPoints = radarParams.map((p, i) => getPoint(i, p.normalMax, p.max))
                                const normalPolygon = normalPoints.map(p => `${p.x},${p.y}`).join(' ')

                                return (
                                    <Card className="border-slate-100 shadow-2xl rounded-[2.5rem] bg-white overflow-hidden group">
                                        <CardContent className="p-8">
                                            <div className="flex items-center justify-between mb-8">
                                                <div>
                                                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Biometría Vectorial</p>
                                                    <h4 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                                        <Target className="w-5 h-5 text-rose-500" /> Perfil de Conducción
                                                    </h4>
                                                </div>
                                                <Badge className="bg-rose-50 text-rose-600 border-rose-100 font-black px-4 py-1.5 rounded-full">RADAR DINÁMICO</Badge>
                                            </div>

                                            <div className="flex flex-col lg:flex-row items-center gap-10">
                                                <div className="relative p-4 bg-slate-50 rounded-[3rem] shadow-inner">
                                                    <svg width="340" height="340" viewBox="0 0 300 300" className="mx-auto w-full max-w-[340px] drop-shadow-2xl">
                                                        {/* Grid rings */}
                                                        {[0.25, 0.5, 0.75, 1].map(ring => (
                                                            <circle key={ring} cx={cx} cy={cy} r={r * ring}
                                                                fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                                                        ))}
                                                        {/* Axis lines */}
                                                        {radarParams.map((_, i) => {
                                                            const angle = (i * angleStep) - Math.PI / 2
                                                            return (
                                                                <line key={i} x1={cx} y1={cy}
                                                                    x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)}
                                                                    stroke="#cbd5e1" strokeWidth="1.5" />
                                                            )
                                                        })}
                                                        {/* Normal range polygon */}
                                                        <polygon points={normalPolygon} fill="#10b98110" stroke="#10b98144" strokeWidth="2" strokeDasharray="6 4" />

                                                        {/* Value polygon with glow */}
                                                        <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
                                                            <feGaussianBlur stdDeviation="3" result="blur" />
                                                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                                        </filter>

                                                        <motion.polygon
                                                            points={valuePolygon} fill="url(#radarGradient)" stroke="#F43F5E" strokeWidth="5" strokeLinejoin="round"
                                                            filter="url(#radarGlow)"
                                                            initial={{ opacity: 0, scale: 0.2 }} animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} />

                                                        <defs>
                                                            <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
                                                                <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.4" />
                                                                <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.1" />
                                                            </radialGradient>
                                                        </defs>

                                                        {/* Data points */}
                                                        {valuePoints.map((p, i) => (
                                                            <motion.g key={i}>
                                                                <motion.circle cx={p.x} cy={p.y} r="7"
                                                                    fill="#F43F5E" stroke="white" strokeWidth="3"
                                                                    initial={{ r: 0 }} animate={{ r: 7 }}
                                                                    transition={{ duration: 0.5, delay: i * 0.15 + 0.5 }} />
                                                            </motion.g>
                                                        ))}

                                                        {/* Labels */}
                                                        {radarParams.map((p, i) => {
                                                            const angle = (i * angleStep) - Math.PI / 2
                                                            const labelR = r + 30
                                                            return (
                                                                <text key={i} x={cx + labelR * Math.cos(angle)} y={cy + labelR * Math.sin(angle)}
                                                                    textAnchor="middle" dominantBaseline="middle"
                                                                    fontSize="12" fontWeight="900" fill="#334155" className="uppercase tracking-tighter">
                                                                    {p.param}
                                                                </text>
                                                            )
                                                        })}
                                                    </svg>
                                                </div>

                                                <div className="flex-1 space-y-4 w-full">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {radarParams.map((p, i) => {
                                                            const isWarn = p.value! < p.normalMin || p.value! > p.normalMax
                                                            return (
                                                                <div key={i} className={`p-4 rounded-2xl border transition-all duration-300 ${isWarn ? 'bg-amber-50 border-amber-100 hover:border-amber-300' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}>
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.param}</span>
                                                                        {isWarn && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                                                                    </div>
                                                                    <div className="flex items-baseline gap-2">
                                                                        <span className={`text-xl font-black tracking-tighter ${isWarn ? 'text-amber-700' : 'text-slate-800'}`}>{p.value}</span>
                                                                        <span className="text-[10px] text-slate-400 font-bold">({p.normalMin}-{p.normalMax})</span>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>

                                                    <div className="mt-6 p-5 rounded-3xl bg-slate-900 text-white flex items-center justify-between shadow-xl">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/5">
                                                                <Brain className="w-5 h-5 text-emerald-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Estado Axial</p>
                                                                <p className="text-xs font-bold text-white">Eje QRS: {currentEcg.eje_qrs ?? '—'}°</p>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" className="text-white hover:bg-white/10 rounded-xl h-9 px-4 text-[10px] font-black uppercase">
                                                            Saber más
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })()}

                            {/* Ejes eléctricos (USAR EL COMPONENTE REFACTORIZADO ARRIBA) */}
                            {(currentEcg.eje_p !== null || currentEcg.eje_qrs !== null || currentEcg.eje_t !== null) && (
                                <EjesElectricos ejeP={currentEcg.eje_p} ejeQRS={currentEcg.eje_qrs} ejeT={currentEcg.eje_t} />
                            )}
                        </div>


                        {/* ── Conducción Eléctrica Timeline — Ciclo Cardíaco ── */}
                        {(currentEcg.onda_p || currentEcg.intervalo_pr || currentEcg.complejo_qrs || currentEcg.intervalo_qt) && (
                            <Card className="border-slate-100 shadow-sm">
                                <CardContent className="p-5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                                        ⚡ Ciclo Cardíaco — Secuencia de Conducción
                                    </p>
                                    <div className="relative">
                                        {/* Total bar background */}
                                        <div className="h-10 bg-slate-100 rounded-xl overflow-hidden relative flex">
                                            {(() => {
                                                const total = (currentEcg.rr || currentEcg.intervalo_qt || 800) // Total cycle in ms
                                                const segments = [
                                                    { label: 'P', ms: currentEcg.onda_p || 100, color: 'from-blue-400 to-blue-500' },
                                                    { label: 'PR seg', ms: ((currentEcg.intervalo_pr || 160) - (currentEcg.onda_p || 100)), color: 'from-sky-300 to-sky-400' },
                                                    { label: 'QRS', ms: currentEcg.complejo_qrs || 80, color: 'from-rose-500 to-red-600' },
                                                    { label: 'ST-T', ms: ((currentEcg.intervalo_qt || 400) - (currentEcg.complejo_qrs || 80) - ((currentEcg.intervalo_pr || 160) - (currentEcg.onda_p || 100)) - (currentEcg.onda_p || 100)), color: 'from-amber-400 to-orange-500' },
                                                ].filter(s => s.ms > 0)
                                                const sumMs = segments.reduce((s, seg) => s + seg.ms, 0)
                                                return segments.map((seg, i) => (
                                                    <motion.div
                                                        key={i}
                                                        className={`h-full bg-gradient-to-r ${seg.color} flex items-center justify-center relative`}
                                                        style={{ width: `${(seg.ms / sumMs) * 100}%` }}
                                                        initial={{ scaleX: 0 }}
                                                        animate={{ scaleX: 1 }}
                                                        transition={{ duration: 0.6, delay: i * 0.15 }}
                                                    >
                                                        <span className="text-[8px] font-black text-white drop-shadow-sm">
                                                            {seg.label}
                                                        </span>
                                                    </motion.div>
                                                ))
                                            })()}
                                        </div>
                                        {/* Labels below */}
                                        <div className="flex justify-between mt-2">
                                            {[
                                                { label: 'Onda P', value: currentEcg.onda_p, color: 'text-blue-600' },
                                                { label: 'Int. PR', value: currentEcg.intervalo_pr, color: 'text-sky-600' },
                                                { label: 'QRS', value: currentEcg.complejo_qrs, color: 'text-rose-600' },
                                                { label: 'QT', value: currentEcg.intervalo_qt, color: 'text-amber-600' },
                                                { label: 'QTc', value: currentEcg.intervalo_qtc, color: 'text-orange-600' },
                                            ].filter(l => l.value).map((l, i) => (
                                                <div key={i} className="text-center">
                                                    <p className={`text-xs font-black ${l.color}`}>{l.value} ms</p>
                                                    <p className="text-[8px] text-slate-400 font-bold">{l.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Análisis por componente */}
                        <Card className="border-rose-100 shadow-sm bg-gradient-to-br from-rose-50 to-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Brain className="w-4 h-4 text-rose-600" />
                                    <p className="text-sm font-black text-slate-800 uppercase tracking-wide">Interpretación Cardiológica Completa</p>
                                </div>
                                <div className="space-y-3">
                                    {/* FC */}
                                    {currentEcg.fc !== null && (
                                        <div className="p-3 bg-white rounded-xl border border-rose-100">
                                            <p className="font-black text-rose-700 text-xs uppercase tracking-widest mb-1">Frecuencia Cardiaca</p>
                                            <p className="text-sm text-slate-700 leading-relaxed">
                                                FC: <strong>{currentEcg.fc} lpm</strong> —{' '}
                                                {currentEcg.fc < 60 ? 'Bradicardia: frecuencia cardiaca por debajo de 60 lpm.' :
                                                    currentEcg.fc > 100 ? 'Taquicardia: frecuencia cardiaca por encima de 100 lpm.' :
                                                        'Frecuencia cardiaca dentro del rango normal (60-100 lpm).'}
                                                {currentEcg.rr && ` Intervalo RR: ${currentEcg.rr} ms.`}
                                            </p>
                                        </div>
                                    )}
                                    {/* Conducción */}
                                    {(currentEcg.intervalo_pr !== null || currentEcg.complejo_qrs !== null) && (
                                        <div className="p-3 bg-white rounded-xl border border-rose-100">
                                            <p className="font-black text-rose-700 text-xs uppercase tracking-widest mb-1">Sistema de Conducción</p>
                                            <p className="text-sm text-slate-700 leading-relaxed">
                                                {currentEcg.intervalo_pr && `PR: ${currentEcg.intervalo_pr} ms ${currentEcg.intervalo_pr > 200 ? '— PROLONGADO (bloqueo AV 1° grado)' : '— normal'}. `}
                                                {currentEcg.complejo_qrs && `QRS: ${currentEcg.complejo_qrs} ms ${currentEcg.complejo_qrs > 120 ? '— ANCHO (bloqueo de rama)' : '— normal'}. `}
                                                {currentEcg.intervalo_qtc && `QTc: ${currentEcg.intervalo_qtc} ms ${currentEcg.intervalo_qtc > 450 ? '— PROLONGADO — riesgo arrítmico' : '— normal'}.`}
                                            </p>
                                        </div>
                                    )}
                                    {/* Conclusión IA */}
                                    <div className={`p-4 rounded-xl border ${isNormalEcg ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                                        <p className={`font-black text-xs uppercase tracking-widest mb-2 ${isNormalEcg ? 'text-emerald-700' : 'text-amber-700'}`}>
                                            Conclusión Clínica
                                        </p>
                                        <p className="text-sm text-slate-700 leading-relaxed">
                                            {currentEcg.conclusion || (isNormalEcg
                                                ? 'Electrocardiograma dentro de límites normales. Sin alteraciones en el ritmo, conducción ni morfología. Sin contraindicación cardiológica para actividad laboral habitual.'
                                                : 'Se detectaron hallazgos que requieren correlación clínica. Se recomienda valoración por cardiólogo.'
                                            )}
                                        </p>
                                    </div>
                                    {/* Alertas detalladas */}
                                    {alertas.length > 0 && (
                                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                                            <p className="font-black text-amber-700 text-xs uppercase tracking-widest mb-2">Hallazgos que requieren atención</p>
                                            <ul className="space-y-1.5">
                                                {alertas.map((a, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                                        <span className="text-xs text-amber-700 font-medium">{a.msg}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Relevancia laboral */}
                        <Card className="border-emerald-100 shadow-sm">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Shield className="w-4 h-4 text-emerald-500" />
                                    <p className="text-sm font-black text-slate-800 uppercase tracking-wide">Aptitud Laboral Cardiovascular</p>
                                </div>
                                <div className={`p-3 rounded-xl ${isNormalEcg && alertas.length === 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        {isNormalEcg && alertas.length === 0
                                            ? 'Sin contraindicación cardiológica para puesto actual. Seguimiento según protocolo de revisión periódica.'
                                            : alertas.length > 0
                                                ? 'Se recomienda valoración cardiológica especializada antes de determinar aptitud laboral definitiva. Correlacionar con historial clínico y factores de riesgo cardiovascular.'
                                                : 'Correlacionar con factores de riesgo and sintomatología del paciente.'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
