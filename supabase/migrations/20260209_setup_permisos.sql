-- ============================================
-- MIGRACIÓN: Configuración de Permisos y Módulos
-- GPMedical ERP Pro - Setup Fase 1
-- Fecha: 2026-02-09
-- ============================================

-- 1. INSERTAR MÓDULOS EN EL CATÁLOGO
INSERT INTO modulos_sistema (
  modulo_codigo, 
  modulo_nombre, 
  modulo_descripcion, 
  modulo_icono, 
  modulo_ruta, 
  modulo_orden, 
  activo
) VALUES
  ('dictamenes', 'Dictámenes Médicos', 'Dictámenes médico-laborales con reglas de bloqueo', 'FileCheck', '/medicina/dictamenes', 50, true),
  ('nom011', 'NOM-011 Auditiva', 'Programa de Conservación Auditiva', 'Ear', '/nom-011/programa', 51, true),
  ('nom036', 'NOM-036 Ergonomía', 'Evaluaciones ergonómicas REBA/NIOSH', 'Armchair', '/nom-036/evaluacion/reba', 52, true),
  ('episodios', 'Episodios', 'Pipeline de atención médica', 'GitBranch', '/episodios/pipeline', 10, true),
  ('recepcion', 'Recepción', 'Check-in y registro de pacientes', 'CheckCircle', '/recepcion/checkin', 11, true),
  ('colas', 'Colas de Trabajo', 'Gestión de colas por rol', 'Users', '/episodios/cola/medico', 12, true)
ON CONFLICT (modulo_codigo) DO UPDATE SET 
  modulo_nombre = EXCLUDED.modulo_nombre,
  modulo_descripcion = EXCLUDED.modulo_descripcion,
  modulo_icono = EXCLUDED.modulo_icono,
  modulo_ruta = EXCLUDED.modulo_ruta,
  modulo_orden = EXCLUDED.modulo_orden,
  activo = EXCLUDED.activo;

-- 2. ASIGNAR PERMISOS A ROLES

-- MEDICO
INSERT INTO permisos_modulo (
  rol_codigo, modulo_codigo, 
  puede_ver, puede_crear, puede_editar, puede_borrar, puede_firmar
) VALUES
  ('medico', 'dictamenes', true, true, true, false, true),
  ('medico', 'nom011', true, true, true, false, false),
  ('medico', 'nom036', true, true, true, false, false),
  ('medico', 'episodios', true, true, true, false, false),
  ('medico', 'colas', true, false, false, false, false)
ON CONFLICT (rol_codigo, modulo_codigo) DO UPDATE SET
  puede_ver = EXCLUDED.puede_ver,
  puede_crear = EXCLUDED.puede_crear,
  puede_editar = EXCLUDED.puede_editar,
  puede_borrar = EXCLUDED.puede_borrar,
  puede_firmar = EXCLUDED.puede_firmar;

-- RECEPCION
INSERT INTO permisos_modulo (
  rol_codigo, modulo_codigo, 
  puede_ver, puede_crear, puede_editar, puede_borrar
) VALUES
  ('recepcion', 'recepcion', true, true, true, false),
  ('recepcion', 'episodios', true, true, false, false),
  ('recepcion', 'colas', true, false, false, false)
ON CONFLICT (rol_codigo, modulo_codigo) DO UPDATE SET
  puede_ver = EXCLUDED.puede_ver,
  puede_crear = EXCLUDED.puede_crear,
  puede_editar = EXCLUDED.puede_editar;

-- ADMIN EMPRESA
INSERT INTO permisos_modulo (
  rol_codigo, modulo_codigo, 
  puede_ver, puede_crear, puede_editar, puede_borrar, puede_exportar
) VALUES
  ('admin_empresa', 'dictamenes', true, false, false, false, true),
  ('admin_empresa', 'nom011', true, false, false, false, true),
  ('admin_empresa', 'nom036', true, false, false, false, true),
  ('admin_empresa', 'episodios', true, false, false, false, true)
ON CONFLICT (rol_codigo, modulo_codigo) DO UPDATE SET
  puede_ver = EXCLUDED.puede_ver,
  puede_crear = EXCLUDED.puede_crear,
  puede_editar = EXCLUDED.puede_editar,
  puede_exportar = EXCLUDED.puede_exportar;

-- SUPER ADMIN
INSERT INTO permisos_modulo (
  rol_codigo, modulo_codigo, 
  puede_ver, puede_crear, puede_editar, puede_borrar, puede_exportar, puede_aprobar
) VALUES
  ('super_admin', 'dictamenes', true, true, true, true, true, true),
  ('super_admin', 'nom011', true, true, true, true, true, true),
  ('super_admin', 'nom036', true, true, true, true, true, true),
  ('super_admin', 'episodios', true, true, true, true, true, true),
  ('super_admin', 'recepcion', true, true, true, true, true, true),
  ('super_admin', 'colas', true, true, true, true, true, true)
ON CONFLICT (rol_codigo, modulo_codigo) DO UPDATE SET
  puede_ver = EXCLUDED.puede_ver,
  puede_crear = EXCLUDED.puede_crear,
  puede_editar = EXCLUDED.puede_editar,
  puede_borrar = EXCLUDED.puede_borrar,
  puede_exportar = EXCLUDED.puede_exportar,
  puede_aprobar = EXCLUDED.puede_aprobar;
