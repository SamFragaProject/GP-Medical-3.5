// Componente Carrito de Compras Premium - Estilo Farmacia Online
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Tag,
  Truck,
  CreditCard,
  X,
  Check,
  Gift,
  ArrowRight,
  Shield,
  Clock,
  Package,
  Sparkles,
  BadgeCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useCarrito, metodosEnvio, cuponesDisponibles, type InfoEnvio, type ProductoCarrito } from '@/contexts/CarritoContext'

// Componente individual de producto en el carrito - Diseño Premium
function ProductoCarritoItem({ producto }: { producto: ProductoCarrito }) {
  const { actualizarCantidad, removerProducto } = useCarrito()

  const handleCantidadChange = (nuevaCantidad: number) => {
    if (nuevaCantidad >= 0) {
      actualizarCantidad(producto.id, nuevaCantidad)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-4 p-5 border-b border-slate-100 last:border-b-0 hover:bg-blue-50/30 transition-colors group"
    >
      {/* Imagen del producto */}
      <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-blue-100">
        {producto.imagen ? (
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="w-8 h-8 text-blue-300" />
        )}
      </div>

      {/* Información del producto */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-slate-800 truncate text-lg">{producto.nombre}</h4>
        {producto.categoria && (
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 rounded-lg mt-1">
            {producto.categoria}
          </Badge>
        )}
        <p className="text-xl font-black text-blue-600 mt-1">${producto.precio.toFixed(2)}</p>
      </div>

      {/* Controles de cantidad */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg hover:bg-white hover:shadow-sm"
          onClick={() => handleCantidadChange(producto.cantidad - 1)}
          disabled={producto.cantidad <= 1}
        >
          <Minus className="w-4 h-4 text-slate-600" />
        </Button>

        <span className="w-10 text-center font-bold text-slate-800">{producto.cantidad}</span>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg hover:bg-white hover:shadow-sm"
          onClick={() => handleCantidadChange(producto.cantidad + 1)}
          disabled={producto.cantidad >= (producto.stock || 999)}
        >
          <Plus className="w-4 h-4 text-slate-600" />
        </Button>
      </div>

      {/* Total del producto */}
      <div className="text-right min-w-[100px]">
        <p className="font-black text-xl text-slate-800">${(producto.precio * producto.cantidad).toFixed(2)}</p>
        <p className="text-xs text-slate-400">MXN</p>
      </div>

      {/* Botón eliminar */}
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => removerProducto(producto.id)}
      >
        <Trash2 className="w-5 h-5" />
      </Button>
    </motion.div>
  )
}

// Componente para aplicar cupón - Diseño Premium
function AplicarCupon({ onClose }: { onClose: () => void }) {
  const { aplicarCupon, cuponActivo, removerCupon } = useCarrito()
  const [codigoCupon, setCodigoCupon] = useState('')
  const [aplicando, setAplicando] = useState(false)

  const handleAplicarCupon = async () => {
    if (!codigoCupon.trim()) return

    setAplicando(true)
    const exito = await aplicarCupon(codigoCupon.trim())
    setAplicando(false)

    if (exito) {
      setCodigoCupon('')
      onClose()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="p-5 border-t border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50"
    >
      {cuponActivo ? (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-emerald-800">{cuponActivo.codigo}</p>
              <p className="text-sm text-emerald-600">Cupón aplicado correctamente</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removerCupon}
            className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Ingresa tu código de cupón"
                value={codigoCupon}
                onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleAplicarCupon()}
                className="pl-12 py-6 rounded-2xl border-blue-200 focus:border-blue-400"
              />
            </div>
            <Button
              onClick={handleAplicarCupon}
              disabled={!codigoCupon.trim() || aplicando}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 rounded-2xl"
            >
              {aplicando ? 'Aplicando...' : 'Aplicar'}
            </Button>
          </div>

          {/* Cupones disponibles */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-100">
            <p className="font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              Cupones disponibles:
            </p>
            <div className="grid gap-2">
              {cuponesDisponibles.slice(0, 3).map((cupon) => (
                <div key={cupon.id} className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm">{cupon.codigo}</span>
                    <span className="text-sm text-slate-600">{cupon.descripcion}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCodigoCupon(cupon.codigo)
                    }}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Usar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Componente para seleccionar método de envío - Diseño Premium
function SeleccionEnvio() {
  const { metodoEnvio, seleccionarMetodoEnvio } = useCarrito()

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-slate-800 flex items-center gap-2">
        <Truck className="w-5 h-5 text-blue-600" />
        Método de Envío
      </h4>
      <div className="space-y-3">
        {metodosEnvio.map((metodo) => (
          <motion.label
            key={metodo.metodo}
            className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${metodoEnvio?.metodo === metodo.metodo
                ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10'
                : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50'
              }`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${metodoEnvio?.metodo === metodo.metodo ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
              }`}>
              {metodoEnvio?.metodo === metodo.metodo && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            <input
              type="radio"
              name="envio"
              checked={metodoEnvio?.metodo === metodo.metodo}
              onChange={() => seleccionarMetodoEnvio(metodo)}
              className="sr-only"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">{metodo.descripcion}</span>
                <span className={`font-black ${metodo.precio === 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                  {metodo.precio === 0 ? 'GRATIS' : `$${metodo.precio.toFixed(2)}`}
                </span>
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" />
                {metodo.tiempoEstimado}
              </p>
            </div>
          </motion.label>
        ))}
      </div>
    </div>
  )
}

// Componente principal del carrito - Diseño Premium
export default function CarritoCompras() {
  const {
    productos,
    subtotal,
    descuentoCupon,
    costoEnvio,
    total,
    cuponActivo,
    obtenerTotalItems,
    limpiarCarrito
  } = useCarrito()

  const [mostrarCupon, setMostrarCupon] = useState(false)
  const [mostrarCheckout, setMostrarCheckout] = useState(false)

  // Si el carrito está vacío
  if (productos.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-0 shadow-xl rounded-3xl overflow-hidden">
        <CardContent className="p-12 text-center bg-gradient-to-br from-slate-50 to-blue-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="w-24 h-24 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto">
              <ShoppingCart className="w-12 h-12 text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800">Tu carrito está vacío</h3>
              <p className="text-slate-500 mt-2">Agrega algunos productos para comenzar</p>
            </div>
            <Button
              onClick={() => window.history.back()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-6 rounded-2xl"
            >
              Explorar Productos
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  const handleCheckout = () => {
    setMostrarCheckout(true)
    console.log('Procediendo al checkout...', {
      productos,
      cuponActivo,
      total
    })
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-black text-slate-800">
            Tu Carrito
          </h2>
          <p className="text-slate-500 mt-1">
            {obtenerTotalItems()} {obtenerTotalItems() === 1 ? 'producto' : 'productos'} listos para ordenar
          </p>
        </div>
        <Button
          variant="outline"
          onClick={limpiarCarrito}
          className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 border-rose-200 rounded-xl font-semibold"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Vaciar carrito
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de productos */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-5 px-6">
              <CardTitle className="flex items-center gap-3 text-lg font-bold">
                <Package className="w-5 h-5" />
                Productos ({obtenerTotalItems()})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-white">
              <AnimatePresence>
                {productos.map((producto) => (
                  <ProductoCarritoItem key={producto.id} producto={producto} />
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Aplicar cupón */}
          <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
            <CardHeader className="py-4 px-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-800 font-bold">
                  <Tag className="w-5 h-5 text-blue-600" />
                  Cupón de Descuento
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMostrarCupon(!mostrarCupon)}
                  className="text-blue-600 hover:text-blue-800 font-semibold rounded-xl"
                >
                  {mostrarCupon ? 'Ocultar' : 'Añadir cupón'}
                </Button>
              </div>
            </CardHeader>
            <AnimatePresence>
              {mostrarCupon && (
                <AplicarCupon onClose={() => setMostrarCupon(false)} />
              )}
            </AnimatePresence>
          </Card>
        </div>

        {/* Resumen del pedido */}
        <div className="space-y-4">
          <Card className="border-0 shadow-xl rounded-3xl overflow-hidden sticky top-4">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 px-6">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <CreditCard className="w-5 h-5" />
                Resumen del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6 bg-white">
              {/* Subtotal */}
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
              </div>

              {/* Descuento por cupón */}
              <AnimatePresence>
                {descuentoCupon > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex justify-between text-emerald-600"
                  >
                    <span className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      Descuento ({cuponActivo?.codigo}):
                    </span>
                    <span className="font-bold">-${descuentoCupon.toFixed(2)}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Envío */}
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  <Truck className="w-4 h-4" />
                  Envío:
                </span>
                <span className={`font-semibold ${costoEnvio === 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                  {costoEnvio === 0 ? 'Gratis' : `$${costoEnvio.toFixed(2)}`}
                </span>
              </div>

              <hr className="border-slate-200" />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-slate-800">Total:</span>
                <div className="text-right">
                  <span className="text-3xl font-black text-blue-600">${total.toFixed(2)}</span>
                  <p className="text-xs text-slate-400">MXN (IVA incluido)</p>
                </div>
              </div>

              {/* Botón de checkout */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-7 rounded-2xl shadow-xl shadow-blue-500/30"
                  onClick={handleCheckout}
                  disabled={productos.length === 0}
                >
                  Proceder al Pago
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>

              {/* Garantías */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>Pago Seguro</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <BadgeCheck className="w-4 h-4 text-emerald-500" />
                  <span>Garantizado</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selección de envío */}
          <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
            <CardContent className="p-5">
              <SeleccionEnvio />
            </CardContent>
          </Card>

          {/* Información adicional */}
          <Card className="border-0 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl overflow-hidden shadow-xl shadow-blue-500/20">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold mb-1">¡Oferta Especial!</p>
                  <p className="text-blue-100 text-sm">Los profesionales de la salud reciben 20% de descuento con el cupón <span className="font-mono bg-white/20 px-2 py-0.5 rounded">MEDICO20</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de confirmación de checkout */}
      <AnimatePresence>
        {mostrarCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center space-y-5">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800">¡Listo para pagar!</h3>
                  <p className="text-slate-500 mt-2">
                    Tu carrito está listo. Serás redirigido al proceso de pago seguro.
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Total a pagar:</span>
                    <span className="text-2xl font-black text-blue-600">${total.toFixed(2)} MXN</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 py-6 rounded-2xl border-slate-200 font-semibold"
                    onClick={() => setMostrarCheckout(false)}
                  >
                    Seguir comprando
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-6 rounded-2xl font-bold shadow-lg shadow-blue-500/30">
                    Pagar ahora
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
