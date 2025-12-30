// Hook personalizado para el módulo de Inventario Médico
import { useState, useEffect } from 'react'
import { 
  Producto, 
  Stock, 
  Proveedor, 
  OrdenCompra, 
  EquipoMedico, 
  MantenimientoEquipo,
  EstadisticasInventario,
  AlertaInventario,
  FormularioProducto,
  FormularioOrdenCompra,
  FormularioMovimientoStock,
  FiltrosInventario,
  CategoriaInventario,
  KardexProducto,
  ReporteInventario,
  EstadoStock
} from '@/types/inventario'
import toast from 'react-hot-toast'

// Datos simulados para desarrollo
const datosSimulados = {
  productos: [
    {
      id: '1',
      codigo: 'MED001',
      nombre: 'Ibuprofeno 400mg',
      descripcion: 'Analgésico y antiinflamatorio',
      tipo: 'medicamento' as const,
      categoria: 'analgesicos' as const,
      unidadMedida: 'tableta',
      precioUnitario: 2.5,
      proveedorId: '1',
      requiereReceta: false,
      requiereFrio: false,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      stock: {
        id: '1',
        productoId: '1',
        cantidadActual: 500,
        cantidadMinima: 100,
        cantidadMaxima: 1000,
        ubicacion: 'Estantería A-1',
        fechaEntrada: new Date(),
        precioCosto: 1.8,
        estado: 'disponible' as const,
        alertasVencimiento: false,
        alertasStockBajo: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        fechaVencimiento: new Date('2025-12-15')
      }
    },
    {
      id: '2',
      codigo: 'EQ001',
      nombre: 'Tensiómetro Digital',
      descripcion: 'Equipo para medición de presión arterial',
      tipo: 'equipo_medico' as const,
      categoria: 'equipos_diagnostico' as const,
      unidadMedida: 'pieza',
      precioUnitario: 1500,
      proveedorId: '2',
      requiereReceta: false,
      requiereFrio: false,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      stock: {
        id: '2',
        productoId: '2',
        cantidadActual: 15,
        cantidadMinima: 5,
        cantidadMaxima: 25,
        ubicacion: 'Almacén de Equipos',
        fechaEntrada: new Date(),
        precioCosto: 1200,
        estado: 'disponible' as const,
        alertasVencimiento: false,
        alertasStockBajo: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    {
      id: '3',
      codigo: 'CON001',
      nombre: 'Guantes de Nitrilo',
      descripcion: 'Guantes desechables para uso médico',
      tipo: 'consumible' as const,
      categoria: 'guantes' as const,
      unidadMedida: 'caja',
      precioUnitario: 45,
      proveedorId: '3',
      requiereReceta: false,
      requiereFrio: false,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      stock: {
        id: '3',
        productoId: '3',
        cantidadActual: 25,
        cantidadMinima: 50,
        cantidadMaxima: 200,
        ubicacion: 'Estantería C-2',
        fechaEntrada: new Date(),
        precioCosto: 35,
        estado: 'bajo' as const,
        alertasVencimiento: false,
        alertasStockBajo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        fechaVencimiento: new Date('2026-05-20')
      }
    }
  ],
  proveedores: [
    {
      id: '1',
      nombre: 'Farmacia San Rafael',
      contacto: 'María González',
      telefono: '555-0123',
      email: 'compras@farmaciasr.com',
      direccion: 'Av. Principal 123, Ciudad',
      rfc: 'FSR123456789',
      certificadoSanitario: 'CERT-2024-001',
      activo: true,
      rating: 4.8,
      diasEntregaPromedio: 2,
      condicionesPago: 'Contado',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      nombre: 'Equipos Médicos del Norte',
      contacto: 'Carlos Rodríguez',
      telefono: '555-0456',
      email: 'ventas@emdq.com',
      direccion: 'Blvd. Industrial 456, Monterrey',
      rfc: 'EMN987654321',
      certificadoSanitario: 'CERT-2024-002',
      activo: true,
      rating: 4.6,
      diasEntregaPromedio: 5,
      condicionesPago: '30 días',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  ordenesCompra: [
    {
      id: '1',
      numeroOrden: 'OC-2024-001',
      proveedorId: '1',
      fechaOrden: new Date('2024-10-15'),
      fechaEntregaEsperada: new Date('2024-10-17'),
      estado: 'recibida' as const,
      subtotal: 2500,
      impuesto: 400,
      total: 2900,
      observaciones: 'Entrega programada',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  equipos: [
    {
      id: '1',
      codigo: 'EQ-HEM-001',
      nombre: 'Analizador de Hematología',
      marca: 'Mindray',
      modelo: 'BC-3000',
      numeroSerie: 'BC3000-2024-001',
      fechaCompra: new Date('2024-01-15'),
      fechaGarantia: new Date('2026-01-15'),
      costoAdquisicion: 85000,
      ubicacion: 'Laboratorio Principal',
      responsable: 'Dr. López',
      estado: 'activo' as const,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  alertas: [
    {
      id: '1',
      tipo: 'stock_bajo' as const,
      productoId: '3',
      mensaje: 'Guantes de Nitrilo - Stock bajo (25 unidades)',
      nivel: 'warning' as const,
      leida: false,
      fechaCreacion: new Date()
    },
    {
      id: '2',
      tipo: 'vencimiento' as const,
      productoId: '1',
      mensaje: 'Ibuprofeno 400mg - Vence en 45 días',
      nivel: 'info' as const,
      leida: false,
      fechaCreacion: new Date()
    }
  ]
}

export function useInventario() {
  const [productos, setProductos] = useState<Producto[]>(datosSimulados.productos)
  const [proveedores, setProveedores] = useState<Proveedor[]>(datosSimulados.proveedores)
  const [ordenesCompra, setOrdenesCompra] = useState<OrdenCompra[]>(datosSimulados.ordenesCompra)
  const [equiposMedicos, setEquiposMedicos] = useState<EquipoMedico[]>(datosSimulados.equipos)
  const [alertas, setAlertas] = useState<AlertaInventario[]>(datosSimulados.alertas)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función helper para manejar errores
  const handleAsyncOperation = async <T>(operation: () => Promise<T>, errorMessage: string): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await operation()
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : errorMessage
      setError(errorMsg)
      toast.error(errorMsg)
      console.error(errorMessage, err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Función para validar códigos únicos
  const validarCodigoUnico = (codigo: string, excludeId?: string): boolean => {
    return !productos.some(p => p.codigo === codigo && p.id !== excludeId && p.activo)
  }

  // Función para generar alertas automáticas
  const generarAlertaStock = (producto: Producto, nuevoStock: number) => {
    if (nuevoStock <= 0) {
      // Alerta de stock agotado
      const alerta: AlertaInventario = {
        id: Date.now().toString(),
        tipo: 'stock_bajo',
        productoId: producto.id,
        mensaje: `${producto.nombre} - Stock agotado`,
        nivel: 'critical',
        leida: false,
        fechaCreacion: new Date()
      }
      setAlertas(prev => [...prev, alerta])
    } else if (nuevoStock <= (producto.stock?.cantidadMinima || 0)) {
      // Alerta de stock bajo
      const alertaExistente = alertas.find(a => 
        a.productoId === producto.id && 
        a.tipo === 'stock_bajo' && 
        !a.leida
      )
      
      if (!alertaExistente) {
        const alerta: AlertaInventario = {
          id: Date.now().toString(),
          tipo: 'stock_bajo',
          productoId: producto.id,
          mensaje: `${producto.nombre} - Stock bajo (${nuevoStock} ${producto.unidadMedida})`,
          nivel: 'warning',
          leida: false,
          fechaCreacion: new Date()
        }
        setAlertas(prev => [...prev, alerta])
      }
    }
  }

  // Estadísticas calculadas
  const estadisticas: EstadisticasInventario = {
    totalProductos: productos.length,
    totalValorInventario: productos.reduce((total, p) => {
      return total + ((p.stock?.cantidadActual || 0) * p.precioUnitario)
    }, 0),
    productosStockBajo: productos.filter(p => p.stock?.estado === 'bajo').length,
    productosVencidos: productos.filter(p => {
      if (!p.stock?.fechaVencimiento) return false
      return p.stock.fechaVencimiento < new Date()
    }).length,
    productosPorVencer: productos.filter(p => {
      if (!p.stock?.fechaVencimiento) return false
      const dias = Math.ceil((p.stock.fechaVencimiento.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return dias > 0 && dias <= 30
    }).length,
    rotacionPromedio: 4.2,
    valorComprasMes: 45000,
    valorVentasMes: 52000,
    eficienciaInventario: 85.5
  }

  // Funciones para Productos
  const obtenerProductos = async (filtros?: FiltrosInventario): Promise<Producto[]> => {
    setLoading(true)
    try {
      let productosFiltrados = [...productos]

      if (filtros?.busqueda) {
        productosFiltrados = productosFiltrados.filter(p => 
          p.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
          p.codigo.toLowerCase().includes(filtros.busqueda.toLowerCase())
        )
      }

      if (filtros?.tipo) {
        productosFiltrados = productosFiltrados.filter(p => p.tipo === filtros.tipo)
      }

      if (filtros?.categoria) {
        productosFiltrados = productosFiltrados.filter(p => p.categoria === filtros.categoria)
      }

      if (filtros?.estado) {
        productosFiltrados = productosFiltrados.filter(p => p.stock?.estado === filtros.estado)
      }

      return productosFiltrados
    } catch (err) {
      setError('Error al obtener productos')
      return []
    } finally {
      setLoading(false)
    }
  }

  const obtenerProducto = async (id: string): Promise<Producto | null> => {
    const producto = productos.find(p => p.id === id)
    return producto || null
  }

  const crearProducto = async (formulario: FormularioProducto): Promise<Producto | null> => {
    return handleAsyncOperation(async () => {
      // Validar datos requeridos
      if (!formulario.codigo || !formulario.nombre) {
        throw new Error('Código y nombre son requeridos')
      }

      // Validar código único
      if (!validarCodigoUnico(formulario.codigo)) {
        throw new Error(`El código "${formulario.codigo}" ya existe`)
      }

      // Validar rangos de temperatura si requiere frío
      if (formulario.requiereFrio) {
        if (!formulario.temperaturaMin || !formulario.temperaturaMax) {
          throw new Error('Las temperaturas mínima y máxima son requeridas para productos refrigerados')
        }
        if (formulario.temperaturaMax <= formulario.temperaturaMin) {
          throw new Error('La temperatura máxima debe ser mayor a la mínima')
        }
      }

      const nuevoProducto: Producto = {
        id: Date.now().toString(),
        codigo: formulario.codigo.trim(),
        nombre: formulario.nombre.trim(),
        descripcion: formulario.descripcion?.trim() || '',
        tipo: formulario.tipo,
        categoria: formulario.categoria,
        unidadMedida: formulario.unidadMedida.trim(),
        precioUnitario: Number(formulario.precioUnitario),
        proveedorId: formulario.proveedorId,
        requiereReceta: formulario.requiereReceta,
        requiereFrio: formulario.requiereFrio,
        temperaturaMin: formulario.temperaturaMin,
        temperaturaMax: formulario.temperaturaMax,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        stock: {
          id: Date.now().toString(),
          productoId: '',
          cantidadActual: 0,
          cantidadMinima: Number(formulario.cantidadMinima),
          cantidadMaxima: Number(formulario.cantidadMaxima),
          ubicacion: formulario.ubicacion.trim(),
          fechaEntrada: new Date(),
          precioCosto: formulario.precioUnitario,
          estado: 'disponible',
          alertasVencimiento: false,
          alertasStockBajo: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }

      // Asignar ID del producto al stock
      nuevoProducto.stock!.productoId = nuevoProducto.id

      setProductos(prev => [...prev, nuevoProducto])
      toast.success('Producto creado exitosamente')
      return nuevoProducto
    }, 'Error al crear producto')!
  }

  const actualizarProducto = async (id: string, datos: Partial<Producto>): Promise<Producto | null> => {
    return handleAsyncOperation(async () => {
      // Validar código único si se está actualizando
      if (datos.codigo && !validarCodigoUnico(datos.codigo, id)) {
        throw new Error(`El código "${datos.codigo}" ya existe`)
      }

      // Validar rangos de temperatura si se actualiza el campo de refrigeración
      if (datos.requiereFrio || (datos.temperaturaMin !== undefined || datos.temperaturaMax !== undefined)) {
        const producto = productos.find(p => p.id === id)
        if (producto && (producto.requiereFrio || datos.requiereFrio)) {
          const tempMin = datos.temperaturaMin ?? producto.temperaturaMin
          const tempMax = datos.temperaturaMax ?? producto.temperaturaMax
          
          if (!tempMin || !tempMax) {
            throw new Error('Las temperaturas mínima y máxima son requeridas para productos refrigerados')
          }
          if (tempMax <= tempMin) {
            throw new Error('La temperatura máxima debe ser mayor a la mínima')
          }
        }
      }

      const productoActualizado = productos.find(p => p.id === id)
      if (!productoActualizado) {
        throw new Error('Producto no encontrado')
      }

      // Actualizar producto
      const productoConCambios = {
        ...productoActualizado,
        ...datos,
        updatedAt: new Date()
      }

      // Limpiar campos undefined
      Object.keys(productoConCambios).forEach(key => {
        if (productoConCambios[key as keyof Producto] === undefined) {
          delete productoConCambios[key as keyof Producto]
        }
      })

      setProductos(prev => prev.map(p => p.id === id ? productoConCambios : p))
      toast.success('Producto actualizado correctamente')
      return productoConCambios
    }, 'Error al actualizar producto')!
  }

  // Funciones para Stock
  const registrarMovimientoStock = async (formulario: FormularioMovimientoStock): Promise<boolean> => {
    return handleAsyncOperation(async () => {
      // Validar datos requeridos
      if (!formulario.stockId || !formulario.tipo || formulario.cantidad <= 0) {
        throw new Error('Datos de movimiento inválidos')
      }

      const producto = productos.find(p => p.id === formulario.stockId)
      const stock = producto?.stock
      if (!stock) {
        throw new Error('Stock no encontrado')
      }

      let nuevaCantidad = stock.cantidadActual
      const cantidadAnterior = nuevaCantidad

      switch (formulario.tipo) {
        case 'entrada':
          nuevaCantidad += formulario.cantidad
          break
        case 'salida':
        case 'vencimiento':
          nuevaCantidad -= formulario.cantidad
          if (nuevaCantidad < 0) {
            throw new Error('No hay suficiente stock para la salida')
          }
          break
        case 'ajuste':
          if (formulario.cantidad < 0) {
            throw new Error('La cantidad de ajuste no puede ser negativa')
          }
          nuevaCantidad = formulario.cantidad
          break
        case 'devolucion':
          nuevaCantidad += formulario.cantidad
          break
        default:
          throw new Error('Tipo de movimiento no válido')
      }

      // Determinar nuevo estado
      let nuevoEstado: EstadoStock = 'disponible'
      if (nuevaCantidad === 0) {
        nuevoEstado = 'agotado'
      } else if (nuevaCantidad <= stock.cantidadMinima) {
        nuevoEstado = 'bajo'
      } else {
        nuevoEstado = 'disponible'
      }

      // Actualizar stock
      const stockActualizado = {
        ...stock,
        cantidadActual: nuevaCantidad,
        estado: nuevoEstado,
        updatedAt: new Date()
      }

      setProductos(prev => prev.map(p => 
        p.id === formulario.stockId 
          ? { 
              ...p, 
              stock: stockActualizado,
              updatedAt: new Date()
            }
          : p
      ))

      // Generar alertas si es necesario
      if (producto) {
        generarAlertaStock(producto, nuevaCantidad)
      }

      toast.success(
        `Movimiento registrado: ${formulario.tipo} de ${formulario.cantidad} ${producto?.unidadMedida}. Stock: ${nuevaCantidad}`
      )
      return true
    }, 'Error al registrar movimiento')
  }

  // Funciones para Órdenes de Compra
  const obtenerOrdenesCompra = async (): Promise<OrdenCompra[]> => {
    return ordenesCompra
  }

  const crearOrdenCompra = async (formulario: FormularioOrdenCompra): Promise<OrdenCompra | null> => {
    setLoading(true)
    try {
      // Validar datos requeridos
      if (!formulario.proveedorId || !formulario.items || formulario.items.length === 0) {
        throw new Error('Proveedor y items son requeridos')
      }

      // Validar que los items tengan productos válidos
      const itemsValidos = formulario.items.filter(item => 
        item.productoId && item.cantidad > 0 && item.precioUnitario >= 0
      )
      
      if (itemsValidos.length === 0) {
        throw new Error('Items de orden inválidos')
      }

      const nuevaOrden: OrdenCompra = {
        id: Date.now().toString(),
        numeroOrden: `OC-${new Date().getFullYear()}-${String(ordenesCompra.length + 1).padStart(3, '0')}`,
        proveedorId: formulario.proveedorId,
        fechaOrden: new Date(),
        fechaEntregaEsperada: formulario.fechaEntregaEsperada,
        estado: 'pendiente',
        subtotal: 0,
        impuesto: 0,
        total: 0,
        observaciones: formulario.observaciones,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: []
      }

      // Crear items con IDs únicos
      nuevaOrden.items = itemsValidos.map(item => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ordenCompraId: nuevaOrden.id,
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        cantidadRecibida: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }))

      // Calcular totales
      nuevaOrden.subtotal = nuevaOrden.items.reduce(
        (total, item) => total + (item.cantidad * item.precioUnitario), 0
      )
      nuevaOrden.impuesto = nuevaOrden.subtotal * 0.16 // 16% de IVA
      nuevaOrden.total = nuevaOrden.subtotal + nuevaOrden.impuesto

      setOrdenesCompra(prev => [...prev, nuevaOrden])
      toast.success('Orden de compra creada')
      return nuevaOrden
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear orden de compra'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Funciones para Equipos Médicos
  const obtenerEquiposMedicos = async (): Promise<EquipoMedico[]> => {
    return equiposMedicos
  }

  const programarMantenimiento = async (equipoId: string, fecha: Date, descripcion: string): Promise<boolean> => {
    setLoading(true)
    try {
      // Aquí se agregaría el mantenimiento a la base de datos
      toast.success('Mantenimiento programado')
      return true
    } catch (err) {
      toast.error('Error al programar mantenimiento')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Funciones para Alertas
  const marcarAlertaLeida = async (alertaId: string): Promise<void> => {
    setAlertas(prev => prev.map(a => 
      a.id === alertaId ? { ...a, leida: true, fechaLectura: new Date() } : a
    ))
  }

  const limpiarAlertasLeidas = (): void => {
    setAlertas(prev => prev.filter(a => !a.leida))
  }

  // Funciones para Reportes
  const generarReporteInventario = async (fechaInicio: Date, fechaFin: Date): Promise<ReporteInventario[]> => {
    setLoading(true)
    try {
      return productos.map(p => ({
        producto: p.nombre,
        stockActual: p.stock?.cantidadActual || 0,
        stockMinimo: p.stock?.cantidadMinima || 0,
        valorTotal: (p.stock?.cantidadActual || 0) * p.precioUnitario,
        proximoVencimiento: p.stock?.fechaVencimiento,
        diasVencimiento: p.stock?.fechaVencimiento ? 
          Math.ceil((p.stock.fechaVencimiento.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
          undefined,
        rotacion: Math.random() * 10 + 1, // Simulado
        categoria: p.categoria,
        proveedor: proveedores.find(pr => pr.id === p.proveedorId)?.nombre || 'Desconocido'
      }))
    } catch (err) {
      toast.error('Error al generar reporte')
      return []
    } finally {
      setLoading(false)
    }
  }

  const obtenerKardexProducto = async (productoId: string): Promise<KardexProducto[]> => {
    // Simulación de movimientos históricos
    return [
      {
        fecha: new Date('2024-10-01'),
        tipoMovimiento: 'Entrada',
        cantidad: 100,
        precio: 2.50,
        saldo: 100,
        motivo: 'Compra inicial'
      },
      {
        fecha: new Date('2024-10-15'),
        tipoMovimiento: 'Salida',
        cantidad: 25,
        precio: 2.50,
        saldo: 75,
        motivo: 'Despacho'
      },
      {
        fecha: new Date('2024-10-20'),
        tipoMovimiento: 'Salida',
        cantidad: 50,
        precio: 2.50,
        saldo: 25,
        motivo: 'Despacho'
      }
    ]
  }

  // Función para generar orden de compra automática
  const generarOrdenesCompraAutomaticas = async (): Promise<void> => {
    const productosStockBajo = productos.filter(p => p.stock?.cantidadActual <= p.stock?.cantidadMinima)
    
    for (const producto of productosStockBajo) {
      // Aquí se podría crear automáticamente una orden de compra
      console.log(`Generando orden automática para: ${producto.nombre}`)
    }
    
    toast.success(`${productosStockBajo.length} órdenes de compra automáticas generadas`)
  }

  return {
    // Estado
    productos,
    proveedores,
    ordenesCompra,
    equiposMedicos,
    alertas,
    loading,
    error,
    estadisticas,

    // Funciones de Productos
    obtenerProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,

    // Funciones de Stock
    registrarMovimientoStock,

    // Funciones de Órdenes de Compra
    obtenerOrdenesCompra,
    crearOrdenCompra,

    // Funciones de Equipos
    obtenerEquiposMedicos,
    programarMantenimiento,

    // Funciones de Alertas
    marcarAlertaLeida,
    limpiarAlertasLeidas,

    // Funciones de Reportes
    generarReporteInventario,
    obtenerKardexProducto,

    // Funciones Utilitarias
    generarOrdenesCompraAutomaticas,
    
    // Datos para control de temperatura
    productosRequierenFrio: [
      {
        id: '1',
        nombre: 'Insulina',
        ubicacion: 'Refrigerador 1 - Estante A',
        temperaturaMin: 2,
        temperaturaMax: 8,
        temperaturaActual: 4.5,
        estado: 'normal' as const
      },
      {
        id: '2',
        nombre: 'Vacunas COVID-19',
        ubicacion: 'Refrigerador 2 - Estante B',
        temperaturaMin: 2,
        temperaturaMax: 8,
        temperaturaActual: 3.2,
        estado: 'normal' as const
      },
      {
        id: '3',
        nombre: 'Biomédicos',
        ubicacion: 'Congelador Principal',
        temperaturaMin: -15,
        temperaturaMax: -5,
        temperaturaActual: -8.1,
        estado: 'normal' as const
      },
      {
        id: '4',
        nombre: 'Reactivos de Laboratorio',
        ubicacion: 'Refrigerador 3 - Estante C',
        temperaturaMin: 4,
        temperaturaMax: 6,
        temperaturaActual: 7.2,
        estado: 'alerta' as const
      }
    ]
  }
}
