-- Migration: supabase_triggers
-- Created at: 1762190429

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Trigger para establecer valores por defecto del tenant
CREATE OR REPLACE FUNCTION set_default_tenant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Si la tabla tiene empresa_id y sede_id, aplicar valores del contexto
  IF TG_TABLE_NAME IN ('pacientes', 'ordenes_cobro', 'productos', 'campañas', 'tareas_crm') THEN
    IF NEW.empresa_id IS NULL THEN
      NEW.empresa_id := current_empresa_id();
    END IF;
  END IF;
  
  IF TG_TABLE_NAME IN ('pacientes', 'ordenes_cobro', 'movimientos_inventario', 'tareas_crm') THEN
    IF NEW.sede_id IS NULL THEN
      NEW.sede_id := current_sede_id();
    END IF;
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Aplicar trigger a las tablas correspondientes
DROP TRIGGER IF EXISTS trigger_set_default_tenant_pacientes ON pacientes;
CREATE TRIGGER trigger_set_default_tenant_pacientes
  BEFORE INSERT OR UPDATE ON pacientes
  FOR EACH ROW EXECUTE FUNCTION set_default_tenant();

DROP TRIGGER IF EXISTS trigger_set_default_tenant_ordenes_cobro ON ordenes_cobro;
CREATE TRIGGER trigger_set_default_tenant_ordenes_cobro
  BEFORE INSERT OR UPDATE ON ordenes_cobro
  FOR EACH ROW EXECUTE FUNCTION set_default_tenant();

DROP TRIGGER IF EXISTS trigger_set_default_tenant_productos ON productos;
CREATE TRIGGER trigger_set_default_tenant_productos
  BEFORE INSERT OR UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION set_default_tenant();

DROP TRIGGER IF EXISTS trigger_set_default_tenant_movimientos_inventario ON movimientos_inventario;
CREATE TRIGGER trigger_set_default_tenant_movimientos_inventario
  BEFORE INSERT OR UPDATE ON movimientos_inventario
  FOR EACH ROW EXECUTE FUNCTION set_default_tenant();

DROP TRIGGER IF EXISTS trigger_set_default_tenant_campañas ON campañas;
CREATE TRIGGER trigger_set_default_tenant_campañas
  BEFORE INSERT OR UPDATE ON campañas
  FOR EACH ROW EXECUTE FUNCTION set_default_tenant();

DROP TRIGGER IF EXISTS trigger_set_default_tenant_tareas_crm ON tareas_crm;
CREATE TRIGGER trigger_set_default_tenant_tareas_crm
  BEFORE INSERT OR UPDATE ON tareas_crm
  FOR EACH ROW EXECUTE FUNCTION set_default_tenant();

-- Trigger para actualizar inventario después de movimiento
CREATE OR REPLACE FUNCTION inventario_after_mov()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Actualizar stock en lote después de movimiento
  IF TG_OP = 'INSERT' AND NEW.lote_id IS NOT NULL THEN
    UPDATE lotes 
    SET stock_actual = stock_actual + CASE 
      WHEN NEW.tipo_movimiento = 'entrada' THEN NEW.cantidad
      WHEN NEW.tipo_movimiento = 'salida' THEN -NEW.cantidad
      ELSE 0
    END
    WHERE id = NEW.lote_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_inventario_after_mov ON movimientos_inventario;
CREATE TRIGGER trigger_inventario_after_mov
  AFTER INSERT ON movimientos_inventario
  FOR EACH ROW EXECUTE FUNCTION inventario_after_mov();

-- Trigger para notificar resultados
CREATE OR REPLACE FUNCTION resultado_notifica()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Si el resultado cambia a 'completado', actualizar la orden de estudio
  IF NEW.estado = 'completado' AND (OLD.estado IS NULL OR OLD.estado != 'completado') THEN
    UPDATE ordenes_estudio 
    SET estado = 'completado', 
        resultados = NEW.resultado_completo
    WHERE id = NEW.orden_estudio_id;
    
    -- Aquí se podría agregar lógica para enviar notificaciones
    -- Por ejemplo, insertar en una cola de notificaciones o llamar a un webhook
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_resultado_notifica ON resultados_estudio;
CREATE TRIGGER trigger_resultado_notifica
  AFTER UPDATE ON resultados_estudio
  FOR EACH ROW EXECUTE FUNCTION resultado_notifica();

-- Trigger para generar factura al guardar orden de cobro
CREATE OR REPLACE FUNCTION orden_factura_guardar()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  numero_factura_var varchar(50);
  items_json jsonb;
  contador_facturas integer;
BEGIN
  -- Solo ejecutar si el estado cambia a 'pagada'
  IF NEW.estado = 'pagada' AND (OLD.estado IS NULL OR OLD.estado != 'pagada') THEN
    -- Obtener siguiente número de factura
    SELECT COALESCE(MAX(CAST(numero_factura AS integer)), 0) + 1
    INTO contador_facturas
    FROM facturas 
    WHERE orden_cobro_id = NEW.id;
    
    numero_factura_var := LPAD(contador_facturas::text, 8, '0');
    
    -- Crear factura automáticamente
    INSERT INTO facturas (
      orden_cobro_id,
      numero_factura,
      fecha_factura,
      subtotal,
      descuento,
      impuestos,
      total
    ) VALUES (
      NEW.id,
      numero_factura_var,
      now(),
      NEW.subtotal,
      NEW.descuento,
      NEW.impuestos,
      NEW.total
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_orden_factura_guardar ON ordenes_cobro;
CREATE TRIGGER trigger_orden_factura_guardar
  AFTER UPDATE ON ordenes_cobro
  FOR EACH ROW EXECUTE FUNCTION orden_factura_guardar();

SELECT 'Triggers aplicados exitosamente' as status, now() as timestamp;;