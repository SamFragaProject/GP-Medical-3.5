-- Migration: supabase_permission_function_corrected
-- Created at: 1762190457

-- =============================================================================
-- FUNCIÓN DE PERMISOS CORREGIDA
-- =============================================================================

-- Función corregida para verificar permisos usando la estructura real de user_menu_permissions
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
        AND (
          ump.table_name = resource_param OR 
          ump.permission_name = resource_param OR
          ump.permission_name = '*' OR
          ump.table_name IS NULL
        )
        AND (
          ump.operation = action_param OR 
          ump.operation = '*' OR
          ump.operation IS NULL
        )
      )
    )
  );
$$;

-- Función para verificar permisos de menú específicos
CREATE OR REPLACE FUNCTION has_menu_permission(
  menu_path_param text,
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
        AND ump.menu_path = menu_path_param
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
COMMENT ON FUNCTION has_permission(text, text, uuid, uuid) IS 'Verifica si el usuario tiene permiso para realizar una acción en un recurso específico';
COMMENT ON FUNCTION has_menu_permission(text, uuid, uuid) IS 'Verifica si el usuario tiene permiso para acceder a una ruta de menú específica';

-- Función de utilidad para obtener datos del contexto del usuario
CREATE OR REPLACE FUNCTION get_user_context()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT json_build_object(
    'user_id', current_user_id(),
    'empresa_id', current_empresa_id(),
    'sede_id', current_sede_id(),
    'claims', jwt_claims()
  );
$$;

COMMENT ON FUNCTION get_user_context() IS 'Obtiene el contexto completo del usuario actual';

-- Migración multi-tenant COMPLETADA exitosamente
SELECT '✅ Migración multi-tenant COMPLETADA exitosamente' as status, now() as timestamp;;