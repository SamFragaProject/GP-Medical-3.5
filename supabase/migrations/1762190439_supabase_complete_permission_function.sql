-- Migration: supabase_complete_permission_function
-- Created at: 1762190439

-- =============================================================================
-- FUNCIÓN COMPLETA DE PERMISOS
-- =============================================================================

-- Función completa para verificar permisos
CREATE OR REPLACE FUNCTION has_permission(
  resource_param text,
  action_param text,
  empresa_param uuid,
  sede_param uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios_perfil up
    JOIN usuarios_roles ur ON up.id = ur.usuario_id
    JOIN roles r ON ur.role_id = r.id
    WHERE up.user_id = current_user_id()
    AND up.empresa_id = empresa_param
    AND (sede_param IS NULL OR up.sede_id = sede_param)
    AND (
      r.nombre = 'admin' OR
      EXISTS (
        SELECT 1 FROM user_menu_permissions ump 
        WHERE ump.role_id = r.id 
        AND ump.allowed = true
        AND (ump.resource = resource_param OR ump.resource = '*')
        AND (ump.action = action_param OR ump.action = '*')
      )
    )
  );
$$;

-- =============================================================================
-- COMENTARIOS FINALES
-- =============================================================================

COMMENT ON FUNCTION current_user_id() IS 'Obtiene el ID del usuario actual autenticado';
COMMENT ON FUNCTION jwt_claims() IS 'Obtiene los claims del JWT actual';
COMMENT ON FUNCTION current_empresa_id() IS 'Obtiene el ID de la empresa del contexto actual';
COMMENT ON FUNCTION current_sede_id() IS 'Obtiene el ID de la sede del contexto actual';
COMMENT ON FUNCTION is_admin(uuid, uuid) IS 'Verifica si el usuario es admin de la empresa/sede especificada';
COMMENT ON FUNCTION has_permission(text, text, uuid, uuid) IS 'Verifica si el usuario tiene permiso para realizar una acción';

-- Migración multi-tenant completada exitosamente
SELECT '✅ Migración multi-tenant COMPLETADA exitosamente' as status, now() as timestamp;;