# 🚀 GPMedical - Guía de Despliegue Vercel

## ✅ Estado: LISTO PARA PRODUCCIÓN

### Archivos de Configuración Creados

| Archivo | Descripción |
|---------|-------------|
| `.env.production` | Variables de entorno para producción |
| `vercel.json` | Configuración de Vercel |
| `vite.config.ts` | Configuración de Vite optimizada |

---

## 📋 Instrucciones de Despliegue

### 1. Preparar el Proyecto

```bash
cd erp-medico-frontend
```

### 2. Instalar Vercel CLI (si no lo tienes)

```bash
npm i -g vercel
```

### 3. Login en Vercel

```bash
vercel login
```

### 4. Desplegar

```bash
vercel --prod
```

---

## ⚙️ Configuración en Dashboard de Vercel

### Variables de Entorno (Añadir en Vercel Dashboard)

Ve a tu proyecto → Settings → Environment Variables y añade:

```
VITE_SUPABASE_URL=https://kftxftikoydldcexkady.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_NAME=MediFlow
VITE_APP_VERSION=3.5.2
VITE_USE_CHATBOT_V2=true
VITE_USE_AUTH_V2=false
VITE_USE_PACIENTES_V2=false
VITE_USE_AGENDA_V2=false
VITE_USE_INVENTARIO_V2=false
VITE_USE_FACTURACION_V2=false
VITE_USE_REPORTES_V2=false
NODE_ENV=production
```

---

## 🎛️ Feature Flags Activas

| Módulo | Estado | Notas |
|--------|--------|-------|
| Chatbot V2 | ✅ **ACTIVO** | Funcionando en producción |
| Auth V2 | ❌ Desactivado | Usar V1 estable |
| Pacientes V2 | ❌ Desactivado | Usar V1 estable |
| Agenda V2 | ❌ Desactivado | Usar V1 estable |
| Inventario V2 | ❌ Desactivado | Usar V1 estable |
| Facturación V2 | ❌ Desactivado | Usar V1 estable |
| Reportes V2 | ❌ Desactivado | Usar V1 estable |

---

## 🔧 Comandos Útiles

```bash
# Desarrollo local
pnpm dev

# Build de producción local
pnpm build

# Preview del build
pnpm preview

# Despliegue en Vercel
vercel --prod
```

---

## 📁 Estructura del Build

```
dist/
├── index.html                 # Entry point
├── assets/
│   ├── index-xxx.js          # Bundle principal (3.7 MB)
│   ├── vendor-xxx.js         # React/React-DOM (164 KB)
│   ├── ui-xxx.js             # Componentes UI (96 KB)
│   ├── charts-xxx.js         # Gráficas (453 KB)
│   ├── ChatbotWidget-xxx.js  # Chatbot V2 (4 KB)
│   └── *.css                 # Estilos
```

---

## ⚠️ Notas Importantes

1. **Chatbot V2** es el único módulo V2 activo - está probado y funciona correctamente
2. **Todos los demás módulos** usan la versión V1 original (estable)
3. Para activar más módulos V2, cambiar `VITE_USE_*_V2=false` a `true` en las variables de entorno
4. El build incluye sourcemaps para debugging en producción

---

## 🆘 Troubleshooting

### Error: "Cannot find module"
```bash
# Limpiar caché y reinstalar
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Error: "Build failed"
```bash
# Verificar TypeScript
npx tsc --noEmit

# Verificar build local
pnpm build
```

### Error: "Environment variables not found"
- Asegúrate de que todas las variables estén configuradas en el dashboard de Vercel
- Las variables deben empezar con `VITE_` para ser accesibles en el frontend

---

## 📞 Soporte

Si hay problemas en el despliegue:
1. Revisar logs en Vercel Dashboard → Deployments
2. Verificar que todas las variables de entorno estén configuradas
3. Probar build local con `pnpm build`

---

**Última actualización:** 2026-02-03  
**Versión:** 3.5.2  
**Entorno:** Producción ✅
