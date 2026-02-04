-- Tabla para evaluaciones de riesgo ergonómico NOM-036-1 (Manejo Manual de Cargas)
CREATE TABLE IF NOT EXISTS public.nom036_evaluaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    puesto_trabajo TEXT NOT NULL, -- Puesto o tarea específica evaluada
    descripcion_tarea TEXT,
    fecha_evaluacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    evaluador_id UUID REFERENCES public.profiles(id), -- Usuario que realiza la evaluación
    
    -- Variables de la Evaluación (Método Simple / Específico)
    peso_carga_kg DECIMAL(5,2) NOT NULL, -- Peso real de la carga
    frecuencia_levantamientos INTEGER, -- Número de levantamientos por minuto/hora
    duracion_tarea_horas DECIMAL(4,2), -- Tiempo total de la actividad
    
    -- Factores de Riesgo (Se guardan estructurados para el algoritmo)
    factores_riesgo JSONB DEFAULT '{}'::jsonb, 
    /* Estructura esperada de factores_riesgo:
       {
         "postura_tronco": "erguido" | "flexionado" | "torsion",
         "distancia_vertical": "suelo" | "nudillos" | "hombros",
         "distancia_horizontal": "cerca" | "lejos",
         "asimetria": boolean,
         "agarre": "bueno" | "regular" | "malo",
         "restricciones_espacio": boolean
       }
    */

    -- Resultados
    nivel_riesgo_calculado TEXT, -- 'bajo', 'medio', 'alto', 'muy_alto'
    color_riesgo TEXT, -- 'verde', 'amarillo', 'naranja', 'rojo'
    indice_riesgo DECIMAL(5,2), -- Score numérico si aplica
    
    -- Gestión
    medidas_preventivas_sugeridas TEXT,
    estado TEXT DEFAULT 'borrador', -- 'borrador', 'finalizado'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.nom036_evaluaciones ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad
CREATE POLICY "Ver evaluaciones de mi empresa" ON public.nom036_evaluaciones
    FOR SELECT USING (empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Crear/Editar evaluaciones de mi empresa" ON public.nom036_evaluaciones
    FOR ALL USING (empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()));
