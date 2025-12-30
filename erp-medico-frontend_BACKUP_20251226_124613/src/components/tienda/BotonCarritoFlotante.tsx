// Componente Botón del Carrito Flotante para el ERP Médico
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Badge } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCarrito } from '@/contexts/CarritoContext'
import { useCarritoVisibility } from '@/hooks/useCarritoVisibility'

interface BotonCarritoFlotanteProps {
  onClick?: () => void
  className?: string
  position?: 'bottom-right' | 'bottom-left'
}

export default function BotonCarritoFlotante({ 
  onClick, 
  className = '',
  position = 'bottom-right' 
}: BotonCarritoFlotanteProps) {
  const { obtenerTotalItems } = useCarrito()
  const { alternarCarrito } = useCarritoVisibility()
  const totalItems = obtenerTotalItems()

  const handleClick = () => {
    onClick?.()
    alternarCarrito()
  }

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6'
  }

  return (
    <motion.div
      className={`fixed ${positionClasses[position]} z-40 ${className}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <Button
        onClick={handleClick}
        size="lg"
        className="relative h-14 w-14 rounded-full shadow-lg hover:shadow-xl bg-primary hover:bg-primary/90"
      >
        <ShoppingCart className="w-6 h-6" />
        
        {/* Badge con cantidad */}
        <AnimatePresence>
          {totalItems > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-2 -right-2"
            >
              <Badge 
                variant="destructive" 
                className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold animate-pulse"
              >
                {totalItems > 99 ? '99+' : totalItems}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulso cuando se agrega un producto */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary"
          initial={{ scale: 1, opacity: 0.7 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
        />
      </Button>
    </motion.div>
  )
}