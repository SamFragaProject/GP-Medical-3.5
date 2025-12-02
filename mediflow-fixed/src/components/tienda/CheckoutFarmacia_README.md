# CheckoutFarmacia - Sistema de Checkout Completo

## Descripción
Componente React completo para el proceso de checkout de una farmacia en línea con integración completa de Stripe, manejo de carrito, validaciones robustas y experiencia de usuario optimizada.

## Funcionalidades Principales

### 🔄 Flujo de Checkout Multi-paso
1. **Datos de Envío**: Formulario completo con validaciones
2. **Datos de Facturación**: Opción de usar mismos datos del envío
3. **Método de Pago**: Integración con Stripe Elements + otros métodos
4. **Confirmación**: Modal de confirmación con detalles del pedido

### 💳 Métodos de Pago Soportados
- **Tarjeta de Crédito/Débito**: Integración completa con Stripe Elements
- **Pago en OXXO**: Generación de códigos de pago
- **Transferencia Bancaria**: Datos bancarios para SPEI/interbancaria

### 🛒 Gestión de Carrito
- Visualización completa de items
- Actualización de cantidades en tiempo real
- Eliminación de productos
- Persistencia en localStorage
- Cálculo automático de costos

### 💰 Cálculos Automáticos
- **Subtotal**: Suma de todos los productos
- **Impuestos**: IVA 16% automático
- **Envío**: Gratis sobre $1,000 MXN, otherwise $150 MXN
- **Total**: Cálculo en tiempo real

### 📧 Sistema de Emails
- Email de confirmación al cliente
- Notificación a la farmacia
- Datos completos del pedido

### ✅ Validaciones Robustas
- Validación con Zod schema
- React Hook Form integration
- Validación en tiempo real
- Mensajes de error claros

### 🔒 Seguridad
- Integración con Stripe Elements
- Encriptación SSL
- Validación de datos del lado cliente y servidor
- Manejo seguro de información de pago

## Props y Configuración

```tsx
// Uso básico
import { CheckoutFarmacia } from '@/components/tienda'

function App() {
  return (
    <div className="app">
      <CheckoutFarmacia />
    </div>
  )
}
```

## Variables de Entorno Requeridas

```bash
# .env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_de_stripe
```

## APIs Backend Requeridas

### 1. Crear PaymentIntent
```typescript
POST /api/create-payment-intent
{
  items: Array<{
    id: string
    nombre: string
    precio: number
    cantidad: number
  }>
  datosEnvio: DatosEnvio
  datosFacturacion: DatosFacturacion
  costos: { subtotal: number; impuesto: number; envio: number; total: number }
}
```

### 2. Crear Pedido
```typescript
POST /api/crear-pedido
{
  items: ItemCarrito[]
  datosEnvio: DatosEnvio
  datosFacturacion: DatosFacturacion
  metodoPago: string
  costos: CostosCalculados
  paymentIntentId?: string
  fecha_pedido: string
  estado: string
}
```

### 3. Emails de Confirmación
```typescript
POST /api/enviar-email-cliente
POST /api/enviar-email-farmacia
```

## Estructura de Datos

### ProductoFarmacia
```typescript
interface ProductoFarmacia {
  id: string
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  requiere_receta: boolean
  stock: number
  imagen?: string
  laboratorio?: string
  generico?: string
}
```

### ItemCarrito
```typescript
interface ItemCarrito {
  producto: ProductoFarmacia
  cantidad: number
  subtotal: number
}
```

### DatosEnvio
```typescript
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
```

## Dependencias Adicionales

```bash
pnpm add @stripe/stripe-js @stripe/react-stripe-js
```

## Características UX/UI

### 🎨 Diseño
- Interfaz moderna y responsiva
- Animaciones fluidas con Framer Motion
- Indicadores de progreso visuales
- Estados de carga y error claros

### 📱 Responsive Design
- Optimizado para móviles
- Grid responsive con breakpoints
- Touch-friendly buttons
- Navegación intuitiva

### ♿ Accesibilidad
- Labels apropiados para formularios
- Mensajes de error descriptivos
- Navegación por teclado
- Contraste adecuado

## Estados del Componente

```typescript
// Estados principales
const [pasoActual, setPasoActual] = useState(1)
const [carrito, setCarrito] = useState<ItemCarrito[]>([])
const [metodoPago, setMetodoPago] = useState('card')
const [costos, setCostos] = useState({ subtotal, impuesto, envio, total })
const [errores, setErrores] = useState<string[]>([])
const [cargando, setCargando] = useState(false)
```

## Manejo de Errores

### Validación de Formularios
- Validación en tiempo real con Zod
- Mensajes de error específicos
- Prevención de envío con datos inválidos

### Errores de Pago
- Manejo de errores de Stripe
- Validación de payment intent
- Retry automático en fallos de red

### Errores de Red
- Timeout handling
- Fallbacks para APIs no disponibles
- Toast notifications informativas

## Personalización

### Temas y Estilos
El componente usa Tailwind CSS y puede ser personalizado modificando:
- Colores en tailwind.config.js
- Componentes UI de shadcn/ui
- Animaciones en framer-motion

### Configuración de Stripe
```typescript
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
)

<Elements stripe={stripePromise} options={{
  mode: 'payment',
  currency: 'mxn',
  amount: Math.round(costos.total * 100),
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#0ea5e9',
    }
  }
}}>
```

## Testing

### Casos de Prueba Recomendados
1. **Flujo completo de checkout**
2. **Validación de formularios**
3. **Cálculos de costos**
4. **Manejo de errores de red**
5. **Pagos exitosos y fallidos**
6. **Persistencia del carrito**

### Ejemplo de Test
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { CheckoutFarmacia } from './CheckoutFarmacia'

test('completa proceso de checkout', async () => {
  render(<CheckoutFarmacia />)
  
  // Llenar formulario de envío
  fireEvent.change(screen.getByLabelText(/nombre/i), {
    target: { value: 'Juan' }
  })
  
  // Continuar al siguiente paso
  fireEvent.click(screen.getByText(/siguiente/i))
  
  // Verificar que avanzó al paso 2
  expect(screen.getByText(/facturación/i)).toBeInTheDocument()
})
```

## Monitoreo y Analytics

### Eventos Sugeridos
- `checkout_step_viewed` - Paso del checkout visto
- `payment_method_selected` - Método de pago seleccionado
- `checkout_completed` - Checkout completado
- `payment_failed` - Pago fallido
- `form_validation_error` - Error de validación

### Métricas Importantes
- Tasa de conversión por paso
- Tiempo promedio de checkout
- Errores de validación más comunes
- Métodos de pago preferidos

## Consideraciones de Performance

### Optimizaciones Implementadas
- Lazy loading de Stripe Elements
- Memoización de cálculos costosos
- Debounced validation
- Virtual scrolling para carritos grandes

### Recomendaciones Adicionales
- Implementar code splitting
- Cache de datos de productos
- Pre-carga de métodos de pago
- Service workers para offline

## Seguridad

### Medidas Implementadas
- Sanitización de inputs
- Validación del lado cliente y servidor
- Encriptación de datos sensibles
- HTTPS obligatorio en producción

### Checklist de Seguridad
- [ ] Variables de entorno seguras
- [ ] Validación server-side robusta
- [ ] Rate limiting en APIs
- [ ] Logs de auditoría
- [ ] Tests de penetración

---

## Autor
Desarrollado para el sistema ERP Médico - Módulo de Farmacia

## Versión
1.0.0 - Implementación inicial completa

## Licencia
Propiedad del proyecto ERP Médico