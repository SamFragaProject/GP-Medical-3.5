-- EJE 13: Inventarios Médicos Inteligentes (Farmacia)

-- 1. Inventario Maestro de Medicamentos y Materiales
CREATE TABLE IF NOT EXISTS public.inventario_medicamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    
    sku TEXT UNIQUE, -- Código de barras o interno
    nombre_comercial TEXT NOT NULL,
    nombre_generico TEXT,
    presentacion TEXT, -- Caja con 20 tabletas, Frasco 120ml
    lote TEXT,
    fecha_caducidad DATE,
    
    stock_actual INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 10,
    precio_unitario DECIMAL(10,2), -- Costo promedio
    precio_venta DECIMAL(10,2), -- Si se vende al empleado/externo
    
    ubicacion_almacen TEXT, -- Estante A, Cajón 3
    estado TEXT DEFAULT 'disponible', -- disponible, agotado, caducado, cuarentena
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Movimientos de Inventario (Kardex)
CREATE TABLE IF NOT EXISTS public.movimientos_inventario (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.inventario_medicamentos(id) ON DELETE CASCADE,
    
    tipo_movimiento TEXT NOT NULL, -- entrada_compra, salida_receta, salida_ajuste, entrada_ajuste, merma
    cantidad INTEGER NOT NULL, -- Siempre positivo, la lógica lo suma o resta
    
    referencia_id UUID, -- ID de Receta (si es salida_receta) o ID de Orden de Compra
    origen_ref TEXT, -- 'recetas_medicas', 'orden_compra', 'manual'
    
    usuario_id UUID REFERENCES public.profiles(id), -- Quién hizo el movimiento
    observaciones TEXT,
    
    fecha_movimiento TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.inventario_medicamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos_inventario ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Ver inventario empresa" ON public.inventario_medicamentos FOR ALL USING (empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Ver movimientos empresa" ON public.movimientos_inventario FOR ALL USING (empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()));
