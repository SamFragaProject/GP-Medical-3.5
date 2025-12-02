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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
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

const user = {
  id: 'demo-user',
  email: 'demo@mediflow.com',
  name: 'Usuario Demo',
  hierarchy: 'super_admin' as const,
  empresa: { nombre: 'MediFlow Demo Corp' },
  sede: { nombre: 'Sede Principal' }
}

export function Facturacion() {
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
    { name: 'ISSSTE', value: 15, color: '#8B5CF6' },
    { name: 'Particular', value: 15, color: '#F59E0B' }
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
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <span>Facturación & Seguros</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Sistema completo de facturación CFDI 4.0 con integración de seguros
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Datos
            </Button>
            <Button 
              variant="outline"
              onClick={() => setMostrarFormularioFactura(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Factura
            </Button>
          </div>
        </div>
      </div>

      {/* Alertas Críticas */}
      {alertasCriticas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">
                  {alertasCriticas.length} factura(s) vencida(s) requieren atención inmediata
                </p>
                <p className="text-sm text-red-700">
                  {alertasCriticas.map(a => a.mensaje).join(', ')}
                </p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setVistaActiva('alertas')}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Ver Alertas
            </Button>
          </div>
        </motion.div>
      )}

      {/* Dashboard Principal */}
      {vistaActiva === 'dashboard' && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                titulo: 'Facturas Emitidas',
                valor: estadisticasFacturacion.facturasEmitidas,
                icono: FileText,
                color: 'bg-blue-500',
                descripcion: `${estadisticasFacturacion.facturasPendientes} pendientes`
              },
              {
                titulo: 'Ingresos Totales',
                valor: `$${estadisticasFacturacion.ingresosTotales.toLocaleString()}`,
                icono: DollarSign,
                color: 'bg-green-500',
                descripcion: `${Math.round((estadisticasFacturacion.ingresosCobrados / estadisticasFacturacion.ingresosTotales) * 100)}% cobrado`
              },
              {
                titulo: 'Clientes Activos',
                valor: estadisticasFacturacion.clientesActivos,
                icono: Users,
                color: 'bg-primary',
                descripcion: 'empresas registradas'
              },
              {
                titulo: 'Alertas Activas',
                valor: estadisticasFacturacion.alertasActivas,
                icono: Bell,
                color: estadisticasFacturacion.alertasActivas > 0 ? 'bg-red-500' : 'bg-gray-500',
                descripcion: 'requieren atención'
              }
            ].map((kpi, index) => (
              <motion.div
                key={kpi.titulo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{kpi.titulo}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.valor}</p>
                      <p className="text-sm text-gray-500 mt-1">{kpi.descripcion}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${kpi.color}`}>
                      <kpi.icono className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Gráficos y Contenido Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ingresos Mensuales */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900">Ingresos vs Meta</h3>
                  <Badge className="bg-green-100 text-green-800">
                    +18.3% vs mes anterior
                  </Badge>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ingresosMensuales}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="mes" 
                        stroke="#666"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#666"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        formatter={(value: any, name: string) => [`$${value.toLocaleString()}`, name]}
                        labelStyle={{ color: '#666' }}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                      />
                      <Bar 
                        dataKey="ingresos" 
                        fill="#00BFA6" 
                        radius={[4, 4, 0, 0]} 
                        name="Ingresos"
                      />
                      <Bar 
                        dataKey="meta" 
                        fill="#E5E7EB" 
                        radius={[4, 4, 0, 0]} 
                        name="Meta"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Distribución de Clientes */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Distribución por Seguro</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribucionClientes}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                    >
                      {distribucionClientes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: string) => [`${value}%`, 'Porcentaje']}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
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
            </Card>
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
                        <Badge className={`${
                          factura.estado === 'pagada' ? 'bg-green-100 text-green-800' :
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