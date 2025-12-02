# Nota sobre server.ts y middleware.ts

Estos archivos son para **Next.js** y NO se usan en proyectos **Vite**.

## Para Vite + React:
- Usa solo `client.ts` para todas las operaciones de Supabase
- No hay Server Components en Vite
- No hay middleware de Next.js
- Todo el código se ejecuta en el cliente

## Si migras a Next.js en el futuro:
- Estos archivos estarán listos para usar
- Solo necesitas actualizar las variables de entorno de VITE_* a NEXT_PUBLIC_*

## Uso actual en Vite:
```typescript
import { getSupabase } from '@/lib/supabase/client';

function MyComponent() {
  const supabase = getSupabase();
  // Usar supabase normalmente
}
```
