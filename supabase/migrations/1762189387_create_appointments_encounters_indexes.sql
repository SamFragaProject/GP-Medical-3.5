-- Migration: create_appointments_encounters_indexes
-- Created at: 1762189387

-- Índices para optimización de citas y encuentros
CREATE INDEX IF NOT EXISTS idx_citas_empresa_id ON citas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_citas_sede_id ON citas(sede_id);
CREATE INDEX IF NOT EXISTS idx_citas_paciente_id ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_doctor_id ON citas(doctor_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha_hora_inicio);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);
CREATE INDEX IF NOT EXISTS idx_citas_recordatorio ON citas(recordatorio_enviado);

CREATE INDEX IF NOT EXISTS idx_encuentros_empresa_id ON encuentros(empresa_id);
CREATE INDEX IF NOT EXISTS idx_encuentros_sede_id ON encuentros(sede_id);
CREATE INDEX IF NOT EXISTS idx_encuentros_paciente_id ON encuentros(paciente_id);
CREATE INDEX IF NOT EXISTS idx_encuentros_doctor_id ON encuentros(doctor_id);
CREATE INDEX IF NOT EXISTS idx_encuentros_fecha ON encuentros(fecha_encuentro);
CREATE INDEX IF NOT EXISTS idx_encuentros_cita_id ON encuentros(cita_id);

CREATE INDEX IF NOT EXISTS idx_notas_clinicas_empresa_id ON notas_clinicas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_notas_clinicas_encuentro_id ON notas_clinicas(encuentro_id);
CREATE INDEX IF NOT EXISTS idx_notas_clinicas_doctor_id ON notas_clinicas(doctor_id);
CREATE INDEX IF NOT EXISTS idx_notas_clinicas_fecha ON notas_clinicas(fecha_nota);;