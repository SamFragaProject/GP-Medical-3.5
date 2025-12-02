import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Heart, Brain, Wind, Zap, AlertCircle } from 'lucide-react'

interface BodySystem {
    id: string
    name: string
    icon: React.ElementType
    x: number // Porcentaje X
    y: number // Porcentaje Y
}

const systemsConfig: BodySystem[] = [
    { id: 'neuro', name: 'Neurología', icon: Brain, x: 50, y: 15 },
    { id: 'cardio', name: 'Cardiología', icon: Heart, x: 55, y: 30 },
    { id: 'resp', name: 'Respiratorio', icon: Wind, x: 45, y: 30 },
    { id: 'digest', name: 'Digestivo', icon: Activity, x: 50, y: 45 },
    { id: 'musculo', name: 'Musculoesquelético', icon: Zap, x: 30, y: 40 },
]

interface AnatomyViewerProps {
    patientHistory?: any[] // Array de eventos médicos
    highlightedSystems?: { id: string, status: 'normal' | 'warning' | 'critical', count: number }[]
}

export function AnatomyViewer({ patientHistory = [], highlightedSystems = [] }: AnatomyViewerProps) {
    const [selectedSystem, setSelectedSystem] = useState<string | null>(null)

    // Merge config with props
    const activeSystems = systemsConfig.map(sys => {
        const highlight = highlightedSystems.find(h => h.id === sys.id)
        return {
            ...sys,
            status: highlight?.status || 'normal',
            count: highlight?.count || 0
        }
    })

    return (
        <div className="relative h-[500px] w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col items-center justify-center p-4">

            <div className="absolute top-6 left-6 z-10">
                <h3 className="text-lg font-bold text-gray-900">Mapa de Salud</h3>
                <p className="text-xs text-gray-500">Historial Clínico Visual</p>
            </div>

            {/* Silueta Humana Estilizada (SVG) */}
            <div className="relative h-full w-full max-w-xs flex items-center justify-center">
                <svg viewBox="0 0 200 400" className="h-full w-auto opacity-20 drop-shadow-sm">
                    <path
                        d="M100,20 C120,20 130,35 130,55 C130,70 120,80 115,85 C135,90 155,110 155,150 C155,200 145,220 145,220 L150,300 L130,380 L110,380 L115,260 L100,260 L85,260 L90,380 L70,380 L50,300 L55,220 C55,220 45,200 45,150 C45,110 65,90 85,85 C80,80 70,70 70,55 C70,35 80,20 100,20 Z"
                        fill="currentColor"
                        className="text-blue-900"
                    />
                </svg>

                {/* Hotspots Interactivos */}
                {activeSystems.map((sys) => (
                    <motion.button
                        key={sys.id}
                        className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full flex items-center justify-center transition-all duration-300 z-20 group"
                        style={{
                            left: `${sys.x}%`,
                            top: `${sys.y}%`,
                        }}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => setSelectedSystem(sys.id === selectedSystem ? null : sys.id)}
                    >
                        {/* Pulse Effect */}
                        <span className={`absolute inline-flex h-full w-full rounded-full opacity-20 animate-ping ${sys.status === 'critical' ? 'bg-red-400' : sys.status === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>

                        {/* Glass Button */}
                        <div className={`relative inline-flex rounded-full h-10 w-10 items-center justify-center backdrop-blur-md border shadow-lg ${selectedSystem === sys.id
                                ? 'bg-white border-white ring-4 ring-white/20'
                                : 'bg-white/60 border-white/40 hover:bg-white/80'
                            }`}>
                            <sys.icon
                                className={`w-5 h-5 ${sys.status === 'critical' ? 'text-red-500' : sys.status === 'warning' ? 'text-amber-500' : 'text-emerald-500'
                                    }`}
                            />
                        </div>

                        {/* Badge de conteo si hay alertas */}
                        {sys.count > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm z-30">
                                {sys.count}
                            </div>
                        )}
                    </motion.button>
                ))}
            </div>

            {/* Panel de Detalle Flotante */}
            <AnimatePresence>
                {selectedSystem && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-gray-100 z-30"
                    >
                        {(() => {
                            const sys = activeSystems.find(s => s.id === selectedSystem)!
                            return (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg ${sys.status === 'critical' ? 'bg-red-100' : sys.status === 'warning' ? 'bg-amber-100' : 'bg-emerald-100'
                                            }`}>
                                            <sys.icon className={`w-5 h-5 ${sys.status === 'critical' ? 'text-red-600' : sys.status === 'warning' ? 'text-amber-600' : 'text-emerald-600'
                                                }`} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900">{sys.name}</h4>
                                            <p className="text-xs text-gray-500">
                                                {sys.status === 'normal' ? 'Sin hallazgos recientes' : `${sys.count} registros en historial`}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="text-xs font-bold text-blue-600 hover:underline">
                                        Ver Detalles
                                    </button>
                                </div>
                            )
                        })()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
