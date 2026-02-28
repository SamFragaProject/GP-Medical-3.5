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

## Integration of "Smart Onboarding Hub" (MedExtract Pro v2.0)

This plan details the replacing of the current `WizardAltaPaciente` and document extraction tools with the new `erp-consolidador-de-reportes-médicos-ia` app, creating a unified, AI-powered Smart Onboarding Hub.

## Architectural Approach

We will implement the **Opción 2** discussed previously: The data extracted by the new app will be stored in an open `JSONB` format in the `documentos_expediente` table, while the original PDFs/images will be saved in the Supabase Storage bucket.

The new onboarding flow will have two main paths:
1. **Smart Start (Document Upload):** User uploads previous medical documents. Gemini/OpenAI extracts the data and **pre-fills** the clinical history form.
2. **Manual Entry:** Direct entry into the new, smart clinical history form with features like auto-completing risks based on job position.

## Proposed Changes

### Database Updates (Supabase)
Ensure the `documentos_expediente` table exists and is structured to hold open JSONB data.

```sql
CREATE TABLE IF NOT EXISTS public.documentos_expediente (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    categoria TEXT NOT NULL, -- 'radiografia', 'laboratorio', 'espirometria', etc.
    archivo_url TEXT,
    archivo_nombre TEXT,
    tipo_mime TEXT,
    tamano_bytes BIGINT,
    datos_extraidos JSONB, -- Open schema for the new app data
    fecha_documento DATE,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Components Merge & Refactoring
Migrate the code from `document-analyzer/erp-consolidador-de-reportes-médicos-ia` into `erp-medico-frontend`.

#### `src/types/clinicalHistory.ts` [NEW]
- Move all types from `types.ts` of the new app (like `PatientData`, `VitalSigns`, `ClinicalHistoryFormData`, `LabResult`) here.

#### `src/components/pacientes/SmartOnboardingHub.tsx` [NEW]
- This will be the new entry point, replacing `WizardAltaPaciente`.
- It will present the dual choice: Upload Documents or Manual Entry.
- It will integrate the `FileUpload` logic from the new app.

#### `src/components/pacientes/ClinicalHistoryForm/` [NEW]
- Move all files from `components/clinical-history-form/` (Section1 to Section12).
- Update imports and adapt to the ERP's UI components (Tailwind, Lucide icons).
- Connect the "Analizar puesto" (Risk auto-completion) to our AI services.

#### `src/components/expediente/DynamicDataViewer.tsx` [NEW]
- A new component that renders the open `JSONB` data gracefully in the patient profile tabs.
- It will adapt to any data structure coming from the new app (Labs, X-Rays, etc.).

#### `src/services/smartExtractionService.ts` [NEW]
- The 'Director de Orquesta': Routes extraction tasks to **Gemini 2.0 Flash/Pro** for visual/document parsing, and to **OpenAI GPT-4o / o3-mini** for reasoning and auto-completing the risk fields.

### Modifying Existing Pages

#### `src/pages/pacientes/PacientesHub.tsx` [MODIFY]
- Replace the call to `WizardAltaPaciente` with the new `SmartOnboardingHub`.

#### Patient Profile Tabs (e.g., `LaboratorioTab.tsx`, `RayosXTab.tsx`) [MODIFY]
- Update them to read from `documentos_expediente` instead of the rigid old columns.
- Use `DynamicDataViewer` to display the `datos_extraidos` JSONB.
- Add the vertical "Timeline" UI to preview the original PDF/images.

## Verification Plan

### Automated / Manual Tests
1. **Smart Start Flow:** Upload a sample PDF Lab report. Verify that Gemini extracts the data, pre-fills the form, and correctly identifies fields.
2. **Risk Auto-completion:** Type a job title like "Soldador" and click "Analizar". Verify OpenAI correctly checks the Physical, Chemical, and Ergonomic risks.
3. **Open JSONB Storage:** Complete the onboarding and verify the data is saved as JSONB in `documentos_expediente` and the file is in Supabase Storage.
4. **Dynamic Data Viewer:** Open the Patient Profile -> Labs Tab, and ensure the UI renders the JSONB nicely and allows opening the original PDF.

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
