// Página principal del módulo RRHH - Recursos Humanos
import React from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Users,
    Clock,
    Palmtree,
    AlertTriangle,
    Network,
    Search,
    Plus,
    RefreshCw,
    Download,
    Settings
} from 'lucide-react'

// Componentes RRHH
import {
    RRHHDashboardStats,
    EmpleadoCard,
    EmpleadoModal,
    AsistenciaTable,
    VacacionesPanel,
    IncidenciasPanel,
    OrganigramaTree
} from '@/components/rrhh'

// Servicios
import * as rrhhService from '@/services/rrhhService'

// Types
import type {
    Empleado,
    RRHHStats,
    RegistroAsistencia,
    SolicitudVacaciones,
    Incidencia,
    Departamento,
    Puesto,
    NodoOrganigrama
} from '@/types/rrhh'

export default function RRHH() {
    // Estado
    const [loading, setLoading] = React.useState(true)
    const [stats, setStats] = React.useState<RRHHStats | null>(null)
    const [empleados, setEmpleados] = React.useState<Empleado[]>([])
    const [asistencia, setAsistencia] = React.useState<RegistroAsistencia[]>([])
    const [vacaciones, setVacaciones] = React.useState<SolicitudVacaciones[]>([])
    const [incidencias, setIncidencias] = React.useState<Incidencia[]>([])
    const [organigrama, setOrganigrama] = React.useState<NodoOrganigrama | null>(null)
    const [departamentos, setDepartamentos] = React.useState<Departamento[]>([])
    const [puestos, setPuestos] = React.useState<Puesto[]>([])

    // Modal
    const [modalOpen, setModalOpen] = React.useState(false)
    const [empleadoEditing, setEmpleadoEditing] = React.useState<Empleado | null>(null)

    // Search
    const [busqueda, setBusqueda] = React.useState('')

    // Tab activa
    const [activeTab, setActiveTab] = React.useState('dashboard')

    // Cargar datos
    const loadData = React.useCallback(async () => {
        setLoading(true)
        try {
            const [
                statsData,
                empleadosData,
                asistenciaData,
                vacacionesData,
                incidenciasData,
                organigramaData,
                departamentosData,
                puestosData
            ] = await Promise.all([
                rrhhService.getRRHHStats(),
                rrhhService.getEmpleados({ busqueda }),
                rrhhService.getAsistencia(),
                rrhhService.getVacaciones(),
                rrhhService.getIncidencias(),
                rrhhService.getOrganigrama(),
                rrhhService.getDepartamentos(),
                rrhhService.getPuestos()
            ])

            setStats(statsData)
            setEmpleados(empleadosData)
            setAsistencia(asistenciaData)
            setVacaciones(vacacionesData)
            setIncidencias(incidenciasData)
            setOrganigrama(organigramaData)
            setDepartamentos(departamentosData)
            setPuestos(puestosData)
        } catch (error) {
            console.error('Error loading RRHH data:', error)
        } finally {
            setLoading(false)
        }
    }, [busqueda])

    React.useEffect(() => {
        loadData()
    }, [loadData])

    // Handlers
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        loadData()
    }

    const handleNewEmpleado = () => {
        setEmpleadoEditing(null)
        setModalOpen(true)
    }

    const handleEditEmpleado = (empleado: Empleado) => {
        setEmpleadoEditing(empleado)
        setModalOpen(true)
    }

    const handleSaveEmpleado = async (data: Partial<Empleado>) => {
        try {
            if (empleadoEditing) {
                await rrhhService.updateEmpleado(empleadoEditing.id, data)
            } else {
                await rrhhService.createEmpleado(data as any)
            }
            setModalOpen(false)
            loadData()
        } catch (error) {
            console.error('Error saving empleado:', error)
        }
    }

    const handleAprobarVacaciones = async (id: string) => {
        try {
            await rrhhService.aprobarVacaciones(id, 'current-user', true)
            loadData()
        } catch (error) {
            console.error('Error approving vacaciones:', error)
        }
    }

    const handleRechazarVacaciones = async (id: string) => {
        try {
            await rrhhService.aprobarVacaciones(id, 'current-user', false)
            loadData()
        } catch (error) {
            console.error('Error rejecting vacaciones:', error)
        }
    }

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: Users },
        { id: 'empleados', label: 'Empleados', icon: Users },
        { id: 'asistencia', label: 'Asistencia', icon: Clock },
        { id: 'vacaciones', label: 'Vacaciones', icon: Palmtree },
        { id: 'incidencias', label: 'Incidencias', icon: AlertTriangle },
        { id: 'organigrama', label: 'Organigrama', icon: Network },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        Recursos Humanos
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Gestión integral de personal, asistencia, vacaciones e incidencias
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                    </Button>
                    <Button onClick={handleNewEmpleado}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Empleado
                    </Button>
                </div>
            </motion.div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-slate-100/80 p-1 rounded-xl">
                    {tabs.map(tab => {
                        const Icon = tab.icon
                        return (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
                            >
                                <Icon className="h-4 w-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </TabsTrigger>
                        )
                    })}
                </TabsList>

                {/* Dashboard Tab */}
                <TabsContent value="dashboard" className="space-y-6">
                    {stats && <RRHHDashboardStats stats={stats} loading={loading} />}

                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Solicitudes pendientes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Palmtree className="h-5 w-5 text-cyan-500" />
                                    Solicitudes de Vacaciones Pendientes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <VacacionesPanel
                                    solicitudes={vacaciones.filter(v => v.estado === 'pendiente')}
                                    onAprobar={handleAprobarVacaciones}
                                    onRechazar={handleRechazarVacaciones}
                                    loading={loading}
                                />
                            </CardContent>
                        </Card>

                        {/* Incidencias recientes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                                    Incidencias Recientes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <IncidenciasPanel
                                    incidencias={incidencias.slice(0, 5)}
                                    loading={loading}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Empleados Tab */}
                <TabsContent value="empleados" className="space-y-6">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar empleados..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button type="submit">Buscar</Button>
                    </form>

                    {/* Grid de empleados */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {empleados.map(empleado => (
                            <EmpleadoCard
                                key={empleado.id}
                                empleado={empleado}
                                onEdit={handleEditEmpleado}
                                onView={handleEditEmpleado}
                            />
                        ))}
                    </div>

                    {empleados.length === 0 && !loading && (
                        <div className="text-center py-12 text-slate-500">
                            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p>No se encontraron empleados</p>
                        </div>
                    )}
                </TabsContent>

                {/* Asistencia Tab */}
                <TabsContent value="asistencia">
                    <Card>
                        <CardHeader>
                            <CardTitle>Registro de Asistencia</CardTitle>
                            <CardDescription>Fichajes de entrada y salida del día</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AsistenciaTable registros={asistencia} loading={loading} />
                        </CardContent>
                    </Card>
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

                {/* Incidencias Tab */}
                <TabsContent value="incidencias">
                    <Card>
                        <CardHeader>
                            <CardTitle>Incidencias</CardTitle>
                            <CardDescription>Faltas, retardos, permisos e incapacidades</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <IncidenciasPanel incidencias={incidencias} loading={loading} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Organigrama Tab */}
                <TabsContent value="organigrama">
                    <Card>
                        <CardHeader>
                            <CardTitle>Organigrama</CardTitle>
                            <CardDescription>Estructura organizacional de la empresa</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <OrganigramaTree raiz={organigrama} loading={loading} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Modal de Empleado */}
            <EmpleadoModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                empleado={empleadoEditing}
                departamentos={departamentos}
                puestos={puestos}
                onSave={handleSaveEmpleado}
            />
        </div>
    )
}
