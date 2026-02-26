-- ============================================================
-- Migración: Agregar módulo Analizador de Documentos IA
-- GPMedical ERP — Herramientas
-- ============================================================

-- Insertar el módulo en modulos_sistema
INSERT INTO modulos_sistema (codigo, nombre, descripcion, icono, gradiente, categoria, orden, ruta, es_premium, requiere_licencia_medica, activo)
VALUES (
    'analizador_documentos',
    'Analizador IA',
    'Analiza documentos médicos subidos (PDFs, imágenes, DOCX, ZIP) con inteligencia artificial y extrae datos estructurados para integrar con pacientes.',
    'Brain',
    'from-violet-500 to-fuchsia-500',
    'operativo',
    95,
    '/herramientas/analizador',
    false,
    false,
    true
)
ON CONFLICT (codigo) DO NOTHING;

-- Insertar también importar_exportar si no existe
INSERT INTO modulos_sistema (codigo, nombre, descripcion, icono, gradiente, categoria, orden, ruta, es_premium, requiere_licencia_medica, activo)
VALUES (
    'importar_exportar',
    'Importar / Exportar',
    'Importación masiva de datos desde CSV/Excel y exportación de registros del sistema.',
    'Database',
    'from-cyan-500 to-blue-600',
    'operativo',
    94,
    '/herramientas/importar',
    false,
    false,
    true
)
ON CONFLICT (codigo) DO NOTHING;

-- Dar permisos completos a los roles de admin
INSERT INTO rol_modulo_permisos (rol_id, modulo_id, puede_ver, puede_crear, puede_editar, puede_borrar, puede_exportar, puede_ver_todos, puede_aprobar, puede_firmar, puede_imprimir)
SELECT r.id, m.id, true, true, true, true, true, true, true, true, true
FROM roles r
CROSS JOIN modulos_sistema m
WHERE r.nombre IN ('super_admin', 'admin_saas', 'admin_empresa')
  AND m.codigo IN ('analizador_documentos', 'importar_exportar')
  AND NOT EXISTS (
    SELECT 1 FROM rol_modulo_permisos rmp WHERE rmp.rol_id = r.id AND rmp.modulo_id = m.id
  );
