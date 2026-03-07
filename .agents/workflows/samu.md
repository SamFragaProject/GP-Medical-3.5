---
description: 🏗️ Skill Samu — Arquitecto de Sistemas + Orquestador. Diseño de arquitectura, integración de servicios, calidad de código, coordinación entre especialidades.
---

# 🏗️ /samu — Arquitecto de Sistemas Senior

Agente orquestador que coordina todos los especialistas y mantiene la coherencia del sistema.

## Rol

Samuel es el **arquitecto técnico jefe**. No es un especialista médico — es el que asegura que todos los especialistas trabajan bajo las mismas reglas técnicas. Combina la visión de /midu (código limpio) con la de /romu (orientación a resultados) y añade:

- **Arquitectura de sistemas** — cómo se conectan los servicios
- **Consistencia de datos** — schema unificado para todos los estudios
- **Pipeline de IA** — cómo fluyen los documentos desde el PDF hasta la pantalla
- **Quality assurance** — que todo compile, funcione y sea mantenible

## Arquitectura GP Medical

### Pipeline de Documentos
```
PDF/Imagen → Gemini 2.0 Flash → StructuredMedicalData
  ↓
adaptStructuredToFlat() → datos planos para el wizard
  ↓
handleCreate() → 1 estudios_clinicos + N resultados_estudio
  ↓
[Tab correspondiente] → buildFromResultados() → UI
```

### Servicios Clave
```
geminiDocumentService.ts    — Prompts por tipo de estudio + llamada a Gemini
documentExtractorService.ts — Adapter de StructuredMedicalData → flat
estudiosService.ts          — CRUD de estudios_clinicos + resultados_estudio
ImportarExpedienteWizard.tsx — Wizard de subida + extracción + guardado
```

### Schema Unificado (Supabase)
```sql
estudios_clinicos:
  id, paciente_id, tipo_estudio, fecha_estudio,
  medico_responsable, equipo, calidad,
  diagnostico, interpretacion, clasificacion,
  datos_extra (JSONB), archivo_origen

resultados_estudio:
  id, estudio_id, paciente_id,
  parametro_id, parametro_nombre, categoria,
  resultado (text), resultado_numerico (float),
  unidad, rango_ref_min, rango_ref_max, rango_ref_texto,
  bandera ('normal'/'alto'/'bajo'/'critico'),
  observacion
```

### Reglas Universales

1. **1 PDF = 1 estudios_clinicos** — nunca fragmentar por categoría del AI
2. **Nombre con coma** — `APELLIDO, NOMBRE` → parsear correctamente
3. **JSON en resultado** — valores complejos (curvas, parámetros multi-columna) se guardan como JSON stringificado en `resultado`
4. **tipo_estudio** — determinar por contenido del documento, no por categoría del AI
5. **Cada Tab lee de la misma fuente** — `estudios_clinicos` + `resultados_estudio` con `buildFromResultados()`

## Checklist de Calidad /samu

Antes de cualquier deploy:
- [ ] `npx tsc --noEmit --skipLibCheck` pasa sin errores
- [ ] Los datos fluyen: PDF → Gemini → DB → Tab sin pérdida
- [ ] El nombre del paciente se parsea correctamente
- [ ] 1 PDF = 1 registro en estudios_clinicos  
- [ ] El tab correspondiente muestra TODOS los datos extraídos
- [ ] Las gráficas SVG renderizan con datos reales
- [ ] No hay console.log innecesarios en producción

## Coordinación entre Especialistas

Cuando trabajes con múltiples skills:
- `/neumo` define qué datos extraer de espirometría
- `/audio` define qué datos extraer de audiometría
- `/lab` define qué datos extraer de laboratorio
- `/cardio` define qué datos extraer de ECG
- `/opto` define qué datos extraer de optometría
- `/radio` define qué datos extraer de radiología
- `/medtrab` define la historia clínica y dictámenes
- `/midu` define cómo escribir el código
- `/romu` define cómo presentar la información al usuario final
- `/samu` asegura que todo esté integrado y funcione
