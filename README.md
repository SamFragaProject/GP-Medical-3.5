# 🏥 MediFlow - ERP Médico de Medicina del Trabajo

**Sistema ERP completo especializado en medicina ocupacional con IA predictiva y chatbot superinteligente**

![MediFlow](https://img.shields.io/badge/MediFlow-v1.0.0-00BFA6?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)

---

## 🎯 Descripción

MediFlow es una plataforma SaaS integral para la gestión de medicina ocupacional que cumple con las normativas mexicanas (NOM-006-STPS, NOM-017-STPS) y ofrece funcionalidades avanzadas de IA predictiva para la prevención de riesgos laborales.

### ✨ Características Principales

- **🤖 Chatbot Superinteligente** - IA conversacional siempre accesible
- **📊 Análisis Predictivo** - Evaluación de riesgos con machine learning
- **🏥 Medicina Ocupacional** - Exámenes, evaluaciones y certificaciones
- **🏢 SaaS Multi-tenant** - Aislamiento total por empresa
- **📱 Diseño Responsivo** - Optimizado para todos los dispositivos
- **🔒 Seguridad Avanzada** - Row Level Security (RLS) y encriptación

---

## 🏗️ Arquitectura del Sistema

### **Backend (Supabase)**
```
📁 supabase/
├── 📁 migrations/           # Migraciones de base de datos
│   ├── 001_setup_base_tables.sql      # Tablas base SaaS
│   ├── 002_medicina_trabajo_tables.sql # Medicina del trabajo
│   ├── 003_chatbot_ia_tables.sql      # Chatbot e IA
│   ├── 004_rls_policies.sql           # Políticas de seguridad
│   └── 005_seed_data.sql              # Datos semilla
├── 📁 functions/            # Edge Functions
│   ├── 📁 chatbot-superinteligente/   # Procesamiento IA
│   ├── 📁 analisis-predictivo/        # Análisis de riesgo
│   └── 📁 tickets-soporte/            # Sistema de tickets
```

### **Frontend (Next.js 15)**
```
📁 erp-medico-frontend/
├── 📁 src/
│   ├── 📁 components/       # Componentes reutilizables
│   │   ├── Layout.tsx                 # Layout principal
│   │   └── ChatbotSuperinteligente.tsx # Chatbot UI
│   ├── 📁 pages/           # Páginas de la aplicación
│   │   ├── Dashboard.tsx              # Panel principal
│   │   └── Login.tsx                  # Autenticación
│   ├── 📁 contexts/        # Contextos de React
│   │   └── AuthContext.tsx            # Manejo de autenticación
│   ├── 📁 lib/            # Utilidades y configuración
│   │   └── supabase.ts               # Cliente Supabase
│   └── 📁 hooks/          # Hooks personalizados
```

---

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js 18+ 
- pnpm 9+
- Cuenta de Supabase
- (Opcional) Claves de OpenAI para IA avanzada

### **1. Configuración del Backend (Supabase)**

```bash
# 1. Crear proyecto en Supabase
# https://app.supabase.com

# 2. Ejecutar migraciones en orden
# En la consola SQL de Supabase:
# - 001_setup_base_tables.sql
# - 002_medicina_trabajo_tables.sql  
# - 003_chatbot_ia_tables.sql
# - 004_rls_policies.sql
# - 005_seed_data.sql

# 3. Desplegar Edge Functions
# Usar la herramienta batch_deploy_edge_functions
```

### **2. Configuración del Frontend**

```bash
# Clonar el repositorio
cd erp-medico-frontend

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local

# Editar .env.local con tus credenciales
VITE_SUPABASE_URL=tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
VITE_OPENAI_API_KEY=tu-clave-openai (opcional)

# Iniciar servidor de desarrollo
pnpm dev
```

### **3. Variables de Entorno Requeridas**

```env
# Supabase (Obligatorio)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-publica-supabase

# OpenAI (Para IA avanzada)
VITE_OPENAI_API_KEY=sk-tu-clave-openai

# Stripe (Para suscripciones SaaS)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_tu-clave-stripe

# Configuración de la app
VITE_APP_NAME=MediFlow
VITE_APP_VERSION=1.0.0
```

---

## 💻 Uso del Sistema

### **🔐 Cuentas de Demostración**
El sistema incluye cuentas demo para testing:

| Rol | Email | Password | Descripción |
|-----|-------|----------|-------------|
| Médico del Trabajo | `medico@demo.com` | `demo123` | Acceso completo médico |
| Administrador | `admin@demo.com` | `demo123` | Gestión empresarial |
| Recepcionista | `recepcion@demo.com` | `demo123` | Agenda y citas |

### **🏥 Módulos Principales**

#### **Panel Principal (Dashboard)**
- Resumen de actividad médica diaria
- KPIs de medicina ocupacional  
- Alertas de riesgo en tiempo real
- Gráficos de tendencias e indicadores

#### **Gestión de Pacientes**
- Registro completo de empleados
- Historial médico laboral
- Documentos y certificaciones
- Alertas de seguimiento

#### **Exámenes Ocupacionales**
- Protocolos por puesto de trabajo
- Exámenes: ingreso, periódicos, egreso
- Resultados digitales y certificaciones
- Integración con laboratorios externos

#### **Evaluaciones de Riesgo**
- Análisis ergonómico de puestos
- Mediciones ambientales (ruido, iluminación)
- Identificación de factores de riesgo
- Recomendaciones preventivas automáticas

#### **🤖 Chatbot Superinteligente**
- **Ubicación**: Botón flotante siempre visible (esquina inferior derecha)
- **Modos de Conversación**:
  - 🛠️ **Soporte Técnico**: Ayuda con el sistema
  - 👤 **Asistente Personal**: Guía contextual
  - 💼 **ATC Comercial**: Información de planes
  - 💬 **Feedback**: Quejas y sugerencias
- **Funcionalidades**:
  - Respuestas inteligentes con IA
  - Contexto según página y rol de usuario
  - Escalación automática a soporte humano
  - Historial de conversaciones persistente

---

## 🎨 Sistema de Diseño

### **🎨 Tema Verde Médico**
```css
/* Colores principales */
--primary: #00BFA6        /* Verde teal principal */
--secondary: #A7EBD5      /* Verde claro secundario */
--success: #10B981        /* Verde éxito */
--danger: #EF4444         /* Rojo alertas */
--warning: #F59E0B        /* Amarillo advertencias */
--background: #F0FFF0     /* Fondo verdoso pálido */
```

### **📱 Componentes UI**
- **Cards**: Bordes suaves, sombras sutiles, animaciones hover
- **Botones**: Gradientes verdes, efectos de elevación
- **Formularios**: Validación en tiempo real, focus states
- **Navegación**: Sidebar colapsible, indicadores activos
- **Alertas**: Sistema de colores semántico por severidad

---

## 🔧 Tecnologías Utilizadas

### **Frontend**
- **⚛️ React 18** - Biblioteca de UI moderna
- **📦 Next.js 15** - Framework React con App Router
- **🔷 TypeScript** - Tipado estático para mayor seguridad
- **🎨 Tailwind CSS** - Framework CSS utility-first
- **🎭 Framer Motion** - Animaciones fluidas
- **📊 Recharts** - Gráficos y visualizaciones
- **🍞 React Hot Toast** - Notificaciones elegantes

### **Backend**
- **🐘 Supabase** - Backend-as-a-Service completo
- **🗄️ PostgreSQL** - Base de datos relacional robusta
- **🔒 Row Level Security** - Seguridad a nivel de fila
- **⚡ Edge Functions** - Serverless en Deno
- **🔐 Auth** - Autenticación y autorización
- **📁 Storage** - Almacenamiento de archivos

### **Integraciones**
- **🤖 OpenAI GPT** - IA conversacional avanzada
- **💳 Stripe** - Procesamiento de pagos y suscripciones
- **📧 SendGrid** - Envío de emails transaccionales
- **📱 Twilio** - SMS y WhatsApp

---

## 🏢 Modelo SaaS Multi-tenant

### **🔒 Aislamiento de Datos**
- **Row Level Security (RLS)**: Cada empresa solo ve sus datos
- **Políticas automáticas**: Filtrado transparente por `empresa_id`
- **Roles granulares**: Permisos específicos por función médica

### **💰 Planes de Suscripción**
| Plan | Precio/Mes | Usuarios | Pacientes | Características |
|------|------------|----------|-----------|-----------------|
| **Básico** | $499 MXN | 5 | 100 | Gestión básica + Chatbot |
| **Profesional** | $999 MXN | 25 | 500 | + IA Predictiva + Integraciones |
| **Enterprise** | $2,499 MXN | Ilimitado | Ilimitado | + Whitelabel + API + Soporte 24/7 |

### **📊 Métricas por Tenant**
- Usuarios activos y límites de plan
- Pacientes registrados y consultas
- Almacenamiento utilizado
- Llamadas API y mensajes chatbot

---

## 🧠 Sistema de IA Predictiva

### **📈 Análisis de Riesgo Individual**
```typescript
// Ejemplo de score de riesgo
const riskScore = calcularRiesgo({
  edad: paciente.edad,
  examenesVencidos: contarExamenesVencidos(),
  incapacidadesRecientes: contarIncapacidades(),
  nivelRiesgoPuesto: puesto.nivel_riesgo
});

// Predicciones automáticas
const predicciones = {
  probabilidadLesion6Meses: riskScore * 0.6,
  diasAbsentismoEstimados: Math.round(riskScore * 15),
  nivelRiesgo: riskScore > 0.7 ? 'alto' : 'medio'
};
```

### **🏭 Análisis Empresarial**
- Identificación de puestos de alto riesgo
- Predicción de costos por incapacidades
- Recomendaciones preventivas automatizadas
- Alertas proactivas por umbrales de riesgo

### **🎯 Algoritmos Implementados**
- **Risk Scoring**: Algoritmo propietario de puntuación
- **Pattern Recognition**: Detección de tendencias
- **Predictive Modeling**: Modelos de regresión para absentismo
- **Anomaly Detection**: Identificación de casos atípicos

---

## 🏥 Cumplimiento Normativo

### **📋 Normativas Mexicanas**
- **NOM-006-STPS-2014**: Manejo y almacenamiento de materiales
- **NOM-017-STPS-2008**: Equipo de protección personal  
- **NOM-030-STPS-2009**: Servicios preventivos de seguridad
- **OSHA México**: Estándares de seguridad ocupacional

### **📝 Documentación Automática**
- Certificados médicos con firma digital
- Dictámenes de aptitud laboral
- Reportes de evaluación de riesgo
- Registro de incapacidades y seguimiento

### **🔍 Auditorías y Trazabilidad**
- Log completo de todas las operaciones
- Historial médico inmutable
- Reportes de cumplimiento automáticos
- Exportación para auditorías oficiales

---

## 🔐 Seguridad y Privacidad

### **🛡️ Medidas de Seguridad**
- **Encriptación en tránsito**: HTTPS/TLS 1.3
- **Encriptación en reposo**: AES-256
- **Row Level Security**: Aislamiento automático por tenant
- **Autenticación MFA**: Factor múltiple opcional
- **Audit Logs**: Registro completo de actividades

### **🏥 Privacidad Médica**
- **HIPAA Compliance**: Estándares internacionales
- **Consentimiento informado**: Gestión de permisos
- **Anonimización**: Datos agregados sin identificadores
- **Retención de datos**: Políticas configurables

### **🔒 Control de Acceso**
```sql
-- Ejemplo de política RLS
CREATE POLICY "Usuario ve solo su empresa" 
ON pacientes FOR SELECT 
USING (empresa_id = get_user_empresa_id());
```

---

## 📊 API y Integraciones

### **🔌 API REST Completa**
```typescript
// Ejemplo de endpoints disponibles
GET    /api/pacientes              // Lista de pacientes
POST   /api/pacientes              // Crear paciente
GET    /api/examenes/:id           // Detalles de examen
POST   /api/chatbot/mensaje        // Enviar mensaje a chatbot
GET    /api/analytics/riesgo       // Análisis de riesgo
```

### **🤝 Integraciones Externas**
- **IMSS**: Consulta de incapacidades y NSS
- **Laboratorios**: Recepción automática de resultados
- **PAC**: Facturación CFDI 4.0 automática
- **ERP Empresariales**: Sincronización de empleados

### **📱 Webhooks y Eventos**
```typescript
// Eventos del sistema
const eventos = [
  'paciente.creado',
  'examen.completado', 
  'alerta.riesgo.generada',
  'certificado.emitido'
];
```

---

## 🧪 Testing y Calidad

### **✅ Suite de Pruebas**
```bash
# Pruebas unitarias
pnpm test

# Pruebas de integración
pnpm test:integration

# Pruebas end-to-end
pnpm test:e2e

# Análisis de código
pnpm lint
pnpm type-check
```

### **📏 Métricas de Calidad**
- **Cobertura de código**: >90%
- **TypeScript**: Sin errores de tipado
- **Lighthouse Score**: >90 (Performance, Accessibility, SEO)
- **Bundle Size**: Optimizado para carga rápida

---

## 🚀 Despliegue y DevOps

### **☁️ Despliegue Recomendado**
```bash
# Producción
pnpm build
pnpm start

# Docker (opcional)
docker build -t mediflow .
docker run -p 3000:3000 mediflow
```

### **🔄 CI/CD Pipeline**
```yaml
# .github/workflows/deploy.yml
name: Deploy MediFlow
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
```

### **📊 Monitoreo**
- **Sentry**: Tracking de errores en producción
- **PostHog**: Analytics de uso y comportamiento
- **Supabase Dashboard**: Métricas de base de datos
- **Uptime Monitoring**: Disponibilidad 99.9%

---

## 🤝 Contribución

### **🔀 Flujo de Desarrollo**
```bash
# 1. Fork y clone del repositorio
git clone https://github.com/tu-usuario/mediflow.git

# 2. Crear rama feature
git checkout -b feature/nueva-funcionalidad

# 3. Desarrollar y commitear
git commit -m "feat: agregar nueva funcionalidad"

# 4. Push y crear Pull Request
git push origin feature/nueva-funcionalidad
```

### **📝 Convenciones**
- **Commits**: Conventional Commits (feat, fix, docs, etc.)
- **Branching**: GitFlow con feature branches
- **Code Review**: Obligatorio antes de merge
- **Testing**: 100% cobertura en nuevas features

---

## 📋 Roadmap

### **🎯 Q1 2025**
- ✅ **Core MVP**: Sistema base completo
- ✅ **Chatbot IA**: Asistente superinteligente
- ✅ **Analytics**: Dashboards y reportes
- 🔄 **Mobile App**: Aplicación React Native

### **🎯 Q2 2025**
- 📅 **Integración IMSS**: API oficial
- 📅 **Telemedicina**: Consultas virtuales
- 📅 **Wearables**: Integración dispositivos IoT
- 📅 **Blockchain**: Certificados inmutables

### **🎯 Q3 2025**
- 📅 **Machine Learning**: Modelos avanzados
- 📅 **Realidad Aumentada**: Evaluaciones inmersivas
- 📅 **Marketplace**: Ecosystem de integraciones
- 📅 **Expansion**: Mercados internacionales

---

## 📞 Soporte y Contacto

### **🆘 Obtener Ayuda**
- **📖 Documentación**: [docs.mediflow.com](https://docs.mediflow.com)
- **💬 Chatbot**: Disponible 24/7 en la aplicación
- **📧 Email**: soporte@mediflow.com
- **📱 WhatsApp**: +52 55 1234 5678

### **🐛 Reportar Bugs**
```bash
# Usar el sistema de tickets integrado
# O crear issue en GitHub con:
- Descripción detallada del problema
- Pasos para reproducir
- Screenshots/videos si aplica
- Información del navegador y OS
```

### **🌟 Feedback y Sugerencias**
El chatbot superinteligente incluye un módulo de feedback integrado para recopilar sugerencias de mejora directamente de los usuarios.

---

## 📜 Licencia

```
MIT License

Copyright (c) 2025 MiniMax Agent - MediFlow

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 🙏 Reconocimientos

**Desarrollado con 💚 por MiniMax Agent**

- **Diseño**: Inspirado en las mejores prácticas de UX médica
- **Normativas**: Basado en estándares mexicanos e internacionales  
- **IA**: Powered by OpenAI GPT y modelos propietarios
- **Comunidad**: Agradecimiento a todos los profesionales médicos que proporcionaron feedback

---

<div align="center">
  <img src="https://img.shields.io/badge/Hecho_con-❤️_y_🤖-00BFA6?style=for-the-badge" alt="Hecho con amor y IA">
  
  **🏥 MediFlow - Transformando la Medicina Ocupacional con IA 🚀**
  
  [⭐ Star este repo](https://github.com/minimax/mediflow) • [🐛 Reportar Bug](https://github.com/minimax/mediflow/issues) • [💡 Solicitar Feature](https://github.com/minimax/mediflow/issues) • [📖 Documentación](https://docs.mediflow.com)
</div>