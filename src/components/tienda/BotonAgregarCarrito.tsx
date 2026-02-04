// Componente Botón Agregar al Carrito para el ERP Médico
import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCarrito, type ProductoCarrito } from '@/contexts/CarritoContext'

interface BotonAgregarCarritoProps {
  producto: Omit<ProductoCarrito, 'cantidad'>
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showText?: boolean
  onAgregar?: () => void
}

export default function BotonAgregarCarrito({
  producto,
  variant = 'default',
  size = 'default',
  className = '',
  showText = true,
  onAgregar
}: BotonAgregarCarritoProps) {
  const { agregarProducto } = useCarrito()

  const handleAgregar = () => {
    agregarProducto(producto)
    onAgregar?.()
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        onClick={handleAgregar}
        variant={variant}
        size={size}
        className={className}
      >
        <ShoppingCart className={`${showText ? 'mr-2' : ''} w-4 h-4`} />
        {showText && 'Agregar al carrito'}
        {!showText && (
          <Plus className="w-4 h-4 ml-1" />
        )}
      </Button>
    </motion.div>
  )
}
