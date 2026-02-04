import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ShoppingCart,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  DollarSign,
  Package,
  Calendar,
  FileText
} from 'lucide-react'
import { OrdenCompra, Proveedor, DetalleOrdenCompra } from '@/types/compras'
import { InventarioItem } from '@/types/inventory'
import { comprasService } from '@/services/comprasService'
import { inventoryService } from '@/services/inventoryService'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface ComponenteOrdenesCompraProps {
  initialOrdenes?: OrdenCompra[] // Optional, we load them
}

export function ComponenteOrdenesCompra({ initialOrdenes = [] }: ComponenteOrdenesCompraProps) {
  const { user } = useAuth()
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>(initialOrdenes)
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [productos, setProductos] = useState<InventarioItem[]>([])

  const [loading, setLoading] = useState(true)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenCompra | null>(null)
  const [vistaDetalle, setVistaDetalle] = useState(false)
  const [showingReception, setShowingReception] = useState(false)

  // Load Data
  const loadData = async () => {
    if (!user?.empresa_id) return
    setLoading(true)
    try {
      const [ordData, provData, prodData] = await Promise.all([
        comprasService.getOrdenes(user.empresa_id),
        comprasService.getProveedores(user.empresa_id),
        inventoryService.getInventario(user.empresa_id)
      ])
      setOrdenes(ordData)
      setProveedores(provData)
      setProductos(prodData)
    } catch (error) {
      console.error(error)
      toast.error('Error cargando datos de compras')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user?.empresa_id])


  // Form State
  const [formularioOrden, setFormularioOrden] = useState({
    proveedorId: '',
    fechaEntregaEsperada: '',
    observaciones: ''
  })

  const [itemsOrden, setItemsOrden] = useState<Array<{
    inventario_id: string
    cantidad: number
    costo_unitario: number
  }>>([])

  // Handlers
  const handleSubmitOrden = async () => {
    if (!formularioOrden.proveedorId || itemsOrden.length === 0) {
      toast.error('Complete proveedor y productos')
      return
    }

    try {
      setLoading(true)
      await comprasService.createOrden({
        empresa_id: user?.empresa_id,
        proveedor_id: formularioOrden.proveedorId,
        usuario_creador_id: user?.id,
        fecha_entrega_estimada: formularioOrden.fechaEntregaEsperada,
        observaciones: formularioOrden.observaciones,
        total_estimado: itemsOrden.reduce((acc, item) => acc + (item.cantidad * item.costo_unitario), 0)
      } as any, itemsOrden as any) // Type casting simpler for partials here

      toast.success('Orden creada correctamente')
      setMostrarFormulario(false)
      loadData()
    } catch (error) {
      console.error(error)
      toast.error('Error creando orden')
    } finally {
      setLoading(false)
    }
  }

  const handleRecepcion = async () => {
    if (!ordenSeleccionada) return

    // For simplicity, we assume full reception in this version
    // In a real scenario, we would show a form to confirm quantity per item
    const itemsRecibidos = ordenSeleccionada.items?.map(item => ({
      inventario_id: item.inventario_id,
      cantidad: item.cantidad_solicitada // Assuming full reception
    })) || []

    try {
      setLoading(true)
      await comprasService.recibirOrden(
        ordenSeleccionada.id,
        user?.empresa_id!,
        itemsRecibidos
      )
      toast.success('Mercancía recibida e inventario actualizado')
      setShowingReception(false)
      setOrdenSeleccionada(null)
      loadData()
    } catch (error) {
      console.error(error)
      toast.error('Error al procesar recepción')
    } finally {
      setLoading(false)
    }
  }


  // --- Render Helpers ---

  const obtenerEstadoOrden = (estado: string) => {
    const estados = {
      borrador: { color: 'bg-slate-100 text-slate-600', icono: FileText, texto: 'Borrador' },
      enviada: { color: 'bg-blue-50 text-blue-700', icono: Truck, texto: 'Enviada' },
      completada: { color: 'bg-emerald-50 text-emerald-700', icono: CheckCircle, texto: 'Recibida' },
      cancelada: { color: 'bg-red-50 text-red-700', icono: XCircle, texto: 'Cancelada' }
    }
    return estados[estado as keyof typeof estados] || estados.borrador
  }

  const TarjetaOrden = ({ orden }: { orden: OrdenCompra }) => {
    const estado = obtenerEstadoOrden(orden.estado)
    const Icono = estado.icono
    const provName = orden.proveedor?.nombre_comercial || 'Proveedor Desconocido'

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-all"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900">{orden.folio || 'S/F'}</h3>
            <p className="text-sm text-gray-500">{provName}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${estado.color}`}>
            <Icono size={12} /> {estado.texto}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
          <div>
            <span className="block text-xs text-gray-400">Fecha</span>
            {new Date(orden.fecha_emision).toLocaleDateString()}
          </div>
          <div>
            <span className="block text-xs text-gray-400">Entrega</span>
            {orden.fecha_entrega_estimada ? new Date(orden.fecha_entrega_estimada).toLocaleDateString() : 'N/A'}
          </div>
          <div>
            <span className="block text-xs text-gray-400">Total Est.</span>
            <span className="font-bold text-gray-900">${orden.total_estimado?.toLocaleString()}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-400">Items</span>
            {orden.items?.length || 0}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <button
            onClick={() => { setOrdenSeleccionada(orden); setVistaDetalle(true); }}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-md" title="Ver Detalle"
          >
            <Eye size={18} />
          </button>
          {orden.estado === 'enviada' && (
            <button
              onClick={() => { setOrdenSeleccionada(orden); setShowingReception(true); }}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm"
            >
              <Package size={16} /> Recibir
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  // --- Main Render ---
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Órdenes de Compra</h2>
          <p className="text-gray-500 mt-1">Reabastecimiento de inventario</p>
        </div>
        <button
          onClick={() => {
            setFormularioOrden({ proveedorId: '', fechaEntregaEsperada: '', observaciones: '' })
            setItemsOrden([])
            setMostrarFormulario(true)
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 shadow-sm"
        >
          <Plus size={16} />
          <span>Nueva Orden</span>
        </button>
      </div>

      {loading && !ordenes.length ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ordenes.map(orden => (
            <TarjetaOrden key={orden.id} orden={orden} />
          ))}
          {ordenes.length === 0 && (
            <div className="col-span-full border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay órdenes</h3>
              <p className="mt-1 text-sm text-gray-500">Comience creando una nueva orden de compra.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Nueva Orden */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-6">Nueva Orden de Compra</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Proveedor</label>
                <select
                  className="w-full border rounded-md p-2"
                  value={formularioOrden.proveedorId}
                  onChange={e => setFormularioOrden({ ...formularioOrden, proveedorId: e.target.value })}
                >
                  <option value="">Seleccione...</option>
                  {proveedores.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre_comercial}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha Entrega</label>
                <input
                  type="date"
                  className="w-full border rounded-md p-2"
                  value={formularioOrden.fechaEntregaEsperada}
                  onChange={e => setFormularioOrden({ ...formularioOrden, fechaEntregaEsperada: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-sm">Productos</h3>
                <button
                  type="button"
                  onClick={() => setItemsOrden([...itemsOrden, { inventario_id: '', cantidad: 1, costo_unitario: 0 }])}
                  className="text-indigo-600 text-sm hover:underline"
                >
                  + Agregar Item
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto border p-2 rounded-md">
                {itemsOrden.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <select
                      className="flex-1 border rounded p-1 text-sm"
                      value={item.inventario_id}
                      onChange={e => {
                        const prod = productos.find(p => p.id === e.target.value)
                        const newItems = [...itemsOrden]
                        newItems[idx].inventario_id = e.target.value
                        // Auto-fill cost if available (simulated)
                        if (prod) newItems[idx].costo_unitario = 0 // In real app, items might have cost
                        setItemsOrden(newItems)
                      }}
                    >
                      <option value="">Producto...</option>
                      {productos.map(prod => (
                        <option key={prod.id} value={prod.id}>{prod.nombre_comercial}</option>
                      ))}
                    </select>
                    <input
                      type="number" placeholder="Cant" className="w-20 border rounded p-1 text-sm"
                      value={item.cantidad}
                      onChange={e => {
                        const newItems = [...itemsOrden]
                        newItems[idx].cantidad = parseInt(e.target.value) || 0
                        setItemsOrden(newItems)
                      }}
                    />
                    <input
                      type="number" placeholder="Costo" className="w-24 border rounded p-1 text-sm"
                      value={item.costo_unitario}
                      onChange={e => {
                        const newItems = [...itemsOrden]
                        newItems[idx].costo_unitario = parseFloat(e.target.value) || 0
                        setItemsOrden(newItems)
                      }}
                    />
                    <button onClick={() => setItemsOrden(itemsOrden.filter((_, i) => i !== idx))} className="text-red-500">
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button onClick={() => setMostrarFormulario(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
              <button onClick={handleSubmitOrden} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Crear Orden</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Recepción (Confirmación Simple) */}
      {showingReception && ordenSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Package className="text-emerald-600" />
              Recibir Mercancía
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              ¿Confirma que ha recibido todos los items de la orden <strong>{ordenSeleccionada.folio}</strong>?
              <br /><br />
              Esto aumentará el stock en el inventario automáticamente.
            </p>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowingReception(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
              <button onClick={handleRecepcion} className="px-4 py-2 bg-emerald-600 text-white rounded-md">Confirmar Recepción</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
