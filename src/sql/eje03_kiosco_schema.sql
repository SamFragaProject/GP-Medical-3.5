
-- Tabla para la Cola de Recepción (Sala de Espera)
-- Eje 3: Kiosco Médico e Integración

CREATE TABLE IF NOT EXISTS cola_recepcion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT now(),
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE, -- Nullable for new patients
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    tipo_registro TEXT NOT NULL CHECK (tipo_registro IN ('cita_previa', 'nuevo_paciente')),
    prioridad TEXT DEFAULT 'normal' CHECK (prioridad IN ('normal', 'urgente', 'preferencial')),
    estado TEXT DEFAULT 'espera' CHECK (estado IN ('espera', 'llamado', 'en_consulta', 'finalizado', 'cancelado')),
    motivo_visita TEXT,
    medico_id UUID REFERENCES usuarios(id), -- Médico solicitado o asignado
    metadata JSONB DEFAULT '{}'::jsonb,
    tenant_id UUID REFERENCES empresas(id) -- Para RLS consistente con el sistema
);

-- RLS
ALTER TABLE cola_recepcion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company's queue"
ON cola_recepcion FOR SELECT
TO authenticated
USING (empresa_id = (SELECT empresa_id FROM usuarios WHERE id = auth.uid()));

CREATE POLICY "Users can manage their company's queue"
ON cola_recepcion FOR ALL
TO authenticated
USING (empresa_id = (SELECT empresa_id FROM usuarios WHERE id = auth.uid()))
WITH CHECK (empresa_id = (SELECT empresa_id FROM usuarios WHERE id = auth.uid()));

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_cola_recepcion_empresa ON cola_recepcion(empresa_id);
CREATE INDEX IF NOT EXISTS idx_cola_recepcion_estado ON cola_recepcion(estado);
CREATE INDEX IF NOT EXISTS idx_cola_recepcion_created ON cola_recepcion(created_at);
