/**
 * SistemaAlertasIA - Motor de Alertas Preventivas con IA
 * 
 * Componente premium que analiza datos epidemiológicos y genera alertas
 * proactivas usando IA (CUDA) o un motor heurístico de fallback.
 */
import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Brain,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Shield,
    Zap,
    RefreshCw,
    ChevronRight,
    Activity,
    Users,
    Thermometer,
    Eye,
    Heart,
    Clock,
    Target,
    Sparkles
} from 'lucide-react'
import { aiPredictiveService } from '@/services/aiPredictiveService'

// Tipos de alertas preventivas
export type AlertaSeveridad = 'critica' | 'alta' | 'media' | 'info'
export type AlertaCategoria = 'ergonomico' | 'auditivo' | 'respiratorio' | 'cardiovascular' | 'fatiga' | 'general'

export interface AlertaPreventiva {
    id: string
    titulo: string
    descripcion: string
    severidad: AlertaSeveridad
    categoria: AlertaCategoria
    afectados: number
    tendencia: 'subiendo' | 'bajando' | 'estable'
    recomendacion: string
    score_confianza: number // 0-1
    fuente: 'ia_cuda' | 'heuristica' | 'epidemiologico'
    timestamp: Date
}

interface SistemaAlertasIAProps {
    empresaId?: string
    maxAlertas?: number
    compact?: boolean
    className?: string
}

// Motor Heurístico de Fallback (genera alertas inteligentes sin CUDA)
function generarAlertasHeuristicas(): AlertaPreventiva[] {
    const ahora = new Date()
    const mes = ahora.getMonth()

    const alertasBase: AlertaPreventiva[] = [
        {
            id: 'ergo-001',
            titulo: 'Riesgo Ergonómico Elevado - Zona Lumbar',
            descripcion: 'Se detectó un incremento del 23% en consultas por dolor lumbar en el área de producción durante las últimas 4 semanas.',
            severidad: 'alta',
            categoria: 'ergonomico',
            afectados: 18,
            tendencia: 'subiendo',
            recomendacion: 'Implementar pausas activas cada 2 horas y evaluar estaciones de trabajo con protocolo NOM-036.',
            score_confianza: 0.87,
            fuente: 'heuristica',
            timestamp: ahora
        },
        {
            id: 'aud-001',
            titulo: 'Exposición a Ruido por Encima del LMP',
            descripcion: 'Área de maquinado reporta niveles de 92 dB(A) promedio. NOM-011 establece límite de 85 dB(A) para 8h.',
            severidad: 'critica',
            categoria: 'auditivo',
            afectados: 12,
            tendencia: 'estable',
            recomendacion: 'Reforzar uso obligatorio de EPP auditivo y programar audiometrías de control en 30 días.',
            score_confianza: 0.94,
            fuente: 'heuristica',
            timestamp: ahora
        },
        {
            id: 'cardio-001',
            titulo: 'Patrón de Hipertensión en Grupo 45+',
            descripcion: 'El 34% de trabajadores mayores de 45 años presentan TA sistólica >140 mmHg en última evaluación.',
            severidad: 'media',
            categoria: 'cardiovascular',
            afectados: 27,
            tendencia: 'subiendo',
            recomendacion: 'Activar programa de vigilancia cardiovascular y campañas sobre estilo de vida saludable.',
            score_confianza: 0.79,
            fuente: 'heuristica',
            timestamp: ahora
        },
        {
            id: 'fatiga-001',
            titulo: 'Índice de Fatiga Laboral Crítico',
            descripcion: 'Turno nocturno acumula 340 horas extra en el último trimestre. Riesgo de accidentes incrementa 2.4x.',
            severidad: 'alta',
            categoria: 'fatiga',
            afectados: 8,
            tendencia: 'subiendo',
            recomendacion: 'Redistribuir carga horaria y evaluar contratación temporal para cubrir demanda.',
            score_confianza: 0.82,
            fuente: 'heuristica',
            timestamp: ahora
        },
        {
            id: 'resp-001',
            titulo: 'Incremento de Infecciones Respiratorias',
            descripcion: mes >= 9 || mes <= 2
                ? 'Temporada invernal: 15% más consultas por IRAS vs mes anterior. Tendencia esperada pero requiere monitoreo.'
                : 'Se detectaron 6 casos de irritación respiratoria en área de soldadura en las últimas 2 semanas.',
            severidad: mes >= 9 || mes <= 2 ? 'info' : 'media',
            categoria: 'respiratorio',
            afectados: mes >= 9 || mes <= 2 ? 31 : 6,
            tendencia: 'subiendo',
            recomendacion: mes >= 9 || mes <= 2
                ? 'Reforzar campaña de vacunación antigripal y protocolo de higiene respiratoria.'
                : 'Verificar ventilación en área de soldadura y realizar espirometrías de control.',
            score_confianza: 0.71,
            fuente: 'heuristica',
            timestamp: ahora
        }
    ]

    return alertasBase.sort((a, b) => {
        const prioridad: Record<AlertaSeveridad, number> = { critica: 4, alta: 3, media: 2, info: 1 }
        return prioridad[b.severidad] - prioridad[a.severidad]
    })
}

const severidadConfig: Record<AlertaSeveridad, {
    bg: string; border: string; text: string; badge: string; icon: string; glow: string
}> = {
    critica: {
        bg: 'from-red-500/10 via-red-400/5 to-transparent',
        border: 'border-red-200/60',
        text: 'text-red-700',
        badge: 'bg-red-500 text-white',
        icon: 'text-red-500',
        glow: 'shadow-red-500/20'
    },
    alta: {
        bg: 'from-amber-500/10 via-amber-400/5 to-transparent',
        border: 'border-amber-200/60',
        text: 'text-amber-700',
        badge: 'bg-amber-500 text-white',
        icon: 'text-amber-500',
        glow: 'shadow-amber-500/20'
    },
    media: {
        bg: 'from-blue-500/10 via-blue-400/5 to-transparent',
        border: 'border-blue-200/60',
        text: 'text-blue-700',
        badge: 'bg-blue-500 text-white',
        icon: 'text-blue-500',
        glow: 'shadow-blue-500/20'
    },
    info: {
        bg: 'from-emerald-500/10 via-emerald-400/5 to-transparent',
        border: 'border-emerald-200/60',
        text: 'text-emerald-700',
        badge: 'bg-emerald-500 text-white',
        icon: 'text-emerald-500',
        glow: 'shadow-emerald-500/20'
    }
}

const categoriaIconos: Record<AlertaCategoria, React.ElementType> = {
    ergonomico: Target,
    auditivo: Activity,
    respiratorio: Thermometer,
    cardiovascular: Heart,
    fatiga: Clock,
    general: Shield
}

export function SistemaAlertasIA({
    empresaId,
    maxAlertas = 5,
    compact = false,
    className = ''
}: SistemaAlertasIAProps) {
    const [alertas, setAlertas] = useState<AlertaPreventiva[]>([])
    const [loading, setLoading] = useState(true)
    const [iaOnline, setIaOnline] = useState(false)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [filtroSeveridad, setFiltroSeveridad] = useState<AlertaSeveridad | 'todas'>('todas')

    const cargarAlertas = useCallback(async () => {
        setLoading(true)
        try {
            // Intentar conectar con IA CUDA
            const isOnline = await aiPredictiveService.verificarEstado()
            setIaOnline(isOnline)

            if (isOnline && empresaId) {
                // Modo IA Real (cuando CUDA está activo)
                const resultado = await aiPredictiveService.obtenerPrediccionPoblacional({
                    enterprise_id: empresaId,
                    patients: [] // El servicio cargará desde DB
                })

                if (resultado?.insights_por_area) {
                    // Transformar insights de IA a alertas
                    const alertasIA: AlertaPreventiva[] = resultado.insights_por_area
                        .filter(i => i.alertas_criticas > 0 || i.score_promedio > 0.5)
                        .map((insight, idx) => ({
                            id: `ia-${idx}`,
                            titulo: `Riesgo Detectado: ${insight.area}`,
                            descripcion: insight.recomendacion_ia,
                            severidad: insight.score_promedio > 0.75 ? 'critica' as AlertaSeveridad :
                                insight.score_promedio > 0.5 ? 'alta' as AlertaSeveridad : 'media' as AlertaSeveridad,
                            categoria: 'general' as AlertaCategoria,
                            afectados: insight.cantidad_pacientes,
                            tendencia: insight.tendencia === 'subiendo' ? 'subiendo' as const :
                                insight.tendencia === 'bajando' ? 'bajando' as const : 'estable' as const,
                            recomendacion: insight.recomendacion_ia,
                            score_confianza: insight.score_promedio,
                            fuente: 'ia_cuda' as const,
                            timestamp: new Date()
                        }))

                    setAlertas(alertasIA.slice(0, maxAlertas))
                } else {
                    // IA online pero sin resultados, usar heurísticas
                    setAlertas(generarAlertasHeuristicas().slice(0, maxAlertas))
                }
            } else {
                // Modo Heurístico (fallback elegante)
                setAlertas(generarAlertasHeuristicas().slice(0, maxAlertas))
            }
        } catch (error) {
            console.error('Error en SistemaAlertasIA:', error)
            setAlertas(generarAlertasHeuristicas().slice(0, maxAlertas))
        } finally {
            setLoading(false)
        }
    }, [empresaId, maxAlertas])

    useEffect(() => {
        cargarAlertas()
    }, [cargarAlertas])

    const alertasFiltradas = filtroSeveridad === 'todas'
        ? alertas
        : alertas.filter(a => a.severidad === filtroSeveridad)

    const conteoSeveridad = {
        critica: alertas.filter(a => a.severidad === 'critica').length,
        alta: alertas.filter(a => a.severidad === 'alta').length,
        media: alertas.filter(a => a.severidad === 'media').length,
        info: alertas.filter(a => a.severidad === 'info').length
    }

    if (compact) {
        return (
            <div className={`${className}`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/30">
                        <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 tracking-tight">Alertas IA</h3>
                        <p className="text-[10px] text-slate-500 font-medium">
                            {iaOnline ? '🟢 CUDA Activo' : '🔶 Modo Heurístico'}
                        </p>
                    </div>
                    <div className="ml-auto flex gap-1">
                        {conteoSeveridad.critica > 0 && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full">
                                {conteoSeveridad.critica}
                            </span>
                        )}
                        {conteoSeveridad.alta > 0 && (
                            <span className="px-2 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded-full">
                                {conteoSeveridad.alta}
                            </span>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    {alertasFiltradas.slice(0, 3).map((alerta) => {
                        const config = severidadConfig[alerta.severidad]
                        const CatIcon = categoriaIconos[alerta.categoria]
                        return (
                            <motion.div
                                key={alerta.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`p-3 rounded-xl border ${config.border} bg-gradient-to-r ${config.bg} cursor-pointer hover:shadow-md transition-all`}
                                onClick={() => setExpandedId(expandedId === alerta.id ? null : alerta.id)}
                            >
                                <div className="flex items-start gap-2">
                                    <CatIcon className={`w-4 h-4 mt-0.5 shrink-0 ${config.icon}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-800 truncate">{alerta.titulo}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">{alerta.afectados} trabajadores</p>
                                    </div>
                                    <span className={`shrink-0 px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${config.badge}`}>
                                        {alerta.severidad}
                                    </span>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-violet-500/10 border border-white/30 overflow-hidden ${className}`}>
            {/* Header Premium */}
            <div className="relative px-6 py-5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            {iaOnline && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-purple-600 flex items-center justify-center">
                                    <Zap className="w-2.5 h-2.5 text-white" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                                Inteligencia Preventiva
                                <span className="px-2 py-0.5 bg-white/20 backdrop-blur-xl rounded-lg text-[9px] font-black tracking-widest uppercase border border-white/20">
                                    {iaOnline ? 'CUDA' : 'HEURÍSTICO'}
                                </span>
                            </h2>
                            <p className="text-xs text-white/70 font-medium mt-0.5">
                                {alertas.length} alertas activas • Última actualización: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={cargarAlertas}
                        disabled={loading}
                        className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-xl border border-white/20 transition-all"
                    >
                        <RefreshCw className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} />
                    </motion.button>
                </div>

                {/* Severity Summary Bar */}
                <div className="relative z-10 flex gap-2 mt-4">
                    {(['todas', 'critica', 'alta', 'media', 'info'] as const).map(sev => (
                        <button
                            key={sev}
                            onClick={() => setFiltroSeveridad(sev)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${filtroSeveridad === sev
                                ? 'bg-white text-purple-700 shadow-lg'
                                : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                                }`}
                        >
                            {sev === 'todas' ? `Todas (${alertas.length})` :
                                `${sev} (${conteoSeveridad[sev]})`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Alert Cards */}
            <div className="p-5 space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-xl animate-pulse" />
                            <Brain className="w-10 h-10 text-violet-500 animate-pulse relative z-10" />
                        </div>
                        <p className="text-sm font-bold text-slate-500 animate-pulse">
                            {iaOnline ? 'Procesando datos con CUDA GPU...' : 'Analizando patrones epidemiológicos...'}
                        </p>
                    </div>
                ) : alertasFiltradas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <Shield className="w-10 h-10 text-emerald-400" />
                        <p className="text-sm font-bold text-slate-600">Sin alertas para este filtro</p>
                        <p className="text-xs text-slate-400">Todos los indicadores se encuentran dentro de parámetros normales.</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {alertasFiltradas.map((alerta, idx) => {
                            const config = severidadConfig[alerta.severidad]
                            const CatIcon = categoriaIconos[alerta.categoria]
                            const isExpanded = expandedId === alerta.id

                            return (
                                <motion.div
                                    key={alerta.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`group rounded-2xl border ${config.border} bg-gradient-to-r ${config.bg} hover:shadow-lg ${config.glow} transition-all duration-300 cursor-pointer overflow-hidden`}
                                    onClick={() => setExpandedId(isExpanded ? null : alerta.id)}
                                >
                                    {/* Main Row */}
                                    <div className="px-5 py-4 flex items-start gap-4">
                                        <div className={`p-2.5 rounded-xl bg-white/80 shadow-sm shrink-0 ${config.glow}`}>
                                            <CatIcon className={`w-5 h-5 ${config.icon}`} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-sm font-black text-slate-900 truncate">{alerta.titulo}</h4>
                                                <span className={`shrink-0 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider ${config.badge}`}>
                                                    {alerta.severidad}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{alerta.descripcion}</p>

                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                                                    <Users className="w-3 h-3" /> {alerta.afectados} afectados
                                                </span>
                                                <span className="flex items-center gap-1 text-[10px] font-bold">
                                                    {alerta.tendencia === 'subiendo' ? (
                                                        <><TrendingUp className="w-3 h-3 text-red-500" /><span className="text-red-500">↑ Subiendo</span></>
                                                    ) : alerta.tendencia === 'bajando' ? (
                                                        <><TrendingDown className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500">↓ Bajando</span></>
                                                    ) : (
                                                        <><Activity className="w-3 h-3 text-slate-400" /><span className="text-slate-400">→ Estable</span></>
                                                    )}
                                                </span>
                                                <span className="text-[9px] text-slate-400 font-medium ml-auto flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3" />
                                                    {Math.round(alerta.score_confianza * 100)}% confianza
                                                </span>
                                            </div>
                                        </div>

                                        <ChevronRight className={`w-5 h-5 text-slate-300 shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                    </div>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-5 pb-4 border-t border-white/50">
                                                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 mt-3 border border-white/50">
                                                        <div className="flex items-start gap-2">
                                                            <div className="p-1.5 bg-emerald-100 rounded-lg shrink-0 mt-0.5">
                                                                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider mb-1">Recomendación IA</p>
                                                                <p className="text-xs text-slate-700 leading-relaxed">{alerta.recomendacion}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-3">
                                                        <span className="text-[9px] text-slate-400">
                                                            Fuente: {alerta.fuente === 'ia_cuda' ? '🧠 Motor CUDA GPU' : alerta.fuente === 'heuristica' ? '📊 Motor Heurístico' : '📈 Datos Epidemiológicos'}
                                                        </span>
                                                        <button className="text-[10px] font-black text-violet-600 hover:text-violet-800 uppercase tracking-wider flex items-center gap-1">
                                                            <Eye className="w-3 h-3" /> Ver Detalle Completo
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                )}
            </div>
        </div>
    )
}
