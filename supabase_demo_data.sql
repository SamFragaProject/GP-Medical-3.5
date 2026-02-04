-- ============================================
-- DATOS DE DEMOSTRACIÓN - GPMedical ERP
-- Ejecutar DESPUÉS del esquema principal
-- ============================================

-- Nota: La empresa GPMedical ya fue creada en el esquema

-- ============================================
-- 1. EMPRESAS CLIENTE (empresas que envían trabajadores)
-- ============================================

INSERT INTO empresas_cliente (empresa_id, nombre, rfc, contacto_nombre, contacto_email, contacto_telefono) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Construcciones del Norte SA de CV', 'CNO850101ABC', 'Roberto González', 'roberto@construccionesnorte.mx', '5551234567'),
  ('00000000-0000-0000-0000-000000000001', 'Manufacturera Industrial MX', 'MIM900215XYZ', 'María Hernández', 'maria@manufacturera.mx', '5559876543'),
  ('00000000-0000-0000-0000-000000000001', 'Transportes Águila Dorada', 'TAD880512DEF', 'Carlos Martínez', 'carlos@aguiladorada.mx', '5552468135');

-- ============================================
-- 2. PACIENTES (trabajadores)
-- ============================================

-- Obtener IDs de empresas cliente para las foreign keys
DO $$
DECLARE
  empresa_id UUID := '00000000-0000-0000-0000-000000000001';
  cliente1_id UUID;
  cliente2_id UUID;
  cliente3_id UUID;
BEGIN
  -- Obtener IDs de clientes
  SELECT id INTO cliente1_id FROM empresas_cliente WHERE nombre LIKE 'Construcciones%' LIMIT 1;
  SELECT id INTO cliente2_id FROM empresas_cliente WHERE nombre LIKE 'Manufacturera%' LIMIT 1;
  SELECT id INTO cliente3_id FROM empresas_cliente WHERE nombre LIKE 'Transportes%' LIMIT 1;

  -- Insertar pacientes
  INSERT INTO pacientes (empresa_id, empresa_cliente_id, numero_empleado, nombre, apellido_paterno, apellido_materno, curp, nss, fecha_nacimiento, genero, puesto, departamento, tipo_sangre, estatus) VALUES
    (empresa_id, cliente1_id, 'EMP-001', 'Juan Carlos', 'Rodríguez', 'López', 'ROLJ850315HDFRPN01', '12345678901', '1985-03-15', 'Masculino', 'Operador de Maquinaria', 'Operaciones', 'O+', 'activo'),
    (empresa_id, cliente1_id, 'EMP-002', 'María Fernanda', 'González', 'Sánchez', 'GOSM900720MDFNRR02', '23456789012', '1990-07-20', 'Femenino', 'Supervisora de Obra', 'Supervisión', 'A+', 'activo'),
    (empresa_id, cliente2_id, 'EMP-003', 'Pedro', 'Martínez', 'Hernández', 'MAHP880512HDFRRP03', '34567890123', '1988-05-12', 'Masculino', 'Técnico de Producción', 'Manufactura', 'B+', 'activo'),
    (empresa_id, cliente2_id, 'EMP-004', 'Ana Laura', 'Ramírez', 'García', 'RAGA950830MDFMRN04', '45678901234', '1995-08-30', 'Femenino', 'Control de Calidad', 'Calidad', 'AB+', 'activo'),
    (empresa_id, cliente3_id, 'EMP-005', 'Roberto', 'Sánchez', 'Pérez', 'SAPR820225HDFNRB05', '56789012345', '1982-02-25', 'Masculino', 'Chofer de Tráiler', 'Transporte', 'O-', 'activo'),
    (empresa_id, cliente3_id, 'EMP-006', 'Carmen', 'López', 'Torres', 'LOTC880617MDFPRR06', '67890123456', '1988-06-17', 'Femenino', 'Coordinadora Logística', 'Logística', 'A-', 'activo'),
    (empresa_id, cliente1_id, 'EMP-007', 'Francisco', 'Hernández', 'Ruiz', 'HERF920410HDFRRF07', '78901234567', '1992-04-10', 'Masculino', 'Albañil', 'Construcción', 'B-', 'activo'),
    (empresa_id, cliente2_id, 'EMP-008', 'Gabriela', 'Torres', 'Mendoza', 'TOMG891105MDFRRF08', '89012345678', '1989-11-05', 'Femenino', 'Ingeniera de Procesos', 'Manufactura', 'O+', 'activo'),
    (empresa_id, cliente1_id, 'EMP-009', 'Luis Alberto', 'Pérez', 'Jiménez', 'PEJL870728HDFRRB09', '90123456789', '1987-07-28', 'Masculino', 'Electricista', 'Mantenimiento', 'A+', 'activo'),
    (empresa_id, cliente3_id, 'EMP-010', 'Diana', 'García', 'Flores', 'GAFD930315MDFRRF10', '01234567890', '1993-03-15', 'Femenino', 'Auxiliar Administrativo', 'Administración', 'AB-', 'activo');
END $$;

-- ============================================
-- 3. TIPOS DE EXAMEN
-- ============================================

INSERT INTO tipos_examen (empresa_id, nombre, descripcion, duracion_minutos, precio) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Examen Pre-Empleo Básico', 'Incluye: Historia clínica, exploración física, biometría hemática, química sanguínea, examen general de orina', 60, 850.00),
  ('00000000-0000-0000-0000-000000000001', 'Examen Pre-Empleo Completo', 'Básico + Audiometría, Espirometría, Rayos X de Tórax', 90, 1500.00),
  ('00000000-0000-0000-0000-000000000001', 'Examen Periódico Anual', 'Evaluación de salud ocupacional anual', 45, 650.00),
  ('00000000-0000-0000-0000-000000000001', 'Evaluación Psicométrica', 'Batería de pruebas psicométricas para operadores', 120, 500.00),
  ('00000000-0000-0000-0000-000000000001', 'Audiometría', 'Evaluación de capacidad auditiva', 30, 250.00),
  ('00000000-0000-0000-0000-000000000001', 'Espirometría', 'Evaluación de función pulmonar', 20, 200.00),
  ('00000000-0000-0000-0000-000000000001', 'Rayos X Tórax', 'Radiografía posteroanterior de tórax', 15, 350.00);

-- ============================================
-- 4. CITAS DE EJEMPLO (para hoy y próximos días)
-- ============================================

DO $$
DECLARE
  empresa_id UUID := '00000000-0000-0000-0000-000000000001';
  paciente1 UUID;
  paciente2 UUID;
  paciente3 UUID;
  paciente4 UUID;
  paciente5 UUID;
  hoy DATE := CURRENT_DATE;
BEGIN
  -- Obtener IDs de pacientes
  SELECT id INTO paciente1 FROM pacientes WHERE numero_empleado = 'EMP-001' LIMIT 1;
  SELECT id INTO paciente2 FROM pacientes WHERE numero_empleado = 'EMP-002' LIMIT 1;
  SELECT id INTO paciente3 FROM pacientes WHERE numero_empleado = 'EMP-003' LIMIT 1;
  SELECT id INTO paciente4 FROM pacientes WHERE numero_empleado = 'EMP-004' LIMIT 1;
  SELECT id INTO paciente5 FROM pacientes WHERE numero_empleado = 'EMP-005' LIMIT 1;

  -- Citas de hoy
  INSERT INTO citas (empresa_id, paciente_id, tipo, fecha, hora_inicio, hora_fin, estado, notas) VALUES
    (empresa_id, paciente1, 'periodico', hoy, '09:00', '09:45', 'programada', 'Examen anual'),
    (empresa_id, paciente2, 'pre_empleo', hoy, '10:00', '11:30', 'confirmada', 'Nuevo ingreso - Supervisora'),
    (empresa_id, paciente3, 'consulta', hoy, '11:30', '12:00', 'programada', 'Seguimiento de lesión'),
    (empresa_id, paciente4, 'pre_empleo', hoy, '14:00', '15:30', 'programada', 'Examen pre-empleo completo');

  -- Citas de mañana
  INSERT INTO citas (empresa_id, paciente_id, tipo, fecha, hora_inicio, hora_fin, estado, notas) VALUES
    (empresa_id, paciente5, 'periodico', hoy + 1, '09:00', '09:45', 'programada', 'Examen anual chofer'),
    (empresa_id, paciente1, 'consulta', hoy + 1, '10:00', '10:30', 'programada', 'Revisión de resultados');

  -- Citas de la próxima semana
  INSERT INTO citas (empresa_id, paciente_id, tipo, fecha, hora_inicio, hora_fin, estado, notas) VALUES
    (empresa_id, paciente2, 'periodico', hoy + 7, '09:00', '09:45', 'programada', 'Examen anual'),
    (empresa_id, paciente3, 'egreso', hoy + 7, '10:00', '10:45', 'programada', 'Examen de egreso');
END $$;

-- ============================================
-- FIN DE DATOS DEMO
-- ============================================

-- Verificar datos insertados
SELECT 'Empresas cliente:' as tabla, COUNT(*) as total FROM empresas_cliente
UNION ALL
SELECT 'Pacientes:', COUNT(*) FROM pacientes
UNION ALL
SELECT 'Tipos de examen:', COUNT(*) FROM tipos_examen
UNION ALL
SELECT 'Citas:', COUNT(*) FROM citas;
