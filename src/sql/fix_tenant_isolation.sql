-- ====================================================================
-- FIX: TENANT ISOLATION ENFORCEMENT
-- ====================================================================
-- Applies strict "empresa_id" checks to all existing RLS policies.

-- 1. Helper function for Tenant Check
CREATE OR REPLACE FUNCTION public.check_tenant_access(p_empresa_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Super Admin bypass
    IF EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() 
          AND r.nombre = 'super_admin' 
          AND ur.activo = true
    ) THEN
        RETURN TRUE;
    END IF;

    -- Check if user belongs to the target empresa
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND empresa_id = p_empresa_id
          AND activo = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Update Policies (Drop old ones first to be safe or use CREATE OR REPLACE logic if supported for policies)
-- Note: PostgreSQL doesn't support "CREATE OR REPLACE POLICY", so we drop and recreate.

-- === PACIENTES ===
DROP POLICY IF EXISTS "Pacientes - Ver" ON public.pacientes;
CREATE POLICY "Pacientes - Ver" ON public.pacientes 
    FOR SELECT TO authenticated 
    USING (
        check_module_permission('pacientes', 'ver') 
        AND check_tenant_access(empresa_id)
    );

DROP POLICY IF EXISTS "Pacientes - Crear" ON public.pacientes;
CREATE POLICY "Pacientes - Crear" ON public.pacientes 
    FOR INSERT TO authenticated 
    WITH CHECK (
        check_module_permission('pacientes', 'crear') 
        AND check_tenant_access(empresa_id)
    );

DROP POLICY IF EXISTS "Pacientes - Editar" ON public.pacientes;
CREATE POLICY "Pacientes - Editar" ON public.pacientes 
    FOR UPDATE TO authenticated 
    USING (
        check_module_permission('pacientes', 'editar') 
        AND check_tenant_access(empresa_id)
    );

DROP POLICY IF EXISTS "Pacientes - Borrar" ON public.pacientes;
CREATE POLICY "Pacientes - Borrar" ON public.pacientes 
    FOR DELETE TO authenticated 
    USING (
        check_module_permission('pacientes', 'borrar') 
        AND check_tenant_access(empresa_id)
    );


-- === CITAS ===
DROP POLICY IF EXISTS "Citas - Ver" ON public.citas;
CREATE POLICY "Citas - Ver" ON public.citas 
    FOR SELECT TO authenticated 
    USING (
        check_module_permission('citas', 'ver') 
        AND check_tenant_access(empresa_id)
    );

DROP POLICY IF EXISTS "Citas - Crear" ON public.citas;
CREATE POLICY "Citas - Crear" ON public.citas 
    FOR INSERT TO authenticated 
    WITH CHECK (
        check_module_permission('citas', 'crear') 
        AND check_tenant_access(empresa_id)
    );

DROP POLICY IF EXISTS "Citas - Editar" ON public.citas;
CREATE POLICY "Citas - Editar" ON public.citas 
    FOR UPDATE TO authenticated 
    USING (
        check_module_permission('citas', 'editar') 
        AND check_tenant_access(empresa_id)
    );

DROP POLICY IF EXISTS "Citas - Borrar" ON public.citas;
CREATE POLICY "Citas - Borrar" ON public.citas 
    FOR DELETE TO authenticated 
    USING (
        check_module_permission('citas', 'borrar') 
        AND check_tenant_access(empresa_id)
    );


-- === EXAMENES ===
DROP POLICY IF EXISTS "Examenes - Ver" ON public.examenes;
CREATE POLICY "Examenes - Ver" ON public.examenes 
    FOR SELECT TO authenticated 
    USING (
        check_module_permission('examenes', 'ver') 
        AND check_tenant_access(empresa_id)
    );

DROP POLICY IF EXISTS "Examenes - Crear" ON public.examenes;
CREATE POLICY "Examenes - Crear" ON public.examenes 
    FOR INSERT TO authenticated 
    WITH CHECK (
        check_module_permission('examenes', 'crear') 
        AND check_tenant_access(empresa_id)
    );

DROP POLICY IF EXISTS "Examenes - Editar" ON public.examenes;
CREATE POLICY "Examenes - Editar" ON public.examenes 
    FOR UPDATE TO authenticated 
    USING (
        check_module_permission('examenes', 'editar') 
        AND check_tenant_access(empresa_id)
    );

DROP POLICY IF EXISTS "Examenes - Borrar" ON public.examenes;
CREATE POLICY "Examenes - Borrar" ON public.examenes 
    FOR DELETE TO authenticated 
    USING (
        check_module_permission('examenes', 'borrar') 
        AND check_tenant_access(empresa_id)
    );

SELECT 'Políticas de aislamiento por tenant aplicadas correctamente.' as result;
