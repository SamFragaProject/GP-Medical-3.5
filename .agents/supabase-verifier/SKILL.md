# 🗄️ Supabase Verifier - GPMedical ERP

## Objetivo

Verificar que todos los servicios que interactúan con Supabase funcionen correctamente y los tipos coincidan con la base de datos.

## Servicios Críticos a Verificar

### 1. Servicio de Empresas
**Archivo:** `src/services/dataService.ts` (empresas)
**Verificar:**
- CRUD de empresas
- Relación con sedes
- Tenant isolation (RLS)

### 2. Servicio de Usuarios
**Archivo:** `src/services/dataService.ts` (usuarios)
**Verificar:**
- Autenticación con Supabase Auth
- Perfiles de usuario
- Roles y permisos
- Asignación de empresa/sede

### 3. Servicio de Pacientes
**Archivo:** `src/services/dataService.ts` (pacientes)
**Verificar:**
- CRUD de pacientes
- Historial clínico
- Relación con empresa

### 4. Servicio de Facturación
**Archivo:** `src/services/billingService.ts`
**Verificar:**
- CRUD de facturas
- CRUD de clientes fiscales
- Configuración fiscal
- Relación paciente-factura

### 5. Servicio de Inventario
**Archivo:** `src/services/inventoryService.ts`
**Verificar:**
- CRUD de productos
- Control de stock
- Movimientos de inventario

### 6. Servicios V2 (Chatbot)
**Archivo:** `src-v2/modules/chatbot-v2/services/chatbotService.ts`
**Verificar:**
- Integración con API de chat
- Historial de conversaciones

## Checklist de Verificación

### Conexión a Supabase
```typescript
// Verificar en src/lib/supabase.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Asegurar que las variables existen
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}
```

### Tipos de Datos
Verificar que las interfaces TypeScript coincidan con las tablas de Supabase:

**Tablas a verificar:**
- `usuarios` - Perfiles de usuario
- `empresas` - Empresas/clientes
- `sedes` - Sucursales
- `pacientes` - Expedientes médicos
- `citas` - Agenda
- `examenes` - Exámenes médicos
- `facturas` - Facturación
- `productos` - Inventario
- `roles` - Roles personalizados
- `permisos` - Permisos por rol

### Row Level Security (RLS)
Verificar que las políticas RLS estén configuradas:

```sql
-- Verificar en Supabase Dashboard
-- Tabla: usuarios
-- Política: Usuarios solo ven su empresa

-- Tabla: pacientes
-- Política: Pacientes filtrados por empresa_id
```

### Funciones Edge
Verificar que existan las funciones serverless:

1. **auth-login** - Login personalizado
2. **auth-logout** - Logout
3. **auth-user** - Obtener usuario actual
4. **create-user** - Crear usuario con rol

## Errores Comunes y Soluciones

### Error: "Cannot find name 'supabase'"
**Causa:** Variable no importada correctamente  
**Solución:**
```typescript
import { supabase } from '@/lib/supabase';
// NO usar variable global
```

### Error: "Property does not exist on type"
**Causa:** Tipos desactualizados vs schema de BD  
**Solución:**
1. Revisar schema en Supabase
2. Actualizar interfaces TypeScript
3. Regenerar tipos si es necesario

### Error: "RLS policy violation"
**Causa:** El usuario no tiene permisos para la operación  
**Solución:**
1. Verificar políticas RLS en Supabase
2. Asegurar que el usuario tenga el rol correcto
3. Verificar que empresa_id/sede_id estén seteados

### Error: "PostgrestError: column does not exist"
**Causa:** Columna renombrada o eliminada en BD  
**Solución:**
1. Verificar schema actual en Supabase
2. Actualizar queries en servicios
3. Actualizar tipos TypeScript

## Archivos a Revisar

### Servicios Core
- [ ] `src/services/dataService.ts`
- [ ] `src/services/billingService.ts`
- [ ] `src/services/inventoryService.ts`
- [ ] `src/services/aiService.ts`

### Servicios Especializados
- [ ] `src/services/permisosService.ts`
- [ ] `src/services/rrhhService.ts`
- [ ] `src/services/comprasService.ts`
- [ ] `src/services/pacService.ts`

### Libs
- [ ] `src/lib/supabase.ts`
- [ ] `src/lib/ability.ts` (permisos CASL)

### V2 Services
- [ ] `src-v2/modules/chatbot-v2/services/chatbotService.ts`

## Estrategia de Verificación

### Paso 1: Verificar Conexión
```typescript
// Test simple
const { data, error } = await supabase.from('usuarios').select('*').limit(1);
if (error) console.error('Connection error:', error);
```

### Paso 2: Verificar Tipos
1. Comparar interfaces TypeScript con schema de Supabase
2. Actualizar diferencias
3. Usar `supabase gen types typescript` si es necesario

### Paso 3: Verificar RLS
1. Probar queries con diferentes usuarios
2. Verificar tenant isolation
3. Documentar políticas necesarias

### Paso 4: Verificar Funciones Edge
1. Llamar cada función
2. Verificar respuestas
3. Manejar errores

## Reporte Final

Incluir:
1. Estado de cada servicio (✅/❌)
2. Tablas verificadas
3. Errores encontrados y corregidos
4. Políticas RLS verificadas
5. Funciones Edge funcionando
