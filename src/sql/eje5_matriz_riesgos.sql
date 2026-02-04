-- EJE 5: Matriz Automática de Riesgos a la Salud por Puesto

-- 1. Catálogo de Puestos de Trabajo
CREATE TABLE IF NOT EXISTS public.puestos_trabajo (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL, -- Ej: Soldador, Chofer de Reparto
    descripcion TEXT,
    departamento TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Catálogo Maestro de Riesgos (Puede ser global o por empresa)
CREATE TABLE IF NOT EXISTS public.catalogo_riesgos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL, -- Ej: Ruido > 85dB, Sílice, Cargas Manuales
    categoria TEXT NOT NULL, -- fisico, quimico, biologico, ergonomico, psicosocial
    codigo_normativo TEXT, -- Ej: NOM-011-STPS
    organo_blanco TEXT, -- Ej: Oído, Pulmones, Columna
    active BOOLEAN DEFAULT TRUE
);

-- 3. Matriz Puesto - Riesgo (El corazón del Eje 5)
CREATE TABLE IF NOT EXISTS public.matriz_riesgos_puesto (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    puesto_id UUID REFERENCES public.puestos_trabajo(id) ON DELETE CASCADE,
    riesgo_id UUID REFERENCES public.catalogo_riesgos(id) ON DELETE CASCADE,
    
    -- Evaluación del Riesgo Específico para este Puesto
    nivel_exposicion TEXT, -- bajo, medio, alto
    frecuencia TEXT, -- ocasional, frecuente, constante
    controles_existentes TEXT, -- Ej: Tapones auditivos, Extractor de aire
    
    score_riesgo INTEGER DEFAULT 0, -- Calculado (Severidad x Frecuencia)
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Protocolos Médicos por Puesto (Matriz de Exámenes)
CREATE TABLE IF NOT EXISTS public.protocolos_puesto (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    puesto_id UUID REFERENCES public.puestos_trabajo(id) ON DELETE CASCADE,
    
    tipo_examen TEXT NOT NULL, -- ingreso, periodico, especial, salida
    estudios_requeridos JSONB, -- Lista de IDs de catalogo_estudios [id1, id2]
    frecuencia_meses INTEGER, -- Cada cuánto se repite (12 = anual)
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed de Riesgos Comunes
INSERT INTO public.catalogo_riesgos (nombre, categoria, Organo_blanco) VALUES
('Ruido > 85dB', 'fisico', 'Oído'),
('Polvos Inorgánicos (Sílice, Asbesto)', 'quimico', 'Pulmones'),
('Manejo Manual de Cargas', 'ergonomico', 'Columna Vertebral'),
('Solventes Orgánicos', 'quimico', 'Sistema Nervioso / Hígado'),
('Trabajo en Alturas', 'seguridad', 'Trauma'),
('Pantallas de Visualización > 4hrs', 'ergonomico', 'Ojos / Cervicales'),
('Estrés Laboral / Burnout', 'psicosocial', 'Sistema Nervioso')
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE public.puestos_trabajo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogo_riesgos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matriz_riesgos_puesto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocolos_puesto ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Ver puestos empresa" ON public.puestos_trabajo FOR ALL USING (empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Ver catalogo riesgos" ON public.catalogo_riesgos FOR SELECT USING (true); -- Global para todos
CREATE POLICY "Gestionar matriz" ON public.matriz_riesgos_puesto FOR ALL USING (EXISTS (SELECT 1 FROM public.puestos_trabajo p WHERE p.id = matriz_riesgos_puesto.puesto_id AND p.empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "Gestionar protocolos" ON public.protocolos_puesto FOR ALL USING (EXISTS (SELECT 1 FROM public.puestos_trabajo p WHERE p.id = protocolos_puesto.puesto_id AND p.empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())));
