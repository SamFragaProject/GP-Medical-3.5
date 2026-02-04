// Portal de Pagos para empresas - Sistema de cobro en línea
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CreditCard, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Download,
  Send,
  FileText,
  Smartphone,
  Building2,
  DollarSign,
  Calendar,
  CreditCard as CardIcon,
  Receipt
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { Cliente, Factura, Pago } from '@/types/facturacion'
import { useFacturacion } from '@/hooks/useFacturacion'
import toast from 'react-hot-toast'

interface PortalPagosProps {
  cliente: Cliente
}

export function PortalPagos({ cliente }: PortalPagosProps) {
  const { facturas, procesarPago } = useFacturacion()
  
  const [facturasPendientes, setFacturasPendientes] = useState<Factura[]>([])
  const [facturasSeleccionadas, setFacturasSeleccionadas] = useState<string[]>([])
  const [metodoPago, setMetodoPago] = useState('TRANSFERENCIA')
  const [referenciaPago, setReferenciaPago] = useState('')
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [pagoEnProceso, setPagoEnProceso] = useState(false)

  useEffect(() => {
    // Filtrar facturas del cliente que están pendientes
    const pendientes = facturas.filter(f => 
      f.cliente.id === cliente.id && 
      (f.estado === 'pendiente' || f.estado === 'vencida')
    )
    setFacturasPendientes(pendientes)
  }, [facturas, cliente.id])

  const toggleSeleccionFactura = (facturaId: string) => {
    setFacturasSeleccionadas(prev => 
      prev.includes(facturaId)
        ? prev.filter(id => id !== facturaId)
        : [...prev, facturaId]
    )
  }

  const seleccionarTodas = () => {
    if (facturasSeleccionadas.length === facturasPendientes.length) {
      setFacturasSeleccionadas([])
    } else {
      setFacturasSeleccionadas(facturasPendientes.map(f => f.id))
    }
  }

  const facturasParaPago = facturasPendientes.filter(f => facturasSeleccionadas.includes(f.id))
  const totalAPagar = facturasParaPago.reduce((sum, factura) => sum + factura.total, 0)

  const procesarPagoSeleccionado = async () => {
    if (facturasParaPago.length === 0) {
      toast.error('Selecciona al menos una factura para pagar')
      return
    }

    setPagoEnProceso(true)
    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 3000))

      for (const factura of facturasParaPago) {
        await procesarPago(factura.id, {
          monto: factura.total,
          metodoPago,
          referencia: referenciaPago
        })
      }

      setMostrarConfirmacion(true)
      setFacturasSeleccionadas([])
      setReferenciaPago('')
      
    } catch (error) {
      toast.error('Error al procesar el pago')
    } finally {
      setPagoEnProceso(false)
    }
  }

  const obtenerEstadoFactura = (factura: Factura) => {
    const hoy = new Date()
    const diasVencida = Math.ceil((hoy.getTime() - factura.fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diasVencida > 0) {
      return { estado: 'vencida', dias: diasVencida, color: 'red' }
    } else if (diasVencida > -7) {
      return { estado: 'por_vencer', dias: Math.abs(diasVencida), color: 'orange' }
    } else {
      return { estado: 'vigente', dias: Math.abs(diasVencida), color: 'green' }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header del Portal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <span>Portal de Pagos</span>
            </h2>
            <p className="text-gray-600 mt-1">
              Bienvenido, {cliente.razonSocial}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Saldo actual</p>
            <p className="text-2xl font-bold text-primary">
              ${totalAPagar.toLocaleString()} MXN
            </p>
          </div>
        </div>
      </div>

      {/* Información de Seguridad */}
      <div className="bg-gradient-to-r from-blue-50 to-primary/5 rounded-xl border border-blue-200 p-4">
        <div className="flex items-center space-x-3">
          <Shield className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Pago Seguro y Encriptado
            </p>
            <p className="text-xs text-blue-700">
              Tu información está protegida con encriptación SSL de 256 bits
            </p>
          </div>
        </div>
      </div>

      {/* Facturas Pendientes */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900">Facturas Pendientes de Pago</h3>
          {facturasPendientes.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={seleccionarTodas}
            >
              {facturasSeleccionadas.length === facturasPendientes.length ? 'Deseleccionar' : 'Seleccionar'} Todas
            </Button>
          )}
        </div>

        {facturasPendientes.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600">¡No tienes facturas pendientes!</p>
            <p className="text-sm text-gray-500 mt-1">Todas tus facturas están al día</p>
          </div>
        ) : (
          <div className="space-y-4">
            {facturasPendientes.map((factura) => {
              const estado = obtenerEstadoFactura(factura)
              const seleccionada = facturasSeleccionadas.includes(factura.id)
              
              return (
                <motion.div
                  key={factura.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    seleccionada 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleSeleccionFactura(factura.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        seleccionada 
                          ? 'border-primary bg-primary' 
                          : 'border-gray-300'
                      }`}>
                        {seleccionada && <CheckCircle className="h-3 w-3 text-white" />}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-3">
                          <h4 className="font-semibold text-gray-900">
                            {factura.folio}
                          </h4>
                          <Badge 
                            className={`${
                              estado.color === 'red' ? 'bg-red-100 text-red-800' :
                              estado.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                              'bg-green-100 text-green-800'
                            }`}
                          >
                            {estado.estado === 'vencida' && `Vencida ${estado.dias} días`}
                            {estado.estado === 'por_vencer' && `Vence en ${estado.dias} días`}
                            {estado.estado === 'vigente' && `Vigente`}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-6 mt-1 text-sm text-gray-600">
                          <span>Emisión: {factura.fechaEmision.toLocaleDateString('es-MX')}</span>
                          <span>Vence: {factura.fechaVencimiento.toLocaleDateString('es-MX')}</span>
                          <span>{factura.servicios.length} servicios</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ${factura.total.toLocaleString()} MXN
                      </p>
                      <div className="flex space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            toast('Descargando PDF...')
                          }}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Resumen de Pago */}
      {facturasSeleccionadas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Resumen del Pago</h3>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Facturas seleccionadas:</span>
                <span className="font-semibold">{facturasSeleccionadas.length}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">${(totalAPagar / 1.16).toLocaleString()} MXN</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">IVA (16%):</span>
                <span className="font-semibold">${(totalAPagar - totalAPagar / 1.16).toLocaleString()} MXN</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                <span>Total a pagar:</span>
                <span className="text-primary">${totalAPagar.toLocaleString()} MXN</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago
                </label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                  <option value="SPEI">SPEI</option>
                  <option value="TARJETA">Tarjeta de Crédito/Débito</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="EFECTIVO">Efectivo</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referencia de Pago (Opcional)
                </label>
                <Input
                  value={referenciaPago}
                  onChange={(e) => setReferenciaPago(e.target.value)}
                  placeholder="Número de transferencia, cheque, etc."
                />
              </div>
              
              <div className="flex items-end">
                <Button
                  onClick={procesarPagoSeleccionado}
                  disabled={pagoEnProceso}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {pagoEnProceso ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pagar Ahora
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Métodos de Pago Disponibles */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Métodos de Pago Disponibles</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { 
              name: 'Transferencia', 
              icon: Building2, 
              desc: 'Bancaria',
              status: 'disponible'
            },
            { 
              name: 'SPEI', 
              icon: Smartphone, 
              desc: 'Interbancario',
              status: 'disponible'
            },
            { 
              name: 'Tarjeta', 
              icon: CardIcon, 
              desc: 'Crédito/Débito',
              status: 'disponible'
            },
            { 
              name: 'Cheque', 
              icon: Receipt, 
              desc: 'Nominal',
              status: 'disponible'
            }
          ].map((metodo, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 text-center ${
                metodoPago === metodo.name.toUpperCase() 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200'
              }`}
            >
              <metodo.icon className="h-8 w-8 mx-auto mb-2 text-gray-600" />
              <h4 className="font-medium text-gray-900">{metodo.name}</h4>
              <p className="text-xs text-gray-500">{metodo.desc}</p>
              <Badge 
                className={`mt-2 ${
                  metodo.status === 'disponible' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {metodo.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal de Confirmación */}
      <Dialog open={mostrarConfirmacion} onOpenChange={setMostrarConfirmacion}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Pago Procesado Exitosamente</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-green-800">
                  ${totalAPagar.toLocaleString()} MXN
                </span>
              </div>
              <p className="text-sm text-green-700">
                Tu pago ha sido procesado y aplicado a las facturas seleccionadas
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Facturas pagadas:</span>
                <span className="font-medium">{facturasParaPago.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Fecha de pago:</span>
                <span className="font-medium">{new Date().toLocaleDateString('es-MX')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Referencia:</span>
                <span className="font-medium">{referenciaPago || 'N/A'}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <DialogClose asChild>
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Comprobante
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Cerrar
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
