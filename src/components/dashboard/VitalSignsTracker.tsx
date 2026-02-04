// @ts-nocheck
import React from 'react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Heart, Activity, Thermometer, Wind, TrendingUp, TrendingDown } from 'lucide-react'

// Datos de ejemplo (últimos 7 días)
const vitalSignsData = [
    { date: 'Lun', presion_sistolica: 120, presion_diastolica: 80, frecuencia_cardiaca: 72, temperatura: 36.5, saturacion_o2: 98 },
    { date: 'Mar', presion_sistolica: 118, presion_diastolica: 78, frecuencia_cardiaca: 70, temperatura: 36.6, saturacion_o2: 98 },
    { date: 'Mié', presion_sistolica: 122, presion_diastolica: 82, frecuencia_cardiaca: 75, temperatura: 36.7, saturacion_o2: 97 },
    { date: 'Jue', presion_sistolica: 125, presion_diastolica: 85, frecuencia_cardiaca: 78, temperatura: 36.8, saturacion_o2: 97 },
    { date: 'Vie', presion_sistolica: 119, presion_diastolica: 79, frecuencia_cardiaca: 71, temperatura: 36.5, saturacion_o2: 98 },
    { date: 'Sáb', presion_sistolica: 121, presion_diastolica: 81, frecuencia_cardiaca: 73, temperatura: 36.6, saturacion_o2: 98 },
    { date: 'Hoy', presion_sistolica: 120, presion_diastolica: 80, frecuencia_cardiaca: 72, temperatura: 36.5, saturacion_o2: 99 },
]

interface VitalSign {
    id: string
    name: string
    value: number
    unit: string
    icon: React.ElementType
    status: 'normal' | 'warning' | 'critical'
    range: string
    trend: 'up' | 'down' | 'stable'
    trendValue: number
}

const currentVitals: VitalSign[] = [
    {
        id: 'bp',
        name: 'Presión Arterial',
        value: 120,
        unit: '/80 mmHg',
        icon: Activity,
        status: 'normal',
        range: '90-120 / 60-80',
        trend: 'stable',
        trendValue: 0
    },
    {
        id: 'hr',
        name: 'Frecuencia Cardíaca',
        value: 72,
        unit: 'bpm',
        icon: Heart,
        status: 'normal',
        range: '60-100 bpm',
        trend: 'down',
        trendValue: -3
    },
    {
        id: 'temp',
        name: 'Temperatura',
        value: 36.5,
        unit: '°C',
        icon: Thermometer,
        status: 'normal',
        range: '36.1-37.2 °C',
        trend: 'stable',
        trendValue: 0
    },
    {
        id: 'spo2',
        name: 'Saturación O₂',
        value: 99,
        unit: '%',
        icon: Wind,
        status: 'normal',
        range: '95-100%',
        trend: 'up',
        trendValue: +1
    },
]

export function VitalSignsTracker() {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Signos Vitales</h3>
                <p className="text-sm text-gray-500">Monitoreo continuo - Últimos 7 días</p>
            </div>

            {/* Grid de Signos Vitales Actuales */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {currentVitals.map((vital) => (
                    <div
                        key={vital.id}
                        className={`relative overflow-hidden rounded-xl p-4 border-2 transition-all hover:shadow-md ${vital.status === 'normal'
                            ? 'bg-emerald-50 border-emerald-200'
                            : vital.status === 'warning'
                                ? 'bg-amber-50 border-amber-200'
                                : 'bg-red-50 border-red-200'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className={`p-2 rounded-lg ${vital.status === 'normal'
                                ? 'bg-emerald-100'
                                : vital.status === 'warning'
                                    ? 'bg-amber-100'
                                    : 'bg-red-100'
                                }`}>
                                <vital.icon className={`w-5 h-5 ${vital.status === 'normal'
                                    ? 'text-emerald-600'
                                    : vital.status === 'warning'
                                        ? 'text-amber-600'
                                        : 'text-red-600'
                                    }`} />
                            </div>
                            {vital.trend !== 'stable' && (
                                <div className={`flex items-center gap-1 text-xs font-semibold ${vital.trend === 'up' ? 'text-emerald-600' : 'text-blue-600'
                                    }`}>
                                    {vital.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {Math.abs(vital.trendValue)}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">{vital.name}</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {vital.value}<span className="text-sm font-normal text-gray-600">{vital.unit}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Rango: {vital.range}</p>
                    </div>
                ))}
            </div>

            {/* Gráfico de Tendencia de Presión Arterial */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Tendencia de Presión Arterial</h4>
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={vitalSignsData}>
                        <defs>
                            <linearGradient id="colorSistolica" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorDiastolica" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        {/* @ts-ignore */}
                        <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        {/* @ts-ignore */}
                        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} domain={[60, 140]} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Area
                            type="monotone"
                            dataKey="presion_sistolica"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorSistolica)"
                            name="Sistólica"
                        />
                        <Area
                            type="monotone"
                            dataKey="presion_diastolica"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorDiastolica)"
                            name="Diastólica"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Gráfico de Frecuencia Cardíaca */}
            <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Frecuencia Cardíaca y Saturación O₂</h4>
                <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={vitalSignsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        {/* @ts-ignore */}
                        <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        {/* @ts-ignore */}
                        <YAxis yAxisId="left" stroke="#9ca3af" style={{ fontSize: '12px' }} domain={[60, 100]} />
                        {/* @ts-ignore */}
                        <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" style={{ fontSize: '12px' }} domain={[95, 100]} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        {/* @ts-ignore */}
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="frecuencia_cardiaca"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={{ fill: '#ef4444', r: 4 }}
                            name="FC (bpm)"
                        />
                        {/* @ts-ignore */}
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="saturacion_o2"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ fill: '#10b981', r: 4 }}
                            name="SpO₂ (%)"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Alertas y Recomendaciones */}
            <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h5 className="text-sm font-semibold text-blue-900 mb-1">Recomendación del Sistema</h5>
                        <p className="text-sm text-blue-700">
                            Todos los signos vitales están dentro del rango normal. Se recomienda continuar con el monitoreo regular y mantener hábitos saludables.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
