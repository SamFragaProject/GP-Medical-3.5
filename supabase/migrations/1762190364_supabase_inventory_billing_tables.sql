-- Migration: supabase_inventory_billing_tables
-- Created at: 1762190364

-- =============================================================================
-- TABLAS DE INVENTARIO Y FACTURACIÓN
-- =============================================================================

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre varchar(255) NOT NULL,
  codigo varchar(100),
  descripcion text,
  categoria varchar(100),
  tipo enum_tipo_producto NOT NULL,
  unidad_medida varchar(50) NOT NULL,
  precio_compra decimal(10,2) DEFAULT 0,
  precio_venta decimal(10,2) DEFAULT 0,
  stock_minimo integer DEFAULT 0,
  stock_maximo integer DEFAULT 0,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(empresa_id, codigo)
);

-- Tabla de lotes
CREATE TABLE IF NOT EXISTS lotes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id uuid NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  numero_lote varchar(100) NOT NULL,
  fecha_vencimiento date,
  fecha_ingreso timestamp with time zone DEFAULT now(),
  stock_actual integer DEFAULT 0,
  precio_compra decimal(10,2),
  proveedor varchar(255),
  estado enum_estado_lote DEFAULT 'disponible',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(producto_id, numero_lote)
);

-- Tabla de movimientos de inventario
CREATE TABLE IF NOT EXISTS movimientos_inventario (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
  producto_id uuid NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  lote_id uuid REFERENCES lotes(id),
  tipo_movimiento enum_tipo_movimiento NOT NULL,
  cantidad integer NOT NULL,
  precio_unitario decimal(10,2),
  motivo text,
  referencia_tipo varchar(50),
  referencia_id uuid,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  fecha_movimiento timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Tabla de órdenes de cobro
CREATE TABLE IF NOT EXISTS ordenes_cobro (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
  paciente_id uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  numero_orden varchar(50) NOT NULL,
  fecha_orden timestamp with time zone DEFAULT now(),
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  descuento decimal(10,2) DEFAULT 0,
  impuestos decimal(10,2) DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  estado enum_estado_orden_cobro DEFAULT 'pendiente',
  notas text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(empresa_id, numero_orden)
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  orden_cobro_id uuid NOT NULL REFERENCES ordenes_cobro(id) ON DELETE CASCADE,
  monto decimal(10,2) NOT NULL,
  metodo_pago enum_metodo_pago NOT NULL,
  fecha_pago timestamp with time zone DEFAULT now(),
  numero_transaccion varchar(100),
  referencia_bancaria varchar(255),
  banco varchar(100),
  observaciones text,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Tabla de facturas
CREATE TABLE IF NOT EXISTS facturas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  orden_cobro_id uuid NOT NULL REFERENCES ordenes_cobro(id) ON DELETE CASCADE,
  numero_factura varchar(50) NOT NULL,
  fecha_factura timestamp with time zone DEFAULT now(),
  nit_cliente varchar(20),
  razon_social_cliente varchar(255),
  direccion_cliente text,
  items jsonb NOT NULL DEFAULT '[]',
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  descuento decimal(10,2) DEFAULT 0,
  impuestos decimal(10,2) DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  estado enum_estado_factura DEFAULT 'emitida',
  archivo_pdf_url text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(orden_cobro_id, numero_factura)
);

SELECT 'Tablas de inventario y facturación aplicadas exitosamente' as status, now() as timestamp;;