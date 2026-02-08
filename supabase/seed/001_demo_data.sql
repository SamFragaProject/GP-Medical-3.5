-- =====================================================
-- SEED DATA: Empresas Demo con Usuarios y Pacientes
-- GPMedical ERP Pro
-- Fecha: 2026-02-08
-- =====================================================

-- =====================================================
-- 1. EMPRESAS DEMO
-- =====================================================

-- Empresa 1: Clínica de Medicina Ocupacional
INSERT INTO empresas (id, nombre, rfc, razon_social, direccion, telefono, email, logo_url, plan, activo, fecha_inicio, fecha_vencimiento, limite_usuarios, limite_pacientes)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'MediWork Ocupacional',
    'MWO2020010ABC',
    'MediWork Servicios de Salud Ocupacional S.A. de C.V.',
    'Av. Insurgentes Sur 1234, Col. Del Valle, CDMX, CP 03100',
    '55 5555 1234',
    'contacto@mediwork.mx',
    NULL,
    'profesional',
    true,
    '2025-01-01',
    '2027-01-01',
    25,
    10000
) ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

-- Empresa 2: Hospital Industrial
INSERT INTO empresas (id, nombre, rfc, razon_social, direccion, telefono, email, logo_url, plan, activo, fecha_inicio, fecha_vencimiento, limite_usuarios, limite_pacientes)
VALUES (
    'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    'Salud Industrial MX',
    'SIM2019050XYZ',
    'Salud Industrial de México S.A. de C.V.',
    'Blvd. Manuel Ávila Camacho 567, Naucalpan, Estado de México, CP 53100',
    '55 5555 5678',
    'info@saludindustrial.mx',
    NULL,
    'enterprise',
    true,
    '2024-06-01',
    '2027-06-01',
    100,
    50000
) ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

-- Empresa 3: Consultorio Demo (Trial)
INSERT INTO empresas (id, nombre, rfc, razon_social, direccion, telefono, email, logo_url, plan, activo, fecha_inicio, fecha_vencimiento, limite_usuarios, limite_pacientes)
VALUES (
    'c3d4e5f6-a7b8-9012-cdef-345678901234',
    'Clínica Demo GPMedical',
    'CDG2026020DEF',
    'Clínica Demo para Pruebas',
    'Calle de Prueba 123, Col. Centro, CDMX, CP 06000',
    '55 1234 5678',
    'demo@gpmedical.mx',
    NULL,
    'trial',
    true,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    5,
    100
) ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

-- =====================================================
-- 2. CREAR ROLES BASE PARA LAS EMPRESAS
-- =====================================================

-- Los triggers automáticos deberían crear los roles, pero los creamos manualmente para asegurar
DO $$
BEGIN
    -- MediWork Ocupacional
    PERFORM crear_roles_base_empresa('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
    -- Salud Industrial MX
    PERFORM crear_roles_base_empresa('b2c3d4e5-f6a7-8901-bcde-f23456789012');
    -- Clínica Demo
    PERFORM crear_roles_base_empresa('c3d4e5f6-a7b8-9012-cdef-345678901234');
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Roles ya existen o trigger los creó';
END $$;

-- =====================================================
-- 3. SEDES POR EMPRESA
-- =====================================================

-- Sedes MediWork
INSERT INTO sedes (id, empresa_id, nombre, direccion, telefono, es_matriz, activo)
VALUES 
    ('s1a1b1c1-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Matriz CDMX', 'Av. Insurgentes Sur 1234, Col. Del Valle', '55 5555 1234', true, true),
    ('s1a1b1c1-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sucursal Monterrey', 'Av. Constitución 456, Col. Centro, Monterrey', '81 8181 1234', false, true),
    ('s1a1b1c1-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sucursal Guadalajara', 'Av. Vallarta 789, Col. Americana, GDL', '33 3333 1234', false, true)
ON CONFLICT (id) DO NOTHING;

-- Sedes Salud Industrial
INSERT INTO sedes (id, empresa_id, nombre, direccion, telefono, es_matriz, activo)
VALUES 
    ('s2a2b2c2-1111-1111-1111-111111111111', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 'Planta Norte', 'Blvd. Manuel Ávila Camacho 567, Naucalpan', '55 5555 5678', true, true),
    ('s2a2b2c2-2222-2222-2222-222222222222', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 'Planta Toluca', 'Parque Industrial Toluca 234', '72 7272 1234', false, true)
ON CONFLICT (id) DO NOTHING;

-- Sede Demo
INSERT INTO sedes (id, empresa_id, nombre, direccion, telefono, es_matriz, activo)
VALUES 
    ('s3a3b3c3-1111-1111-1111-111111111111', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 'Consultorio Principal', 'Calle de Prueba 123, Col. Centro', '55 1234 5678', true, true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. USUARIOS DEMO
-- =====================================================

-- Nota: Los usuarios se crean en auth.users de Supabase y luego en profiles
-- Estos son perfiles mock para desarrollo offline

-- SUPER ADMIN (Plataforma)
INSERT INTO profiles (id, email, nombre, apellido_paterno, apellido_materno, rol, empresa_id, sede_id, cedula_profesional, especialidad, activo, created_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'superadmin@gpmedical.mx',
    'Super',
    'Admin',
    'GPMedical',
    'super_admin',
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- ====== USUARIOS MEDIWORK ======

-- Admin MediWork
INSERT INTO profiles (id, email, nombre, apellido_paterno, apellido_materno, rol, empresa_id, sede_id, cedula_profesional, especialidad, telefono, cargo, activo, created_at)
VALUES (
    'u1a1b1c1-0001-0001-0001-000000000001',
    'admin@mediwork.mx',
    'Carlos',
    'Hernández',
    'López',
    'admin_empresa',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    's1a1b1c1-1111-1111-1111-111111111111',
    NULL,
    NULL,
    '55 1234 0001',
    'Director General',
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- Médico 1 MediWork
INSERT INTO profiles (id, email, nombre, apellido_paterno, apellido_materno, rol, empresa_id, sede_id, cedula_profesional, especialidad, telefono, cargo, activo, created_at)
VALUES (
    'u1a1b1c1-0002-0002-0002-000000000002',
    'dr.martinez@mediwork.mx',
    'Roberto',
    'Martínez',
    'García',
    'medico',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    's1a1b1c1-1111-1111-1111-111111111111',
    '12345678',
    'Medicina del Trabajo',
    '55 1234 0002',
    'Médico Ocupacional',
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- Médico 2 MediWork (Monterrey)
INSERT INTO profiles (id, email, nombre, apellido_paterno, apellido_materno, rol, empresa_id, sede_id, cedula_profesional, especialidad, telefono, cargo, activo, created_at)
VALUES (
    'u1a1b1c1-0003-0003-0003-000000000003',
    'dra.gonzalez@mediwork.mx',
    'María Elena',
    'González',
    'Ramírez',
    'medico',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    's1a1b1c1-2222-2222-2222-222222222222',
    '87654321',
    'Medicina del Trabajo',
    '81 8181 0003',
    'Médico Ocupacional',
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- Enfermera MediWork
INSERT INTO profiles (id, email, nombre, apellido_paterno, apellido_materno, rol, empresa_id, sede_id, cedula_profesional, especialidad, telefono, cargo, activo, created_at)
VALUES (
    'u1a1b1c1-0004-0004-0004-000000000004',
    'enf.lopez@mediwork.mx',
    'Ana Laura',
    'López',
    'Sánchez',
    'enfermera',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    's1a1b1c1-1111-1111-1111-111111111111',
    'ENF-123456',
    'Enfermería',
    '55 1234 0004',
    'Enfermera General',
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- Recepcionista MediWork
INSERT INTO profiles (id, email, nombre, apellido_paterno, apellido_materno, rol, empresa_id, sede_id, cedula_profesional, especialidad, telefono, cargo, activo, created_at)
VALUES (
    'u1a1b1c1-0005-0005-0005-000000000005',
    'recepcion@mediwork.mx',
    'Patricia',
    'Torres',
    'Mendoza',
    'recepcion',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    's1a1b1c1-1111-1111-1111-111111111111',
    NULL,
    NULL,
    '55 1234 0005',
    'Recepcionista',
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- ====== USUARIOS SALUD INDUSTRIAL ======

-- Admin Salud Industrial
INSERT INTO profiles (id, email, nombre, apellido_paterno, apellido_materno, rol, empresa_id, sede_id, cedula_profesional, especialidad, telefono, cargo, activo, created_at)
VALUES (
    'u2a2b2c2-0001-0001-0001-000000000001',
    'admin@saludindustrial.mx',
    'Fernando',
    'Rodríguez',
    'Vega',
    'admin_empresa',
    'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    's2a2b2c2-1111-1111-1111-111111111111',
    NULL,
    NULL,
    '55 5678 0001',
    'Director Médico',
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- ====== USUARIOS DEMO ======

-- Admin Demo
INSERT INTO profiles (id, email, nombre, apellido_paterno, apellido_materno, rol, empresa_id, sede_id, cedula_profesional, especialidad, telefono, cargo, activo, created_at)
VALUES (
    'u3a3b3c3-0001-0001-0001-000000000001',
    'demo@gpmedical.mx',
    'Usuario',
    'Demo',
    'GPMedical',
    'admin_empresa',
    'c3d4e5f6-a7b8-9012-cdef-345678901234',
    's3a3b3c3-1111-1111-1111-111111111111',
    NULL,
    NULL,
    '55 1234 5678',
    'Administrador Demo',
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- Médico Demo
INSERT INTO profiles (id, email, nombre, apellido_paterno, apellido_materno, rol, empresa_id, sede_id, cedula_profesional, especialidad, telefono, cargo, activo, created_at)
VALUES (
    'u3a3b3c3-0002-0002-0002-000000000002',
    'doctor.demo@gpmedical.mx',
    'Dr. Juan',
    'Pérez',
    'Demo',
    'medico',
    'c3d4e5f6-a7b8-9012-cdef-345678901234',
    's3a3b3c3-1111-1111-1111-111111111111',
    'DEMO-12345',
    'Medicina del Trabajo',
    '55 1234 5679',
    'Médico Ocupacional',
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- =====================================================
-- 5. PACIENTES DEMO
-- =====================================================

-- Función helper para generar CURP aleatorio
CREATE OR REPLACE FUNCTION generar_curp_demo() RETURNS VARCHAR(18) AS $$
BEGIN
    RETURN 'XXXX' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0') || 'HDFXXX' || LPAD(FLOOR(RANDOM() * 99)::TEXT, 2, '0');
END;
$$ LANGUAGE plpgsql;

-- Función helper para generar NSS aleatorio
CREATE OR REPLACE FUNCTION generar_nss_demo() RETURNS VARCHAR(11) AS $$
BEGIN
    RETURN LPAD(FLOOR(RANDOM() * 99999999999)::TEXT, 11, '0');
END;
$$ LANGUAGE plpgsql;

-- ====== PACIENTES MEDIWORK ======

INSERT INTO pacientes (id, empresa_id, sede_id, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, curp, nss, email, telefono, direccion, tipo_sangre, alergias, puesto_trabajo, departamento, antiguedad_empresa, activo, created_at)
VALUES 
    -- Paciente 1
    ('p1a1b1c1-0001-0001-0001-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 's1a1b1c1-1111-1111-1111-111111111111',
     'José Luis', 'García', 'Hernández', '1985-03-15', 'M', 'GAHJ850315HDFRRR01', '12345678901',
     'jose.garcia@empresa.com', '55 1111 0001', 'Calle Roble 123, Col. Jardines', 'O+', 
     'Ninguna conocida', 'Operador de Montacargas', 'Almacén', '5 años', true, NOW()),
    
    -- Paciente 2
    ('p1a1b1c1-0002-0002-0002-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 's1a1b1c1-1111-1111-1111-111111111111',
     'María Fernanda', 'Rodríguez', 'López', '1990-07-22', 'F', 'ROLF900722MDFDRR02', '23456789012',
     'maria.rodriguez@empresa.com', '55 1111 0002', 'Av. Pinos 456, Col. Bosques', 'A+',
     'Penicilina', 'Supervisora de Producción', 'Producción', '3 años', true, NOW()),
    
    -- Paciente 3
    ('p1a1b1c1-0003-0003-0003-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 's1a1b1c1-1111-1111-1111-111111111111',
     'Carlos Alberto', 'Martínez', 'Sánchez', '1978-11-08', 'M', 'MASC781108HDFRRR03', '34567890123',
     'carlos.martinez@empresa.com', '55 1111 0003', 'Calle Encino 789, Col. Industrial', 'B+',
     'Sulfas', 'Técnico de Mantenimiento', 'Mantenimiento', '10 años', true, NOW()),
    
    -- Paciente 4
    ('p1a1b1c1-0004-0004-0004-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 's1a1b1c1-1111-1111-1111-111111111111',
     'Ana Patricia', 'González', 'Torres', '1995-02-28', 'F', 'GOTA950228MDFNRR04', '45678901234',
     'ana.gonzalez@empresa.com', '55 1111 0004', 'Av. Cedros 321, Col. Residencial', 'O-',
     'Látex', 'Analista de Calidad', 'Control de Calidad', '2 años', true, NOW()),
    
    -- Paciente 5
    ('p1a1b1c1-0005-0005-0005-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 's1a1b1c1-1111-1111-1111-111111111111',
     'Roberto', 'Hernández', 'Ramírez', '1982-06-10', 'M', 'HERR820610HDFRNR05', '56789012345',
     'roberto.hernandez@empresa.com', '55 1111 0005', 'Calle Olmo 654, Col. Centro', 'AB+',
     'Ninguna', 'Gerente de Operaciones', 'Operaciones', '8 años', true, NOW()),
    
    -- Paciente 6 (Monterrey)
    ('p1a1b1c1-0006-0006-0006-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 's1a1b1c1-2222-2222-2222-222222222222',
     'Laura Beatriz', 'Vega', 'Morales', '1988-09-05', 'F', 'VEML880905MNLGRR06', '67890123456',
     'laura.vega@empresa.com', '81 8181 0006', 'Av. Constitución 987, Monterrey', 'A-',
     'Mariscos', 'Coordinadora de RRHH', 'Recursos Humanos', '4 años', true, NOW()),
    
    -- Paciente 7 (Monterrey)
    ('p1a1b1c1-0007-0007-0007-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 's1a1b1c1-2222-2222-2222-222222222222',
     'Miguel Ángel', 'Flores', 'Díaz', '1975-12-20', 'M', 'FODM751220HNLLZR07', '78901234567',
     'miguel.flores@empresa.com', '81 8181 0007', 'Calle Hidalgo 543, Monterrey', 'B-',
     'Aspirina', 'Director de Planta', 'Dirección', '15 años', true, NOW()),
    
    -- Paciente 8 (Guadalajara)
    ('p1a1b1c1-0008-0008-0008-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 's1a1b1c1-3333-3333-3333-333333333333',
     'Sandra Patricia', 'Luna', 'Espinoza', '1992-04-17', 'F', 'LUES920417MJCNSR08', '89012345678',
     'sandra.luna@empresa.com', '33 3333 0008', 'Av. Vallarta 876, Guadalajara', 'O+',
     'Ninguna', 'Ingeniera de Seguridad', 'Seguridad e Higiene', '3 años', true, NOW()),
    
    -- Paciente 9
    ('p1a1b1c1-0009-0009-0009-000000000009', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 's1a1b1c1-1111-1111-1111-111111111111',
     'Francisco Javier', 'Reyes', 'Castro', '1980-08-25', 'M', 'RECF800825HDFSYR09', '90123456789',
     'francisco.reyes@empresa.com', '55 1111 0009', 'Calle Sauce 432, Col. Primavera', 'A+',
     'Ninguna', 'Soldador Industrial', 'Producción', '12 años', true, NOW()),
    
    -- Paciente 10
    ('p1a1b1c1-0010-0010-0010-000000000010', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 's1a1b1c1-1111-1111-1111-111111111111',
     'Gabriela', 'Mendoza', 'Vargas', '1987-01-30', 'F', 'MEVG870130MDFNRR10', '01234567890',
     'gabriela.mendoza@empresa.com', '55 1111 0010', 'Av. Fresno 765, Col. Arboledas', 'B+',
     'Ibuprofeno', 'Contadora', 'Finanzas', '6 años', true, NOW())
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

-- ====== PACIENTES SALUD INDUSTRIAL ======

INSERT INTO pacientes (id, empresa_id, sede_id, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, curp, nss, email, telefono, direccion, tipo_sangre, alergias, puesto_trabajo, departamento, antiguedad_empresa, activo, created_at)
VALUES 
    ('p2a2b2c2-0001-0001-0001-000000000001', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 's2a2b2c2-1111-1111-1111-111111111111',
     'Pedro Pablo', 'Sánchez', 'Ortega', '1983-05-12', 'M', 'SAOP830512HDFNTR11', '11122233344',
     'pedro.sanchez@industrial.com', '55 2222 0001', 'Calle Industrial 123', 'O+',
     'Ninguna', 'Operador de Maquinaria', 'Producción', '7 años', true, NOW()),
    
    ('p2a2b2c2-0002-0002-0002-000000000002', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 's2a2b2c2-1111-1111-1111-111111111111',
     'Elena', 'Ortiz', 'Jiménez', '1991-10-03', 'F', 'OIJE911003MDFRRR12', '22233344455',
     'elena.ortiz@industrial.com', '55 2222 0002', 'Av. Fábrica 456', 'A+',
     'Polvo', 'Supervisora de Línea', 'Producción', '4 años', true, NOW()),
    
    ('p2a2b2c2-0003-0003-0003-000000000003', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 's2a2b2c2-2222-2222-2222-222222222222',
     'Ricardo', 'Navarro', 'Peña', '1979-07-19', 'M', 'NAPR790719HMCVRR13', '33344455566',
     'ricardo.navarro@industrial.com', '72 7272 0003', 'Parque Industrial 789, Toluca', 'AB-',
     'Ninguna', 'Jefe de Almacén', 'Logística', '9 años', true, NOW()),
    
    ('p2a2b2c2-0004-0004-0004-000000000004', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 's2a2b2c2-1111-1111-1111-111111111111',
     'Mónica', 'Castillo', 'Ruiz', '1994-03-28', 'F', 'CARM940328MDFSTN14', '44455566677',
     'monica.castillo@industrial.com', '55 2222 0004', 'Calle Nave 321', 'B+',
     'Látex, Penicilina', 'Técnica de Laboratorio', 'Laboratorio', '2 años', true, NOW()),
    
    ('p2a2b2c2-0005-0005-0005-000000000005', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 's2a2b2c2-1111-1111-1111-111111111111',
     'Alejandro', 'Ramos', 'Fuentes', '1986-11-14', 'M', 'RAFA861114HDFMSL15', '55566677788',
     'alejandro.ramos@industrial.com', '55 2222 0005', 'Av. Maquinaria 654', 'O-',
     'Ninguna', 'Ingeniero de Procesos', 'Ingeniería', '5 años', true, NOW())
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

-- ====== PACIENTES DEMO ======

INSERT INTO pacientes (id, empresa_id, sede_id, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, curp, nss, email, telefono, direccion, tipo_sangre, alergias, puesto_trabajo, departamento, antiguedad_empresa, activo, created_at)
VALUES 
    ('p3a3b3c3-0001-0001-0001-000000000001', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 's3a3b3c3-1111-1111-1111-111111111111',
     'Paciente', 'Prueba', 'Uno', '1990-01-15', 'M', 'PUUP900115HDFRRR16', '66677788899',
     'paciente1@demo.com', '55 9999 0001', 'Calle Demo 1', 'O+',
     'Ninguna', 'Empleado Demo', 'Demo', '1 año', true, NOW()),
    
    ('p3a3b3c3-0002-0002-0002-000000000002', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 's3a3b3c3-1111-1111-1111-111111111111',
     'Trabajadora', 'Demo', 'Dos', '1988-05-20', 'F', 'DEMD880520MDFMRR17', '77788899900',
     'paciente2@demo.com', '55 9999 0002', 'Calle Demo 2', 'A-',
     'Aspirina', 'Empleada Demo', 'Demo', '2 años', true, NOW()),
    
    ('p3a3b3c3-0003-0003-0003-000000000003', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 's3a3b3c3-1111-1111-1111-111111111111',
     'Usuario', 'Ejemplo', 'Tres', '1995-09-10', 'M', 'EJUT950910HDFJML18', '88899900011',
     'paciente3@demo.com', '55 9999 0003', 'Calle Demo 3', 'B+',
     'Ninguna', 'Obrero Demo', 'Demo', '6 meses', true, NOW())
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

-- =====================================================
-- 6. CITAS DE EJEMPLO
-- =====================================================

INSERT INTO citas (id, empresa_id, sede_id, paciente_id, medico_id, fecha, hora_inicio, hora_fin, tipo, estado, motivo, notas, created_at)
VALUES 
    -- Citas MediWork
    ('c1a1b1c1-0001-0001-0001-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 's1a1b1c1-1111-1111-1111-111111111111',
     'p1a1b1c1-0001-0001-0001-000000000001', 'u1a1b1c1-0002-0002-0002-000000000002',
     CURRENT_DATE + INTERVAL '1 day', '09:00', '09:30', 'examen_ingreso', 'programada',
     'Examen médico de ingreso', 'Paciente nuevo, traer documentos', NOW()),
    
    ('c1a1b1c1-0002-0002-0002-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 's1a1b1c1-1111-1111-1111-111111111111',
     'p1a1b1c1-0002-0002-0002-000000000002', 'u1a1b1c1-0002-0002-0002-000000000002',
     CURRENT_DATE + INTERVAL '1 day', '10:00', '10:30', 'examen_periodico', 'programada',
     'Examen médico periódico anual', NULL, NOW()),
    
    ('c1a1b1c1-0003-0003-0003-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 's1a1b1c1-1111-1111-1111-111111111111',
     'p1a1b1c1-0003-0003-0003-000000000003', 'u1a1b1c1-0002-0002-0002-000000000002',
     CURRENT_DATE, '14:00', '14:30', 'consulta', 'en_curso',
     'Consulta por dolor lumbar', 'Seguimiento de lesión previa', NOW()),
    
    ('c1a1b1c1-0004-0004-0004-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 's1a1b1c1-1111-1111-1111-111111111111',
     'p1a1b1c1-0004-0004-0004-000000000004', 'u1a1b1c1-0002-0002-0002-000000000002',
     CURRENT_DATE - INTERVAL '1 day', '11:00', '11:30', 'examen_periodico', 'completada',
     'Examen médico periódico', 'Resultados normales', NOW()),
    
    -- Citas Demo
    ('c3a3b3c3-0001-0001-0001-000000000001', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 's3a3b3c3-1111-1111-1111-111111111111',
     'p3a3b3c3-0001-0001-0001-000000000001', 'u3a3b3c3-0002-0002-0002-000000000002',
     CURRENT_DATE + INTERVAL '2 days', '10:00', '10:30', 'examen_ingreso', 'programada',
     'Examen de ingreso demo', 'Cita de demostración', NOW())
ON CONFLICT (id) DO UPDATE SET fecha = EXCLUDED.fecha;

-- =====================================================
-- 7. EXPEDIENTES CLÍNICOS
-- =====================================================

INSERT INTO expedientes_clinicos (id, empresa_id, paciente_id, numero_expediente, fecha_apertura, medico_responsable_id, estado, notas)
VALUES 
    ('e1a1b1c1-0001-0001-0001-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
     'p1a1b1c1-0001-0001-0001-000000000001', 'MW-2026-0001', CURRENT_DATE - INTERVAL '30 days',
     'u1a1b1c1-0002-0002-0002-000000000002', 'activo', 'Expediente inicial'),
    
    ('e1a1b1c1-0002-0002-0002-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
     'p1a1b1c1-0002-0002-0002-000000000002', 'MW-2026-0002', CURRENT_DATE - INTERVAL '60 days',
     'u1a1b1c1-0002-0002-0002-000000000002', 'activo', NULL),
    
    ('e1a1b1c1-0003-0003-0003-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
     'p1a1b1c1-0003-0003-0003-000000000003', 'MW-2026-0003', CURRENT_DATE - INTERVAL '90 days',
     'u1a1b1c1-0002-0002-0002-000000000002', 'activo', 'Paciente con antecedentes de lumbalgia'),
    
    -- Demo
    ('e3a3b3c3-0001-0001-0001-000000000001', 'c3d4e5f6-a7b8-9012-cdef-345678901234',
     'p3a3b3c3-0001-0001-0001-000000000001', 'DEMO-2026-0001', CURRENT_DATE,
     'u3a3b3c3-0002-0002-0002-000000000002', 'activo', 'Expediente de demostración')
ON CONFLICT (id) DO UPDATE SET estado = EXCLUDED.estado;

-- =====================================================
-- 8. CONSULTAS EJEMPLO
-- =====================================================

INSERT INTO consultas (id, empresa_id, expediente_id, paciente_id, medico_id, fecha, tipo, motivo_consulta, diagnostico_principal, plan_tratamiento, notas_evolucion, estado, firmado)
VALUES 
    ('con1a1b1-0001-0001-0001-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
     'e1a1b1c1-0003-0003-0003-000000000003', 'p1a1b1c1-0003-0003-0003-000000000003',
     'u1a1b1c1-0002-0002-0002-000000000002', CURRENT_DATE - INTERVAL '7 days',
     'seguimiento', 'Dolor lumbar persistente', 'M54.5 - Lumbago no especificado',
     'Analgésicos, reposo relativo, terapia física', 'Paciente refiere mejoría del 50%',
     'completada', true),
    
    ('con1a1b1-0002-0002-0002-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
     'e1a1b1c1-0003-0003-0003-000000000003', 'p1a1b1c1-0003-0003-0003-000000000003',
     'u1a1b1c1-0002-0002-0002-000000000002', CURRENT_DATE,
     'seguimiento', 'Control de lumbalgia', NULL,
     NULL, 'Consulta en curso',
     'en_curso', false)
ON CONFLICT (id) DO UPDATE SET estado = EXCLUDED.estado;

-- =====================================================
-- 9. ESTUDIOS PARACLINICOS EJEMPLO
-- =====================================================

INSERT INTO estudios_paraclinicos (id, empresa_id, expediente_id, paciente_id, tipo, subtipo, fecha_solicitud, fecha_realizacion, estado, resultados, interpretacion, medico_solicitante_id)
VALUES 
    ('est1a1b1-0001-0001-0001-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
     'e1a1b1c1-0001-0001-0001-000000000001', 'p1a1b1c1-0001-0001-0001-000000000001',
     'audiometria', 'tonal', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '30 days',
     'completado',
     '{"oido_derecho": {"500": 15, "1000": 10, "2000": 15, "4000": 20, "8000": 25}, "oido_izquierdo": {"500": 10, "1000": 15, "2000": 15, "4000": 25, "8000": 30}}',
     'Audición dentro de parámetros normales. Se recomienda protección auditiva.',
     'u1a1b1c1-0002-0002-0002-000000000002'),
    
    ('est1a1b1-0002-0002-0002-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
     'e1a1b1c1-0002-0002-0002-000000000002', 'p1a1b1c1-0002-0002-0002-000000000002',
     'espirometria', 'simple', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '15 days',
     'completado',
     '{"fvc": 3.8, "fev1": 3.2, "fev1_fvc": 84, "pef": 7.5}',
     'Función pulmonar normal. Sin restricción ni obstrucción.',
     'u1a1b1c1-0002-0002-0002-000000000002'),
    
    ('est1a1b1-0003-0003-0003-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
     'e1a1b1c1-0003-0003-0003-000000000003', 'p1a1b1c1-0003-0003-0003-000000000003',
     'laboratorio', 'biometria_hematica', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE - INTERVAL '6 days',
     'completado',
     '{"hemoglobina": 15.2, "hematocrito": 45, "leucocitos": 7500, "plaquetas": 250000, "glucosa": 95, "colesterol": 185}',
     'Valores dentro de rangos normales. Glucosa y colesterol controlados.',
     'u1a1b1c1-0002-0002-0002-000000000002')
ON CONFLICT (id) DO UPDATE SET estado = EXCLUDED.estado;

-- =====================================================
-- 10. SIGNOS VITALES EJEMPLO
-- =====================================================

INSERT INTO signos_vitales (id, paciente_id, consulta_id, fecha, peso, talla, imc, presion_sistolica, presion_diastolica, frecuencia_cardiaca, frecuencia_respiratoria, temperatura, saturacion_oxigeno, glucosa_capilar, registrado_por)
VALUES 
    ('sv1a1b1c1-0001-0001-0001-000000000001', 'p1a1b1c1-0003-0003-0003-000000000003',
     'con1a1b1-0001-0001-0001-000000000001', CURRENT_DATE - INTERVAL '7 days',
     78.5, 1.75, 25.6, 120, 80, 72, 16, 36.5, 98, 95,
     'u1a1b1c1-0004-0004-0004-000000000004'),
    
    ('sv1a1b1c1-0002-0002-0002-000000000002', 'p1a1b1c1-0003-0003-0003-000000000003',
     'con1a1b1-0002-0002-0002-000000000002', CURRENT_DATE,
     78.0, 1.75, 25.5, 118, 78, 70, 15, 36.4, 99, 92,
     'u1a1b1c1-0004-0004-0004-000000000004')
ON CONFLICT (id) DO UPDATE SET fecha = EXCLUDED.fecha;

-- =====================================================
-- RESUMEN DE DATOS INSERTADOS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SEED DATA COMPLETADO';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Empresas: 3';
    RAISE NOTICE 'Sedes: 6';
    RAISE NOTICE 'Usuarios: 9';
    RAISE NOTICE 'Pacientes: 18';
    RAISE NOTICE 'Citas: 5';
    RAISE NOTICE 'Expedientes: 4';
    RAISE NOTICE 'Consultas: 2';
    RAISE NOTICE 'Estudios: 3';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CREDENCIALES DEMO:';
    RAISE NOTICE '  Super Admin: superadmin@gpmedical.mx';
    RAISE NOTICE '  Admin Demo:  demo@gpmedical.mx';
    RAISE NOTICE '  Médico Demo: doctor.demo@gpmedical.mx';
    RAISE NOTICE '========================================';
END $$;
