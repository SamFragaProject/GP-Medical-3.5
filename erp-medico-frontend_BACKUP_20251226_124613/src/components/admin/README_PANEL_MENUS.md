# Panel Administrativo de Configuración de Menús

## Descripción

Sistema completo para que el Super Admin configure permisos de menús de forma granular, con gestión masiva por rol y sistema de notificaciones mejorado.

## Características Nuevas Implementadas

### ✅ PanelMenuConfig.tsx - Mejoras
- **Auto-guardado mejorado** con indicadores visuales de estado
- **Tracking de último guardado** con timestamp
- **Indicadores de cambios pendientes** en tiempo real
- **Validación de errores mejorada** con mensajes más descriptivos
- **Estados de carga optimizados** con feedback visual
- **Confirmaciones mejoradas** para operaciones críticas

### ✅ AdminMenuManager.tsx - Mejoras
- **Confirmación de contraseña obligatoria** para operaciones masivas críticas
- **Plantillas interactivas mejoradas** con validación de rol seleccionado
- **Sistema de auditoría detallado** con más información de contexto
- **Validación de contraseña** para operaciones críticas
- **Mejor manejo de errores** con logging detallado
- **Interfaz de confirmación mejorada** para acciones destructivas

### ✅ Sistema de Notificaciones Mejorado
- **Toast con acciones personalizadas** para confirmaciones
- **Manejo mejorado de warnings** con callbacks de acción
- **Duración configurable** por tipo de mensaje
- **Mejor positioning** y animaciones

## Componentes Principales

### 1. PanelMenuConfig.tsx

**Propósito**: Interface para configurar permisos de usuario específico.

**Características principales**:
- ✅ Selección de usuario con búsqueda
- ✅ Vista previa en tiempo real del menú
- ✅ Configuración granular por acción (leer, crear, editar, eliminar, etc.)
- ✅ Sistema de herencia desde roles
- ✅ Auto-guardado opcional
- ✅ Confirmaciones y validaciones
- ✅ Notificaciones toast para feedback

**Uso básico**:
```tsx
import { PanelMenuConfig } from '../admin'

function AdminPage() {
  const handleSavePermissions = async (userId: string, permissions: GranularPermission[]) => {
    // Implementar guardado en backend
    await api.saveUserPermissions(userId, permissions)
  }

  return (
    <PanelMenuConfig 
      onSave={handleSavePermissions}
      users={users}
    />
  )
}
```

### 2. AdminMenuManager.tsx

**Propósito**: Gestión masiva de permisos por rol con herramientas avanzadas.

**Características principales**:
- ✅ Gestión de roles con plantillas predefinidas
- ✅ Aplicación masiva a múltiples usuarios
- ✅ Exportar/importar configuraciones
- ✅ Sistema de auditoría de cambios
- ✅ Filtros avanzados por jerarquía
- ✅ Vista de estadísticas de uso

**Uso básico**:
```tsx
import { AdminMenuManager } from '../admin'

function BulkManagement() {
  return <AdminMenuManager />
}
```

### 3. MenuAdministrationDemo.tsx

**Propósito**: Componente de demostración completo que integra ambos paneles con estadísticas y ejemplos de uso.

**Características principales**:
- ✅ **Dashboard de estadísticas** en tiempo real
- ✅ **Datos simulados** para demostración completa
- ✅ **API mock completa** con diferentes escenarios
- ✅ **Integración de ambos paneles** en tabs separados
- ✅ **Alertas de seguridad** y recordatorios
- ✅ **Ejemplos de uso** con casos realistas

**Uso básico**:
```tsx
import { MenuAdministrationWithProvider } from '../admin'

function AdminPage() {
  return <MenuAdministrationWithProvider />
}
```

### 4. Sistema de Notificaciones (Toast)

**Propósito**: Sistema de notificaciones no intrusivas para feedback al usuario.

**Características**:
- ✅ Tipos: success, error, warning, info
- ✅ Auto-dismiss configurable
- ✅ Acciones personalizadas
- ✅ Posicionamiento optimizado
- ✅ Animaciones suaves

**Uso básico**:
```tsx
import { useToast, ToastProvider } from '../ui/toast'

function MyComponent() {
  const { showSuccess, showError, showWarning } = useToast()
  
  const handleAction = async () => {
    try {
      await someAsyncOperation()
      showSuccess('Operación exitosa', 'Los datos se guardaron correctamente')
    } catch (error) {
      showError('Error', 'No se pudo completar la operación')
    }
  }
  
  return <button onClick={handleAction}>Ejecutar</button>
}
```

## Configuración de Permisos

### Tipos de Recurso

Los componentes manejan los siguientes tipos de recursos:

- **users**: Gestión de usuarios
- **patients**: Pacientes y expedientes
- **appointments**: Citas y agenda
- **examinations**: Exámenes médicos
- **reports**: Reportes y documentos
- **billing**: Facturación y pagos
- **inventory**: Inventario médico
- **settings**: Configuración del sistema
- **audits**: Auditoría y logs

### Acciones Disponibles

Cada recurso puede tener las siguientes acciones:

- **read**: Ver información
- **create**: Crear nuevos registros
- **update**: Modificar información existente
- **delete**: Eliminar registros
- **export**: Descargar datos
- **import**: Cargar datos
- **admin**: Control total del módulo

### Jerarquías de Usuario

Los componentes soportan todas las jerarquías del sistema:

- **super_admin**: Super Administrador
- **admin_empresa**: Administrador de Empresa
- **medico_especialista**: Médico Especialista
- **medico_trabajo**: Médico del Trabajo
- **enfermera**: Enfermera
- **audiometrista**: Audiometrista
- **psicologo_laboral**: Psicólogo Laboral
- **tecnico_ergonomico**: Técnico Ergonómico
- **recepcion**: Recepción
- **paciente**: Paciente

## Integración con el Sistema

### 1. Configuración del Provider

En tu aplicación principal:

```tsx
import { ToastProvider } from './components/ui/toast'

function App() {
  return (
    <ToastProvider>
      {/* Tu aplicación */}
      <Router />
    </ToastProvider>
  )
}
```

### 2. Rutas Protegidas

Verificar permisos antes de mostrar los paneles:

```tsx
import { ProtectedRoute } from '../ProtectedRoute'

function AdminRoutes() {
  return (
    <ProtectedRoute requiredPermission="admin" level="system">
      <Routes>
        <Route path="/admin/menu-config" element={<PanelMenuConfig />} />
        <Route path="/admin/bulk-management" element={<AdminMenuManager />} />
      </Routes>
    </ProtectedRoute>
  )
}
```

### 3. Backend Integration

#### Guardar Permisos de Usuario
```typescript
interface SaveUserPermissionsRequest {
  userId: string
  permissions: GranularPermission[]
}

async function saveUserPermissions(data: SaveUserPermissionsRequest) {
  const response = await fetch('/api/admin/users/permissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  if (!response.ok) {
    throw new Error('Error al guardar permisos')
  }
  
  return response.json()
}
```

#### Obtener Usuarios para Configuración
```typescript
async function getUsersForConfiguration() {
  const response = await fetch('/api/admin/users?include=permissions')
  return response.json()
}
```

#### Aplicar Cambios Masivos
```typescript
interface BulkPermissionApplyRequest {
  roleId: string
  userIds: string[]
  permissions: GranularPermission[]
}

async function applyBulkPermissions(data: BulkPermissionApplyRequest) {
  const response = await fetch('/api/admin/roles/bulk-apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  return response.json()
}
```

## Características UX/UI

### Diseño Responsivo
- ✅ Mobile-first approach
- ✅ Grid layouts adaptativos
- ✅ Sidebar colapsible en móviles

### Estados de Interfaz
- ✅ Loading states con skeletons
- ✅ Empty states informativos
- ✅ Error states con acciones de recuperación
- ✅ Success states con feedback visual

### Accesibilidad
- ✅ Contraste adecuado (WCAG 2.1 AA)
- ✅ Navegación por teclado
- ✅ Screen reader friendly
- ✅ Focus management

### Animaciones
- ✅ Transiciones suaves entre estados
- ✅ Loading spinners
- ✅ Toast animations (slide-in)
- ✅ Micro-interacciones sutiles

## Configuración de Desarrollo

### Instalación de Dependencias

Los componentes utilizan:
- React 18+
- TypeScript
- Lucide React (iconos)
- Tailwind CSS
- shadcn/ui components

```bash
npm install lucide-react
```

### Configuración Tailwind

Asegúrate de tener configurados los colores semánticos:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Colores para tipos de permisos
        'permission-read': '#3b82f6',
        'permission-create': '#10b981',
        'permission-update': '#f59e0b',
        'permission-delete': '#ef4444',
        'permission-admin': '#8b5cf6'
      }
    }
  }
}
```

## Ejemplos de Uso Avanzado

### 1. Plantilla Personalizada

```tsx
import { createCustomTemplate } from '../utils/templates'

const customTemplate = createCustomTemplate({
  name: 'Médico Básico',
  hierarchy: 'medico_especialista',
  permissions: [
    {
      resource: 'patients',
      action: { read: true, create: true, update: true, delete: false, export: false, import: false, admin: false },
      level: 'department'
    }
  ]
})
```

### 2. Validaciones Personalizadas

```tsx
const validatePermissions = (permissions: GranularPermission[]) => {
  // Validar que no se asignen permisos admin sin verificar
  const hasAdminPermission = permissions.some(p => p.action.admin)
  
  if (hasAdminPermission) {
    throw new Error('Los permisos de administrador requieren validación adicional')
  }
  
  return true
}
```

### 3. Configuración por Empresa

```tsx
const getEnterpriseConfiguration = async (enterpriseId: string) => {
  const config = await api.get(`/admin/enterprises/${enterpriseId}/menu-config`)
  
  return {
    sections: config.enabledSections,
    customLabels: config.customLabels,
    forcedPermissions: config.forcedPermissions
  }
}
```

### 4. Operaciones Masivas con Confirmación

```tsx
const { showWarning } = useToast()

const handleBulkOperation = async (roleId: string, userIds: string[]) => {
  // Mostrar confirmación con acción personalizada
  showWarning(
    'Confirmar operación masiva',
    'Esta acción afectará a múltiples usuarios',
    {
      label: 'Confirmar',
      onClick: () => executeBulkOperation(roleId, userIds)
    }
  )
}
```

### 5. Auto-guardado Inteligente

```tsx
const [autoSave, setAutoSave] = useState(true)
const [pendingChanges, setPendingChanges] = useState(false)
const [lastSaved, setLastSaved] = useState<Date | null>(null)

// El sistema ahora maneja:
// - Auto-guardado después de 2 segundos de inactividad
// - Indicadores visuales de estado de guardado
// - Alertas de cambios pendientes
// - Manejo robusto de errores con reintentos

## Consideraciones de Seguridad

### Validación de Permisos
- ✅ Verificar permisos del admin antes de mostrar interfaces
- ✅ Validar cambios en el backend
- ✅ Auditoría de todos los cambios

### Protección de Operaciones Críticas
- ✅ **Confirmación de contraseña obligatoria** para operaciones masivas
- ✅ **Validación de contraseña** con longitud mínima
- ✅ **Advertencias visuales** para acciones destructivas
- ✅ **Confirmación doble** para cambios que afectan múltiples usuarios
- ✅ **Logs detallados** de todas las operaciones críticas

### Rate Limiting
- ✅ Limitar llamadas API en operaciones masivas
- ✅ Auto-guardado con debounce

### Auditoría Mejorada
- ✅ **Logs detallados** con contexto completo de operaciones
- ✅ **Tracking de plantillas aplicadas** con nombres específicos
- ✅ **Registro de confirmaciones de contraseña** para operaciones críticas
- ✅ **Auditoría de plantillas** aplicadas por jerarquía
- ✅ **Logs de errores** con stack traces para debugging

## Performance

### Optimizaciones Implementadas
- ✅ Debouncing en búsquedas
- ✅ Memoización de componentes pesados
- ✅ Lazy loading de datos
- ✅ Virtual scrolling en listas grandes

### Monitoreo
- ✅ Métricas de tiempo de carga
- ✅ Tracking de errores
- ✅ Performance budgets

## Troubleshooting

### Problemas Comunes

**Error: "Toast not found"**
```tsx
// Solución: Asegurar que ToastProvider envuelve la app
function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  )
}
```

**Permisos no se guardan**
```tsx
// Verificar que onSave está implementado correctamente
const handleSave = async (userId, permissions) => {
  try {
    await api.savePermissions(userId, permissions)
  } catch (error) {
    showError('Error', error.message)
  }
}
```

**Vista previa no se actualiza**
```tsx
// Verificar que los permisos se actualizan en tiempo real
useEffect(() => {
  // Recalcular vista previa cuando cambian los permisos
}, [userPermissions])
```

**Confirmación de contraseña falla**
```tsx
// Verificar longitud mínima y formato
const validatePassword = (password: string) => {
  return password.length >= 6 // Longitud mínima requerida
}
```

**Operación masiva no se ejecuta**
```tsx
// Verificar que hay usuarios seleccionados y rol válido
if (!selectedRole || selectedUsers.length === 0) {
  showWarning('Selección incompleta', 'Selecciona un rol y usuarios')
  return
}
```

**Plantillas no se aplican**
```tsx
// Verificar que hay un rol seleccionado
if (!selectedRole) {
  showWarning('Sin rol', 'Selecciona un rol primero')
  return
}
```

## Roadmap Futuro

- [ ] Configuración de menús por departamento
- [ ] Templates dinámicos configurables
- [ ] Previsualización con datos reales
- [ ] Integración con sistema de backup
- [ ] Dashboard de métricas de permisos
- [ ] API de configuración programática
- [ ] Migración de permisos entre sistemas

## Soporte

Para issues o preguntas sobre la implementación:
- Revisar la documentación técnica
- Consultar los ejemplos de código
- Verificar la configuración del backend

---

**Versión**: 2.0.0  
**Última actualización**: 2025-11-04  
**Compatibilidad**: MediFlow ERP v2.0+  
**Estado**: ✅ Producción - Completo y Optimizado