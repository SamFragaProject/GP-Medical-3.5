# 🎨 UI Consistency Agent - GPMedical ERP

## Objetivo

Unificar el diseño visual de todos los módulos de administración para crear una experiencia consistente y profesional.

## Problema Actual

Los módulos de admin tienen diferentes estilos:

### GestionEmpresas.tsx
- Usa `PremiumHeader` y `PremiumButton`
- Cards con bordes redondeados `[2.5rem]`
- Colores: blue-600, emerald

### GestionRoles.tsx
- Usa estilo propio
- Cards con `rounded-[2.5rem]`
- Colores personalizados por rol

### SuperAdminGodMode.tsx
- Usa `Card` de shadcn estándar
- Tabs nativos
- Estilo más básico

## Solución: AdminLayout System

Ya existe `src/components/admin/AdminLayout.tsx` con componentes unificados:

```typescript
import {
  AdminLayout,
  AdminCard,
  AdminStatsGrid,
  AdminSearchBar,
  AdminLoadingState,
  AdminEmptyState
} from '@/components/admin/AdminLayout';
```

## Checklist de Unificación

### Páginas a Actualizar

#### 1. GestionEmpresas.tsx
**Ubicación:** `src/pages/admin/GestionEmpresas.tsx`

**Cambios necesarios:**
```tsx
// REEMPLAZAR:
<PremiumHeader title="...">
<Card className="rounded-[2.5rem]">

// CON:
<AdminLayout
  title="Gestión de Empresas"
  subtitle="Administra los socios corporativos"
  icon={Building2}
  badges={[{ text: 'Multi-Tenancy', variant: 'info' }]}
  actions={<Button>Nueva Empresa</Button>}
>
  <AdminStatsGrid stats={[...]} />
  <AdminCard title="Lista de Empresas">
    {/* contenido */}
  </AdminCard>
</AdminLayout>
```

#### 2. GestionRoles.tsx
**Ubicación:** `src/pages/admin/GestionRoles.tsx`

**Cambios necesarios:**
- Usar `AdminLayout` como wrapper
- Reemplazar cards personalizadas con `AdminCard`
- Mantener colores por rol (feature visual importante)

#### 3. SuperAdminGodMode.tsx
**Ubicación:** `src/pages/admin/SuperAdminGodMode.tsx`

**Cambios necesarios:**
- Usar `AdminLayout` con backButton
- Reemplazar Tabs nativos con versión estilizada
- Unificar cards con `AdminCard`

#### 4. Usuarios.tsx
**Ubicación:** `src/pages/Usuarios.tsx` o `src/pages/admin/`

**Cambios necesarios:**
- Aplicar `AdminLayout`
- Unificar tabla de usuarios
- Usar `AdminSearchBar` para búsqueda

#### 5. Otras páginas admin
- [ ] `src/pages/admin/LogsView.tsx`
- [ ] `src/pages/admin/PluginMarketplace.tsx`
- [ ] `src/pages/admin/AIWorkbench.tsx`
- [ ] `src/pages/admin/WebhookSimulator.tsx`
- [ ] `src/pages/admin/Suscripcion.tsx`

### Componentes a Estandarizar

#### Headers
Todos deben usar `AdminLayout` con:
- Icono representativo
- Título claro
- Subtítulo descriptivo
- Badges informativos
- Acciones (botones)

#### Cards
Todos deben usar `AdminCard` con:
- Bordes redondeados consistentes (2xl)
- Sombras sutiles
- Padding estándar
- Header opcional con título

#### Botones
Estandarizar en todo el admin:
```
Primario: bg-emerald-600 text-white
Secundario: bg-white border border-slate-200
Peligro: bg-red-600 text-white
```

#### Tablas
Crear componente `AdminTable`:
- Headers con fondo slate-50
- Hover suave en filas
- Badges para estados
- Acciones con dropdown

#### Formularios
Crear componente `AdminForm`:
- Labels consistentes
- Inputs con bordes slate-200
- Focus ring emerald
- Espaciado estándar

#### Badges de Estado
Estandarizar colores:
```
Activo/Online: bg-emerald-100 text-emerald-700
Inactivo/Offline: bg-slate-100 text-slate-700
Pendiente: bg-amber-100 text-amber-700
Error: bg-red-100 text-red-700
Info: bg-blue-100 text-blue-700
```

## Paleta de Colores Admin

```css
/* Fondo */
--admin-bg: #f8fafc;  /* slate-50 */

/* Cards */
--admin-card-bg: #ffffff;
--admin-card-border: #e2e8f0;  /* slate-200 */

/* Texto */
--admin-text-primary: #0f172a;   /* slate-900 */
--admin-text-secondary: #64748b; /* slate-500 */
--admin-text-muted: #94a3b8;     /* slate-400 */

/* Acento */
--admin-accent: #059669;         /* emerald-600 */
--admin-accent-light: #d1fae5;   /* emerald-100 */
```

## Espaciado Consistente

```css
/* Padding */
--admin-padding-sm: 1rem;   /* 16px */
--admin-padding: 1.5rem;    /* 24px */
--admin-padding-lg: 2rem;   /* 32px */

/* Gap */
--admin-gap-sm: 0.75rem;    /* 12px */
--admin-gap: 1rem;          /* 16px */
--admin-gap-lg: 1.5rem;     /* 24px */

/* Border Radius */
--admin-radius: 0.75rem;    /* 12px */
--admin-radius-lg: 1rem;    /* 16px */
--admin-radius-xl: 1.5rem;  /* 24px */
```

## Proceso de Actualización

### Paso 1: Crear Componentes Base
- [ ] Verificar `AdminLayout.tsx` existente
- [ ] Crear `AdminTable.tsx` si no existe
- [ ] Crear `AdminForm.tsx` si no existe

### Paso 2: Actualizar Páginas (una por una)
1. GestionEmpresas
2. GestionRoles
3. SuperAdminGodMode
4. Usuarios
5. Resto de páginas admin

### Paso 3: Verificar Consistencia
- Navegar entre todas las páginas admin
- Verificar que el layout sea consistente
- Comprobar responsive

### Paso 4: Documentar
- Actualizar este archivo con cambios
- Documentar nuevos componentes

## Reporte Final

Incluir:
1. Páginas actualizadas
2. Componentes creados/modificados
3. Screenshots comparativos (si es posible)
4. Lista de verificación completada
