/**
 * Gestión de Riesgos de Trabajo e Incapacidades (ST-7 / ST-9)
 * 
 * Módulo para el registro y seguimiento de accidentes laborales
 * y gestión de incapacidades según normativa IMSS.
 */
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    AlertTriangle,
    FileCheck,
    Calendar,
    Clock,
    User,
    Search,
    Plus,
    Filter,
    Download,
    Eye,
    TrendingUp,
    Activity,
    Building2,
    ChevronRight,
    Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { FormatoST7 } from '@/components/medicina/FormatoST7'
import { FormatoST9 } from '@/components/medicina/FormatoST9'
import { riesgosTrabajoService, incapacidadesService } from '@/services/riesgosTrabajoService'
import { useAuth } from '@/contexts/AuthContext'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'
import toast from 'react-hot-toast'

export default function RiesgosTrabajo() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('riesgos')
    const [searchQuery, setSearchQuery] = useState('')

    const [riesgos, setRiesgos] = useState<any[]>([])
    const [incapacidades, setIncapacidades] = useState<any[]>([])
    const [estadisticas, setEstadisticas] = useState({
        riesgosAbiertos: 0,
        incapacidadesVigentes: 0,
        diasTotales: 0,
        proximasAVencer: 0
    })

    // Modals
    const [isNewST7Open, setIsNewST7Open] = useState(false)
    const [isNewST9Open, setIsNewST9Open] = useState(false)
    const [selectedRiesgo, setSelectedRiesgo] = useState<any>(null)
    const [selectedPaciente, setSelectedPaciente] = useState<any>(null)

    const fetchData = async () => {
        setLoading(true)
        try {
            const [riesgosData, incapacidadesData, stats] = await Promise.all([
                riesgosTrabajoService.getAll(),
                incapacidadesService.getAll(),
                incapacidadesService.getEstadisticas()
            ])

            setRiesgos(riesgosData)
            setIncapacidades(incapacidadesData)
            setEstadisticas({
                riesgosAbiertos: riesgosData.filter((r: any) => r.estado === 'abierto').length,
                incapacidadesVigentes: stats.vigentes,
                diasTotales: stats.diasTotales,
                proximasAVencer: stats.proximasAVencer
            })
        } catch (error) {
            console.error('Error fetching data:', error)
            toast.error('Error al cargar datos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleSaveST7 = async (data: any) => {
        try {
            await riesgosTrabajoService.create(data)
            toast.success('Riesgo de trabajo registrado')
            setIsNewST7Open(false)
            fetchData()
        } catch (error) {
            toast.error('Error al guardar')
        }
    }

    const handleSaveST9 = async (data: any) => {
        try {
            await incapacidadesService.create(data)
            toast.success('Incapacidad registrada')
            setIsNewST9Open(false)
            fetchData()
        } catch (error) {
            toast.error('Error al guardar')
        }
    }

    const filteredRiesgos = riesgos.filter(r => {
        if (!searchQuery) return true
        const paciente = r.paciente
        const search = searchQuery.toLowerCase()
        return (
            paciente?.nombre?.toLowerCase().includes(search) ||
            paciente?.apellido_paterno?.toLowerCase().includes(search) ||
            r.folio?.toLowerCase().includes(search) ||
            r.tipo_riesgo?.toLowerCase().includes(search)
        )
    })

    const filteredIncapacidades = incapacidades.filter(i => {
        if (!searchQuery) return true
        const paciente = i.paciente
        const search = searchQuery.toLowerCase()
        return (
            paciente?.nombre?.toLowerCase().includes(search) ||
            paciente?.apellido_paterno?.toLowerCase().includes(search) ||
            i.folio_incapacidad?.toLowerCase().includes(search)
        )
    })

    const getTipoRiesgoBadge = (tipo: string) => {
        const configs: Record<string, { label: string; color: string }> = {
            accidente_trabajo: { label: 'Accidente Trabajo', color: 'bg-amber-100 text-amber-700' },
            accidente_trayecto: { label: 'Accidente Trayecto', color: 'bg-blue-100 text-blue-700' },
            enfermedad_trabajo: { label: 'Enfermedad Trabajo', color: 'bg-purple-100 text-purple-700' }
        }
        return configs[tipo] || { label: tipo, color: 'bg-slate-100 text-slate-700' }
    }

    const getEstadoBadge = (estado: string) => {
        const configs: Record<string, { label: string; color: string }> = {
            abierto: { label: 'Abierto', color: 'bg-amber-100 text-amber-700' },
            en_seguimiento: { label: 'En Seguimiento', color: 'bg-blue-100 text-blue-700' },
            cerrado: { label: 'Cerrado', color: 'bg-emerald-100 text-emerald-700' },
            vigente: { label: 'Vigente', color: 'bg-blue-100 text-blue-700' },
            alta: { label: 'Alta', color: 'bg-emerald-100 text-emerald-700' },
            prorrogada: { label: 'Prorrogada', color: 'bg-purple-100 text-purple-700' }
        }
        return configs[estado] || { label: estado, color: 'bg-slate-100 text-slate-700' }
    }

    return (
        <>
            <PremiumPageHeader
                title="Riesgos de Trabajo"
                subtitle="Gestión de accidentes laborales, ST-7 e incapacidades ST-9"
                icon={AlertTriangle}
                badge="Sintonía IMSS Activa"
                actions={
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsNewST9Open(true)}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl"
                        >
                            Nueva Incapacidad
                        </Button>
                        <Button
                            onClick={() => setIsNewST7Open(true)}
                            className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl"
                        >
                            Nuevo Riesgo
                        </Button>
                    </div>
                }
            />

            <div className="space-y-6 pb-12">

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Casos Abiertos', value: estadisticas.riesgosAbiertos, icon: AlertTriangle, color: 'from-amber-500 to-orange-500' },
                        { label: 'Incap. Vigentes', value: estadisticas.incapacidadesVigentes, icon: FileCheck, color: 'from-blue-500 to-indigo-500' },
                        { label: 'Días Acumulados', value: estadisticas.diasTotales, icon: Calendar, color: 'from-purple-500 to-violet-500' },
                        { label: 'Próximas a Vencer', value: estadisticas.proximasAVencer, icon: Clock, color: 'from-rose-500 to-red-500' }
                    ].map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className={`border-0 bg-gradient-to-br ${stat.color} text-white shadow-lg overflow-hidden`}>
                                <CardContent className="p-4 flex items-center gap-3 relative">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                    <stat.icon className="w-8 h-8 opacity-80" />
                                    <div>
                                        <p className="text-2xl font-black">{stat.value}</p>
                                        <p className="text-xs opacity-80">{stat.label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl">
                            <TabsTrigger value="riesgos" className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Riesgos de Trabajo
                            </TabsTrigger>
                            <TabsTrigger value="incapacidades" className="rounded-lg data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
                                <FileCheck className="w-4 h-4 mr-2" />
                                Incapacidades
                            </TabsTrigger>
                        </TabsList>
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Buscar por nombre, folio..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white border-slate-200"
                            />
                        </div>
                    </div>

                    {/* Tab: Riesgos de Trabajo */}
                    <TabsContent value="riesgos" className="mt-0">
                        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="p-12 text-center">
                                        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-4" />
                                        <p className="text-slate-500">Cargando riesgos de trabajo...</p>
                                    </div>
                                ) : filteredRiesgos.length > 0 ? (
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="text-left p-4 text-sm font-semibold text-slate-600">Folio / Paciente</th>
                                                <th className="text-left p-4 text-sm font-semibold text-slate-600">Tipo</th>
                                                <th className="text-left p-4 text-sm font-semibold text-slate-600">Fecha</th>
                                                <th className="text-left p-4 text-sm font-semibold text-slate-600">Diagnóstico</th>
                                                <th className="text-left p-4 text-sm font-semibold text-slate-600">Estado</th>
                                                <th className="text-right p-4 text-sm font-semibold text-slate-600">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredRiesgos.map(riesgo => {
                                                const tipoBadge = getTipoRiesgoBadge(riesgo.tipo_riesgo)
                                                const estadoBadge = getEstadoBadge(riesgo.estado)
                                                return (
                                                    <tr key={riesgo.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="p-4">
                                                            <p className="font-mono text-xs text-amber-600 font-bold">{riesgo.folio}</p>
                                                            <p className="font-bold text-slate-900">
                                                                {riesgo.paciente?.nombre} {riesgo.paciente?.apellido_paterno}
                                                            </p>
                                                            <p className="text-xs text-slate-400">NSS: {riesgo.paciente?.nss || 'N/A'}</p>
                                                        </td>
                                                        <td className="p-4">
                                                            <Badge className={`${tipoBadge.color} border-none`}>{tipoBadge.label}</Badge>
                                                        </td>
                                                        <td className="p-4 text-sm text-slate-600">
                                                            {new Date(riesgo.fecha_ocurrencia).toLocaleDateString('es-MX')}
                                                        </td>
                                                        <td className="p-4">
                                                            <p className="text-sm text-slate-700 line-clamp-2">{riesgo.diagnostico_inicial || 'Sin diagnóstico'}</p>
                                                        </td>
                                                        <td className="p-4">
                                                            <Badge className={`${estadoBadge.color} border-none`}>{estadoBadge.label}</Badge>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                                                                    <Eye className="w-4 h-4 text-slate-500" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedRiesgo(riesgo)
                                                                        setSelectedPaciente(riesgo.paciente)
                                                                        setIsNewST9Open(true)
                                                                    }}
                                                                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                                                >
                                                                    + ST-9
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-12 text-center text-slate-400">
                                        <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p>No hay riesgos de trabajo registrados</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab: Incapacidades */}
                    <TabsContent value="incapacidades" className="mt-0">
                        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="p-12 text-center">
                                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
                                        <p className="text-slate-500">Cargando incapacidades...</p>
                                    </div>
                                ) : filteredIncapacidades.length > 0 ? (
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="text-left p-4 text-sm font-semibold text-slate-600">Folio / Paciente</th>
                                                <th className="text-left p-4 text-sm font-semibold text-slate-600">Tipo</th>
                                                <th className="text-left p-4 text-sm font-semibold text-slate-600">Período</th>
                                                <th className="text-left p-4 text-sm font-semibold text-slate-600">Días</th>
                                                <th className="text-left p-4 text-sm font-semibold text-slate-600">Estado</th>
                                                <th className="text-right p-4 text-sm font-semibold text-slate-600">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredIncapacidades.map(incap => {
                                                const estadoBadge = getEstadoBadge(incap.estado)
                                                return (
                                                    <tr key={incap.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="p-4">
                                                            <p className="font-mono text-xs text-indigo-600 font-bold">{incap.folio_incapacidad}</p>
                                                            <p className="font-bold text-slate-900">
                                                                {incap.paciente?.nombre} {incap.paciente?.apellido_paterno}
                                                            </p>
                                                        </td>
                                                        <td className="p-4">
                                                            <Badge className="bg-slate-100 text-slate-700 border-none capitalize">
                                                                {incap.tipo_incapacidad?.replace('_', ' ')}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-4 text-sm text-slate-600">
                                                            {new Date(incap.fecha_inicio).toLocaleDateString('es-MX')}
                                                            {incap.fecha_fin && ` - ${new Date(incap.fecha_fin).toLocaleDateString('es-MX')}`}
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="text-xl font-black text-slate-900">{incap.dias_incapacidad}</span>
                                                            <span className="text-xs text-slate-400 ml-1">días</span>
                                                        </td>
                                                        <td className="p-4">
                                                            <Badge className={`${estadoBadge.color} border-none`}>{estadoBadge.label}</Badge>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                                                                <Eye className="w-4 h-4 text-slate-500" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-12 text-center text-slate-400">
                                        <FileCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p>No hay incapacidades registradas</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Modal ST-7 */}
                <Dialog open={isNewST7Open} onOpenChange={setIsNewST7Open}>
                    <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0 border-none">
                        <FormatoST7
                            paciente={selectedPaciente || { nombre: 'Seleccione paciente', apellido_paterno: '' }}
                            empresa={{}}
                            onSave={handleSaveST7}
                        />
                    </DialogContent>
                </Dialog>

                {/* Modal ST-9 */}
                <Dialog open={isNewST9Open} onOpenChange={setIsNewST9Open}>
                    <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0 border-none">
                        <FormatoST9
                            paciente={selectedPaciente || selectedRiesgo?.paciente || { nombre: 'Seleccione paciente', apellido_paterno: '' }}
                            riesgoTrabajo={selectedRiesgo}
                            onSave={handleSaveST9}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </>
    )
}
