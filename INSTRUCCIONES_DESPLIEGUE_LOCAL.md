# 🚀 Instrucciones de Despliegue Local - MediFlow

## ✅ Estado Actual

**Servidor:** ✅ **CORRIENDO**  
**Puerto:** 5173  
**URL Local:** http://localhost:5173  
**Proceso ID:** 5316

---

## 📍 Acceso a la Aplicación

### Opción 1: Abrir en Navegador
1. Abre tu navegador (Chrome, Firefox, Edge, etc.)
2. Ve a: **http://localhost:5173**
3. Deberías ver la aplicación MediFlow

### Opción 2: Abrir desde Terminal
```powershell
# En PowerShell
Start-Process "http://localhost:5173"
```

---

## 🔧 Comandos Útiles

### Verificar que el servidor está corriendo
```powershell
netstat -ano | findstr :5173
```

### Detener el servidor
```powershell
# Encontrar el proceso
Get-Process | Where-Object {$_.ProcessName -eq "node"}

# Detener proceso específico (reemplaza PID con el número)
Stop-Process -Id 5316
```

### Reiniciar el servidor
```powershell
cd "C:\Users\Marc XVII\Documents\GPMedical\gpl 3.5.1\GPMedical 3.5\erp-medico-frontend"
pnpm dev
```

---

## 🐛 Solución de Problemas

### El servidor no responde
1. Verifica que el proceso esté corriendo:
   ```powershell
   Get-Process | Where-Object {$_.ProcessName -eq "node"}
   ```

2. Si no está corriendo, inícialo:
   ```powershell
   cd "C:\Users\Marc XVII\Documents\GPMedical\gpl 3.5.1\GPMedical 3.5\erp-medico-frontend"
   pnpm dev
   ```

### Puerto 5173 ya está en uso
1. Encuentra qué proceso usa el puerto:
   ```powershell
   netstat -ano | findstr :5173
   ```

2. Detén el proceso o usa otro puerto:
   ```powershell
   # Usar puerto diferente
   pnpm dev --port 5174
   ```

### Errores de compilación
1. Limpia el caché:
   ```powershell
   cd "C:\Users\Marc XVII\Documents\GPMedical\gpl 3.5.1\GPMedical 3.5\erp-medico-frontend"
   Remove-Item -Recurse -Force node_modules\.vite
   pnpm dev
   ```

### Errores de dependencias
1. Reinstala dependencias:
   ```powershell
   cd "C:\Users\Marc XVII\Documents\GPMedical\gpl 3.5.1\GPMedical 3.5\erp-medico-frontend"
   pnpm install
   pnpm dev
   ```

---

## 🔐 Configuración de Variables de Entorno (Opcional)

Si quieres usar tus propias credenciales de Supabase:

1. Crea archivo `.env.local` en `erp-medico-frontend/`:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anonima
   ```

2. Reinicia el servidor:
   ```powershell
   pnpm dev
   ```

**Nota:** Si no creas el archivo, usará los valores por defecto configurados.

---

## 📊 Información del Proyecto

- **Framework:** React 18.3.1 + Vite 6.0.1
- **TypeScript:** 5.6.2
- **Package Manager:** pnpm 10.15.1
- **Backend:** Supabase
- **UI:** Tailwind CSS + shadcn/ui

---

## 🎯 Próximos Pasos

1. ✅ Servidor corriendo - **COMPLETADO**
2. Abre http://localhost:5173 en tu navegador
3. Prueba el login (usa credenciales demo si están configuradas)
4. Explora los módulos disponibles

---

## 📝 Notas

- El servidor se recarga automáticamente cuando cambias archivos (Hot Module Replacement)
- Los cambios se reflejan instantáneamente en el navegador
- Para detener el servidor, presiona `Ctrl+C` en la terminal donde está corriendo

---

**Última actualización:** 2025-01-07  
**Estado:** ✅ Servidor funcionando correctamente

