// Archivo de índice para la página de la tienda

// Re-exportar componentes relacionados para facilitar las importaciones
export { default as Tienda } from '@/pages/Tienda'
export { default as CarritoCompras } from '@/components/tienda/CarritoCompras'
export { default as BotonCarritoFlotante } from '@/components/tienda/BotonCarritoFlotante'
export { default as CheckoutFarmacia } from '@/components/tienda/CheckoutFarmacia'
export { default as SistemaEnvios } from '@/components/tienda/SistemaEnvios'

// Re-exportar context y tipos
export { CarritoProvider, useCarrito } from '@/contexts/CarritoContext'
export type { ProductoCarrito, CuponDescuento, InfoEnvio } from '@/contexts/CarritoContext'

// Re-exportar hooks
export { useCarritoVisibility } from '@/hooks/useCarritoVisibility'