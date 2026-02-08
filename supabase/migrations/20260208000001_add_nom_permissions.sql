-- =====================================================
-- MIGRACIÓN: Agregar Permisos NOM Faltantes
-- Fecha: 2026-02-08
-- =====================================================

-- 1. Agregar módulos faltantes en catálogo
INSERT INTO modulos_sistema (codigo, nombre, descripcion, icono, gradiente, categoria, orden, ruta, es_premium, requiere_licencia_medica, activo)
VALUES
    ('dictamenes', 'Dictámenes', 'Dictámenes Médico-Laborales', 'file-text', 'from-emerald-500 to-teal-600', 'operativo', 15, '/medicina/dictamenes', false, true, true),
    ('nom011', 'NOM-011', 'Conservación de la Audición', 'activity', 'from-amber-500 to-orange-600', 'especial', 16, '/nom-011/programa', true, true, true),
    ('episodios', 'Episodios', 'Urgencias y Atención Continua', 'clipboard-list', 'from-cyan-500 to-blue-600', 'operativo', 17, '/episodios', false, true, true)
ON CONFLICT (codigo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    ruta = EXCLUDED.ruta,
    activo = true;

-- 2. Asignar permisos a roles existentes

-- Admin Empresa (Full Access)
INSERT INTO permisos_rol (rol_id, modulo_codigo, puede_ver, puede_crear, puede_editar, puede_borrar, puede_exportar, puede_ver_todos, puede_aprobar, puede_firmar, puede_imprimir)
SELECT r.id, m.codigo, true, true, true, true, true, true, true, true, true
FROM roles_empresa r, modulos_sistema m
WHERE r.codigo = 'admin_empresa' AND m.codigo IN ('dictamenes', 'nom011', 'episodios')
ON CONFLICT (rol_id, modulo_codigo) DO UPDATE SET
    puede_ver = true,
    puede_crear = true,
    puede_editar = true;

-- Médico (Acceso Clínico)
INSERT INTO permisos_rol (rol_id, modulo_codigo, puede_ver, puede_crear, puede_editar, puede_borrar, puede_exportar, puede_ver_todos, puede_aprobar, puede_firmar, puede_imprimir)
SELECT r.id, m.codigo, true, true, true, false, true, false, false, true, true
FROM roles_empresa r, modulos_sistema m
WHERE r.codigo = 'medico' AND m.codigo IN ('dictamenes', 'nom011', 'episodios')
ON CONFLICT (rol_id, modulo_codigo) DO UPDATE SET
    puede_ver = true,
    puede_crear = true,
    puede_editar = true;
