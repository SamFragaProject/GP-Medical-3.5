-- Tabla para gestionar periodos o campañas de evaluación NOM-035
CREATE TABLE IF NOT EXISTS public.nom035_campanas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL, -- Ej: Evaluación 2025
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
    estado TEXT DEFAULT 'activa', -- activa, cerrada, borrador
    tipo_encuesta TEXT NOT NULL, -- guia_i, guia_ii, guia_iii
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para guardar las respuestas individuales
CREATE TABLE IF NOT EXISTS public.nom035_respuestas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campana_id UUID REFERENCES public.nom035_campanas(id) ON DELETE CASCADE,
    empleado_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE, -- Vinculado al paciente/empleado
    respuestas JSONB NOT NULL, -- Objeto con { p1: "si", p2: "no", ... }
    resultado_calculado TEXT, -- riesgo_nulo, riesgo_bajo, riesgo_medio, riesgo_alto, riesgo_muy_alto
    scores_por_categoria JSONB, -- { ambiente: 10, carga: 5, ... }
    fecha_respuesta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Políticas RLS (Row Level Security)
ALTER TABLE public.nom035_campanas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nom035_respuestas ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo ven campañas de su empresa
CREATE POLICY "Usuarios ven campañas de su empresa" ON public.nom035_campanas
    FOR SELECT USING (empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()));

-- Política: Admin crea campañas para su empresa
CREATE POLICY "Admins crean campañas" ON public.nom035_campanas
    FOR INSERT WITH CHECK (empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()));

-- Política: Empleados solo ven/crean sus propias respuestas (Ojo: aquí asumimos que el usuario logueado responde)
-- En un escenario kiosco, el médico podría registrar la respuesta.
CREATE POLICY "Médicos registran respuestas" ON public.nom035_respuestas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND (rol_principal IN ('medico', 'enfermera', 'admin_sede', 'super_admin'))
        )
    );
