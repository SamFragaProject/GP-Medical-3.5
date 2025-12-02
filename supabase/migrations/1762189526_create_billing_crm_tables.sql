-- Migration: create_billing_crm_tables
-- Created at: 1762189526

-- Tabla de órdenes de cobro
CREATE TABLE IF NOT EXISTS ordenes_cobro (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE SET NULL,
  paciente_id uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  cita_id uuid REFERENCES citas(id),
  encuentro_id uuid REFERENCES encuentros(id),
  numero_orden VARCHAR(50) UNIQUE,
  fecha_orden TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  descuentos DECIMAL(12,2) NOT NULL DEFAULT 0,
  impuestos DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  saldo_pendiente DECIMAL(12,2) NOT NULL DEFAULT 0,
  estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, parcial, pagado, cancelado, vencido
  fecha_vencimiento DATE,
  metodo_pago VARCHAR(50), -- efectivo, tarjeta, transferencia, etc.
  notas TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE SET NULL,
  orden_cobro_id uuid NOT NULL REFERENCES ordenes_cobro(id) ON DELETE CASCADE,
  numero_pago VARCHAR(50) UNIQUE,
  fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  monto DECIMAL(12,2) NOT NULL,
  metodo_pago VARCHAR(50) NOT NULL, -- efectivo, tarjeta_credito, tarjeta_debito, transferencia, cheque
  referencia_banco VARCHAR(100),
  numero_transaccion VARCHAR(100),
  numero_cheque VARCHAR(100),
  beneficiario VARCHAR(255),
  caja_id uuid, -- referencia a caja donde se recibió el pago
  usuario_recibe uuid REFERENCES usuarios_perfil(id),
  estado VARCHAR(50) DEFAULT 'completado', -- pendiente, completado, rechazado, anulado
  fecha_conciliacion TIMESTAMP WITH TIME ZONE,
  conciliado_por uuid REFERENCES usuarios_perfil(id),
  notas TEXT,
  documento_url TEXT, -- URL del comprobante
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de facturas
CREATE TABLE IF NOT EXISTS facturas (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE SET NULL,
  orden_cobro_id uuid NOT NULL REFERENCES ordenes_cobro(id) ON DELETE CASCADE,
  paciente_id uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  numero_factura VARCHAR(50) UNIQUE,
  numero_control VARCHAR(50),
  prefijo_factura VARCHAR(10),
  fecha_factura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  descuento DECIMAL(12,2) NOT NULL DEFAULT 0,
  base_imponible DECIMAL(12,2) NOT NULL DEFAULT 0,
  impuestos DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  estado VARCHAR(50) DEFAULT 'borrador', -- borrador, emitida, anulada, circulacion
  fecha_emision TIMESTAMP WITH TIME ZONE,
  fecha_vencimiento DATE,
  punto_venta VARCHAR(100),
  direccion_facturacion TEXT,
  observaciones TEXT,
  archivo_pdf_url TEXT,
  hash_factura VARCHAR(255),
  requiere_firma BOOLEAN DEFAULT false,
  firmada_por uuid REFERENCES usuarios_perfil(id),
  fecha_firma TIMESTAMP WITH TIME ZONE,
  anular_motivo TEXT,
  anulada_por uuid REFERENCES usuarios_perfil(id),
  fecha_anulacion TIMESTAMP WITH TIME ZONE,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para facturación
CREATE INDEX IF NOT EXISTS idx_ordenes_cobro_empresa_id ON ordenes_cobro(empresa_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_cobro_sede_id ON ordenes_cobro(sede_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_cobro_paciente_id ON ordenes_cobro(paciente_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_cobro_cita_id ON ordenes_cobro(cita_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_cobro_fecha ON ordenes_cobro(fecha_orden);
CREATE INDEX IF NOT EXISTS idx_ordenes_cobro_numero ON ordenes_cobro(numero_orden);
CREATE INDEX IF NOT EXISTS idx_ordenes_cobro_estado ON ordenes_cobro(estado);

CREATE INDEX IF NOT EXISTS idx_pagos_empresa_id ON pagos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pagos_sede_id ON pagos(sede_id);
CREATE INDEX IF NOT EXISTS idx_pagos_orden_cobro_id ON pagos(orden_cobro_id);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_numero ON pagos(numero_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_metodo ON pagos(metodo_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos(estado);

CREATE INDEX IF NOT EXISTS idx_facturas_empresa_id ON facturas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_facturas_sede_id ON facturas(sede_id);
CREATE INDEX IF NOT EXISTS idx_facturas_orden_cobro_id ON facturas(orden_cobro_id);
CREATE INDEX IF NOT EXISTS idx_facturas_paciente_id ON facturas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_facturas_numero ON facturas(numero_factura);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas(fecha_factura);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON facturas(estado);;