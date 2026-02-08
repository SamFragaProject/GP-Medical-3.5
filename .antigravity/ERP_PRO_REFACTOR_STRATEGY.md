# 🔄 Estrategia de Refactorización ERP Pro

> **Enfoque:** Reutilizar + Corregir + Agregar (NO crear desde cero)

---

## 📊 INVENTARIO DE LO QUE YA EXISTE

### ✅ Módulos Funcionales (v3.5.2)

| Módulo | Estado | Archivos Clave | Reutilizar? |
|--------|--------|----------------|-------------|
| **Pacientes** | ✅ Funciona | `src/pages/Pacientes.tsx` | ✅ SÍ - Extender con más campos |
| **Expediente Básico** | ✅ Funciona | `src/pages/HistorialClinico.tsx` | ✅ SÍ - Agregar APNP, AHF, ocupacional |
| **Consultas** | ✅ Funciona | `src/pages/medicina/*` | ✅ SÍ - Agregar plantillas, CIE-10, SOAP |
| **Recetas** | ✅ Funciona | `src/services/prescripcionService.ts` | ✅ SÍ - Agregar control de dispensación |
| **Agenda** | ✅ Funciona | `src/pages/Agenda.tsx` | ✅ SÍ - Agregar check-in/check-out, colas |
| **Exámenes** | ✅ Funciona | `src/pages/ExamenesOcupacionales.tsx` | ✅ SÍ - Agregar audio, espiro, integración |
| **Facturación** | ✅ Funciona | `src/pages/Facturacion.tsx` | ✅ SÍ - Agregar cobranza, aging |
| **Inventario** | ✅ Funciona | `src/pages/inventory/*` | ✅ SÍ - Agregar lotes, caducidad, botiquines |
| **Empresas** | ✅ Funciona | `src/pages/admin/GestionEmpresas.tsx` | ✅ SÍ - Agregar workspace, SLA |
| **Usuarios/Roles** | ✅ Funciona | `src/pages/Usuarios.tsx`, `GestionRoles.tsx` | ✅ SÍ - Agregar restricciones por puesto |
| **Auth** | ✅ Funciona | `src/contexts/AuthContext.tsx` | ✅ SÍ - Mantener, agregar trazabilidad |
| **Chatbot V2** | ✅ Funciona | `src-v2/modules/chatbot-v2/` | ✅ SÍ - Mantener activo |

---

## 🔧 ESTRATEGIA POR AGENTE

### Agente: Clinical Core Specialist

#### REUTILIZAR (No tocar estructura base):
- `src/pages/HistorialClinico.tsx` - Pantalla principal de expediente
- `src/services/dataService.ts` - Servicio base de pacientes
- `src/types/paciente.ts` - Tipos existentes de paciente

#### EXTENDER (Agregar campos/tabs):
- **Tab APNP**: Agregar formulario de hábitos (tabaco, alcohol, ejercicio)
- **Tab AHF**: Agregar árbol genealógico de enfermedades
- **Tab Ocupacional**: Agregar historial de empleos anteriores
- **Tab Exploración**: Agregar signos vitales estructurados
- **Consentimientos**: Crear nuevo componente (no existe)
- **CIE-10**: Agregar buscador al diagnóstico (ya existe catálogo básico)

#### CREAR NUEVO:
- `src/pages/medicina/ConsentimientoDigital.tsx` - No existe
- `src/services/consentimientoService.ts` - No existe
- Schema `consentimientos_informados` en BD - No existe

---

### Agente: Workflow Engine Architect

#### REUTILIZAR:
- `src/pages/Agenda.tsx` - Base para agenda avanzada
- `src/services/dataService.ts` - CRUD base
- `src/components/agenda/*` - Componentes de calendario

#### EXTENDER:
- **Agenda**: Agregar vista por sede, por empresa, check-in/check-out
- **Episodios**: Crear concepto nuevo (no existe pipeline formal)
- **Campañas**: Crear módulo nuevo (no existe)

#### CREAR NUEVO:
- `src/services/episodioService.ts` - No existe
- `src/services/campanaService.ts` - No existe
- Componente `PipelineVisual.tsx` - No existe
- Schema `episodios`, `campanas` - No existen

---

### Agente: Dictamen Engine Specialist

#### REUTILIZAR:
- `src/pages/ExamenesOcupacionales.tsx` - Base para evaluaciones
- `src/types/examenes.ts` - Tipos existentes
- `src/components/medicina/*` - Componentes médicos

#### EXTENDER:
- **Formatos ST-7/ST-9**: Agregar restricciones codificadas
- **Evaluaciones**: Agregar catálogo de restricciones por puesto

#### CREAR NUEVO:
- `src/pages/medicina/DictamenLaboral.tsx` - No existe dictamen formal
- `src/services/dictamenService.ts` - No existe
- Schema `dictamenes`, `catalogo_restricciones` - No existen
- Firma digital avanzada - No existe

---

### Agente: B2B Workspace Specialist

#### REUTILIZAR:
- `src/pages/admin/GestionEmpresas.tsx` - Ya existe gestión de empresas
- `src/services/dataService.ts` - CRUD de empresas funciona
- `src/components/admin/*` - UI de admin recién unificada

#### EXTENDER:
- **EmpresaDetail**: Agregar pestañas: Contrato, Servicios, Headcount, Sucursales
- **Reportes por empresa**: Agregar dashboard específico
- **Contactos**: Agregar gestión de contactos (RH, HSE, Compras)

#### CREAR NUEVO:
- `src/pages/admin/EmpresaWorkspace.tsx` - Vista unificada por empresa
- `src/pages/admin/EmpresaDashboard.tsx` - Dashboard específico

---

### Agente: Billing & Collection Pro

#### REUTILIZAR:
- `src/pages/Facturacion.tsx` - Facturación CFDI ya funciona
- `src/services/billingService.ts` - Servicio base existe
- `src/types/facturacion.ts` - Tipos existentes

#### EXTENDER:
- **Facturación**: Agregar estados de cuenta por empresa
- **Cobranza**: Agregar módulo de cuentas por cobrar (aging)
- **Costos**: Agregar costeo por paciente (no existe)

#### CREAR NUEVO:
- `src/pages/facturacion/Cobranza.tsx` - No existe
- `src/pages/facturacion/Costos.tsx` - No existe
- `src/services/cobranzaService.ts` - No existe

---

### Agente: Executive Dashboard Designer

#### REUTILIZAR:
- `src/pages/Dashboard.tsx` - Dashboard base existe
- `src/components/dashboard/*` - Widgets existentes
- `src/services/dataService.ts` - Datos base

#### EXTENDER:
- **Dashboard Admin**: Agregar métricas de campañas, episodios, dictámenes
- **Dashboard Empresa**: Crear vista específica por empresa

#### CREAR NUEVO:
- `src/pages/dashboard/DashboardAdminPro.tsx` - Versión mejorada
- `src/pages/dashboard/DashboardEmpresa.tsx` - Nuevo

---

## 📋 PRIORIDAD DE TRABAJO

### Fase 1: Fundamentos (Semanas 1-2)

**Orden correcto:**
1. **Clinical Core** primero (1-2 días)
   - Reutilizar HistorialClinico.tsx
   - Agregar tabs faltantes
   - Crear consentimientos
   
2. **Workflow Engine** en paralelo (2-3 días)
   - Crear episodios (nuevo)
   - Integrar con agenda existente
   - Crear campañas
   
3. **Dictamen Engine** (2-3 días)
   - Crear dictámenes (nuevo)
   - Integrar con exámenes existentes
   - Agregar firma digital

**Integración día 6-7:**
- Conectar los 3 módulos
- Testing de flujo completo

### Fase 2+: Resto de módulos

Similar estrategia: **reutilizar base + extender + crear lo nuevo**

---

## 🎯 COMANDOS PARA AGENTES

### Ejemplo: Clinical Core
```
Eres el Clinical Core Specialist.

MISIÓN: Extender el expediente clínico existente.

LO QUE YA EXISTE (reutilizar):
- src/pages/HistorialClinico.tsx (pantalla principal)
- src/services/dataService.ts (servicio base)
- src/types/paciente.ts (tipos base)

LO QUE DEBES AGREGAR:
1. Nuevos tabs en HistorialClinico:
   - Tab "APNP" (hábitos)
   - Tab "AHF" (heredofamiliares)
   - Tab "Ocupacional" (historial laboral)
   - Tab "Consentimientos" (firmas)

2. Nuevos servicios:
   - src/services/consentimientoService.ts
   - src/services/expedienteService.ts (extensión)

3. Nuevos schemas BD:
   - consentimientos_informados
   - apnp, ahf, historia_ocupacional

NO elimines lo existente, EXTIÉNDELO.

Reporta: qué reutilizaste y qué creaste nuevo.
```

---

## ✅ CHECKLIST DE REFACTORIZACIÓN

Para cada módulo, verificar:

- [ ] ¿Qué componentes/pages ya existen?
- [ ] ¿Qué servicios ya existen?
- [ ] ¿Qué tipos/schemas ya existen?
- [ ] ¿Qué se puede extender vs crear nuevo?
- [ ] ¿Las integraciones con otros módulos funcionan?

---

**Esta estrategia ahorra 60% del tiempo vs crear todo desde cero.**
