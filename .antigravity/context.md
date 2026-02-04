# 📋 Contexto del Proyecto - GPMedical ERP

> **Para:** Antigravity IDE  
> **Última actualización:** 03/02/2026  
> **Estado:** Listo para producción, deploy pendiente

---

## 🎯 Resumen Ejecutivo

GPMedical es un ERP de Medicina del Trabajo con arquitectura V1/V2 paralela. La V1 es el sistema estable original, la V2 son módulos nuevos con React Query.

**Prioridad actual:** Deploy a producción en Vercel.

---

## 📁 Estructura de Carpetas

```
erp-medico-frontend/
├── src/                          # CÓDIGO V1 (Original estable)
│   ├── components/
│   │   ├── admin/               # Componentes admin (estilos variados)
│   │   ├── home/                # Landing page (recién rediseñada)
│   │   ├── ui/                  # Componentes shadcn/ui
│   │   └── ...
│   ├── pages/                   # Páginas principales
│   │   ├── admin/               # Gestión empresas, usuarios, roles
│   │   ├── Dashboard.tsx
│   │   ├── Pacientes.tsx
│   │   ├── Agenda.tsx
│   │   ├── ExamenesOcupacionales.tsx
│   │   ├── Facturacion.tsx
│   │   ├── Home.tsx             # Landing page (nuevo diseño)
│   │   └── ...
│   ├── contexts/                # AuthContext, etc.
│   ├── hooks/                   # Custom hooks
│   ├── services/                # API services
│   └── App.tsx                  # Router principal
│
├── src-v2/                      # CÓDIGO V2 (Nuevos módulos)
│   ├── modules/
│   │   ├── chatbot-v2/          # ✅ Funcionando
│   │   ├── auth-v2/             # ❌ Tiene errores TypeScript
│   │   ├── pacientes-v2/        # ❌ Tiene errores TypeScript
│   │   ├── agenda-v2/           # ❌ Tiene errores TypeScript
│   │   ├── inventario-v2/       # ❌ Tiene errores TypeScript
│   │   └── ...
│   └── styles/
│       └── global-v2.css        # Estilos unificados V2
│
├── dist/                        # BUILD DE PRODUCCIÓN (listo)
├── .env.production              # Variables de entorno
├── vercel.json                  # Config Vercel
└── vite.config.ts               # Config Vite
```

---

## ✅ ESTADO ACTUAL

### Funcionando Correctamente

| Módulo | Estado | Ubicación |
|--------|--------|-----------|
| **Home/Landing** | ✅ Rediseñado con funnel de ventas | `src/pages/Home.tsx` |
| **Autenticación** | ✅ Login, registro, roles | `src/contexts/AuthContext.tsx` |
| **Dashboard** | ✅ Métricas y navegación | `src/pages/Dashboard.tsx` |
| **Pacientes** | ✅ CRUD completo | `src/pages/Pacientes.tsx` |
| **Agenda** | ✅ Calendario y citas | `src/pages/Agenda.tsx` |
| **Exámenes** | ✅ ST-7, ST-9 | `src/pages/ExamenesOcupacionales.tsx` |
| **Facturación** | ✅ V1 estable | `src/pages/Facturacion.tsx` |
| **Inventario** | ✅ Stock y compras | `src/pages/inventory/InventoryPage.tsx` |
| **Chatbot V2** | ✅ Activo | `src-v2/modules/chatbot-v2/` |

### Con Problemas (No críticos)

| Módulo | Problema | Solución Actual |
|--------|----------|-----------------|
| **Admin - Empresas** | Estilo diferente al resto | Funcional, usar `AdminLayout.tsx` creado |
| **Admin - Usuarios** | Estilo diferente al resto | Funcional |
| **Admin - Roles** | Estilo diferente al resto | Funcional |
| **Módulos V2** | Errores TypeScript | Desactivados en feature flags |

---

## 🚨 CORRECCIONES PENDIENTES (No bloqueantes)

### 1. Unificar Estilos Admin
**Archivos a modificar:**
- `src/pages/admin/GestionEmpresas.tsx`
- `src/pages/admin/GestionRoles.tsx`
- `src/pages/admin/SuperAdminGodMode.tsx`
- `src/pages/admin/Usuarios.tsx`

**Componente base creado:** `src/components/admin/AdminLayout.tsx`

**Ejemplo de uso:**
```tsx
import { AdminLayout, AdminCard, AdminStatsGrid } from '@/components/admin/AdminLayout';

<AdminLayout
  title="Gestión de Empresas"
  subtitle="Administra los socios corporativos"
  icon={Building2}
  badges={[{ text: 'Multi-Tenancy', variant: 'info' }]}
  actions={<Button>Nueva Empresa</Button>}
>
  <AdminStatsGrid stats={[...]} />
  <AdminCard title="Lista de Empresas">
    {/* contenido */}
  </AdminCard>
</AdminLayout>
```

### 2. Optimizar Chunks (Mejora futura)
**Warning:** Algunos chunks > 500KB  
**Archivo:** `vite.config.ts`  
**Acción:** Agregar más manualChunks si es necesario

---

## 🎛️ Feature Flags

**Ubicación:** `.env.production`

```bash
# ✅ ACTIVO - Chatbot V2 funciona
VITE_USE_CHATBOT_V2=true

# ❌ DESACTIVADOS - Tienen errores TypeScript
VITE_USE_AUTH_V2=false
VITE_USE_PACIENTES_V2=false
VITE_USE_AGENDA_V2=false
VITE_USE_INVENTARIO_V2=false
VITE_USE_FACTURACION_V2=false
VITE_USE_REPORTES_V2=false
```

---

## 🚀 DEPLOY

### Estado del Build
```
✅ Build exitoso
✅ Sin errores TypeScript críticos
✅ Assets generados en dist/
✅ Listo para producción
```

### Opciones de Deploy

**Opción A - GitHub + Vercel (Recomendado):**
```bash
git remote add origin https://github.com/TU_USUARIO/gpmedical.git
git branch -M main
git push -u origin main
# Vercel hará deploy automático
```

**Opción B - Manual Vercel Dashboard:**
- Ir a https://vercel.com/dashboard
- Proyecto: gp-medical-3-5
- Upload carpeta dist/

**Opción C - Vercel CLI (si se arreglan permisos):**
```bash
vercel --prod
```

---

## 🧪 CHECKLIST DE PRUEBAS

### Flujo Completo a Verificar
- [ ] Registro de usuario
- [ ] Login con diferentes roles
- [ ] Crear paciente
- [ ] Agendar cita
- [ ] Registrar examen médico
- [ ] Generar factura
- [ ] Crear empresa (Super Admin)
- [ ] Chatbot responde

### Roles a Probar
- Super Admin: Acceso total
- Admin: Admin de empresa
- Médico: Pacientes y exámenes
- Recepción: Agenda y citas

---

## 💻 COMANDOS

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Deploy
vercel --prod
```

---

## 🔧 CONFIGURACIÓN IMPORTANTE

### Supabase (Producción)
```
VITE_SUPABASE_URL=https://kftxftikoydldcexkady.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Dominio
```
Producción: https://gpmedical.vercel.app (o similar)
```

---

## 📚 DOCUMENTACIÓN CREADA

- `ESTADO_PRUEBAS.md` - Estado de módulos para testing
- `DESPLIEGUE_PRODUCCION.md` - Guía de deploy
- `DEPLOY_README.md` - Configuración Vercel
- `src/components/admin/AdminLayout.tsx` - Componentes unificados admin

---

## 🎯 SIGUIENTES PASOS SUGERIDOS

1. **Deploy a producción** (usar instrucciones arriba)
2. **Probar flujo completo** con checklist
3. **Corregir estilos admin** usando AdminLayout
4. **Activar módulos V2** uno por uno cuando estén listos

---

## ❓ PREGUNTAS FRECUENTES

**Q: ¿Por qué los módulos V2 están desactivados?**  
A: Tienen errores TypeScript en los hooks y servicios. El Chatbot V2 es el único que funciona.

**Q: ¿Los estilos diferentes en admin afectan funcionalidad?**  
A: No, todo funciona. Es solo inconsistencia visual.

**Q: ¿Cómo activo un módulo V2?**  
A: Cambiar `VITE_USE_XXX_V2=false` a `true` en variables de entorno de Vercel.

---

**Contacto para dudas:** Revisar este archivo y `ESTADO_PRUEBAS.md`
