# MediFlow ERP — Propuestas de mejoras y modificaciones (Roadmap técnico + producto)
_Versión: 1.0 • Fecha: 2025-12-26_

Este documento lista mejoras concretas para “enderezar” MediFlow ERP (medicina del trabajo) y llevarlo de “panel con roles” a **ERP SaaS multi-tenant robusto**, con **flujo clínico/ocupacional** bien definido, seguridad fuerte y escalabilidad.

---

## 0) Resumen ejecutivo (lo más importante)
1. **Separar Plataforma vs Tenant** como dos “apps” lógicas: `/platform/*` (SaaS) y `/app/*` (ERP del cliente).
2. Evolucionar RBAC a **RBAC + Scope (ABAC ligero)**: tenant/sede/empresa-empleadora/propiedad/estado (firmado/cerrado).
3. Modelar módulos como **procesos** (triaje → evaluación → estudios → dictamen → firma → entrega) y no como pantallas sueltas.
4. Seguridad real: **RLS manda**, el front solo “acomoda”; auditoría, “break-glass”, retención y bloqueo legal.

---

## 1) Arquitectura & separación de dominios
### 1.1 Separación de rutas y navegación
**Agregar:**
- Rutas “plataforma”: `/platform/dashboard`, `/platform/tenants`, `/platform/billing`, `/platform/integrations`, `/platform/audit`, `/platform/support`.
- Rutas “tenant”: `/app/dashboard`, `/app/pacientes`, `/app/agenda`, `/app/expediente`, `/app/ocupacional`, `/app/reportes`, `/app/facturacion`, `/app/config`.

**Eliminar/evitar:**
- Menús clínicos visibles en plataforma (aunque sea “solo lectura”).
- Mezclar facturación SaaS (suscripción) con facturación clínica (cobro a pacientes/empresas).

**Beneficios:**
- UX más clara, menos errores de permisos.
- Seguridad por diseño (políticas distintas por prefijo de ruta).

### 1.2 Dos bases lógicas de permisos
- **Permisos plataforma** (SaaS): tenants, planes, pagos, métricas globales, integraciones, auditoría, soporte.
- **Permisos tenant** (ERP): pacientes, agenda, expediente, estudios, ocupacional, reportes, caja/facturación, inventarios, configuración.

---

## 2) Roles: ajustes, nuevos roles y mejores límites
### 2.1 Plataforma (SaaS)
**A) Platform Owner (Super Admin / “Dios”)**
- Mantiene control total, pero con **política de PHI**: acceso a datos clínicos solo vía “break-glass”.

**B) Platform Admin (Socio)**
- Gestión de clientes, planes, usuarios plataforma y facturación SaaS.
- **Cero acceso a PHI** (historia clínica, notas, diagnósticos, resultados nominales).

**C) Billing/Contabilidad SaaS**
- Solo finanzas SaaS, reportes fiscales SaaS, exportaciones.

**D) Soporte (opcional pero recomendado)**
- Soporte técnico con impersonación restringida:
  - Solo a tenants autorizados
  - Sin PHI por defecto (modo “asistencia ciega”: ve estructura y errores, no contenido)
  - Todo auditado

### 2.2 Tenant (ERP del cliente)
**A) Tenant Owner / Admin Empresa (Clínica)**
- Usuarios, sedes, catálogos, agenda global, reportes, aprobaciones.

**B) Director Médico (recomendado separarlo)**
- Puede ver/validar clínico, firmar, bloquear expedientes, reglas médicas.
- No administra finanzas o integraciones críticas si no corresponde.

**C) Médico del Trabajo**
- Atención clínica, dictámenes ocupacionales, firma de notas/aptitudes.

**D) Enfermería**
- Triaje/somatometría, documentación, alertas de valores críticos.
- No “cierra” consulta médica.

**E) Recepción / Caja**
- Agenda, check-in, datos demográficos, cobros básicos, facturación simple.
- Sin acceso a clínica.

**F) Inventarios (opcional)**
- Control de stock y pedidos (EPP/farmacia/consumibles).

**G) RH Cliente / Empresa empleadora (NUEVO, crítico en medicina del trabajo)**
- Acceso a:
  - Programación de exámenes de sus empleados
  - Estatus (en proceso / listo / vencido)
  - Descarga de **constancias/aptitudes** (sin clínica detallada)
  - Reportes agregados (sin PHI)

**H) Paciente / Empleado (Portal)**
- Citas, resultados autorizados, constancias, perfil.

---

## 3) Permisos: pasar de “módulo” a “acciones + alcance”
### 3.1 Acciones explícitas
Agregar permisos por acción:
- `create`, `read`, `update`, `delete`, `export`, `sign`, `approve_void`, `impersonate`, `configure`.

**Implementación sugerida:**
- En UI: `can(role, resource, action)`
- En API/DB: RLS / policies que validen scope y acción.

### 3.2 Scope (ABAC ligero)
Agregar scopes que “recortan” el acceso aunque el rol lo permita:
- `tenant_id` (aislamiento multi-tenant)
- `sede_id` (si hay sedes)
- `employer_id` (empresa empleadora del trabajador)
- `owner_user_id` (mis pacientes / mi agenda)
- `record_state` (borrador, firmado, cerrado, bloqueado legal)
- `time_window` (ej. soporte por 30 min)

---

## 4) Módulos: reestructurar a procesos reales
### 4.1 Separación recomendada de módulos tenant
- **Agenda & Atención**
- **Pacientes**
- **Expediente clínico**
- **Triaje / Somatometría** (enfermería)
- **Estudios** (lab / gabinete / rayos X)
- **Ocupacional** (puestos, riesgos, restricciones, aptitud)
- **Reportes** (internos clínicos vs RH)
- **Facturación clínica / Caja**
- **Inventarios**
- **Configuración tenant**
- **Auditoría & Cumplimiento**

### 4.2 Estados y workflow (core del ERP)
Modelar y persistir estados:
- **Cita**: creada → confirmada → check-in → en espera → en consulta → finalizada → cancelada / no-show
- **Consulta**: borrador → firmada → cerrada → bloqueada
- **Estudio**: solicitado → tomado → procesando → resultado → validado → entregado
- **Dictamen ocupacional**: borrador → firmado → entregado → vencido / renovado

---

## 5) Data model (tablas / campos que faltan)
### 5.1 Tablas base multi-tenant
- `tenants` (clientes)
- `tenant_sites` (sedes)
- `users` + `tenant_users` (relación usuario ↔ tenant ↔ rol)
- `employers` (empresas empleadoras dentro del tenant)
- `employees` / `patient_employment` (relación paciente ↔ employer ↔ puesto)

### 5.2 Clínica / ocupacional
- `patients` (sin mezclar datos sensibles innecesarios)
- `appointments`
- `encounters` (consultas)
- `vitals` (triaje)
- `clinical_notes` (versionadas)
- `diagnoses` (catálogo + vinculaciones)
- `orders` (solicitudes de estudios)
- `lab_results` / `imaging_results`
- `occupational_assessments`
- `fitness_certificates` (aptitud, restricciones, vigencia)
- `documents` (pdfs, consentimientos)
- `signatures` (firma digital, hash, timestamp)

### 5.3 Auditoría
- `audit_log` (actor, acción, recurso, tenant, ip, diff/metadata, motivo)
- `access_log_phi` (lecturas de PHI, especialmente para break-glass)

---

## 6) Seguridad y privacidad (lo que hace “SaaS serio”)
### 6.1 RLS como autoridad final
- Políticas de lectura/escritura por `tenant_id` (y por `employer_id` cuando aplique).
- Bloqueo por `record_state = locked` para no permitir “update/delete”.

### 6.2 Break-glass (soporte con acceso excepcional)
Agregar:
- “Solicitud de acceso” con motivo
- Ventana temporal (ej. 30 min)
- Audit log obligatorio
- Visual badge en UI (“modo soporte”)
- Restricción: solo el Platform Owner (o Soporte) con MFA

### 6.3 Minimización de PHI en plataforma
- La plataforma no necesita PHI; necesita:
  - conteos, estados, métricas agregadas
  - errores y salud del sistema
- Separar “métricas” de “contenido”.

### 6.4 Exportaciones y descargas
- `export` debe estar súper restringido.
- Generar PDFs en backend con controles: watermark, registro de descargas, expiración de links.

---

## 7) Cumplimiento mínimo viable (operativo)
### 7.1 Retención y borrado
- Implementar **soft delete** + retención mínima (reglas internas).
- “Borrado” de clínico: casi siempre debe ser **anulación** y no delete físico.

### 7.2 Firmas y bloqueo legal
- Firma de nota y dictamen: al firmar, bloquear cambios (solo addendum).
- Addendum: permitir agregar correcciones sin alterar lo firmado.

### 7.3 Consentimientos y avisos
- Registrar consentimiento expreso cuando aplique.
- Aviso de privacidad y trazabilidad de aceptación.

---

## 8) UX: flujos para que el equipo trabaje sin fricción
### 8.1 Recepción / Caja
- Flujo rápido:
  - “Nuevo paciente” → “Nueva cita” → “Check-in” → “Cobro” → “Enviar a triaje”
- Campos bloqueados (sin clínica).

### 8.2 Enfermería
- Lista del día con estados:
  - “Pendiente de somatometría”
  - “Valores críticos”
  - “Listo para médico”
- Formularios ultra rápidos, sin ruido.

### 8.3 Médico
- “Mi agenda” y “pendientes de firma”
- Plantillas por tipo de examen (ingreso, periódico, retorno, etc.)
- Dictamen ocupacional con campos claros (aptitud + restricciones + vigencia)

### 8.4 RH Cliente
- Vista “mis empleados” (por employer_id)
- Reportes agregados (sin PHI)
- Descargas de aptitudes/constancias

---

## 9) Facturación: separar “Billing SaaS” vs “Facturación clínica”
### 9.1 Billing SaaS (plataforma)
- Suscripciones, plan, MRR, churn, invoices SaaS.

### 9.2 Facturación clínica (tenant)
- Caja/ventas, facturas al cliente/empresa, notas de crédito, anulaciones.
- Roles:
  - Recepción: cobro básico
  - Admin Empresa: aprobaciones/anulaciones
  - Médico: normalmente sin acceso

---

## 10) Observabilidad (porque en producción todo arde)
Agregar:
- Health checks (DB, storage, colas, email)
- Logs estructurados por tenant
- Dashboard de errores por release
- Alertas: pagos fallidos SaaS, errores 500, colas atoradas, storage lleno

---

## 11) Calidad: testing, permisos y regresiones
### 11.1 “Permisos como contrato”
- Tests automatizados que recorren:
  - rol × módulo × acción × scope
- Generar “matriz de permisos” como artefacto.

### 11.2 Seed de datos por tenant
- Dataset mínimo para demos:
  - 1 tenant, 2 sedes, 2 employers, 20 pacientes, 50 citas.

---

## 12) Plan de implementación por fases (recomendado)
### Fase 1 — Reestructura crítica (1–2 sprints)
- Separar `/platform` y `/app`
- Ajustar roles (plataforma vs tenant)
- Implementar acciones (`requireAction`) y scopes mínimos (`tenant_id`, `owner_user_id`)
- RLS endurecida

### Fase 2 — Flujo ocupacional y firma (1–2 sprints)
- Estados (cita/consulta/estudios/dictamen)
- Firma + bloqueo + addendum
- RH Cliente (employer scope)

### Fase 3 — Auditoría, soporte y escalabilidad (1–2 sprints)
- Audit log + break-glass
- Métricas agregadas
- Observabilidad y alertas

---

## 13) Checklist rápido (para validar “ya está enderezado”)
- [ ] Plataforma no muestra PHI (ni por accidente)
- [ ] Tenant isolation probado (RLS)
- [ ] Roles no solo ven: también se restringen por acción
- [ ] Enfermería y Recepción no ven clínica
- [ ] Médico firma y bloquea (solo addendum posterior)
- [ ] RH Cliente ve aptitudes/reportes agregados sin PHI
- [ ] Auditoría registra lecturas y cambios relevantes
- [ ] Facturación SaaS y clínica están separadas

---

## 14) Notas finales
- La UI (menú dinámico) es “conveniencia”; la seguridad debe vivir en DB/RLS y APIs.
- En medicina del trabajo, el **dictamen ocupacional** es el producto “entregable” al empleador; el expediente completo no.

