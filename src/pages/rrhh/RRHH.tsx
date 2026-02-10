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
    Brain
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
import { employeeService } from '@/services/employeeService' // New service
import { timeOffService } from '@/services/timeOffService'   // New service
import { useAuth } from '@/contexts/AuthContext'

// Types
import type {
    Employee,
    VacationRequest
} from '@/types/rrhh'
import { PremiumHeader } from '@/components/ui/PremiumHeader'
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
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        // Implement client-side filtering or call service with query
        // For now client-side simple filter
    }

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
        <div className="space-y-8">
            <PremiumHeader
                title="Recursos Humanos"
                subtitle="Gestión integral de personal, nómina y evaluaciones de desempeño"
                gradient={true}
                badges={[
                    { text: `${empleados.length} Empleados`, variant: 'info', icon: <Users size={14} /> },
                    { text: 'Empresa Certificada', variant: 'success', icon: <Briefcase size={14} /> }
                ]}
                actions={
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="rounded-xl" onClick={loadData} disabled={loading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Sincronizar
                        </Button>
                        <Button onClick={handleNewEmpleado} className="bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 rounded-xl">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Empleado
                        </Button>
                    </div>
                }
            />

            {/* KPIs Rápidos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <PremiumMetricCard
                    title="Total Plantilla"
                    value={empleados.length}
                    subtitle="Colaboradores activos"
                    icon={Users}
                    gradient="blue"
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
                    icon={DollarSign}
                    gradient="emerald"
                />
                <PremiumMetricCard
                    title="Evaluaciones"
                    value="12"
                    subtitle="Pendientes este mes"
                    icon={Brain}
                    gradient="purple"
                />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="flex items-center justify-between bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 w-fit">
                    <TabsList className="bg-transparent gap-1">
                        {tabs.map(tab => {
                            const Icon = tab.icon
                            return (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm rounded-xl px-6 py-2.5 transition-all font-bold text-slate-500"
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{tab.label}</span>
                                </TabsTrigger>
                            )
                        })}
                    </TabsList>
                </div>

                {/* Empleados Tab */}
                <TabsContent value="empleados" className="space-y-6">
                    {/* Search */}
                    <div className="flex gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar empleados..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Grid de empleados */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        <div className="text-center py-12 text-slate-500">
                            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p>No se encontraron empleados</p>
                        </div>
                    )}
                </TabsContent>

                {/* Vacaciones Tab */}
                <TabsContent value="vacaciones">
                    <Card>
                        <CardHeader>
                            <CardTitle>Solicitudes de Vacaciones</CardTitle>
                            <CardDescription>Gestión de permisos y tiempo libre</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <VacacionesPanel
                                solicitudes={vacaciones}
                                onAprobar={handleAprobarVacaciones}
                                onRechazar={handleRechazarVacaciones}
                                loading={loading}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Nomina Tab */}
                <TabsContent value="nomina">
                    <NominaPanel />
                </TabsContent>

                {/* Psicometria Tab */}
                <TabsContent value="evaluaciones">
                    <Psicometria />
                </TabsContent>
            </Tabs>

            {/* Modal de Empleado */}
            <EmpleadoModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                empleado={empleadoEditing}
                onSave={handleSaveEmpleado}
                loading={loading}
            />
        </div>
    )
}
