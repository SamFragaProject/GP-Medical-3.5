import React from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3,
    TrendingUp,
    FileText,
    Shield,
    Zap,
    Layers,
    Target,
    Database,
    Activity,
    Clock,
    Award,
    ArrowRight,
    Loader2
} from 'lucide-react'
import { dataService } from '@/services/dataService'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ReportsDashboardProps {
    onNavigate: (view: string) => void
}

export function ReportsDashboard({ onNavigate }: ReportsDashboardProps) {
    const [stats, setStats] = React.useState({
        totalReportes: 0,
        cumplimiento: 0,
        predicciones: 0,
        loading: true
    })

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                // Simulamos la obtención de KPIs reales desde el servicio
                const [certs, dashboardStats] = await Promise.all([
                    dataService.certificaciones.getAll(),
                    dataService.stats.getDashboardStats()
                ])

                setStats({
                    totalReportes: certs.length,
                    cumplimiento: 98.5, // Placeholder por ahora para este KPI específico
                    predicciones: dashboardStats.examenesPendientes,
                    loading: false
                })
            } catch (err) {
                console.error("Error fetching report stats:", err)
                setStats(s => ({ ...s, loading: false }))
            }
        }
        fetchStats()
    }, [])
    const categories = [
        {
            id: 'predictivos',
            title: 'Analytics Predictivos',
            description: 'Predicción de riesgos y tendencias futuras con IA',
            icon: Zap,
            color: 'text-purple-600',
            bg: 'bg-purple-100',
            gradient: 'from-purple-500 to-indigo-600'
        },
        {
            id: 'compliance',
            title: 'Compliance & Normativa',
            description: 'Seguimiento de cumplimiento NOM-035 y estándares',
            icon: Shield,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
            gradient: 'from-emerald-500 to-teal-600'
        },
        {
            id: 'tendencias',
            title: 'Análisis de Tendencias',
            description: 'Evolución histórica de indicadores clave',
            icon: TrendingUp,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
            gradient: 'from-blue-500 to-cyan-600'
        },
        {
            id: 'roi',
            title: 'ROI & Costos',
            description: 'Análisis financiero y retorno de inversión',
            icon: Award,
            color: 'text-amber-600',
            bg: 'bg-amber-100',
            gradient: 'from-amber-500 to-orange-600'
        }
    ]

    const data = [
        { name: 'Ene', value: 400 },
        { name: 'Feb', value: 300 },
        { name: 'Mar', value: 600 },
        { name: 'Abr', value: 800 },
        { name: 'May', value: 500 },
        { name: 'Jun', value: 900 },
    ]

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-xl">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl"></div>

                <div className="relative z-10 grid gap-8 md:grid-cols-2 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-4">Centro de Inteligencia Médica</h2>
                        <p className="text-slate-300 mb-6 text-lg">
                            Visualiza, analiza y predice el estado de salud de tu organización con nuestra suite de analítica avanzada.
                        </p>
                        <div className="flex gap-4">
                            <Button
                                onClick={() => onNavigate('generador')}
                                className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-500/30"
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                Nuevo Reporte
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => onNavigate('programados')}
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                                <Clock className="mr-2 h-4 w-4" />
                                Programados
                            </Button>
                        </div>
                    </div>

                    <div className="h-[200px] w-full bg-white/5 rounded-xl border border-white/10 p-4 backdrop-blur-sm">
                        <h4 className="text-sm font-medium text-slate-400 mb-4">Resumen de Actividad Global</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {categories.map((category, index) => (
                    <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        onClick={() => onNavigate(category.id)}
                        className="cursor-pointer group"
                    >
                        <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative">
                            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${category.gradient}`} />
                            <CardHeader>
                                <div className={`w-12 h-12 rounded-xl ${category.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    <category.icon className={`h-6 w-6 ${category.color}`} />
                                </div>
                                <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {category.title}
                                </CardTitle>
                                <CardDescription className="text-sm text-gray-500">
                                    {category.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                                    Explorar <ArrowRight className="ml-1 h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Quick Stats Row */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-none shadow-md bg-gradient-to-br from-emerald-50 to-white">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
                            <Shield className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Cumplimiento Global</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.loading ? '...' : `${stats.cumplimiento}%`}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-white">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                            <Activity className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Reportes Generados</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.loading ? '...' : stats.totalReportes}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-white">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                            <Zap className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Exámenes Pendientes</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.loading ? '...' : stats.predicciones}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
