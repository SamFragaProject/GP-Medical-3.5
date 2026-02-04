# 🔍 TypeScript Auditor - GPMedical ERP

## Objetivo

Eliminar TODOS los errores de TypeScript que impidan el build o causen fallos en runtime.

## Errores Comunes Encontrados

### 1. Errores en src-v2/ (Módulos V2)
```
- Property 'empresaId' does not exist on type 'AuthContextType'
- Cannot find name 'supabase'
- Type '...' is not assignable to type 'User'
```

**Solución:** Estos módulos están desactivados por feature flags. Verificar que no se importen en el build principal.

### 2. Errores en Facturación
```
- Property 'razon_social' does not exist on type 'Cliente'
- Property 'fecha_emision' does not exist on type 'Factura'
```

**Solución:** Los tipos usan camelCase pero algunos componentes usan snake_case. Estandarizar.

### 3. Errores en RRHH
```
- Module '@/types/rrhh' has no exported member 'Empleado'
```

**Solución:** Verificar que los tipos estén correctamente exportados.

## Checklist de Auditoría

### Paso 1: Verificar tsconfig.json
```json
{
  "compilerOptions": {
    "strict": false,  // Cambiar a true gradualmente
    "noUnusedLocals": false,
    "noUnusedParameters": false
  }
}
```

### Paso 2: Corregir Tipos en Facturación
**Archivos a revisar:**
- `src/types/facturacion.ts`
- `src/components/billing/*.tsx`
- `src/services/billingService.ts`
- `src/services/pacService.ts`

**Acciones:**
1. Verificar que los tipos usen camelCase consistentemente
2. Agregar propiedades faltantes a las interfaces
3. Corregir comparaciones de enums

### Paso 3: Corregir Tipos en RRHH
**Archivos a revisar:**
- `src/types/rrhh.ts`
- `src/services/rrhhService.ts`
- `src/components/rrhh/*.tsx`

**Acciones:**
1. Exportar todos los tipos necesarios
2. Verificar consistencia con la base de datos

### Paso 4: Verificar Imports/Exports
**Archivos críticos:**
- `src/services/dataService.ts` - Verificar exportaciones
- `src/contexts/AuthContext.tsx` - Verificar tipos AuthContextType
- `src/App.tsx` - Verificar imports de componentes

### Paso 5: Aislar Errores V2
Asegurar que los errores de src-v2/ no afecten el build:
- Verificar tsconfig.json excluye src-v2/ correctamente
- Verificar que los imports condicionales funcionen

## Comandos de Verificación

```bash
# Verificar TypeScript
cd erp-medico-frontend
npx tsc --noEmit

# Verificar build
npm run build

# Verificar específicamente archivos problemáticos
npx tsc --noEmit src/services/billingService.ts
npx tsc --noEmit src/services/rrhhService.ts
```

## Archivos Prioritarios

### Alta Prioridad (Bloquean build)
1. `src/services/billingService.ts`
2. `src/services/rrhhService.ts`
3. `src/services/pacService.ts`
4. `src/components/billing/*.tsx`

### Media Prioridad (Advertencias)
1. `src/components/rrhh/*.tsx`
2. `src/pages/admin/*.tsx`

### Baja Prioridad (V2 desactivado)
1. `src-v2/modules/*/hooks/*.ts`
2. `src-v2/modules/*/services/*.ts`

## Estrategia de Corrección

### Para tipos inconsistentes (camelCase vs snake_case):
```typescript
// ANTES (Error)
interface Cliente {
  razon_social: string;  // snake_case
}

// DESPUÉS (Correcto)
interface Cliente {
  razonSocial: string;   // camelCase
  // o si la BD usa snake_case, mapear en el servicio
}
```

### Para propiedades faltantes:
```typescript
// Agregar a la interfaz
interface Factura {
  id: string;
  fechaEmision: Date;
  // ... otras propiedades
  uuidSAT?: string;  // Agregar si falta
}
```

### Para enums inconsistentes:
```typescript
// Definir el enum correctamente
enum EstadoFactura {
  PENDIENTE = 'pendiente',
  PAGADA = 'pagada',
  CANCELADA = 'cancelada',
  TIMBRADA = 'timbrada'  // Agregar si falta
}
```

## Reporte de Estado

Al finalizar, reportar:
1. Cantidad de errores corregidos
2. Archivos modificados
3. Errores que persisten (si los hay)
4. Build exitoso: Sí/No
