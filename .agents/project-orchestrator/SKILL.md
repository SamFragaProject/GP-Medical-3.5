# 🎯 Project Orchestrator - GPMedical ERP

## Propósito del Proyecto

GPMedical es un ERP completo de **Medicina del Trabajo** que debe permitir:

1. **Gestión de Pacientes/Empleados**: Expedientes clínicos digitales completos
2. **Exámenes Médicos Ocupacionales**: ST-7, ST-9, evaluaciones ergonómicas
3. **Agenda Médica**: Citas, calendario, recordatorios
4. **Facturación**: CFDI 4.0, clientes fiscales, reportes
5. **Inventario**: Control de medicamentos y equipo médico
6. **Cumplimiento Normativo**: NOM-004, NOM-024, NOM-030, NOM-035
7. **Administración Multi-tenant**: Empresas, usuarios, roles y permisos
8. **Análisis Predictivo**: IA para identificar riesgos y reducir ausentismo

## Arquitectura Crítica

### V1 (Estable) - src/
- Sistema original funcional
- Usa useEffect + useState
- Todos los módulos operativos

### V2 (En desarrollo) - src-v2/
- Nuevos módulos con React Query
- Chatbot V2: ✅ Funcionando
- Auth V2, Pacientes V2, etc: ❌ Errores TypeScript
- Feature flags controlan activación

## Misión del Orchestrator

Coordinar a todos los agentes especializados para garantizar que:
1. **NO haya errores de TypeScript** que impidan el build
2. **Todos los módulos V1 funcionen** correctamente
3. **Los servicios de Supabase** estén correctamente implementados
4. **La UI sea consistente** en todo el admin
5. **Los flujos críticos** funcionen end-to-end

## Plan de Acción Maestro

### Fase 1: Auditoría TypeScript (Agente 1)
- Corregir todos los errores de tipo
- Verificar imports y exports
- Asegurar que el build sea exitoso

### Fase 2: Verificación Supabase (Agente 2)
- Revisar todos los servicios
- Verificar tipos de datos
- Asegurar queries correctas

### Fase 3: Consistencia UI (Agente 3)
- Unificar estilos del admin
- Verificar componentes Premium
- Asegurar diseño responsive

### Fase 4: Testing de Flujos (Agente 4)
- Verificar flujo: Paciente → Cita → Examen → Factura
- Probar roles y permisos
- Validar autenticación

### Fase 5: Coordinación Feature Flags (Agente 5)
- Verificar que V1 funcione con flags desactivados
- Preparar activación progresiva de V2
- Documentar cambios

## Criterios de Éxito

```
✅ Build sin errores TypeScript
✅ Todos los módulos V1 operativos
✅ UI consistente en admin
✅ Flujos críticos funcionan
✅ Listo para producción
```

## Comunicación entre Agentes

Cada agente debe reportar:
1. Archivos modificados
2. Errores encontrados y corregidos
3. Dependencias con otros agentes
4. Estado final del módulo asignado

## Estructura de Reporte

```markdown
## Agente: [Nombre]
## Módulo: [Nombre]
## Estado: [En progreso | Completado | Bloqueado]

### Archivos Modificados
- [ruta del archivo]

### Errores Corregidos
1. [Descripción del error] → [Solución aplicada]

### Dependencias
- Necesita: [qué necesita de otros agentes]
- Provee: [qué provee a otros agentes]

### Estado Final
✅ Funcionando / ❌ Pendiente
```
