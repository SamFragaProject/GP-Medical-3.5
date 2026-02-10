// Hook personalizado para el módulo de Inventario Médico
import { useState, useEffect, useCallback } from 'react'
import {
  Producto,
  Stock,
  Proveedor,
  OrdenCompra,
  EquipoMedico,
  EstadisticasInventario,
  AlertaInventario,
  FormularioProducto,
  FormularioOrdenCompra,
  FormularioMovimientoStock,
  FiltrosInventario,
  KardexProducto,
  ReporteInventario,
  EstadoStock
} from '@/types/inventario'
import toast from 'react-hot-toast'
import { inventarioService } from '@/services/dataService'
import { useAuth } from '@/contexts/AuthContext'

export function useInventario() {
  const { user } = useAuth()
  const [productos, setProductos] = useState<Producto[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [ordenesCompra, setOrdenesCompra] = useState<OrdenCompra[]>([])
  const [equiposMedicos, setEquiposMedicos] = useState<EquipoMedico[]>([])
  const [alertas, setAlertas] = useState<AlertaInventario[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInitialData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await inventarioService.getAll()

      const mappedProducts: Producto[] = data.map((p: any) => ({
        id: p.id,
        codigo: p.codigo || '',
        nombre: p.nombre || '',
        descripcion: p.descripcion || '',
        tipo: p.tipo as any,
        categoria: p.categoria as any,
        unidadMedida: p.unidad_medida || 'pieza',
        precioUnitario: p.precio_venta || 0,
        proveedorId: p.proveedor_id || '1',
        requiereReceta: !!p.requiere_receta,
        requiereFrio: !!p.requiere_frio,
        activo: p.activo !== false,
        createdAt: new Date(p.created_at || Date.now()),
        updatedAt: new Date(p.updated_at || p.created_at || Date.now()),
        stock: {
          id: p.id,
          productoId: p.id,
          cantidadActual: p.stock_actual || 0,
          cantidadMinima: p.stock_minimo || 0,
          cantidadMaxima: p.stock_maximo || 1000,
          ubicacion: p.ubicacion_almacen || 'Bodega Central',
          fechaEntrada: new Date(p.created_at || Date.now()),
          precioCosto: p.precio_compra || 0,
          estado: (p.stock_actual <= 0 ? 'agotado' : p.stock_actual <= p.stock_minimo ? 'bajo' : 'disponible') as EstadoStock,
          alertasVencimiento: false,
          alertasStockBajo: (p.stock_actual <= p.stock_minimo),
          createdAt: new Date(p.created_at || Date.now()),
          updatedAt: new Date(p.updated_at || p.created_at || Date.now()),
        }
      }))

      setProductos(mappedProducts)
    } catch (err) {
      console.error('Error loading inventory:', err)
      toast.error('Error al cargar inventario')
      setError('Error al cargar inventario')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  const handleAsyncOperation = async <T>(operation: () => Promise<T>, errorMessage: string): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      return await operation()
    } catch (err: any) {
      const message = err?.message || errorMessage
      setError(message)
      toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const obtenerProductos = async (filtros?: FiltrosInventario): Promise<Producto[]> => {
    // Si no hay filtros, devolver el estado actual
    if (!filtros) return productos

    let filtrados = [...productos]
    if (filtros.busqueda) {
      const term = filtros.busqueda.toLowerCase()
      filtrados = filtrados.filter(p => p.nombre.toLowerCase().includes(term) || p.codigo.toLowerCase().includes(term))
    }
    if (filtros.tipo) {
      filtrados = filtrados.filter(p => p.tipo === filtros.tipo)
    }
    return filtrados
  }

  const obtenerProducto = async (id: string): Promise<Producto | null> => {
    return productos.find(p => p.id === id) || null
  }

  const crearProducto = async (formulario: FormularioProducto): Promise<Producto | null> => {
    return handleAsyncOperation(async () => {
      if (!user) throw new Error('Usuario no autenticado')

      const res = await inventarioService.upsertProducto({
        empresa_id: user.empresa_id,
        nombre: formulario.nombre,
        codigo: formulario.codigo,
        descripcion: formulario.descripcion,
        categoria: formulario.categoria,
        unidad_medida: formulario.unidadMedida,
        precio_venta: formulario.precioUnitario,
        precio_compra: formulario.precioUnitario * 0.7, // Estimación
        stock_minimo: formulario.cantidadMinima,
        stock_maximo: formulario.cantidadMaxima,
        requiere_frio: formulario.requiereFrio,
        requiere_receta: formulario.requiereReceta,
        activo: true
      } as any)

      await fetchInitialData()
      return productos.find(p => p.id === res.id) || null
    }, 'Error al crear producto')
  }

  const actualizarProducto = async (id: string, datos: Partial<Producto>): Promise<Producto | null> => {
    return handleAsyncOperation(async () => {
      await inventarioService.upsertProducto({
        id,
        ...datos as any
      })
      await fetchInitialData()
      return productos.find(p => p.id === id) || null
    }, 'Error al actualizar producto')
  }

  const registrarMovimientoStock = async (formulario: FormularioMovimientoStock): Promise<boolean> => {
    return handleAsyncOperation(async () => {
      if (!user) throw new Error('Usuario no autenticado')

      await inventarioService.registrarMovimiento({
        producto_id: formulario.stockId,
        tipo_movimiento: (formulario.tipo === 'vencimiento' ? 'salida' : formulario.tipo) as any,
        cantidad: (formulario.tipo === 'salida' || formulario.tipo === 'vencimiento') ? -formulario.cantidad : formulario.cantidad,
        motivo: formulario.motivo,
        empresa_id: user.empresa_id,
        usuario_id: user.id
      })

      await fetchInitialData()
      toast.success('Movimiento registrado correctamente')
      return true
    }, 'Error al registrar movimiento') || false
  }

  const obtenerOrdenesCompra = async () => ordenesCompra
  const crearOrdenCompra = async (f: FormularioOrdenCompra) => {
    toast('Funcionalidad de órdenes de compra en desarrollo', { icon: 'ℹ️' })
    return null
  }

  const obtenerEquiposMedicos = async () => equiposMedicos
  const programarMantenimiento = async (id: string, f: Date, d: string) => {
    toast('Funcionalidad de mantenimiento en desarrollo', { icon: 'ℹ️' })
    return true
  }

  const marcarAlertaLeida = async (id: string) => {
    setAlertas(prev => prev.map(a => a.id === id ? { ...a, leida: true } : a))
  }

  const generarReporteInventario = async (inicio: Date, fin: Date): Promise<ReporteInventario[]> => {
    return productos.map(p => ({
      producto: p.nombre,
      stockActual: p.stock?.cantidadActual || 0,
      stockMinimo: p.stock?.cantidadMinima || 0,
      valorTotal: (p.stock?.cantidadActual || 0) * p.precioUnitario,
      categoria: p.categoria,
      proveedor: 'Proveedor Default',
      rotacion: 0
    }))
  }

  const obtenerKardexProducto = async (id: string): Promise<KardexProducto[]> => {
    return []
  }

  const estadisticas: EstadisticasInventario = {
    totalProductos: productos.length,
    totalValorInventario: productos.reduce((acc, p) => acc + ((p.stock?.cantidadActual || 0) * p.precioUnitario), 0),
    productosStockBajo: productos.filter(p => p.stock && p.stock.cantidadActual <= p.stock.cantidadMinima).length,
    productosVencidos: 0,
    productosPorVencer: 0,
    rotacionPromedio: 0,
    valorComprasMes: 0,
    valorVentasMes: 0,
    eficienciaInventario: 100
  }

  return {
    productos,
    proveedores,
    ordenesCompra,
    equiposMedicos,
    alertas,
    loading,
    error,
    estadisticas,
    obtenerProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    registrarMovimientoStock,
    obtenerOrdenesCompra,
    crearOrdenCompra,
    obtenerEquiposMedicos,
    programarMantenimiento,
    marcarAlertaLeida,
    generarReporteInventario,
    obtenerKardexProducto
  }
}
