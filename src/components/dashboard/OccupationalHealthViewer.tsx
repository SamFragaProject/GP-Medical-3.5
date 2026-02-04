import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Users, Clock } from 'lucide-react'

// Zonas de riesgo ocupacional (medicina del trabajo)
interface OccupationalZone {
    id: string
    name: string
    commonInjuries: string[]
    riskLevel: 'low' | 'medium' | 'high'
    affectedWorkers: number
    avgRecoveryDays: number
    costPerIncident: number
    x: number
    y: number
}

const occupationalZones: OccupationalZone[] = [
    {
        id: 'cervical',
        name: 'Cervical / Cuello',
        commonInjuries: ['Tensión cervical', 'Latigazo cervical', 'Tortícolis'],
        riskLevel: 'medium',
        affectedWorkers: 12,
        avgRecoveryDays: 7,
        costPerIncident: 3500,
        x: 50,
        y: 12
    },
    {
        id: 'hombros',
        name: 'Hombros',
        commonInjuries: ['Tendinitis', 'Bursitis', 'Síndrome del manguito rotador'],
        riskLevel: 'high',
        affectedWorkers: 18,
        avgRecoveryDays: 21,
        costPerIncident: 8500,
        x: 30,
        y: 22
    },
    {
        id: 'espalda',
        name: 'Espalda Baja (Lumbar)',
        commonInjuries: ['Lumbalgia', 'Hernia discal', 'Contractura muscular'],
        riskLevel: 'high',
        affectedWorkers: 25,
        avgRecoveryDays: 14,
        costPerIncident: 12000,
        x: 50,
        y: 42
    },
    {
        id: 'munecas',
        name: 'Muñecas / Manos',
        commonInjuries: ['Síndrome del túnel carpiano', 'Tendinitis', 'Epicondilitis'],
        riskLevel: 'high',
        affectedWorkers: 22,
        avgRecoveryDays: 30,
        costPerIncident: 15000,
        x: 20,
        y: 50
    },
    {
        id: 'rodillas',
        name: 'Rodillas',
        commonInjuries: ['Bursitis', 'Tendinitis rotuliana', 'Desgaste de cartílago'],
        riskLevel: 'medium',
        affectedWorkers: 10,
        avgRecoveryDays: 21,
        costPerIncident: 9500,
        x: 45,
        y: 75
    }
]

interface OccupationalHealthViewerProps {
    companyId?: string
}

export function OccupationalHealthViewer({ companyId }: OccupationalHealthViewerProps) {
    const [selectedZone, setSelectedZone] = useState<string | null>(null)

    // Calcular métricas totales
    const totalAffected = occupationalZones.reduce((sum, zone) => sum + zone.affectedWorkers, 0)
    const totalCost = occupationalZones.reduce((sum, zone) => sum + (zone.affectedWorkers * zone.costPerIncident), 0)
    const avgRecovery = Math.round(
        occupationalZones.reduce((sum, zone) => sum + zone.avgRecoveryDays, 0) / occupationalZones.length
    )

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* Header con Métricas Clave */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Mapa de Riesgos Ocupacionales</h3>
                        <p className="text-sm text-gray-500">Lesiones por zona corporal - Últimos 6 meses</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            Alto
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            Medio
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            Bajo
                        </span>
                    </div>
                </div>

                {/* KPIs Rápidos */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-red-600" />
                            <span className="text-xs font-medium text-red-600">Trabajadores Afectados</span>
                        </div>
                        <p className="text-2xl font-bold text-red-700">{totalAffected}</p>
                        <p className="text-xs text-red-600">+15% vs mes anterior</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-amber-600" />
                            <span className="text-xs font-medium text-amber-600">Días Promedio Incapacidad</span>
                        </div>
                        <p className="text-2xl font-bold text-amber-700">{avgRecovery}</p>
                        <p className="text-xs text-amber-600">-2 días vs mes anterior</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                        <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-medium text-blue-600">Costo Total</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">${(totalCost / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-blue-600">MXN en tratamientos</p>
                    </div>
                </div>
            </div>

            {/* Visualización del Cuerpo */}
            <div className="relative h-[400px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                {/* SVG del Cuerpo Humano */}
                <svg viewBox="0 0 200 400" className="h-full w-auto opacity-30">
                    <path
                        d="M100,20 C120,20 130,35 130,55 C130,70 120,80 115,85 C135,90 155,110 155,150 C155,200 145,220 145,220 L150,300 L130,380 L110,380 L115,260 L100,260 L85,260 L90,380 L70,380 L50,300 L55,220 C55,220 45,200 45,150 C45,110 65,90 85,85 C80,80 70,70 70,55 C70,35 80,20 100,20 Z"
                        fill="currentColor"
                        className="text-gray-400"
                    />
                </svg>

                {/* Zonas Interactivas */}
                {occupationalZones.map((zone) => (
                    <motion.button
                        key={zone.id}
                        className="absolute w-14 h-14 -ml-7 -mt-7 rounded-full flex items-center justify-center transition-all duration-300 z-20 group"
                        style={{
                            left: `${zone.x}%`,
                            top: `${zone.y}%`,
                        }}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedZone(zone.id === selectedZone ? null : zone.id)}
                    >
                        {/* Pulse Animation */}
                        <span className={`absolute inline-flex h-full w-full rounded-full opacity-30 animate-ping ${zone.riskLevel === 'high' ? 'bg-red-500' :
                                zone.riskLevel === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}></span>

                        {/* Botón Principal */}
                        <div className={`relative inline-flex rounded-full h-12 w-12 items-center justify-center backdrop-blur-md border-2 shadow-xl ${selectedZone === zone.id
                                ? 'bg-white border-white ring-4 ring-white/30 scale-110'
                                : zone.riskLevel === 'high'
                                    ? 'bg-red-500/90 border-red-400 hover:bg-red-500'
                                    : zone.riskLevel === 'medium'
                                        ? 'bg-amber-500/90 border-amber-400 hover:bg-amber-500'
                                        : 'bg-emerald-500/90 border-emerald-400 hover:bg-emerald-500'
                            }`}>
                            <AlertTriangle className={`w-5 h-5 ${selectedZone === zone.id
                                    ? zone.riskLevel === 'high' ? 'text-red-600' : zone.riskLevel === 'medium' ? 'text-amber-600' : 'text-emerald-600'
                                    : 'text-white'
                                }`} />
                        </div>

                        {/* Badge de Conteo */}
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-lg z-30">
                            {zone.affectedWorkers}
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Panel de Detalle */}
            <AnimatePresence>
                {selectedZone && (() => {
                    const zone = occupationalZones.find(z => z.id === selectedZone)!
                    return (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">{zone.name}</h4>
                                    <p className="text-sm text-gray-600">Zona de alto riesgo ocupacional</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${zone.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                                        zone.riskLevel === 'medium' ? 'bg-amber-100 text-amber-700' :
                                            'bg-emerald-100 text-emerald-700'
                                    }`}>
                                    Riesgo {zone.riskLevel === 'high' ? 'Alto' : zone.riskLevel === 'medium' ? 'Medio' : 'Bajo'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-white rounded-lg p-3 border border-gray-100">
                                    <p className="text-xs text-gray-500 mb-1">Trabajadores Afectados</p>
                                    <p className="text-2xl font-bold text-gray-900">{zone.affectedWorkers}</p>
                                    <p className="text-xs text-gray-600">personas</p>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-gray-100">
                                    <p className="text-xs text-gray-500 mb-1">Costo Promedio</p>
                                    <p className="text-2xl font-bold text-gray-900">${(zone.costPerIncident / 1000).toFixed(1)}K</p>
                                    <p className="text-xs text-gray-600">MXN por caso</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-3 border border-gray-100 mb-4">
                                <p className="text-xs font-semibold text-gray-700 mb-2">Lesiones Comunes:</p>
                                <div className="flex flex-wrap gap-2">
                                    {zone.commonInjuries.map((injury, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                                            {injury}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button className="flex-1 bg-blue-600 text-white rounded-lg py-2 px-4 text-sm font-semibold hover:bg-blue-700 transition-colors">
                                    Ver Plan de Prevención
                                </button>
                                <button className="flex-1 bg-white text-gray-700 border border-gray-200 rounded-lg py-2 px-4 text-sm font-semibold hover:bg-gray-50 transition-colors">
                                    Generar Reporte
                                </button>
                            </div>
                        </motion.div>
                    )
                })()}
            </AnimatePresence>
        </div>
    )
}
