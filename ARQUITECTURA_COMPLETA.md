# 🏗️ ARQUITECTURA COMPLETA - MediFlow ERP Médico

**Fecha:** 11 de Noviembre de 2025  
**Versión:** 3.5.1  
**Estado:** Producción  

---

## 📋 TABLA DE CONTENIDO

1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Arquitectura Frontend](#arquitectura-frontend)
5. [Arquitectura Backend](#arquitectura-backend)
6. [Sistema de Autenticación](#sistema-de-autenticación)
7. [Sistema de Permisos](#sistema-de-permisos)
8. [Flujo de Datos](#flujo-de-datos)
9. [Patrones de Diseño](#patrones-de-diseño)

---

## 🎯 VISIÓN GENERAL

### Descripción del Sistema
MediFlow es un **ERP médico especializado en Medicina del Trabajo** con arquitectura SaaS multi-tenant. Permite gestionar:

- ✅ Pacientes y expedientes médicos
- ✅ Agenda y citas médicas
- ✅ Exámenes ocupacionales
- ✅ Evaluaciones de riesgo ergonómico
- ✅ Facturación y pagos
- ✅ Inventario médico
- ✅ Reportes y analytics
- ✅ IA predictiva y chatbot

### Características Principales
- **Multi-tenant:** Aislamiento completo por empresa
- **Roles jerárquicos:** Super Admin → Admin Empresa → Médico → Paciente
- **Tiempo real:** Sincronización con Supabase Realtime
- **Responsive:** Optimizado para desktop, tablet y móvil
- **PWA Ready:** Funciona offline (parcialmente)

### Usuarios del Sistema
| Rol | Permisos | Funcionalidad Principal |
|-----|----------|------------------------|
| **Super Admin** | Total | Gestión de empresas, usuarios globales |
| **Admin Empresa** | Empresa | Gestión de empleados, configuración |
| **Médico** | Pacientes | Consultas, exámenes, prescripciones |
| **Paciente** | Propios | Ver historial, agendar citas |

---

## 💻 STACK TECNOLÓGICO

### Frontend
```json
{
  "framework": "React 18.3.1",
  "bundler": "Vite 6.0.1",
  "lenguaje": "TypeScript 5.6.2",
  "routing": "React Router 6",
  "estilos": "Tailwind CSS 3.4.16",
  "ui": "shadcn/ui + Radix UI",
  "animaciones": "Framer Motion 12.23.24",
  "formularios": "React Hook Form + Zod",
  "graficos": "Recharts 2.12.4",
  "notificaciones": "React Hot Toast 2.6.0",
  "calendario": "React Big Calendar 1.19.4"
}
```

### Backend (Supabase)
```json
{
  "database": "PostgreSQL 15",
  "autenticacion": "Supabase Auth",
  "storage": "Supabase Storage",
  "funciones": "Edge Functions (Deno)",
  "realtime": "Supabase Realtime",
  "seguridad": "Row Level Security (RLS)"
}
```

### Integraciones (Planeadas)
- OpenAI GPT-4 (Chatbot IA)
- Stripe (Pagos)
- IMSS API (Validación de NSS)
- PAC (Facturación CFDI 4.0)

---

## 📁 ESTRUCTURA DEL PROYECTO

### Árbol de Directorios
```
erp-medico-frontend/
├── public/                    # Assets estáticos
├── src/
│   ├── components/           # Componentes reutilizables
│   │   ├── admin/           # Componentes administrativos
│   │   ├── auth/            # Autenticación y permisos
│   │   ├── certificaciones/ # Certificados médicos
│   │   ├── dashboard/       # Dashboards por rol
│   │   ├── facturacion/     # Facturación y pagos
│   │   ├── home/            # Landing y marketing
│   │   ├── inventario/      # Gestión de inventario
│   │   ├── medicina/        # Medicina del trabajo
│   │   ├── navigation/      # Menús y navegación
│   │   ├── permissions/     # Sistema de permisos
│   │   ├── reportes/        # Reportes y analytics
│   │   ├── tienda/          # E-commerce farmacia
│   │   └── ui/              # Componentes UI base
│   ├── contexts/            # React Contexts
│   │   ├── AuthContext.tsx         # Autenticación
│   │   ├── CarritoContext.tsx      # Carrito de compras
│   │   └── SystemIntegrationContext.tsx  # Estado global
│   ├── hooks/               # Custom hooks
│   │   ├── useAgenda.ts            # Hook para agenda
│   │   ├── useAuth.ts              # Hook para auth
│   │   ├── useInventario.ts        # Hook para inventario
│   │   ├── useMenuPermissions.ts   # Hook para permisos
│   │   └── ... (más hooks)
│   ├── lib/                 # Utilidades y configuración
│   │   ├── supabase.ts             # Cliente Supabase
│   │   ├── utils.ts                # Funciones útiles
│   │   └── permissionMiddleware.ts # Middleware permisos
│   ├── pages/               # Páginas de la aplicación
│   │   ├── Dashboard.tsx           # Dashboard principal
│   │   ├── LoginNew.tsx            # Login
│   │   ├── Pacientes.tsx           # Gestión pacientes
│   │   ├── Agenda.tsx              # Agenda médica
│   │   └── ... (más páginas)
│   ├── types/               # Definiciones TypeScript
│   │   ├── auth.ts                 # Tipos de autenticación
│   │   ├── saas.ts                 # Tipos SaaS
│   │   ├── inventario.ts           # Tipos inventario
│   │   └── ... (más tipos)
│   ├── config/              # Configuración
│   │   ├── roleConfig.ts           # Configuración roles
│   │   └── roleSections.ts         # Secciones por rol
│   ├── demo/                # Datos de demostración
│   │   └── demoData.ts
│   ├── main.tsx             # Punto de entrada
│   ├── AppNew.tsx           # Componente principal
│   └── index.css            # Estilos globales
├── supabase/                # Configuración Supabase
│   ├── migrations/          # Migraciones SQL
│   ├── functions/           # Edge Functions
│   └── tables/              # Esquemas de tablas
├── package.json             # Dependencias
├── vite.config.ts           # Configuración Vite
├── tailwind.config.js       # Configuración Tailwind
└── tsconfig.json            # Configuración TypeScript
```

### Organización por Módulos
```
📦 Módulo de Medicina del Trabajo
├── components/medicina/
│   ├── PrescripcionModal.tsx          # Prescripciones médicas
│   ├── OrdenLaboratorioModal.tsx      # Órdenes de laboratorio
│   ├── OrdenProductosModal.tsx        # Órdenes de productos
│   ├── CentroAccionesMedicas.tsx      # Centro de acciones
│   └── PrescripcionBuilderWrapperV2.tsx  # Constructor V2

📦 Módulo de Certificaciones
├── components/certificaciones/
│   ├── SistemaFirmaDigital.tsx        # Firma digital
│   ├── GeneradorCertificados.tsx      # Generador
│   └── ValidadorCertificados.tsx      # Validador

📦 Módulo de Facturación
├── components/facturacion/
│   ├── GeneradorCFDI.tsx              # CFDI 4.0
│   ├── EstadosCuenta.tsx              # Estados de cuenta
│   ├── PortalPagos.tsx                # Portal de pagos
│   └── GestionSeguros.tsx             # Seguros médicos

📦 Módulo de Inventario
├── components/inventario/
│   ├── InventarioPersonalizado.tsx    # Gestión stock
│   ├── ComponenteProveedores.tsx      # Proveedores
│   ├── ComponenteOrdenesCompra.tsx    # Órdenes de compra
│   └── ComponenteControlTemperatura.tsx  # Control temperatura
```

---

## 🎨 ARQUITECTURA FRONTEND

### Patrón de Componentes

#### 1. Componentes de Presentación (UI)
```typescript
// Componentes puros sin lógica de negocio
// Ubicación: src/components/ui/

export function Button({ children, variant, ...props }) {
  return (
    <button className={cn(buttonVariants({ variant }))} {...props}>
      {children}
    </button>
  )
}
```

#### 2. Componentes de Contenedor (Smart)
```typescript
// Componentes con lógica y conexión a estado
// Ubicación: src/pages/ y src/components/

export function Pacientes() {
  const { user } = useAuth()
  const { pacientes, loading } = usePacientes()
  
  return (
    <div>
      <ListaPacientes data={pacientes} />
    </div>
  )
}
```

#### 3. Componentes HOC y Wrappers
```typescript
// Higher Order Components para funcionalidad común
// Ubicación: src/components/

export function PermissionGate({ permission, children }) {
  const { hasPermission } = useAuth()
  
  if (!hasPermission(permission)) {
    return <AccessDenied />
  }
  
  return <>{children}</>
}
```

### Sistema de Rutas

#### Configuración de Rutas
```typescript
// src/AppNew.tsx
<Routes>
  {/* Login - Página pública */}
  <Route path="/login" element={<LoginNew />} />
  
  {/* Rutas protegidas con Layout */}
  <Route path="/" element={<Layout />}>
    <Route index element={<StartRedirect />} />
    
    {/* Dashboard */}
    <Route path="dashboard" element={<Dashboard />} />
    
    {/* Gestión de pacientes */}
    <Route path="pacientes" element={<Pacientes />} />
    <Route path="pacientes/:id/historial" element={<HistorialClinico />} />
    
    {/* Agenda */}
    <Route path="agenda" element={<Agenda />} />
    
    {/* Medicina del trabajo */}
    <Route path="examenes" element={<ExamenesOcupacionales />} />
    <Route path="evaluaciones" element={<EvaluacionesRiesgo />} />
    
    {/* Administrativo */}
    <Route path="facturacion" element={<Facturacion />} />
    <Route path="inventario" element={<Inventario />} />
    
    {/* Configuración */}
    <Route path="configuracion" element={<Configuracion />} />
  </Route>
</Routes>
```

#### Protección de Rutas
```typescript
// src/components/ProtectedRoute.tsx
export function ProtectedRoute({ 
  children, 
  permission, 
  redirect = '/dashboard' 
}) {
  const { user, hasPermission } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" />
  }
  
  if (permission && !hasPermission(permission)) {
    return <Navigate to={redirect} />
  }
  
  return <>{children}</>
}
```

### Gestión de Estado

#### Estado Local (useState)
```typescript
// Para estado de UI simple
const [open, setOpen] = useState(false)
const [searchTerm, setSearchTerm] = useState('')
```

#### Estado Global (Context API)
```typescript
// AuthContext - Estado de autenticación
// CarritoContext - Estado del carrito
// SystemIntegrationContext - Estado del sistema

const AuthContext = createContext<AuthContextType>()

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  // ... lógica de autenticación
  
  return (
    <AuthContext.Provider value={{ user, loading, ... }}>
      {children}
    </AuthContext.Provider>
  )
}
```

#### Custom Hooks
```typescript
// Hooks para lógica reutilizable
export function useInventario() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  
  const obtenerProductos = async () => {
    // Lógica de negocio
  }
  
  return {
    productos,
    loading,
    obtenerProductos,
    agregarProducto,
    editarProducto,
    eliminarProducto
  }
}
```

### Sistema de Estilos

#### Tailwind CSS
```typescript
// Uso de clases utility-first
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-900">Título</h2>
</div>
```

#### CSS Modules (para componentes específicos)
```css
/* src/components/medicina/hc_rx_v2.css */
.hc-rx-v2-container {
  --color-primary: #00BFA6;
  --spacing-unit: 8px;
}
```

#### Tema y Diseño
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F7F4',
          500: '#00BFA6',  // Verde médico principal
          700: '#00896B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui'],
      },
    },
  },
}
```

---

## 🗄️ ARQUITECTURA BACKEND

### Supabase Configuration

#### Cliente Supabase
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

#### Tablas Principales

```sql
-- Tabla de usuarios
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  apellido_paterno TEXT NOT NULL,
  apellido_materno TEXT,
  rol TEXT NOT NULL CHECK (rol IN ('super_admin', 'admin_empresa', 'medico', 'paciente')),
  empresa_id UUID REFERENCES empresas(id),
  sede_id UUID REFERENCES sedes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de empresas
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  rfc TEXT UNIQUE,
  plan TEXT DEFAULT 'basico' CHECK (plan IN ('basico', 'profesional', 'enterprise')),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pacientes
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  nombre TEXT NOT NULL,
  apellido_paterno TEXT NOT NULL,
  apellido_materno TEXT,
  curp TEXT,
  nss TEXT,
  fecha_nacimiento DATE,
  sexo TEXT CHECK (sexo IN ('masculino', 'femenino', 'otro')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de citas
CREATE TABLE citas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  paciente_id UUID NOT NULL REFERENCES pacientes(id),
  medico_id UUID NOT NULL REFERENCES usuarios(id),
  fecha TIMESTAMP WITH TIME ZONE NOT NULL,
  duracion INTEGER DEFAULT 30,
  estado TEXT DEFAULT 'pendiente',
  motivo TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Más tablas...
```

#### Row Level Security (RLS)

```sql
-- Política RLS para pacientes
CREATE POLICY "Usuarios ven solo pacientes de su empresa"
ON pacientes FOR SELECT
USING (empresa_id = auth.jwt() -> 'empresa_id');

-- Política RLS para citas
CREATE POLICY "Médicos gestionan sus propias citas"
ON citas FOR ALL
USING (
  medico_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol IN ('super_admin', 'admin_empresa')
  )
);
```

### APIs y Servicios

#### API de Chatbot (Simulada)
```typescript
// src/lib/supabase.ts
export const chatbot = {
  async enviarMensaje(mensaje: string, conversacionId?: string) {
    // Simulación básica sin edge functions
    return {
      respuesta: `Respuesta demo para: "${mensaje}"`,
      conversacion_id: conversacionId || 'demo-conv-1',
      tipo_mensaje: 'respuesta_bot',
      sentiment: 'neutral',
      confidence: 0.5
    }
  }
}
```

#### API de Dashboard
```typescript
export const dashboard = {
  async obtenerEstadisticas(empresaId: string) {
    const { data, error } = await supabase
      .from('estadisticas_dashboard')
      .select('*')
      .eq('empresa_id', empresaId)
      .single()
    
    return data
  }
}
```

---

## 🔐 SISTEMA DE AUTENTICACIÓN

### Flujo de Autenticación

```
1. Usuario ingresa credenciales
   ↓
2. Frontend envía a Supabase Auth
   ↓
3. Supabase valida y retorna JWT
   ↓
4. Frontend obtiene datos completos del usuario
   ↓
5. Guarda en AuthContext + localStorage
   ↓
6. Redirige a dashboard según rol
```

### Implementación

```typescript
// src/contexts/AuthContext.tsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null)
  
  const login = async (email: string, password: string) => {
    // 1. Login con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    
    // 2. Obtener datos completos
    const { data: userData } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', data.user.id)
      .single()
    
    // 3. Guardar en estado
    setUser(userData)
    localStorage.setItem('mediflow_user', JSON.stringify(userData))
  }
  
  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    localStorage.removeItem('mediflow_user')
  }
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
```

---

## 🛡️ SISTEMA DE PERMISOS

### Jerarquía de Roles

```
Super Admin (Nivel 4)
  ↓
Admin Empresa (Nivel 3)
  ↓
Médico (Nivel 2)
  ↓
Paciente (Nivel 1)
```

### Definición de Permisos

```typescript
// src/types/auth.ts
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    { resource: 'dashboard', actions: ['read', 'manage'] },
    { resource: 'empresas', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'usuarios', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    // ... todos los permisos
  ],
  admin_empresa: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'usuarios', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'pacientes', actions: ['create', 'read', 'update', 'delete'] },
    // ... permisos de empresa
  ],
  medico: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'pacientes', actions: ['create', 'read', 'update'] },
    { resource: 'citas', actions: ['create', 'read', 'update'] },
    // ... permisos médicos
  ],
  paciente: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'citas', actions: ['create', 'read'] },
    { resource: 'perfil', actions: ['read', 'update'] },
  ]
}
```

### Verificación de Permisos

```typescript
// Función helper
export function hasPermission(
  userRole: UserRole,
  resource: string,
  action: PermissionAction
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole]
  const resourcePermission = rolePermissions.find(p => p.resource === resource)
  return resourcePermission?.actions.includes(action) || false
}

// Uso en componentes
const { user, hasPermission } = useAuth()

if (hasPermission('pacientes', 'create')) {
  // Mostrar botón de crear paciente
}
```

### Componente PermissionGate

```typescript
// src/components/auth/PermissionGate.tsx
export function PermissionGate({ 
  permission, 
  children, 
  fallback = null 
}) {
  const { hasPermission } = useAuth()
  
  if (!hasPermission(permission)) {
    return fallback
  }
  
  return <>{children}</>
}

// Uso
<PermissionGate permission={{ resource: 'pacientes', action: 'create' }}>
  <Button>Crear Paciente</Button>
</PermissionGate>
```

---

## 🔄 FLUJO DE DATOS

### Patrón Unidireccional

```
Usuario interactúa
  ↓
Evento disparado
  ↓
Hook procesa lógica
  ↓
Llama API (Supabase)
  ↓
Actualiza estado local
  ↓
Re-renderiza UI
```

### Ejemplo Completo: Crear Paciente

```typescript
// 1. Componente UI
function FormularioNuevoPaciente() {
  const { agregarPaciente, loading } = usePacientes()
  
  const onSubmit = async (data) => {
    await agregarPaciente(data)
    toast.success('Paciente creado')
  }
  
  return <form onSubmit={handleSubmit(onSubmit)}>...</form>
}

// 2. Custom Hook
function usePacientes() {
  const [pacientes, setPacientes] = useState([])
  
  const agregarPaciente = async (data) => {
    const { data: nuevoPaciente, error } = await supabase
      .from('pacientes')
      .insert([data])
      .select()
      .single()
    
    if (!error) {
      setPacientes([...pacientes, nuevoPaciente])
    }
    
    return nuevoPaciente
  }
  
  return { pacientes, agregarPaciente }
}
```

---

## 🎨 PATRONES DE DISEÑO

### 1. Container/Presentational Pattern
```typescript
// Container (Smart)
function PacientesContainer() {
  const { pacientes, loading } = usePacientes()
  return <PacientesList data={pacientes} loading={loading} />
}

// Presentational (Dumb)
function PacientesList({ data, loading }) {
  if (loading) return <Spinner />
  return data.map(p => <PacienteCard key={p.id} paciente={p} />)
}
```

### 2. Custom Hooks Pattern
```typescript
// Encapsular lógica reutilizable
function useFormulario(initialValues) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  
  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value })
  }
  
  return { values, errors, handleChange }
}
```

### 3. Compound Components Pattern
```typescript
// Componentes que trabajan juntos
function Card({ children }) {
  return <div className="card">{children}</div>
}

Card.Header = ({ children }) => <div className="card-header">{children}</div>
Card.Body = ({ children }) => <div className="card-body">{children}</div>
Card.Footer = ({ children }) => <div className="card-footer">{children}</div>

// Uso
<Card>
  <Card.Header>Título</Card.Header>
  <Card.Body>Contenido</Card.Body>
  <Card.Footer>Acciones</Card.Footer>
</Card>
```

### 4. Provider Pattern
```typescript
// Context + Provider para estado global
const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
```

---

## 📊 RENDIMIENTO Y OPTIMIZACIÓN

### Lazy Loading de Rutas
```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Pacientes = lazy(() => import('./pages/Pacientes'))

<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/pacientes" element={<Pacientes />} />
  </Routes>
</Suspense>
```

### Memoización
```typescript
// useMemo para cálculos costosos
const pacientesFiltrados = useMemo(() => {
  return pacientes.filter(p => p.nombre.includes(searchTerm))
}, [pacientes, searchTerm])

// useCallback para funciones
const handleClick = useCallback(() => {
  console.log('Clicked')
}, [])

// React.memo para componentes
const PacienteCard = React.memo(({ paciente }) => {
  return <div>{paciente.nombre}</div>
})
```

---

## 🔧 CONFIGURACIÓN Y DEPLOYMENT

### Variables de Entorno
```bash
# .env.local
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
VITE_APP_NAME=MediFlow
VITE_APP_VERSION=3.5.1
```

### Build de Producción
```bash
# Instalar dependencias
pnpm install

# Build optimizado
pnpm build

# Preview del build
pnpm preview
```

### Deployment
```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod

# Docker
docker build -t mediflow .
docker run -p 3000:3000 mediflow
```

---

## 📝 CONVENCIONES DE CÓDIGO

### Nombres de Archivos
```
PascalCase → Componentes: PacienteCard.tsx
camelCase → Hooks: useInventario.ts
kebab-case → CSS: hc-rx-v2.css
UPPER_CASE → Constantes: ROLE_PERMISSIONS
```

### Estructura de Componentes
```typescript
// 1. Imports
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

// 2. Types/Interfaces
interface Props {
  title: string
  onSave: () => void
}

// 3. Component
export function MiComponente({ title, onSave }: Props) {
  // 3.1 Hooks
  const [open, setOpen] = useState(false)
  
  // 3.2 Handlers
  const handleClick = () => {
    onSave()
  }
  
  // 3.3 Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Guardar</Button>
    </div>
  )
}
```

---

## 🎯 MEJORES PRÁCTICAS

### ✅ DO
- Usar TypeScript para todo
- Memoizar componentes pesados
- Implementar manejo de errores
- Validar inputs con Zod
- Lazy load de rutas
- Usar custom hooks para lógica

### ❌ DON'T
- No usar `any` (usar `unknown`)
- No hardcodear credenciales
- No mutar estado directamente
- No skip de permisos en producción
- No componentes >300 líneas

---

**Última actualización:** 11 de Noviembre de 2025  
**Mantenido por:** Equipo de Desarrollo MediFlow
