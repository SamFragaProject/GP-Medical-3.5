-- =====================================================
-- GPMEDICAL EX - PLUGIN & MODULE SYSTEM
-- =====================================================

-- 1. CATÁLOGO DE MÓDULOS (PLUGINS) DEL SISTEMA
-- Estos son los "Add-ons" que el SAS ofrece (ej. "Lector Rayos X", "Psicometría Avanzada")
CREATE TABLE IF NOT EXISTS system_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL, -- ej. 'ai_xray_reader', 'psychometric_suite', 'dental_module'
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('clinical', 'administrative', 'hr', 'patient_portal', 'ai')),
  icon_name TEXT, -- Nombre del icono Lucide a usar
  version TEXT DEFAULT '1.0.0',
  is_premium BOOLEAN DEFAULT false,
  price_monthly NUMERIC(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ACTIVACIÓN DE MÓDULOS POR EMPRESA
-- Qué empresas tienen acceso a qué plugins
CREATE TABLE IF NOT EXISTS empresa_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  module_id UUID REFERENCES system_modules(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'trial', 'suspended')),
  config JSONB DEFAULT '{}', -- Configuración específica de la empresa para este módulo
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(empresa_id, module_id)
);

-- 3. EXÁMENES PSICOMÉTRICOS (MÓDULO RH)
-- Definición de pruebas que se pueden asignar
CREATE TABLE IF NOT EXISTS psychometric_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('personalidad', 'aptitud', 'riesgo', 'clima')),
  duration_minutes INTEGER DEFAULT 15,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array de preguntas
  scoring_logic JSONB DEFAULT '{}', -- Lógica para calcular resultados
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RESULTADOS DE PSICOMETRÍA
-- Historial de pruebas realizadas por usuarios/pacientes
CREATE TABLE IF NOT EXISTS psychometric_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES psychometric_tests(id),
  paciente_id UUID REFERENCES pacientes(id),
  respuestas JSONB NOT NULL, -- Lo que contestó
  score_total NUMERIC,
  interpretation TEXT, -- Interpretación automática o manual
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- 5. SEED DATA - MÓDULOS INICIALES
INSERT INTO system_modules (key, name, description, category, icon_name, is_premium) VALUES
('ai_xray_vision', 'Visión IA Radiológica', 'Asistente de interpretación de Rayos X y Resonancias con Inteligencia Artificial.', 'ai', 'ScanEye', true),
('hr_psychometrics', 'Suite Psicométrica', 'Batería de pruebas psicológicas y de aptitud personalizables.', 'hr', 'BrainCircuit', false),
('remote_telemed', 'Telemedicina Segura', 'Consultas remotas encriptadas con receta digital.', 'clinical', 'Video', true)
ON CONFLICT (key) DO NOTHING;

-- 6. PERMISOS RLS
ALTER TABLE system_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresa_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychometric_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychometric_results ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver los módulos disponibles
CREATE POLICY "Ver módulos sistema" ON system_modules FOR SELECT USING (true);

-- Empresas solo ven sus activaciones
CREATE POLICY "Empresa ver sus modulos" ON empresa_modules 
  FOR ALL USING (empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

-- Lógica de exámenes
CREATE POLICY "Empresa gestiona sus tests" ON psychometric_tests
  FOR ALL USING (empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Resultados visibles por empresa y paciente propio" ON psychometric_results
  FOR ALL USING (
    (auth.uid() IN (SELECT id FROM profiles WHERE empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid()) AND hierarchy IN ('super_admin', 'admin_empresa', 'medico_trabajo', 'psicologo_laboral')))
    OR 
    (paciente_id IN (SELECT id FROM pacientes WHERE email = (SELECT email FROM profiles WHERE id = auth.uid()))) -- Si el paciente tuviera login directo linkeado
  );
