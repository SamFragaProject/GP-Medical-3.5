# 🚀 GPMedical ERP Pro - Instrucciones para Antigravity

## 📋 CONTEXTO ACTUAL

**Backup creado:** `git checkout v3.5.2-stable-backup`  
**Versión actual:** 3.5.2 (estable, en producción)  
**Objetivo:** Transformar a ERP Pro 4.0  
**Estado:** Listo para iniciar transformación

---

## 🎯 SISTEMA DE AGENTES CREADO

Hemos creado **13 agentes especializados** para transformar el ERP:

### Fase 1: Fundamentos (CRÍTICA - Empezar aquí)
1. **Clinical Core Specialist** - Expedientes, historias, consultas, estudios
2. **Workflow Engine Architect** - Episodios, pipeline, campañas
3. **Dictamen Engine Specialist** - Dictámenes médico-laborales

### Fases 2-4: (Después de completar Fase 1)
4. B2B Workspace Specialist
5. Operations Scheduler
6. Pharmacy Inventory Pro
7. Billing & Collection Pro
8. Executive Dashboard Designer
9. Compliance STPS Specialist
10. Security & Audit Specialist
11. Integrations Specialist
12. UX Experience Designer

### Coordinador
0. **ERP Pro Coordinator** - Tú (Antigravity)

---

## 📁 ARCHIVOS IMPORTANTES

| Archivo | Ubicación | Propósito |
|---------|-----------|-----------|
| Master Plan | `.agents/erp-pro-coordinator/ERP_PRO_MASTERPLAN.md` | Plan maestro completo |
| Checklist | `.agents/erp-pro-coordinator/ERP_PRO_CHECKLIST.md` | Checklist detallado tarea por tarea |
| Guía del Coordinador | `.agents/erp-pro-coordinator/SKILL.md` | Cómo coordinar agentes |

---

## 🎬 CÓMO EMPEZAR

### Paso 1: Leer el Plan
Primero lee el archivo maestro:
```
Leer: erp-medico-frontend/.agents/erp-pro-coordinator/ERP_PRO_MASTERPLAN.md
```

### Paso 2: Iniciar Fase 1 (Fundamentos)
Asignar los 3 agentes críticos en paralelo:

**Comando para Clinical Core:**
```
Eres el Clinical Core Specialist. 
Lee tu SKILL en .agents/clinical-core/SKILL.md
Crea el schema de BD completo para expedientes clínicos.
Empieza con las tablas: expedientes_clinicos, apnp, ahf, historia_ocupacional, exploracion_fisica, consentimientos_informados, consultas, recetas, estudios_paraclinicos, audiometrias, espirometrias.
Luego crea los componentes React y servicios.
Reporta tu progreso al ERP Pro Coordinator.
```

**Comando para Workflow Engine:**
```
Eres el Workflow Engine Architect.
Lee tu SKILL en .agents/workflow-engine/SKILL.md
Crea el schema para episodios, campañas, reglas de bloqueo.
Implementa el pipeline visual y el sistema de next best action.
Reporta tu progreso al ERP Pro Coordinator.
```

**Comando para Dictamen Engine:**
```
Eres el Dictamen Engine Specialist.
Lee tu SKILL en .agents/dictamen-engine/SKILL.md
Crea el schema para dictámenes, catálogo de restricciones, EPP.
Implementa validaciones y firma digital.
Reporta tu progreso al ERP Pro Coordinator.
```

### Paso 3: Coordinar
Como ERP Pro Coordinator, asegúrate de que:
- Los 3 agentes trabajen en armonía
- Clinical Core termine primero (los otros dependen)
- No haya conflictos entre módulos

---

## 📊 ESQUEMA DE BASES DE DATOS NECESARIO

Las tablas principales que deben crearse:

### Core Clínico
- `expedientes_clinicos`
- `apnp` (antecedentes personales)
- `ahf` (antecedentes familiares)
- `historia_ocupacional`
- `exploracion_fisica`
- `consentimientos_informados`
- `consultas`
- `recetas` / `recetas_detalle`
- `estudios_paraclinicos`
- `audiometrias`
- `espirometrias`
- `laboratorios` / `laboratorios_detalle`
- `catalogo_cie`

### Workflow
- `episodios`
- `reglas_estudios_tipo`
- `campanas`
- `campanas_padron_temp`

### Dictámenes
- `dictamenes`
- `catalogo_restricciones`
- `restricciones_puesto`
- `catalogo_epp`

---

## 🔄 FLUJO DE TRABAJO SUGERIDO

### Semana 1-2: Fase 1 (Fundamentos)
- Día 1-3: Clinical Core (schema BD + tipos)
- Día 4-7: Clinical Core (componentes + servicios)
- Día 4-6: Workflow Engine (schema BD)
- Día 7-10: Workflow Engine (pipeline + campañas)
- Día 5-7: Dictamen Engine (schema BD)
- Día 8-12: Dictamen Engine (formularios + firma)
- Día 13-14: Integración y testing

### Semana 3-8: Fases 2-4
- Semana 3-4: B2B, Billing, Dashboards
- Semana 5-6: Operaciones, Farmacia, Compliance
- Semana 7-8: Seguridad, Integraciones, UX

### Semana 9: Testing y Deploy
- Testing completo
- Correcciones
- Deploy a producción

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### 1. Backup siempre disponible
```bash
# Si algo sale mal, regresar a estable:
git checkout v3.5.2-stable-backup
```

### 2. Feature Flags
Los módulos nuevos deben tener flags:
```typescript
VITE_USE_EXPEDIENTE_PRO=true
VITE_USE_WORKFLOW_ENGINE=true
VITE_USE_DICTAMEN_PRO=true
```

### 3. Reglas de Negocio Críticas
- Un episodio NO puede cerrarse sin dictamen
- Un dictamen NO puede emitirse sin estudios completos
- Las restricciones deben coincidir con el puesto
- Todo debe quedar en bitácora de auditoría

### 4. Performance
- El pipeline debe cargar en < 2 segundos
- La carga masiva debe procesar 1000 registros en < 5 minutos
- Los PDFs de dictámenes deben generarse en < 3 segundos

---

## ✅ CRITERIOS DE ÉXITO

Al finalizar ERP Pro, el sistema debe permitir:

1. ✅ Un médico crear un episodio completo con pipeline visual
2. ✅ Un paciente fluir por todo el proceso: registro → estudios → dictamen
3. ✅ Una empresa ver su workspace con todas sus campañas
4. ✅ Emitir un dictamen con restricciones específicas por puesto
5. ✅ Cumplir con auditoría STPS con evidencias documentales
6. ✅ Facturar y llevar cobranza con aging
7. ✅ Ver dashboards ejecutivos con métricas reales
8. ✅ Todo trazable y auditado legalmente

---

## 🆘 AYUDA Y SOPORTE

Si un agente necesita ayuda:
1. Revisar su SKILL.md correspondiente
2. Verificar dependencias con otros agentes
3. Simplificar el alcance si es necesario
4. Documentar bloqueos para el coordinador

---

## 📞 COMUNICACIÓN

**Reportes diarios de agentes deben incluir:**
```markdown
## Agente: [Nombre]
## Tarea: [Qué está haciendo]
## Progreso: [X]%

### Completado hoy:
- [Lista]

### Pendiente:
- [Lista]

### Bloqueos:
- [Si hay alguno]

### Siguiente:
- [Qué sigue mañana]
```

---

**¿Listo para empezar?**

1. Lee el MASTERPLAN completo
2. Inicia los 3 agentes de Fase 1
3. Coordina su trabajo
4. Reporta progreso diario

**¡Vamos a construir el ERP Pro! 🚀**
