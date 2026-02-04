// Sistema de Checkout completo para farmacia con integración Stripe
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  ShoppingCart,
  Truck,
  CreditCard,
  MapPin,
  User,
  Building2,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Package,
  Shield,
  Clock,
  FileText,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useCarrito, ProductoCarrito } from '@/contexts/CarritoContext'
import toast from 'react-hot-toast'

// Tipos de datos
interface DatosEnvio {
  nombre: string
  apellido: string
  email: string
  telefono: string
  direccion: string
  ciudad: string
  estado: string
  codigo_postal: string
  instrucciones_especiales?: string
}

interface DatosFacturacion extends DatosEnvio {
  empresa?: string
  rfc?: string
  usar_datos_envio: boolean
}

// Esquemas de validación
const esquemaEnvio = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(10, 'Teléfono inválido'),
  direccion: z.string().min(5, 'Dirección requerida'),
  ciudad: z.string().min(2, 'Ciudad requerida'),
  estado: z.string().min(2, 'Estado requerido'),
  codigo_postal: z.string().min(5, 'Código postal requerido'),
  instrucciones_especiales: z.string().optional()
})

const esquemaFacturacion = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(10, 'Teléfono inválido'),
  direccion: z.string().min(5, 'Dirección requerida'),
  ciudad: z.string().min(2, 'Ciudad requerida'),
  estado: z.string().min(2, 'Estado requerido'),
  codigo_postal: z.string().min(5, 'Código postal requerido'),
  empresa: z.string().optional(),
  rfc: z.string().optional(),
  usar_datos_envio: z.boolean()
})

// Configuración de Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...')

// Componente de pago con Stripe Elements
function FormularioPago({ onSuccess, onError, datosEnvio, datosFacturacion, carrito, costos }: {
  onSuccess: (paymentIntent: any) => void
  onError: (error: string) => void
  datosEnvio: DatosEnvio
  datosFacturacion: DatosFacturacion
  carrito: ProductoCarrito[]
  costos: { subtotal: number; impuesto: number; envio: number; total: number }
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [procesandoPago, setProcesandoPago] = useState(false)
  const [mostrarPago, setMostrarPago] = useState(false)

  const manejarPago = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) return

    setProcesandoPago(true)
    
    try {
      // Crear PaymentIntent en el backend
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: carrito.map(item => ({
            id: item.id,
            nombre: item.nombre,
            precio: item.precio,
            cantidad: item.cantidad
          })),
          datosEnvio,
          datosFacturacion,
          costos
        })
      })

      const { client_secret, error: serverError } = await response.json()

      if (serverError) {
        throw new Error(serverError)
      }

      // Confirmar pago con Stripe
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/confirmacion`,
          payment_method_data: {
            billing_details: {
              name: `${datosFacturacion.nombre} ${datosFacturacion.apellido}`,
              email: datosFacturacion.email,
              address: {
                line1: datosFacturacion.direccion,
                city: datosFacturacion.ciudad,
                state: datosFacturacion.estado,
                postal_code: datosFacturacion.codigo_postal,
                country: 'MX'
              }
            }
          }
        },
        redirect: 'if_required'
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      // Pago exitoso
      toast.success('¡Pago procesado exitosamente!')
      onSuccess({ client_secret })
    } catch (error: any) {
      console.error('Error en el pago:', error)
      onError(error.message || 'Error procesando el pago')
    } finally {
      setProcesandoPago(false)
    }
  }

  return (
    <form onSubmit={manejarPago} className="space-y-6">
      {mostrarPago ? (
        <>
          <div className="p-4 border rounded-lg bg-gray-50">
            <PaymentElement />
          </div>
          
          <Button
            type="submit"
            disabled={!stripe || procesandoPago}
            className="w-full"
            size="lg"
          >
            {procesandoPago ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Procesando Pago...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Pagar ${costos.total.toFixed(2)} MXN
              </>
            )}
          </Button>
        </>
      ) : (
        <Button
          type="button"
          onClick={() => setMostrarPago(true)}
          variant="outline"
          className="w-full"
          size="lg"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Continuar con el Pago
        </Button>
      )}
    </form>
  )
}

// Componente principal del checkout
export function CheckoutFarmacia() {
  // Usar contexto del carrito global
  const { 
    productos: carrito, 
    subtotal, 
    costoEnvio, 
    total,
    actualizarCantidad, 
    removerProducto,
    limpiarCarrito 
  } = useCarrito()
  
  // Estados locales del checkout
  const [pasoActual, setPasoActual] = useState(1)
  const [metodoPago, setMetodoPago] = useState('card')
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [pedidoId, setPedidoId] = useState('')
  const [costos, setCostos] = useState({
    subtotal: 0,
    impuesto: 0,
    envio: 0,
    total: 0
  })

  // Estados para validaciones y errores
  const [errores, setErrores] = useState<string[]>([])
  const [cargando, setCargando] = useState(false)

  // Formularios
  const formEnvio = useForm<DatosEnvio>({
    resolver: zodResolver(esquemaEnvio),
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
      ciudad: '',
      estado: '',
      codigo_postal: '',
      instrucciones_especiales: ''
    }
  })

  const formFacturacion = useForm<DatosFacturacion>({
    resolver: zodResolver(esquemaFacturacion),
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
      ciudad: '',
      estado: '',
      codigo_postal: '',
      empresa: '',
      rfc: '',
      usar_datos_envio: true
    }
  })

  // Efectos
  useEffect(() => {
    calcularCostos()
  }, [carrito, subtotal, costoEnvio, total])

  useEffect(() => {
    // Sincronizar datos de facturación con datos de envío si está marcado
    if (formFacturacion.watch('usar_datos_envio')) {
      const datosEnvio = formEnvio.getValues()
      formFacturacion.setValue('nombre', datosEnvio.nombre)
      formFacturacion.setValue('apellido', datosEnvio.apellido)
      formFacturacion.setValue('email', datosEnvio.email)
      formFacturacion.setValue('telefono', datosEnvio.telefono)
      formFacturacion.setValue('direccion', datosEnvio.direccion)
      formFacturacion.setValue('ciudad', datosEnvio.ciudad)
      formFacturacion.setValue('estado', datosEnvio.estado)
      formFacturacion.setValue('codigo_postal', datosEnvio.codigo_postal)
    }
  }, [formFacturacion.watch('usar_datos_envio'), formEnvio])

  // Función para calcular costos adicionales
  const calcularCostos = () => {
    const impuesto = subtotal * 0.16 // IVA 16%
    const envio = costoEnvio // Usar el costo de envío del contexto
    const totalFinal = subtotal + impuesto + envio - 0 // Restar descuentos aquí si es necesario
    
    setCostos({ 
      subtotal, 
      impuesto, 
      envio, 
      total: totalFinal 
    })
  }

  const actualizarCantidadCheckout = (productoId: string, nuevaCantidad: number) => {
    actualizarCantidad(productoId, nuevaCantidad)
  }

  const eliminarProductoCheckout = (productoId: string) => {
    removerProducto(productoId)
    toast.success('Producto eliminado del carrito')
  }

  const validarPaso = async (paso: number): Promise<boolean> => {
    setErrores([])
    
    try {
      switch (paso) {
        case 1: // Datos de envío
          const datosEnvio = await formEnvio.trigger()
          if (!datosEnvio) {
            setErrores(['Por favor completa todos los campos requeridos'])
            return false
          }
          break
          
        case 2: // Datos de facturación
          const datosFacturacion = await formFacturacion.trigger()
          if (!datosFacturacion) {
            setErrores(['Por favor completa todos los campos de facturación'])
            return false
          }
          break
          
        case 3: // Método de pago
          if (!metodoPago) {
            setErrores(['Selecciona un método de pago'])
            return false
          }
          break
      }
      
      return true
    } catch (error) {
      console.error('Error validando paso:', error)
      setErrores(['Error validando los datos'])
      return false
    }
  }

  const siguientePaso = async () => {
    const esValido = await validarPaso(pasoActual)
    if (esValido && pasoActual < 4) {
      setPasoActual(prev => prev + 1)
    }
  }

  const pasoAnterior = () => {
    if (pasoActual > 1) {
      setPasoActual(prev => prev - 1)
    }
  }

  const procesarPedido = async (paymentIntent: any) => {
    setCargando(true)
    
    try {
      const datosEnvio = formEnvio.getValues()
      const datosFacturacion = formFacturacion.getValues()
      
      const pedidoData = {
        items: carrito,
        datosEnvio,
        datosFacturacion,
        metodoPago,
        costos,
        paymentIntentId: paymentIntent.client_secret,
        fecha_pedido: new Date().toISOString(),
        estado: 'pendiente_confirmacion'
      }

      // Enviar pedido al backend
      const response = await fetch('/api/crear-pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoData)
      })

      const { pedido_id, error } = await response.json()
      
      if (error) {
        throw new Error(error)
      }

      setPedidoId(pedido_id)
      
      // Enviar emails de confirmación
      await enviarEmailsConfirmacion(pedido_id, datosEnvio.email, datosFacturacion.email)
      
      // Limpiar carrito
      limpiarCarrito()
      
      setMostrarConfirmacion(true)
      toast.success('¡Pedido creado exitosamente!')
      
    } catch (error: any) {
      console.error('Error procesando pedido:', error)
      toast.error(error.message || 'Error procesando el pedido')
    } finally {
      setCargando(false)
    }
  }

  const enviarEmailsConfirmacion = async (pedidoId: string, emailEnvio: string, emailFacturacion: string) => {
    try {
      // Email al cliente
      await fetch('/api/enviar-email-cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedido_id: pedidoId,
          email: emailEnvio,
          datos: { carrito, costos }
        })
      })

      // Email a la farmacia
      await fetch('/api/enviar-email-farmacia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedido_id: pedidoId,
          email: 'ventas@farmacia.com',
          datos: { carrito, datosEnvio: formEnvio.getValues(), costos }
        })
      })
      
    } catch (error) {
      console.error('Error enviando emails:', error)
    }
  }

  const manejarErrorPago = (error: string) => {
    toast.error(`Error en el pago: ${error}`)
    setErrores([error])
  }

  // Renderizado de pasos
  const renderPasoEnvio = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Truck className="w-5 h-5 mr-2" />
          Datos de Envío
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              {...formEnvio.register('nombre')}
              placeholder="Juan"
              className={formEnvio.formState.errors.nombre ? 'border-red-500' : ''}
            />
            {formEnvio.formState.errors.nombre && (
              <p className="text-sm text-red-500">{formEnvio.formState.errors.nombre.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="apellido">Apellido *</Label>
            <Input
              {...formEnvio.register('apellido')}
              placeholder="Pérez"
              className={formEnvio.formState.errors.apellido ? 'border-red-500' : ''}
            />
            {formEnvio.formState.errors.apellido && (
              <p className="text-sm text-red-500">{formEnvio.formState.errors.apellido.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              {...formEnvio.register('email')}
              type="email"
              placeholder="juan@ejemplo.com"
              className={formEnvio.formState.errors.email ? 'border-red-500' : ''}
            />
            {formEnvio.formState.errors.email && (
              <p className="text-sm text-red-500">{formEnvio.formState.errors.email.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="telefono">Teléfono *</Label>
            <Input
              {...formEnvio.register('telefono')}
              placeholder="55 1234 5678"
              className={formEnvio.formState.errors.telefono ? 'border-red-500' : ''}
            />
            {formEnvio.formState.errors.telefono && (
              <p className="text-sm text-red-500">{formEnvio.formState.errors.telefono.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="direccion">Dirección *</Label>
          <Input
            {...formEnvio.register('direccion')}
            placeholder="Calle, número, colonia"
            className={formEnvio.formState.errors.direccion ? 'border-red-500' : ''}
          />
          {formEnvio.formState.errors.direccion && (
            <p className="text-sm text-red-500">{formEnvio.formState.errors.direccion.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ciudad">Ciudad *</Label>
            <Input
              {...formEnvio.register('ciudad')}
              placeholder="Ciudad de México"
              className={formEnvio.formState.errors.ciudad ? 'border-red-500' : ''}
            />
            {formEnvio.formState.errors.ciudad && (
              <p className="text-sm text-red-500">{formEnvio.formState.errors.ciudad.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="estado">Estado *</Label>
            <Select onValueChange={(value) => formEnvio.setValue('estado', value)}>
              <SelectTrigger className={formEnvio.formState.errors.estado ? 'border-red-500' : ''}>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cdmx">Ciudad de México</SelectItem>
                <SelectItem value="jalisco">Jalisco</SelectItem>
                <SelectItem value="nuevo_leon">Nuevo León</SelectItem>
                <SelectItem value="puebla">Puebla</SelectItem>
                <SelectItem value="queretaro">Querétaro</SelectItem>
                {/* Más estados... */}
              </SelectContent>
            </Select>
            {formEnvio.formState.errors.estado && (
              <p className="text-sm text-red-500">{formEnvio.formState.errors.estado.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="codigo_postal">Código Postal *</Label>
          <Input
            {...formEnvio.register('codigo_postal')}
            placeholder="01234"
            className={formEnvio.formState.errors.codigo_postal ? 'border-red-500' : ''}
          />
          {formEnvio.formState.errors.codigo_postal && (
            <p className="text-sm text-red-500">{formEnvio.formState.errors.codigo_postal.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="instrucciones_especiales">Instrucciones Especiales</Label>
          <Input
            {...formEnvio.register('instrucciones_especiales')}
            placeholder="Instrucciones para la entrega"
          />
        </div>
      </CardContent>
    </Card>
  )

  const renderPasoFacturacion = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Datos de Facturación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="usar_datos_envio"
            checked={formFacturacion.watch('usar_datos_envio')}
            onCheckedChange={(checked) => 
              formFacturacion.setValue('usar_datos_envio', checked as boolean)
            }
          />
          <Label htmlFor="usar_datos_envio">Usar los mismos datos que el envío</Label>
        </div>

        {!formFacturacion.watch('usar_datos_envio') && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="empresa">Empresa (Opcional)</Label>
                <Input
                  {...formFacturacion.register('empresa')}
                  placeholder="Nombre de la empresa"
                />
              </div>
              
              <div>
                <Label htmlFor="rfc">RFC (Opcional)</Label>
                <Input
                  {...formFacturacion.register('rfc')}
                  placeholder="XAXX010101000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facturacion_nombre">Nombre *</Label>
                <Input
                  {...formFacturacion.register('nombre')}
                  placeholder="Juan"
                  className={formFacturacion.formState.errors.nombre ? 'border-red-500' : ''}
                />
                {formFacturacion.formState.errors.nombre && (
                  <p className="text-sm text-red-500">{formFacturacion.formState.errors.nombre.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="facturacion_apellido">Apellido *</Label>
                <Input
                  {...formFacturacion.register('apellido')}
                  placeholder="Pérez"
                  className={formFacturacion.formState.errors.apellido ? 'border-red-500' : ''}
                />
                {formFacturacion.formState.errors.apellido && (
                  <p className="text-sm text-red-500">{formFacturacion.formState.errors.apellido.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facturacion_email">Email *</Label>
                <Input
                  {...formFacturacion.register('email')}
                  type="email"
                  placeholder="juan@ejemplo.com"
                  className={formFacturacion.formState.errors.email ? 'border-red-500' : ''}
                />
                {formFacturacion.formState.errors.email && (
                  <p className="text-sm text-red-500">{formFacturacion.formState.errors.email.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="facturacion_telefono">Teléfono *</Label>
                <Input
                  {...formFacturacion.register('telefono')}
                  placeholder="55 1234 5678"
                  className={formFacturacion.formState.errors.telefono ? 'border-red-500' : ''}
                />
                {formFacturacion.formState.errors.telefono && (
                  <p className="text-sm text-red-500">{formFacturacion.formState.errors.telefono.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="facturacion_direccion">Dirección *</Label>
              <Input
                {...formFacturacion.register('direccion')}
                placeholder="Calle, número, colonia"
                className={formFacturacion.formState.errors.direccion ? 'border-red-500' : ''}
              />
              {formFacturacion.formState.errors.direccion && (
                <p className="text-sm text-red-500">{formFacturacion.formState.errors.direccion.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facturacion_ciudad">Ciudad *</Label>
                <Input
                  {...formFacturacion.register('ciudad')}
                  placeholder="Ciudad de México"
                  className={formFacturacion.formState.errors.ciudad ? 'border-red-500' : ''}
                />
                {formFacturacion.formState.errors.ciudad && (
                  <p className="text-sm text-red-500">{formFacturacion.formState.errors.ciudad.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="facturacion_estado">Estado *</Label>
                <Select onValueChange={(value) => formFacturacion.setValue('estado', value)}>
                  <SelectTrigger className={formFacturacion.formState.errors.estado ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cdmx">Ciudad de México</SelectItem>
                    <SelectItem value="jalisco">Jalisco</SelectItem>
                    <SelectItem value="nuevo_leon">Nuevo León</SelectItem>
                    <SelectItem value="puebla">Puebla</SelectItem>
                    <SelectItem value="queretaro">Querétaro</SelectItem>
                  </SelectContent>
                </Select>
                {formFacturacion.formState.errors.estado && (
                  <p className="text-sm text-red-500">{formFacturacion.formState.errors.estado.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="facturacion_codigo_postal">Código Postal *</Label>
              <Input
                {...formFacturacion.register('codigo_postal')}
                placeholder="01234"
                className={formFacturacion.formState.errors.codigo_postal ? 'border-red-500' : ''}
              />
              {formFacturacion.formState.errors.codigo_postal && (
                <p className="text-sm text-red-500">{formFacturacion.formState.errors.codigo_postal.message}</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )

  const renderPasoPago = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Método de Pago
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={metodoPago} onValueChange={setMetodoPago}>
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="flex-1 cursor-pointer">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                <div>
                  <div className="font-medium">Tarjeta de Crédito/Débito</div>
                  <div className="text-sm text-gray-500">Visa, Mastercard, American Express</div>
                </div>
              </div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="oxxo" id="oxxo" />
            <Label htmlFor="oxxo" className="flex-1 cursor-pointer">
              <div className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                <div>
                  <div className="font-medium">Pago en OXXO</div>
                  <div className="text-sm text-gray-500">Pago en efectivo en cualquier OXXO</div>
                </div>
              </div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="transferencia" id="transferencia" />
            <Label htmlFor="transferencia" className="flex-1 cursor-pointer">
              <div className="flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                <div>
                  <div className="font-medium">Transferencia Bancaria</div>
                  <div className="text-sm text-gray-500">SPEI o transferencia interbancaria</div>
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {metodoPago === 'card' && (
          <div className="mt-6">
            <Elements stripe={stripePromise} options={{
              mode: 'payment',
              currency: 'mxn',
              amount: Math.round(costos.total * 100), // Stripe usa centavos
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#0ea5e9',
                }
              }
            }}>
              <FormularioPago
                onSuccess={procesarPedido}
                onError={manejarErrorPago}
                datosEnvio={formEnvio.getValues()}
                datosFacturacion={formFacturacion.getValues()}
                carrito={carrito}
                costos={costos}
              />
            </Elements>
          </div>
        )}

        {metodoPago === 'oxxo' && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-900">Pago en OXXO</span>
            </div>
            <p className="text-sm text-blue-800">
              Recibirás un código de pago por email que podrás usar en cualquier sucursal OXXO.
            </p>
          </div>
        )}

        {metodoPago === 'transferencia' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium text-green-900">Transferencia Bancaria</span>
            </div>
            <p className="text-sm text-green-800">
              Recibirás los datos bancarios por email para realizar la transferencia.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderResumenOrden = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2" />
          Resumen de Orden
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items del carrito */}
        <div className="space-y-3">
          {carrito.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{item.nombre}</div>
                {item.categoria && (
                  <div className="text-sm text-gray-500">{item.categoria}</div>
                )}
                <div className="text-sm text-gray-500">
                  ${item.precio.toFixed(2)} x {item.cantidad}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => actualizarCantidadCheckout(item.id, item.cantidad - 1)}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                
                <span className="w-8 text-center">{item.cantidad}</span>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => actualizarCantidadCheckout(item.id, item.cantidad + 1)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => eliminarProductoCheckout(item.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
              
              <div className="ml-4 font-medium">
                ${(item.precio * item.cantidad).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Desglose de costos */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${costos.subtotal.toFixed(2)} MXN</span>
          </div>
          
          <div className="flex justify-between">
            <span>Impuestos (IVA 16%):</span>
            <span>${costos.impuesto.toFixed(2)} MXN</span>
          </div>
          
          <div className="flex justify-between">
            <span>Envío:</span>
            <span className={costos.envio === 0 ? 'text-green-600 font-medium' : ''}>
              {costos.envio === 0 ? 'GRATIS' : `$${costos.envio.toFixed(2)} MXN`}
            </span>
          </div>
          
          {costos.envio === 0 && (
            <div className="text-sm text-green-600">
              ¡Felicidades! Tienes envío gratis
            </div>
          )}
          
          <Separator />
          
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>${costos.total.toFixed(2)} MXN</span>
          </div>
        </div>

        {/* Información de entrega */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center mb-2">
            <Truck className="w-4 h-4 text-blue-600 mr-2" />
            <span className="font-medium text-blue-900">Información de Entrega</span>
          </div>
          <div className="text-sm text-blue-800">
            <div>Tiempo estimado: 1-3 días hábiles</div>
            <div>Área de cobertura: Ciudad de México y área metropolitana</div>
          </div>
        </div>

        {/* Seguridad */}
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-2">
            <Shield className="w-4 h-4 text-green-600 mr-2" />
            <span className="font-medium text-green-900">Compra Segura</span>
          </div>
          <div className="text-sm text-green-800">
            Tus datos están protegidos con encriptación SSL de 256 bits
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Validación de carrito vacío
  if (carrito.length === 0 && !mostrarConfirmacion) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="text-center py-12">
            <CardContent>
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
              <p className="text-gray-600 mb-6">Agrega productos a tu carrito para continuar con la compra</p>
              <Button onClick={() => window.history.back()}>
                Continuar Comprando
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Finalizar Compra</h1>
          
          {/* Indicador de pasos */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            {[1, 2, 3, 4].map((paso) => (
              <div key={paso} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    paso <= pasoActual
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {paso}
                </div>
                {paso < 4 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      paso < pasoActual ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between text-sm text-gray-600 max-w-md mx-auto">
            <span>Envío</span>
            <span>Facturación</span>
            <span>Pago</span>
            <span>Confirmación</span>
          </div>
        </div>

        {/* Mostrar errores */}
        <AnimatePresence>
          {errores.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-center mb-2">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="font-medium text-red-900">Error</span>
              </div>
              <ul className="text-sm text-red-800">
                {errores.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-2">
            <form onSubmit={(e) => e.preventDefault()}>
              {pasoActual === 1 && renderPasoEnvio()}
              {pasoActual === 2 && renderPasoFacturacion()}
              {pasoActual === 3 && renderPasoPago()}
            </form>

            {/* Botones de navegación */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={pasoAnterior}
                disabled={pasoActual === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>

              {pasoActual < 3 && (
                <Button onClick={siguientePaso} disabled={cargando}>
                  Siguiente
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Resumen lateral */}
          <div className="lg:col-span-1">
            {renderResumenOrden()}
          </div>
        </div>

        {/* Modal de confirmación */}
        <Dialog open={mostrarConfirmacion} onOpenChange={setMostrarConfirmacion}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-green-600">
                <CheckCircle className="w-6 h-6 mr-2" />
                ¡Pedido Confirmado!
              </DialogTitle>
            </DialogHeader>
            
            <div className="text-center py-4">
              <div className="mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-green-600" />
                </div>
                
                <h3 className="text-lg font-semibold mb-2">Gracias por tu compra</h3>
                <p className="text-gray-600 mb-4">
                  Tu pedido #{pedidoId} ha sido confirmado y será procesado pronto.
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Total pagado:</span>
                  <span className="font-bold">${costos.total.toFixed(2)} MXN</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Tiempo estimado:</span>
                  <span>1-3 días hábiles</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Seguimiento:</span>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Ver pedido
                  </Button>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Button
                  onClick={() => window.location.href = '/mis-pedidos'}
                  className="w-full"
                >
                  Ver Mis Pedidos
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="w-full"
                >
                  Continuar Comprando
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default CheckoutFarmacia
