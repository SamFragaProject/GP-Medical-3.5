// Hook personalizado para manejar la visibilidad del carrito
import { useState, useCallback } from 'react'

export function useCarritoVisibility() {
  const [visible, setVisible] = useState(false)

  const mostrarCarrito = useCallback(() => {
    setVisible(true)
  }, [])

  const ocultarCarrito = useCallback(() => {
    setVisible(false)
  }, [])

  const alternarCarrito = useCallback(() => {
    setVisible(prev => !prev)
  }, [])

  return {
    visible,
    mostrarCarrito,
    ocultarCarrito,
    alternarCarrito
  }
}