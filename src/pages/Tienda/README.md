# Página Principal de la Tienda - ERP Médico

## Descripción

La página `Tienda.tsx` es la página principal de la tienda farmacéutica del sistema ERP Médico. Integra todos los componentes necesarios para crear una experiencia completa de compra de productos farmacéuticos y de salud.

## Características

### ✅ Funcionalidades Implementadas

1. **Integración Completa de Componentes**
   - `TiendaFarmacia`: Catálogo de productos con filtros y búsqueda
   - `CarritoCompras`: Gestión completa del carrito de compras
   - `BotonCarritoFlotante`: Botón flotante con contador de productos
   - `CarritoContext`: Estado global del carrito con persistencia

2. **Estado Global del Carrito**
   - Persistencia en localStorage
   - Cálculos automáticos de totales
   - Sistema de cupones de descuento
   - Métodos de envío configurables
   - Notificaciones toast

3. **Interfaz de Usuario Moderna**
   - Modal del carrito con animaciones
   - Diseño responsive
   - Tema médico con gradientes verde-azul
   - Navegación integrada
   - Filtros avanzados de productos

4. **Experiencia de Compra**
   - Búsqueda de productos en tiempo real
   - Filtros por categoría, precio y marca
   - Vista en grid y lista
   - Favoritos de productos
   - Gestión de stock

## Estructura de Componentes

```
Tienda.tsx
├── CarritoProvider (Context)
├── TiendaContent
│   ├── TiendaNavigation
│   ├── TiendaFarmacia
│   ├── CarritoModal (AnimatePresence)
│   └── BotonCarritoFlotante
└── Toaster (Notificaciones)
```

## Uso

### Uso Básico

```tsx
import Tienda from '@/pages/Tienda'

function App() {
  return (
    <Router>
      <Route path="/tienda" element={<Tienda />} />
    </Router>
  )
}
```

### Uso con Layout

```tsx
import { Layout } from '@/components/Layout'
import Tienda from '@/pages/Tienda'

function App() {
  return (
    <Router>
      <Route path="/tienda" element={
        <Layout>
          <Tienda />
        </Layout>
      } />
    </Router>
  )
}
```

### Variantes Disponibles

```tsx
// Página principal con modal del carrito
import { Tienda, TiendaPage } from '@/pages/Tienda'

// Vista compacta sin modal (para páginas más pequeñas)
import { TiendaCompacta } from '@/pages/Tienda'

// Solo el provider para usar en componentes existentes
import { CarritoProvider } from '@/pages/Tienda'
```

## Configuración

### CarritoContext

El estado global del carrito incluye:

```tsx
interface EstadoCarrito {
  productos: ProductoCarrito[]
  cuponActivo: CuponDescuento | null
  metodoEnvio: InfoEnvio | null
  subtotal: number
  descuentoCupon: number
  costoEnvio: number
  total: number
}
```

### Cupones Disponibles

Los cupones están predefinidos en el contexto:
- `BIENVENIDO10`: 10% descuento (mín. $50)
- `MEDICO20`: 20% descuento profesionales salud (mín. $100)
- `SAVE25`: $25 descuento (mín. $200)

### Métodos de Envío

Opciones de envío configurables:
- **Estándar**: $15.99 (5-7 días)
- **Express**: $29.99 (2-3 días)
- **Mismo día**: $49.99 (hasta 8 PM)

## Rutas y Permisos

### Ruta Configurada

```tsx
// En App.tsx
<Route 
  path="tienda" 
  element={
    <ProtectedRoute requiredRoles={['admin_empresa']} 
                   requiredPermissions={['system_admin']}>
      <Tienda /> 
    </ProtectedRoute>
  } 
/>
```

### Navegación

La tienda aparece en la navegación para usuarios con permisos de super admin:

```tsx
// En SaaSNavigation.tsx
{
  name: 'Tienda',
  href: '/tienda',
  icon: ShoppingCart,
  children: [
    { name: 'Ver Tienda', href: '/tienda?tab=vista' },
    { name: 'Solicitudes Pendientes', href: '/tienda?tab=solicitudes' }
  ]
}
```

## Componentes Relacionados

### Productos de TiendaFarmacia

La tienda incluye productos farmacéuticos categorizados:
- **Medicamentos**: Ibuprofeno, Paracetamol
- **Suplementos**: Vitamina C, Omega-3
- **Equipos Médicos**: Termómetros, Tensiómetros
- **Cuidado Personal**: Cremas, Protectores solares
- **Higiene**: Jabones antisépticos
- **Bebés**: Biberones especiales

### Funcionalidades del Carrito

- ✅ Agregar/quitar productos
- ✅ Modificar cantidades
- ✅ Aplicar cupones
- ✅ Seleccionar envío
- ✅ Calcular totales
- ✅ Persistir en localStorage
- ✅ Notificaciones automáticas

## Personalización

### Tema Visual

La tienda usa un tema médico con gradientes verde-azul:

```css
/* Gradientes principales */
bg-gradient-to-r from-green-600 to-blue-600
bg-gradient-to-br from-green-50 to-blue-50

/* Colores de acento */
text-green-600 (precio, botones)
border-green-100 (bordes suaves)
```

### Animaciones

Las animaciones usan Framer Motion:
- Animaciones de entrada/salida del modal
- Efectos hover en botones
- Contador animado del carrito
- Transiciones suaves

### Responsive Design

- Diseño completamente responsive
- Navegación adaptada para móvil
- Modal del carrito optimizado para pantallas pequeñas
- Grid de productos adaptable

## Testing y Debugging

### Debug del Estado

```tsx
// En el contexto del carrito
console.log('Estado del carrito:', estado)

// LocalStorage
localStorage.getItem('carrito-erp-medico')
```

### Notificaciones

Las notificaciones usan react-hot-toast:
- Éxito al agregar productos
- Error con cupones inválidos
- Confirmaciones de acciones

## Consideraciones Futuras

### Funcionalidades Planificadas

- [ ] Integración con pasarela de pago
- [ ] Sistema de inventario en tiempo real
- [ ] Historial de pedidos
- [ ] Sistema de reseñas
- [ ] Wishlist de productos
- [ ] Recomendaciones personalizadas
- [ ] Chat de soporte
- [ ] Múltiples idiomas

### Integraciones

- [ ] Stripe/PayPal para pagos
- [ ] API de productos farmacéuticos
- [ ] Sistema de autenticación robusto
- [ ] Base de datos real
- [ ] Notificaciones push
- [ ] Analytics de conversiones

---

## Notas Técnicas

1. **Performance**: Los filtros usan `useMemo` para optimización
2. **Estado**: Todo el estado del carrito se persiste en localStorage
3. **Accesibilidad**: Componentes accesibles con roles ARIA
4. **TypeScript**: Totalmente tipado con TypeScript
5. **Responsive**: Diseño mobile-first con Tailwind CSS

La página está lista para producción y puede integrarse fácilmente en el sistema ERP existente.