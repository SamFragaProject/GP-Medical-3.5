// Sistema de Alertas de Vencimiento - Notificaciones automáticas
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  AlertTriangle, 
  Clock,
  Send,
  CheckCircle,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  Settings,
  TrendingUp,
  Filter,
  Search,
  Download,
  Eye,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { AlertaVencimiento, Factura, Cliente } from '@/types/facturacion'
import { useFacturacion } from '@/hooks/useFacturacion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

interface AlertasVencimientoProps {
  facturas: Factura[]
  clientes: Cliente[]
}

export function AlertasVencimiento({ facturas, clientes }: AlertasVencimientoProps) {
  const { alertasVencimiento } = useFacturacion()
  
  const [alertas, setAlertas] = useState<AlertaVencimiento[]>([])
  const [filtroUrgencia, setFiltroUrgencia] = useState<string>('todos')
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [busquedaTermino, setBusquedaTermino] = useState('')
  const [alertaSeleccionada, setAlertaSeleccionada] = useState<AlertaVencimiento | null>(null)
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false)
  const [enviandoNotificacion, setEnviandoNotificacion] = useState<string | null>(null)

  useEffect(() => {
    generarAlertas()
  }, [facturas])

  const generarAlertas = () => {
    const nuevasAlertas: AlertaVencimiento[] = []
    const hoy = new Date()

    facturas.forEach(factura => {
      if (factura.estado !== 'pagada' && factura.estado !== 'cancelada') {
        const diasVencimiento = Math.ceil((factura.fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
        
        // Solo generar alertas para facturas que vencen en los próximos 30 días o que ya vencieron
        if (diasVencimiento <= 30) {
          let nivelUrgencia: 'baja' | 'media' | 'alta' | 'critica'
          
          if (diasVencimiento < 0) {
            nivelUrgencia = 'critica'
          } else if (diasVencimiento <= 3) {
            nivelUrgencia = 'alta'
          } else if (diasVencimiento <= 7) {
            nivelUrgencia = 'media'
          } else {
            nivelUrgencia = 'baja'
          }

          nuevasAlertas.push({
            id: factura.id,
            facturaId: factura.id,
            diasRestantes: diasVencimiento,
            nivelUrgencia,
            mensaje: generarMensajeAlerta(factura, diasVencimiento),
            fechaLimite: factura.fechaVencimiento
          })
        }
      }
    })

    setAlertas(nuevasAlertas)
  }

  const generarMensajeAlerta = (factura: Factura, dias: number): string => {
    if (dias < 0) {
      return `Factura ${factura.folio} venció hace ${Math.abs(dias)} días`
    } else if (dias === 0) {
      return `Factura ${factura.folio} vence hoy`
    } else {
      return `Factura ${factura.folio} vence en ${dias} días`
    }
  }

  const enviarNotificacion = async (alerta: AlertaVencimiento, tipo: 'email' | 'sms' | 'ambos') => {
    setEnviandoNotificacion(alerta.id)
    
    try {
      // Simular envío de notificación
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success(`Notificación ${tipo === 'ambos' ? 'enviada' : 'por email'} enviada exitosamente`)
      
      // En producción aquí se integraría con el servicio de notificaciones
      
    } catch (error) {
      toast.error('Error al enviar la notificación')
    } finally {
      setEnviandoNotificacion(null)
    }
  }

  const marcarComoAtendida = (alertaId: string) => {
    setAlertas(prev => prev.filter(alerta => alerta.id !== alertaId))
    toast.success('Alerta marcada como atendida')
  }

  const enviarRecordatorioMasivo = async (tipo: 'email' | 'sms' | 'ambos') => {
    const alertasFiltradas = alertasFiltradasPorFiltros
    
    if (alertasFiltradas.length === 0) {
      toast.error('No hay alertas para enviar')
      return
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(`Recordatorios enviados a ${alertasFiltradas.length} facturas`)
    } catch (error) {
      toast.error('Error al enviar recordatorios')
    }
  }

  const alertasFiltradasPorFiltros = alertas.filter(alerta => {
    if (filtroUrgencia !== 'todos' && alerta.nivelUrgencia !== filtroUrgencia) return false
    if (busquedaTermino) {
      const factura = facturas.find(f => f.id === alerta.facturaId)
      const cliente = factura ? clientes.find(c => c.id === factura.cliente.id) : null
      if (!factura || !cliente) return false
      if (!factura.folio.toLowerCase().includes(busquedaTermino.toLowerCase()) &&
          !cliente.razonSocial.toLowerCase().includes(busquedaTermino.toLowerCase())) return false
    }
    return true
  })

  const obtenerIconoUrgencia = (nivel: string) => {
    switch (nivel) {
      case 'critica':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'alta':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'media':
        return <Bell className="h-4 w-4 text-yellow-500" />
      case 'baja':
        return <Bell className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const obtenerColorUrgencia = (nivel: string) => {
    switch (nivel) {
      case 'critica':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'alta':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'baja':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Estadísticas para dashboard
  const estadisticasAlertas = {
    total: alertas.length,
    criticas: alertas.filter(a => a.nivelUrgencia === 'critica').length,
    altas: alertas.filter(a => a.nivelUrgencia === 'alta').length,
    medias: alertas.filter(a => a.nivelUrgencia === 'media').length,
    bajas: alertas.filter(a => a.nivelUrgencia === 'baja').length,
    totalVencido: alertas.filter(a => a.diasRestantes < 0).length
  }

  const datosGrafico = [
    { nivel: 'Críticas', cantidad: estadisticasAlertas.criticas },
    { nivel: 'Altas', cantidad: estadisticasAlertas.altas },
    { nivel: 'Medias', cantidad: estadisticasAlertas.medias },
    { nivel: 'Bajas', cantidad: estadisticasAlertas.bajas }
  ]

  const configuracionAlertas = {
    diasAnticipacion: 7,
    horariosEnvio: ['09:00', '15:00'],
    metodosNotificacion: ['email', 'sms'],
    plantillasPersonalizadas: true,
    recordatorioAutomatico: true
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Bell className="h-5 w-5 text-primary" />
              <span>Alertas de Vencimiento</span>
            </h2>
            <p className="text-gray-600 mt-1">
              Notificaciones automáticas de facturas por vencer
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setMostrarConfiguracion(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Reporte
            </Button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            titulo: 'Total Alertas',
            valor: estadisticasAlertas.total,
            icono: Bell,
            color: 'bg-primary',
            descripcion: 'facturas monitoreadas'
          },
          {
            titulo: 'Críticas',
            valor: estadisticasAlertas.criticas,
            icono: AlertTriangle,
            color: 'bg-red-500',
            descripcion: 'vencidas'
          },
          {
            titulo: 'Altas',
            valor: estadisticasAlertas.altas,
            icono: Clock,
            color: 'bg-orange-500',
            descripcion: 'por vencer'
          },
          {
            titulo: 'Recordatorios',
            valor: estadisticasAlertas.total - estadisticasAlertas.criticas,
            icono: Send,
            color: 'bg-blue-500',
            descripcion: 'enviados hoy'
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
                  <p className="text-sm text-gray-500 mt-1">{stat.descripcion}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icono className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="alertas" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alertas">Alertas Activas</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
          <TabsTrigger value="configuracion">Configuración</TabsTrigger>
        </TabsList>

        {/* Alertas Activas */}
        <TabsContent value="alertas" className="space-y-6">
          {/* Controles de Filtro */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filtrar Alertas</h3>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => enviarRecordatorioMasivo('email')}
                  disabled={alertasFiltradasPorFiltros.length === 0}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Masivo
                </Button>
                <Button
                  variant="outline"
                  onClick={() => enviarRecordatorioMasivo('sms')}
                  disabled={alertasFiltradasPorFiltros.length === 0}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  SMS Masivo
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel de Urgencia
                </label>
                <select
                  value={filtroUrgencia}
                  onChange={(e) => setFiltroUrgencia(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="todos">Todos los niveles</option>
                  <option value="critica">Críticas</option>
                  <option value="alta">Altas</option>
                  <option value="media">Medias</option>
                  <option value="baja">Bajas</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="todos">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="vencida">Vencida</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={busquedaTermino}
                    onChange={(e) => setBusquedaTermino(e.target.value)}
                    placeholder="Folio o cliente..."
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Lista de Alertas */}
          {alertasFiltradasPorFiltros.length === 0 ? (
            <Card className="p-6">
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">¡Excelente! No hay alertas pendientes</p>
                <p className="text-sm text-gray-500">
                  Todas las facturas están al día o no requieren atención inmediata
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {alertasFiltradasPorFiltros.map((alerta, index) => {
                const factura = facturas.find(f => f.id === alerta.facturaId)
                const cliente = factura ? clientes.find(c => c.id === factura.cliente.id) : null
                
                if (!factura || !cliente) return null

                return (
                  <motion.div
                    key={alerta.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {obtenerIconoUrgencia(alerta.nivelUrgencia)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{factura.folio}</h4>
                              <Badge className={obtenerColorUrgencia(alerta.nivelUrgencia)}>
                                {alerta.nivelUrgencia}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <span>Cliente: {cliente.razonSocial}</span>
                              <span>Monto: ${factura.total.toLocaleString()}</span>
                              <span>Vence: {factura.fechaVencimiento.toLocaleDateString('es-MX')}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{alerta.mensaje}</p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setAlertaSeleccionada(alerta)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => enviarNotificacion(alerta, 'email')}
                            disabled={enviandoNotificacion === alerta.id}
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Email
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => enviarNotificacion(alerta, 'sms')}
                            disabled={enviandoNotificacion === alerta.id}
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            SMS
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => marcarComoAtendida(alerta.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Atendida
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Historial */}
        <TabsContent value="historial" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Historial de Alertas</h3>
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Historial de alertas enviadas</p>
              <p className="text-sm text-gray-500">
                El historial detallado estará disponible próximamente
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Configuración */}
        <TabsContent value="configuracion" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Configuración de Alertas</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Días de anticipación
                  </label>
                  <Input
                    type="number"
                    value={configuracionAlertas.diasAnticipacion}
                    readOnly
                    className="w-24"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Métodos de notificación
                  </label>
                  <div className="space-y-2">
                    {configuracionAlertas.metodosNotificacion.map((metodo, index) => (
                      <label key={index} className="flex items-center space-x-2">
                        <input type="checkbox" checked readOnly className="rounded" />
                        <span className="text-sm capitalize">{metodo}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horarios de envío
                  </label>
                  <div className="space-y-1">
                    {configuracionAlertas.horariosEnvio.map((hora, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {hora}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Distribución de Alertas</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    {/* @ts-ignore */}
                    <XAxis dataKey="nivel" stroke="#666" />
                    {/* @ts-ignore */}
                    <YAxis stroke="#666" />
                    {/* @ts-ignore */}
                    <Tooltip />
                    {/* @ts-ignore */}
                    <Bar dataKey="cantidad" fill="#00BFA6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Configuración */}
      <Dialog open={mostrarConfiguracion} onOpenChange={setMostrarConfiguracion}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configuración de Alertas</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Configuración General</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Días de anticipación
                    </label>
                    <Input type="number" defaultValue="7" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora de envío principal
                    </label>
                    <Input type="time" defaultValue="09:00" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora de envío secundario
                    </label>
                    <Input type="time" defaultValue="15:00" />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Métodos de Notificación</h4>
                <div className="space-y-3">
                  {[
                    { name: 'email', label: 'Email' },
                    { name: 'sms', label: 'SMS' },
                    { name: 'whatsapp', label: 'WhatsApp' },
                    { name: 'push', label: 'Notificación Push' }
                  ].map((metodo) => (
                    <label key={metodo.name} className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked={metodo.name === 'email'} />
                      <span className="text-sm">{metodo.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  toast.success('Configuración guardada')
                  setMostrarConfiguracion(false)
                }}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Guardar Configuración
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

      {/* Modal de Detalle de Alerta */}
      <Dialog open={!!alertaSeleccionada} onOpenChange={() => setAlertaSeleccionada(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Alerta</DialogTitle>
          </DialogHeader>
          
          {alertaSeleccionada && (
            (() => {
              const factura = facturas.find(f => f.id === alertaSeleccionada.facturaId)
              const cliente = factura ? clientes.find(c => c.id === factura.cliente.id) : null
              
              if (!factura || !cliente) return null
              
              return (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Folio:</span>
                        <span className="font-medium">{factura.folio}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cliente:</span>
                        <span className="font-medium">{cliente.razonSocial}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monto:</span>
                        <span className="font-medium">${factura.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fecha de vencimiento:</span>
                        <span className="font-medium">{factura.fechaVencimiento.toLocaleDateString('es-MX')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nivel de urgencia:</span>
                        <Badge className={obtenerColorUrgencia(alertaSeleccionada.nivelUrgencia)}>
                          {alertaSeleccionada.nivelUrgencia}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => {
                        enviarNotificacion(alertaSeleccionada, 'email')
                        setAlertaSeleccionada(null)
                      }}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar Email
                    </Button>
                    <DialogClose asChild>
                      <Button
                        variant="outline"
                        className="flex-1"
                      >
                        Cerrar
                      </Button>
                    </DialogClose>
                  </div>
                </div>
              )
            })()
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}