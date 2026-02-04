-- EJE 14: Compras y Proveedores

-- 1. Tabla de Proveedores
CREATE TABLE IF NOT EXISTS public.proveedores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    
    nombre_comercial TEXT NOT NULL,
    razon_social TEXT,
    rfc TEXT,
    
    contacto_nombre TEXT,
    contacto_email TEXT,
    contacto_telefono TEXT,
    
    direccion TEXT,
    dias_credito INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Órdenes de Compra
CREATE TABLE IF NOT EXISTS public.ordenes_compra (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    proveedor_id UUID REFERENCES public.proveedores(id),
    usuario_creador_id UUID REFERENCES public.profiles(id),
    
    folio TEXT, -- Auto-generado o manual
    fecha_emision TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_entrega_estimada DATE,
    
    estado TEXT DEFAULT 'borrador', -- borrador, enviada, recibida_parcial, completada, cancelada
    observaciones TEXT,
    
    total_estimado DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Detalles de Orden (Items)
CREATE TABLE IF NOT EXISTS public.detalles_orden_compra (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    orden_id UUID REFERENCES public.ordenes_compra(id) ON DELETE CASCADE,
    
    -- El item que se va a comprar (debe existir en inventario base o ser un nuevo registro temporal)
    inventario_id UUID REFERENCES public.inventario_medicamentos(id),
    
    cantidad_solicitada INTEGER NOT NULL,
    cantidad_recibida INTEGER DEFAULT 0, -- Para controlar recepciones parciales
    
    costo_unitario DECIMAL(10,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordenes_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalles_orden_compra ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Ver proveedores empresa" ON public.proveedores FOR ALL USING (
    empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Ver ordenes empresa" ON public.ordenes_compra FOR ALL USING (
    empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Ver detalles orden" ON public.detalles_orden_compra FOR ALL USING (
    EXISTS (SELECT 1 FROM public.ordenes_compra o WHERE o.id = detalles_orden_compra.orden_id AND o.empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()))
);
