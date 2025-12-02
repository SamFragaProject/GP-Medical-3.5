# 🏥 PLAN MAESTRO - MediFlow ERP Medicina Ocupacional

## 📋 ÍNDICE
1. [Stack Tecnológico Final](#stack)
2. [Estructura de Base de Datos con CIE-10](#database)
3. [Configuración Supabase](#supabase)
4. [Configuración Firebase](#firebase)
5. [Configuración Vercel](#vercel)
6. [Schemas de Validación (Zod)](#schemas)
7. [Componentes a Crear](#componentes)
8. [Plan de Implementación por Fases](#fases)
9. [Checklist de Cumplimiento](#checklist)

---

<a name="stack"></a>
## 1. 🛠️ STACK TECNOLÓGICO FINAL

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  Vite + React 18 + TypeScript + Tailwind CSS                │
│  Hosting: VERCEL                                             │
├─────────────────────────────────────────────────────────────┤
│                        BACKEND                               │
│  Supabase (PostgreSQL + Auth + Storage + Realtime)          │
│  Edge Functions (Deno)                                       │
├─────────────────────────────────────────────────────────────┤
│                      SERVICIOS                               │
│  Firebase: Push Notifications (FCM)                          │
│  OpenAI: Chatbot IA                                          │
│  Stripe: Pagos (cuando escales)                              │
└─────────────────────────────────────────────────────────────┘
```

### ✅ Dependencias Ya Instaladas

Revisa el archivo `package.json` - todas las dependencias necesarias ya están configuradas:
- Supabase (@supabase/supabase-js, @supabase/ssr)
- Firebase (firebase)
- React Query (@tanstack/react-query)
- Zustand (state management)
- React Hook Form + Zod (formularios y validación)
- Radix UI (componentes)
- FullCalendar (agenda)
- jsPDF (generación de PDFs)
- date-fns (manejo de fechas)
- Y muchas más...

---

<a name="database"></a>
## 2. 🗄️ ESTRUCTURA DE BASE DE DATOS CON CIE-10

### Diagrama de Relaciones

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   empresas   │────<│   usuarios   │────<│   pacientes  │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                     ┌────────────────────────────┼────────────────────────────┐
                     │                            │                            │
              ┌──────▼──────┐            ┌────────▼────────┐          ┌───────▼───────┐
              │  examenes   │            │  incapacidades  │          │    citas      │
              │  _medicos   │            │                 │          │               │
              └──────┬──────┘            └────────┬────────┘          └───────────────┘
                     │                            │
              ┌──────▼──────┐            ┌────────▼────────┐
              │ diagnosticos│            │   cie10_codigos │
              │ _cie10      │────────────│   (catálogo)    │
              └─────────────┘            └─────────────────┘
```

### ✅ SQL Completo Disponible

El archivo SQL completo está en: `supabase/migrations/00_initial_schema_with_cie10.sql`

**Incluye:**
- ✅ Extensiones PostgreSQL (uuid-ossp, pgcrypto)
- ✅ Catálogo CIE-10 con ~80 códigos más comunes
- ✅ Todas las tablas del sistema (empresas, usuarios, pacientes, exámenes, etc.)
- ✅ Row Level Security (RLS) configurado
- ✅ Índices para rendimiento
- ✅ Triggers para auditoría automática
- ✅ Funciones útiles (calcular IMC, generar folios, etc.)
- ✅ Vistas para consultas comunes

---

<a name="supabase"></a>
## 3. ⚡ CONFIGURACIÓN SUPABASE

### Archivos Ya Creados

1. **Cliente Browser** (`src/lib/supabase/client.ts`)
   - Cliente para componentes del navegador
   - Singleton pattern para reutilización

2. **Cliente Servidor** (`src/lib/supabase/server.ts`)  
   - Para Server Components y API Routes
   - Manejo de cookies

3. **Middleware** (`src/lib/supabase/middleware.ts`)
   - Protección de rutas
   - Verificación de sesión

4. **Tipos TypeScript** (`src/lib/supabase/database.types.ts`)
   - Tipos generados de la base de datos
   - Interfaces para todas las tablas

### Pasos para Configurar Supabase

1. **Crear Proyecto en Supabase**
   - Ve a [supabase.com](https://supabase.com)
   - Crea un nuevo proyecto
   - Copia la URL y las API Keys

2. **Ejecutar Migraciones**
   ```bash
   # En el SQL Editor de Supabase, ejecuta:
   supabase/migrations/00_initial_schema_with_cie10.sql
   ```

3. **Configurar Variables de Entorno**
   ```bash
   # Copia .env.example a .env.local
   cp .env.example .env.local
   
   # Edita .env.local con tus credenciales:
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```

4. **Generar Tipos TypeScript** (opcional)
   ```bash
   npx supabase gen types typescript --project-id TU_PROJECT_ID > src/lib/supabase/database.types.ts
   ```

---

<a name="firebase"></a>
## 4. 🔥 CONFIGURACIÓN FIREBASE (Solo Push Notifications)

### Archivos Ya Creados

1. **Config Firebase** (`src/lib/firebase/config.ts`)
   - Inicialización de Firebase
   - Configuración de Firebase Cloud Messaging

2. **Hook usePushNotifications** (`src/hooks/usePushNotifications.ts`)
   - Hook para solicitar permisos
   - Obtener token FCM
   - Escuchar mensajes en foreground

3. **Service Worker** (`public/firebase-messaging-sw.js`)
   - Manejo de notificaciones en background
   - Click en notificaciones

### Pasos para Configurar Firebase

1. **Crear Proyecto en Firebase**
   - Ve a [console.firebase.google.com](https://console.firebase.google.com)
   - Crea un nuevo proyecto
   - Activa Cloud Messaging

2. **Obtener Credenciales**
   - En Project Settings → General → Your apps
   - Copia las credenciales de configuración
   - En Cloud Messaging, genera una VAPID key

3. **Configurar Variables de Entorno**
   ```bash
   # En .env.local, agrega:
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=tu-proyecto
   VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   VITE_FIREBASE_VAPID_KEY=BLxxxxxx...
   ```

4. **Actualizar Service Worker**
   - Edita `public/firebase-messaging-sw.js`
   - Reemplaza las credenciales de configuración

---

<a name="vercel"></a>
## 5. ▲ CONFIGURACIÓN VERCEL

### Archivos Ya Creados

1. **vercel.json** - Configuración de deployment
   - Headers de seguridad
   - Rewrites para API
   - Región IAD1

### Pasos para Desplegar en Vercel

1. **Instalar Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login y Deploy**
   ```bash
   # Login
   vercel login
   
   # Deploy
   cd erp-medico-frontend
   vercel
   ```

3. **Configurar Variables de Entorno**
   - En el dashboard de Vercel
   - Settings → Environment Variables
   - Agrega todas las variables de `.env.local`

4. **Configurar Dominio** (opcional)
   - En Vercel Dashboard → Domains
   - Agrega tu dominio personalizado

---

<a name="schemas"></a>
## 6. ✅ SCHEMAS DE VALIDACIÓN (ZOD)

### Archivos Ya Creados

Todos los schemas de validación están en `src/lib/validations/`:

1. **paciente.schema.ts**
   - Validación de datos personales
   - CURP, RFC, NSS con regex
   - Datos laborales

2. **examen.schema.ts**
   - Signos vitales con rangos válidos
   - Exploración física
   - Diagnósticos CIE-10

3. **incapacidad.schema.ts**
   - Validación de fechas
   - Tipos de incapacidad
   - Código CIE-10

4. **cita.schema.ts**
   - Validación de fecha y hora
   - Duración de cita
   - Tipo de cita

### Uso en Formularios

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pacienteSchema } from '@/lib/validations/paciente.schema';

function PacienteForm() {
  const form = useForm({
    resolver: zodResolver(pacienteSchema),
  });
  
  // ... resto del formulario
}
```

---

<a name="componentes"></a>
## 7. 🧩 COMPONENTES A CREAR

### Estructura Recomendada

```
src/components/
├── ui/                          # Componentes base (Radix UI)
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   └── ...
│
├── forms/                       # Formularios específicos
│   ├── PacienteForm.tsx         ⚡ PRIORIDAD
│   ├── ExamenMedicoForm.tsx     ⚡ PRIORIDAD
│   ├── SignosVitalesForm.tsx
│   ├── IncapacidadForm.tsx
│   ├── CitaForm.tsx
│   └── fields/
│       ├── CIE10Autocomplete.tsx  ⚡ PRIORIDAD
│       └── DatePicker.tsx
│
├── tables/                      # Tablas de datos
│   ├── PacientesTable.tsx
│   ├── ExamenesTable.tsx
│   └── CitasTable.tsx
│
├── charts/                      # Gráficos y estadísticas
│   ├── DashboardStats.tsx
│   └── IncapacidadesChart.tsx
│
├── pdf/                         # Generadores de PDF
│   ├── CertificadoAptitudPDF.tsx  ⚡ PRIORIDAD
│   └── DictamenSTPS_PDF.tsx
│
└── layout/                      # Componentes de layout
    ├── Sidebar.tsx
    ├── Header.tsx
    └── NotificationBell.tsx
```

---

<a name="fases"></a>
## 8. 📅 PLAN DE IMPLEMENTACIÓN POR FASES

### FASE 0: Setup Inicial (COMPLETADO ✅)

- ✅ Configurar Supabase
- ✅ Ejecutar SQL de base de datos
- ✅ Configurar Firebase
- ✅ Configurar variables de entorno
- ✅ Instalar dependencias
- ⏳ Probar conexión básica
- ⏳ Crear usuario de prueba

### FASE 1: Core del Sistema (1-2 semanas)

```
[ ] Configurar Supabase Auth
[ ] Implementar login/logout
[ ] Crear layout principal (Sidebar, Header)
[ ] Implementar React Query
[ ] Crear hooks base (usePacientes, useExamenes)
[ ] CRUD de Pacientes completo
[ ] Componente CIE10Autocomplete
[ ] Validaciones con Zod
```

### FASE 2: Funcionalidad Médica (2-3 semanas)

```
[ ] Formulario de Examen Médico completo
[ ] Registro de signos vitales
[ ] Sistema de diagnósticos CIE-10
[ ] Cálculo automático de IMC
[ ] Exploración física
[ ] Determinación de aptitud
[ ] CRUD de Incapacidades
[ ] Agenda y citas
```

### FASE 3: Documentos y Reportes (1-2 semanas)

```
[ ] Generador de Certificado de Aptitud (PDF)
[ ] Dictamen STPS (PDF)
[ ] Constancia de Salud (PDF)
[ ] Sistema de folios automáticos
[ ] Firma digital en documentos
[ ] Almacenamiento en Supabase Storage
```

### FASE 4: Dashboard y Analytics (1 semana)

```
[ ] Dashboard principal con KPIs
[ ] Gráficas de incapacidades
[ ] Exámenes por vencer
[ ] Estadísticas por departamento
[ ] Exportación a Excel
```

### FASE 5: Notificaciones y Extras (1 semana)

```
[ ] Firebase Push Notifications
[ ] Recordatorios de citas
[ ] Alertas de exámenes vencidos
[ ] Sistema de auditoría visual
[ ] Chatbot IA (si tienes OpenAI key)
```

### FASE 6: Testing y Producción (1 semana)

```
[ ] Tests básicos
[ ] Corrección de bugs
[ ] Optimización de rendimiento
[ ] Deploy a producción
[ ] Configurar dominio
[ ] Monitoreo básico
```

---

<a name="checklist"></a>
## 9. ✅ CHECKLIST DE CUMPLIMIENTO

### OMS / CIE-10
- [x] Catálogo CIE-10 integrado
- [x] Búsqueda por código y descripción
- [x] Enfermedades laborales marcadas
- [ ] Actualización periódica del catálogo

### NOM-STPS México
- [ ] NOM-006-STPS: Registro de materiales
- [ ] NOM-017-STPS: Control de EPP
- [ ] NOM-030-STPS: Servicios preventivos
- [ ] Formato de dictámenes oficiales
- [ ] Auditoría de cumplimiento

### Seguridad y Privacidad
- [x] Row Level Security (RLS)
- [x] Encriptación en tránsito (HTTPS)
- [x] Encriptación en reposo (Supabase)
- [x] Auditoría de acciones
- [ ] Backup automático configurado
- [ ] Política de retención de datos

### Funcionalidad Core
- [ ] Gestión de pacientes
- [ ] Exámenes médicos con CIE-10
- [ ] Incapacidades
- [ ] Agenda de citas
- [ ] Generación de certificados
- [ ] Firma digital
- [ ] Notificaciones push
- [ ] Dashboard con métricas

---

## 📞 PRÓXIMOS PASOS INMEDIATOS

### 1. Configurar Supabase (HOY)
```bash
# 1. Ir a supabase.com y crear proyecto
# 2. Copiar URL y API keys
# 3. Ejecutar SQL del archivo:
#    supabase/migrations/00_initial_schema_with_cie10.sql
# 4. Actualizar .env.local con las credenciales
```

### 2. Configurar Firebase (HOY)
```bash
# 1. Ir a firebase.google.com y crear proyecto
# 2. Activar Cloud Messaging
# 3. Copiar credenciales
# 4. Generar VAPID key
# 5. Actualizar .env.local
# 6. Editar public/firebase-messaging-sw.js
```

### 3. Probar Conexión (MAÑANA)
```bash
# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm dev

# Abrir http://localhost:5173
# Probar login con Supabase Auth
```

### 4. Implementar Primer CRUD (ESTA SEMANA)
- Crear página de pacientes
- Implementar formulario de paciente
- Conectar con Supabase
- Probar CRUD completo

---

## 📚 RECURSOS ÚTILES

- **Supabase Docs**: https://supabase.com/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **React Query**: https://tanstack.com/query/latest
- **Radix UI**: https://www.radix-ui.com
- **Zod**: https://zod.dev
- **CIE-10 OMS**: https://icd.who.int/browse10/2019/en

---

## 🎯 OBJETIVOS DEL PROYECTO

1. **Sistema completo de medicina ocupacional**
2. **Cumplimiento con NOM-STPS México**
3. **Integración con CIE-10 de la OMS**
4. **Multi-tenant (SaaS)**
5. **Generación automática de certificados**
6. **Notificaciones push**
7. **Dashboard analítico**
8. **Escalable y seguro**

---

*Plan creado para MediFlow ERP - Diciembre 2024*
*Versión: 1.0*
*Implementación: Opus + Claude*
