# 🎛️ Feature Coordinator - GPMedical ERP

## Objetivo

Coordinar la transición entre módulos V1 (estables) y V2 (nuevos), asegurando que el sistema funcione correctamente con los feature flags actuales.

## Sistema de Feature Flags

### Archivo de Configuración
**Ubicación:** `src-v2/config/feature-flags.ts`

```typescript
export const FEATURE_FLAGS = {
  USE_AUTH_V2: import.meta.env.VITE_USE_AUTH_V2 === 'true',
  USE_PACIENTES_V2: import.meta.env.VITE_USE_PACIENTES_V2 === 'true',
  USE_AGENDA_V2: import.meta.env.VITE_USE_AGENDA_V2 === 'true',
  USE_INVENTARIO_V2: import.meta.env.VITE_USE_INVENTARIO_V2 === 'true',
  USE_FACTURACION_V2: import.meta.env.VITE_USE_FACTURACION_V2 === 'true',
  USE_CHATBOT_V2: import.meta.env.VITE_USE_CHATBOT_V2 === 'true',
  USE_REPORTES_V2: import.meta.env.VITE_USE_REPORTES_V2 === 'true',
};
```

### Variables de Entorno
**Ubicación:** `.env.production`

```bash
# ✅ ACTIVO - Funciona correctamente
VITE_USE_CHATBOT_V2=true

# ❌ DESACTIVADOS - Tienen errores TypeScript
VITE_USE_AUTH_V2=false
VITE_USE_PACIENTES_V2=false
VITE_USE_AGENDA_V2=false
VITE_USE_INVENTARIO_V2=false
VITE_USE_FACTURACION_V2=false
VITE_USE_REPORTES_V2=false
```

## Estado Actual de Módulos

### Módulos V1 (Estables) - SIEMPRE ACTIVOS
| Módulo | Estado | Ruta |
|--------|--------|------|
| Auth V1 | ✅ Funcionando | `src/contexts/AuthContext.tsx` |
| Pacientes V1 | ✅ Funcionando | `src/pages/Pacientes.tsx` |
| Agenda V1 | ✅ Funcionando | `src/pages/Agenda.tsx` |
| Facturación V1 | ✅ Funcionando | `src/pages/Facturacion.tsx` |
| Inventario V1 | ✅ Funcionando | `src/pages/inventory/InventoryPage.tsx` |
| Reportes V1 | ✅ Funcionando | `src/pages/Reportes.tsx` |

### Módulos V2 (Nuevos) - CONTROLADOS POR FLAGS
| Módulo | Estado | Ruta | Flag |
|--------|--------|------|------|
| Chatbot V2 | ✅ Funciona | `src-v2/modules/chatbot-v2/` | `USE_CHATBOT_V2` |
| Auth V2 | ❌ Errores TS | `src-v2/modules/auth-v2/` | `USE_AUTH_V2` |
| Pacientes V2 | ❌ Errores TS | `src-v2/modules/pacientes-v2/` | `USE_PACIENTES_V2` |
| Agenda V2 | ❌ Errores TS | `src-v2/modules/agenda-v2/` | `USE_AGENDA_V2` |
| Inventario V2 | ❌ Errores TS | `src-v2/modules/inventario-v2/` | `USE_INVENTARIO_V2` |
| Facturación V2 | ❌ No implementado | `src-v2/modules/facturacion-v2/` | `USE_FACTURACION_V2` |
| Reportes V2 | ❌ No implementado | `src-v2/modules/reportes-v2/` | `USE_REPORTES_V2` |

## Verificación de Implementación

### Paso 1: Verificar App.tsx
**Archivo:** `src/App.tsx`

Asegurar que los componentes V2 se carguen condicionalmente:

```typescript
// Ejemplo correcto:
const ChatbotV2 = import.meta.env.VITE_USE_CHATBOT_V2 === 'true' 
  ? React.lazy(() => import('../src-v2/modules/chatbot-v2/components/ChatbotWidget'))
  : null;

// En el JSX:
{ChatbotV2 && (
  <React.Suspense fallback={null}>
    <ChatbotV2 />
  </React.Suspense>
)}
```

### Paso 2: Verificar que V1 no dependa de V2
- [ ] Ningún archivo en `src/` debe importar de `src-v2/`
- [ ] Las importaciones V2 deben ser solo en lazy loading
- [ ] Si un flag está false, no se debe cargar código V2

### Paso 3: Verificar tsconfig.json
**Archivo:** `tsconfig.json`

Asegurar que los módulos V2 con errores estén excluidos:

```json
{
  "exclude": [
    "src-v2/modules/auth-v2/**/*",
    "src-v2/modules/pacientes-v2/**/*",
    "src-v2/modules/agenda-v2/**/*",
    "src-v2/modules/inventario-v2/**/*",
    "src-v2/modules/facturacion-v2/**/*",
    "src-v2/modules/reportes-v2/**/*"
  ]
}
```

### Paso 4: Verificar Build
```bash
npm run build
```

- [ ] Build exitoso sin errores
- [ ] No hay imports de V2 en el bundle si flags están false
- [ ] Solo ChatbotV2 incluido (flag true)

## Plan de Activación Progresiva

### Fase 1: Chatbot V2 (YA ACTIVO) ✅
- Flag: `USE_CHATBOT_V2=true`
- Estado: Funcionando en producción

### Fase 2: Corrección de Errores V2
Para cada módulo V2:

1. **Corregir errores TypeScript**
   - Revisar hooks
   - Revisar servicios
   - Revisar tipos

2. **Probar en desarrollo**
   - Activar flag localmente
   - Probar todas las funciones
   - Comparar con V1

3. **Activar en producción**
   - Cambiar flag en Vercel
   - Monitorear errores
   - Rollback si es necesario

### Orden Sugerido de Activación

1. **Reportes V2** (menos crítico)
2. **Agenda V2** (más value, menos riesgo)
3. **Pacientes V2** (core, testear bien)
4. **Inventario V2**
5. **Facturación V2** (más riesgoso, dejar al final)
6. **Auth V2** (solo si hay features nuevas importantes)

## Checklist de Activación

Para activar un módulo V2:

```markdown
### Pre-activación
- [ ] Errores TypeScript corregidos
- [ ] Tests pasando
- [ ] QA aprobado
- [ ] Documentación actualizada

### Activación
- [ ] Cambiar flag en `.env.production`
- [ ] Deploy a staging
- [ ] Probar en staging
- [ ] Deploy a producción

### Post-activación
- [ ] Monitorear errores (24-48h)
- [ ] Verificar métricas
- [ ] Feedback de usuarios
- [ ] Plan de rollback listo
```

## Rollback Strategy

Si un módulo V2 causa problemas:

1. **Cambiar flag** a `false` en Vercel
2. **Redeploy** inmediato
3. **Sistema vuelve** automáticamente a V1
4. **Investigar** errores en V2
5. **Corregir** y reintentar

## Verificación de Compatibilidad

### Datos Compartidos
Asegurar que V1 y V2 usen:
- [ ] Misma estructura de datos en Supabase
- [ ] Mismos tipos TypeScript
- [ ] Mismos servicios base (si comparten)

### Estado Global
- [ ] AuthContext funciona para ambos
- [ ] No hay conflictos de estado
- [ ] Las notificaciones funcionan

### Navegación
- [ ] URLs consistentes
- [ ] Redirecciones funcionan
- [ ] Breadcrumbs correctos

## Reporte de Estado

Mantener actualizado:

```markdown
## Estado de Módulos V2

| Módulo | Estado | Flag | Fecha Activación | Notas |
|--------|--------|------|------------------|-------|
| Chatbot | ✅ Activo | true | 03/02/2026 | Funcionando bien |
| Auth | ❌ Inactivo | false | - | Errores TS pendientes |
| Pacientes | ❌ Inactivo | false | - | Errores TS pendientes |
| ... | ... | ... | ... | ... |
```

## Comunicación con Otros Agentes

### Del TypeScript Auditor
- Recibir lista de errores corregidos en V2
- Saber cuándo un módulo V2 está listo para activar

### Del Supabase Verifier
- Confirmar que estructura de BD soporta V2
- Verificar que servicios V2 funcionan

### Del Flow Tester
- Recibir reporte de si V1 funciona con flags desactivados
- Confirmar que no hay regresiones

## Criterios de Éxito

- [ ] Todos los flags V2 desactivados funcionan (usa V1)
- [ ] Chatbot V2 activado funciona
- [ ] Build no incluye código V2 desactivado
- [ ] Listo para activar progresivamente
