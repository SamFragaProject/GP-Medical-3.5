-- ============================================
-- DESHABILITAR RLS TEMPORALMENTE (SOLO PARA PRUEBAS)
-- IMPORTANTE: Habilitar de nuevo para producción
-- ============================================

-- Opción A: Deshabilitar RLS completamente (NO RECOMENDADO PARA PRODUCCIÓN)
ALTER TABLE pacientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE citas DISABLE ROW LEVEL SECURITY;
ALTER TABLE examenes DISABLE ROW LEVEL SECURITY;
ALTER TABLE empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE empresas_cliente DISABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_examen DISABLE ROW LEVEL SECURITY;

-- Verificar que los datos son accesibles
SELECT 'Pacientes accesibles:' as status, COUNT(*) as total FROM pacientes;
