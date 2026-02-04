# ⚡ IMPLEMENTACIÓN RÁPIDA - 5 MINUTOS

## Paso 1: Instalar dependencias (1 min)

```bash
cd erp-medico-frontend
npm install @tanstack/react-query
```

## Paso 2: Copiar variables de entorno (1 min)

```bash
cp .env.v2.example .env.local
# Editar con tus credenciales de Supabase
```

## Paso 3: Modificar main.tsx (2 min)

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src-v2/version-router';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
```

## Paso 4: Activar flags (30 seg)

En `.env.local`:
```
VITE_USE_AUTH_V2=true
VITE_USE_PACIENTES_V2=true
```

## Paso 5: Probar (30 seg)

```bash
npm run dev
# Ir a /pacientes
# Verificar que carga datos reales
```

---

## ✅ Resultado

- ✅ Auth con refresh token automático
- ✅ Pacientes conectados a Supabase real
- ✅ Paginación funcionando
- ✅ Búsqueda con debounce
- ✅ Todo tu código V1 intacto

---

**Si algo falla:** Cambiar flags a `false` y redeploy. Rollback instantáneo.
