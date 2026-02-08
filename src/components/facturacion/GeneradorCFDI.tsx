// Generador de CFDI 4.0 con integración completa
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Download,
  Send,
  Calculator,
  Calendar,
  Building2,
  User,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Loader,
  Copy,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Cliente, ServicioMedico, Factura } from '@/types/facturacion'
import { useFacturacion } from '@/hooks/useFacturacion'
import toast from 'react-hot-toast'

interface GeneradorCFDIProps {
  cliente: Cliente | null
  servicios: ServicioMedico[]
  onFacturaCreada: (factura: Factura) => void
}

export function GeneradorCFDI({ cliente, servicios, onFacturaCreada }: GeneradorCFDIProps) {
  const { crearFactura, generarCFDI, loading } = useFacturacion()

  const [facturaData, setFacturaData] = useState({
    serviciosSeleccionados: [] as Array<{ servicio: ServicioMedico; cantidad: number; descuento: number }>,
    metodoPago: 'PUE',
    usoCFDI: 'G03',
    observaciones: '',
    lugarExpedicion: 'CDMX'
  })

  const [mostrarPreview, setMostrarPreview] = useState(false)
  const [mostrarCFDI, setMostrarCFDI] = useState(false)
  const [cfdiGenerado, setCfdiGenerado] = useState<string | null>(null)

  // Calcular totales
  const subtotal = facturaData.serviciosSeleccionados.reduce((sum, item) => {
    return sum + (item.servicio.precio * item.cantidad)
  }, 0)

  const descuentoTotal = facturaData.serviciosSeleccionados.reduce((sum, item) => {
    return sum + (item.servicio.precio * item.cantidad * item.descuento / 100)
  }, 0)

  const impuestoTotal = facturaData.serviciosSeleccionados.reduce((sum, item) => {
    const base = (item.servicio.precio * item.cantidad) - (item.servicio.precio * item.cantidad * item.descuento / 100)
    return sum + base * 0.16 // IVA 16%
  }, 0)

  const total = subtotal - descuentoTotal + impuestoTotal

  const agregarServicio = (servicio: ServicioMedico) => {
    const existing = facturaData.serviciosSeleccionados.find(item => item.servicio.id === servicio.id)
    if (existing) {
      setFacturaData(prev => ({
        ...prev,
        serviciosSeleccionados: prev.serviciosSeleccionados.map(item =>
          item.servicio.id === servicio.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      }))
    } else {
      setFacturaData(prev => ({
        ...prev,
        serviciosSeleccionados: [...prev.serviciosSeleccionados, { servicio, cantidad: 1, descuento: 0 }]
      }))
    }
  }

  const actualizarCantidad = (servicioId: string, cantidad: number) => {
    if (cantidad <= 0) {
      setFacturaData(prev => ({
        ...prev,
        serviciosSeleccionados: prev.serviciosSeleccionados.filter(item => item.servicio.id !== servicioId)
      }))
    } else {
      setFacturaData(prev => ({
        ...prev,
        serviciosSeleccionados: prev.serviciosSeleccionados.map(item =>
          item.servicio.id === servicioId ? { ...item, cantidad } : item
        )
      }))
    }
  }

  const actualizarDescuento = (servicioId: string, descuento: number) => {
    setFacturaData(prev => ({
      ...prev,
      serviciosSeleccionados: prev.serviciosSeleccionados.map(item =>
        item.servicio.id === servicioId ? { ...item, descuento } : item
      )
    }))
  }

  const generarFactura = async () => {
    if (!cliente || facturaData.serviciosSeleccionados.length === 0) {
      toast.error('Selecciona un cliente y al menos un servicio')
      return
    }

    try {
      const nuevaFactura = await crearFactura({
        cliente,
        servicios: facturaData.serviciosSeleccionados.map((item, index) => ({
          id: `svc-${index}`,
          servicioId: item.servicio.id,
          servicioNombre: item.servicio.nombre,
          cantidad: item.cantidad,
          precioUnitario: item.servicio.precio,
          descuento: item.descuento,
          impuesto: item.servicio.impuestos * item.cantidad,
          total: item.servicio.precio * item.cantidad
        })),
        subtotal,
        impuestos: impuestoTotal,
        total,
        moneda: 'MXN',
        estado: 'borrador',
        metodoPago: facturaData.metodoPago as any,
        lugarExpedicion: facturaData.lugarExpedicion,
        regimeFiscal: cliente.regimenFiscal,
        usoCFDI: facturaData.usoCFDI as any,
        serie: 'F',
        numero: Date.now(),
        observaciones: facturaData.observaciones
      })

      onFacturaCreada(nuevaFactura)
      setMostrarPreview(false)

      // Auto-generar CFDI
      const uuid = await generarCFDI(nuevaFactura.id)
      setCfdiGenerado(uuid)
      setMostrarCFDI(true)

      // Reset form
      setFacturaData({
        serviciosSeleccionados: [],
        metodoPago: 'PUE',
        usoCFDI: 'G03',
        observaciones: '',
        lugarExpedicion: 'CDMX'
      })

    } catch (error) {
      console.error('Error creando factura:', error)
    }
  }

  if (!cliente) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Selecciona un cliente para generar una factura</p>
        </div>
      </Card>
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
              <span>Generador CFDI 4.0</span>
            </h2>
            <p className="text-gray-600 mt-1">
              Cliente: {cliente.razonSocial} - RFC: {cliente.rfc}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setMostrarPreview(true)}
              disabled={facturaData.serviciosSeleccionados.length === 0}
            >
              <Eye className="h-4 w-4 mr-2" />
              Vista Previa
            </Button>
            <Button
              onClick={generarFactura}
              disabled={loading || facturaData.serviciosSeleccionados.length === 0}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Generar CFDI
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selección de Servicios */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Servicios Médicos</h3>
          <div className="space-y-3">
            {servicios.map((servicio) => (
              <div
                key={servicio.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{servicio.nombre}</h4>
                    <p className="text-sm text-gray-600">{servicio.descripcion}</p>
                    <p className="text-xs text-gray-500 mt-1">Código: {servicio.codigo}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-primary">${servicio.precio.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">+ IVA ${servicio.impuestos}</p>
                    <Button
                      size="sm"
                      className="mt-2 bg-primary hover:bg-primary/90"
                      onClick={() => agregarServicio(servicio)}
                    >
                      Agregar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Configuración y Totales */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Configuración de Factura</h3>

          {/* Servicios Seleccionados */}
          <div className="space-y-3 mb-6">
            {facturaData.serviciosSeleccionados.map((item) => (
              <div key={item.servicio.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{item.servicio.nombre}</h4>
                  <span className="text-sm text-gray-600">
                    ${(item.servicio.precio * item.cantidad).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Cantidad:</label>
                    <Input
                      type="number"
                      value={item.cantidad}
                      onChange={(e) => actualizarCantidad(item.servicio.id, parseInt(e.target.value) || 0)}
                      className="w-20"
                      min="1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Descuento:</label>
                    <Input
                      type="number"
                      value={item.descuento}
                      onChange={(e) => actualizarDescuento(item.servicio.id, parseFloat(e.target.value) || 0)}
                      className="w-20"
                      min="0"
                      max="100"
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Configuración de Factura */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
              <select
                value={facturaData.metodoPago}
                onChange={(e) => setFacturaData(prev => ({ ...prev, metodoPago: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="PUE">Pago en una sola exhibición</option>
                <option value="PPD">Pago en parcialidades o diferido</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Uso del CFDI</label>
              <select
                value={facturaData.usoCFDI}
                onChange={(e) => setFacturaData(prev => ({ ...prev, usoCFDI: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="G03">Gastos en general</option>
                <option value="D01">Honorarios médicos</option>
                <option value="G04">Gastos médicos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea
                value={facturaData.observaciones}
                onChange={(e) => setFacturaData(prev => ({ ...prev, observaciones: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                rows={3}
                placeholder="Observaciones adicionales..."
              />
            </div>
          </div>

          {/* Totales */}
          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Descuentos:</span>
                <span className="font-medium text-red-600">-${descuentoTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">IVA (16%):</span>
                <span className="font-medium">${impuestoTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                <span>Total:</span>
                <span className="text-primary">${total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Vista Previa de Factura */}
      <Dialog open={mostrarPreview} onOpenChange={setMostrarPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vista Previa de Factura CFDI 4.0</DialogTitle>
          </DialogHeader>

          <div className="bg-white p-8 rounded-lg border">
            {/* Header de la Factura */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FACTURA</h1>
                <p className="text-gray-600">Serie F - Folio {Date.now()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Fecha de emisión:</p>
                <p className="font-medium">{new Date().toLocaleDateString('es-MX')}</p>
                <p className="text-sm text-gray-600 mt-2">Lugar de expedición:</p>
                <p className="font-medium">{facturaData.lugarExpedicion}</p>
              </div>
            </div>

            {/* Datos del Emisor y Receptor */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">EMISOR</h3>
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900">GPMedical SA DE CV</p>
                  <p>RFC: MED850215ABC</p>
                  <p>Av. Medicina del Trabajo 123</p>
                  <p>Col. Industrial, CDMX 03100</p>
                  <p>Regimen Fiscal: 601</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">RECEPTOR</h3>
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900">{cliente.razonSocial}</p>
                  <p>RFC: {cliente.rfc}</p>
                  <p>{cliente.direccion.calle} {cliente.direccion.numero}</p>
                  <p>{cliente.direccion.colonia}, {cliente.direccion.ciudad} {cliente.direccion.cp}</p>
                  <p>Uso CFDI: {facturaData.usoCFDI}</p>
                </div>
              </div>
            </div>

            {/* Conceptos */}
            <div className="mb-8">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Cant.</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Descripción</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Precio Unit.</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {facturaData.serviciosSeleccionados.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2 text-center">{item.cantidad}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div>
                          <p className="font-medium">{item.servicio.nombre}</p>
                          <p className="text-xs text-gray-500">{item.servicio.codigo}</p>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        ${item.servicio.precio.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        ${(item.servicio.precio * item.cantidad).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totales */}
            <div className="flex justify-end">
              <div className="w-80">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Descuentos:</span>
                    <span>-${descuentoTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (16%):</span>
                    <span>${impuestoTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span className="text-primary">${total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
              <p>Esta es una vista previa de la factura CFDI 4.0</p>
              <p>El documento fiscal oficial se generará al completar el proceso</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de CFDI Generado */}
      <Dialog open={mostrarCFDI} onOpenChange={setMostrarCFDI}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>CFDI 4.0 Generado Exitosamente</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-green-800">Factura timbrada correctamente</span>
              </div>
              <p className="text-sm text-green-700">
                Tu factura CFDI 4.0 ha sido generada y timbrada por el PAC autorizado
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Información del CFDI</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">UUID:</span>
                  <span className="font-mono text-sm">{cfdiGenerado}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha de timbrado:</span>
                  <span>{new Date().toLocaleString('es-MX')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold">${total.toLocaleString()} MXN</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <DialogClose asChild>
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar XML
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="outline" className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar UUID
                </Button>
              </DialogClose>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">¿Qué sigue?</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• El CFDI ha sido enviado al correo del cliente</li>
                <li>• La factura está lista para cobro</li>
                <li>• Se agregó automáticamente a tu libro de ventas</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
