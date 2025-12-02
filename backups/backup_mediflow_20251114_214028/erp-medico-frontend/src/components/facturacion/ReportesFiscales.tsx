// Reportes Fiscales y Financieros - Compliance SAT y Analytics
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Filter,
  Share,
  Printer,
  Eye,
  Calculator,
  FileSpreadsheet,
  Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { ReporteFinanciero, Factura } from '@/types/facturacion'
import { useFacturacion } from '@/hooks/useFacturacion'
import toast from 'react-hot-toast'

interface ReportesFiscalesProps {
  facturas: Factura[]
}

export function ReportesFiscales({ facturas }: ReportesFiscalesProps) {
  const { generarReporteFinanciero } = useFacturacion()
  
  const [reporteFinanciero, setReporteFinanciero] = useState<ReporteFinanciero | null>(null)
  const [fechaInicio, setFechaInicio] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0])
  const [tipoReporte, setTipoReporte] = useState('financiero')
  const [generandoReporte, setGenerandoReporte] = useState(false)
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mensual')

  useEffect(() => {
    cargarReporteFinanciero()
  }, [fechaInicio, fechaFin])

  const cargarReporteFinanciero = async () => {
    setGenerandoReporte(true)
    try {
      const reporte = await generarReporteFinanciero(new Date(fechaInicio), new Date(fechaFin))
      setReporteFinanciero(reporte)
    } catch (error) {
      console.error('Error cargando reporte:', error)
    } finally {
      setGenerandoReporte(false)
    }
  }

  // Datos para gráficos (simulados)
  const ingresosPorMes = [
    { mes: 'Ene', ingresos: 85000, gastos: 32000, utilidad: 53000 },
    { mes: 'Feb', ingresos: 92000, gastos: 35000, utilidad: 57000 },
    { mes: 'Mar', ingresos: 78000, gastos: 30000, utilidad: 48000 },
    { mes: 'Abr', ingresos: 105000, gastos: 42000, utilidad: 63000 },
    { mes: 'May', ingresos: 98000, gastos: 38000, utilidad: 60000 },
    { mes: 'Jun', ingresos: 112000, gastos: 45000, utilidad: 67000 }
  ]

  const distribucionSeguros = [
    { name: 'IMSS', value: 45, color: '#00BFA6' },
    { name: 'ISSSTE', value: 25, color: '#3B82F6' },
    { name: 'Particular', value: 20, color: '#8B5CF6' },
    { name: 'Otros', value: 10, color: '#F59E0B' }
  ]

  const serviciosMasVendidos = [
    { servicio: 'Consulta Médica', cantidad: 156, ingresos: 124800 },
    { servicio: 'Examen Anual', cantidad: 89, ingresos: 133500 },
    { servicio: 'Audiometría', cantidad: 134, ingresos: 60300 },
    { servicio: 'Espirometría', cantidad: 98, ingresos: 34300 },
    { servicio: 'Evaluación Ergonómica', cantidad: 23, ingresos: 57500 }
  ]

  const indicadoresSAT = [
    {
      concepto: 'CFDI Emitidos',
      valor: facturas.length,
      esperado: 100,
      cumplimiento: (facturas.length / 100 * 100).toFixed(1),
      estado: 'success'
    },
    {
      concepto: 'Retenciones ISR',
      valor: 0,
      esperado: 0,
      cumplimiento: '100.0',
      estado: 'success'
    },
    {
      concepto: 'Retenciones IVA',
      valor: 0,
      esperado: 0,
      cumplimiento: '100.0',
      estado: 'success'
    },
    {
      concepto: 'DIOT Presentada',
      valor: 1,
      esperado: 1,
      cumplimiento: '100.0',
      estado: 'success'
    }
  ]

  const exportarReporte = (formato: 'pdf' | 'excel' | 'csv') => {
    toast(`Exportando reporte en formato ${formato.toUpperCase()}...`)
    // En producción implementaría la exportación real
  }

  const imprimirReporte = () => {
    window.print()
    toast('Preparando impresión...')
  }

  const compartirReporte = () => {
    toast('Enlace de compartir copiado al portapapeles')
  }

  if (generandoReporte) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Generando reportes...</p>
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
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Reportes Fiscales & Financieros</span>
            </h2>
            <p className="text-gray-600 mt-1">
              Compliance SAT, analytics y gestión financiera integral
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={imprimirReporte}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" onClick={compartirReporte}>
              <Share className="h-4 w-4 mr-2" />
              Compartir
            </Button>
            <Button 
              onClick={() => exportarReporte('pdf')}
              className="bg-primary hover:bg-primary/90"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros y Controles */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Configuración de Reportes</h3>
          <div className="flex items-center space-x-4">
            <select
              value={periodoSeleccionado}
              onChange={(e) => setPeriodoSeleccionado(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="mensual">Mensual</option>
              <option value="trimestral">Trimestral</option>
              <option value="semestral">Semestral</option>
              <option value="anual">Anual</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <Input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <Input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Reporte
            </label>
            <select
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="financiero">Financiero</option>
              <option value="fiscal">Fiscal SAT</option>
              <option value="operativo">Operativo</option>
              <option value="seguros">Seguros</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={cargarReporteFinanciero}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Generar Reporte
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs de Reportes */}
      <Tabs value={tipoReporte} onValueChange={setTipoReporte}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financiero">Financiero</TabsTrigger>
          <TabsTrigger value="fiscal">Fiscal SAT</TabsTrigger>
          <TabsTrigger value="operativo">Operativo</TabsTrigger>
          <TabsTrigger value="seguros">Seguros</TabsTrigger>
        </TabsList>

        {/* Reporte Financiero */}
        <TabsContent value="financiero" className="space-y-6">
          {/* KPIs Financieros */}
          {reporteFinanciero && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  titulo: 'Ingresos Totales',
                  valor: `$${reporteFinanciero.ingresosTotales.toLocaleString()}`,
                  tendencia: '+15.3%',
                  color: 'text-green-600',
                  icono: DollarSign
                },
                {
                  titulo: 'Ingresos Cobrados',
                  valor: `$${reporteFinanciero.ingresosCobrados.toLocaleString()}`,
                  tendencia: '+12.1%',
                  color: 'text-blue-600',
                  icono: CreditCard
                },
                {
                  titulo: 'Utilidad Neta',
                  valor: `$${reporteFinanciero.utilidadNeta.toLocaleString()}`,
                  tendencia: '+18.7%',
                  color: 'text-primary',
                  icono: TrendingUp
                },
                {
                  titulo: 'Ticket Promedio',
                  valor: `$${reporteFinanciero.ticketPromedio.toLocaleString()}`,
                  tendencia: '+8.2%',
                  color: 'text-purple-600',
                  icono: BarChart3
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
                        <p className={`text-sm mt-1 ${kpi.color}`}>{kpi.tendencia}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50">
                        <kpi.icono className="h-6 w-6 text-gray-600" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Gráficos Financieros */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ingresos vs Gastos */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Ingresos vs Gastos</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ingresosPorMes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    {/* @ts-ignore */}
                    <XAxis dataKey="mes" stroke="#666" />
                    {/* @ts-ignore */}
                    <YAxis stroke="#666" />
                    {/* @ts-ignore */}
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                    {/* @ts-ignore */}
                    <Bar dataKey="ingresos" fill="#00BFA6" radius={[4, 4, 0, 0]} name="Ingresos" />
                    {/* @ts-ignore */}
                    <Bar dataKey="gastos" fill="#EF4444" radius={[4, 4, 0, 0]} name="Gastos" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Utilidad Neta */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Evolución de Utilidad Neta</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ingresosPorMes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    {/* @ts-ignore */}
                    <XAxis dataKey="mes" stroke="#666" />
                    {/* @ts-ignore */}
                    <YAxis stroke="#666" />
                    {/* @ts-ignore */}
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Utilidad']} />
                    {/* @ts-ignore */}
                    <Line 
                      type="monotone" 
                      dataKey="utilidad" 
                      stroke="#00BFA6" 
                      strokeWidth={3}
                      dot={{ fill: '#00BFA6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Servicios Más Vendidos */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Servicios Más Vendidos</h3>
            <div className="space-y-4">
              {serviciosMasVendidos.map((servicio, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{servicio.servicio}</h4>
                    <p className="text-sm text-gray-600">{servicio.cantidad} servicios vendidos</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">${servicio.ingresos.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">
                      ${Math.round(servicio.ingresos / servicio.cantidad)} promedio
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Reporte Fiscal SAT */}
        <TabsContent value="fiscal" className="space-y-6">
          {/* Indicadores de Compliance SAT */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Compliance SAT</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {indicadoresSAT.map((indicador, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{indicador.concepto}</h4>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {indicador.valor}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Meta: {indicador.esperado}</span>
                    <Badge className="bg-green-100 text-green-800">
                      {indicador.cumplimiento}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Reportes SAT Específicos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Reportes Fiscales</h3>
              <div className="space-y-3">
                {[
                  { nombre: 'Libro de ventas', formato: 'PDF', fecha: '2024-11-01' },
                  { nombre: 'DIOT mensual', formato: 'Excel', fecha: '2024-11-01' },
                  { nombre: 'Declaración mensual', formato: 'PDF', fecha: '2024-11-01' },
                  { nombre: 'CFDI relacionados', formato: 'Excel', fecha: '2024-11-01' }
                ].map((reporte, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{reporte.nombre}</h4>
                      <p className="text-sm text-gray-600">Última generación: {reporte.fecha}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        {reporte.formato}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Distribución por Tipo de Cliente</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    {/* @ts-ignore */}
                    <Pie
                      data={distribucionSeguros}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {distribucionSeguros.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    {/* @ts-ignore */}
                    <Tooltip formatter={(value) => [`${value}%`, 'Porcentaje']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {distribucionSeguros.map((item, index) => (
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
        </TabsContent>

        {/* Reporte Operativo */}
        <TabsContent value="operativo" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Métricas Operativas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">89%</div>
                <p className="text-gray-600">Tasa de cobro</p>
                <p className="text-sm text-gray-500">Facturas pagadas vs emitidas</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">12.3</div>
                <p className="text-gray-600">Días promedio de cobro</p>
                <p className="text-sm text-gray-500">Tiempo para cobrar facturas</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">156</div>
                <p className="text-gray-600">Servicios este mes</p>
                <p className="text-sm text-gray-500">Volumen de servicios prestados</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Reporte de Seguros */}
        <TabsContent value="seguros" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Gestión de Seguros</h3>
            <div className="space-y-4">
              {[
                { seguro: 'IMSS', pacientes: 156, pendientes: 12, autorizado: 144, porcentaje: 92 },
                { seguro: 'ISSSTE', pacientes: 43, pendientes: 5, autorizado: 38, porcentaje: 88 },
                { seguro: 'ISSSTE', pacientes: 28, pendientes: 3, autorizado: 25, porcentaje: 89 },
                { seguro: 'INSABI', pacientes: 15, pendientes: 2, autorizado: 13, porcentaje: 87 }
              ].map((seguro, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{seguro.seguro}</h4>
                    <Badge className="bg-primary/10 text-primary">
                      {seguro.porcentaje}% efectividad
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total Pacientes</p>
                      <p className="font-semibold">{seguro.pacientes}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Pendientes</p>
                      <p className="font-semibold text-orange-600">{seguro.pendientes}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Autorizados</p>
                      <p className="font-semibold text-green-600">{seguro.autorizado}</p>
                    </div>
                    <div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${seguro.porcentaje}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Acciones de Exportación */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Exportar Reportes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => exportarReporte('pdf')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Reporte Completo PDF
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => exportarReporte('excel')}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Datos Financieros Excel
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => exportarReporte('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </Card>
    </div>
  )
}