// Página principal del módulo de Facturación & Seguros
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  FileText,
  DollarSign,
  Shield,
  TrendingUp,
  Users,
  Calendar,
  Bell,
  Plus,
  Filter,
  Search,
  BarChart3,
  Download,
  Send,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import {
  GeneradorCFDI
} from '@/components/facturacion/GeneradorCFDI'
import {
  PortalPagos
} from '@/components/facturacion/PortalPagos'
import {
  ConciliacionAutomatica
} from '@/components/facturacion/ConciliacionAutomatica'
import {
  ReportesFiscales
} from '@/components/facturacion/ReportesFiscales'
import {
  GestionSeguros
} from '@/components/facturacion/GestionSeguros'
import {
  EstadosCuenta
} from '@/components/facturacion/EstadosCuenta'
import {
  AlertasVencimiento
} from '@/components/facturacion/AlertasVencimiento'
import { MedicoDashboardFacturacion } from '@/components/facturacion/MedicoDashboardFacturacion'
import { FacturacionMedicaModal } from '@/components/facturacion/FacturacionMedicaModal'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { Cliente, Factura, ServicioMedico, Pago, NotaCredito } from '@/types/facturacion'
import { useFacturacion } from '@/hooks/useFacturacion'
import { BarChart as ReChartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart as ReChartsLineChart, Line, PieChart as ReChartsPieChart, Pie, Cell } from 'recharts'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'
import { PremiumMetricCard } from '@/components/ui/PremiumMetricCard'

import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

// Interfaces para datos de gráficos
interface IngresosMensualesData {
  mes: string
  ingresos: number
  meta: number
}

interface DistribucionClientesData {
  name: string
  value: number
  color: string
}

interface TooltipFormatterProps {
  value: any
  name: string
}


export function Facturacion() {
  const { user } = useAuth()
  const isSuperAdmin = user?.rol === 'super_admin'
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null)
  const [modalFacturacionAbierta, setModalFacturacionAbierta] = useState(false)
  const {
    clientes,
    facturas,
    servicios,
    seguros,
    notasCredito,
    alertasVencimiento,
    loading
  } = useFacturacion()

  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [vistaActiva, setVistaActiva] = useState('dashboard')
  const [mostrarFormularioFactura, setMostrarFormularioFactura] = useState(false)
  const [facturaReciente, setFacturaReciente] = useState<Factura | null>(null)

  // KPIs del Dashboard
  const estadisticasFacturacion = {
    facturasEmitidas: facturas.length,
    facturasPendientes: facturas.filter(f => f.estado === 'pendiente').length,
    facturasVencidas: facturas.filter(f => f.estado === 'vencida').length,
    ingresosTotales: facturas.reduce((sum, f) => sum + f.total, 0),
    ingresosCobrados: facturas.filter(f => f.estado === 'pagada').reduce((sum, f) => sum + f.total, 0),
    clientesActivos: clientes.length,
    alertasActivas: alertasVencimiento.length
  }

  const ingresosMensuales: IngresosMensualesData[] = [
    { mes: 'Ene', ingresos: 85000, meta: 90000 },
    { mes: 'Feb', ingresos: 92000, meta: 95000 },
    { mes: 'Mar', ingresos: 78000, meta: 85000 },
    { mes: 'Abr', ingresos: 105000, meta: 100000 },
    { mes: 'May', ingresos: 98000, meta: 105000 },
    { mes: 'Jun', ingresos: 112000, meta: 110000 }
  ]

  const distribucionClientes: DistribucionClientesData[] = [
    { name: 'IMSS', value: 45, color: '#00BFA6' },
    { name: 'ISSSTE', value: 25, color: '#3B82F6' },
    { name: 'Particular', value: 30, color: '#F59E0B' }
  ]

  // Métricas exclusivas Super Admin
  const comparativaEmpresas = [
    { nombre: 'GPMedical Demo Corp', ingresos: 125000, color: '#3B82F6' },
    { nombre: 'TechHealth Systems', ingresos: 98000, color: '#8B5CF6' },
    { nombre: 'Industrial Safety MX', ingresos: 75000, color: '#00BFA6' },
    { nombre: 'PharmaCore Lab', ingresos: 62000, color: '#F59E0B' },
  ]

  const proyeccionIngresos = [
    { mes: 'Jul', actual: 112000, proyectado: 115000 },
    { mes: 'Ago', proyectado: 120000 },
    { mes: 'Sep', proyectado: 128000 },
    { mes: 'Oct', proyectado: 135000 },
  ]

  const facturasRecientes = facturas.slice(0, 5).map(factura => {
    const cliente = clientes.find(c => c.id === factura.cliente.id)
    return { ...factura, clienteNombre: cliente?.razonSocial || 'Cliente desconocido' }
  })

  const alertasCriticas = alertasVencimiento.filter(a => a.nivelUrgencia === 'critica').slice(0, 3)

  const handleFacturaCreada = (factura: Factura) => {
    setFacturaReciente(factura)
    toast.success(`Factura ${factura.folio} creada exitosamente`)
  }

  const handleProcesarConSeguro = async (seguroId: string, serviciosIds: string[], datos: any) => {
    try {
      // Integrar con el hook de facturación
      toast.success('Procesamiento con seguro completado')
    } catch (error) {
      toast.error('Error al procesar con seguro')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando módulo de facturación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PremiumPageHeader
        title="Fiscal Intelligence & Invoicing"
        subtitle="Gestión financiera integrada con cumplimiento CFDI 4.0 y portal de seguros automatizado."
        icon={CreditCard}
        badge="CFDI 4.0 CERTIFIED"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => { }}
              className="h-11 px-6 rounded-xl border-slate-200 hover:border-emerald-200 hover:text-emerald-600 font-bold"
            >
              <Download className="w-5 h-5 mr-2" />
              Exportar
            </Button>

            <Button
              variant="premium"
              onClick={() => setMostrarFormularioFactura(true)}
              className="h-11 px-8 shadow-xl shadow-emerald-500/20"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nueva Factora
            </Button>
          </div>
        }
      />

      {/* Alertas Críticas */}
      {alertasCriticas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-rose-50/50 backdrop-blur-md border border-rose-200 rounded-3xl p-6 shadow-sm flex items-center justify-between gap-6"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20">
              <AlertCircle className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <p className="font-black text-rose-900 uppercase tracking-tight">
                Acción Requerida: {alertasCriticas.length} Incidencias de Pago
              </p>
              <p className="text-sm text-rose-700/80 font-medium">
                {alertasCriticas.map(a => a.mensaje).join(' | ')}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setVistaActiva('alertas')}
            className="rounded-xl bg-white border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 font-bold px-6 h-11"
          >
            Gestionar Alertas
          </Button>
        </motion.div>
      )}

      {/* Dashboard Principal */}
      {vistaActiva === 'dashboard' && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PremiumMetricCard
              title="Volumen Fiscal"
              value={estadisticasFacturacion.facturasEmitidas}
              subtitle="Folios Documentados"
              icon={FileText}
              gradient="emerald"
            />

            <PremiumMetricCard
              title="Revenue Neto"
              value={`$${estadisticasFacturacion.ingresosTotales.toLocaleString()}`}
              subtitle="Ingreso Proyectado"
              icon={DollarSign}
              gradient="emerald"
              trend={{ value: 12, isPositive: true }}
            />

            <PremiumMetricCard
              title="Ecosistema Clientes"
              value={estadisticasFacturacion.clientesActivos}
              subtitle="Entidades Corporativas"
              icon={Users}
              gradient="emerald"
            />

            <PremiumMetricCard
              title="Vigilancia de Cobro"
              value={estadisticasFacturacion.alertasActivas}
              subtitle="Acciones Pendientes"
              icon={Bell}
              gradient={estadisticasFacturacion.alertasActivas > 0 ? 'rose' : 'emerald'}
            />
          </div>

          {/* Gráficos y Contenido Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ingresos Mensuales */}
            <div className={`lg:col-span-2 ${isSuperAdmin ? 'order-1' : ''}`}>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900">{isSuperAdmin ? 'Ingresos Consolidados vs Meta' : 'Ingresos vs Meta'}</h3>
                  <Badge className="bg-green-100 text-green-800">
                    +18.3% vs mes anterior
                  </Badge>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReChartsBarChart data={ingresosMensuales}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="mes" stroke="#666" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#666" tick={{ fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: any, name: string) => [`$${value.toLocaleString()}`, name]} />
                      <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} name="Ingresos" />
                      <Bar dataKey="meta" fill="#E5E7EB" radius={[4, 4, 0, 0]} name="Meta" />
                    </ReChartsBarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Distribución de Clientes / Proyección Forecast */}
            <Card className={`p-6 ${isSuperAdmin ? 'order-2' : ''}`}>
              <h3 className="font-semibold text-gray-900 mb-4">{isSuperAdmin ? 'Forecast Próximos Meses' : 'Distribución por Seguro'}</h3>
              <div className="h-64">
                {isSuperAdmin ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ReChartsLineChart data={proyeccionIngresos}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="mes" />
                      <YAxis tickFormatter={(v) => `$${v / 1000}k`} />
                      <Tooltip />
                      <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={3} dot={{ r: 6 }} />
                      <Line type="monotone" dataKey="proyectado" stroke="#10b981" strokeDasharray="5 5" strokeWidth={2} />
                    </ReChartsLineChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <ReChartsPieChart>
                      <Pie
                        data={distribucionClientes}
                        cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5} dataKey="value" nameKey="name"
                      >
                        {distribucionClientes.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`${value}%`, 'Porcentaje']} />
                    </ReChartsPieChart>
                  </ResponsiveContainer>
                )}
              </div>
              {!isSuperAdmin && (
                <div className="space-y-2 mt-4">
                  {distribucionClientes.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-gray-700">{item.name}</span>
                      </div>
                      <span className="font-semibold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Comparativa por Empresa (Super Admin Only) */}
            {isSuperAdmin && (
              <Card className="lg:col-span-3 p-6 order-3">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Comparativa de Ingresos por Empresa
                  </h3>
                  <Button variant="ghost" size="sm" className="text-blue-600">Ver reporte detallado</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-1 space-y-4">
                    {comparativaEmpresas.map((emp, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 font-medium">{emp.nombre}</p>
                        <p className="text-lg font-bold text-gray-900">${emp.ingresos.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="md:col-span-3 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReChartsBarChart data={comparativaEmpresas} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" tick={false} axisLine={false} height={0} />
                        <YAxis dataKey="nombre" type="category" width={150} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="ingresos" fill="#10b981" radius={[0, 4, 4, 0]} />
                      </ReChartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sección Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Facturas Recientes */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Facturas Recientes</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setVistaActiva('facturacion')}
                >
                  Ver Todas
                </Button>
              </div>
              <div className="space-y-3">
                {facturasRecientes.map((factura) => (
                  <div key={factura.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900">{factura.folio}</h4>
                        <Badge className={`${factura.estado === 'pagada' ? 'bg-green-100 text-green-800' :
                          factura.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {factura.estado}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{factura.clienteNombre}</p>
                      <p className="text-xs text-gray-500">
                        {factura.fechaEmision.toLocaleDateString('es-MX')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${factura.total.toLocaleString()}
                      </p>
                      <Button size="sm" variant="outline" className="mt-1">
                        Ver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Acciones Rápidas */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => {
                    setClienteSeleccionado(clientes[0] || null)
                    setVistaActiva('cfdi')
                  }}
                >
                  <FileText className="h-6 w-6" />
                  <span>Generar CFDI</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => setVistaActiva('pagos')}
                >
                  <DollarSign className="h-6 w-6" />
                  <span>Portal Pagos</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => setVistaActiva('seguros')}
                >
                  <Shield className="h-6 w-6" />
                  <span>Gestionar Seguros</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => setVistaActiva('reportes')}
                >
                  <BarChart3 className="h-6 w-6" />
                  <span>Reportes</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => setVistaActiva('estados')}
                >
                  <Users className="h-6 w-6" />
                  <span>Estados Cuenta</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => setVistaActiva('conciliacion')}
                >
                  <TrendingUp className="h-6 w-6" />
                  <span>Conciliación</span>
                </Button>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Tabs para todas las funcionalidades */}
      {vistaActiva !== 'dashboard' && (
        <Tabs value={vistaActiva} onValueChange={setVistaActiva} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="cfdi">Generador CFDI</TabsTrigger>
            <TabsTrigger value="pagos">Portal Pagos</TabsTrigger>
            <TabsTrigger value="seguros">Seguros</TabsTrigger>
            <TabsTrigger value="reportes">Reportes</TabsTrigger>
            <TabsTrigger value="estados">Estados</TabsTrigger>
            <TabsTrigger value="alertas">Alertas</TabsTrigger>
          </TabsList>

          <TabsContent value="cfdi">
            <GeneradorCFDI
              cliente={clienteSeleccionado}
              servicios={servicios}
              onFacturaCreada={handleFacturaCreada}
            />
          </TabsContent>

          <TabsContent value="pagos">
            {clienteSeleccionado ? (
              <PortalPagos cliente={clienteSeleccionado} />
            ) : (
              <Card className="p-6">
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Selecciona un cliente para acceder al portal de pagos</p>
                  <div className="max-w-md mx-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seleccionar Cliente
                    </label>
                    <select
                      value={clienteSeleccionado?.id || ''}
                      onChange={(e) => {
                        const cliente = clientes.find(c => c.id === e.target.value)
                        setClienteSeleccionado(cliente || null)
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Seleccionar...</option>
                      {clientes.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.razonSocial}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="seguros">
            <GestionSeguros
              cliente={clienteSeleccionado}
              servicios={servicios}
              onProcesarConSeguro={handleProcesarConSeguro}
            />
          </TabsContent>

          <TabsContent value="reportes">
            <ReportesFiscales facturas={facturas} />
          </TabsContent>

          <TabsContent value="estados">
            <EstadosCuenta
              cliente={clienteSeleccionado}
              facturas={facturas}
              pagos={[]}
              notasCredito={notasCredito}
            />
          </TabsContent>

          <TabsContent value="conciliacion">
            <ConciliacionAutomatica
              facturas={facturas}
              pagos={[]}
            />
          </TabsContent>

          <TabsContent value="alertas">
            <AlertasVencimiento
              facturas={facturas}
              clientes={clientes}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Modal de Nueva Factura */}
      <Dialog open={mostrarFormularioFactura} onOpenChange={setMostrarFormularioFactura}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nueva Factura</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente
              </label>
              <select
                value={clienteSeleccionado?.id || ''}
                onChange={(e) => {
                  const cliente = clientes.find(c => c.id === e.target.value)
                  setClienteSeleccionado(cliente || null)
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Seleccionar cliente...</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.razonSocial} - {cliente.rfc}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  setMostrarFormularioFactura(false)
                  setVistaActiva('cfdi')
                }}
                disabled={!clienteSeleccionado}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Continuar al Generador CFDI
              </Button>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
