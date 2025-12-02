# 🚀 GUÍA DE DESARROLLO - MediFlow

**Fecha:** 11 de Noviembre de 2025  
**Versión:** 3.5.1  

---

## 📋 TABLA DE CONTENIDO

1. [Configuración del Entorno](#configuración-del-entorno)
2. [Primeros Pasos](#primeros-pasos)
3. [Flujo de Trabajo](#flujo-de-trabajo)
4. [Crear Nuevos Módulos](#crear-nuevos-módulos)
5. [Extender Funcionalidad](#extender-funcionalidad)
6. [Testing](#testing)
7. [Deployment](#deployment)

---

## ⚙️ CONFIGURACIÓN DEL ENTORNO

### Requisitos Previos

```bash
# Versiones requeridas
Node.js: >= 18.0.0
pnpm: >= 9.0.0
Git: >= 2.30.0

# Verificar versiones instaladas
node --version
pnpm --version
git --version
```

### Instalación Inicial

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-org/mediflow.git
cd mediflow/erp-medico-frontend

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env.local

# 4. Editar .env.local con tus credenciales
nano .env.local
```

### Variables de Entorno

```bash
# .env.local
# Supabase (Obligatorio)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima

# OpenAI (Opcional - para chatbot)
VITE_OPENAI_API_KEY=sk-tu-clave-openai

# Stripe (Opcional - para pagos)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_tu-clave

# Configuración general
VITE_APP_NAME=MediFlow
VITE_APP_VERSION=3.5.1
VITE_APP_URL=http://localhost:5173

# Entorno
NODE_ENV=development
```

### Extensiones Recomendadas para VS Code

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets",
    "usernamehw.errorlens",
    "ms-vscode.vscode-typescript-next",
    "github.copilot"
  ]
}
```

---

## 🎬 PRIMEROS PASOS

### Iniciar el Proyecto

```bash
# Modo desarrollo
pnpm dev

# La aplicación estará disponible en:
# http://localhost:5173

# Accesos demo:
# Email: medico@demo.com
# Password: demo123
```

### Estructura del Código

```
src/
├── components/       # Componentes reutilizables
│   ├── ui/          # Componentes base (Button, Card, etc.)
│   ├── auth/        # Autenticación y permisos
│   ├── medicina/    # Componentes médicos
│   └── ...
├── contexts/        # React Contexts (estado global)
├── hooks/           # Custom hooks
├── lib/             # Utilidades y configuración
├── pages/           # Páginas de la aplicación
├── types/           # Definiciones TypeScript
└── config/          # Configuración de la app
```

### Comandos Principales

```bash
# Desarrollo
pnpm dev              # Inicia servidor de desarrollo

# Build
pnpm build            # Build de producción
pnpm preview          # Preview del build

# Linting
pnpm lint             # Ejecuta ESLint

# Testing (cuando esté configurado)
pnpm test             # Ejecuta tests
pnpm test:watch       # Tests en modo watch

# Limpieza
pnpm clean            # Limpia node_modules y cache
```

---

## 🔄 FLUJO DE TRABAJO

### Branching Strategy (GitFlow)

```bash
# Ramas principales
main          # Producción estable
develop       # Desarrollo activo

# Ramas de feature
feature/nombre-feature

# Ramas de hotfix
hotfix/nombre-fix

# Ramas de release
release/v3.5.2
```

### Workflow Típico

```bash
# 1. Crear rama de feature
git checkout develop
git pull origin develop
git checkout -b feature/nuevo-modulo

# 2. Desarrollar
# ... hacer cambios ...

# 3. Commit con conventional commits
git add .
git commit -m "feat: agregar módulo de reportes avanzados"

# 4. Push y crear PR
git push origin feature/nuevo-modulo
# Crear Pull Request en GitHub

# 5. Code Review y Merge
# Después de aprobación, merge a develop
```

### Conventional Commits

```bash
# Formato
<type>(<scope>): <description>

# Tipos
feat:     Nueva funcionalidad
fix:      Corrección de bug
docs:     Cambios en documentación
style:    Formato, sin cambios de código
refactor: Refactorización de código
perf:     Mejoras de performance
test:     Agregar o corregir tests
chore:    Tareas de mantenimiento

# Ejemplos
feat(auth): agregar login con Google
fix(pacientes): corregir filtro por fecha
docs(readme): actualizar instrucciones
refactor(hooks): simplificar useInventario
```

---

## 🆕 CREAR NUEVOS MÓDULOS

### Paso 1: Planificación

```markdown
## Módulo: Vacunación

### Objetivo
Gestionar esquemas de vacunación de empleados

### Funcionalidades
1. Registrar vacunas aplicadas
2. Control de esquemas completos/incompletos
3. Alertas de refuerzos pendientes
4. Reportes de cobertura

### Componentes Necesarios
- VacunacionDashboard.tsx
- FormularioVacuna.tsx
- EsquemaVacunacion.tsx
- AlertasVacunas.tsx

### Base de Datos
- Tabla: vacunas
- Tabla: esquemas_vacunacion
- Tabla: aplicaciones_vacuna
```

### Paso 2: Crear Tipos

```typescript
// src/types/vacunacion.ts

export interface Vacuna {
  id: string
  nombre: string
  descripcion: string
  fabricante: string
  lote: string
  fecha_caducidad: Date
  requiere_refuerzo: boolean
  intervalo_refuerzo_dias: number
}

export interface AplicacionVacuna {
  id: string
  paciente_id: string
  vacuna_id: string
  fecha_aplicacion: Date
  dosis_numero: number
  lote: string
  via_administracion: string
  sitio_aplicacion: string
  aplicado_por: string
  observaciones: string
}

export interface EsquemaVacunacion {
  id: string
  nombre: string
  vacunas: VacunaEsquema[]
  obligatorio: boolean
}

export interface VacunaEsquema {
  vacuna_id: string
  dosis_requeridas: number
  intervalo_entre_dosis: number
}
```

### Paso 3: Crear Custom Hook

```typescript
// src/hooks/useVacunacion.ts

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Vacuna, AplicacionVacuna } from '@/types/vacunacion'

export function useVacunacion() {
  const [vacunas, setVacunas] = useState<Vacuna[]>([])
  const [aplicaciones, setAplicaciones] = useState<AplicacionVacuna[]>([])
  const [loading, setLoading] = useState(true)
  
  // Obtener vacunas disponibles
  const obtenerVacunas = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('vacunas')
        .select('*')
        .eq('activo', true)
        .order('nombre')
      
      if (error) throw error
      setVacunas(data || [])
    } catch (error) {
      console.error('Error obteniendo vacunas:', error)
      toast.error('Error al cargar vacunas')
    } finally {
      setLoading(false)
    }
  }
  
  // Registrar aplicación de vacuna
  const registrarAplicacion = async (aplicacion: Omit<AplicacionVacuna, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('aplicaciones_vacuna')
        .insert([aplicacion])
        .select()
        .single()
      
      if (error) throw error
      
      setAplicaciones([...aplicaciones, data])
      toast.success('Vacuna registrada exitosamente')
      return data
    } catch (error) {
      console.error('Error registrando vacuna:', error)
      toast.error('Error al registrar vacuna')
      throw error
    }
  }
  
  // Obtener aplicaciones por paciente
  const obtenerAplicacionesPaciente = async (paciente_id: string) => {
    try {
      const { data, error } = await supabase
        .from('aplicaciones_vacuna')
        .select(`
          *,
          vacuna:vacunas(*)
        `)
        .eq('paciente_id', paciente_id)
        .order('fecha_aplicacion', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error obteniendo aplicaciones:', error)
      return []
    }
  }
  
  // Verificar esquema completo
  const verificarEsquemaCompleto = async (
    paciente_id: string, 
    esquema_id: string
  ): Promise<boolean> => {
    // Lógica para verificar si el paciente completó el esquema
    // ...
    return false
  }
  
  useEffect(() => {
    obtenerVacunas()
  }, [])
  
  return {
    vacunas,
    aplicaciones,
    loading,
    obtenerVacunas,
    registrarAplicacion,
    obtenerAplicacionesPaciente,
    verificarEsquemaCompleto
  }
}
```

### Paso 4: Crear Componente Principal

```typescript
// src/pages/Vacunacion.tsx

import React, { useState } from 'react'
import { useVacunacion } from '@/hooks/useVacunacion'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { FormularioVacuna } from '@/components/vacunacion/FormularioVacuna'

export function Vacunacion() {
  const { vacunas, loading, registrarAplicacion } = useVacunacion()
  const [modalOpen, setModalOpen] = useState(false)
  
  const handleRegistrar = async (data) => {
    await registrarAplicacion(data)
    setModalOpen(false)
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Vacunación</h1>
        <Button onClick={() => setModalOpen(true)}>
          Registrar Vacuna
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPIs */}
        <Card>
          <CardHeader>
            <CardTitle>Vacunas Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{vacunas.length}</p>
          </CardContent>
        </Card>
        
        {/* Más contenido... */}
      </div>
      
      <FormularioVacuna
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleRegistrar}
        vacunas={vacunas}
      />
    </div>
  )
}
```

### Paso 5: Agregar Ruta

```typescript
// src/AppNew.tsx

<Route path="/" element={<Layout />}>
  {/* ... otras rutas ... */}
  
  {/* Nueva ruta de vacunación */}
  <Route path="vacunacion" element={<Vacunacion />} />
</Route>
```

### Paso 6: Agregar al Menú

```typescript
// src/config/roleConfig.ts

export const ROLE_PERMISSIONS = {
  medico: [
    // ... permisos existentes
    { resource: 'vacunacion', actions: ['create', 'read', 'update'] }
  ]
}

// En el componente de menú
const menuItems = [
  // ... items existentes
  {
    id: 'vacunacion',
    label: 'Vacunación',
    icon: Syringe,
    path: '/vacunacion',
    permission: { resource: 'vacunacion', action: 'read' }
  }
]
```

---

## 🔧 EXTENDER FUNCIONALIDAD

### Agregar Nuevo Campo a Paciente

#### 1. Migración SQL

```sql
-- supabase/migrations/add_tipo_sangre_to_pacientes.sql

ALTER TABLE pacientes 
ADD COLUMN tipo_sangre TEXT 
CHECK (tipo_sangre IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'));

CREATE INDEX idx_pacientes_tipo_sangre ON pacientes(tipo_sangre);
```

#### 2. Actualizar Tipo TypeScript

```typescript
// src/types/paciente.ts

export interface Paciente {
  // ... campos existentes
  tipo_sangre?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
}
```

#### 3. Actualizar Formulario

```typescript
// src/components/FormularioPaciente.tsx

<Select
  name="tipo_sangre"
  label="Tipo de Sangre"
  options={[
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' }
  ]}
/>
```

### Agregar Nueva Acción a Hook

```typescript
// src/hooks/usePacientes.ts

export function usePacientes() {
  // ... estado y funciones existentes
  
  // Nueva función: Exportar pacientes a Excel
  const exportarExcel = async (filtros?: FiltrosPaciente) => {
    try {
      let query = supabase
        .from('pacientes')
        .select('*')
        .eq('empresa_id', user?.empresa_id)
      
      if (filtros?.nombre) {
        query = query.ilike('nombre', `%${filtros.nombre}%`)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      // Convertir a formato Excel (usar librería como xlsx)
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(data)
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Pacientes')
      
      // Descargar
      XLSX.writeFile(workbook, `pacientes_${Date.now()}.xlsx`)
      
      toast.success('Archivo exportado exitosamente')
    } catch (error) {
      console.error('Error exportando:', error)
      toast.error('Error al exportar')
    }
  }
  
  return {
    // ... returns existentes
    exportarExcel
  }
}
```

---

## 🧪 TESTING

### Configurar Testing (Vitest)

```bash
# Instalar dependencias
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  // ... configuración existente
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts'
  }
})
```

### Escribir Tests

```typescript
// src/hooks/__tests__/useAuth.test.ts

import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../useAuth'

describe('useAuth', () => {
  it('debe iniciar con usuario null', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.user).toBeNull()
  })
  
  it('debe hacer login correctamente', async () => {
    const { result } = renderHook(() => useAuth())
    
    await act(async () => {
      await result.current.login('test@example.com', 'password123')
    })
    
    expect(result.current.user).not.toBeNull()
    expect(result.current.isAuthenticated).toBe(true)
  })
})
```

```typescript
// src/components/__tests__/Button.test.tsx

import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../ui/button'

describe('Button', () => {
  it('debe renderizar correctamente', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
  
  it('debe llamar onClick cuando se hace clic', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

---

## 🚀 DEPLOYMENT

### Build de Producción

```bash
# 1. Build optimizado
pnpm build

# 2. Verificar build
pnpm preview

# 3. Verificar que no haya errores de TypeScript
pnpm type-check
```

### Deployment en Vercel

```bash
# Instalar Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Deployment en Netlify

```bash
# Instalar Netlify CLI
pnpm add -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Variables de Entorno en Producción

```bash
# En el dashboard de Vercel/Netlify, agregar:
VITE_SUPABASE_URL=https://produccion.supabase.co
VITE_SUPABASE_ANON_KEY=clave-produccion
VITE_APP_URL=https://mediflow.com
NODE_ENV=production
```

---

## 📝 CHECKLIST DE DESARROLLO

### Antes de Commit

- [ ] Código funciona correctamente
- [ ] No hay errores de TypeScript
- [ ] No hay warnings de ESLint
- [ ] Código formateado con Prettier
- [ ] Tests pasan (si aplica)
- [ ] Documentación actualizada

### Antes de PR

- [ ] Branch actualizado con develop
- [ ] Todos los tests pasan
- [ ] Build de producción funciona
- [ ] Sin console.log innecesarios
- [ ] Cambios documentados en CHANGELOG

### Antes de Deploy

- [ ] Variables de entorno configuradas
- [ ] Migraciones de BD aplicadas
- [ ] Tests E2E pasan
- [ ] Performance verificada
- [ ] SEO optimizado

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "pnpm install" falla

```bash
# Limpiar caché
pnpm store prune
rm -rf node_modules pnpm-lock.yaml

# Reinstalar
pnpm install
```

### Error: TypeScript no reconoce paths @/

```bash
# Verificar tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

# Reiniciar TypeScript server en VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Error: Supabase connection refused

```bash
# Verificar variables de entorno
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Verificar que Supabase esté activo
# Dashboard: https://app.supabase.com
```

---

## 📚 RECURSOS ADICIONALES

### Documentación Oficial
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

### Comunidad
- Discord de MediFlow
- GitHub Discussions
- Stack Overflow tag: mediflow

---

**Última actualización:** 11 de Noviembre de 2025  
**Mantenido por:** Equipo de Desarrollo MediFlow

¿Necesitas ayuda? Contacta a: dev@mediflow.com
