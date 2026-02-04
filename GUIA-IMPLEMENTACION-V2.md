# 🚀 GUÍA DE IMPLEMENTACIÓN V2

**Fecha:** 3 de Febrero de 2026  
**Versión:** 1.0.0

---

## ✅ Lo que ya está creado

```
src-v2/
├── config/
│   ├── feature-flags.ts      ← Control de activación
│   └── env.ts                ← Validación de variables
│
├── modules/
│   ├── auth-v2/              ← Auth con refresh token
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   │
│   └── pacientes-v2/         ← Pacientes con BD real
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types/
│
├── shared/
│   ├── components/ui/
│   │   ├── ButtonV2.tsx      ← Con loading y confirmación
│   │   └── DialogV2.tsx      ← Mejorado
│   └── hooks/
│       └── useDebounce.ts
│
├── version-router.tsx        ← Selector V1 vs V2
└── index.ts                  ← Exportaciones
```

---

## 📋 Pasos para activar V2

### 1. Instalar dependencias

```bash
cd erp-medico-frontend

# React Query (para caché y estado server)
npm install @tanstack/react-query

# Zod (para validaciones)
npm install zod

# React Hook Form (para formularios)
npm install react-hook-form @hookform/resolvers
```

### 2. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.v2.example .env.local

# Editar .env.local con tus credenciales
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima

# Activar módulos V2 listos
VITE_USE_AUTH_V2=true
VITE_USE_PACIENTES_V2=true
```

### 3. Configurar React Query

```typescript
// src/main.tsx (o crear src-v2/providers/QueryProvider.tsx)

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Envolver app
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### 4. Actualizar App.tsx para usar Version Router

```typescript
// src/AppNew.tsx (modificar)

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Version Router (selecciona V1 o V2 según feature flags)
import { 
  AuthProviderRouter as AuthProvider,
  Login,
  PacientesRouter as Pacientes,
  logActiveVersions 
} from './src-v2/version-router';

// Layout original
import { Layout } from './components/Layout';

const queryClient = new QueryClient();

function App() {
  // Log versiones activas en desarrollo
  if (import.meta.env.DEV) {
    logActiveVersions();
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route path="pacientes" element={<Pacientes />} />
              {/* ... otras rutas */}
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

### 5. Actualizar tsconfig.json (path aliases)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@v2/*": ["./src-v2/*"]
    }
  }
}
```

---

## 🧪 Probar la implementación

### 1. Verificar que V1 sigue funcionando

```bash
# En .env.local, desactivar todos los flags V2
VITE_USE_AUTH_V2=false
VITE_USE_PACIENTES_V2=false

# Iniciar app
npm run dev

# Probar: Todo debe funcionar igual que antes
```

### 2. Activar Auth V2

```bash
# En .env.local
VITE_USE_AUTH_V2=true

# Probar:
# - Login debe funcionar con refresh token
# - Sesión debe persistir al recargar
# - Logout debe limpiar todo
```

### 3. Activar Pacientes V2

```bash
# En .env.local
VITE_USE_PACIENTES_V2=true

# Probar:
# - Listado debe cargar desde Supabase real
# - Paginación debe funcionar
# - Búsqueda debe filtrar
# - Ordenamiento debe funcionar
```

---

## 📊 Verificar funcionamiento

### Checklist de pruebas

```markdown
## Auth V2
- [ ] Login con credenciales válidas funciona
- [ ] Login con credenciales inválidas muestra error
- [ ] Sesión persiste al recargar página
- [ ] Token se refresca automáticamente
- [ ] Logout limpia sesión y redirecciona
- [ ] Recovery password envía email

## Pacientes V2
- [ ] Listado carga datos reales de Supabase
- [ ] Paginación funciona correctamente
- [ ] Búsqueda filtra en tiempo real
- [ ] Ordenamiento por columnas funciona
- [ ] Crear paciente funciona
- [ ] Editar paciente funciona
- [ ] Eliminar paciente pide confirmación
- [ ] Stats cards muestran datos correctos
```

---

## 🚀 Deployment

### 1. Build de producción

```bash
# Asegurarse que los flags estén activos
# .env.production
VITE_USE_AUTH_V2=true
VITE_USE_PACIENTES_V2=true

# Build
npm run build
```

### 2. Verificar en staging

```bash
# Deploy a staging primero
# Probar todas las funcionalidades
# Si algo falla: rollback instantáneo cambiando flags a false
```

---

## 🔄 Rollback (si algo falla)

Si detectas problemas en producción:

```bash
# 1. Cambiar flags a false (instantáneo)
VITE_USE_AUTH_V2=false
VITE_USE_PACIENTES_V2=false

# 2. Redeploy (30 segundos)
vercel --prod

# 3. El código V1 sigue funcionando perfectamente
```

---

## 📈 Métricas de éxito

| Métrica | Antes (V1) | Después (V2) | Mejora |
|---------|-----------|--------------|--------|
| Datos reales | ❌ Mock | ✅ Supabase | ✅ |
| Paginación | ❌ No | ✅ Sí | ✅ |
| Búsqueda | ❌ Cliente | ✅ Servidor | ✅ |
| Caché | ❌ No | ✅ React Query | ✅ |
| Realtime | ❌ No | ✅ Sí | ✅ |
| Loading states | ❌ No | ✅ Sí | ✅ |
| Type safety | ⚠️ Regular | ✅ Strict | ✅ |

---

## 🎯 Próximos pasos

### Módulos pendientes

1. **Agenda V2** - Copiar patrón de Pacientes
2. **Inventario V2** - Similar a Pacientes
3. **Facturación V2** - Integración PAC
4. **Chatbot V2** - Integración OpenAI

### Cada módulo sigue el mismo patrón:

```
modules/[nombre]-v2/
├── components/
├── hooks/
├── services/
├── types/
└── index.ts
```

---

## 📞 Soporte

Si tienes problemas:

1. Revisar consola del navegador
2. Verificar feature flags en `.env.local`
3. Revisar que React Query esté configurado
4. Verificar conexión a Supabase

---

**¡Listo para usar V2!** 🎉

Tu código original sigue intacto y funcionando. La V2 crece en paralelo.
