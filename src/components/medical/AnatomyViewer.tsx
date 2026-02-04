/**
 * Visor Anatómico Interactivo - Estilo Sci-Fi
 * 
 * Componente central del Dashboard Luxury. Muestra el cuerpo humano holográfico
 * con puntos de interés interactivos y animaciones de escaneo.
 */
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, AlertCircle, Shield, Heart, Zap } from 'lucide-react'

interface Hotspot {
    id: string
    x: number // Porcentaje horizontal
    y: number // Porcentaje vertical
    label: string
    status: 'normal' | 'warning' | 'critical'
    details: string
    metric: string
}

export function AnatomyViewer() {
    const [activeHotspot, setActiveHotspot] = useState<string | null>(null)
    const [scanning, setScanning] = useState(true)

    // Datos simulados de alertas en el cuerpo
    const hotspots: Hotspot[] = [
        { id: 'brain', x: 50, y: 12, label: 'Neurología', status: 'normal', details: 'Actividad neuronal estable', metric: '98% Eff' },
        { id: 'heart', x: 55, y: 30, label: 'Cardiología', status: 'warning', details: 'Leve arritmia detectada en Sector 4', metric: '85 BPM' },
        { id: 'lungs', x: 45, y: 32, label: 'Neumología', status: 'normal', details: 'Capacidad pulmonar óptima', metric: '99% SpO2' },
        { id: 'stomach', x: 50, y: 45, label: 'Gastro', status: 'normal', details: 'Sin anomalías digestivas', metric: 'pH 7.2' },
        { id: 'muscle_arm', x: 25, y: 40, label: 'Muscular Der', status: 'critical', details: 'Fatiga muscular severa detectada', metric: 'Lactic 4.5' },
        { id: 'joints_knee', x: 40, y: 75, label: 'Articulación', status: 'normal', details: 'Líquido sinovial normal', metric: 'Inflamación 0%' },
    ]

    const getStatusColor = (status: Hotspot['status']) => {
        switch (status) {
            case 'normal': return 'bg-cyan-500 shadow-cyan-500/50'
            case 'warning': return 'bg-amber-500 shadow-amber-500/50'
            case 'critical': return 'bg-red-600 shadow-red-600/50'
        }
    }

    const getStatusText = (status: Hotspot['status']) => {
        switch (status) {
            case 'normal': return 'text-cyan-400'
            case 'warning': return 'text-amber-400'
            case 'critical': return 'text-red-500'
        }
    }

    return (
        <div className="relative w-full h-full min-h-[600px] flex items-center justify-center overflow-hidden rounded-3xl bg-black/40 backdrop-blur-sm border border-white/5">

            {/* Grid de fondo sci-fi */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-10 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent pointer-events-none"></div>

            {/* Imagen Anatómica Central */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-[400px] aspect-[1/2]"
            >
                {/* IMPORTANTE: Usando la imagen generada por IA */}
                <img
                    src="/assets/anatomy_clean.png"
                    alt="Anatomy Hologram"
                    className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                />

                {/* Efecto de escaneo láser */}
                {scanning && (
                    <motion.div
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] z-20 pointer-events-none"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>
                    </motion.div>
                )}

                {/* Hotspots interactivos */}
                {hotspots.map((spot) => (
                    <div
                        key={spot.id}
                        className="absolute z-30 group"
                        style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    >
                        {/* Punto pulsante */}
                        <motion.button
                            whileHover={{ scale: 1.2 }}
                            onClick={() => setActiveHotspot(activeHotspot === spot.id ? null : spot.id)}
                            className={`relative -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${getStatusColor(spot.status)} shadow-[0_0_15px] border border-white/50 transition-all duration-300`}
                        >
                            <div className={`absolute inset-0 rounded-full ${getStatusColor(spot.status)} animate-ping opacity-75`}></div>
                        </motion.button>

                        {/* Línea conectora */}
                        <AnimatePresence>
                            {(activeHotspot === spot.id || spot.status !== 'normal') && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 80 }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="absolute top-1/2 left-4 h-[1px] bg-white/20 origin-left"
                                />
                            )}
                        </AnimatePresence>

                        {/* Etiqueta de detalle (Aparece al click o si es warning/critical) */}
                        <AnimatePresence>
                            {(activeHotspot === spot.id || spot.status !== 'normal') && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 80 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="absolute top-1/2 -translate-y-1/2 left-0 ml-4 pointer-events-none"
                                >
                                    <div className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-lg w-48 shadow-2xl">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-xs font-bold uppercase tracking-wider ${getStatusText(spot.status)}`}>
                                                {spot.label}
                                            </span>
                                            {spot.status === 'critical' && <AlertCircle className="w-3 h-3 text-red-500 animate-pulse" />}
                                        </div>
                                        <p className="text-[10px] text-gray-300 leading-tight mb-2">{spot.details}</p>
                                        <div className="flex items-center justify-between border-t border-white/10 pt-1">
                                            <span className="text-[10px] text-gray-500">Métrica</span>
                                            <span className="text-xs font-mono font-medium text-white">{spot.metric}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}

            </motion.div>

            {/* Controles del Visor */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/10">
                <button
                    onClick={() => setScanning(!scanning)}
                    className={`p-2 rounded-full transition-all ${scanning ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-white/10 text-gray-400'}`}
                    title="Toggle Scan"
                >
                    <Activity className="w-5 h-5" />
                </button>
                <div className="w-[1px] h-6 bg-white/10"></div>
                <div className="flex items-center gap-2 px-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_cyan]"></span>
                    <span className="text-xs text-cyan-200 font-mono tracking-widest">SYSTEM ONLINE</span>
                </div>
            </div>

        </div>
    )
}
