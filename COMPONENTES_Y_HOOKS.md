# 🧩 COMPONENTES Y HOOKS - MediFlow

**Fecha:** 11 de Noviembre de 2025  
**Versión:** 3.5.1  

---

## 📋 TABLA DE CONTENIDO

1. [Componentes UI Base](#componentes-ui-base)
2. [Componentes de Autenticación](#componentes-de-autenticación)
3. [Componentes Médicos](#componentes-médicos)
4. [Componentes Administrativos](#componentes-administrativos)
5. [Custom Hooks](#custom-hooks)
6. [Contextos](#contextos)

---

## 🎨 COMPONENTES UI BASE

### Ubicación: `src/components/ui/`

#### Button
```typescript
// src/components/ui/button.tsx
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  children: React.ReactNode
}

export function Button({ variant = 'default', size = 'default', children, ...props }: ButtonProps)

// Uso
<Button variant="default">Guardar</Button>
<Button variant="destructive" size="sm">Eliminar</Button>
```

#### Card
```typescript
// src/components/ui/card.tsx
export function Card({ children, className }: CardProps)
export function CardHeader({ children }: CardHeaderProps)
export function CardTitle({ children }: CardTitleProps)
export function CardContent({ children }: CardContentProps)
export function CardFooter({ children }: CardFooterProps)

// Uso
<Card>
  <CardHeader>
    <CardTitle>Título del Card</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Contenido aquí</p>
  </CardContent>
  <CardFooter>
    <Button>Acción</Button>
  </CardFooter>
</Card>
```

#### Dialog
```typescript
// src/components/ui/dialog.tsx
export function Dialog({ open, onOpenChange, children }: DialogProps)
export function DialogTrigger({ children }: DialogTriggerProps)
export function DialogContent({ children }: DialogContentProps)
export function DialogHeader({ children }: DialogHeaderProps)
export function DialogTitle({ children }: DialogTitleProps)
export function DialogFooter({ children }: DialogFooterProps)

// Uso
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Abrir Modal</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título del Modal</DialogTitle>
    </DialogHeader>
    <div>Contenido</div>
    <DialogFooter>
      <Button onClick={() => setOpen(false)}>Cerrar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### Tabla de Componentes UI
| Componente | Archivo | Descripción | Basado en |
|------------|---------|-------------|-----------|
| Button | button.tsx | Botones con variantes | Radix UI |
| Card | card.tsx | Tarjetas con header/footer | Div nativo |
| Dialog | dialog.tsx | Modales y diálogos | Radix UI Dialog |
| Input | input.tsx | Campos de entrada | Input nativo |
| Label | label.tsx | Etiquetas de formulario | Radix UI Label |
| Select | select.tsx | Selectores dropdown | Radix UI Select |
| Checkbox | checkbox.tsx | Casillas de verificación | Radix UI Checkbox |
| Badge | badge.tsx | Insignias y etiquetas | Div nativo |
| Avatar | avatar.tsx | Avatares de usuario | Radix UI Avatar |
| Toast | toast.tsx | Notificaciones | react-hot-toast |
| Tabs | tabs.tsx | Pestañas navegables | Radix UI Tabs |
| Accordion | accordion.tsx | Acordeones colapsables | Radix UI Accordion |

---

## 🔐 COMPONENTES DE AUTENTICACIÓN

### Ubicación: `src/components/auth/`

#### PermissionGate
**Archivo:** `src/components/auth/PermissionGate.tsx`

```typescript
interface PermissionGateProps {
  permission: {
    resource: string
    action: 'create' | 'read' | 'update' | 'delete'
  }
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGate({ permission, children, fallback }: PermissionGateProps)

// Uso
<PermissionGate 
  permission={{ resource: 'pacientes', action: 'create' }}
  fallback={<p>No tienes permiso</p>}
>
  <Button>Crear Paciente</Button>
</PermissionGate>
```

**Características:**
- ✅ Verifica permisos basados en rol
- ✅ Muestra fallback si no hay permiso
- ✅ Compatible con sistema de permisos granular

#### PermissionGuard
**Archivo:** `src/components/auth/PermissionGuard.tsx`

```typescript
export function PermissionGuard({
  resource,
  action,
  children,
  fallback = <AccessDeniedPage />
}: PermissionGuardProps)

// Uso
<PermissionGuard resource="facturacion" action="read">
  <FacturacionPage />
</PermissionGuard>
```

#### NavigationGuard
**Archivo:** `src/components/auth/NavigationGuard.tsx`

```typescript
export function NavigationGuard({
  allowedRoles,
  redirect = '/dashboard',
  children
}: NavigationGuardProps)

// Uso
<NavigationGuard allowedRoles={['super_admin', 'admin_empresa']}>
  <AdminPanel />
</NavigationGuard>
```

#### AccessDeniedPage
**Archivo:** `src/components/auth/AccessDeniedPage.tsx`

```typescript
export function AccessDeniedPage({
  title = 'Acceso Denegado',
  message = 'No tienes permisos para acceder a esta sección',
  showBackButton = true
}: AccessDeniedPageProps)

// Se muestra automáticamente cuando falla PermissionGuard
```

---

## 🏥 COMPONENTES MÉDICOS

### Ubicación: `src/components/medicina/`

#### PrescripcionModal
**Archivo:** `src/components/medicina/PrescripcionModal.tsx`

```typescript
interface PrescripcionModalProps {
  open: boolean
  onClose: () => void
  paciente: Paciente
  onPrescripcionCreada?: (prescripcion: Prescripcion) => void
}

export function PrescripcionModal({ 
  open, 
  onClose, 
  paciente, 
  onPrescripcionCreada 
}: PrescripcionModalProps)

// Uso
<PrescripcionModal
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  paciente={pacienteSeleccionado}
  onPrescripcionCreada={(p) => {
    toast.success('Prescripción creada')
    setPrescripciones([...prescripciones, p])
  }}
/>
```

**Características:**
- ✅ Agregar múltiples medicamentos
- ✅ Especificar dosis, frecuencia, duración
- ✅ Indicaciones y advertencias
- ✅ Vista previa antes de crear
- ✅ Generación de receta PDF

#### OrdenLaboratorioModal
**Archivo:** `src/components/medicina/OrdenLaboratorioModal.tsx`

```typescript
interface OrdenLaboratorioModalProps {
  open: boolean
  onClose: () => void
  paciente: Paciente
  onOrdenCreada?: (orden: OrdenLaboratorio) => void
}

export function OrdenLaboratorioModal(props: OrdenLaboratorioModalProps)

// Uso
<OrdenLaboratorioModal
  open={showOrdenLab}
  onClose={() => setShowOrdenLab(false)}
  paciente={paciente}
  onOrdenCreada={(orden) => {
    console.log('Orden creada:', orden)
  }}
/>
```

**Tipos de estudios incluidos:**
- Biometría Hemática
- Química Sanguínea
- Examen General de Orina
- Perfil de Lípidos
- Pruebas Hepáticas
- Pruebas Renales

#### CentroAccionesMedicas
**Archivo:** `src/components/medicina/CentroAccionesMedicas.tsx`

```typescript
interface CentroAccionesMedicasProps {
  paciente: Paciente
  onAccionCompletada?: (tipo: string, data: any) => void
}

export function CentroAccionesMedicas({ 
  paciente, 
  onAccionCompletada 
}: CentroAccionesMedicasProps)

// Uso
<CentroAccionesMedicas
  paciente={pacienteActual}
  onAccionCompletada={(tipo, data) => {
    console.log(`Acción ${tipo} completada`, data)
    actualizarHistorial()
  }}
/>
```

**Acciones disponibles:**
- 💊 Crear Prescripción
- 🔬 Orden de Laboratorio
- 🛒 Orden de Productos
- 📋 Evaluación Ergonómica
- 📄 Generar Certificado

#### PrescripcionBuilderWrapperV2
**Archivo:** `src/components/medicina/PrescripcionBuilderWrapperV2.tsx`

```typescript
// Sistema avanzado de prescripciones con IA
export function PrescripcionBuilderWrapperV2({
  paciente,
  onSave,
  onCancel
}: PrescripcionBuilderProps)

// Feature flags
localStorage.setItem('HC_RX_V2', 'true') // Activar versión 2

// Uso
<PrescripcionBuilderWrapperV2
  paciente={paciente}
  onSave={(prescripcion) => {
    guardarPrescripcion(prescripcion)
  }}
  onCancel={() => cerrarModal()}
/>
```

**Características V2:**
- 🎤 Reconocimiento de voz
- 🤖 Sugerencias de IA
- ⌨️ Atajos de teclado avanzados
- 💾 Autosave cada 10s
- 🔄 Recuperación automática
- 📊 Preview en tiempo real

---

## 📊 COMPONENTES ADMINISTRATIVOS

### Ubicación: `src/components/admin/`

#### AdminDashboard
**Archivo:** `src/components/admin/AdminDashboard.tsx`

```typescript
export function AdminDashboardWrapper()

// Renderiza diferente dashboard según rol
// - Super Admin: Vista global de empresas
// - Admin Empresa: Vista de su empresa
```

**Métricas mostradas:**
- Total usuarios
- Total empresas (super admin)
- Actividad reciente
- Gráficos de uso
- Alertas del sistema

#### PanelMenuConfig
**Archivo:** `src/components/admin/PanelMenuConfig.tsx`

```typescript
export function PanelMenuConfig()

// Panel para configurar menús personalizados por empresa
```

**Funcionalidades:**
- Crear menús personalizados
- Reordenar items
- Asignar iconos
- Definir permisos por item
- Vista previa en tiempo real

---

## 📋 COMPONENTES DE CERTIFICACIONES

### Ubicación: `src/components/certificaciones/`

#### SistemaFirmaDigital
**Archivo:** `src/components/certificaciones/SistemaFirmaDigital.tsx`

```typescript
interface SistemaFirmaDigitalProps {
  documento: Documento
  onFirmaCompleta?: (firma: FirmaDigital) => void
}

export function SistemaFirmaDigital(props: SistemaFirmaDigitalProps)

// Uso
<SistemaFirmaDigital
  documento={certificadoMedico}
  onFirmaCompleta={(firma) => {
    console.log('Documento firmado:', firma)
    enviarCertificado()
  }}
/>
```

**Métodos de firma:**
- 🖊️ Firma manuscrita (canvas)
- 🔐 PIN seguro
- 👆 Huella dactilar
- 🎫 Token digital

---

## 💰 COMPONENTES DE FACTURACIÓN

### Ubicación: `src/components/facturacion/`

#### GeneradorCFDI
**Archivo:** `src/components/facturacion/GeneradorCFDI.tsx`

```typescript
interface GeneradorCFDIProps {
  cliente: Cliente
  servicios: ServicioFacturado[]
  onFacturaCreada?: (factura: Factura) => void
}

export function GeneradorCFDI(props: GeneradorCFDIProps)

// Uso
<GeneradorCFDI
  cliente={clienteSeleccionado}
  servicios={serviciosAFacturar}
  onFacturaCreada={(factura) => {
    descargarPDF(factura)
    enviarEmail(factura)
  }}
/>
```

**Cumple con:**
- CFDI 4.0
- SAT México
- Timbrado automático
- Generación de XML
- Generación de PDF

#### PortalPagos
**Archivo:** `src/components/facturacion/PortalPagos.tsx`

```typescript
interface PortalPagosProps {
  cliente: Cliente
}

export function PortalPagos({ cliente }: PortalPagosProps)

// Uso
<PortalPagos cliente={clienteActual} />
```

**Métodos de pago:**
- 💳 Tarjeta de crédito/débito
- 🏦 Transferencia bancaria
- 💵 Efectivo
- 🔗 Stripe (integración)

---

## 📦 COMPONENTES DE INVENTARIO

### Ubicación: `src/components/inventario/`

#### InventarioPersonalizado
**Archivo:** `src/components/inventario/InventarioPersonalizado.tsx`

```typescript
export function InventarioPersonalizado()

// Vista completa de inventario con:
// - Tabla de productos
// - Filtros avanzados
// - Estados de stock
// - Alertas de vencimiento
// - Gestión de lotes
```

#### ComponenteProveedores
**Archivo:** `src/components/inventario/ComponenteProveedores.tsx`

```typescript
export function ComponenteProveedores()

// Gestión de proveedores:
// - Lista de proveedores
// - Agregar/editar proveedor
// - Historial de compras
// - Evaluación de proveedores
```

#### ComponenteOrdenesCompra
**Archivo:** `src/components/inventario/ComponenteOrdenesCompra.tsx`

```typescript
interface ComponenteOrdenesCompraProps {
  ordenes: OrdenCompra[]
  proveedores: Proveedor[]
  productos: Producto[]
}

export function ComponenteOrdenesCompra(props: ComponenteOrdenesCompraProps)

// Gestión de órdenes:
// - Crear orden de compra
// - Seguimiento de estado
// - Recepción de mercancía
// - Validación contra factura
```

---

## 🪝 CUSTOM HOOKS

### Ubicación: `src/hooks/`

#### useAuth
**Archivo:** `src/contexts/AuthContext.tsx`

```typescript
export function useAuth() {
  return useContext(AuthContext)
}

// Retorna
interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (resource: string, action: PermissionAction) => boolean
  canAccess: (resource: string) => boolean
}

// Uso
const { user, login, hasPermission } = useAuth()

if (hasPermission('pacientes', 'create')) {
  // Hacer algo
}
```

#### useInventario
**Archivo:** `src/hooks/useInventario.ts`

```typescript
export function useInventario() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState<FiltrosInventario>({})
  
  // Métodos
  const obtenerProductos = async () => { /* ... */ }
  const agregarProducto = async (producto: Producto) => { /* ... */ }
  const editarProducto = async (id: string, datos: Partial<Producto>) => { /* ... */ }
  const eliminarProducto = async (id: string) => { /* ... */ }
  const buscarProducto = (termino: string) => { /* ... */ }
  const filtrarPorCategoria = (categoria: string) => { /* ... */ }
  const alertasStock = () => { /* ... */ }
  
  return {
    productos,
    loading,
    filtros,
    obtenerProductos,
    agregarProducto,
    editarProducto,
    eliminarProducto,
    buscarProducto,
    filtrarPorCategoria,
    alertasStock
  }
}

// Uso
const { 
  productos, 
  loading, 
  agregarProducto 
} = useInventario()
```

#### useAgenda
**Archivo:** `src/hooks/useAgenda.ts`

```typescript
export function useAgenda() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)
  const [vista, setVista] = useState<'dia' | 'semana' | 'mes'>('semana')
  
  const obtenerCitas = async (fecha: Date) => { /* ... */ }
  const crearCita = async (cita: NuevaCita) => { /* ... */ }
  const actualizarCita = async (id: string, datos: Partial<Cita>) => { /* ... */ }
  const cancelarCita = async (id: string, motivo: string) => { /* ... */ }
  const confirmarCita = async (id: string) => { /* ... */ }
  const reprogramarCita = async (id: string, nuevaFecha: Date) => { /* ... */ }
  
  return {
    citas,
    loading,
    vista,
    setVista,
    obtenerCitas,
    crearCita,
    actualizarCita,
    cancelarCita,
    confirmarCita,
    reprogramarCita
  }
}

// Uso
const { 
  citas, 
  crearCita, 
  cancelarCita 
} = useAgenda()

await crearCita({
  paciente_id: 'uuid',
  medico_id: 'uuid',
  fecha: new Date(),
  motivo: 'Consulta general'
})
```

#### useFacturacion
**Archivo:** `src/hooks/useFacturacion.ts`

```typescript
export function useFacturacion() {
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loading, setLoading] = useState(true)
  const [estadisticas, setEstadisticas] = useState<EstadisticasFacturacion>({})
  
  const obtenerFacturas = async (filtros?: FiltrosFactura) => { /* ... */ }
  const crearFactura = async (datos: NuevaFactura) => { /* ... */ }
  const timbrarFactura = async (id: string) => { /* ... */ }
  const cancelarFactura = async (id: string, motivo: string) => { /* ... */ }
  const descargarPDF = async (id: string) => { /* ... */ }
  const descargarXML = async (id: string) => { /* ... */ }
  const enviarEmail = async (id: string, email: string) => { /* ... */ }
  const registrarPago = async (facturaId: string, pago: Pago) => { /* ... */ }
  
  return {
    facturas,
    loading,
    estadisticas,
    obtenerFacturas,
    crearFactura,
    timbrarFactura,
    cancelarFactura,
    descargarPDF,
    descargarXML,
    enviarEmail,
    registrarPago
  }
}

// Uso
const { 
  facturas, 
  crearFactura, 
  timbrarFactura 
} = useFacturacion()
```

#### useCertificaciones
**Archivo:** `src/hooks/useCertificaciones.ts`

```typescript
export function useCertificaciones() {
  const [certificados, setCertificados] = useState<Certificado[]>([])
  const [loading, setLoading] = useState(true)
  
  const obtenerCertificados = async () => { /* ... */ }
  const generarCertificado = async (tipo: TipoCertificado, datos: any) => { /* ... */ }
  const firmarCertificado = async (id: string, firma: FirmaDigital) => { /* ... */ }
  const descargarCertificado = async (id: string) => { /* ... */ }
  const enviarCertificado = async (id: string, email: string) => { /* ... */ }
  const validarCertificado = async (codigo: string) => { /* ... */ }
  
  return {
    certificados,
    loading,
    obtenerCertificados,
    generarCertificado,
    firmarCertificado,
    descargarCertificado,
    enviarCertificado,
    validarCertificado
  }
}
```

#### useMenuPermissions
**Archivo:** `src/hooks/useMenuPermissions.ts`

```typescript
export function useMenuPermissions(): MenuPermissionHookReturn {
  const { user } = useAuth()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  
  // Obtiene menú personalizado según rol y permisos
  const getMenuForRole = (role: UserRole) => { /* ... */ }
  const hasAccessToModule = (moduleId: string) => { /* ... */ }
  const filterMenuByPermissions = (items: MenuItem[]) => { /* ... */ }
  
  return {
    menuItems,
    loading,
    getMenuForRole,
    hasAccessToModule,
    filterMenuByPermissions
  }
}

// Uso
const { menuItems, hasAccessToModule } = useMenuPermissions()

if (hasAccessToModule('facturacion')) {
  // Mostrar módulo de facturación
}
```

#### Resumen de Hooks

| Hook | Responsabilidad | Estado | Acciones |
|------|----------------|--------|----------|
| **useAuth** | Autenticación | user, loading | login, logout, hasPermission |
| **useInventario** | Inventario | productos, loading | CRUD productos, alertas |
| **useAgenda** | Agenda | citas, loading | CRUD citas, confirmaciones |
| **useFacturacion** | Facturación | facturas, loading | CRUD facturas, timbrado |
| **useCertificaciones** | Certificados | certificados, loading | Generar, firmar, validar |
| **useMenuPermissions** | Menús | menuItems, loading | Filtrar por permisos |
| **useConfiguracion** | Config | configuracion, loading | CRUD configuración |
| **useAuditLog** | Auditoría | logs, loading | Registrar, consultar logs |

---

## 🎭 CONTEXTOS

### Ubicación: `src/contexts/`

#### AuthContext
**Archivo:** `src/contexts/AuthContext.tsx`

```typescript
export const AuthContext = createContext<AuthContextType>()

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Métodos de autenticación
  const login = async (email, password) => { /* ... */ }
  const logout = async () => { /* ... */ }
  const hasPermission = (resource, action) => { /* ... */ }
  
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

#### CarritoContext
**Archivo:** `src/contexts/CarritoContext.tsx`

```typescript
export const CarritoContext = createContext<CarritoContextType>()

export function CarritoProvider({ children }) {
  const [items, setItems] = useState<ItemCarrito[]>([])
  const [total, setTotal] = useState(0)
  
  const agregarItem = (producto: Producto, cantidad: number) => { /* ... */ }
  const eliminarItem = (productoId: string) => { /* ... */ }
  const actualizarCantidad = (productoId: string, cantidad: number) => { /* ... */ }
  const vaciarCarrito = () => { /* ... */ }
  const aplicarCupon = (codigo: string) => { /* ... */ }
  const procesarCompra = async () => { /* ... */ }
  
  return (
    <CarritoContext.Provider value={{ 
      items, 
      total, 
      agregarItem, 
      eliminarItem,
      vaciarCarrito,
      procesarCompra
    }}>
      {children}
    </CarritoContext.Provider>
  )
}

export const useCarrito = () => useContext(CarritoContext)
```

#### SystemIntegrationContext
**Archivo:** `src/contexts/SystemIntegrationContext.tsx`

```typescript
export const SystemIntegrationContext = createContext<SystemContextType>()

export function SystemProvider({ children }) {
  const [systemState, setSystemState] = useState<SystemState>({
    isOnline: true,
    lastSync: new Date(),
    notifications: [],
    pendingTasks: []
  })
  
  const syncData = async () => { /* ... */ }
  const addNotification = (notification: Notification) => { /* ... */ }
  const clearNotifications = () => { /* ... */ }
  
  return (
    <SystemIntegrationContext.Provider value={{ 
      systemState, 
      syncData, 
      addNotification 
    }}>
      {children}
    </SystemIntegrationContext.Provider>
  )
}

export const useSystemIntegration = () => useContext(SystemIntegrationContext)
```

---

## 📊 COMPONENTES DE REPORTES

### Ubicación: `src/components/reportes/`

#### DashboardKPIs
**Archivo:** `src/components/reportes/DashboardKPIs.tsx`

```typescript
interface DashboardKPIsProps {
  filtros?: FiltrosReporte
}

export function DashboardKPIs({ filtros }: DashboardKPIsProps)

// KPIs mostrados:
// - Total pacientes atendidos
// - Citas realizadas
// - Ingresos del período
// - Tasa de satisfacción
// - Eficiencia operativa
```

#### GeneradorReportes
**Archivo:** `src/components/reportes/GeneradorReportes.tsx`

```typescript
interface GeneradorReportesProps {
  filtros: FiltrosReporte
}

export function GeneradorReportes({ filtros }: GeneradorReportesProps)

// Tipos de reportes:
// - Reporte de pacientes
// - Reporte de consultas
// - Reporte financiero
// - Reporte de inventario
// - Reporte de compliance
```

---

## 🎯 MEJORES PRÁCTICAS

### Estructura de Componente
```typescript
// 1. Imports
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

// 2. Types
interface Props {
  title: string
  onSave: () => void
}

// 3. Component
export function MiComponente({ title, onSave }: Props) {
  // 3.1 State y hooks
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  
  // 3.2 Effects
  useEffect(() => {
    // Efecto aquí
  }, [])
  
  // 3.3 Handlers
  const handleSave = async () => {
    setLoading(true)
    await onSave()
    setLoading(false)
  }
  
  // 3.4 Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleSave} disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar'}
      </Button>
    </div>
  )
}
```

### Uso de Hooks
```typescript
// ✅ DO: Custom hooks para lógica reutilizable
function usePaciente(id: string) {
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    cargarPaciente(id)
  }, [id])
  
  return { paciente, loading }
}

// ❌ DON'T: Lógica compleja directamente en componente
function Componente({ id }) {
  const [paciente, setPaciente] = useState(null)
  useEffect(() => {
    fetch(`/api/pacientes/${id}`).then(...)
  }, [id])
  // ...
}
```

---

**Última actualización:** 11 de Noviembre de 2025  
**Total Componentes:** 150+  
**Total Hooks:** 15+
