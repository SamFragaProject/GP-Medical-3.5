// Contexto del carrito de compras para el ERP Médico
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'
import toast from 'react-hot-toast'

// Tipos para el carrito
export interface ProductoCarrito {
  id: string
  nombre: string
  precio: number
  imagen?: string
  cantidad: number
  categoria?: string
  stock?: number
}

export interface CuponDescuento {
  id: string
  codigo: string
  tipo: 'porcentaje' | 'fijo'
  valor: number
  descripcion: string
  minimoCompra?: number
  activo: boolean
}

export interface InfoEnvio {
  metodo: string
  precio: number
  tiempoEstimado: string
  descripcion: string
}

interface EstadoCarrito {
  productos: ProductoCarrito[]
  cuponActivo: CuponDescuento | null
  metodoEnvio: InfoEnvio | null
  subtotal: number
  descuentoCupon: number
  costoEnvio: number
  total: number
}

type AccionCarrito =
  | { type: 'AGREGAR_PRODUCTO'; payload: ProductoCarrito }
  | { type: 'REMOVER_PRODUCTO'; payload: string }
  | { type: 'ACTUALIZAR_CANTIDAD'; payload: { id: string; cantidad: number } }
  | { type: 'LIMPIAR_CARRITO' }
  | { type: 'APLICAR_CUPON'; payload: CuponDescuento }
  | { type: 'REMOVER_CUPON' }
  | { type: 'SELECCIONAR_ENVIO'; payload: InfoEnvio }
  | { type: 'CARGAR_DESDE_STORAGE'; payload: EstadoCarrito }

interface ContextoCarritoTipo extends EstadoCarrito {
  agregarProducto: (producto: Omit<ProductoCarrito, 'cantidad'>) => void
  removerProducto: (id: string) => void
  actualizarCantidad: (id: string, cantidad: number) => void
  limpiarCarrito: () => void
  aplicarCupon: (codigo: string) => Promise<boolean>
  removerCupon: () => void
  seleccionarMetodoEnvio: (metodo: InfoEnvio) => void
  obtenerTotalItems: () => number
}

// Valores por defecto del carrito
const valoresIniciales: EstadoCarrito = {
  productos: [],
  cuponActivo: null,
  metodoEnvio: null,
  subtotal: 0,
  descuentoCupon: 0,
  costoEnvio: 0,
  total: 0
}

// Métodos de envío disponibles
export const metodosEnvio: InfoEnvio[] = [
  {
    metodo: 'standard',
    precio: 15.99,
    tiempoEstimado: '5-7 días hábiles',
    descripcion: 'Envío estándar'
  },
  {
    metodo: 'express',
    precio: 29.99,
    tiempoEstimado: '2-3 días hábiles',
    descripcion: 'Envío express'
  },
  {
    metodo: 'same_day',
    precio: 49.99,
    tiempoEstimado: 'Mismo día (hasta las 8 PM)',
    descripcion: 'Entrega el mismo día'
  }
]

// Cupones disponibles
export const cuponesDisponibles: CuponDescuento[] = [
  {
    id: '1',
    codigo: 'BIENVENIDO10',
    tipo: 'porcentaje',
    valor: 10,
    descripcion: '10% de descuento en tu primera compra',
    minimoCompra: 50,
    activo: true
  },
  {
    id: '2',
    codigo: 'MEDICO20',
    tipo: 'porcentaje',
    valor: 20,
    descripcion: '20% de descuento para profesionales de la salud',
    minimoCompra: 100,
    activo: true
  },
  {
    id: '3',
    codigo: 'SAVE25',
    tipo: 'fijo',
    valor: 25,
    descripcion: '$25 de descuento en compras superiores a $200',
    minimoCompra: 200,
    activo: true
  }
]

// Reducer para manejar las acciones del carrito
function carritoReducer(estado: EstadoCarrito, accion: AccionCarrito): EstadoCarrito {
  switch (accion.type) {
    case 'AGREGAR_PRODUCTO': {
      const productoExistente = estado.productos.find(p => p.id === accion.payload.id)
      
      if (productoExistente) {
        // Si el producto ya existe, solo aumentar la cantidad
        const productosActualizados = estado.productos.map(p =>
          p.id === accion.payload.id
            ? { ...p, cantidad: Math.min(p.cantidad + 1, p.stock || 999) }
            : p
        )
        return calcularTotales({ ...estado, productos: productosActualizados })
      } else {
        // Si es un producto nuevo, agregarlo
        const productosActualizados = [...estado.productos, { ...accion.payload, cantidad: 1 }]
        return calcularTotales({ ...estado, productos: productosActualizados })
      }
    }

    case 'REMOVER_PRODUCTO': {
      const productosActualizados = estado.productos.filter(p => p.id !== accion.payload)
      return calcularTotales({ ...estado, productos: productosActualizados })
    }

    case 'ACTUALIZAR_CANTIDAD': {
      const productosActualizados = estado.productos.map(p =>
        p.id === accion.payload.id
          ? { ...p, cantidad: Math.max(0, Math.min(accion.payload.cantidad, p.stock || 999)) }
          : p
      ).filter(p => p.cantidad > 0) // Remover productos con cantidad 0
      return calcularTotales({ ...estado, productos: productosActualizados })
    }

    case 'LIMPIAR_CARRITO':
      return valoresIniciales

    case 'APLICAR_CUPON':
      return calcularTotales({ ...estado, cuponActivo: accion.payload })

    case 'REMOVER_CUPON':
      return calcularTotales({ ...estado, cuponActivo: null })

    case 'SELECCIONAR_ENVIO':
      return calcularTotales({ ...estado, metodoEnvio: accion.payload })

    case 'CARGAR_DESDE_STORAGE':
      return calcularTotales(accion.payload)

    default:
      return estado
  }
}

// Función para calcular totales
function calcularTotales(estado: EstadoCarrito): EstadoCarrito {
  const subtotal = estado.productos.reduce((total, producto) => {
    return total + (producto.precio * producto.cantidad)
  }, 0)

  let descuentoCupon = 0
  if (estado.cuponActivo && subtotal >= (estado.cuponActivo.minimoCompra || 0)) {
    if (estado.cuponActivo.tipo === 'porcentaje') {
      descuentoCupon = (subtotal * estado.cuponActivo.valor) / 100
    } else {
      descuentoCupon = estado.cuponActivo.valor
    }
  }

  const costoEnvio = estado.metodoEnvio?.precio || 0
  const total = subtotal - descuentoCupon + costoEnvio

  return {
    ...estado,
    subtotal,
    descuentoCupon,
    costoEnvio,
    total: Math.max(0, total)
  }
}

// Contexto
const CarritoContext = createContext<ContextoCarritoTipo | undefined>(undefined)

// Provider del contexto
export function CarritoProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(carritoReducer, valoresIniciales)

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    const carritoGuardado = localStorage.getItem('carrito-erp-medico')
    if (carritoGuardado) {
      try {
        const datosCarrito = JSON.parse(carritoGuardado)
        dispatch({ type: 'CARGAR_DESDE_STORAGE', payload: datosCarrito })
      } catch (error) {
        console.error('Error al cargar carrito desde localStorage:', error)
      }
    }
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('carrito-erp-medico', JSON.stringify(estado))
  }, [estado])

  // Funciones del contexto
  const agregarProducto = (producto: Omit<ProductoCarrito, 'cantidad'>) => {
    dispatch({ type: 'AGREGAR_PRODUCTO', payload: { ...producto, cantidad: 1 } })
    toast.success(`${producto.nombre} agregado al carrito`, {
      duration: 2000,
      icon: '🛒'
    })
  }

  const removerProducto = (id: string) => {
    const producto = estado.productos.find(p => p.id === id)
    dispatch({ type: 'REMOVER_PRODUCTO', payload: id })
    if (producto) {
      toast.success(`${producto.nombre} removido del carrito`, {
        duration: 2000,
        icon: '🗑️'
      })
    }
  }

  const actualizarCantidad = (id: string, cantidad: number) => {
    dispatch({ type: 'ACTUALIZAR_CANTIDAD', payload: { id, cantidad } })
  }

  const limpiarCarrito = () => {
    dispatch({ type: 'LIMPIAR_CARRITO' })
    toast.success('Carrito limpiado', {
      duration: 2000,
      icon: '🧹'
    })
  }

  const aplicarCupon = async (codigo: string): Promise<boolean> => {
    const cupon = cuponesDisponibles.find(c => 
      c.codigo.toLowerCase() === codigo.toLowerCase() && c.activo
    )

    if (!cupon) {
      toast.error('Cupón no válido', {
        duration: 3000,
        icon: '❌'
      })
      return false
    }

    if (estado.subtotal < (cupon.minimoCompra || 0)) {
      toast.error(`Compra mínima de $${cupon.minimoCompra} requerida`, {
        duration: 3000,
        icon: '💰'
      })
      return false
    }

    dispatch({ type: 'APLICAR_CUPON', payload: cupon })
    toast.success(`Cupón ${cupon.codigo} aplicado`, {
      duration: 3000,
      icon: '🎉'
    })
    return true
  }

  const removerCupon = () => {
    dispatch({ type: 'REMOVER_CUPON' })
    toast.success('Cupón removido', {
      duration: 2000,
      icon: '🏷️'
    })
  }

  const seleccionarMetodoEnvio = (metodo: InfoEnvio) => {
    dispatch({ type: 'SELECCIONAR_ENVIO', payload: metodo })
  }

  const obtenerTotalItems = () => {
    return estado.productos.reduce((total, producto) => total + producto.cantidad, 0)
  }

  const valor: ContextoCarritoTipo = {
    ...estado,
    agregarProducto,
    removerProducto,
    actualizarCantidad,
    limpiarCarrito,
    aplicarCupon,
    removerCupon,
    seleccionarMetodoEnvio,
    obtenerTotalItems
  }

  return (
    <CarritoContext.Provider value={valor}>
      {children}
    </CarritoContext.Provider>
  )
}

// Hook personalizado para usar el contexto del carrito
export function useCarrito() {
  const context = useContext(CarritoContext)
  if (context === undefined) {
    throw new Error('useCarrito debe ser usado dentro de un CarritoProvider')
  }
  return context
}
