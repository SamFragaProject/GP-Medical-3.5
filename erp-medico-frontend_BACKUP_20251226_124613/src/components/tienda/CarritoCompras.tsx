// Componente Carrito de Compras tipo WooCommerce para el ERP Médico
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
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useCarrito, metodosEnvio, cuponesDisponibles, type InfoEnvio, type ProductoCarrito } from '@/contexts/CarritoContext'

// Componente individual de producto en el carrito
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
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-b-0"
    >
      {/* Imagen del producto */}
      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        {producto.imagen ? (
          <img 
            src={producto.imagen} 
            alt={producto.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ShoppingCart className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{producto.nombre}</h4>
        {producto.categoria && (
          <p className="text-sm text-gray-500">{producto.categoria}</p>
        )}
        <p className="text-lg font-semibold text-primary">${producto.precio.toFixed(2)}</p>
      </div>

      {/* Controles de cantidad */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleCantidadChange(producto.cantidad - 1)}
          disabled={producto.cantidad <= 1}
        >
          <Minus className="w-3 h-3" />
        </Button>
        
        <Input
          type="number"
          value={producto.cantidad}
          onChange={(e) => handleCantidadChange(parseInt(e.target.value) || 0)}
          className="w-16 text-center h-8"
          min="1"
          max={producto.stock || 999}
        />
        
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleCantidadChange(producto.cantidad + 1)}
          disabled={producto.cantidad >= (producto.stock || 999)}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      {/* Total del producto */}
      <div className="text-right min-w-[80px]">
        <p className="font-semibold">${(producto.precio * producto.cantidad).toFixed(2)}</p>
      </div>

      {/* Botón eliminar */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
        onClick={() => removerProducto(producto.id)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </motion.div>
  )
}

// Componente para aplicar cupón
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="p-4 border-t bg-gray-50"
    >
      {cuponActivo ? (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Check className="w-3 h-3 mr-1" />
              Aplicado
            </Badge>
            <span className="font-medium">{cuponActivo.codigo}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removerCupon}
            className="text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Código de cupón"
              value={codigoCupon}
              onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleAplicarCupon()}
            />
            <Button 
              onClick={handleAplicarCupon}
              disabled={!codigoCupon.trim() || aplicando}
              className="whitespace-nowrap"
            >
              {aplicando ? 'Aplicando...' : 'Aplicar'}
            </Button>
          </div>
          
          {/* Cupones disponibles */}
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">Cupones disponibles:</p>
            <div className="grid gap-2">
              {cuponesDisponibles.slice(0, 3).map((cupon) => (
                <div key={cupon.id} className="flex items-center justify-between text-xs">
                  <span className="font-mono bg-gray-200 px-2 py-1 rounded">{cupon.codigo}</span>
                  <span>{cupon.descripcion}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCodigoCupon(cupon.codigo)
                      handleAplicarCupon()
                    }}
                    className="h-6 px-2 text-primary hover:text-primary"
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

// Componente para seleccionar método de envío
function SeleccionEnvio() {
  const { metodoEnvio, seleccionarMetodoEnvio } = useCarrito()

  return (
    <div className="space-y-3">
      <h4 className="font-medium flex items-center gap-2">
        <Truck className="w-4 h-4" />
        Método de Envío
      </h4>
      <div className="space-y-2">
        {metodosEnvio.map((metodo) => (
          <motion.label
            key={metodo.metodo}
            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
              metodoEnvio?.metodo === metodo.metodo 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input
              type="radio"
              name="envio"
              checked={metodoEnvio?.metodo === metodo.metodo}
              onChange={() => seleccionarMetodoEnvio(metodo)}
              className="text-primary"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{metodo.descripcion}</span>
                <span className="font-semibold">${metodo.precio.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-500">{metodo.tiempoEstimado}</p>
            </div>
          </motion.label>
        ))}
      </div>
    </div>
  )
}

// Componente principal del carrito
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
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Tu carrito está vacío</h3>
            <p className="text-gray-500">Agrega algunos productos para comenzar</p>
            <Button onClick={() => window.history.back()}>
              Continuar comprando
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  const handleCheckout = () => {
    if (!metodoEnvioSeleccionado()) {
      alert('Por favor selecciona un método de envío')
      return
    }
    setMostrarCheckout(true)
    // Aquí iría la lógica para proceder al checkout
    console.log('Procediendo al checkout...', {
      productos,
      cuponActivo,
      total
    })
  }

  const metodoEnvioSeleccionado = () => {
    return true // Simplificado para el ejemplo
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Carrito de Compras ({obtenerTotalItems()} {obtenerTotalItems() === 1 ? 'item' : 'items'})
          </h2>
          <p className="text-gray-500">Revisa tus productos antes de proceder</p>
        </div>
        <Button 
          variant="outline" 
          onClick={limpiarCarrito}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Limpiar carrito
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de productos */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Productos en el carrito
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <AnimatePresence>
                {productos.map((producto) => (
                  <ProductoCarritoItem key={producto.id} producto={producto} />
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Aplicar cupón */}
          <Card className="mt-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Cupón de Descuento
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setMostrarCupon(!mostrarCupon)}
                >
                  {mostrarCupon ? 'Ocultar' : 'Mostrar'}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Resumen del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subtotal */}
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>

              {/* Descuento por cupón */}
              {descuentoCupon > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex justify-between text-green-600"
                >
                  <span>Descuento ({cuponActivo?.codigo}):</span>
                  <span>-${descuentoCupon.toFixed(2)}</span>
                </motion.div>
              )}

              {/* Envío */}
              <div className="flex justify-between">
                <span>Envío:</span>
                <span className="font-medium">
                  {costoEnvio === 0 ? 'Gratis' : `$${costoEnvio.toFixed(2)}`}
                </span>
              </div>

              <hr className="border-gray-200" />

              {/* Total */}
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>

              {/* Botón de checkout */}
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleCheckout}
                disabled={productos.length === 0}
              >
                Proceder al Checkout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Selección de envío */}
          <Card>
            <CardContent className="p-4">
              <SeleccionEnvio />
            </CardContent>
          </Card>

          {/* Información adicional */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Gift className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">¿Sabías que...?</p>
                  <p>Los profesionales de la salud reciben un 20% de descuento con el cupón MEDICO20</p>
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold">¡Listo para el checkout!</h3>
                <p className="text-gray-600">
                  Tu carrito está listo. Serás redirigido al proceso de pago.
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setMostrarCheckout(false)}
                  >
                    Continuar comprando
                  </Button>
                  <Button className="flex-1">
                    Proceder al pago
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