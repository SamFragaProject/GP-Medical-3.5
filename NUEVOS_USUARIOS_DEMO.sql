-- ============================================
-- SCRIPT PARA AGREGAR NUEVOS USUARIOS DEMO
-- ============================================

-- NOTA IMPORTANTE:
-- Para que estos usuarios funcionen con Login REAL (Supabase Auth), debes:
-- 1. Ir al Dashboard de Supabase -> Authentication -> Users
-- 2. Crear los usuarios con estos emails y una contraseña.
-- 3. Copiar el User UID generado por Supabase.
-- 4. Reemplazar 'PLACEHOLDER_UID_...' abajo con los UIDs reales.

-- Si solo usas el modo DEMO/OFFLINE del frontend, NO necesitas ejecutar esto.
-- El frontend ya fue configurado para aceptar:
-- Email: admin.medico@gpmedical.mx
-- Email: asistente.demo@gpmedical.mx

-- Insertar Usuario: Admin Empresa + Médico
INSERT INTO usuarios (
    id, 
    email, 
    nombre, 
    apellido_paterno, 
    rol, 
    empresa_id, 
    especialidad,
    activo
) VALUES (
    'PLACEHOLDER_UID_ADMIN_MEDICO', -- Reemplazar con UID real de Auth
    'admin.medico@gpmedical.mx',
    'Dr. Admin Medico',
    'Demo',
    'admin_empresa', -- Rol híbrido (Admin con permisos extendidos en auth.ts)
    '00000000-0000-0000-0000-000000000001', -- ID de Empresa Demo GPMedical
    'Medicina del Trabajo',
    true
);

-- Insertar Usuario: Asistente
INSERT INTO usuarios (
    id, 
    email, 
    nombre, 
    apellido_paterno, 
    rol, 
    empresa_id, 
    activo
) VALUES (
    'PLACEHOLDER_UID_ASISTENTE', -- Reemplazar con UID real de Auth
    'asistente.demo@gpmedical.mx',
    'Asistente Demo',
    'Demo',
    'asistente',
    '00000000-0000-0000-0000-000000000001',
    true
);
