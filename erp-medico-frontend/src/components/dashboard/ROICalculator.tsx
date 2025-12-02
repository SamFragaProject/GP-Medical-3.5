import React, { useState } from 'react'
import { DollarSign, TrendingDown, Users, Clock, AlertTriangle, CheckCircle, BarChart3, PieChart } from 'lucide-react'
import { BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// Datos de costos evitados (medicina preventiva vs reactiva)
const costComparisonData = [
    { month: 'Ene', sin_programa: 45000, con_programa: 12000 },
    { month: 'Feb', sin_programa: 52000, con_programa: 15000 },
    { month: 'Mar', sin_programa: 48000, con_programa: 11000 },
    { month: 'Abr', sin_programa: 55000, con_programa: 14000 },
    { month: 'May', sin_programa: 50000, con_programa: 13000 },
    { month: 'Jun', sin_programa: 47000, con_programa: 12000 },
]

// Distribución de costos
const costBreakdownData = [
    { name: 'Incapacidades', value: 45000, color: '#ef4444' },
    { name: 'Tratamientos', value: 28000, color: '#f59e0b' },
    { name: 'Reemplazos Temporales', value: 18000, color: '#3b82f6' },
    { name: 'Pérdida Productividad', value: 32000, color: '#8b5cf6' },
]

interface ROIMetric {
    id: string
    title: string
    value: number
    unit: string
    trend: number
    icon: React.ElementType
    color: string
    description: string
}

const roiMetrics: ROIMetric[] = [
    {
        id: 'savings',
        title: 'Ahorro Total',
        value: 234000,
        unit: 'MXN',
        trend: +32,
        icon: DollarSign,
        color: 'emerald',
        description: 'Ahorrado en los últimos 6 meses vs sin programa'
    },
    {
        id: 'absenteeism',
        title: 'Reducción Ausentismo',
        value: 42,
        unit: '%',
        trend: +15,
        icon: TrendingDown,
        color: 'blue',
        description: 'Menos días de incapacidad vs año anterior'
    },
    {
        id: 'employees',
        title: 'Empleados Saludables',
        value: 87,
        unit: '%',
        trend: +8,
        icon: Users,
        color: 'purple',
        description: 'Sin incidentes en los últimos 3 meses'
    },
    {
        id: 'response',
        title: 'Tiempo de Respuesta',
        value: 24,
        unit: 'hrs',
        trend: -35,
        icon: Clock,
        color: 'amber',
        description: 'Promedio para atención médica'
    },
]

export function ROICalculator() {
    const [selectedPeriod, setSelectedPeriod] = useState<'3m' | '6m' | '12m'>('6m')

    // Calcular ROI total
    const totalInvestment = 50000 // Costo del programa
    const totalSavings = costComparisonData.reduce((sum, month) =>
        sum + (month.sin_programa - month.con_programa), 0
    )
    const roi = ((totalSavings - totalInvestment) / totalInvestment * 100).toFixed(1)

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Retorno de Inversión (ROI)</h3>
                    <p className="text-sm text-gray-500">Impacto económico del programa de salud ocupacional</p>
                </div>
                <div className="flex gap-2">
                    {(['3m', '6m', '12m'] as const).map((period) => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${selectedPeriod === period
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {period === '3m' ? '3 meses' : period === '6m' ? '6 meses' : '1 año'}
                        </button>
                    ))}
                </div>
            </div>

            {/* ROI Destacado */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-5 h-5" />
                        <span className="text-sm font-medium opacity-90">ROI del Programa</span>
                    </div>
                    <p className="text-5xl font-bold mb-2">+{roi}%</p>
                    <p className="text-sm opacity-90">
                        Por cada $1 invertido, se ahorran ${(parseFloat(roi) / 100 + 1).toFixed(2)}
                    </p>
                    <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs opacity-75 mb-1">Inversión</p>
                            <p className="text-lg font-bold">${(totalInvestment / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                            <p className="text-xs opacity-75 mb-1">Ahorro</p>
                            <p className="text-lg font-bold">${(totalSavings / 1000).toFixed(0)}K</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Métricas Clave */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {roiMetrics.map((metric) => (
                    <div
                        key={metric.id}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow"
                    >
                        <div className={`w-10 h-10 rounded-lg bg-${metric.color}-100 flex items-center justify-center mb-3`}>
                            <metric.icon className={`w-5 h-5 text-${metric.color}-600`} />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">{metric.title}</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {metric.unit === 'MXN' && '$'}
                            {metric.value.toLocaleString()}
                            {metric.unit !== 'MXN' && <span className="text-sm font-normal text-gray-600"> {metric.unit}</span>}
                        </p>
                        <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${metric.trend > 0 ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                            {metric.trend > 0 ? '↑' : '↓'} {Math.abs(metric.trend)}%
                            <span className="text-gray-500 font-normal">vs anterior</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Gráfico de Comparación de Costos */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Comparación de Costos Mensuales</h4>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={costComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}
                            formatter={(value: number) => `$${value.toLocaleString()}`}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="sin_programa" fill="#ef4444" name="Sin Programa" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="con_programa" fill="#10b981" name="Con Programa" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Distribución de Costos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Distribución de Costos Evitados</h4>
                    <ResponsiveContainer width="100%" height={200}>
                        <RePieChart>
                            <Pie
                                data={costBreakdownData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {costBreakdownData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                        </RePieChart>
                    </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Beneficios Clave</h4>
                    {[
                        { icon: CheckCircle, text: 'Reducción de 42% en días de incapacidad', color: 'emerald' },
                        { icon: CheckCircle, text: 'Aumento de 28% en productividad', color: 'blue' },
                        { icon: CheckCircle, text: 'Mejora de 35% en satisfacción laboral', color: 'purple' },
                        { icon: AlertTriangle, text: 'Disminución de 65% en accidentes laborales', color: 'amber' },
                    ].map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                            <benefit.icon className={`w-5 h-5 text-${benefit.color}-600 flex-shrink-0 mt-0.5`} />
                            <p className="text-sm text-gray-700">{benefit.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Call to Action */}
            <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h5 className="text-sm font-semibold text-blue-900 mb-1">¿Quieres ver el reporte completo?</h5>
                        <p className="text-sm text-blue-700">Descarga el análisis detallado de ROI en PDF</p>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                        Descargar Reporte
                    </button>
                </div>
            </div>
        </div>
    )
}
