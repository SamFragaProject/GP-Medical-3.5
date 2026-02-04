-- ====================================================================
-- RLS POLICIES FOR GPMedical RBAC SYSTEM
-- ====================================================================
-- This script implements server-side security synchronized with the 
-- dynamic permission system. Run this in your Supabase SQL Editor.

-- 1. Helper Function to check module permissions
CREATE OR REPLACE FUNCTION public.check_module_permission(p_modulo_codigo TEXT, p_accion TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_perm BOOLEAN;
BEGIN
    -- Bypass: Super Admins can do anything
    IF EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() 
          AND r.nombre = 'super_admin' 
          AND ur.activo = true
    ) THEN
        RETURN TRUE;
    END IF;

    -- Dynamic check: lookup permission in permissions tables based on auth.uid()
    SELECT 
        CASE 
            WHEN p_accion = 'ver' THEN rmp.puede_ver
            WHEN p_accion = 'crear' THEN rmp.puede_crear
            WHEN p_accion = 'editar' THEN rmp.puede_editar
            WHEN p_accion = 'borrar' THEN rmp.puede_borrar
            WHEN p_accion = 'exportar' THEN rmp.puede_exportar
            WHEN p_accion = 'aprobar' THEN rmp.puede_aprobar
            WHEN p_accion = 'firmar' THEN rmp.puede_firmar
            WHEN p_accion = 'imprimir' THEN rmp.puede_imprimir
            ELSE FALSE
        END INTO v_has_perm
    FROM public.user_roles ur
    JOIN public.rol_modulo_permisos rmp ON ur.role_id = rmp.rol_id
    JOIN public.modulos_sistema ms ON rmp.modulo_id = ms.id
    WHERE ur.user_id = auth.uid() 
      AND ms.codigo = p_modulo_codigo
      AND ur.activo = true;

    RETURN COALESCE(v_has_perm, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Apply RLS to Core Tables

-- PACIENTES
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pacientes - Ver" ON public.pacientes 
    FOR SELECT TO authenticated USING (check_module_permission('pacientes', 'ver'));

CREATE POLICY "Pacientes - Crear" ON public.pacientes 
    FOR INSERT TO authenticated WITH CHECK (check_module_permission('pacientes', 'crear'));

CREATE POLICY "Pacientes - Editar" ON public.pacientes 
    FOR UPDATE TO authenticated USING (check_module_permission('pacientes', 'editar'));

CREATE POLICY "Pacientes - Borrar" ON public.pacientes 
    FOR DELETE TO authenticated USING (check_module_permission('pacientes', 'borrar'));


-- CITAS (AGENDA)
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Citas - Ver" ON public.citas 
    FOR SELECT TO authenticated USING (check_module_permission('citas', 'ver'));

CREATE POLICY "Citas - Crear" ON public.citas 
    FOR INSERT TO authenticated WITH CHECK (check_module_permission('citas', 'crear'));

CREATE POLICY "Citas - Editar" ON public.citas 
    FOR UPDATE TO authenticated USING (check_module_permission('citas', 'editar'));

CREATE POLICY "Citas - Borrar" ON public.citas 
    FOR DELETE TO authenticated USING (check_module_permission('citas', 'borrar'));


-- EXAMENES
ALTER TABLE public.examenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Examenes - Ver" ON public.examenes 
    FOR SELECT TO authenticated USING (check_module_permission('examenes', 'ver'));

CREATE POLICY "Examenes - Crear" ON public.examenes 
    FOR INSERT TO authenticated WITH CHECK (check_module_permission('examenes', 'crear'));

CREATE POLICY "Examenes - Editar" ON public.examenes 
    FOR UPDATE TO authenticated USING (check_module_permission('examenes', 'editar'));

CREATE POLICY "Examenes - Borrar" ON public.examenes 
    FOR DELETE TO authenticated USING (check_module_permission('examenes', 'borrar'));


-- 3. Notify
COMMENT ON FUNCTION public.check_module_permission IS 'Helper for GPMedical dynamic RBAC system.';
