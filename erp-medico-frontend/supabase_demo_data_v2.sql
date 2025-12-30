-- ============================================
-- DATOS DE DEMOSTRACIÓN INTERCONECTADOS v2
-- GPMedical ERP - Medicina Ocupacional
-- ============================================
-- EJECUTAR DESPUÉS del esquema principal (supabase/schema.sql)
-- 
-- IMPORTANTE: Para que los usuarios funcionen, primero debes crear
-- las cuentas en Supabase Auth (Authentication > Users > Add user)
-- con los emails listados abajo. DESPUÉS ejecuta este script.
-- ============================================

-- IDs predefinidos para referencias cruzadas (UUIDs fijos para demo)
-- Estos IDs pueden cambiar si creas los usuarios en Supabase Auth

-- PASO 1: CREAR EMPRESA PRINCIPAL
-- ============================================
INSERT INTO empresas (id, nombre, rfc, email, telefono, direccion, logo_url, plan_id, activa)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'GPMedical',
  'GPM123456ABC',
  'contacto@gpmedical.mx',
  '5512345678',
  'Av. Reforma 222, Col. Juárez, CDMX',
  '/logo-gpmedical.png',
  'corporativo',
  true
) ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  plan_id = EXCLUDED.plan_id;

-- PASO 2: CREAR SEDES
-- ============================================
INSERT INTO sedes (id, empresa_id, nombre, direccion, telefono, email) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Sede Central CDMX', 'Av. Reforma 222, Col. Juárez, CDMX 06600', '5512345678', 'central@gpmedical.mx'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Sede Norte - Monterrey', 'Av. Constitución 500, Centro, MTY', '8187654321', 'monterrey@gpmedical.mx'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Sede Bajío - Querétaro', 'Blvd. Bernardo Quintana 100, QRO', '4421234567', 'queretaro@gpmedical.mx')
ON CONFLICT (id) DO NOTHING;

-- PASO 3: PUESTOS DE TRABAJO
-- ============================================
INSERT INTO puestos_trabajo (id, empresa_id, nombre, descripcion, nivel_riesgo) VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Operador de Maquinaria Pesada', 'Operación de excavadoras, grúas y maquinaria de construcción', 'alto'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Supervisor de Obra', 'Supervisión de proyectos de construcción en campo', 'medio'),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Técnico de Producción', 'Operación de líneas de producción industrial', 'medio'),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Chofer de Tráiler', 'Transporte de carga en rutas federales', 'alto'),
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Administrativo', 'Trabajo de oficina y gestión documental', 'bajo')
ON CONFLICT (id) DO NOTHING;

-- PASO 4: PROTOCOLOS MÉDICOS
-- ============================================
INSERT INTO protocolos_medicos (id, empresa_id, nombre, descripcion, tipo_examen, examenes_incluidos, vigencia_dias) VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Protocolo de Ingreso Completo',
    'Evaluación médica integral para nuevos empleados',
    'ingreso',
    '["historia_clinica", "biometria_hematica", "quimica_sanguinea", "examen_orina", "audiometria", "espirometria", "rayos_x_torax", "evaluacion_psicometrica"]'::jsonb,
    365
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Protocolo Periódico Anual',
    'Evaluación de salud ocupacional anual',
    'periodico',
    '["historia_clinica", "biometria_hematica", "examen_orina", "espirometria"]'::jsonb,
    365
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Protocolo de Egreso',
    'Evaluación médica al término de la relación laboral',
    'egreso',
    '["historia_clinica", "audiometria", "espirometria"]'::jsonb,
    30
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PASO 5: USUARIOS DEL SISTEMA (profiles)
-- ============================================
-- IMPORTANTE: Estos usuarios DEBEN existir primero en Supabase Auth
-- Crear manualmente en: Authentication > Users > Add user
-- 
-- Contraseña sugerida para todos los demo: Demo2024!
--
-- EMAILS A CREAR EN AUTH:
-- 1. super@gpmedical.mx (Super Admin)
-- 2. admin@gpmedical.mx (Admin Empresa)
-- 3. roberto.mendez@gpmedical.mx (Médico del Trabajo)
-- 4. maria.garcia@gpmedical.mx (Médico Especialista)
-- 5. ana.lopez@gpmedical.mx (Enfermera)
-- 6. julia.recepcion@gpmedical.mx (Recepción)
-- 7. juan.rodriguez@demo.com (Paciente con cuenta)
-- 8. maria.gonzalez@demo.com (Paciente con cuenta)
-- ============================================

-- Esta función inserta profiles solo si el usuario existe en auth.users
-- Si no existe, simplemente ignora el insert
CREATE OR REPLACE FUNCTION insert_demo_profile(
  p_email TEXT,
  p_nombre TEXT,
  p_apellido_paterno TEXT,
  p_apellido_materno TEXT,
  p_hierarchy TEXT,
  p_empresa_id UUID,
  p_sede_id UUID,
  p_telefono TEXT DEFAULT NULL,
  p_cedula TEXT DEFAULT NULL,
  p_especialidad TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Buscar el usuario en auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  
  -- Si existe, insertar o actualizar el profile
  IF v_user_id IS NOT NULL THEN
    INSERT INTO profiles (
      id, email, nombre, apellido_paterno, apellido_materno,
      hierarchy, empresa_id, sede_id, telefono, cedula_profesional, especialidad, status
    ) VALUES (
      v_user_id, p_email, p_nombre, p_apellido_paterno, p_apellido_materno,
      p_hierarchy, p_empresa_id, p_sede_id, p_telefono, p_cedula, p_especialidad, 'active'
    ) ON CONFLICT (id) DO UPDATE SET
      nombre = EXCLUDED.nombre,
      apellido_paterno = EXCLUDED.apellido_paterno,
      apellido_materno = EXCLUDED.apellido_materno,
      hierarchy = EXCLUDED.hierarchy,
      telefono = EXCLUDED.telefono,
      cedula_profesional = EXCLUDED.cedula_profesional,
      especialidad = EXCLUDED.especialidad;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insertar usuarios demo
SELECT insert_demo_profile('super@gpmedical.mx', 'Administrador', 'Sistema', 'SaaS', 'super_admin', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '5500000001', NULL, NULL);
SELECT insert_demo_profile('admin@gpmedical.mx', 'Carlos', 'Hernández', 'López', 'admin_empresa', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '5500000002', NULL, NULL);
SELECT insert_demo_profile('roberto.mendez@gpmedical.mx', 'Roberto', 'Méndez', 'Salazar', 'medico_trabajo', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '5500000003', 'CED-12345678', 'Medicina del Trabajo');
SELECT insert_demo_profile('maria.garcia@gpmedical.mx', 'María Elena', 'García', 'Torres', 'medico_especialista', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '5500000004', 'CED-87654321', 'Audiología');
SELECT insert_demo_profile('ana.lopez@gpmedical.mx', 'Ana Sofía', 'López', 'Rivera', 'enfermera', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '5500000005', 'CED-11111111', 'Enfermería');
SELECT insert_demo_profile('julia.recepcion@gpmedical.mx', 'Julia', 'Martínez', 'Soto', 'recepcion', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '5500000006', NULL, NULL);
SELECT insert_demo_profile('juan.rodriguez@demo.com', 'Juan Carlos', 'Rodríguez', 'López', 'paciente', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '5551234567', NULL, NULL);
SELECT insert_demo_profile('maria.gonzalez@demo.com', 'María Fernanda', 'González', 'Sánchez', 'paciente', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '5559876543', NULL, NULL);

-- ============================================
-- PASO 6: PACIENTES (Trabajadores)
-- ============================================
-- Incluimos el email de los pacientes que tienen cuenta de usuario
-- para que puedan vincularse

INSERT INTO pacientes (id, empresa_id, numero_empleado, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, genero, email, telefono, puesto_trabajo_id, estatus, nss, curp, tipo_sangre, alergias, contacto_emergencia_nombre, contacto_emergencia_telefono) VALUES
  -- Pacientes CON cuenta de usuario (pueden hacer login y ver su historial)
  (
    '40000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'EMP-001',
    'Juan Carlos', 'Rodríguez', 'López',
    '1985-03-15',
    'masculino',
    'juan.rodriguez@demo.com', -- Mismo email que su usuario
    '5551234567',
    '20000000-0000-0000-0000-000000000001', -- Operador Maquinaria
    'activo',
    '12345678901',
    'ROLJ850315HDFRPN01',
    'O+',
    'Ninguna conocida',
    'María López', '5559998888'
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'EMP-002',
    'María Fernanda', 'González', 'Sánchez',
    '1990-07-20',
    'femenino',
    'maria.gonzalez@demo.com', -- Mismo email que su usuario
    '5559876543',
    '20000000-0000-0000-0000-000000000002', -- Supervisor
    'activo',
    '23456789012',
    'GOSM900720MDFNRR02',
    'A+',
    'Penicilina',
    'Roberto Sánchez', '5557776666'
  ),
  -- Pacientes SIN cuenta de usuario (solo en sistema médico)
  (
    '40000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'EMP-003',
    'Pedro', 'Martínez', 'Hernández',
    '1988-05-12',
    'masculino',
    'pedro.martinez@empresa.com',
    '5552468135',
    '20000000-0000-0000-0000-000000000003', -- Técnico Producción
    'activo',
    '34567890123',
    'MAHP880512HDFRRP03',
    'B+',
    'Ninguna',
    'Laura Hernández', '5553332222'
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'EMP-004',
    'Ana Laura', 'Ramírez', 'García',
    '1995-08-30',
    'femenino',
    'ana.ramirez@empresa.com',
    '5554567890',
    '20000000-0000-0000-0000-000000000005', -- Administrativo
    'activo',
    '45678901234',
    'RAGA950830MDFMRN04',
    'AB+',
    'Polen',
    'José García', '5551112222'
  ),
  (
    '40000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    'EMP-005',
    'Roberto', 'Sánchez', 'Pérez',
    '1982-02-25',
    'masculino',
    'roberto.sanchez@empresa.com',
    '5555678901',
    '20000000-0000-0000-0000-000000000004', -- Chofer
    'activo',
    '56789012345',
    'SAPR820225HDFNRB05',
    'O-',
    'Sulfas',
    'Carmen Pérez', '5554443333'
  ),
  (
    '40000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000001',
    'EMP-006',
    'Carmen', 'López', 'Torres',
    '1988-06-17',
    'femenino',
    'carmen.lopez@empresa.com',
    '5556789012',
    '20000000-0000-0000-0000-000000000005', -- Administrativo
    'activo',
    '67890123456',
    'LOTC880617MDFPRR06',
    'A-',
    'Ninguna',
    'Luis Torres', '5552223333'
  ),
  (
    '40000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000001',
    'EMP-007',
    'Francisco', 'Hernández', 'Ruiz',
    '1992-04-10',
    'masculino',
    'francisco.hernandez@empresa.com',
    '5557890123',
    '20000000-0000-0000-0000-000000000001', -- Operador
    'activo',
    '78901234567',
    'HERF920410HDFRRF07',
    'B-',
    'Látex',
    'Elena Ruiz', '5558887777'
  ),
  (
    '40000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000001',
    'EMP-008',
    'Gabriela', 'Torres', 'Mendoza',
    '1989-11-05',
    'femenino',
    'gabriela.torres@empresa.com',
    '5558901234',
    '20000000-0000-0000-0000-000000000003', -- Técnico
    'activo',
    '89012345678',
    'TOMG891105MDFRRF08',
    'O+',
    'Ninguna',
    'Miguel Mendoza', '5559990000'
  ),
  (
    '40000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000001',
    'EMP-009',
    'Luis Alberto', 'Pérez', 'Jiménez',
    '1987-07-28',
    'masculino',
    'luis.perez@empresa.com',
    '5559012345',
    '20000000-0000-0000-0000-000000000002', -- Supervisor
    'incapacitado',
    '90123456789',
    'PEJL870728HDFRRB09',
    'A+',
    'Mariscos',
    'Sandra Jiménez', '5550001111'
  ),
  (
    '40000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000001',
    'EMP-010',
    'Diana', 'García', 'Flores',
    '1993-03-15',
    'femenino',
    'diana.garcia@empresa.com',
    '5550123456',
    '20000000-0000-0000-0000-000000000005', -- Administrativo
    'activo',
    '01234567890',
    'GAFD930315MDFRRF10',
    'AB-',
    'Ninguna',
    'Jorge Flores', '5551234000'
  )
ON CONFLICT (id) DO UPDATE SET
  estatus = EXCLUDED.estatus,
  email = EXCLUDED.email;

-- ============================================
-- PASO 7: CITAS DEMO (Hoy y próximos días)
-- ============================================
-- Vinculamos citas a médicos y pacientes específicos

DO $$
DECLARE
  v_empresa_id UUID := '00000000-0000-0000-0000-000000000001';
  v_medico_trabajo UUID;
  v_medico_especialista UUID;
  v_hoy DATE := CURRENT_DATE;
BEGIN
  -- Obtener IDs de médicos (si existen)
  SELECT id INTO v_medico_trabajo FROM profiles WHERE email = 'roberto.mendez@gpmedical.mx' LIMIT 1;
  SELECT id INTO v_medico_especialista FROM profiles WHERE email = 'maria.garcia@gpmedical.mx' LIMIT 1;
  
  -- Si no hay médicos, usamos NULL
  -- Las citas se crean de todos modos
  
  -- Limpiar citas demo anteriores
  DELETE FROM citas WHERE empresa_id = v_empresa_id AND id LIKE '50000000-%';
  
  -- Citas de HOY
  INSERT INTO citas (id, empresa_id, paciente_id, medico_id, tipo_cita, fecha, hora_inicio, hora_fin, estado, motivo, sala) VALUES
    ('50000000-0000-0000-0000-000000000001', v_empresa_id, '40000000-0000-0000-0000-000000000001', v_medico_trabajo, 'examen_ocupacional', v_hoy, '09:00', '10:00', 'confirmada', 'Examen periódico anual', 'Consultorio 1'),
    ('50000000-0000-0000-0000-000000000002', v_empresa_id, '40000000-0000-0000-0000-000000000002', v_medico_trabajo, 'examen_ocupacional', v_hoy, '10:00', '11:30', 'programada', 'Examen de ingreso completo', 'Consultorio 1'),
    ('50000000-0000-0000-0000-000000000003', v_empresa_id, '40000000-0000-0000-0000-000000000003', v_medico_especialista, 'consulta', v_hoy, '11:30', '12:00', 'en_curso', 'Seguimiento audiometría', 'Consultorio 2'),
    ('50000000-0000-0000-0000-000000000004', v_empresa_id, '40000000-0000-0000-0000-000000000004', v_medico_trabajo, 'examen_ocupacional', v_hoy, '14:00', '15:00', 'programada', 'Examen periódico', 'Consultorio 1'),
    ('50000000-0000-0000-0000-000000000005', v_empresa_id, '40000000-0000-0000-0000-000000000005', v_medico_trabajo, 'examen_ocupacional', v_hoy, '15:30', '16:30', 'programada', 'Examen chofer DOT', 'Consultorio 1');

  -- Citas de MAÑANA
  INSERT INTO citas (id, empresa_id, paciente_id, medico_id, tipo_cita, fecha, hora_inicio, hora_fin, estado, motivo, sala) VALUES
    ('50000000-0000-0000-0000-000000000006', v_empresa_id, '40000000-0000-0000-0000-000000000006', v_medico_trabajo, 'examen_ocupacional', v_hoy + 1, '09:00', '10:00', 'programada', 'Examen periódico', 'Consultorio 1'),
    ('50000000-0000-0000-0000-000000000007', v_empresa_id, '40000000-0000-0000-0000-000000000007', v_medico_trabajo, 'examen_ocupacional', v_hoy + 1, '10:00', '11:30', 'programada', 'Examen de ingreso', 'Consultorio 1'),
    ('50000000-0000-0000-0000-000000000008', v_empresa_id, '40000000-0000-0000-0000-000000000001', v_medico_especialista, 'seguimiento', v_hoy + 1, '12:00', '12:30', 'programada', 'Resultados de laboratorio', 'Consultorio 2');

  -- Citas de PRÓXIMA SEMANA
  INSERT INTO citas (id, empresa_id, paciente_id, medico_id, tipo_cita, fecha, hora_inicio, hora_fin, estado, motivo, sala) VALUES
    ('50000000-0000-0000-0000-000000000009', v_empresa_id, '40000000-0000-0000-0000-000000000008', v_medico_trabajo, 'examen_ocupacional', v_hoy + 7, '09:00', '10:30', 'programada', 'Examen de reintegro', 'Consultorio 1'),
    ('50000000-0000-0000-0000-000000000010', v_empresa_id, '40000000-0000-0000-0000-000000000009', v_medico_trabajo, 'examen_ocupacional', v_hoy + 7, '11:00', '12:00', 'programada', 'Alta de incapacidad', 'Consultorio 1');
    
END $$;

-- ============================================
-- PASO 8: EXÁMENES OCUPACIONALES DEMO
-- ============================================

DO $$
DECLARE
  v_empresa_id UUID := '00000000-0000-0000-0000-000000000001';
  v_medico UUID;
BEGIN
  SELECT id INTO v_medico FROM profiles WHERE email = 'roberto.mendez@gpmedical.mx' LIMIT 1;
  
  INSERT INTO examenes_ocupacionales (id, empresa_id, paciente_id, medico_id, protocolo_id, tipo_examen, fecha_programada, fecha_realizada, estado, aptitud_medica, observaciones_medicas, fecha_vigencia, resultados) VALUES
    -- Exámenes completados
    (
      '60000000-0000-0000-0000-000000000001',
      v_empresa_id,
      '40000000-0000-0000-0000-000000000001',
      v_medico,
      '30000000-0000-0000-0000-000000000001',
      'ingreso',
      CURRENT_DATE - 365,
      CURRENT_DATE - 365,
      'completado',
      'apto',
      'Paciente en excelentes condiciones de salud. Sin restricciones.',
      CURRENT_DATE,
      '{"presion_arterial": "120/80", "frecuencia_cardiaca": 72, "peso_kg": 78, "talla_cm": 175, "imc": 25.5}'::jsonb
    ),
    (
      '60000000-0000-0000-0000-000000000002',
      v_empresa_id,
      '40000000-0000-0000-0000-000000000002',
      v_medico,
      '30000000-0000-0000-0000-000000000002',
      'periodico',
      CURRENT_DATE - 30,
      CURRENT_DATE - 30,
      'completado',
      'apto_con_limitaciones',
      'Alergia a penicilina documentada. Se recomienda evitar exposición a polvo.',
      CURRENT_DATE + 335,
      '{"presion_arterial": "110/70", "frecuencia_cardiaca": 68, "peso_kg": 62, "talla_cm": 165, "imc": 22.8}'::jsonb
    ),
    -- Exámenes programados
    (
      '60000000-0000-0000-0000-000000000003',
      v_empresa_id,
      '40000000-0000-0000-0000-000000000003',
      v_medico,
      '30000000-0000-0000-0000-000000000002',
      'periodico',
      CURRENT_DATE,
      NULL,
      'programado',
      'pendiente',
      NULL,
      NULL,
      '{}'::jsonb
    ),
    -- Examen en proceso
    (
      '60000000-0000-0000-0000-000000000004',
      v_empresa_id,
      '40000000-0000-0000-0000-000000000004',
      v_medico,
      '30000000-0000-0000-0000-000000000001',
      'ingreso',
      CURRENT_DATE,
      CURRENT_DATE,
      'en_proceso',
      'pendiente',
      'En espera de resultados de laboratorio.',
      NULL,
      '{"presion_arterial": "125/82", "frecuencia_cardiaca": 75, "peso_kg": 58, "talla_cm": 160, "imc": 22.6}'::jsonb
    )
  ON CONFLICT (id) DO NOTHING;
END $$;

-- ============================================
-- PASO 9: HISTORIAL MÉDICO
-- ============================================

DO $$
DECLARE
  v_empresa_id UUID := '00000000-0000-0000-0000-000000000001';
  v_medico UUID;
BEGIN
  SELECT id INTO v_medico FROM profiles WHERE email = 'roberto.mendez@gpmedical.mx' LIMIT 1;
  
  INSERT INTO historial_medico_laboral (id, empresa_id, paciente_id, medico_id, tipo_evento, fecha_evento, descripcion, diagnostico, tratamiento, dias_incapacidad) VALUES
    (
      '70000000-0000-0000-0000-000000000001',
      v_empresa_id,
      '40000000-0000-0000-0000-000000000009', -- Luis Alberto - incapacitado
      v_medico,
      'incapacidad',
      CURRENT_DATE - 10,
      'Paciente presenta dolor lumbar agudo tras levantamiento de carga pesada.',
      'M545 - Lumbago no especificado',
      'Reposo, antiinflamatorios, fisioterapia',
      15
    ),
    (
      '70000000-0000-0000-0000-000000000002',
      v_empresa_id,
      '40000000-0000-0000-0000-000000000005', -- Roberto - chofer
      v_medico,
      'examen',
      CURRENT_DATE - 60,
      'Examen DOT para operador de transporte federal.',
      NULL,
      NULL,
      0
    ),
    (
      '70000000-0000-0000-0000-000000000003',
      v_empresa_id,
      '40000000-0000-0000-0000-000000000001', -- Juan Carlos
      v_medico,
      'vacunacion',
      CURRENT_DATE - 180,
      'Vacunación antitetánica de refuerzo.',
      NULL,
      NULL,
      0
    )
  ON CONFLICT (id) DO NOTHING;
END $$;

-- ============================================
-- PASO 10: INVENTARIO MÉDICO DEMO
-- ============================================

INSERT INTO inventario_medico (id, empresa_id, nombre_producto, categoria, codigo_producto, cantidad_actual, cantidad_minima, unidad_medida, fecha_caducidad, costo_unitario, estado) VALUES
  ('80000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Guantes de látex (Caja 100)', 'insumo_medico', 'INS-001', 25, 10, 'caja', CURRENT_DATE + 365, 150.00, 'disponible'),
  ('80000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Cubrebocas N95 (Caja 50)', 'insumo_medico', 'INS-002', 8, 15, 'caja', CURRENT_DATE + 180, 450.00, 'disponible'),
  ('80000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Alcohol gel 500ml', 'material_curacion', 'MAT-001', 30, 20, 'pieza', CURRENT_DATE + 365, 85.00, 'disponible'),
  ('80000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Paracetamol 500mg (Caja 20)', 'medicamento', 'MED-001', 50, 25, 'caja', CURRENT_DATE + 180, 45.00, 'disponible'),
  ('80000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Ibuprofeno 400mg (Caja 20)', 'medicamento', 'MED-002', 3, 15, 'caja', CURRENT_DATE + 90, 65.00, 'agotado'),
  ('80000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Estetoscopio Littmann Classic', 'equipo', 'EQU-001', 5, 2, 'pieza', NULL, 2500.00, 'disponible'),
  ('80000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Baumanómetro digital', 'equipo', 'EQU-002', 4, 2, 'pieza', NULL, 1200.00, 'disponible'),
  ('80000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Jeringas 10ml (Caja 100)', 'insumo_medico', 'INS-003', 12, 10, 'caja', CURRENT_DATE + 730, 180.00, 'disponible')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PASO 11: ALERTAS DEMO
-- ============================================

INSERT INTO alertas_riesgo (id, empresa_id, tipo_alerta, prioridad, titulo, descripcion, entidad_id, entidad_tipo, estado) VALUES
  ('90000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'examen_vencido', 'alta', 'Exámenes próximos a vencer', '3 empleados tienen exámenes que vencen esta semana', NULL, 'examenes', 'activa'),
  ('90000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'inventario_bajo', 'media', 'Inventario bajo: Ibuprofeno', 'El stock de Ibuprofeno 400mg está por debajo del mínimo', '80000000-0000-0000-0000-000000000005', 'inventario', 'activa'),
  ('90000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'certificado_proximo_vencer', 'media', 'Certificado próximo a vencer', 'Juan Carlos Rodríguez - Certificado vence en 5 días', '40000000-0000-0000-0000-000000000001', 'pacientes', 'activa'),
  ('90000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'incidencia_alta_riesgo', 'critica', 'Incapacidad prolongada', 'Luis Alberto Pérez lleva 10 días de incapacidad', '40000000-0000-0000-0000-000000000009', 'pacientes', 'activa')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

SELECT 'Empresas:' as tabla, COUNT(*) as total FROM empresas
UNION ALL SELECT 'Sedes:', COUNT(*) FROM sedes
UNION ALL SELECT 'Puestos:', COUNT(*) FROM puestos_trabajo
UNION ALL SELECT 'Protocolos:', COUNT(*) FROM protocolos_medicos
UNION ALL SELECT 'Profiles (usuarios):', COUNT(*) FROM profiles
UNION ALL SELECT 'Pacientes:', COUNT(*) FROM pacientes
UNION ALL SELECT 'Citas:', COUNT(*) FROM citas
UNION ALL SELECT 'Exámenes:', COUNT(*) FROM examenes_ocupacionales
UNION ALL SELECT 'Historial médico:', COUNT(*) FROM historial_medico_laboral
UNION ALL SELECT 'Inventario:', COUNT(*) FROM inventario_medico
UNION ALL SELECT 'Alertas:', COUNT(*) FROM alertas_riesgo;

-- ============================================
-- FIN - DATOS DEMO INTERCONECTADOS
-- ============================================
