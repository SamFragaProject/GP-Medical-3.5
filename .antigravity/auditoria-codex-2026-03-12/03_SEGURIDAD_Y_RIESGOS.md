# Seguridad y Riesgos

## S1. Fallbacks hardcodeados de infraestructura en cliente

### Evidencia

- `src/lib/supabase.ts`
- `src/contexts/AuthContext.tsx`

### Riesgo

- Facilita que el cliente funcione aun con configuracion incompleta.
- Normaliza dependencias sensibles embebidas.
- Hace mas facil que el entorno equivocado quede activo por accidente.

### Accion para Antigravity

- Eliminar fallbacks hardcodeados de Supabase en runtime de produccion.
- Hacer que el arranque falle de forma explicita cuando falten variables
  obligatorias.

## S2. Credenciales demo en flujo principal

### Evidencia

- `src/pages/Login.tsx`
- `src/contexts/AuthContext.tsx`

### Riesgo

- Mezcla entorno demo con autenticacion real.
- Puede inducir mal uso o dejar puertas operativas no deseadas.

### Accion para Antigravity

- Mover demo login a un modo aislado y explicitamente no productivo.
- Si se conserva, protegerlo con flag estricto por entorno.

## S3. UI basada en cache local antes de validar sesion

### Evidencia

- `src/contexts/AuthContext.tsx`

### Riesgo

- Rol stale o usuario stale visible en UI.
- Accesos aparentes hasta que backend niega.
- Sensacion falsa de sesion valida.

### Accion para Antigravity

- Mantener cache solo como optimizacion visual, no como fuente de verdad de
  autorizacion.
- Revalidar sesion y rol antes de renderizar zonas sensibles.

## S4. ProtectedRoute permisivo por ausencia de modulo

### Evidencia

- `src/components/auth/ProtectedRoute.tsx`

### Riesgo

- Si permisos y catalogo de modulos se desincronizan, la UI concede acceso.
- Esto es especialmente delicado en modulos medicos, admin y legales.

### Accion para Antigravity

- Cambiar la postura por defecto a deny-by-default cuando un recurso requerido
  no este resuelto.
- Registrar claramente el error para depuracion.

## S5. Repo de trabajo con varios `.env` y artefactos locales

### Evidencia

En la carpeta del proyecto existen:

- `.env`
- `.env.local`
- `.env.production`
- `.env.remote`

### Riesgo

- Confusion operativa.
- Mayor probabilidad de usar valores del entorno equivocado.
- Posible fuga si algun archivo local termina versionado fuera de politica.

### Accion para Antigravity

- Definir contrato de entornos.
- Dejar solo ejemplos versionados y documentacion minima.
- Asegurar que archivos locales reales no entren al repo.

## S6. Testing no cubre seguridad real

### Evidencia

- `tests/basic.spec.ts`
- `tests/full_verification.spec.ts`

### Riesgo

- Los tests pueden pasar aunque un boton, ruta o modulo critico no haya sido
  realmente validado.
- No hay suficiente cobertura de multiempresa, RLS y negacion de acceso.

### Accion para Antigravity

- Agregar pruebas negativas:
  - rol sin permiso no entra
  - empresa A no ve datos de empresa B
  - recurso sin sesion redirige correctamente
  - rutas sensibles no renderizan solo por cache local

## Orden sugerido de endurecimiento

1. Supabase env y fallbacks.
2. Demo login y demo users.
3. Auth cache y revalidacion.
4. ProtectedRoute y permisos.
5. Pruebas negativas de seguridad.
