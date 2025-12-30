# Panel Administrativo Farmacéutico

Este módulo proporciona una interfaz completa para la gestión de productos farmacéuticos, inventario y proveedores en el sistema ERP Médico.

## Características Principales

### 🔒 Control de Acceso
- **Solo accesible para Super Administradores** mediante verificación de jerarquía
- Uso del contexto `SaaSAuthContext` para autenticación y permisos

### 📊 Funcionalidades de Gestión de Productos

#### Lista de Productos
- **Tabla moderna** con información completa de productos
- **Paginación** configurable (10 productos por página)
- **Búsqueda** en tiempo real por nombre o código
- **Filtros avanzados** por tipo, categoría y proveedor
- **Ordenamiento** por nombre, precio o stock

#### Información del Producto
- Código único del producto
- Nombre y descripción detallada
- Tipo (medicamento, equipo médico, consumible, etc.)
- Categorización específica
- Unidad de medida
- Precio unitario
- Proveedor asignado

#### Configuraciones Especiales
- ⚕️ **Requiere receta médica**
- ❄️ **Almacenamiento refrigerado** (con rangos de temperatura)
- ⭐ **Producto recomendado**
- 📍 **Ubicación de almacenamiento**

### 📦 Gestión de Inventario
- **Control de stock** actual, mínimo y máximo
- **Estados de stock**: disponible, bajo, agotado, vencido
- **Alertas automáticas** para stock bajo
- **Ubicación física** del producto

### 🏷️ Categorización Avanzada
- **Medicamentos**: Analgésicos, Antibióticos, Antisépticos
- **Equipos Médicos**: Laboratorio, Diagnóstico
- **Consumibles**: Material de curación, guantes, jeringas, etc.

### 📈 Dashboard de Estadísticas
- Total de productos en catálogo
- Productos con stock bajo (alerta)
- Valor total del inventario
- Productos recomendados

### 🎯 Sistema de Recomendaciones
- **Gestión de productos recomendados** con estrella visual
- Toggle rápido para marcar/desmarcar recomendaciones

### 📱 Interfaz Moderna
- **Diseño responsive** para desktop y móvil
- **Modal intuitivo** para crear/editar productos
- **Formulario organizado** por secciones
- **Validaciones** en tiempo real
- **Iconos de Lucide React** para mejor UX

## Componentes Utilizados

### UI Components (shadcn/ui)
- `Card` - Tarjetas de información
- `Button` - Botones de acción
- `Input` - Campos de entrada
- `Dialog` - Modal para formularios
- `Tabs` - Navegación por pestañas
- `Table` - Tabla de datos
- `Select` - Listas desplegables
- `Checkbox` - Casillas de verificación
- `Badge` - Etiquetas de estado
- `Textarea` - Área de texto

### Tipos TypeScript
- `Producto` - Interface principal del producto
- `Stock` - Información de inventario
- `Proveedor` - Datos del proveedor
- `TipoProducto` y `CategoriaProducto` - Enums de categorización
- `FormularioProductoData` - Tipos para formularios

## Uso del Componente

```tsx
import { PanelAdminFarmacia } from '@/components/admin'

// En tu componente principal o ruta
<PanelAdminFarmacia />
```

## Estructura de Datos

### Producto
```typescript
interface ProductoExtendido extends Producto {
  // Información básica
  codigo: string
  nombre: string
  descripcion?: string
  tipo: TipoProducto
  categoria: CategoriaProducto
  unidadMedida: string
  precioUnitario: number
  
  // Configuraciones especiales
  requiereReceta: boolean
  requiereFrio: boolean
  temperaturaMin?: number
  temperaturaMax?: number
  recomendado: boolean
  
  // Relaciones
  proveedor?: Proveedor
  stock?: Stock
}
```

### Stock
```typescript
interface Stock {
  cantidadActual: number
  cantidadMinima: number
  cantidadMaxima: number
  ubicacion: string
  estado: EstadoStock
  alertasStockBajo: boolean
}
```

## Funcionalidades en Desarrollo

- [ ] **Gestión avanzada de inventario** con movimientos
- [ ] **Reportes y analytics** de consumo
- [ ] **Gestión de categorías** personalizables
- [ ] **Importación/exportación** de productos
- [ ] **Gestión de imágenes** de productos
- [ ] **Alertas de vencimiento** automáticas
- [ ] **Códigos de barras** para productos
- [ ] **Integración con proveedores** para cotizaciones

## Mejores Prácticas

### Validación de Datos
- Validación de campos requeridos
- Validación de rangos numéricos
- Validación de formato de código
- Verificación de existencia de proveedor

### UX/UI
- Estados de carga para mejor experiencia
- Mensajes de confirmación para acciones destructivas
- Feedback visual para acciones exitosas
- Accesibilidad con roles ARIA

### Rendimiento
- Paginación para grandes volúmenes
- Filtrado en tiempo real
- Memoización de componentes pesados
- Lazy loading de datos

## Consideraciones de Seguridad

### Control de Acceso
- Verificación de jerarquía de usuario
- Redirección para usuarios no autorizados
- Mensajes de error apropiados

### Validación de Entrada
- Sanitización de inputs de usuario
- Validación de tipos de datos
- Prevención de inyección SQL
- Validación de permisos por recurso

## Extensibilidad

El componente está diseñado para ser fácilmente extensible:

- **Nuevos tipos de productos** agregando a los enums
- **Nuevos campos** extendiendo las interfaces
- **Nuevas validaciones** en el formulario
- **Nuevos proveedores** integrando APIs
- **Nuevos reportes** en la pestaña de analytics

## Próximas Integraciones

- API REST para persistencia de datos
- Sistema de archivos para imágenes
- Notificaciones push para alertas
- Integración con sistemas de facturación
- Sincronización con proveedores externos