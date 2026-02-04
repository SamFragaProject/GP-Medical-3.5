# GPMedical 3.5 - Roadmap de Implementación

Este documento establece el orden lógico para completar la plataforma SaaS Multi-Tenant.

## 🔷 Arquitectura del Sistema

```
SUPER ADMIN (Nivel Plataforma)
   │
   ├── 🏢 EMPRESA 1 (Entorno Aislado)
   │    ├── 👤 Admin Empresa
   │    ├── 👨‍⚕️ Médico (permisos: Pacientes ✓, Exámenes ✓, Agenda ✓)
   │    ├── 👩‍⚕️ Enfermera (permisos: Pacientes ✓, Signos Vitales ✓)
   │    └── 📊 Datos de Empresa 1 (aislados por RLS)
   │
   ├── 🏢 EMPRESA 2 (Entorno Aislado)
   │    ├── 👤 Admin Empresa
   │    └── 📊 Datos de Empresa 2
   │
   └── 📈 PANEL GLOBAL (KPIs de todas las empresas)
```

---

## 🟢 Etapa 1: Panel Super Admin ✅ COMPLETADO
*Objetivo: El Super Admin puede crear y gestionar empresas y usuarios.*

### 1.1 Gestión de Empresas
- [x] **Vista de Empresas:** Lista de empresas clientes con métricas.
- [x] **Crear Empresa:** Formulario para alta de empresa (nombre, RFC, plan).
- [x] **Editar Empresa:** Modificar datos, cambiar plan, suspender/activar.
- [x] **Asignar Admin:** Crear primer usuario Admin para la empresa.

### 1.2 Gestión de Usuarios
- [x] **Vista de Usuarios:** Lista con filtros por rol y estado.
- [x] **Crear Usuario:** Formulario con datos, empresa y rol.
- [x] **Roles Dinámicos:** Sistema RBAC con permisos granulares.
- [x] **Editar/Suspender Usuario**

### 1.3 Configuración Global
- [x] **Catálogo de Roles:** Definir roles base con permisos predeterminados
- [x] **RLS en BD:** Políticas de aislamiento por empresa

---

## 🟢 Etapa 2: Flujo dentro de Empresa ✅ COMPLETADO
*Objetivo: Un Admin de Empresa puede operar su entorno.*

- [x] **Dashboard de Empresa:** Métricas propias (pacientes, citas, exámenes)
- [x] **Gestión de Usuarios de la Empresa:** Crear médicos, enfermeras, recepción
- [x] **Configuración de Sedes/Sucursales**
- [x] **Sistema de Permisos Dinámicos**

---

## 🟢 Etapa 3: Módulos Clínicos Funcionales ✅ COMPLETADO
*Una vez que hay usuarios y permisos, los módulos ya pueden restringirse.*

### Eje 1: Pacientes
- [x] **CRUD completo con permisos dinámicos**
- [x] **Perfil Ocupacional del Trabajador** (NSS, CURP, puesto, área, riesgo)
- [x] **Timeline Médico Real** conectado a Supabase

### Eje 2: Agenda
- [x] **Mostrar solo citas de la empresa del usuario**
- [x] **Crear/Editar/Cancelar citas**
- [x] **Vista Kanban y Vista Semanal**

### Eje 3: Encuentro Clínico (SOAP)
- [x] **Editor SOAP Modular** (Subjetivo, Objetivo, Análisis, Plan)
- [x] **Sección Ocupacional** (Dictamen de Aptitud, Restricciones, Recomendaciones)
- [x] **Integración CIE-10**
- [x] **Prescripción Integrada**
- [x] **IA de Análisis Clínico** para sugerir dictamen

### Eje 4: Certificado de Aptitud
- [x] **Componente OccupationalCertificate** listo para impresión/PDF
- [x] **Diseño premium con cumplimiento NOM-004/NOM-030**

---

## 🟢 Etapa 4: Inventario ✅ COMPLETADO
*Control de medicamentos, insumos y equipos médicos.*

- [x] **Catálogo de Productos** (medicamentos, insumos, equipos)
- [x] **Control de Stock** con niveles mínimo/máximo
- [x] **Movimientos de Inventario** (entradas, salidas, ajustes)
- [x] **Dispensación Automática** al crear prescripción
- [x] **Alertas de Stock Bajo/Crítico**
- [x] **Dialog para Nuevo Producto**
- [x] **Hook useInventory** reutilizable

---

## 🟢 Etapa 5: Reportes ✅ COMPLETADO
*Sistema completo de analytics y exportación.*

- [x] **Dashboard Principal**
- [x] **KPIs Detallados**
- [x] **Analytics Predictivos** con IA
- [x] **Generador de Reportes**
- [x] **Exportación Automática** (PDF, Excel)
- [x] **Reportes de Compliance** (NOM, IMSS)
- [x] **Análisis de Tendencias**
- [x] **Alertas Predictivas**
- [x] **ROI Analytics**

---

## 🟢 Etapa 6: Facturación ✅ COMPLETADO
*Sistema de facturación CFDI 4.0 con seguros.*

- [x] **Dashboard Financiero** con KPIs
- [x] **Generador CFDI 4.0**
- [x] **Portal de Pagos**
- [x] **Gestión de Seguros** (IMSS, ISSSTE, Particulares)
- [x] **Reportes Fiscales**
- [x] **Estados de Cuenta por Cliente**
- [x] **Conciliación Automática**
- [x] **Alertas de Vencimiento**

---

## 🟡 Etapa 7: IA Avanzada (EN PROGRESO)
*Integración completa con motor de IA local/cloud.*

- [x] **Servicio Predictivo** (Python + FastAPI + CUDA)
- [x] **Análisis de Riesgo Individual**
- [x] **Análisis Poblacional**
- [x] **Análisis Clínico SOAP** → Dictamen
- [ ] **Chat Médico con Ollama/LLM**
- [ ] **OCR de Documentos Médicos**
- [ ] **Extracción de Entidades Clínicas**

---

## 🔵 Etapa 8: Próximos Pasos

### ✅ Completado Recientemente
- [x] **Formatos ST-7 / ST-9** (Riesgo de Trabajo IMSS)
- [x] **Incapacidades Temporales** (Sistema completo con seguimiento)
- [x] **Migración SQL** para tablas de riesgos e incapacidades
- [x] **Página RiesgosTrabajo** con tabs y estadísticas

### Pendiente Corto Plazo
- [ ] **Firma Digital** para certificados
- [ ] **QR de Verificación** en documentos
- [ ] **Generación PDF** de formatos ST-7/ST-9

### Pendiente Medio Plazo
- [ ] **App Móvil** para pacientes
- [ ] **Portal de Autoservicio** para empresas
- [ ] **Integración con Laboratorios** externos
- [ ] **Telemedicina** básica

---

**Estado Actual:** Sistema funcional con 7 ejes completados incluyendo ST-7/ST-9. Próximo paso: Firma Digital o PDF Export.
