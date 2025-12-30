# 🔧 Solución: Error "Acceso Denegado" al Iniciar Sesión

## 🔍 Problema Identificado

El error ocurre porque las políticas RLS (Row Level Security) de Supabase están bloqueando el acceso a las tablas necesarias para el login:

- ❌ La tabla `profiles` NO tiene políticas que permitan leer el perfil propio
- ❌ Las tablas `empresas/saas_enterprises` NO tienen políticas configuradas
- ❌ La tabla `sedes` NO tiene políticas configuradas

## ✅ Solución: Aplicar Políticas RLS Correctas

### Opción 1: Ejecutar Migración SQL en Dashboard de Supabase (RECOMENDADO)

1. **Abre el SQL Editor de Supabase:**
   - Ve a: https://supabase.com/dashboard/project/xajnfsanlijkdxevxwnx/sql/new

2. **Copia todo el contenido del archivo:**
   - Archivo: `/workspace/erp-medico-frontend/supabase/fix_rls_policies.sql`

3. **Pega el SQL en el editor y haz clic en "Run"**

4. **Verifica que se crearon las políticas:**
   ```sql
   SELECT tablename, policyname 
   FROM pg_policies 
   WHERE tablename IN ('profiles', 'empresas', 'saas_enterprises', 'sedes');
   ```

### Opción 2: Usar Supabase CLI desde Terminal

```bash
# 1. Navega al directorio del proyecto
cd /workspace/erp-medico-frontend

# 2. Vincula el proyecto (si aún no está vinculado)
supabase link --project-ref xajnfsanlijkdxevxwnx

# 3. Ejecuta la migración
supabase db push

# El CLI detectará automáticamente los archivos en supabase/migrations/
```

### Opción 3: Ejecutar SQL Directamente con psql

```bash
# Si tienes psql instalado localmente
export PGPASSWORD="tu_database_password"
psql -h aws-0-us-east-1.pooler.supabase.com \
     -p 6543 \
     -d postgres \
     -U postgres.xajnfsanlijkdxevxwnx \
     -f supabase/fix_rls_policies.sql
```

## 📋 Políticas RLS Creadas

### Para tabla `profiles`:
- ✅ Usuarios pueden ver su propio perfil
- ✅ Usuarios pueden actualizar su propio perfil (metadata, preferences)
- ✅ Super admin puede ver todos los perfiles
- ✅ Admin empresa puede ver perfiles de su empresa

### Para tabla `empresas/saas_enterprises`:
- ✅ Usuarios pueden ver su propia empresa
- ✅ Super admin puede ver todas las empresas

### Para tabla `sedes`:
- ✅ Usuarios pueden ver sedes de su empresa
- ✅ Super admin puede ver todas las sedes

## 🧪 Verificación del Fix

Después de aplicar la migración:

1. **Abre la aplicación:** https://18gm5e2c7nsq.space.minimax.io

2. **Prueba iniciar sesión con cualquier cuenta demo:**
   - Super Admin: admin@mediflow.mx / admin123
   - Médico: medico@mediflow.mx / medico123
   - Recepción: recepcion@mediflow.mx / recepcion123

3. **El login debe funcionar correctamente** sin errores de "Acceso Denegado"

## 🚨 Si Persiste el Error

Si después de aplicar la migración el error persiste, verifica:

1. **Que las políticas se crearon correctamente:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

2. **Que RLS está habilitado:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename IN ('profiles', 'empresas', 'sedes');
   ```

3. **Logs de error en Supabase:**
   - Ve a Dashboard → Database → Logs
   - Busca mensajes de error relacionados con RLS

## 📞 Soporte

Si necesitas ayuda adicional:
- Archivo de migración: `supabase/fix_rls_policies.sql`
- Documentación Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security

---

**Fecha de creación:** 2025-11-04  
**Versión:** 1.0  
**Autor:** MiniMax Agent
