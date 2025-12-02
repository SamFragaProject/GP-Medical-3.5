-- Migration: create_prescriptions_orders_results_indexes
-- Created at: 1762189445

-- Índices para recetas
CREATE INDEX IF NOT EXISTS idx_recetas_empresa_id ON recetas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_recetas_sede_id ON recetas(sede_id);
CREATE INDEX IF NOT EXISTS idx_recetas_paciente_id ON recetas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_recetas_doctor_id ON recetas(doctor_id);
CREATE INDEX IF NOT EXISTS idx_recetas_fecha ON recetas(fecha_receta);
CREATE INDEX IF NOT EXISTS idx_recetas_numero ON recetas(numero_receta);
CREATE INDEX IF NOT EXISTS idx_recetas_dispensada ON recetas(dispensada);

-- Índices para órdenes de estudio
CREATE INDEX IF NOT EXISTS idx_ordenes_estudio_empresa_id ON ordenes_estudio(empresa_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_estudio_sede_id ON ordenes_estudio(sede_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_estudio_paciente_id ON ordenes_estudio(paciente_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_estudio_doctor_id ON ordenes_estudio(doctor_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_estudio_fecha ON ordenes_estudio(fecha_orden);
CREATE INDEX IF NOT EXISTS idx_ordenes_estudio_numero ON ordenes_estudio(numero_orden);
CREATE INDEX IF NOT EXISTS idx_ordenes_estudio_tipo ON ordenes_estudio(tipo_estudio);
CREATE INDEX IF NOT EXISTS idx_ordenes_estudio_estado ON ordenes_estudio(estado);

-- Índices para resultados de estudio
CREATE INDEX IF NOT EXISTS idx_resultados_estudio_empresa_id ON resultados_estudio(empresa_id);
CREATE INDEX IF NOT EXISTS idx_resultados_estudio_orden_id ON resultados_estudio(orden_estudio_id);
CREATE INDEX IF NOT EXISTS idx_resultados_estudio_fecha ON resultados_estudio(fecha_resultado);
CREATE INDEX IF NOT EXISTS idx_resultados_estudio_estudio ON resultados_estudio(estudio_individual);
CREATE INDEX IF NOT EXISTS idx_resultados_estudio_tecnico_id ON resultados_estudio(tecnico_id);
CREATE INDEX IF NOT EXISTS idx_resultados_estudio_revision ON resultados_estudio(revision_medica);;