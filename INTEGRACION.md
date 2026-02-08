# Integración: Backend Fundamentos Legales - GPMedical ERP Pro

Este documento describe cómo integrar los nuevos módulos de **Dictámenes Médico-Laborales**, **NOM-011** y **NOM-036** con el sistema de autenticación y permisos existente.

## 📋 Resumen de Archivos Creados

### Migraciones SQL (`supabase/migrations/`)

| Archivo | Descripción |
|---------|-------------|
| `20250208_01_dictamenes.sql` | Tablas de dictámenes, restricciones, versiones y estudios requeridos |
| `20250208_02_nom011.sql` | Programas NOM-011, audiometrías, EPP auditivo y áreas de ruido |
| `20250208_03_nom036.sql` | Programas NOM-036, evaluaciones ergonómicas, capacitaciones |

### Tipos TypeScript (`src/types/`)

| Archivo | Contenido |
|---------|-----------|
| `dictamen.ts` | Interfaces para dictámenes, restricciones, versiones, estudios |
| `nom011.ts` | Interfaces para programas auditivos, audiometrías, EPP, áreas |
| `nom036.ts` | Interfaces para programas de ergonomía, evaluaciones REBA/NIOSH/OWAS |

### Servicios TypeScript (`src/services/`)

| Archivo | Descripción |
|---------|-------------|
| `dictamenService.ts` | CRUD de dictámenes, validación, auditoría, PDFs |
| `nom011Service.ts` | Gestión NOM-011, cálculos de semáforo, reportes |
| `nom036Service.ts` | Evaluaciones ergonómicas con REBA, NIOSH, OWAS |

---

## 🔐 Integración con Sistema de Permisos

### 1. Uso de `usePermisosDinamicos`

Los servicios están diseñados para integrarse con el hook `usePermisosDinamicos` existente. Los módulos a usar son:

```typescript
import { usePermisosDinamicos } from '@/hooks/usePermisosDinamicos';

function DictamenesPage() {
  const { puede, loading } = usePermisosDinamicos();
  
  // Verificar permisos
  const canCreate = puede('dictamenes', 'crear');
  const canEdit = puede('dictamenes', 'editar');
  const canView = puede('dictamenes', 'ver');
  const canDelete = puede('dictamenes', 'borrar');
  const canPrint = puede('dictamenes', 'imprimir');
  const canSign = puede('dictamenes', 'firmar');

  if (loading) return <Loading />;
  if (!canView) return <AccessDenied />;

  return (
    <div>
      {canCreate && <Button>Crear Dictamen</Button>}
      {canPrint && <Button>Imprimir</Button>}
    </div>
  );
}
```

### 2. Módulos Recomendados para Permisos

Agrega estos módulos al catálogo de módulos del sistema (`modulos_sistema`):

```sql
-- Dictámenes
INSERT INTO modulos_sistema (codigo, nombre, descripcion, icono, gradiente, categoria, ruta, activo) 
VALUES ('dictamenes', 'Dictámenes Médicos', 'Dictámenes médico-laborales', 'file-check', 'from-blue-600 to-indigo-600', 'legal', '/dictamenes', true);

-- NOM-011
INSERT INTO modulos_sistema (codigo, nombre, descripcion, icono, gradiente, categoria, ruta, activo) 
VALUES ('nom011', 'NOM-011 Auditiva', 'Programa de Conservación Auditiva', 'ear', 'from-teal-500 to-cyan-600', 'legal', '/nom-011', true);

-- NOM-036
INSERT INTO modulos_sistema (codigo, nombre, descripcion, icono, gradiente, categoria, ruta, activo) 
VALUES ('nom036', 'NOM-036 Ergonomía', 'Programa de Ergonomía', 'accessibility', 'from-emerald-500 to-green-600', 'legal', '/nom-036', true);

-- Alternativa: Usar módulos existentes
-- 'estudios_medicos' puede cubrir NOM-011 y NOM-036
-- 'evaluaciones' puede cubrir dictámenes y evaluaciones
```

### 3. Asignación de Permisos por Rol

Los permisos sugeridos para cada rol son:

| Rol | Dictámenes | NOM-011 | NOM-036 |
|-----|------------|---------|---------|
| `super_admin` | Todos | Todos | Todos |
| `admin_empresa` | Todos | Todos | Todos |
| `medico` | Crear, Editar, Ver, Imprimir, Firmar | Crear, Editar, Ver, Imprimir | Crear, Editar, Ver, Imprimir |
| `enfermera` | Ver | Crear*, Ver | Ver |
| `recepcion` | Ver | Ver | Ver |
| `asistente` | Ver | Ver | Ver |

*Enfermeras pueden capturar audiometrías pero no interpretarlas.

---

## 🗄️ Ejecutar Migraciones

### Opción 1: Usando CLI de Supabase

```bash
cd erp-medico-frontend
supabase migration up
```

### Opción 2: Usando SQL Editor en Supabase Dashboard

1. Ve a SQL Editor en tu proyecto Supabase
2. Crea una nueva query
3. Copia el contenido de cada archivo SQL en orden:
   - `20250208_01_dictamenes.sql`
   - `20250208_02_nom011.sql`
   - `20250208_03_nom036.sql`
4. Ejecuta cada uno

### Orden de Ejecución Importante

1. **Primero**: `20250208_01_dictamenes.sql` (no tiene dependencias)
2. **Segundo**: `20250208_02_nom011.sql` (no tiene dependencias)
3. **Tercero**: `20250208_03_nom036.sql` (no tiene dependencias)

---

## 📊 Uso de los Servicios

### DictamenService

```typescript
import { dictamenService } from '@/services/dictamenService';

// Listar dictámenes
const { data, total } = await dictamenService.listar(
  { empresa_id: 'uuid', estado: 'completado' },
  { page: 1, limit: 20 }
);

// Crear dictamen
const nuevoDictamen = await dictamenService.crear({
  empresa_id: 'uuid',
  paciente_id: 'uuid',
  tipo_evaluacion: 'ingreso',
  resultado: 'apto',
  vigencia_inicio: '2026-02-08'
}, usuarioActual);

// Validar estudios antes de cerrar
const validacion = await dictamenService.validarEstudiosCompletos(dictamenId);
if (validacion.valido) {
  await dictamenService.cerrarDictamen(dictamenId, usuarioActual);
}

// Generar PDF
const pdfBlob = await dictamenService.generarPDF(dictamenId);
```

### NOM011Service

```typescript
import { nom011Service } from '@/services/nom011Service';

// Crear programa anual
const programa = await nom011Service.crearPrograma({
  empresa_id: 'uuid',
  anio: 2026,
  fecha_inicio: '2026-01-01'
}, usuarioActual);

// Guardar audiometría
const audiometria = await nom011Service.crearAudiometria({
  empresa_id: 'uuid',
  programa_id: 'uuid',
  paciente_id: 'uuid',
  tipo_estudio: 'periodico',
  fecha_estudio: '2026-02-08',
  od_500hz: 10,
  od_1000hz: 15,
  // ... más frecuencias
}, usuarioActual);

// El semáforo y categoría se calculan automáticamente

// Generar reporte anual
const reporte = await nom011Service.generarReporteAnual(empresaId, 2026);
```

### NOM036Service

```typescript
import { nom036Service } from '@/services/nom036Service';

// Evaluación REBA
const evaluacion = await nom036Service.crearEvaluacionREBA(
  'Operario de Producción',
  {
    cuello: 1,
    tronco: 2,
    piernas: 1,
    brazo: 3,
    antebrazo: 1,
    muneca: 2,
    carga: 2,
    agarre: 1,
    actividad: 1
  },
  empresaId,
  usuarioActual,
  pacienteId,
  programaId
);

// Evaluación NIOSH
const evaluacionNiosh = await nom036Service.crearEvaluacionNIOSH(
  'Almacenista',
  {
    peso_carga: 20,
    distancia_horizontal: 40,
    altura_origen: 75,
    recorrido_vertical: 50,
    frecuencia: 4,
    angulo_asimetria: 30,
    duracion_tarea: 'media',
    agarre: 'bueno'
  },
  empresaId,
  usuarioActual
);

// Obtener matriz de riesgos
const matriz = await nom036Service.obtenerMatrizRiesgos(empresaId);
```

---

## 🔒 Row Level Security (RLS)

Las tablas tienen políticas RLS activadas que limitan el acceso según:

1. **empresa_id**: Los usuarios solo ven datos de su empresa
2. **Rol del usuario**: 
   - `super_admin`: Acceso total
   - `medico`, `admin_empresa`: Lectura/escritura en su empresa
   - `enfermera`: Lectura/escritura limitada
   - `recepcion`: Solo lectura

### Verificar RLS está activo

```sql
-- Verificar que RLS está habilitado
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname IN ('dictamenes_medicos', 'estudios_audiometria', 'evaluaciones_ergonomicas');
-- Debe retornar 't' (true) para relrowsecurity
```

---

## 📈 Funciones SQL Disponibles

Las siguientes funciones están disponibles para usar en queries:

### Dictámenes
- `validar_cierre_dictamen(p_dictamen_id UUID)` → JSON con validación

### NOM-011
- `calcular_semaforo_nom011(...)` → 'verde' | 'amarillo' | 'rojo'
- `calcular_categoria_riesgo_nom011(...)` → 'I' | 'II' | 'III' | 'IV'
- `calcular_indice_michel(...)` → número

### NOM-036
- `calcular_reba(...)` → JSON con score y nivel de riesgo
- `calcular_niosh(...)` → JSON con RWL y LI
- `calcular_owas(...)` → JSON con score y categoría

---

## 🧪 Verificación Post-Instalación

Después de ejecutar las migraciones, verifica:

```typescript
// 1. Verificar tablas creadas
const { data: tables } = await supabase
  .from('information_schema.tables')
  .select('table_name')
  .eq('table_schema', 'public')
  .in('table_name', [
    'dictamenes_medicos',
    'restricciones_medicas_catalogo',
    'versiones_dictamen',
    'programas_conservacion_auditiva',
    'estudios_audiometria',
    'programas_ergonomia',
    'evaluaciones_ergonomicas'
  ]);

// 2. Verificar RLS
const { data: rls } = await supabase
  .rpc('verificar_rls_activo', { tabla: 'dictamenes_medicos' });

// 3. Probar inserción (debe respetar empresa_id)
const { error } = await supabase
  .from('dictamenes_medicos')
  .insert({ empresa_id: 'otra-empresa', ... });
// Debe fallar con RLS violation
```

---

## 🐛 Solución de Problemas

### Error: "relation does not exist"
Las tablas no se han creado. Verifica que las migraciones se ejecutaron correctamente.

### Error: "new row violates row-level security policy"
El usuario actual no tiene permisos para esa operación. Verifica:
1. Que el usuario tiene `empresa_id` correcto
2. Que tiene el rol adecuado
3. Que las políticas RLS están bien configuradas

### Error: "function does not exist"
Las funciones SQL no se crearon. Reejecuta los archivos de migración.

---

## 📞 Soporte

Para problemas con:
- **Migraciones SQL**: Revisar logs de Supabase
- **Permisos**: Verificar `usePermisosDinamicos` y roles del usuario
- **Servicios TypeScript**: Verificar tipos e imports

---

## ✅ Checklist de Implementación

- [ ] Ejecutar migraciones SQL en orden
- [ ] Verificar tablas creadas en Supabase
- [ ] Verificar RLS activo en todas las tablas
- [ ] Agregar módulos al catálogo `modulos_sistema`
- [ ] Asignar permisos a roles existentes
- [ ] Probar creación de dictamen con usuario médico
- [ ] Probar creación de audiometría con cálculo automático
- [ ] Probar evaluación REBA con cálculo automático
- [ ] Verificar que usuarios de otra empresa no ven los datos
- [ ] Probar generación de PDFs
