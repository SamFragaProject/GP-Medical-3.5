-- =====================================================
-- GPMEDICAL 3.5 EX - AI ENHANCEMENTS & DYNAMIC ROLES
-- =====================================================

-- 1. SOPORTE PARA ROLES PERSONALIZADOS POR EMPRESA
CREATE TABLE IF NOT EXISTS empresa_roles_personalizados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nombre_rol TEXT NOT NULL,
  descripcion TEXT,
  permisos JSONB NOT NULL DEFAULT '[]'::jsonb, -- Lista de permission_keys de permisos_rol
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, nombre_rol)
);

-- 2. HISTORIAL DE ANÁLISIS DE IA (IMÁGENES Y PREDICCIONES)
CREATE TABLE IF NOT EXISTS ai_analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  tipo_analisis TEXT NOT NULL CHECK (tipo_analisis IN ('vision_medica', 'prediccion_salud', 'protocolo_ia')),
  input_data JSONB, -- Datos enviados (o referencia a archivo)
  output_response TEXT NOT NULL, -- Respuesta de la IA
  metadata JSONB DEFAULT '{}',
  medico_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ESTUDIOS MÉDICOS PERSONALIZADOS (LABS, EXAMENES, IMAGEN)
CREATE TABLE IF NOT EXISTS catalogo_estudios_personalizados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nombre_estudio TEXT NOT NULL,
  categoria TEXT CHECK (categoria IN ('laboratorio', 'imagen', 'funcional', 'especializado')),
  descripcion TEXT,
  parametros_normales JSONB DEFAULT '{}',
  ia_enabled BOOLEAN DEFAULT false, -- Indica si la IA puede analizar este estudio
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, nombre_estudio)
);

-- 4. PUNTUACIÓN DE RIESGO IA PARA PACIENTES
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS ai_risk_score NUMERIC(3,2) DEFAULT 0.0;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS last_ai_prediction TIMESTAMPTZ;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS ai_prediction_summary TEXT;

-- 5. NOTAS DE VOZ E IMÁGENES EN CHATBOT
-- Ya soportadas por mensajes_chatbot.tipo_mensaje ('audio', 'imagen'), 
-- pero añadimos campos para storage.
ALTER TABLE mensajes_chatbot ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE mensajes_chatbot ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'completed' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed'));

-- 6. POLÍTICAS RLS PARA NUEVAS TABLAS
ALTER TABLE empresa_roles_personalizados ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_estudios_personalizados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Empresas ven sus roles personalizados" ON empresa_roles_personalizados
  FOR ALL USING (empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Empresas ven su historial de IA" ON ai_analysis_history
  FOR ALL USING (empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Empresas ven sus estudios personalizados" ON catalogo_estudios_personalizados
  FOR ALL USING (empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid()));
