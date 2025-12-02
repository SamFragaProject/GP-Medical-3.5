-- Migration: create_inventory_products_tables
-- Created at: 1762189467

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE SET NULL,
  codigo VARCHAR(100) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(100), -- medicamentos, insumos, equipos, etc.
  subcategoria VARCHAR(100),
  tipo VARCHAR(50), -- controlado, libre_venta, prescripcion
  presentacion VARCHAR(100), -- tablet, jarabe, ampolla, etc.
  concentracion VARCHAR(100), -- "500mg", "5%", etc.
  unidad_medida VARCHAR(20) NOT NULL, -- unidad, mg, ml, gramo, etc.
  precio_compra DECIMAL(12,2) DEFAULT 0,
  precio_venta DECIMAL(12,2) DEFAULT 0,
  precio_venta_publico DECIMAL(12,2) DEFAULT 0,
  stock_minimo INTEGER DEFAULT 0,
  stock_maximo INTEGER DEFAULT 0,
  stock_actual INTEGER DEFAULT 0,
  controlado BOOLEAN DEFAULT false,
  requiere_receta BOOLEAN DEFAULT false,
  estado VARCHAR(50) DEFAULT 'activo', -- activo, inactivo, discontinuado
  proveedor_principal VARCHAR(255),
  fecha_ultima_compra DATE,
  activo BOOLEAN DEFAULT true,
  imagen_url TEXT,
  codigo_barras VARCHAR(100),
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(empresa_id, codigo)
);

-- Tabla de lotes
CREATE TABLE IF NOT EXISTS lotes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  producto_id uuid NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  numero_lote VARCHAR(100) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  fecha_entrada DATE NOT NULL,
  cantidad_inicial INTEGER NOT NULL,
  cantidad_actual INTEGER NOT NULL,
  precio_unitario DECIMAL(12,4),
  proveedor VARCHAR(255),
  factura_compra VARCHAR(100),
  estado VARCHAR(50) DEFAULT 'disponible', -- disponible, reservado, vendido, vencido, dañado
  ubicacion_almacen VARCHAR(100),
  temperatura_almacen VARCHAR(50), -- ambiente, refrigerado, congelado
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(producto_id, numero_lote)
);

-- Tabla de movimientos de inventario
CREATE TABLE IF NOT EXISTS movimientos_inventario (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  producto_id uuid NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  lote_id uuid REFERENCES lotes(id) ON DELETE SET NULL,
  tipo_movimiento VARCHAR(50) NOT NULL, -- entrada, salida, ajuste, transferencia, devolucion, vencimiento
  cantidad INTEGER NOT NULL, -- positiva para entrada, negativa para salida
  cantidad_antes INTEGER NOT NULL,
  cantidad_despues INTEGER NOT NULL,
  motivo VARCHAR(255) NOT NULL,
  referencia_id uuid, -- puede referenciar venta, compra, receta, etc.
  referencia_tipo VARCHAR(50), -- venta, compra, receta, ajuste, etc.
  usuario_id uuid NOT NULL REFERENCES usuarios_perfil(id),
  costo_unitario DECIMAL(12,4),
  precio_venta DECIMAL(12,2),
  fecha_movimiento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  observaciones TEXT,
  documento_soporte VARCHAR(255), -- numero de factura, orden, etc.
  estado VARCHAR(50) DEFAULT 'confirmado', -- pendiente, confirmado, cancelado
  sede_origen uuid REFERENCES sedes(id),
  sede_destino uuid REFERENCES sedes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_productos_empresa_id ON productos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_productos_sede_id ON productos(sede_id);
CREATE INDEX IF NOT EXISTS idx_productos_codigo ON productos(codigo);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_tipo ON productos(tipo);
CREATE INDEX IF NOT EXISTS idx_productos_estado ON productos(estado);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);

CREATE INDEX IF NOT EXISTS idx_lotes_empresa_id ON lotes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_lotes_producto_id ON lotes(producto_id);
CREATE INDEX IF NOT EXISTS idx_lotes_numero ON lotes(numero_lote);
CREATE INDEX IF NOT EXISTS idx_lotes_vencimiento ON lotes(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_lotes_estado ON lotes(estado);

CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_empresa_id ON movimientos_inventario(empresa_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_producto_id ON movimientos_inventario(producto_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_lote_id ON movimientos_inventario(lote_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_tipo ON movimientos_inventario(tipo_movimiento);
CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_usuario_id ON movimientos_inventario(usuario_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_fecha ON movimientos_inventario(fecha_movimiento);
CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_referencia ON movimientos_inventario(referencia_id, referencia_tipo);;