-- =====================================================================
-- SECURITY_POLICIES.sql - Políticas de Seguridad RLS
-- =====================================================================
-- Este archivo define las políticas de seguridad a nivel de fila (RLS)
-- para asegurar que los usuarios solo accedan a los datos permitidos
-- según su rol y empresa.

-- Habilitar RLS en tablas clave
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE recetas ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 1. FUNCIONES HELPER
-- =====================================================================

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS text AS $$
DECLARE
  user_role text;
BEGIN
  SELECT r.nombre INTO user_role
  FROM usuarios u
  JOIN usuarios_roles ur ON u.id = ur.usuario_id
  JOIN roles r ON ur.role_id = r.id
  WHERE u.id = auth.uid();
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener la empresa del usuario actual
CREATE OR REPLACE FUNCTION auth.get_user_empresa_id()
RETURNS uuid AS $$
DECLARE
  empresa_id uuid;
BEGIN
  SELECT u.empresa_id INTO empresa_id
  FROM usuarios u
  WHERE u.id = auth.uid();
  
  RETURN empresa_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- 2. POLÍTICAS PARA PACIENTES
-- =====================================================================

-- Super Admin: Acceso total
CREATE POLICY "Super Admin puede ver todos los pacientes"
ON pacientes FOR ALL
USING (
  auth.get_user_role() = 'super_admin'
);

-- Admin Empresa: Ver pacientes de su empresa
CREATE POLICY "Admin Empresa ve pacientes de su empresa"
ON pacientes FOR ALL
USING (
  auth.get_user_role() = 'admin_empresa' AND
  empresa_id = auth.get_user_empresa_id()
);

-- Médico: Ver pacientes de su empresa
CREATE POLICY "Médico ve pacientes de su empresa"
ON pacientes FOR SELECT
USING (
  auth.get_user_role() = 'medico' AND
  empresa_id = auth.get_user_empresa_id()
);

-- Médico: Crear/Editar pacientes de su empresa
CREATE POLICY "Médico gestiona pacientes de su empresa"
ON pacientes FOR INSERT
WITH CHECK (
  auth.get_user_role() = 'medico' AND
  empresa_id = auth.get_user_empresa_id()
);

CREATE POLICY "Médico actualiza pacientes de su empresa"
ON pacientes FOR UPDATE
USING (
  auth.get_user_role() = 'medico' AND
  empresa_id = auth.get_user_empresa_id()
);

-- Paciente: Ver solo su propio registro (vinculado por email o ID)
-- Asumiendo que la tabla pacientes tiene un campo user_id o email que coincida
CREATE POLICY "Paciente ve su propio registro"
ON pacientes FOR SELECT
USING (
  auth.get_user_role() = 'paciente' AND
  (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- =====================================================================
-- 3. POLÍTICAS PARA CITAS
-- =====================================================================

-- Super Admin: Acceso total
CREATE POLICY "Super Admin gestiona todas las citas"
ON citas FOR ALL
USING (auth.get_user_role() = 'super_admin');

-- Admin Empresa: Citas de su empresa
CREATE POLICY "Admin Empresa gestiona citas de su empresa"
ON citas FOR ALL
USING (
  auth.get_user_role() = 'admin_empresa' AND
  empresa_id = auth.get_user_empresa_id()
);

-- Médico: Ver citas donde es el médico asignado O citas de su empresa
-- (Dependiendo de la regla de negocio, a veces ven todas las de la empresa)
-- Aquí asumimos que ven todas las de la empresa para evitar conflictos de agenda
CREATE POLICY "Médico ve citas de su empresa"
ON citas FOR SELECT
USING (
  auth.get_user_role() = 'medico' AND
  empresa_id = auth.get_user_empresa_id()
);

-- Médico: Gestionar sus propias citas
CREATE POLICY "Médico gestiona sus citas asignadas"
ON citas FOR ALL
USING (
  auth.get_user_role() = 'medico' AND
  medico_id = auth.uid()
);

-- Paciente: Ver y gestionar sus propias citas
CREATE POLICY "Paciente ve sus propias citas"
ON citas FOR SELECT
USING (
  auth.get_user_role() = 'paciente' AND
  paciente_id IN (SELECT id FROM pacientes WHERE user_id = auth.uid())
);

CREATE POLICY "Paciente crea citas para sí mismo"
ON citas FOR INSERT
WITH CHECK (
  auth.get_user_role() = 'paciente' AND
  paciente_id IN (SELECT id FROM pacientes WHERE user_id = auth.uid())
);

-- =====================================================================
-- 4. POLÍTICAS PARA RECETAS
-- =====================================================================

-- Super Admin y Admin Empresa
CREATE POLICY "Admins ven todas las recetas"
ON recetas FOR ALL
USING (
  auth.get_user_role() IN ('super_admin', 'admin_empresa') AND
  (auth.get_user_role() = 'super_admin' OR empresa_id = auth.get_user_empresa_id())
);

-- Médico: Gestionar recetas que él creó
CREATE POLICY "Médico gestiona sus recetas"
ON recetas FOR ALL
USING (
  auth.get_user_role() = 'medico' AND
  medico_id = auth.uid()
);

-- Paciente: Ver sus recetas
CREATE POLICY "Paciente ve sus recetas"
ON recetas FOR SELECT
USING (
  auth.get_user_role() = 'paciente' AND
  paciente_id IN (SELECT id FROM pacientes WHERE user_id = auth.uid())
);
