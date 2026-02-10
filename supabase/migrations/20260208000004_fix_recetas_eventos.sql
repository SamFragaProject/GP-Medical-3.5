-- Migración para arreglar Recetas y Eventos Clínicos
-- Fecha: 2026-02-08

-- 1. Asegurar empresa_id y metadata en Recetas
ALTER TABLE recetas 
ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Índice para empresa_id en recetas
CREATE INDEX IF NOT EXISTS idx_recetas_empresa ON recetas(empresa_id);

-- Política RLS para Recetas
DROP POLICY IF EXISTS "Usuarios ven recetas de su empresa" ON recetas;
CREATE POLICY "Usuarios ven recetas de su empresa" ON recetas
    FOR ALL USING (
        empresa_id IN (
            SELECT empresa_id FROM usuarios WHERE id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM pacientes p
            JOIN usuarios u ON u.empresa_id = p.empresa_id
            WHERE p.id = recetas.paciente_id AND u.id = auth.uid()
        )
    );

-- 2. Crear tabla de Eventos Clínicos (Historial Unificado)
CREATE TABLE IF NOT EXISTS eventos_clinicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES empresas(id),
    
    tipo_evento VARCHAR(50) NOT NULL, -- 'consulta', 'receta', 'examen', 'certificado', 'nota'
    descripcion TEXT,
    metadata JSONB DEFAULT '{}'::jsonb, -- Para guardar IDs relacionados o datos extra
    
    fecha_evento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para eventos clínicos
CREATE INDEX IF NOT EXISTS idx_eventos_paciente ON eventos_clinicos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_eventos_empresa ON eventos_clinicos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos_clinicos(fecha_evento);

-- Habilitar RLS en eventos_clinicos
ALTER TABLE eventos_clinicos ENABLE ROW LEVEL SECURITY;

-- Política RLS para Eventos Clínicos
DROP POLICY IF EXISTS "Usuarios ven eventos de su empresa" ON eventos_clinicos;
CREATE POLICY "Usuarios ven eventos de su empresa" ON eventos_clinicos
    FOR ALL USING (
        empresa_id IN (
            SELECT empresa_id FROM usuarios WHERE id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM pacientes p
            JOIN usuarios u ON u.empresa_id = p.empresa_id
            WHERE p.id = eventos_clinicos.paciente_id AND u.id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Usuarios crean eventos en su empresa" ON eventos_clinicos;
CREATE POLICY "Usuarios crean eventos en su empresa" ON eventos_clinicos
    FOR INSERT WITH CHECK (
        empresa_id IN (
            SELECT empresa_id FROM usuarios WHERE id = auth.uid()
        )
    );
