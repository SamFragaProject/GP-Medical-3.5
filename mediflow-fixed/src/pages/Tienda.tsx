// Página principal de la tienda del ERP Médico con sistema de permisos integrado
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { 
  Pill, 
  X, 
  ShoppingCart,
  Home,
  ArrowLeft,
  Filter,
  Search,
  Shield,
  AlertTriangle
} from 'lucide-react'

// Contexts y providers
import { CarritoProvider, useCarrito } from '@/contexts/CarritoContext'

// Components de la tienda
import TiendaFarmacia from '@/components/tienda/TiendaFarmacia'
import CarritoCompras from '@/components/tienda/CarritoCompras'
import BotonCarritoFlotante from '@/components/tienda/BotonCarritoFlotante'

// Sistema de permisos - temporalmente comentado hasta completar implementación
// import { PermissionGuard, AccessDeniedPage } from '@/components/permissions'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { usePermissionCheck } from '@/hooks/usePermissionCheck'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Hook personalizado para visibilidad del carrito
import { useCarritoVisibility } from '@/hooks/useCarritoVisibility'

// Componente modal del carrito
function CarritoModal({ 
  onClose 
}: { 
  onClose: () => void 
}) {
  const { productos } = useCarrito()
  const { obtenerTotalItems, total } = useCarrito()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Carrito de Compras</h2>
              <p className="text-green-100">
                {obtenerTotalItems()} {obtenerTotalItems() === 1 ? 'producto' : 'productos'} - ${total.toFixed(2)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Contenido del modal */}
        <div className="flex-1 overflow-y-auto">
          <CarritoCompras />
        </div>
      </motion.div>
    </motion.div>
  )
}

// Componente de la navegación de la tienda
function TiendaNavigation({ 
  mostrarCarrito, 
  totalItems 
}: { 
  mostrarCarrito: () => void
  totalItems: number 
}) {
  return (
    <div className="bg-white shadow-sm border-b border-green-100 sticky top-0 z-30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo y título */}
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 rounded-full">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent">
                Tienda Farmacéutica
              </h1>
              <p className="text-sm text-gray-600">Productos de salud y bienestar</p>
            </div>
          </div>

          {/* Navegación */}
          <div className="flex items-center space-x-4">
            {/* Buscador rápido */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar productos..."
                className="pl-10 w-64 border-green-200 focus:border-green-400"
              />
            </div>

            {/* Carrito */}
            <Button
              onClick={mostrarCarrito}
              className="relative bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Carrito
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente principal de contenido de la tienda
function TiendaContent() {
  const { visible, mostrarCarrito, ocultarCarrito } = useCarritoVisibility()
  const { obtenerTotalItems } = useCarrito()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navegación */}
      <TiendaNavigation 
        mostrarCarrito={mostrarCarrito}
        totalItems={obtenerTotalItems()}
      />

      {/* Contenido principal */}
      <main className="flex-1">
        <TiendaFarmacia />
      </main>

      {/* Modal del carrito */}
      <AnimatePresence>
        {visible && (
          <CarritoModal onClose={ocultarCarrito} />
        )}
      </AnimatePresence>

      {/* Botón flotante del carrito */}
      <BotonCarritoFlotante onClick={mostrarCarrito} />

      {/* Notificaciones toast */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}

// Componente principal de la página con verificación de permisos
export default function Tienda() {
  const { currentUser, empresaInfo } = useCurrentUser()
  const { canAccess } = usePermissionCheck()

  // Verificar acceso a la tienda
  const hasStoreAccess = canAccess('store', 'view') || 
                        (currentUser && ['admin_empresa', 'medico_trabajo', 'medico_especialista', 'medico_industrial'].includes(currentUser.hierarchy))

  if (!currentUser) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg text-gray-600">Debes iniciar sesión para acceder a la tienda</p>
      </div>
    )
  }

  if (!hasStoreAccess) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg text-red-600">No tienes permisos para acceder a la tienda</p>
      </div>
    )
  }

  return (
    <CarritoProvider>
      <TiendaContent />
    </CarritoProvider>
  )
}

// Componente para integración en rutas anidadas
export function TiendaPage() {
  return (
    <div className="min-h-screen">
      <Tienda />
    </div>
  )
}

// Componente para vista compacta (sin modal)
export function TiendaCompacta() {
  return (
    <CarritoProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Navegación compacta */}
        <div className="bg-white shadow-sm border-b border-green-100 sticky top-0 z-30">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 rounded-full">
                  <Pill className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-lg font-bold text-gray-800">Tienda</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="container mx-auto p-4">
          <TiendaFarmacia />
          
          {/* Carrito en la parte inferior */}
          <div className="mt-8">
            <CarritoCompras />
          </div>
        </div>

        {/* Botón flotante */}
        <BotonCarritoFlotante position="bottom-right" />

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#333',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
          }}
        />
      </div>
    </CarritoProvider>
  )
}