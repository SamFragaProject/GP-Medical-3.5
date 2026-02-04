-- =============================================
-- EJE 9: FACTURACIÓN ELECTRÓNICA 4.0 (CFDI)
-- =============================================

-- 1. CONFIGURACIÓN DEL EMISOR (Datos de la Empresa para Facturar)
CREATE TABLE IF NOT EXISTS public.facturacion_emisor (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    rfc TEXT NOT NULL,
    razon_social TEXT NOT NULL,
    regimen_fiscal TEXT NOT NULL, -- Clave del catálogo SAT (ej: 601)
    lugar_expedicion TEXT NOT NULL, -- Código Postal
    certificado_numero TEXT,
    archivo_cer_url TEXT, -- URL segura o path
    archivo_key_url TEXT,
    clave_privada TEXT, -- Encriptada (simulado para demo)
    logo_base64 TEXT, -- Opcional para PDF
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(empresa_id)
);

-- 2. DATOS FISCALES DE CLIENTES (Pacientes)
CREATE TABLE IF NOT EXISTS public.facturacion_clientes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE SET NULL,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    rfc TEXT NOT NULL,
    razon_social TEXT NOT NULL,
    regimen_fiscal TEXT NOT NULL, -- Clave SAT
    uso_cfdi TEXT NOT NULL, -- Clave SAT (ej: G03)
    codigo_postal TEXT NOT NULL,
    direccion_fiscal TEXT,
    email_envio TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CABECERA DE FACTURA (CFDI)
CREATE TABLE IF NOT EXISTS public.facturacion_cfdis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES public.facturacion_clientes(id),
    
    -- Datos Generales
    serie TEXT,
    folio TEXT,
    fecha_emision TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tipo_comprobante TEXT DEFAULT 'I', -- I=Ingreso, E=Egreso
    metodo_pago TEXT NOT NULL, -- PUE, PPD
    forma_pago TEXT NOT NULL, -- 01, 03, 04...
    moneda TEXT DEFAULT 'MXN',
    tipo_cambio NUMERIC(10,4) DEFAULT 1,
    
    -- Totales
    subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
    descuento NUMERIC(15,2) DEFAULT 0,
    total_impuestos_trasladados NUMERIC(15,2) DEFAULT 0,
    total_impuestos_retenidos NUMERIC(15,2) DEFAULT 0,
    total NUMERIC(15,2) NOT NULL DEFAULT 0,
    
    -- Timbrado (Resultado del PAC)
    uuid_sat TEXT, -- Folio Fiscal
    fecha_timbrado TIMESTAMP WITH TIME ZONE,
    rfc_prov_certif TEXT,
    sello_cfdi TEXT,
    sello_sat TEXT,
    cadena_original TEXT,
    xml_completo TEXT, -- Contenido XML
    
    -- Estado
    estado TEXT DEFAULT 'borrador', -- borrador, timbrada, cancelada
    motivo_cancelacion TEXT,
    
    -- Relaciones (Origen)
    origen_tabla TEXT, -- 'consultas', 'ventas_farmacia'
    origen_id UUID,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id)
);

-- 4. CONCEPTOS DE FACTURA
CREATE TABLE IF NOT EXISTS public.facturacion_conceptos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cfdi_id UUID REFERENCES public.facturacion_cfdis(id) ON DELETE CASCADE,
    
    clave_prod_serv TEXT NOT NULL, -- Catálogo SAT
    no_identificacion TEXT,
    cantidad NUMERIC(12,2) NOT NULL,
    clave_unidad TEXT NOT NULL, -- Catálogo SAT (H87, etc)
    unidad TEXT,
    descripcion TEXT NOT NULL,
    valor_unitario NUMERIC(15,2) NOT NULL,
    importe NUMERIC(15,2) NOT NULL,
    descuento NUMERIC(15,2) DEFAULT 0,
    
    -- Impuestos por concepto (JSON simplificado para flexibilidad)
    -- Ejemplo: { "traslados": [{ "base": 100, "impuesto": "002", "tasa": 0.16, "importe": 16 }] }
    impuestos_json JSONB DEFAULT '{}'::JSONB
);

-- POLÍTICAS DE SEGURIDAD (RLS)
ALTER TABLE public.facturacion_emisor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facturacion_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facturacion_cfdis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facturacion_conceptos ENABLE ROW LEVEL SECURITY;

-- Policy: Emisor
CREATE POLICY "Acceso total a config emisor por empresa" ON public.facturacion_emisor
    FOR ALL USING (empresa_id::text = current_setting('app.current_empresa_id', true));

-- Policy: Clientes
CREATE POLICY "Acceso a clientes fiscales por empresa" ON public.facturacion_clientes
    FOR ALL USING (empresa_id::text = current_setting('app.current_empresa_id', true));

-- Policy: CFDIs
CREATE POLICY "Acceso a facturas por empresa" ON public.facturacion_cfdis
    FOR ALL USING (empresa_id::text = current_setting('app.current_empresa_id', true));

-- Policy: Conceptos (basado en factura padre)
CREATE POLICY "Acceso a conceptos via factura" ON public.facturacion_conceptos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.facturacion_cfdis c 
            WHERE c.id = facturacion_conceptos.cfdi_id 
            AND c.empresa_id::text = current_setting('app.current_empresa_id', true)
        )
    );
