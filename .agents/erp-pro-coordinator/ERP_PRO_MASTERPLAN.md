# 🏥 GPMedical ERP Pro - Plan Maestro de Transformación

> **Versión Objetivo:** 4.0 ERP Pro  
> **Versión Actual:** 3.5.2 Stable  
> **Fecha:** Febrero 2026  
> **Backup:** `git checkout v3.5.2-stable-backup`

---

## 🎯 VISIÓN DEL PROYECTO

Transformar GPMedical de un ERP básico de medicina del trabajo a un **ERP Pro enterprise** con:

- ✅ Motor de flujos clínicos por episodio
- ✅ Workspace B2B por empresa cliente  
- ✅ Dictámenes médico-laborales con reglas de negocio
- ✅ Cumplimiento STPS completo (NOM-011, NOM-036, etc.)
- ✅ Facturación y cobranza integrada
- ✅ Dashboards ejecutivos accionables
- ✅ Integraciones técnicas ( equipos médicos, APIs)

---

## 📊 ESTADO ACTUAL vs OBJETIVO

### ✅ Lo que YA EXISTE (v3.5.2)

| Módulo | Estado | Notas |
|--------|--------|-------|
| Expediente básico | ✅ | Historial médico simple |
| Agenda citas | ✅ | Calendario funcional |
| Exámenes ST-7/ST-9 | ✅ | Formatos básicos |
| Facturación CFDI | ✅ | CFDI 4.0 operativo |
| Inventario | ✅ | Stock básico |
| Multi-empresa | ✅ | Tenant isolation |
| Roles/permisos | ✅ | Sistema de roles |
| Chatbot V2 | ✅ | IA básica |

### ❌ Lo que FALTA para ERP Pro

| Módulo | Prioridad | Complejidad |
|--------|-----------|-------------|
| **Motor de flujos por episodio** | 🔴 CRÍTICA | Alta |
| **Workspace B2B completo** | 🔴 CRÍTICA | Media |
| **Dictámenes con reglas** | 🔴 CRÍTICA | Alta |
| **Estudios paraclínicos** | 🟡 ALTA | Media |
| **Campañas masivas** | 🟡 ALTA | Media |
| **Reportes STPS** | 🟡 ALTA | Baja |
| **Cuentas por cobrar** | 🟢 MEDIA | Media |
| **Dashboards ejecutivos** | 🟢 MEDIA | Baja |
| **Integraciones equipos** | 🔵 BAJA | Alta |

---

## 🎭 SISTEMA DE AGENTES ESPECIALIZADOS

### Agente 0: ERP Pro Coordinator (TÚ)
**Archivo:** `.agents/erp-pro-coordinator/SKILL.md`

**Responsabilidad:** Coordinar todo el proyecto, definir prioridades, validar integración.

---

### Agente 1: Clinical Core Specialist
**Archivo:** `.agents/clinical-core/SKILL.md`

**Responsabilidad:** Núcleo clínico completo

**Entregables:**
- [ ] Expediente clínico electrónico (ECE) estructurado
- [ ] Historia clínica laboral (APNP, AHF, ocupacional)
- [ ] Exploración física estructurada (SV, IMC, neuro, musculo-esquelético)
- [ ] Consentimientos informados con firma digital
- [ ] Módulo de consultas (general + ocupacional)
- [ ] Plantillas por tipo de evaluación
- [ ] Catálogo CIE-10/CIE-11
- [ ] Recetas electrónicas con control de dispensación

**Archivos a crear/modificar:**
- `src/pages/medicina/ExpedienteClinico.tsx`
- `src/pages/medicina/ConsultaOcupacional.tsx`
- `src/pages/medicina/Consentimientos.tsx`
- `src/services/expedienteService.ts`
- `src/services/recetaService.ts`
- `src/types/expediente.ts`

---

### Agente 2: Workflow Engine Architect
**Archivo:** `.agents/workflow-engine/SKILL.md`

**Responsabilidad:** Motor de flujos y campañas

**Entregables:**
- [ ] Episodio de atención (pipeline completo)
- [ ] Reglas de bloqueo (no cerrar sin estudios)
- [ ] "Next Best Action" por paciente
- [ ] Campañas masivas por empresa
- [ ] Carga masiva de padrón (Excel/CSV)
- [ ] Seguimiento por estatus
- [ ] Métricas por campaña

**Archivos a crear/modificar:**
- `src/services/episodioService.ts`
- `src/services/campanaService.ts`
- `src/pages/campanas/CampanasList.tsx`
- `src/pages/campanas/CampanaDetail.tsx`
- `src/components/workflow/PipelineVisual.tsx`
- `src/types/episodio.ts`
- `src/types/campana.ts`

---

### Agente 3: B2B Workspace Specialist
**Archivo:** `.agents/b2b-workspace/SKILL.md`

**Responsabilidad:** Módulo Empresas (clientes B2B)

**Entregables:**
- [ ] Workspace por empresa completo
- [ ] Contrato/SLA/vigencia
- [ ] Servicios activos configurables
- [ ] Headcount contratado vs real
- [ ] Sucursales/plantas
- [ ] Contactos (RH, HSE, Compras)
- [ ] Reportes por empresa
- [ ] Indicadores de aptitud
- [ ] Hallazgos por riesgo
- [ ] Entregables descargables

**Archivos a crear/modificar:**
- `src/pages/admin/EmpresaWorkspace.tsx`
- `src/pages/admin/EmpresaContrato.tsx`
- `src/pages/admin/EmpresaReportes.tsx`
- `src/services/empresaService.ts` (extender)
- `src/types/empresa.ts` (extender)

---

### Agente 4: Dictamen Engine Specialist
**Archivo:** `.agents/dictamen-engine/SKILL.md`

**Responsabilidad:** Dictámenes médico-laborales

**Entregables:**
- [ ] Dictámen: Apto / Apto con restricciones / No apto temporal
- [ ] Restricciones codificadas por puesto
- [ ] Recomendaciones médicas y EPP
- [ ] Vigencia del dictamen
- [ ] Firma electrónica del médico (con cédula profesional)
- [ ] Reglas de bloqueo para emitir dictamen

**Archivos a crear/modificar:**
- `src/pages/medicina/DictamenLaboral.tsx`
- `src/services/dictamenService.ts`
- `src/types/dictamen.ts`
- `src/components/dictamen/DictamenForm.tsx`
- `src/components/dictamen/FirmaMedico.tsx`

---

### Agente 5: Operations Scheduler
**Archivo:** `.agents/operations-scheduler/SKILL.md`

**Responsabilidad:** Operación y agenda avanzada

**Entregables:**
- [ ] Agenda por sede, empresa y rol
- [ ] Check-in/check-out de pacientes
- [ ] Colas de trabajo por rol (enfermería, RX, audio, médico)
- [ ] Órdenes de servicio
- [ ] Control de tiempos (SLA)

**Archivos a crear/modificar:**
- `src/pages/agenda/AgendaAvanzada.tsx`
- `src/pages/operacion/ColasTrabajo.tsx`
- `src/services/ordenServicioService.ts`
- `src/types/operacion.ts`

---

### Agente 6: Pharmacy Inventory Pro
**Archivo:** `.agents/pharmacy-inventory/SKILL.md`

**Responsabilidad:** Farmacia e inventarios avanzado

**Entregables:**
- [ ] Inventario de medicamentos e insumos
- [ ] Lotes y caducidades
- [ ] Dispensación ligada a receta
- [ ] Botiquines por empresa
- [ ] Alertas de reabasto
- [ ] Control de mínimos/máximos

**Archivos a crear/modificar:**
- `src/pages/farmacia/FarmaciaPro.tsx`
- `src/pages/farmacia/Dispensacion.tsx`
- `src/pages/farmacia/Botiquines.tsx`
- `src/services/farmaciaService.ts`
- `src/services/inventoryService.ts` (extender)

---

### Agente 7: Billing & Collection Pro
**Archivo:** `.agents/billing-collection/SKILL.md`

**Responsabilidad:** Facturación, cobranza y costos

**Entregables:**
- [ ] Cotizaciones por empresa/campaña
- [ ] Facturación CFDI (existente mejorar)
- [ ] Estados de cuenta
- [ ] Cuentas por cobrar (aging: 0-30, 31-60, 61-90)
- [ ] Pagos y complementos de pago
- [ ] Conciliación de ingresos
- [ ] Costeo real por paciente
- [ ] Margen por empresa

**Archivos a crear/modificar:**
- `src/pages/facturacion/Cobranza.tsx`
- `src/pages/facturacion/EstadoCuenta.tsx`
- `src/pages/facturacion/Costos.tsx`
- `src/services/billingService.ts` (extender)
- `src/services/cobranzaService.ts`

---

### Agente 8: Executive Dashboard Designer
**Archivo:** `.agents/executive-dashboard/SKILL.md`

**Responsabilidad:** Reportes ejecutivos y dashboards

**Entregables:**
- [ ] Dashboard global (Admin)
- [ ] Dashboard por empresa
- [ ] Métricas de campañas
- [ ] Indicadores de aptitud
- [ ] Hallazgos críticos
- [ ] SLA de entrega
- [ ] Ingresos vs metas
- [ ] Widgets visuales

**Archivos a crear/modificar:**
- `src/pages/dashboard/DashboardAdminPro.tsx`
- `src/pages/dashboard/DashboardEmpresa.tsx`
- `src/pages/dashboard/Widgets/` (carpeta)
- `src/services/dashboardService.ts`

---

### Agente 9: Compliance STPS Specialist
**Archivo:** `.agents/compliance-stps/SKILL.md`

**Responsabilidad:** Cumplimiento legal y STPS

**Entregables:**
- [ ] Programa Conservación Auditiva (NOM-011)
- [ ] Programa Ergonomía (NOM-036)
- [ ] Evidencias documentales por trabajador
- [ ] Historial de desviaciones
- [ ] Bitácora de auditoría STPS
- [ ] Control de responsables (médico especialista)
- [ ] Reportes STPS listos

**Archivos a crear/modificar:**
- `src/pages/normatividad/NOM011.tsx`
- `src/pages/normatividad/NOM036.tsx`
- `src/pages/compliance/AuditoriaSTPS.tsx`
- `src/services/complianceService.ts`

---

### Agente 10: Security & Audit Specialist
**Archivo:** `.agents/security-audit/SKILL.md`

**Responsabilidad:** Seguridad, legal y auditoría

**Entregables:**
- [ ] Roles y permisos (existente mejorar)
- [ ] Trazabilidad completa (quién vio/editó/firmó)
- [ ] Bitácora legal de auditoría
- [ ] Respaldo automático
- [ ] Cumplimiento LFPDPPP
- [ ] Versionado de documentos

**Archivos a crear/modificar:**
- `src/services/auditService.ts`
- `src/services/backupService.ts`
- `src/components/audit/Trazabilidad.tsx`
- `src/pages/admin/Auditoria.tsx`

---

### Agente 11: Integrations Specialist
**Archivo:** `.agents/integrations/SKILL.md`

**Responsabilidad:** Integraciones técnicas

**Entregables:**
- [ ] Importación/exportación Excel
- [ ] API para equipos médicos
- [ ] Carga de PDF/DICOM
- [ ] Firma electrónica avanzada
- [ ] Envío automático de reportes
- [ ] Webhooks para empresas

**Archivos a crear/modificar:**
- `src/services/importExportService.ts`
- `src/services/equiposMedicosService.ts`
- `src/services/firmaElectronicaService.ts`
- `src/pages/integrations/Integraciones.tsx`

---

### Agente 12: UX Experience Designer
**Archivo:** `.agents/ux-experience/SKILL.md`

**Responsabilidad:** Experiencia de usuario Pro

**Entregables:**
- [ ] Menú por Empresa (workspace)
- [ ] Pipeline visual de episodios
- [ ] Semáforos clínicos (normal/alerta/crítico)
- [ ] Filtros avanzados
- [ ] Buscador global
- [ ] Dark mode (opcional)
- [ ] Responsive completo
- [ ] Accesibilidad (a11y)

**Archivos a crear/modificar:**
- `src/components/navigation/MenuEmpresa.tsx`
- `src/components/ui/Semaphore.tsx`
- `src/components/search/BuscadorGlobal.tsx`
- `src/styles/erp-pro-theme.css`

---

## 📅 CRONOGRAMA DE IMPLEMENTACIÓN

### Fase 1: Fundamentos (Semanas 1-2)
- [ ] Agente 1: Clinical Core
- [ ] Agente 2: Workflow Engine
- [ ] Agente 4: Dictamen Engine

### Fase 2: Negocio B2B (Semanas 3-4)
- [ ] Agente 3: B2B Workspace
- [ ] Agente 7: Billing & Collection
- [ ] Agente 8: Executive Dashboard

### Fase 3: Operación (Semanas 5-6)
- [ ] Agente 5: Operations Scheduler
- [ ] Agente 6: Pharmacy Inventory
- [ ] Agente 9: Compliance STPS

### Fase 4: Calidad (Semanas 7-8)
- [ ] Agente 10: Security & Audit
- [ ] Agente 11: Integrations
- [ ] Agente 12: UX Experience

### Fase 5: Testing & Deploy (Semana 9)
- [ ] Testing completo
- [ ] Correcciones
- [ ] Deploy producción

---

## 🔗 SECUENCIA DE DEPENDENCIAS

```
Clinical Core → Dictamen Engine → Workflow Engine
     ↓                ↓                   ↓
  B2B Workspace ← Operations Scheduler ←
     ↓
Billing & Collection → Executive Dashboard
     ↓
Compliance STPS → Security & Audit
     ↓
Integrations → UX Experience
```

---

## ✅ CRITERIOS DE ACEPTACIÓN ERP PRO

- [ ] Paciente puede tener múltiples episodios con flujo definido
- [ ] Empresa cliente ve su workspace completo
- [ ] Médico puede emitir dictamen solo si cumple reglas
- [ ] STPS puede auditar evidencias
- [ ] Contador ve cobranza y aging
- [ ] Admin ve dashboards ejecutivos
- [ ] Toda acción queda en bitácora de auditoría
- [ ] Sistema responde < 2 segundos
- [ ] 100% funcional en móvil/tablet

---

## 🚨 ROLLBACK PLAN

Si algo sale mal:

```bash
# Regresar a versión estable
git checkout v3.5.2-stable-backup

# O forzar rollback en producción
git revert HEAD~[N]..HEAD
git push origin main --force
```

---

**COORDINADOR:** Revisar `ERP_PRO_CHECKLIST.md` para seguimiento detallado.
