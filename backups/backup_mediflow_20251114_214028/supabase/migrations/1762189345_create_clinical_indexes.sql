-- Migration: create_clinical_indexes
-- Created at: 1762189345

-- Índices para optimización de tablas clínicas
CREATE INDEX IF NOT EXISTS idx_pacientes_empresa_id ON pacientes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_sede_id ON pacientes(sede_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_documento ON pacientes(documento);
CREATE INDEX IF NOT EXISTS idx_pacientes_activo ON pacientes(activo);
CREATE INDEX IF NOT EXISTS idx_pacientes_nombres ON pacientes(nombres);
CREATE INDEX IF NOT EXISTS idx_pacientes_apellidos ON pacientes(apellidos);

CREATE INDEX IF NOT EXISTS idx_documentos_empresa_id ON documentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_documentos_paciente_id ON documentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON documentos(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_documentos_activo ON documentos(activo);

CREATE INDEX IF NOT EXISTS idx_consentimientos_empresa_id ON consentimientos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_consentimientos_paciente_id ON consentimientos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_consentimientos_fecha ON consentimientos(fecha_consentimiento);
CREATE INDEX IF NOT EXISTS idx_consentimientos_activo ON consentimientos(activo);;