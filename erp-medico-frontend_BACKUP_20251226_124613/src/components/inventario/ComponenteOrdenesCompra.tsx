// Componente para gestión de órdenes de compra
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShoppingCart,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  FileText,
  Calendar,
  DollarSign,
  Package
} from 'lucide-react'
import { OrdenCompra, Proveedor, Producto } from '@/types/inventario'
import { useInventario } from '@/hooks/useInventario'
import toast from 'react-hot-toast'

interface ComponenteOrdenesCompraProps {
  ordenes: OrdenCompra[]
  proveedores: Proveedor[]
  productos: Producto[]
}

export function ComponenteOrdenesCompra({ ordenes, proveedores, productos }: ComponenteOrdenesCompraProps) {
  const { crearOrdenCompra } = useInventario()
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenCompra | null>(null)
  const [vistaDetalle, setVistaDetalle] = useState(false)
  const [loading, setLoading] = useState(false)
  const [itemsOrden, setItemsOrden] = useState<Array<{
    productoId: string
    cantidad: number
    precioUnitario: number
  }>>([])
  const [formularioOrden, setFormularioOrden] = useState({
    proveedorId: '',
    fechaEntregaEsperada: '',
    observaciones: ''
  })

  // Manejar envío del formulario
  const handleSubmitOrden = async () => {
    if (!formularioOrden.proveedorId || itemsOrden.length === 0) {
      toast.error('Debe seleccionar un proveedor y agregar productos')
      return
    }

    // Validar que todos los productos tengan cantidad válida
    const itemsValidos = itemsOrden.filter(item => 
      item.productoId && item.cantidad > 0 && item.precioUnitario >= 0
    )

    if (itemsValidos.length !== itemsOrden.length) {
      toast.error('Todos los productos deben tener cantidad y precio válidos')
      return
    }

    setLoading(true)
    try {
      const nuevaOrden = await crearOrdenCompra({
        proveedorId: formularioOrden.proveedorId,
        fechaEntregaEsperada: new Date(formularioOrden.fechaEntregaEsperada),
        observaciones: formularioOrden.observaciones,
        items: itemsValidos
      })

      if (nuevaOrden) {
        // Limpiar formulario
        setFormularioOrden({ proveedorId: '', fechaEntregaEsperada: '', observaciones: '' })
        setItemsOrden([])
        setMostrarFormulario(false)
        toast.success('Orden de compra creada exitosamente')
      }
    } catch (error) {
      console.error('Error al crear orden:', error)
    } finally {
      setLoading(false)
    }
  }

  // Agregar producto a la orden
  const agregarProductoOrden = () => {
    if (productos.length > 0) {
      setItemsOrden(prev => [...prev, {
        productoId: productos[0].id,
        cantidad: 1,
        precioUnitario: productos[0].precioUnitario
      }])
    }
  }

  // Actualizar item de orden
  const actualizarItemOrden = (index: number, campo: string, valor: any) => {
    setItemsOrden(prev => prev.map((item, i) => 
      i === index ? { ...item, [campo]: valor } : item
    ))
  }

  // Eliminar item de orden
  const eliminarItemOrden = (index: number) => {
    setItemsOrden(prev => prev.filter((_, i) => i !== index))
  }

  // Calcular totales
  const calcularTotales = () => {
    const subtotal = itemsOrden.reduce((total, item) => total + (item.cantidad * item.precioUnitario), 0)
    const impuesto = subtotal * 0.16 // 16% IVA
    const total = subtotal + impuesto
    return { subtotal, impuesto, total }
  }

  const totales = calcularTotales()

  const TarjetaOrdenCompra = ({ orden }: { orden: OrdenCompra }) => {
    const estado = obtenerEstadoOrden(orden.estado)
    const EstadoIcono = estado.icono

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{orden.numeroOrden}</h3>
            <p className="text-sm text-gray-600">
              Proveedor: {proveedores.find(p => p.id === orden.proveedorId)?.nombre}
            </p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estado.color}`}>
            <EstadoIcono size={12} className="mr-1" />
            {estado.texto}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
          <div>
            <span className="font-medium">Fecha Orden:</span>
            <p>{new Date(orden.fechaOrden).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="font-medium">Entrega Esperada:</span>
            <p>{new Date(orden.fechaEntregaEsperada).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="font-medium">Total:</span>
            <p className="text-lg font-bold text-gray-900">${orden.total.toFixed(2)}</p>
          </div>
          <div>
            <span className="font-medium">Items:</span>
            <p>{orden.items?.length || 0} productos</p>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              setOrdenSeleccionada(orden)
              setVistaDetalle(true)
            }}
            className="px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-md transition-colors flex items-center space-x-1"
          >
            <Eye size={14} />
            <span>Ver</span>
          </button>
          {orden.estado === 'pendiente' && (
            <>
              <button className="px-3 py-1.5 text-sm text-success hover:bg-success/10 rounded-md transition-colors flex items-center space-x-1">
                <CheckCircle size={14} />
                <span>Aprobar</span>
              </button>
              <button className="px-3 py-1.5 text-sm text-danger hover:bg-danger/10 rounded-md transition-colors flex items-center space-x-1">
                <XCircle size={14} />
                <span>Cancelar</span>
              </button>
            </>
          )}
          {orden.estado === 'en_transito' && (
            <button className="px-3 py-1.5 text-sm text-success hover:bg-success/10 rounded-md transition-colors flex items-center space-x-1">
              <Package size={14} />
              <span>Recibir</span>
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  const obtenerEstadoOrden = (estado: string) => {
    const estados = {
      pendiente: { color: 'bg-warning/10 text-warning', icono: Clock, texto: 'Pendiente' },
      aprobada: { color: 'bg-primary/10 text-primary', icono: CheckCircle, texto: 'Aprobada' },
      en_transito: { color: 'bg-secondary/10 text-secondary', icono: Truck, texto: 'En Tránsito' },
      recibida: { color: 'bg-success/10 text-success', icono: CheckCircle, texto: 'Recibida' },
      cancelada: { color: 'bg-danger/10 text-danger', icono: XCircle, texto: 'Cancelada' }
    }
    return estados[estado as keyof typeof estados] || estados.pendiente
  }

  const FormularioOrdenCompra = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Nueva Orden de Compra</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor *</label>
              <select 
                value={formularioOrden.proveedorId}
                onChange={(e) => setFormularioOrden(prev => ({ ...prev, proveedorId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={loading}
              >
                <option value="">Seleccionar proveedor</option>
                {proveedores.filter(p => p.activo).map(proveedor => (
                  <option key={proveedor.id} value={proveedor.id}>{proveedor.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Entrega Esperada *</label>
              <input
                type="date"
                value={formularioOrden.fechaEntregaEsperada}
                onChange={(e) => setFormularioOrden(prev => ({ ...prev, fechaEntregaEsperada: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
            <textarea
              rows={3}
              value={formularioOrden.observaciones}
              onChange={(e) => setFormularioOrden(prev => ({ ...prev, observaciones: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Notas adicionales para el proveedor..."
              disabled={loading}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Productos *</h3>
              <button 
                onClick={agregarProductoOrden}
                className="bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors text-sm flex items-center space-x-1"
                disabled={loading}
              >
                <Plus size={14} />
                <span>Agregar Producto</span>
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Producto</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Cantidad</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Precio Unit.</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Total</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {itemsOrden.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No hay productos agregados. Haga clic en "Agregar Producto" para comenzar.
                      </td>
                    </tr>
                  ) : (
                    itemsOrden.map((item, index) => {
                      const producto = productos.find(p => p.id === item.productoId)
                      return (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <select
                              value={item.productoId}
                              onChange={(e) => {
                                const productoSeleccionado = productos.find(p => p.id === e.target.value)
                                actualizarItemOrden(index, 'productoId', e.target.value)
                                if (productoSeleccionado) {
                                  actualizarItemOrden(index, 'precioUnitario', productoSeleccionado.precioUnitario)
                                }
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary"
                              disabled={loading}
                            >
                              {productos.filter(p => p.activo).map(prod => (
                                <option key={prod.id} value={prod.id}>{prod.nombre}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="1"
                              value={item.cantidad}
                              onChange={(e) => actualizarItemOrden(index, 'cantidad', parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary"
                              disabled={loading}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.precioUnitario}
                              onChange={(e) => actualizarItemOrden(index, 'precioUnitario', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary"
                              disabled={loading}
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                            ${(item.cantidad * item.precioUnitario).toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <button 
                              onClick={() => eliminarItemOrden(index)}
                              className="text-danger hover:text-danger/80"
                              disabled={loading}
                            >
                              <XCircle size={16} />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Subtotal:</span>
              <span>${totales.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>IVA (16%):</span>
              <span>${totales.impuesto.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>${totales.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={() => {
              setMostrarFormulario(false)
              setItemsOrden([])
              setFormularioOrden({ proveedorId: '', fechaEntregaEsperada: '', observaciones: '' })
            }}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmitOrden}
            disabled={loading || !formularioOrden.proveedorId || itemsOrden.length === 0}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <span>Crear Orden de Compra</span>
          </button>
        </div>
      </div>
    </motion.div>
  )

  const DetalleOrdenCompra = () => {
    if (!ordenSeleccionada) return null

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Detalle de Orden: {ordenSeleccionada.numeroOrden}
              </h2>
              <button
                onClick={() => {
                  setVistaDetalle(false)
                  setOrdenSeleccionada(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Información general */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Información General</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Número de Orden:</span>
                    <span className="font-medium">{ordenSeleccionada.numeroOrden}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Proveedor:</span>
                    <span className="font-medium">{proveedores.find(p => p.id === ordenSeleccionada.proveedorId)?.nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha de Orden:</span>
                    <span className="font-medium">{new Date(ordenSeleccionada.fechaOrden).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Entrega Esperada:</span>
                    <span className="font-medium">{new Date(ordenSeleccionada.fechaEntregaEsperada).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Totales</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${ordenSeleccionada.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IVA:</span>
                    <span className="font-medium">${ordenSeleccionada.impuesto.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>${ordenSeleccionada.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            {ordenSeleccionada.observaciones && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Observaciones</h3>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  {ordenSeleccionada.observaciones}
                </p>
              </div>
            )}

            {/* Items de la orden */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Productos Solicitados</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Producto</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Cantidad</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Precio Unit.</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {ordenSeleccionada.items?.map(item => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {productos.find(p => p.id === item.productoId)?.nombre}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.cantidad}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">${item.precioUnitario.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          ${(item.cantidad * item.precioUnitario).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Órdenes de Compra</h2>
          <p className="text-gray-600 mt-1">Gestión y seguimiento de órdenes de compra</p>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Nueva Orden</span>
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-warning">
                {ordenes.filter(o => o.estado === 'pendiente').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-warning" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Tránsito</p>
              <p className="text-2xl font-bold text-secondary">
                {ordenes.filter(o => o.estado === 'en_transito').length}
              </p>
            </div>
            <Truck className="h-8 w-8 text-secondary" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recibidas</p>
              <p className="text-2xl font-bold text-success">
                {ordenes.filter(o => o.estado === 'recibida').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Mes</p>
              <p className="text-2xl font-bold text-gray-900">
                ${ordenes.reduce((total, o) => total + o.total, 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Lista de órdenes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ordenes.map(orden => (
          <TarjetaOrdenCompra key={orden.id} orden={orden} />
        ))}
      </div>

      {/* Modales */}
      {mostrarFormulario && <FormularioOrdenCompra />}
      {vistaDetalle && <DetalleOrdenCompra />}
    </div>
  )
}
