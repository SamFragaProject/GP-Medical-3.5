-- Tabla para el Censo de Asientos y Cumplimiento Ley Silla
CREATE TABLE IF NOT EXISTS public.ley_silla_areas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    nombre_area TEXT NOT NULL, -- Ej: Línea de Producción A
    ubicacion_fisica TEXT,
    
    -- Diagnóstico Ley Silla
    total_trabajadores INTEGER DEFAULT 0,
    trabajadores_de_pie INTEGER DEFAULT 0, -- Cuántos trabajan parados la mayor parte del tiempo
    asientos_disponibles INTEGER DEFAULT 0, -- Asientos con respaldo disponibles
    
    -- Estado de cumplimiento
    cumple_ratio BOOLEAN DEFAULT FALSE, -- Si asientos >= trabajadores_de_pie (o ratio definido)
    tipo_asiento TEXT, -- 'ergonomico', 'banco', 'silla_fija', 'ninguno'
    estado_mobiliario TEXT, -- 'bueno', 'regular', 'malo'
    
    -- Evidencia
    foto_evidencia_url TEXT, -- URL de la foto del área con sillas (Para inspección)
    fecha_ultima_inspeccion TIMESTAMP WITH TIME ZONE,
    
    -- Protocolo de Descanso
    protocolo_descanso TEXT, -- Ej: "5 min cada 2 horas"
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.ley_silla_areas ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Ver areas Ley Silla de mi empresa" ON public.ley_silla_areas
    FOR SELECT USING (empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Gestionar areas Ley Silla de mi empresa" ON public.ley_silla_areas
    FOR ALL USING (empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()));
