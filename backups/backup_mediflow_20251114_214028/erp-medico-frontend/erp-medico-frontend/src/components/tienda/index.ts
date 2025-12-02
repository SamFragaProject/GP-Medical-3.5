// Archivo de índice para exportar todos los componentes de la tienda
export { default as CarritoCompras } from './CarritoCompras'
export { default as BotonCarritoFlotante } from './BotonCarritoFlotante'
export { default as BotonAgregarCarrito } from './BotonAgregarCarrito'
export { CheckoutFarmacia } from './CheckoutFarmacia'

// Exportar tipos y contexto desde el contexto central
export {
  useCarrito,
  CarritoProvider,
  type ProductoCarrito,
  type CuponDescuento,
  type InfoEnvio,
  metodosEnvio,
  cuponesDisponibles
} from '@/contexts/CarritoContext'

// Exportar hook de visibilidad
export { useCarritoVisibility } from '@/hooks/useCarritoVisibility'