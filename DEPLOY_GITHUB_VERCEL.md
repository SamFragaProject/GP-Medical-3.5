# 🚀 Deploy a Vercel vía GitHub

## Paso 1: Crear Repositorio en GitHub

1. Ir a https://github.com/new
2. Nombre: `gpmedical-erp`
3. Descripción: "ERP de Medicina del Trabajo - GPMedical"
4. Público o Privado (tu elección)
5. Click en **Create repository**

## Paso 2: Conectar tu código local

En tu terminal, ejecuta:

```bash
cd erp-medico-frontend

# Agregar remote de GitHub
git remote add origin https://github.com/TU_USUARIO/gpmedical-erp.git

# Renombrar rama principal
git branch -M main

# Subir todo el código
git push -u origin main
```

## Paso 3: Conectar en Vercel

1. Ir a https://vercel.com/new
2. Click en **Import Git Repository**
3. Busca y selecciona `gpmedical-erp`
4. Configurar:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (dejar así)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. Click en **Deploy**

## Paso 4: Variables de Entorno

En el dashboard de Vercel, ir a:
- Settings → Environment Variables

Agregar todas estas:

```
VITE_SUPABASE_URL=https://kftxftikoydldcexkady.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdHhmdGlrb3lkbGRjZXhrYWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2OTU2OTMsImV4cCI6MjA4MjI3MTY5M30.UvxYrETiFNil2eNKzJCVcgwOd-MCDBHABlql650y1NU
VITE_USE_CHATBOT_V2=true
VITE_USE_AUTH_V2=false
VITE_USE_PACIENTES_V2=false
VITE_USE_AGENDA_V2=false
VITE_USE_INVENTARIO_V2=false
VITE_USE_FACTURACION_V2=false
VITE_USE_REPORTES_V2=false
VITE_APP_NAME=MediFlow
VITE_APP_VERSION=3.5.2
```

## Paso 5: Redeploy

Vercel hará deploy automático cada vez que hagas `git push`.

Para forzar redeploy manual:
- Ir a Vercel Dashboard
- Seleccionar proyecto
- Tab **Deployments**
- Click **Redeploy** en el último

## URL de Producción

Una vez deployado, tu app estará en:
```
https://gpmedical-erp.vercel.app
```

(o similar, dependiendo del nombre que elijas)

---

## Comandos Útiles

```bash
# Verificar estado
git status

# Hacer cambios y subir
git add -A
git commit -m "Descripción del cambio"
git push origin main

# Vercel detecta automáticamente y hace deploy
```

---

**¿Tienes cuenta de GitHub? ¿Necesitas que te guíe paso a paso?**
