-- Migration: create_inventory_tables_with_constraints
-- Created at: 1762189485

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE SET NULL,
  codigo VARCHAR(100) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(100),
  subcategoria VARCHAR(100),
  tipo VARCHAR(50),
  presentacion VARCHAR(100),
  concentracion VARCHAR(100),
  unidad_medida VARCHAR(20) NOT NULL,
  precio_compra DECIMAL(12,2) DEFAULT 0,
  precio_venta DECIMAL(12,2) DEFAULT 0,
  precio_venta_publico DECIMAL(12,2) DEFAULT 0,
  stock_minimo INTEGER DEFAULT 0,
  stock_maximo INTEGER DEFAULT 0,
  stock_actual INTEGER DEFAULT 0,
  controlado BOOLEAN DEFAULT false,
  requiere_receta BOOLEAN DEFAULT false,
  estado VARCHAR(50) DEFAULT 'activo',
  proveedor_principal VARCHAR(255),
  fecha_ultima_compra DATE,
  activo BOOLEAN DEFAULT true,
  imagen_url TEXT,
  codigo_barras VARCHAR(100),
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de lotes
CREATE TABLE IF NOT EXISTS lotes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  producto_id uuid NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  numero_lote VARCHAR(100) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  fecha_entrada DATE NOT NULL,
  cantidad_inicial INTEGER NOT NULL,
  cantidad_actual INTEGER NOT NULL,
  precio_unitario DECIMAL(12,4),
  proveedor VARCHAR(255),
  factura_compra VARCHAR(100),
  estado VARCHAR(50) DEFAULT 'disponible',
  ubicacion_almacen VARCHAR(100),
  temperatura_almacen VARCHAR(50),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar columnas faltantes a movimientos_inventario
ALTER TABLE movimientos_inventario 
ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS lote_id uuid REFERENCES lotes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS cantidad_antes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cantidad_despues INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS motivo VARCHAR(255),
ADD COLUMN IF NOT EXISTS referencia_id uuid,
ADD COLUMN IF NOT EXISTS referencia_tipo VARCHAR(50),
ADD COLUMN IF NOT EXISTS costo_unitario DECIMAL(12,4),
ADD COLUMN IF NOT EXISTS precio_venta DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS observaciones TEXT,
ADD COLUMN IF NOT EXISTS documento_soporte VARCHAR(255),
ADD COLUMN IF NOT EXISTS sede_origen uuid REFERENCES sedes(id),
ADD COLUMN IF NOT EXISTS sede_destino uuid REFERENCES sedes(id);;