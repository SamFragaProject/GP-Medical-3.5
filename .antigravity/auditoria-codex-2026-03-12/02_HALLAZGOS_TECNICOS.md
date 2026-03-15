# Hallazgos Tecnicos

## H1. Frontend con orquestacion excesiva

### Evidencia

- `src/App.tsx` concentra router principal, imports lazy, wrappers y decisiones
  de activacion.
- El archivo tiene 362 lineas y opera como punto unico de orquestacion.

### Impacto

- Alto acoplamiento.
- Cambios pequenos con riesgo de regresion transversal.
- Dificulta pruebas por dominio.

### Accion sugerida

- Crear modulos de rutas por dominio:
  - `pacientes`
  - `agenda`
  - `medicina`
  - `admin`
  - `legal`
  - `billing`
  - `ai`
- Dejar `App.tsx` solo como composition root.

## H2. Paginas y servicios demasiado grandes

### Evidencia

Paginas pesadas detectadas:

- `src/pages/RayosX.tsx`
- `src/pages/FarmaciaHub.tsx`
- `src/pages/HistorialClinico.tsx`
- `src/pages/Usuarios.tsx`
- `src/pages/Pacientes.tsx`

Servicios pesados detectados:

- `src/services/dataService.ts`
- `src/services/geminiDocumentService.ts`
- `src/services/smartExtractionService.ts`

### Impacto

- Dificultan refactor seguro.
- Mezclan UI, reglas de negocio, acceso a datos y fallbacks.
- Suben el costo de onboarding.

### Accion sugerida

- Separar en:
  - `page`
  - `hooks`
  - `service`
  - `presentational components`
  - `types`

## H3. Capas de permisos duplicadas o poco alineadas

### Evidencia

- `src/components/auth/ProtectedRoute.tsx`
- `src/providers/AbilityProvider.tsx`
- `src/hooks/usePermisosDinamicos.ts`
- `src/lib/permissionMiddleware.ts`

### Impacto

- Varias fuentes de verdad.
- Posible divergencia entre UI, CASL, middleware y RLS.
- Dificulta saber cual capa manda en cada caso.

### Accion sugerida

- Elegir una autoridad principal:
  - backend/RLS como enforcement real
  - frontend como reflejo consistente
- Remover tolerancias permisivas donde el modulo ausente habilita acceso.

## H4. Convivencia de V1/V2 sin frontera clara

### Evidencia

- `src/main.tsx` importa `../src-v2/styles/global-v2.css`
- `src/App.tsx` activa piezas de V2 por feature flag
- existen `src-v2`, `.bak`, carpeta anidada `erp-medico-frontend`,
  `dist`, reportes y logs de compilacion

### Impacto

- Confusion de codigo activo vs experimental.
- Riesgo de romper build o estilos por dependencia lateral.
- Mantenimiento mas caro.

### Accion sugerida

- Definir inventario de carpetas:
  - activas
  - legacy
  - build artifacts
  - operativas
- Evitar imports globales desde V2 si V2 no es base estable.

## H5. Servicios con modo demo y fallback mezclados

### Evidencia

- `src/contexts/AuthContext.tsx`
- `src/services/dataService.ts`
- `src/pages/Login.tsx`

### Impacto

- Hace mas dificil probar conducta real.
- Puede esconder fallas de entorno detras de datos demo.
- Riesgo de comportamiento no determinista.

### Accion sugerida

- Crear limites explicitos por entorno:
  - `demo`
  - `development`
  - `production`
- Centralizar flags y no dejar fallbacks distribuidos por todo el cliente.

## H6. Performance perfectible

### Evidencia

El build previo muestra assets pesados, en especial:

- `pdf.worker` cerca de 2 MB
- CSS global superior a 300 KB

### Impacto

- Carga inicial pesada.
- Riesgo mayor en modulos de documentos e imagen.

### Accion sugerida

- Auditar dependencias de PDF y extraccion.
- Verificar code splitting por dominio.
- Revisar imports globales de estilos.
