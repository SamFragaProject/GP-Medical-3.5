CREATE TABLE puestos_trabajo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    nivel_riesgo TEXT CHECK (nivel_riesgo IN ('bajo',
    'medio',
    'alto',
    'muy_alto')),
    protocolo_examen_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);