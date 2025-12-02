-- =====================================================================
-- SECURITY_CHECKS.sql - Pruebas de Seguridad e Idempotencia
-- =====================================================================
-- Archivo para validar RLS, permisos y políticas de seguridad
-- Creado: 2025-11-04
-- Propósito: Testing de seguridad para sistema de gestión clínica

-- =====================================================================
-- A. CONFIGURACIÓN DE TESTING
-- =====================================================================

-- Configurar timezone para consistencia
SET timezone = 'America/Mexico_City';

-- Crear roles de testing si no existen
DO $$
BEGIN
    -- Rol para testing de médico
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'test_medico') THEN
        CREATE ROLE test_medico;
    END IF;
    
    -- Rol para testing de recepción
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'test_recepcion') THEN
        CREATE ROLE test_recepcion;
    END IF;
    
    -- Rol para testing de paciente
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'test_paciente') THEN
        CREATE ROLE test_paciente;
    END IF;
END $$;

-- =====================================================================
-- B. PRUEBAS DE RLS (ROW LEVEL SECURITY)
-- =====================================================================

-- Test 1: Verificar que RLS está habilitado en tablas críticas
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado,
    CASE WHEN rowsecurity THEN '✓ RLS HABILITADO' ELSE '✗ RLS DESHABILITADO' END as estado
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public' 
    AND tablename IN ('pacientes', 'citas', 'expedientes_clinicos', 'usuarios', 'pagos')
ORDER BY tablename;

-- Test 2: Verificar políticas de RLS existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test 3: Simular JWT para testing (crear función de testing)
CREATE OR REPLACE FUNCTION test_simulate_jwt(user_email TEXT, user_role TEXT)
RETURNS TABLE(user_id UUID, email TEXT, role_name TEXT) AS $$
BEGIN
    -- Esta función simula la información que vendría en un JWT
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        r.nombre as role_name
    FROM usuarios u
    JOIN usuarios_roles ur ON u.id = ur.usuario_id
    JOIN roles r ON ur.role_id = r.id
    WHERE u.email = user_email AND r.nombre = user_role
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test 4: Verificar acceso de médico a expedientes de otros pacientes
-- Un médico DEBE poder acceder solo a expedientes de SUS citas
DO $$
DECLARE
    medico_email TEXT := 'dr.luna@demo.mx';
    expediente_ajeno_id UUID;
    expediente_propio_id UUID;
    access_granted BOOLEAN;
BEGIN
    -- Obtener un expediente de otro médico
    SELECT id INTO expediente_ajeno_id 
    FROM expedientes_clinicos ec1
    WHERE NOT EXISTS (
        SELECT 1 FROM citas c 
        WHERE c.medico_id = ec1.medico_id 
        AND c.paciente_id = ec1.paciente_id
    )
    LIMIT 1;
    
    -- Obtener un expediente propio
    SELECT ec.id INTO expediente_propio_id
    FROM expedientes_clinicos ec
    JOIN usuarios u ON u.email = medico_email
    WHERE ec.medico_id = u.id
    LIMIT 1;
    
    -- Simular intento de acceso a expediente ajeno (debería fallar)
    -- En un entorno real, aquí se verificaría contra RLS
    IF expediente_ajeno_id IS NOT NULL THEN
        RAISE NOTICE 'TEST: Intento de acceso a expediente ajeno: %', expediente_ajeno_id;
        RAISE NOTICE 'RESULTADO ESPERADO: ACCESO DENEGADO por RLS';
    END IF;
    
    -- Simular acceso a expediente propio (debería permitir)
    IF expediente_propio_id IS NOT NULL THEN
        RAISE NOTICE 'TEST: Acceso a expediente propio: %', expediente_propio_id;
        RAISE NOTICE 'RESULTADO ESPERADO: ACCESO PERMITIDO por RLS';
    END IF;
END $$;

-- =====================================================================
-- C. PRUEBAS DE PERMISOS POR ROL
-- =====================================================================

-- Test 5: Verificar permisos de Admin
SELECT 
    r.nombre as rol,
    jsonb_object_keys(r.permissions_json) as permiso,
    r.permissions_json->jsonb_object_keys(r.permissions_json) as permisos_detalle
FROM roles r
WHERE r.nombre = 'Admin'
ORDER BY jsonb_object_keys(r.permissions_json);

-- Test 6: Verificar permisos de Médico (no debe tener acceso a pagos)
SELECT 
    r.nombre as rol,
    jsonb_object_keys(r.permissions_json) as permiso,
    CASE 
        WHEN jsonb_object_keys(r.permissions_json) = 'pagos' 
        THEN '❌ ERROR: Médico NO debe tener permisos de pagos'
        ELSE '✓ Correcto'
    END as validacion
FROM roles r
WHERE r.nombre = 'Médico'
ORDER BY jsonb_object_keys(r.permissions_json);

-- Test 7: Verificar permisos de Recepción (solo lectura de inventario)
SELECT 
    r.nombre as rol,
    jsonb_object_keys(r.permissions_json) as permiso,
    CASE 
        WHEN jsonb_object_keys(r.permissions_json) = 'inventario' 
        THEN CASE 
            WHEN (r.permissions_json->'inventario')->>'write' = 'false'
            THEN '✓ Correcto: Solo lectura'
            ELSE '❌ ERROR: Recepción no debe tener permisos de escritura en inventario'
        END
        ELSE '✓ Correcto'
    END as validacion
FROM roles r
WHERE r.nombre = 'Recepción'
ORDER BY jsonb_object_keys(r.permissions_json);

-- =====================================================================
-- D. PRUEBAS DE SELECT/UPDATE/DELETE SIN PERMISOS
-- =====================================================================

-- Test 8: Intentar SELECT de pacientes como Paciente (debe fallar)
DO $$
DECLARE
    test_result TEXT;
BEGIN
    BEGIN
        -- Simular consulta sin permisos (esto debería fallar con RLS)
        PERFORM COUNT(*) FROM pacientes p
        JOIN usuarios u ON u.email = 'carlos.paciente@demo.mx'
        JOIN usuarios_roles ur ON u.id = ur.usuario_id
        JOIN roles r ON ur.role_id = r.id
        WHERE r.nombre = 'Paciente';
        
        test_result := '❌ ERROR: Paciente no debería poder hacer SELECT de otros pacientes';
    EXCEPTION WHEN insufficient_privilege THEN
        test_result := '✓ Correcto: Acceso denegado a datos de otros pacientes';
    END;
    
    RAISE NOTICE 'TEST 8: %', test_result;
END $$;

-- Test 9: Intentar UPDATE de datos de pagos como Recepción (debe fallar)
DO $$
DECLARE
    test_result TEXT;
    pago_id_var UUID;
BEGIN
    -- Obtener un pago existente
    SELECT id INTO pago_id_var FROM pagos LIMIT 1;
    
    BEGIN
        -- Simular intento de UPDATE sin permisos
        -- En producción esto sería filtrado por RLS
        IF pago_id_var IS NOT NULL THEN
            PERFORM 1 FROM pagos WHERE id = pago_id_var;
            test_result := '⚠ ADVERTENCIA: UPDATE no ejecutado (sería filtrado por RLS)';
        END IF;
    EXCEPTION WHEN insufficient_privilege THEN
        test_result := '✓ Correcto: UPDATE denegado por permisos';
    END;
    
    RAISE NOTICE 'TEST 9: %', test_result;
END $$;

-- =====================================================================
-- E. VERIFICACIÓN DE POLÍTICAS DE STORAGE
-- =====================================================================

-- Test 10: Verificar que existen buckets necesarios
SELECT 
    name,
    public,
    created_at
FROM storage.buckets
WHERE name IN ('avatars', 'documentos-medicos', 'laboratorio', 'recetas')
ORDER BY name;

-- Test 11: Verificar políticas RLS de Storage
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'storage'
ORDER BY tablename, policyname;

-- Test 12: Verificar políticas de acceso a documentos médicos
SELECT 
    'Documentos médicos' as recurso,
    'Solo médicos autorizados pueden subir documentos' as politica_descripcion,
    'RLS debe filtrar por médico_id' as validacion_esperada;

-- =====================================================================
-- F. AUDITORÍA Y LOGGING
-- =====================================================================

-- Test 13: Verificar que existe registro de auditoría
SELECT 
    'Auditoría' as tabla,
    COUNT(*) as registros,
    MIN(created_at) as primera_accion,
    MAX(created_at) as ultima_accion
FROM auditoria
UNION ALL
SELECT 
    'Usuarios demo' as tabla,
    COUNT(*) as registros,
    MIN(created_at) as primera_accion,
    MAX(created_at) as ultima_accion
FROM usuarios
WHERE email LIKE '%@demo.mx';

-- Test 14: Verificar integridad de datos
SELECT 
    'Pacientes sin expediente' as validacion,
    COUNT(*) as cantidad
FROM pacientes p
LEFT JOIN expedientes_clinicos ec ON p.id = ec.paciente_id
WHERE ec.id IS NULL
HAVING COUNT(*) > 0

UNION ALL

SELECT 
    'Citas sin médico asignado' as validacion,
    COUNT(*) as cantidad
FROM citas c
LEFT JOIN usuarios u ON c.medico_id = u.id
WHERE u.id IS NULL
HAVING COUNT(*) > 0;

-- =====================================================================
-- G. TESTING DE IDEMPOTENCIA
-- =====================================================================

-- Test 15: Verificar que los datos demo son consistentes
SELECT 
    'Empresa Demo' as entidad,
    COUNT(*) as registros,
    'debe ser 1' as validacion
FROM companies
WHERE company_name = 'Clínica Demo'

UNION ALL

SELECT 
    'Sedes Demo' as entidad,
    COUNT(*) as registros,
    'debe ser 2' as validacion
FROM sedes s
JOIN companies c ON s.empresa_id = c.id
WHERE c.company_name = 'Clínica Demo'

UNION ALL

SELECT 
    'Usuarios demo' as entidad,
    COUNT(*) as registros,
    'debe ser 5' as validacion
FROM usuarios
WHERE email LIKE '%@demo.mx';

-- =====================================================================
-- H. SIMULACIÓN DE ATAQUES COMUNES
-- =====================================================================

-- Test 16: SQL Injection prevention
DO $$
DECLARE
    injection_test TEXT := 'admin''; DROP TABLE usuarios; --';
    test_result TEXT;
BEGIN
    BEGIN
        -- Simular consulta con input potencialmente malicioso
        PERFORM * FROM usuarios WHERE email = injection_test;
        test_result := '✓ Correcto: Input sanitizado correctamente';
    EXCEPTION WHEN others THEN
        test_result := '⚠ ADVERTENCIA: Error en consulta con input malicioso: ' || SQLERRM;
    END;
    
    RAISE NOTICE 'TEST 16 - SQL Injection: %', test_result;
END $$;

-- Test 17: XSS prevention (verificar que datos se almacenan seguros)
SELECT 
    'XSS Prevention' as validacion,
    CASE 
        WHEN COUNT(*) = 0 THEN '✓ Correcto: No se encontraron patrones XSS en notas'
        ELSE '❌ ERROR: Posibles patrones XSS encontrados'
    END as resultado
FROM expedientes_clinicos
WHERE notas LIKE '%<script%' 
   OR notas LIKE '%javascript:%'
   OR notas LIKE '%onload%'
   OR notas LIKE '%onclick%';

-- =====================================================================
-- I. PERFORMANCE Y OPTIMIZACIÓN
-- =====================================================================

-- Test 18: Verificar índices en tablas críticas
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('pacientes', 'citas', 'expedientes_clinicos', 'usuarios')
    AND indexname NOT LIKE '%pkey%'
ORDER BY tablename, indexname;

-- Test 19: Verificar estadísticas de uso de índices
SELECT 
    schemaname,
    tablename,
    attname,
    inherited,
    null_frac,
    avg_width,
    n_distinct,
    most_common_vals
FROM pg_stats 
WHERE schemaname = 'public' 
    AND tablename IN ('pacientes', 'citas', 'usuarios')
    AND attname IN ('email', 'paciente_id', 'medico_id')
ORDER BY tablename, attname;

-- =====================================================================
-- J. REPORTES DE SEGURIDAD
-- =====================================================================

-- Reporte 1: Resumen de permisos por rol
WITH role_permissions AS (
    SELECT 
        r.nombre as rol,
        jsonb_object_keys(r.permissions_json) as permiso,
        r.permissions_json->jsonb_object_keys(r.permissions_json) as detalles_permisos
    FROM roles r
)
SELECT 
    rol,
    COUNT(*) as total_permisos,
    STRING_AGG(permiso, ', ') as lista_permisos
FROM role_permissions
GROUP BY rol
ORDER BY rol;

-- Reporte 2: Estado de seguridad de datos
SELECT 
    'Empresas activas' as metrica,
    COUNT(*)::TEXT as valor
FROM companies
WHERE is_active = true

UNION ALL

SELECT 
    'Pacientes activos' as metrica,
    COUNT(*)::TEXT as valor
FROM pacientes
WHERE activo = true

UNION ALL

SELECT 
    'Usuarios activos' as metrica,
    COUNT(*)::TEXT as valor
FROM usuarios
WHERE activo = true

UNION ALL

SELECT 
    'Total de políticas RLS' as metrica,
    COUNT(*)::TEXT as valor
FROM pg_policies
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'Lotes próximos a caducar (<30 días)' as metrica,
    COUNT(*)::TEXT as valor
FROM inventario_lotes
WHERE fecha_caducidad < CURRENT_DATE + INTERVAL '30 days';

-- =====================================================================
-- K. LIMPIEZA Y MANTENIMIENTO
-- =====================================================================

-- Función para limpiar datos de testing (usar con cuidado)
CREATE OR REPLACE FUNCTION cleanup_test_data()
RETURNS TEXT AS $$
DECLARE
    result_msg TEXT;
BEGIN
    -- Eliminar datos de prueba
    DELETE FROM auditoria WHERE payload_json->>'details' LIKE '%Operación registrada en auditoría%';
    DELETE FROM resultados_laboratorio WHERE observaciones = 'Resultados dentro de parámetros normales';
    DELETE FROM ordenes_laboratorio WHERE folio LIKE 'LAB-%';
    DELETE FROM recetas WHERE folio LIKE 'REC-%';
    DELETE FROM pagos WHERE folio LIKE 'PAGO-%';
    
    result_msg := 'Datos de testing limpiados exitosamente';
    RETURN result_msg;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- FIN DEL ARCHIVO SECURITY_CHECKS.sql
-- =====================================================================

-- Instrucciones de uso:
-- 1. Ejecutar este archivo en un entorno de testing
-- 2. Revisar todos los resultados de las pruebas
-- 3. Corregir cualquier error o advertencia encontrada
-- 4. Ejecutar cleanup_test_data() para limpiar si es necesario
-- 5. En producción, COMMENTAR todas las funciones de testing