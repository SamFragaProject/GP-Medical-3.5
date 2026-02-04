// Tienda Farmacéutica Online - Diseño Premium Azul
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
  AlertTriangle,
  Sparkles,
  Truck,
  Clock,
  BadgeCheck,
  HeartPulse
} from 'lucide-react'

// Contexts y providers
import { CarritoProvider, useCarrito } from '@/contexts/CarritoContext'

// Components de la tienda
import TiendaFarmacia from '@/components/tienda/TiendaFarmacia'
import CarritoCompras from '@/components/tienda/CarritoCompras'
import BotonCarritoFlotante from '@/components/tienda/BotonCarritoFlotante'

// Sistema de permisos
import { useAuth } from '@/contexts/AuthContext'
import { usePermissionCheck } from '@/hooks/usePermissionCheck'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Hook personalizado para visibilidad del carrito
import { useCarritoVisibility } from '@/hooks/useCarritoVisibility'

// Componente modal del carrito con diseño premium
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
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-blue-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div className="flex items-center justify-between p-6 border-b border-blue-100 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Tu Carrito</h2>
              <p className="text-blue-100 text-sm font-medium">
                {obtenerTotalItems()} {obtenerTotalItems() === 1 ? 'producto' : 'productos'} • ${total.toFixed(2)} MXN
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-xl h-12 w-12 p-0"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Contenido del modal */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-white">
          <CarritoCompras />
        </div>
      </motion.div>
    </motion.div>
  )
}

// Componente de la navegación premium de la tienda
function TiendaNavigation({
  mostrarCarrito,
  totalItems
}: {
  mostrarCarrito: () => void
  totalItems: number
}) {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 shadow-xl shadow-blue-500/20 sticky top-0 z-30">
      {/* Top bar con beneficios */}
      <div className="bg-blue-800/50 backdrop-blur-sm py-2 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8 text-xs text-blue-100 font-medium">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span>Envío Gratis +$500</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Entrega en 24-48h</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4" />
              <span>Productos Certificados</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Pago Seguro</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-between">
          {/* Logo y título */}
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                <HeartPulse className="h-7 w-7 text-blue-600" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </motion.div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                GPMedical<span className="text-emerald-400">Farma</span>
              </h1>
              <p className="text-sm text-blue-200 font-medium">Tu farmacia de confianza online</p>
            </div>
          </div>

          {/* Buscador central */}
          <div className="relative hidden lg:block flex-1 max-w-xl mx-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              placeholder="Buscar medicamentos, vitaminas, equipo médico..."
              className="pl-12 pr-6 py-6 w-full rounded-2xl border-0 bg-white/95 backdrop-blur-sm shadow-lg shadow-blue-900/10 text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-400/20"
            />
          </div>

          {/* Carrito */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={mostrarCarrito}
              className="relative bg-white hover:bg-blue-50 text-blue-600 font-bold px-6 py-6 rounded-2xl shadow-lg shadow-blue-900/20 group"
            >
              <ShoppingCart className="h-5 w-5 mr-2 group-hover:animate-pulse" />
              <span className="hidden sm:inline">Carrito</span>
              {totalItems > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-black min-w-6 h-6 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30"
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </motion.div>
              )}
            </Button>
          </motion.div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Navegación */}
      <TiendaNavigation
        mostrarCarrito={mostrarCarrito}
        totalItems={obtenerTotalItems()}
      />

      {/* Banner Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 py-12">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 mb-4 px-4 py-1.5 text-sm font-bold">
                  <Sparkles className="w-4 h-4 mr-2" />
                  NUEVO
                </Badge>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                  Cuida tu salud con los mejores productos
                </h2>
                <p className="text-lg text-blue-100 mb-6">
                  Descubre nuestra selección de medicamentos, vitaminas y equipo médico certificado. Todo lo que necesitas para tu bienestar.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-6 rounded-2xl shadow-xl shadow-blue-900/20">
                    Ver Ofertas
                  </Button>
                  <Button variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 font-bold px-8 py-6 rounded-2xl">
                    Catálogo Completo
                  </Button>
                </div>
              </motion.div>
            </div>
            <div className="hidden lg:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <div className="w-80 h-80 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                  <HeartPulse className="w-40 h-40 text-white/80" />
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce">
                  <span className="text-white font-black text-lg">-20%</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

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
            color: '#1e293b',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#3b82f6',
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
  const { user } = useAuth()
  const { canAccess } = usePermissionCheck()

  // Verificar acceso a la tienda
  const hasStoreAccess = canAccess('store', 'view') ||
    (user && ['super_admin', 'admin_empresa', 'medico'].includes(user.rol))

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-blue-100 max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Shield className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Acceso Requerido</h2>
          <p className="text-slate-500">Debes iniciar sesión para acceder a la farmacia</p>
        </div>
      </div>
    )
  }

  if (!hasStoreAccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-rose-100 max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-rose-100 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-rose-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Sin Permisos</h2>
          <p className="text-slate-500">No tienes permisos para acceder a la farmacia</p>
        </div>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        {/* Navegación compacta */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 shadow-xl sticky top-0 z-30">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <HeartPulse className="h-5 w-5 text-blue-600" />
                </div>
                <h1 className="text-xl font-black text-white">GPMedical<span className="text-emerald-400">Farma</span></h1>
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
              color: '#1e293b',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              borderRadius: '16px',
            },
          }}
        />
      </div>
    </CarritoProvider>
  )
}
