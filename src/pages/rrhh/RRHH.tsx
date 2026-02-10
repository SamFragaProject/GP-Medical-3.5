// Página principal del módulo RRHH - Recursos Humanos
import React from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Users,
    Palmtree,
    Search,
    Plus,
    RefreshCw,
    Download,
    DollarSign,
    Briefcase,
    Brain,
    Heart,
    Calendar,
    Bell
} from 'lucide-react'
import { Psicometria } from './Psicometria'
import { NominaPanel } from './Nomina'

// Componentes RRHH
import {
    EmpleadoCard,
    EmpleadoModal,
    VacacionesPanel
} from '@/components/rrhh'

// Servicios
import { employeeService } from '@/services/employeeService'
import { timeOffService } from '@/services/timeOffService'
import { useAuth } from '@/contexts/AuthContext'

// Types
import type {
    Employee,
    VacationRequest
} from '@/types/rrhh'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'
import { PremiumMetricCard } from '@/components/ui/PremiumMetricCard'

export default function RRHH() {
    // Auth
    const { user } = useAuth()
    const empresaId = user?.empresa_id

    // Estado
    const [loading, setLoading] = React.useState(true)
    const [empleados, setEmpleados] = React.useState<Employee[]>([])
    const [vacaciones, setVacaciones] = React.useState<VacationRequest[]>([])

    // Modal
    const [modalOpen, setModalOpen] = React.useState(false)
    const [empleadoEditing, setEmpleadoEditing] = React.useState<Employee | null>(null)

    // Search
    const [busqueda, setBusqueda] = React.useState('')

    // Tab activa
    const [activeTab, setActiveTab] = React.useState('empleados')

    // Cargar datos
    const loadData = React.useCallback(async () => {
        if (!empresaId) return

        setLoading(true)
        try {
            const [
                empleadosData,
                vacacionesData
            ] = await Promise.all([
                employeeService.getEmployees(empresaId),
                timeOffService.getVacationRequests(empresaId)
            ])

            setEmpleados(empleadosData)
            setVacaciones(vacacionesData)
        } catch (error) {
            console.error('Error loading RRHH data:', error)
        } finally {
            setLoading(false)
        }
    }, [empresaId])

    React.useEffect(() => {
        loadData()
    }, [loadData])

    // Handlers
    const filteredEmpleados = empleados.filter(e =>
        e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.apellido.toLowerCase().includes(busqueda.toLowerCase())
    )

    const handleNewEmpleado = () => {
        setEmpleadoEditing(null)
        setModalOpen(true)
    }

    const handleEditEmpleado = (empleado: Employee) => {
        setEmpleadoEditing(empleado)
        setModalOpen(true)
    }

    const handleSaveEmpleado = async (data: Partial<Employee>) => {
        if (!empresaId) return
        try {
            if (empleadoEditing) {
                await employeeService.updateEmployee(empleadoEditing.id, data)
            } else {
                await employeeService.createEmployee({ ...data, empresa_id: empresaId } as any)
            }
            setModalOpen(false)
            loadData()
        } catch (error) {
            console.error('Error saving empleado:', error)
        }
    }

    const handleAprobarVacaciones = async (id: string) => {
        try {
            await timeOffService.updateRequestStatus(id, 'aprobado', user?.id)
            loadData()
        } catch (error) {
            console.error('Error approving vacaciones:', error)
        }
    }

    const handleRechazarVacaciones = async (id: string) => {
        try {
            await timeOffService.updateRequestStatus(id, 'rechazado', user?.id)
            loadData()
        } catch (error) {
            console.error('Error rejecting vacaciones:', error)
        }
    }

    const tabs = [
        { id: 'empleados', label: 'Empleados', icon: Users },
        { id: 'vacaciones', label: 'Vacaciones', icon: Palmtree },
        { id: 'nomina', label: 'Nómina', icon: DollarSign },
        { id: 'evaluaciones', label: 'Evaluaciones', icon: Brain },
    ]

    return (
        <div className="space-y-8 pb-12">
            <PremiumPageHeader
                title="Recursos Humanos Pro"
                subtitle="Gestión integral de talento, nómina y evaluaciones de desempeño médico"
                icon={Users}
                badge="SISTEMA ACTIVO"
                actions={
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-black h-12 rounded-2xl px-6 transition-all"
                            onClick={loadData}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Sincronizar
                        </Button>
                        <Button
                            variant="premium"
                            className="h-12 px-8 shadow-xl shadow-blue-500/30 bg-white text-slate-900 hover:bg-slate-100 font-bold"
                            onClick={handleNewEmpleado}
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Nuevo Empleado
                        </Button>
                    </div>
                }
            />

            <div className="container mx-auto px-6 -mt-10 relative z-40">
                {/* KPIs Premium - Gold Standard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <PremiumMetricCard
                        title="Total Plantilla"
                        value={empleados.length}
                        subtitle="Colaboradores activos"
                        icon={Users}
                        gradient="blue"
                    />
                    <PremiumMetricCard
                        title="Médicos Especialistas"
                        value={empleados.length > 0 ? Math.floor(empleados.length * 0.4) : 0}
                        subtitle="Personal certificado"
                        icon={Heart}
                        gradient="emerald"
                    />
                    <PremiumMetricCard
                        title="Vacaciones"
                        value={vacaciones.filter(v => v.estado === 'pendiente').length}
                        subtitle="Solicitudes pendientes"
                        icon={Palmtree}
                        gradient="amber"
                    />
                    <PremiumMetricCard
                        title="Nómina"
                        value="98%"
                        subtitle="Cumplimiento periodo"
                        icon={RefreshCw}
                        gradient="purple"
                        trend={{ value: 2.4, isPositive: true }}
                    />
                </div>

                <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-2 rounded-[2rem] shadow-sm mb-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                            <TabsList className="bg-transparent gap-1 h-auto p-1">
                                {tabs.map(tab => {
                                    const Icon = tab.icon
                                    return (
                                        <TabsTrigger
                                            key={tab.id}
                                            value={tab.id}
                                            className="rounded-2xl px-8 h-12 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all outline-none"
                                        >
                                            <Icon className="w-4 h-4 mr-2" />
                                            {tab.label}
                                        </TabsTrigger>
                                    )
                                })}
                            </TabsList>

                            <div className="relative w-full lg:w-80 mr-2">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Buscar en RRHH..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="pl-12 h-12 bg-white/50 border-white/60 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-bold"
                                />
                            </div>
                        </div>

                        <div className="mt-8">
                            <TabsContent value="empleados" className="space-y-6 outline-none">
                                {/* Grid de empleados */}
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredEmpleados.map(empleado => (
                                        <EmpleadoCard
                                            key={empleado.id}
                                            empleado={empleado}
                                            onEdit={handleEditEmpleado}
                                            onView={handleEditEmpleado}
                                        />
                                    ))}
                                </div>

                                {filteredEmpleados.length === 0 && !loading && (
                                    <div className="text-center py-24 bg-white/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                                        <Users className="h-16 w-16 mx-auto mb-4 opacity-20 text-slate-400" />
                                        <p className="text-slate-500 font-bold">No se encontraron empleados coincidentes</p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="vacaciones" className="outline-none">
                                <Card className="border-none shadow-none bg-transparent">
                                    <VacacionesPanel
                                        solicitudes={vacaciones}
                                        onAprobar={handleAprobarVacaciones}
                                        onRechazar={handleRechazarVacaciones}
                                        loading={loading}
                                    />
                                </Card>
                            </TabsContent>

                            <TabsContent value="nomina" className="outline-none">
                                <NominaPanel />
                            </TabsContent>

                            <TabsContent value="evaluaciones" className="outline-none">
                                <Psicometria />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {/* Modal de Empleado */}
                <EmpleadoModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    empleado={empleadoEditing}
                    onSave={handleSaveEmpleado}
                    loading={loading}
                />
            </div>
        </div>
    );
}
