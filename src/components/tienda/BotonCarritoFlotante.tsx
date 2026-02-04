// Componente Botón del Carrito Flotante Premium para el ERP Médico
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  const { obtenerTotalItems, total } = useCarrito()
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
      initial={{ scale: 0, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={handleClick}
          size="lg"
          className="relative h-16 w-16 rounded-2xl shadow-2xl shadow-blue-500/30 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0"
        >
          <ShoppingCart className="w-7 h-7 text-white" />

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
                  className="h-7 w-7 rounded-xl p-0 flex items-center justify-center text-xs font-black bg-gradient-to-r from-rose-500 to-pink-500 text-white border-2 border-white shadow-lg shadow-rose-500/30"
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulso premium cuando hay items */}
          {totalItems > 0 && (
            <motion.div
              className="absolute inset-0 rounded-2xl bg-blue-500"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.5 }}
            />
          )}
        </Button>
      </motion.div>

      {/* Tooltip con total */}
      {totalItems > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className={`absolute ${position === 'bottom-right' ? 'right-20' : 'left-20'} bottom-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xl whitespace-nowrap`}
        >
          ${total.toFixed(2)} MXN
          <div className={`absolute top-1/2 -translate-y-1/2 ${position === 'bottom-right' ? '-right-2' : '-left-2'} w-0 h-0 border-t-[6px] border-b-[6px] border-transparent ${position === 'bottom-right' ? 'border-l-[8px] border-l-slate-900' : 'border-r-[8px] border-r-slate-900'}`} />
        </motion.div>
      )}
    </motion.div>
  )
}
