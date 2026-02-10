import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Activity,
    AlertTriangle,
    Users,
    TrendingUp,
    Map,
    Brain,
    Download,
    Filter,
    RefreshCw,
    Search,
    Zap,
    ShieldCheck,
    Calendar,
    Layers,
    BarChart3,
    PieChart as PieChartIcon,
    ChevronRight,
    Plus
} from 'lucide-react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from 'recharts'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'
import { PremiumMetricCard } from '@/components/ui/PremiumMetricCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { epidemiologiaService, EpidemiologiaData } from '@/services/epidemiologiaService'
import { SistemaAlertasIA } from '@/components/ia/SistemaAlertasIA'
import { MapaCalorRiesgo } from '@/components/MapaCalorRiesgo'
import { DataContainer } from '@/components/ui/DataContainer'
import toast from 'react-hot-toast'

export function VigilanciaEpidemiologica() {
    const [data, setData] = useState<EpidemiologiaData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeView, setActiveView] = useState<'overview' | 'alerts' | 'map' | 'reports'>('overview')
    const [empresaId] = useState('demo-empresa') // En prod vendría del contexto

    useEffect(() => {
        fetchData()
    }, [empresaId])

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await epidemiologiaService.getResumenEmpresarial(empresaId)
            setData(res)
        } catch (err: any) {
            setError(err.message)
            toast.error('Error al cargar datos epidemiológicos')
        } finally {
            setLoading(false)
        }
    }

    const handleAnalisisIA = async () => {
        toast.promise(
            epidemiologiaService.ejecutarAnalisisIA(empresaId),
            {
                loading: 'Iniciando Motor Predictivo CUDA...',
                success: 'Análisis IA completado exitosamente',
                error: 'Servicio de IA local no disponible'
            }
        )
    }

    const COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b']

    return (
        <div className="space-y-6">
            <PremiumPageHeader
                title="Intelligence Bureau: Vigilancia Epidemiológica"
                subtitle="Monitoreo poblacional proactivo y análisis predictivo de riesgos a la salud."
                icon={Brain}
                badge="AI-POWERED V4.0"
                actions={
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className="h-11 px-6 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20 font-black text-[10px] uppercase tracking-widest"
                            onClick={() => toast.success('Exportando Reporte de Inteligencia...')}
                        >
                            <Download className="w-4 h-4 mr-2" /> PDF BI
                        </Button>
                        <Button
                            variant="premium"
                            onClick={handleAnalisisIA}
                            className="h-11 px-8 shadow-xl shadow-emerald-500/20 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-widest"
                        >
                            <Zap className="w-4 h-4 mr-2" /> Ejecutar Predictivo IA
                        </Button>
                    </div>
                }
            />

            <DataContainer loading={loading} error={error} data={data} onRetry={fetchData}>
                {data && (
                    <div className="space-y-6">
                        {/* Stats Dashboard */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <PremiumMetricCard
                                title="Población Bajo Vigilancia"
                                value={data.total_empleados}
                                subtitle="Colaboradores Activos"
                                icon={Users}
                                gradient="blue"
                            />
                            <PremiumMetricCard
                                title="Casos Activos"
                                value={data.casos_activos}
                                subtitle="Seguimiento Clínico"
                                icon={Activity}
                                gradient="amber"
                                trend={{ value: 12, isPositive: false }}
                            />
                            <PremiumMetricCard
                                title="Absentismo Médico"
                                value={`${data.incapacidades_dias}d`}
                                subtitle="Días Perdidos (Mes)"
                                icon={TrendingUp}
                                gradient="rose"
                            />
                            <PremiumMetricCard
                                title="Health Risk Score"
                                value={data.riesgo_promedio}
                                subtitle="Índice Predictivo Global"
                                icon={Brain}
                                gradient="emerald"
                                trend={{ value: 5, isPositive: true }}
                            />
                        </div>

                        <Tabs defaultValue="overview" className="w-full" onValueChange={(v) => setActiveView(v as any)}>
                            <div className="flex items-center justify-between mb-4 border-b border-slate-200">
                                <TabsList className="bg-transparent h-12 border-none">
                                    <TabsTrigger value="overview" className="data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 border-b-2 border-transparent rounded-none px-6">Vista General</TabsTrigger>
                                    <TabsTrigger value="alerts" className="data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 border-b-2 border-transparent rounded-none px-6">Alertas Predictivas</TabsTrigger>
                                    <TabsTrigger value="map" className="data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 border-b-2 border-transparent rounded-none px-6">Hotspots de Riesgo</TabsTrigger>
                                </TabsList>
                                <div className="flex items-center gap-2 pb-2">
                                    <Badge variant="outline" className="text-slate-400 font-medium">Última actualización: hace 5 min</Badge>
                                    <Button variant="ghost" size="icon" onClick={fetchData} className="text-slate-400">
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <TabsContent value="overview">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Gráfico de Tendencias */}
                                    <Card className="lg:col-span-2 shadow-sm border-slate-200 overflow-hidden">
                                        <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
                                            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center">
                                                <TrendingUp className="w-4 h-4 mr-2" /> Histórico de Bienestar
                                            </CardTitle>
                                            <select className="text-[10px] font-bold uppercase tracking-widest border-none bg-slate-50 rounded px-2 py-1 outline-none">
                                                <option>Últimos 6 Meses</option>
                                                <option>Año Actual</option>
                                            </select>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <div className="h-[300px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={data.tendencia_mensual}>
                                                        <defs>
                                                            <linearGradient id="colorConsultas" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                        <Tooltip
                                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                        />
                                                        <Area type="monotone" dataKey="consultas" stroke="#10b981" fillOpacity={1} fill="url(#colorConsultas)" strokeWidth={3} />
                                                        <Area type="monotone" dataKey="incapacidades" stroke="#f43f5e" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Distribución por Áreas */}
                                    <Card className="shadow-sm border-slate-200 overflow-hidden">
                                        <CardHeader className="border-b border-slate-100">
                                            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center">
                                                <Map className="w-4 h-4 mr-2" /> Concentración de Riesgo
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <div className="h-[250px] w-full flex items-center justify-center">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={data.distribucion_area}
                                                            innerRadius={60}
                                                            outerRadius={80}
                                                            paddingAngle={5}
                                                            dataKey="casos"
                                                        >
                                                            {data.distribucion_area.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="mt-4 space-y-2">
                                                {data.distribucion_area.map((area, idx) => (
                                                    <div key={idx} className="flex items-center justify-between text-xs px-2">
                                                        <div className="flex items-center">
                                                            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                                            <span className="font-medium text-slate-600">{area.area}</span>
                                                        </div>
                                                        <span className="font-bold text-slate-900">{area.casos}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Alertas Detectadas por IA */}
                                    <Card className="lg:col-span-3 shadow-sm border-slate-200 overflow-hidden">
                                        <CardHeader className="bg-slate-950 text-white flex flex-row items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center mr-3 shadow-lg shadow-emerald-500/20">
                                                    <Brain className="w-4 h-4 text-slate-950" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-sm font-black uppercase tracking-widest italic">Análisis Predictivo Local (CUDA)</CardTitle>
                                                    <p className="text-[10px] text-emerald-400 font-bold tracking-tight">MOTOR DE INTELIGENCIA ACTIVO</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-widest">
                                                Configurar Modelos <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="divide-y divide-slate-100">
                                                {data.alertas_ia.map((alerta, idx) => (
                                                    <div key={idx} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                                                        <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                                                            <AlertTriangle className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-slate-900">{alerta}</p>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo: Tendencia Anómala</span>
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Confianza: 94.2%</span>
                                                            </div>
                                                        </div>
                                                        <Button size="sm" variant="ghost" className="text-emerald-600 font-bold text-xs">Atender</Button>
                                                    </div>
                                                ))}
                                                {data.alertas_ia.length === 0 && (
                                                    <div className="p-12 text-center">
                                                        <ShieldCheck className="w-12 h-12 text-emerald-100 mx-auto mb-3" />
                                                        <p className="text-slate-400 text-sm font-medium">No se detectan desviaciones críticas en la población.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="alerts">
                                <SistemaAlertasIA empresaId={empresaId} />
                            </TabsContent>

                            <TabsContent value="map">
                                <Card className="border-slate-200">
                                    <CardContent className="p-6">
                                        <MapaCalorRiesgo evaluacionId="global-vigilancia" />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </DataContainer>
        </div>
    )
}
