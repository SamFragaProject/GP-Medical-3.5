-- Add inventario_id to detalles_receta
ALTER TABLE public.detalles_receta 
ADD COLUMN IF NOT EXISTS inventario_id UUID REFERENCES public.inventario_medicamentos(id);
