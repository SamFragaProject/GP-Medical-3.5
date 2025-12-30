// Estados de Cuenta - Historial completo por cliente
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Download, 
  Send,
  Calendar,
  DollarSign,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Plus,
  Eye,
  Printer,
  Mail,
  Phone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { EstadoCuenta, MovimientoEstadoCuenta, Factura, Pago, NotaCredito, Cliente } from '@/types/facturacion'
import { useFacturacion } from '@/hooks/useFacturacion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import toast from 'react-hot-toast'

interface EstadosCuentaProps {
  cliente: Cliente | null
  facturas: Factura[]
  pagos: any[]
  notasCredito: any[]
}

export function EstadosCuenta({ cliente, facturas, pagos, notasCredito }: EstadosCuentaProps) {
  const { clientes } = useFacturacion()
  
  const [estadoCuenta, setEstadoCuenta] = useState<EstadoCuenta | null>(null)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>('')
  const [fechaInicio, setFechaInicio] = useState(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0])
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [mostrarDetalle, setMostrarDetalle] = useState(false)
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<MovimientoEstadoCuenta | null>(null)

  useEffect(() => {
    if (clienteSeleccionado) {
      cargarEstadoCuenta()
    }
  }, [clienteSeleccionado, fechaInicio, fechaFin, facturas, pagos])

  const cargarEstadoCuenta = () => {
    const clienteData = clientes.find(c => c.id === clienteSeleccionado)
    if (!clienteData) return

    // Filtrar datos por cliente y período
    const facturasCliente = facturas.filter(f => 
      f.cliente.id === clienteSeleccionado &&
      f.fechaEmision >= new Date(fechaInicio) &&
      f.fechaEmision <= new Date(fechaFin)
    )

    const pagosCliente = pagos.filter(p => {
      const factura = facturas.find(f => f.id === p.facturaId)
      return factura && factura.cliente.id === clienteSeleccionado
    })

    // Generar movimientos del estado de cuenta
    const movimientos: MovimientoEstadoCuenta[] = []
    let saldoAcumulado = 0

    // Agregar facturas como cargos
    facturasCliente.forEach(factura => {
      saldoAcumulado += factura.total
      movimientos.push({
        fecha: factura.fechaEmision,
        concepto: `FACTURA ${factura.folio}`,
        cargo: factura.total,
        abono: 0,
        saldo: saldoAcumulado
      })
    })

    // Agregar pagos como abonos
    pagosCliente.forEach(pago => {
      saldoAcumulado -= pago.monto
      movimientos.push({
        fecha: pago.fechaPago,
        concepto: `PAGO - ${pago.metodoPago}`,
        cargo: 0,
        abono: pago.monto,
        saldo: saldoAcumulado
      })
    })

    // Ordenar por fecha
    movimientos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime())

    const estado: EstadoCuenta = {
      clienteId: clienteSeleccionado,
      cliente: clienteData,
      saldoActual: saldoAcumulado,
      limiteCredito: clienteData.limiteCredito || 100000,
      facturas: facturasCliente,
      notasCredito: notasCredito.filter(nc => nc.cliente.id === clienteSeleccionado),
      pagos: pagosCliente,
      movimientos
    }

    setEstadoCuenta(estado)
  }

  const exportarEstadoCuenta = (formato: 'pdf' | 'email' | 'imprimir') => {
    if (!estadoCuenta) return

    switch (formato) {
      case 'pdf':
        toast('Generando estado de cuenta en PDF...')
        break
      case 'email':
        toast('Enviando estado de cuenta por email...')
        break
      case 'imprimir':
        window.print()
        break
    }
  }

  const enviarRecordatorio = () => {
    toast('Recordatorio de pago enviado por email')
  }

  const obtenerEstadoSaldo = () => {
    if (!estadoCuenta) return 'sin-datos'
    
    const porcentajeUso = (estadoCuenta.saldoActual / estadoCuenta.limiteCredito) * 100
    
    if (porcentajeUso > 90) return 'critico'
    if (porcentajeUso > 70) return 'alto'
    if (porcentajeUso > 50) return 'medio'
    return 'bajo'
  }

  const datosGraficoSaldo = estadoCuenta ? [
    { mes: 'Ene', saldo: 25000 },
    { mes: 'Feb', saldo: 18000 },
    { mes: 'Mar', saldo: 32000 },
    { mes: 'Abr', saldo: 15000 },
    { mes: 'May', saldo: 28000 },
    { mes: 'Jun', saldo: estadoCuenta.saldoActual }
  ] : []

  const movimientosFiltrados = estadoCuenta ? estadoCuenta.movimientos.filter(mov => {
    if (filtroEstado === 'cargo' && mov.cargo === 0) return false
    if (filtroEstado === 'abono' && mov.abono === 0) return false
    return true
  }) : []

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'sin-datos': return 'bg-gray-100 text-gray-800'
      case 'bajo': return 'bg-green-100 text-green-800'
      case 'medio': return 'bg-yellow-100 text-yellow-800'
      case 'alto': return 'bg-orange-100 text-orange-800'
      case 'critico': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Estados de Cuenta</span>
            </h2>
            <p className="text-gray-600 mt-1">
              Historial completo de movimientos por cliente
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => exportarEstadoCuenta('imprimir')}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" onClick={() => exportarEstadoCuenta('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              Descargar PDF
            </Button>
            <Button onClick={() => exportarEstadoCuenta('email')} className="bg-primary hover:bg-primary/90">
              <Send className="h-4 w-4 mr-2" />
              Enviar por Email
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente
            </label>
            <select
              value={clienteSeleccionado}
              onChange={(e) => setClienteSeleccionado(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Seleccionar cliente...</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.razonSocial}
                </option>
              ))}
            </select>
          </div>
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
              Tipo de Movimiento
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="todos">Todos</option>
              <option value="cargo">Solo Cargos</option>
              <option value="abono">Solo Abonos</option>
            </select>
          </div>
        </div>
      </Card>

      {estadoCuenta ? (
        <>
          {/* Resumen del Estado de Cuenta */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Saldo Actual</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      ${estadoCuenta.saldoActual.toLocaleString()}
                    </p>
                    <Badge className={`mt-2 ${obtenerColorEstado(obtenerEstadoSaldo())}`}>
                      {obtenerEstadoSaldo() === 'sin-datos' ? 'Sin datos' :
                       obtenerEstadoSaldo() === 'bajo' ? 'Bajo' :
                       obtenerEstadoSaldo() === 'medio' ? 'Medio' :
                       obtenerEstadoSaldo() === 'alto' ? 'Alto' : 'Crítico'}
                    </Badge>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Límite de Crédito</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      ${estadoCuenta.limiteCredito.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {Math.round((estadoCuenta.saldoActual / estadoCuenta.limiteCredito) * 100)}% utilizado
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Facturas</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {estadoCuenta.facturas.length}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      ${estadoCuenta.facturas.reduce((sum, f) => sum + f.total, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pagos Recibidos</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {estadoCuenta.pagos.length}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      ${estadoCuenta.pagos.reduce((sum, p) => sum + p.monto, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-500">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Información del Cliente */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {estadoCuenta.cliente.razonSocial}
                </h3>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>RFC: {estadoCuenta.cliente.rfc}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{estadoCuenta.cliente.email}</span>
                  </div>
                  {estadoCuenta.cliente.telefono && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{estadoCuenta.cliente.telefono}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={enviarRecordatorio}>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Recordatorio
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalle
                </Button>
              </div>
            </div>
          </Card>

          {/* Tabs de Contenido */}
          <Tabs defaultValue="movimientos" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
              <TabsTrigger value="facturas">Facturas</TabsTrigger>
              <TabsTrigger value="analisis">Análisis</TabsTrigger>
            </TabsList>

            {/* Movimientos */}
            <TabsContent value="movimientos">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Historial de Movimientos</h3>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar movimientos..."
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtrar
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Fecha</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Concepto</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Cargo</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Abono</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimientosFiltrados.map((movimiento, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setMovimientoSeleccionado(movimiento)
                            setMostrarDetalle(true)
                          }}
                        >
                          <td className="py-3 px-4">
                            {movimiento.fecha.toLocaleDateString('es-MX')}
                          </td>
                          <td className="py-3 px-4">
                            {movimiento.concepto}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {movimiento.cargo > 0 && (
                              <span className="text-red-600 font-medium">
                                ${movimiento.cargo.toLocaleString()}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {movimiento.abono > 0 && (
                              <span className="text-green-600 font-medium">
                                ${movimiento.abono.toLocaleString()}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            ${movimiento.saldo.toLocaleString()}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* Facturas */}
            <TabsContent value="facturas">
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Facturas del Cliente</h3>
                <div className="space-y-4">
                  {estadoCuenta.facturas.map((factura) => (
                    <div key={factura.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{factura.folio}</h4>
                            <Badge className={`${
                              factura.estado === 'pagada' ? 'bg-green-100 text-green-800' :
                              factura.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {factura.estado}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Emisión: {factura.fechaEmision.toLocaleDateString('es-MX')}</span>
                            <span>Vencimiento: {factura.fechaVencimiento.toLocaleDateString('es-MX')}</span>
                            <span>{factura.servicios.length} servicios</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ${factura.total.toLocaleString()}
                          </p>
                          <div className="flex space-x-2 mt-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3 mr-1" />
                              PDF
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Análisis */}
            <TabsContent value="analisis">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Evolución del Saldo</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={datosGraficoSaldo}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        {/* @ts-ignore */}
                        <XAxis dataKey="mes" stroke="#666" />
                        {/* @ts-ignore */}
                        <YAxis stroke="#666" />
                        {/* @ts-ignore */}
                        <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Saldo']} />
                        {/* @ts-ignore */}
                        <Line 
                          type="monotone" 
                          dataKey="saldo" 
                          stroke="#00BFA6" 
                          strokeWidth={3}
                          dot={{ fill: '#00BFA6', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Resumen del Período</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total facturación:</span>
                      <span className="font-semibold text-lg">
                        ${estadoCuenta.facturas.reduce((sum, f) => sum + f.total, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total pagos:</span>
                      <span className="font-semibold text-lg text-green-600">
                        ${estadoCuenta.pagos.reduce((sum, p) => sum + p.monto, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Saldo actual:</span>
                      <span className={`font-bold text-lg ${
                        estadoCuenta.saldoActual > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        ${estadoCuenta.saldoActual.toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 font-semibold">Ticket promedio:</span>
                        <span className="font-bold text-primary">
                          ${Math.round(estadoCuenta.facturas.reduce((sum, f) => sum + f.total, 0) / estadoCuenta.facturas.length || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card className="p-6">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Selecciona un cliente para ver su estado de cuenta</p>
            <p className="text-sm text-gray-500">
              El historial de movimientos y análisis financiero aparecerán aquí
            </p>
          </div>
        </Card>
      )}

      {/* Modal de Detalle de Movimiento */}
      <Dialog open={mostrarDetalle} onOpenChange={setMostrarDetalle}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle del Movimiento</DialogTitle>
          </DialogHeader>
          
          {movimientoSeleccionado && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="font-medium">
                      {movimientoSeleccionado.fecha.toLocaleDateString('es-MX')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Concepto:</span>
                    <span className="font-medium">{movimientoSeleccionado.concepto}</span>
                  </div>
                  {movimientoSeleccionado.cargo > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cargo:</span>
                      <span className="font-medium text-red-600">
                        ${movimientoSeleccionado.cargo.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {movimientoSeleccionado.abono > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Abono:</span>
                      <span className="font-medium text-green-600">
                        ${movimientoSeleccionado.abono.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saldo resultante:</span>
                    <span className="font-bold">
                      ${movimientoSeleccionado.saldo.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <DialogClose asChild>
                <Button 
                  onClick={() => setMostrarDetalle(false)}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Cerrar
                </Button>
              </DialogClose>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}