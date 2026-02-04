// Gestión de Seguros - Integración IMSS/ISSSTE y procesamiento automático
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Plus, 
  Search, 
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Upload,
  FileText,
  CreditCard,
  Building2,
  User,
  Calendar,
  DollarSign,
  Stethoscope,
  Send,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { Seguro, Cliente, ServicioMedico } from '@/types/facturacion'
import { useFacturacion } from '@/hooks/useFacturacion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import toast from 'react-hot-toast'

interface GestionSegurosProps {
  cliente: Cliente | null
  servicios: ServicioMedico[]
  onProcesarConSeguro: (seguroId: string, servicios: string[], datos: any) => void
}

export function GestionSeguros({ cliente, servicios, onProcesarConSeguro }: GestionSegurosProps) {
  const { seguros, procesarConSeguro } = useFacturacion()
  
  const [seguroSeleccionado, setSeguroSeleccionado] = useState<string>('')
  const [serviciosParaSeguro, setServiciosParaSeguro] = useState<string[]>([])
  const [mostrarPreautorizacion, setMostrarPreautorizacion] = useState(false)
  const [mostrarResumen, setMostrarResumen] = useState(false)
  const [datosPaciente, setDatosPaciente] = useState({
    nombre: '',
    numSeguridad: '',
    numeroFamiliar: '',
    fechaNacimiento: '',
    parentesco: 'titular'
  })

  const [estadosSeguros, setEstadosSeguros] = useState<any[]>([])

  useEffect(() => {
    // Simular estados de seguros para el dashboard
    const estados = [
      {
        id: '1',
        seguro: 'IMSS',
        totalPacientes: 156,
        autorizados: 144,
        pendientes: 12,
        rechazados: 0,
        montoTotal: 115200,
        montoPagado: 108000
      },
      {
        id: '2',
        seguro: 'ISSSTE',
        totalPacientes: 43,
        autorizados: 38,
        pendientes: 5,
        rechazados: 0,
        montoTotal: 32250,
        montoPagado: 28500
      },
      {
        id: '3',
        seguro: 'ISSSTE',
        totalPacientes: 28,
        autorizados: 25,
        pendientes: 2,
        rechazados: 1,
        montoTotal: 21000,
        montoPagado: 18750
      }
    ]
    setEstadosSeguros(estados)
  }, [seguros])

  const datosGrafico = [
    { seguro: 'IMSS', autorizados: 144, pendientes: 12 },
    { seguro: 'ISSSTE', autorizados: 38, pendientes: 5 },
    { seguro: 'ISSSTE', autorizados: 25, pendientes: 2 }
  ]

  const distribucionEstados = [
    { name: 'Autorizados', value: 207, color: '#10B981' },
    { name: 'Pendientes', value: 19, color: '#F59E0B' },
    { name: 'Rechazados', value: 1, color: '#EF4444' }
  ]

  const procesarConSeguros = async () => {
    if (!seguroSeleccionado || serviciosParaSeguro.length === 0) {
      toast.error('Selecciona un seguro y al menos un servicio')
      return
    }

    try {
      setMostrarResumen(true)
      const resultado = await procesarConSeguro(seguroSeleccionado, serviciosParaSeguro, datosPaciente)
      
      // Simular proceso de autorización
      if (seguros.find(s => s.id === seguroSeleccionado)?.configuracion.requierePreautorizacion) {
        setMostrarPreautorizacion(true)
      }
      
    } catch (error) {
      toast.error('Error al procesar con seguro')
    }
  }

  const generarPreautorizacion = () => {
    toast('Generando solicitud de preautorización...')
    // Simular envío de preautorización
    setTimeout(() => {
      toast.success('Solicitud de preautorización enviada')
      setMostrarPreautorizacion(false)
    }, 2000)
  }

  const obtenerColorSeguro = (tipo: string) => {
    switch (tipo) {
      case 'IMSS':
        return 'bg-green-500'
      case 'ISSSTE':
        return 'bg-blue-500'
      case 'PEMEX':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>Gestión de Seguros</span>
            </h2>
            <p className="text-gray-600 mt-1">
              Integración IMSS/ISSSTE y procesamiento automático
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Importar Datos
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Reportes
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="procesamiento">Procesamiento</TabsTrigger>
          <TabsTrigger value="autorizaciones">Autorizaciones</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
        </TabsList>

        {/* Dashboard de Seguros */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Estadísticas Generales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                titulo: 'Total Pacientes',
                valor: '227',
                icono: User,
                color: 'bg-blue-500',
                tendencia: '+12%'
              },
              {
                titulo: 'Autorizados',
                valor: '207',
                icono: CheckCircle,
                color: 'bg-green-500',
                tendencia: '+8%'
              },
              {
                titulo: 'Pendientes',
                valor: '19',
                icono: Clock,
                color: 'bg-yellow-500',
                tendencia: '-15%'
              },
              {
                titulo: 'Monto Pagado',
                valor: '$155,250',
                icono: DollarSign,
                color: 'bg-primary',
                tendencia: '+18%'
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.titulo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.titulo}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.valor}</p>
                      <p className="text-sm text-green-600 mt-1">{stat.tendencia}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <stat.icono className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Gráficos de Seguros */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Estado por Seguro */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Estado por Seguro</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    {/* @ts-ignore */}
                    <XAxis dataKey="seguro" stroke="#666" />
                    {/* @ts-ignore */}
                    <YAxis stroke="#666" />
                    {/* @ts-ignore */}
                    <Tooltip />
                    {/* @ts-ignore */}
                    <Bar dataKey="autorizados" fill="#10B981" radius={[4, 4, 0, 0]} name="Autorizados" />
                    {/* @ts-ignore */}
                    <Bar dataKey="pendientes" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Pendientes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Distribución de Estados */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Distribución General</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    {/* @ts-ignore */}
                    <Pie
                      data={distribucionEstados}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {distribucionEstados.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    {/* @ts-ignore */}
                    <Tooltip formatter={(value) => [`${value}`, 'Casos']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {distribucionEstados.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Lista de Seguros */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Estado por Institución</h3>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </div>
            <div className="space-y-4">
              {estadosSeguros.map((estado) => (
                <div key={estado.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${obtenerColorSeguro(estado.seguro)}`}></div>
                      <h4 className="font-semibold text-gray-900">{estado.seguro}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        ${estado.montoPagado.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        de ${estado.montoTotal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{estado.totalPacientes}</p>
                      <p className="text-sm text-gray-600">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{estado.autorizados}</p>
                      <p className="text-sm text-gray-600">Autorizados</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{estado.pendientes}</p>
                      <p className="text-sm text-gray-600">Pendientes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{estado.rechazados}</p>
                      <p className="text-sm text-gray-600">Rechazados</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(estado.autorizados / estado.totalPacientes) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      Ver Detalles
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Descargar Reporte
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Procesamiento de Seguros */}
        <TabsContent value="procesamiento" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulario de Procesamiento */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Procesar con Seguro</h3>
              
              {cliente ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">Cliente: {cliente.razonSocial}</h4>
                    <p className="text-sm text-gray-600">RFC: {cliente.rfc}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institución de Seguro
                    </label>
                    <select
                      value={seguroSeleccionado}
                      onChange={(e) => setSeguroSeleccionado(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">Seleccionar seguro...</option>
                      {seguros.map((seguro) => (
                        <option key={seguro.id} value={seguro.id}>
                          {seguro.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Servicios a Procesar
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                      {servicios.map((servicio) => (
                        <label key={servicio.id} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={serviciosParaSeguro.includes(servicio.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setServiciosParaSeguro(prev => [...prev, servicio.id])
                              } else {
                                setServiciosParaSeguro(prev => prev.filter(id => id !== servicio.id))
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{servicio.nombre}</p>
                            <p className="text-xs text-gray-500">${servicio.precio} + IVA ${servicio.impuestos}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de Seguridad Social
                      </label>
                      <Input
                        value={datosPaciente.numSeguridad}
                        onChange={(e) => setDatosPaciente(prev => ({ ...prev, numSeguridad: e.target.value }))}
                        placeholder="12345678901"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número Familiar
                      </label>
                      <Input
                        value={datosPaciente.numeroFamiliar}
                        onChange={(e) => setDatosPaciente(prev => ({ ...prev, numeroFamiliar: e.target.value }))}
                        placeholder="1234567"
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={procesarConSeguros}
                    disabled={!seguroSeleccionado || serviciosParaSeguro.length === 0}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Procesar Solicitud
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Selecciona un cliente para procesar seguros</p>
                </div>
              )}
            </Card>

            {/* Información del Seguro */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Información del Seguro</h3>
              
              {seguroSeleccionado && (
                (() => {
                  const seguro = seguros.find(s => s.id === seguroSeleccionado)
                  if (!seguro) return null
                  
                  return (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-4 h-4 rounded-full ${obtenerColorSeguro(seguro.tipo)}`}></div>
                          <h4 className="font-semibold text-gray-900">{seguro.nombre}</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Cobertura:</p>
                            <p className="font-medium">{seguro.configuracion.cobertura}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Copago:</p>
                            <p className="font-medium">${seguro.configuracion.copago}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Preautorización:</p>
                            <Badge className={seguro.configuracion.requierePreautorizacion ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                              {seguro.configuracion.requierePreautorizacion ? 'Requerida' : 'No requerida'}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-gray-600">Días autorización:</p>
                            <p className="font-medium">{seguro.configuracion.diasPreautorizacion} días</p>
                          </div>
                        </div>
                      </div>
                      
                      {seguro.configuracion.requierePreautorizacion && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            <h4 className="font-medium text-yellow-800">Preautorización Requerida</h4>
                          </div>
                          <p className="text-sm text-yellow-700">
                            Este seguro requiere preautorización. El proceso puede tomar {seguro.configuracion.diasPreautorizacion} días hábiles.
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })()
              )}
              
              {!seguroSeleccionado && (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Selecciona un seguro para ver detalles</p>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* Autorizaciones */}
        <TabsContent value="autorizaciones" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Solicitudes de Autorización</h3>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </div>
            
            <div className="space-y-4">
              {[
                {
                  id: '1',
                  paciente: 'Juan Pérez García',
                  seguro: 'IMSS',
                  servicio: 'Examen Médico Anual',
                  fecha: '2024-11-01',
                  estado: 'pendiente',
                  numero: 'AUT-2024-001'
                },
                {
                  id: '2',
                  paciente: 'María López Hernández',
                  seguro: 'ISSSTE',
                  servicio: 'Consulta Médica',
                  fecha: '2024-10-31',
                  estado: 'autorizado',
                  numero: 'AUT-2024-002'
                },
                {
                  id: '3',
                  paciente: 'Carlos Rodríguez',
                  seguro: 'ISSSTE',
                  servicio: 'Audiometría',
                  fecha: '2024-10-30',
                  estado: 'rechazado',
                  numero: 'AUT-2024-003'
                }
              ].map((solicitud) => (
                <div key={solicitud.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">{solicitud.paciente}</h4>
                        <Badge className={`${
                          solicitud.estado === 'autorizado' ? 'bg-green-100 text-green-800' :
                          solicitud.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {solicitud.estado}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{solicitud.seguro}</span>
                        <span>•</span>
                        <span>{solicitud.servicio}</span>
                        <span>•</span>
                        <span>{solicitud.fecha}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Folio: {solicitud.numero}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      {solicitud.estado === 'pendiente' && (
                        <Button size="sm" variant="outline">
                          <Send className="h-3 w-3 mr-1" />
                          Reenviar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Reportes */}
        <TabsContent value="reportes" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Reportes de Seguros</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  titulo: 'Reporte Mensual IMSS',
                  descripcion: 'Resumen completo de pacientes IMSS del mes',
                  icono: FileText,
                  formato: 'PDF'
                },
                {
                  titulo: 'Reporte ISSSTE',
                  descripcion: 'Estados de cuenta y autorizaciones ISSSTE',
                  icono: Download,
                  formato: 'Excel'
                },
                {
                  titulo: 'Corte de Pagos',
                  descripcion: 'Consolidado de pagos por institución',
                  icono: CreditCard,
                  formato: 'PDF'
                }
              ].map((reporte, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <reporte.icono className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{reporte.titulo}</h4>
                      <Badge className="bg-gray-100 text-gray-800 mt-1">{reporte.formato}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{reporte.descripcion}</p>
                  <Button size="sm" variant="outline" className="w-full">
                    <Download className="h-3 w-3 mr-2" />
                    Descargar
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Preautorización */}
      <Dialog open={mostrarPreautorizacion} onOpenChange={setMostrarPreautorizacion}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>Solicitud de Preautorización</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800">Preautorización Requerida</span>
              </div>
              <p className="text-sm text-yellow-700">
                Esta solicitud requiere autorización previa del seguro. El tiempo de respuesta estimado es de 5 días hábiles.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Resumen de la Solicitud</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Paciente:</span>
                  <span className="font-medium">{datosPaciente.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">NSS:</span>
                  <span className="font-medium">{datosPaciente.numSeguridad}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Servicios:</span>
                  <span className="font-medium">{serviciosParaSeguro.length} seleccionados</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={generarPreautorizacion}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar Solicitud
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

      {/* Modal de Resumen */}
      <Dialog open={mostrarResumen} onOpenChange={setMostrarResumen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Procesamiento Completado</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Solicitud Procesada</h4>
              <p className="text-sm text-green-700">
                Los servicios han sido procesados exitosamente con el seguro seleccionado.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Servicios procesados:</span>
                <span className="font-medium">{serviciosParaSeguro.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Seguro aplicado:</span>
                <span className="font-medium">
                  {seguros.find(s => s.id === seguroSeleccionado)?.nombre}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cobertura:</span>
                <span className="font-medium">
                  {seguros.find(s => s.id === seguroSeleccionado)?.configuracion.cobertura}%
                </span>
              </div>
            </div>

            <DialogClose asChild>
              <Button 
                onClick={() => setMostrarResumen(false)}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Continuar
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
