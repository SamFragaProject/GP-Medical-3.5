# 🤖 Agentes Especializados - GPMedical ERP

## Propósito del Proyecto

**GPMedical** es un ERP completo de **Medicina del Trabajo** diseñado para clínicas y empresas que necesitan:

1. 📋 **Expedientes Clínicos Digitales** - Historial médico completo de empleados
2. 🏥 **Exámenes Médicos Ocupacionales** - ST-7, ST-9, evaluaciones ergonómicas  
3. 📅 **Agenda Médica** - Citas, calendario y recordatorios
4. 💰 **Facturación CFDI 4.0** - Emisión de facturas fiscales
5. 📦 **Inventario Médico** - Control de medicamentos y equipo
6. ⚖️ **Cumplimiento Normativo** - NOM-004, NOM-024, NOM-030, NOM-035
7. 🏢 **Multi-tenancy** - Gestión de múltiples empresas/clientes
8. 🧠 **Análisis Predictivo** - IA para reducir ausentismo laboral

## Equipo de Agentes

Hemos creado 5 agentes especializados para auditar y corregir el proyecto:

---

### 1. 🎯 Project Orchestrator
**Archivo:** `project-orchestrator/SKILL.md`

**Rol:** Coordinador general que entiende el panorama completo del proyecto.

**Responsabilidades:**
- Entender la arquitectura V1 vs V2
- Coordinar a los otros agentes
- Definir prioridades de corrección
- Validar que el propósito del ERP se cumpla

**Cuándo usar:**
- Para entender el contexto general
- Para coordinar entre agentes
- Para definir estrategia de corrección

---

### 2. 🔍 TypeScript Auditor
**Archivo:** `typescript-auditor/SKILL.md`

**Rol:** Especialista en eliminar errores de TypeScript.

**Responsabilidades:**
- Corregir errores de tipos
- Unificar nomenclatura (camelCase vs snake_case)
- Verificar imports/exports
- Asegurar que el build sea exitoso

**Errores a corregir:**
- Property 'x' does not exist on type 'Y'
- Cannot find name 'supabase'
- Type 'X' is not assignable to type 'Y'
- Módulos con errores en src-v2/

**Cuándo usar:**
- Cuando `npm run build` falle
- Cuando haya errores de tipo en consola
- Para preparar el proyecto para producción

---

### 3. 🗄️ Supabase Verifier
**Archivo:** `supabase-verifier/SKILL.md`

**Rol:** Especialista en servicios y base de datos.

**Responsabilidades:**
- Verificar que todos los servicios funcionen
- Validar tipos contra schema de Supabase
- Revisar políticas RLS (Row Level Security)
- Verificar funciones Edge

**Servicios a verificar:**
- `dataService.ts` (empresas, usuarios, pacientes)
- `billingService.ts` (facturación)
- `inventoryService.ts` (inventario)
- `permisosService.ts` (roles)

**Cuándo usar:**
- Cuando las queries fallen
- Cuando haya errores de conexión a BD
- Para verificar tenant isolation

---

### 4. 🎨 UI Consistency Agent
**Archivo:** `ui-consistency/SKILL.md`

**Rol:** Especialista en diseño visual consistente.

**Responsabilidades:**
- Unificar estilos del panel de admin
- Crear componentes reutilizables
- Asegurar paleta de colores consistente
- Verificar responsive design

**Páginas a unificar:**
- `GestionEmpresas.tsx`
- `GestionRoles.tsx`
- `SuperAdminGodMode.tsx`
- `Usuarios.tsx`
- Otras páginas de admin

**Componente base:** `src/components/admin/AdminLayout.tsx`

**Cuándo usar:**
- Cuando los estilos del admin sean inconsistentes
- Para mejorar UX/UI
- Para crear diseño profesional uniforme

---

### 5. 🧪 Flow Tester
**Archivo:** `flow-tester/SKILL.md`

**Rol:** Especialista en testing end-to-end.

**Responsabilidades:**
- Verificar flujos críticos del sistema
- Probar todos los roles (Super Admin, Admin, Médico, etc.)
- Validar permisos y accesos
- Reportar bugs de funcionalidad

**Flujos a probar:**
1. Autenticación (login/logout)
2. Gestión de pacientes
3. Agenda y citas
4. Exámenes médicos
5. Facturación
6. Inventario
7. Administración (empresas, usuarios, roles)

**Cuándo usar:**
- Antes de deploy a producción
- Después de correcciones importantes
- Para validar que todo funciona

---

### 6. 🎛️ Feature Coordinator
**Archivo:** `feature-coordinator/SKILL.md`

**Rol:** Especialista en sistema de feature flags V1/V2.

**Responsabilidades:**
- Verificar que los flags funcionen correctamente
- Coordinar activación progresiva de V2
- Asegurar que V1 funcione con flags desactivados
- Planificar rollback si es necesario

**Feature Flags:**
- `USE_CHATBOT_V2` ✅ Activo
- `USE_AUTH_V2` ❌ Desactivado (errores)
- `USE_PACIENTES_V2` ❌ Desactivado (errores)
- etc.

**Cuándo usar:**
- Para activar/desactivar módulos V2
- Para planificar migración V1→V2
- Para coordinar releases

---

## Flujo de Trabajo Recomendado

### Para preparar producción:

1. **TypeScript Auditor** corre primero
   - Elimina todos los errores de build
   - Asegura que el proyecto compile

2. **Supabase Verifier** revisa servicios
   - Verifica conexión a BD
   - Valida tipos y queries

3. **UI Consistency** unifica el admin
   - Mejora la experiencia visual
   - No es bloqueante para producción

4. **Feature Coordinator** verifica flags
   - Asegura que V1 funcione correctamente
   - Valida que V2 desactivado no cause problemas

5. **Flow Tester** valida todo
   - Prueba todos los flujos críticos
   - Verifica que el ERP funcione end-to-end

6. **Project Orchestrator** coordina
   - Supervisa todo el proceso
   - Toma decisiones de priorización

---

## Estructura de Agentes

```
.agents/
├── README.md                    # Este archivo
├── project-orchestrator/
│   └── SKILL.md                # Coordinador general
├── typescript-auditor/
│   └── SKILL.md                # Corrección de tipos
├── supabase-verifier/
│   └── SKILL.md                # Base de datos
├── ui-consistency/
│   └── SKILL.md                # Diseño UI
├── flow-tester/
│   └── SKILL.md                # Testing E2E
└── feature-coordinator/
    └── SKILL.md                # Feature flags
```

---

## Estado Actual del Proyecto (03/02/2026)

### ✅ Funcionando
- Build exitoso
- Módulos V1 estables
- Chatbot V2 activo
- Autenticación operativa
- 90% del sistema listo

### ⚠️ Pendiente
- Estilos admin inconsistentes (no bloqueante)
- Módulos V2 desactivados (por errores TS)
- Deploy a producción

### ❌ Crítico
- Nada crítico pendiente
- Sistema funcional para producción

---

## Comunicación entre Agentes

Cada agente debe:
1. **Leer su SKILL.md** antes de empezar
2. **Reportar progreso** claramente
3. **Marcar dependencias** con otros agentes
4. **Documentar cambios** realizados

Formato de reporte:
```markdown
## Agente: [Nombre]
## Estado: [En progreso | Completado | Bloqueado]

### Archivos Modificados
- [ruta/archivo.tsx]

### Errores Corregidos
1. [Descripción] → [Solución]

### Dependencias
- Necesita: [de qué otro agente depende]
- Provee: [qué provee a otros agentes]

### Estado Final
✅ Funcionando / ❌ Pendiente
```

---

## Próximos Pasos

1. 🚀 **Deploy a producción** (ya está listo)
2. 🧪 **Testing de flujos** (validar funcionamiento)
3. 🎨 **Unificar estilos admin** (mejora visual)
4. 🔧 **Corregir módulos V2** (para futura activación)

---

**¿Preguntas?**
Cada agente tiene instrucciones detalladas en su SKILL.md correspondiente.
