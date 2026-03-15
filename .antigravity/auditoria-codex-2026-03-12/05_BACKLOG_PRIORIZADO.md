# Backlog Priorizado

## P1 - Hacer primero

### B001. Eliminar fallbacks hardcodeados de Supabase

- Archivos:
  - `src/lib/supabase.ts`
  - `src/contexts/AuthContext.tsx`
- Resultado esperado:
  - cliente falla de forma explicita si falta config obligatoria

### B002. Aislar demo login y demo users

- Archivos:
  - `src/pages/Login.tsx`
  - `src/contexts/AuthContext.tsx`
- Resultado esperado:
  - demo solo vive en modo controlado

### B003. Corregir acceso permisivo en `ProtectedRoute`

- Archivo:
  - `src/components/auth/ProtectedRoute.tsx`
- Resultado esperado:
  - deny-by-default en recursos no resueltos

### B004. Revalidar auth antes de exponer modulos sensibles

- Archivo:
  - `src/contexts/AuthContext.tsx`
- Resultado esperado:
  - cache local no concede acceso por si sola

### B005. Crear pruebas negativas de permisos

- Archivos:
  - `tests/basic.spec.ts`
  - `tests/full_verification.spec.ts`
  - nuevas suites por seguridad
- Resultado esperado:
  - roles y empresas sin permiso fallan como deben

## P2 - Hacer despues

### B006. Partir `App.tsx` por dominios

- Archivo:
  - `src/App.tsx`
- Resultado esperado:
  - root mas pequeno y rutas modulares

### B007. Refactor de paginas grandes

- Archivos objetivo:
  - `src/pages/Pacientes.tsx`
  - `src/pages/HistorialClinico.tsx`
  - `src/pages/RayosX.tsx`
  - `src/pages/FarmaciaHub.tsx`
  - `src/pages/Usuarios.tsx`

### B008. Refactor de servicios grandes

- Archivos objetivo:
  - `src/services/dataService.ts`
  - `src/services/geminiDocumentService.ts`
  - `src/services/smartExtractionService.ts`

### B009. Unificar modelo de permisos

- Archivos:
  - `src/hooks/usePermisosDinamicos.ts`
  - `src/providers/AbilityProvider.tsx`
  - `src/lib/permissionMiddleware.ts`

## P3 - Mejoras de consolidacion

### B010. Limpiar frontera V1/V2

- Revisar:
  - `src-v2`
  - imports globales desde V2
  - feature flags inactivos

### B011. Limpiar repo de artefactos

- Revisar:
  - `dist`
  - `build_error.txt`
  - `tsc_errors*.txt`
  - `.bak`
  - carpeta anidada

### B012. Auditar bundle y CSS global

- Revisar:
  - `vite.config.ts`
  - `src/index.css`
  - dependencias PDF y documentos

## Notas para Antigravity

- No tomar B006-B012 hasta cerrar B001-B005.
- Si una tarea destapa un cambio grande de negocio, detenerse y documentar.
- Cada backlog item debe terminar con build y nota de verificacion.
