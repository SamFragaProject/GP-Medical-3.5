// Dashboard de facturación para médicos - Vista especializada
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Stethoscope, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Receipt,
  Eye,
  Download,
  Search,
  Filter,
  Plus,
  Target,
  Award,
  Users,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import toast from 'react-hot-toast'

interface MedicoDashboardFacturacionProps {
  medico: {
    id: string
    nombre: string
    especialidad: string
    cedula_profesional: string
  }
}

interface FacturaMedica {
  id: string
  fecha_creacion: string
  paciente_nombre: string
  servicios: number
  subtotal: number
  total: number
  estado: 'borrador' | 'emitida' | 'pagada' | 'cancelada'
  metodo_pago: string
}

interface EstadisticaMedico {
  facturas_emitidas: number
  facturas_pendientes: number
  ingresos_mes: number
  crecimiento_mensual: number
  servicios_mas_prestados: string[]
  promedio_por_factura: number
  tiempo_promedio_cobro: number
  satisfaccion_pacientes: number
}

const mockFacturas: FacturaMedica[] = [
  {
    id: '1',
    fecha_creacion: '2024-11-01T10:30:00Z',
    paciente_nombre: 'Juan Carlos Pérez',
    servicios: 3,
    subtotal: 1850,
    total: 2146,
    estado: 'pagada',
    metodo_pago: 'efectivo'
  },
  {
    id: '2',
    fecha_creacion: '2024-11-02T14:15:00Z',
    paciente_nombre: 'María González López',
    servicios: 1,
    subtotal: 800,
    total: 928,
    estado: 'emitida',
    metodo_pago: 'tarjeta'
  },
  {
    id: '3',
    fecha_creacion: '2024-11-03T09:45:00Z',
    paciente_nombre: 'Roberto Silva Martín',
    servicios: 2,
    subtotal: 1350,
    total: 1566,
    estado: 'borrador',
    metodo_pago: 'efectivo'
  }
]

const mockEstadisticas: EstadisticaMedico = {
  facturas_emitidas: 47,
  facturas_pendientes: 8,
  ingresos_mes: 35200,
  crecimiento_mensual: 15.3,
  servicios_mas_prestados: ['Consulta Médica General', 'Examen Periódico Anual', 'Audiometría'],
  promedio_por_factura: 748,
  tiempo_promedio_cobro: 2.3,
  satisfaccion_pacientes: 4.8
}

const ingresosMensuales = [
  { mes: 'Jul', ingresos: 28500 },
  { mes: 'Ago', ingresos: 31200 },
  { mes: 'Sep', ingresos: 29800 },
  { mes: 'Oct', ingresos: 33400 },
  { mes: 'Nov', ingresos: 35200 }
]

const serviciosData = [
  { name: 'Consultas', value: 45, color: '#00BFA6' },
  { name: 'Exámenes', value: 30, color: '#3B82F6' },
  { name: 'Procedimientos', value: 20, color: '#8B5CF6' },
  { name: 'Certificados', value: 5, color: '#F59E0B' }
]

export function MedicoDashboardFacturacion({ medico }: MedicoDashboardFacturacionProps) {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes')
  const [estadoFiltro, setEstadoFiltro] = useState('todos')

  const facturasFiltradas = mockFacturas.filter(factura => {
    if (estadoFiltro === 'todos') return true
    return factura.estado === estadoFiltro
  })

  const getEstadoBadge = (estado: string) => {
    const variants = {
      borrador: 'bg-gray-100 text-gray-800',
      emitida: 'bg-blue-100 text-blue-800',
      pagada: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800'
    }
    return variants[estado as keyof typeof variants] || 'bg-gray-100 text-gray-800'
  }

  const formatMoneda = (cantidad: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(cantidad)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Stethoscope className="h-6 w-6 text-green-600" />
              </div>
              <span>Facturación Médica</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Dr. {medico.nombre} - {medico.especialidad}
            </p>
            <p className="text-sm text-gray-500">
              Cédula Profesional: {medico.cedula_profesional}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Factura
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs del médico */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos del Mes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatMoneda(mockEstadisticas.ingresos_mes)}
                  </p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{mockEstadisticas.crecimiento_mensual}%
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Facturas Emitidas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockEstadisticas.facturas_emitidas}
                  </p>
                  <p className="text-sm text-blue-600 flex items-center mt-1">
                    <FileText className="h-3 w-3 mr-1" />
                    {mockEstadisticas.facturas_pendientes} pendientes
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Receipt className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Promedio por Factura</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatMoneda(mockEstadisticas.promedio_por_factura)}
                  </p>
                  <p className="text-sm text-purple-600 flex items-center mt-1">
                    <Target className="h-3 w-3 mr-1" />
                    +12% vs mes anterior
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Satisfacción</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockEstadisticas.satisfaccion_pacientes}/5.0
                  </p>
                  <p className="text-sm text-orange-600 flex items-center mt-1">
                    <Users className="h-3 w-3 mr-1" />
                    Basado en encuestas
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Gráficos y análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tendencia de ingresos */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Tendencia de Ingresos</span>
              </CardTitle>
              <CardDescription>
                Evolución mensual de los ingresos por facturación médica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ingresosMensuales}>
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
                      formatter={(value: any) => [formatMoneda(value), 'Ingresos']}
                      labelStyle={{ color: '#666' }}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ingresos" 
                      stroke="#00BFA6" 
                      strokeWidth={3}
                      dot={{ fill: '#00BFA6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#00BFA6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Distribución de servicios */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>Servicios Prestados</span>
              </CardTitle>
              <CardDescription>
                Distribución por tipo de servicio médico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviciosData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {serviciosData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`${value}%`, 'Porcentaje']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {serviciosData.map((servicio, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: servicio.color }}
                      ></div>
                      <span>{servicio.name}</span>
                    </div>
                    <span className="font-medium">{servicio.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Listado de facturas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Facturas Recientes</span>
                </CardTitle>
                <CardDescription>
                  Últimas facturas emitidas y su estado actual
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semana">Esta semana</SelectItem>
                    <SelectItem value="mes">Este mes</SelectItem>
                    <SelectItem value="trimestre">Este trimestre</SelectItem>
                    <SelectItem value="año">Este año</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="borrador">Borrador</SelectItem>
                    <SelectItem value="emitida">Emitida</SelectItem>
                    <SelectItem value="pagada">Pagada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {facturasFiltradas.map((factura) => (
                <div
                  key={factura.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Receipt className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{factura.paciente_nombre}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(factura.fecha_creacion), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatMoneda(factura.total)}</p>
                      <p className="text-sm text-gray-500">{factura.servicios} servicios</p>
                    </div>
                    <Badge className={getEstadoBadge(factura.estado)}>
                      {factura.estado.charAt(0).toUpperCase() + factura.estado.slice(1)}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
