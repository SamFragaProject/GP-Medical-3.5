# Componente Carrito de Compras para ERP Médico

Componente completo de carrito de compras estilo WooCommerce desarrollado específicamente para el sistema ERP Médico, con animaciones de Framer Motion y gestión de estado global.

## 🚀 Características

- ✅ **Lista de productos** en carrito con imágenes y detalles
- ✅ **Modificar cantidades** con controles intuitivos
- ✅ **Eliminar productos** con animaciones
- ✅ **Cálculo de subtotal/total** en tiempo real
- ✅ **Cupones de descuento** con validación
- ✅ **Cálculo de envío** con múltiples métodos
- ✅ **Botón checkout** con modal de confirmación
- ✅ **React Context** para estado global
- ✅ **Animaciones de Framer Motion** para agregar/quitar productos
- ✅ **Persistencia** en localStorage
- ✅ **Notificaciones toast** para feedback
- ✅ **Responsive design** para todos los dispositivos
- ✅ **Accesibilidad** y validaciones

## 📦 Instalación

El componente ya está integrado en el proyecto. Solo necesitas importar y usar los componentes.

## 🛠️ Componentes Incluidos

### 1. `CarritoCompras.tsx`
Componente principal del carrito con todas las funcionalidades.

### 2. `CarritoContext.tsx`
Contexto React para manejo del estado global del carrito.

### 3. `BotonCarritoFlotante.tsx`
Botón flotante que muestra la cantidad de items y abre el carrito.

### 4. `BotonAgregarCarrito.tsx`
Botón reutilizable para agregar productos al carrito.

### 5. `useCarritoVisibility.ts`
Hook personalizado para manejar la visibilidad del carrito.

## 🎯 Uso Básico

### 1. Configuración del Provider

Envuelve tu aplicación con el `CarritoProvider`:

```tsx
import { CarritoProvider } from '@/contexts/CarritoContext'

function App() {
  return (
    <CarritoProvider>
      {/* Tu aplicación */}
    </CarritoProvider>
  )
}
```

### 2. Mostrar el Carrito Completo

```tsx
import { CarritoCompras } from '@/components/tienda'

function PaginaCarrito() {
  return <CarritoCompras />
}
```

### 3. Botón Flotante del Carrito

```tsx
import { BotonCarritoFlotante } from '@/components/tienda'

function MiLayout() {
  return (
    <>
      {/* Tu contenido */}
      <BotonCarritoFlotante />
    </>
  )
}
```

### 4. Agregar Productos

```tsx
import { BotonAgregarCarrito } from '@/components/tienda'

function ProductoCard({ producto }) {
  return (
    <div>
      <h3>{producto.nombre}</h3>
      <p>${producto.precio}</p>
      <BotonAgregarCarrito producto={producto} />
    </div>
  )
}
```

## 🔧 API del Contexto

### `useCarrito()`

Hook personalizado que proporciona acceso al estado del carrito:

```tsx
const {
  // Estado
  productos,
  cuponActivo,
  metodoEnvio,
  subtotal,
  descuentoCupon,
  costoEnvio,
  total,
  
  // Acciones
  agregarProducto,
  removerProducto,
  actualizarCantidad,
  limpiarCarrito,
  aplicarCupon,
  removerCupon,
  seleccionarMetodoEnvio,
  obtenerTotalItems
} = useCarrito()
```

### Estructura de Datos

```typescript
interface ProductoCarrito {
  id: string
  nombre: string
  precio: number
  imagen?: string
  cantidad: number
  categoria?: string
  stock?: number
}

interface CuponDescuento {
  id: string
  codigo: string
  tipo: 'porcentaje' | 'fijo'
  valor: number
  descripcion: string
  minimoCompra?: number
  activo: boolean
}

interface InfoEnvio {
  metodo: string
  precio: number
  tiempoEstimado: string
  descripcion: string
}
```

## 💳 Cupones Disponibles

El sistema incluye cupones predefinidos:

- `BIENVENIDO10` - 10% de descuento (mín. $50)
- `MEDICO20` - 20% de descuento para profesionales (mín. $100)
- `SAVE25` - $25 de descuento (mín. $200)

## 🚚 Métodos de Envío

- **Standard** - $15.99 (5-7 días hábiles)
- **Express** - $29.99 (2-3 días hábiles)
- **Same Day** - $49.99 (mismo día hasta 8 PM)

## 🎨 Animaciones

El componente usa Framer Motion para crear una experiencia fluida:

- **Entrada de productos** - Fade in y slide desde abajo
- **Eliminación** - Scale down y fade out
- **Agregar al carrito** - Notificación toast con icono
- **Aplicar cupones** - Animaciones de éxito/error
- **Botón flotante** - Pulso sutil cuando hay items

## 💾 Persistencia

El carrito se guarda automáticamente en `localStorage` bajo la clave `carrito-erp-medico` y se restaura al cargar la aplicación.

## 📱 Responsive Design

- **Desktop** - Layout de 2-3 columnas con sidebar
- **Tablet** - Layout adaptativo
- **Mobile** - Stack vertical optimizado para touch

## 🎯 Características Avanzadas

### Validaciones
- Stock máximo por producto
- Cantidades mínimas (1)
- Validación de cupones con mínimo de compra
- Cálculos automáticos de totales

### Accesibilidad
- Navegación por teclado
- ARIA labels
- Focus management
- Contraste adecuado

### Performance
- Reducción automática de re-renders
- Memoización de cálculos
- Lazy loading de componentes

## 🔧 Customización

### Estilos
El componente usa Tailwind CSS y es completamente personalizable:

```tsx
// Personalizar clases CSS
<CarritoCompras className="mi-clase-personalizada" />

// Personalizar variants del botón
<BotonAgregarCarrito 
  producto={producto} 
  variant="outline" 
  size="lg" 
/>
```

### Extender Funcionalidad

Puedes extender el contexto para agregar nuevas funcionalidades:

```tsx
// Agregar nuevos métodos de envío
const nuevosMetodos: InfoEnvio[] = [
  {
    metodo: 'pickup',
    precio: 0,
    tiempoEstimado: 'Disponible para pickup',
    descripcion: 'Recoger en tienda'
  }
]
```

## 🐛 Troubleshooting

### El carrito no se guarda
Verifica que `localStorage` esté habilitado en el navegador.

### Las animaciones no funcionan
Asegúrate de que `framer-motion` esté instalado:
```bash
npm install framer-motion
```

### Errores de TypeScript
Verifica que los tipos estén correctamente importados:
```typescript
import type { ProductoCarrito } from '@/contexts/CarritoContext'
```

## 📄 Archivos del Proyecto

```
src/
├── components/tienda/
│   ├── CarritoCompras.tsx           # Componente principal
│   ├── BotonCarritoFlotante.tsx     # Botón flotante
│   ├── BotonAgregarCarrito.tsx      # Botón agregar
│   ├── ejemplo-uso.tsx              # Ejemplo completo
│   └── index.ts                     # Exportaciones
├── contexts/
│   └── CarritoContext.tsx           # Estado global
└── hooks/
    └── useCarritoVisibility.ts      # Hook visibilidad
```

## 🤝 Contribución

Para contribuir al componente:

1. Mantén la consistencia con los patrones existentes
2. Agrega animaciones apropiadas con Framer Motion
3. Incluye tests para nuevas funcionalidades
4. Actualiza la documentación

## 📝 Notas

- Desarrollado específicamente para el ERP Médico
- Compatible con el sistema de diseño existente
- Optimizado para rendimiento y UX
- Lista para producción

¡El componente está listo para usar! 🎉