-- =====================================================
-- FIX: Políticas RLS para permitir login correcto
-- =====================================================
-- Problema: Los usuarios no pueden leer su propio perfil después del login
-- Solución: Agregar políticas que permitan acceso a datos propios

-- 1. POLÍTICAS PARA TABLA PROFILES
-- =====================================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON profiles;
DROP POLICY IF EXISTS "Super admin puede ver todos los perfiles" ON profiles;

-- Política: Los usuarios pueden ver su propio perfil
CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Política: Los usuarios pueden actualizar su propio perfil (metadata, preferences)
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política: Super admin puede ver todos los perfiles
CREATE POLICY "Super admin puede ver todos los perfiles"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND hierarchy = 'super_admin'
    )
  );

-- Política: Admin empresa puede ver perfiles de su empresa
CREATE POLICY "Admin empresa puede ver perfiles de su empresa"
  ON profiles FOR SELECT
  USING (
    empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.hierarchy IN ('super_admin', 'admin_empresa')
    )
  );

-- 2. POLÍTICAS PARA TABLA EMPRESAS (saas_enterprises)
-- =====================================================

-- Verificar si la tabla existe con el nombre correcto
DO $$ 
BEGIN
  -- Habilitar RLS si no está habilitado
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'empresas') THEN
    ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
    
    -- Eliminar políticas existentes
    DROP POLICY IF EXISTS "Usuarios pueden ver su empresa" ON empresas;
    DROP POLICY IF EXISTS "Super admin puede ver todas las empresas" ON empresas;
    
    -- Política: Los usuarios pueden ver su propia empresa
    EXECUTE 'CREATE POLICY "Usuarios pueden ver su empresa"
      ON empresas FOR SELECT
      USING (
        id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
      )';
    
    -- Política: Super admin puede ver todas las empresas
    EXECUTE 'CREATE POLICY "Super admin puede ver todas las empresas"
      ON empresas FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid()
          AND hierarchy = ''super_admin''
        )
      )';
  END IF;
  
  -- También para saas_enterprises si existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'saas_enterprises') THEN
    ALTER TABLE saas_enterprises ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Usuarios pueden ver su empresa" ON saas_enterprises;
    DROP POLICY IF EXISTS "Super admin puede ver todas las empresas" ON saas_enterprises;
    
    EXECUTE 'CREATE POLICY "Usuarios pueden ver su empresa"
      ON saas_enterprises FOR SELECT
      USING (
        id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
      )';
    
    EXECUTE 'CREATE POLICY "Super admin puede ver todas las empresas"
      ON saas_enterprises FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid()
          AND hierarchy = ''super_admin''
        )
      )';
  END IF;
END $$;

-- 3. POLÍTICAS PARA TABLA SEDES
-- =====================================================

-- Habilitar RLS si no está habilitado
ALTER TABLE sedes ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Usuarios pueden ver sedes de su empresa" ON sedes;
DROP POLICY IF EXISTS "Usuarios pueden ver su sede" ON sedes;
DROP POLICY IF EXISTS "Super admin puede ver todas las sedes" ON sedes;

-- Política: Los usuarios pueden ver sedes de su empresa
CREATE POLICY "Usuarios pueden ver sedes de su empresa"
  ON sedes FOR SELECT
  USING (
    empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
  );

-- Política: Super admin puede ver todas las sedes
CREATE POLICY "Super admin puede ver todas las sedes"
  ON sedes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND hierarchy = 'super_admin'
    )
  );

-- 4. VERIFICACIÓN DE POLÍTICAS
-- =====================================================

-- Ver todas las políticas creadas para profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('profiles', 'empresas', 'saas_enterprises', 'sedes')
ORDER BY tablename, policyname;

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================
