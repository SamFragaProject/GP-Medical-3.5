/**
 * 📦 SERVICIO DE INVENTARIO V2
 */

import { supabase } from '@/lib/supabase';
import type {
  Producto,
  Lote,
  MovimientoInventario,
  CreateProductoInput,
  UpdateStockInput,
  InventarioFilters,
  InventarioStats,
} from '../types/inventario.types';

class InventarioService {
  private readonly TABLE_PRODUCTOS = 'productos';
  private readonly TABLE_LOTES = 'lotes';
  private readonly TABLE_MOVIMIENTOS = 'movimientos_inventario';

  /**
   * Obtener productos
   */
  async getProductos(
    empresaId: string,
    filters: InventarioFilters = {}
  ): Promise<Producto[]> {
    let query = supabase
      .from(this.TABLE_PRODUCTOS)
      .select(`
        *,
        proveedor:proveedor_id(id, nombre, telefono, email)
      `)
      .eq('empresa_id', empresaId);

    if (filters.search) {
      query = query.or(`
        nombre.ilike.%${filters.search}%,
        codigo.ilike.%${filters.search}%,
        codigo_barras.ilike.%${filters.search}%
      `);
    }

    if (filters.tipo) {
      query = query.eq('tipo', filters.tipo);
    }

    if (filters.activo !== undefined) {
      query = query.eq('activo', filters.activo);
    }

    if (filters.proveedorId) {
      query = query.eq('proveedor_id', filters.proveedorId);
    }

    if (filters.bajoStock) {
      query = query.lte('stock_actual', supabase.raw('stock_minimo'));
    }

    query = query.order('nombre');

    const { data, error } = await query;

    if (error) {
      throw this.handleError(error);
    }

    return (data || []).map(this.mapProductoFromDB);
  }

  /**
   * Obtener productos con bajo stock
   */
  async getProductosBajoStock(empresaId: string): Promise<Producto[]> {
    return this.getProductos(empresaId, { bajoStock: true, activo: true });
  }

  /**
   * Obtener un producto
   */
  async getProducto(id: string, empresaId: string): Promise<Producto | null> {
    const { data, error } = await supabase
      .from(this.TABLE_PRODUCTOS)
      .select(`
        *,
        proveedor:proveedor_id(*)
      `)
      .eq('id', id)
      .eq('empresa_id', empresaId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw this.handleError(error);
    }

    return data ? this.mapProductoFromDB(data) : null;
  }

  /**
   * Crear producto
   */
  async createProducto(
    input: CreateProductoInput,
    empresaId: string,
    userId: string
  ): Promise<Producto> {
    const dbData = {
      empresa_id: empresaId,
      codigo: input.codigo,
      codigo_barras: input.codigoBarras,
      nombre: input.nombre,
      descripcion: input.descripcion,
      tipo: input.tipo,
      unidad_medida: input.unidadMedida,
      stock_minimo: input.stockMinimo,
      stock_maximo: input.stockMaximo,
      stock_actual: 0,
      stock_reservado: 0,
      stock_disponible: 0,
      costo_unitario: input.costoUnitario,
      precio_venta: input.precioVenta,
      proveedor_id: input.proveedorId,
      ubicacion: input.ubicacion,
      requiere_refrigeracion: input.requiereRefrigeracion || false,
      maneja_lotes: input.manejaLotes || false,
      activo: true,
      created_by: userId,
    };

    const { data, error } = await supabase
      .from(this.TABLE_PRODUCTOS)
      .insert([dbData])
      .select(`
        *,
        proveedor:proveedor_id(*)
      `)
      .single();

    if (error) {
      throw this.handleError(error);
    }

    return this.mapProductoFromDB(data);
  }

  /**
   * Actualizar stock
   */
  async updateStock(
    input: UpdateStockInput,
    empresaId: string,
    userId: string
  ): Promise<void> {
    // Obtener stock actual
    const { data: producto, error: errorProducto } = await supabase
      .from(this.TABLE_PRODUCTOS)
      .select('stock_actual, stock_disponible')
      .eq('id', input.productoId)
      .eq('empresa_id', empresaId)
      .single();

    if (errorProducto) {
      throw this.handleError(errorProducto);
    }

    const stockAnterior = producto.stock_actual;
    let cantidadReal = input.cantidad;

    // Para salidas, la cantidad es negativa
    if (['salida', 'ajuste_negativo'].includes(input.tipo)) {
      cantidadReal = -Math.abs(input.cantidad);
    }

    const stockNuevo = stockAnterior + cantidadReal;

    // Validar que no quede negativo
    if (stockNuevo < 0) {
      throw new Error('No hay suficiente stock disponible');
    }

    // Iniciar transacción
    const { error: errorUpdate } = await supabase
      .from(this.TABLE_PRODUCTOS)
      .update({
        stock_actual: stockNuevo,
        stock_disponible: stockNuevo - producto.stock_reservado,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.productoId)
      .eq('empresa_id', empresaId);

    if (errorUpdate) {
      throw this.handleError(errorUpdate);
    }

    // Registrar movimiento
    const { error: errorMovimiento } = await supabase
      .from(this.TABLE_MOVIMIENTOS)
      .insert([{
        empresa_id: empresaId,
        producto_id: input.productoId,
        lote_id: input.loteId,
        tipo: input.tipo,
        cantidad: cantidadReal,
        stock_anterior: stockAnterior,
        stock_nuevo: stockNuevo,
        motivo: input.motivo,
        documento_referencia: input.documentoReferencia,
        usuario_id: userId,
      }]);

    if (errorMovimiento) {
      throw this.handleError(errorMovimiento);
    }
  }

  /**
   * Obtener movimientos de un producto
   */
  async getMovimientos(
    productoId: string,
    empresaId: string
  ): Promise<MovimientoInventario[]> {
    const { data, error } = await supabase
      .from(this.TABLE_MOVIMIENTOS)
      .select(`
        *,
        usuario:usuario_id(id, nombre, apellido_paterno)
      `)
      .eq('producto_id', productoId)
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false });

    if (error) {
      throw this.handleError(error);
    }

    return (data || []).map(this.mapMovimientoFromDB);
  }

  /**
   * Obtener estadísticas
   */
  async getStats(empresaId: string): Promise<InventarioStats> {
    const { data, error } = await supabase
      .from(this.TABLE_PRODUCTOS)
      .select('*')
      .eq('empresa_id', empresaId);

    if (error || !data) {
      return {
        totalProductos: 0,
        productosActivos: 0,
        productosBajoStock: 0,
        productosAgotados: 0,
        valorTotal: 0,
      };
    }

    const productos = data.map(this.mapProductoFromDB);

    return {
      totalProductos: productos.length,
      productosActivos: productos.filter(p => p.activo).length,
      productosBajoStock: productos.filter(
        p => p.activo && p.stockActual <= p.stockMinimo
      ).length,
      productosAgotados: productos.filter(
        p => p.activo && p.stockActual === 0
      ).length,
      valorTotal: productos.reduce(
        (sum, p) => sum + p.stockActual * p.costoUnitario, 0
      ),
    };
  }

  /**
   * Mapear producto
   */
  private mapProductoFromDB(data: any): Producto {
    return {
      id: data.id,
      empresaId: data.empresa_id,
      codigo: data.codigo,
      codigoBarras: data.codigo_barras,
      nombre: data.nombre,
      descripcion: data.descripcion,
      tipo: data.tipo,
      categoriaId: data.categoria_id,
      unidadMedida: data.unidad_medida,
      contenidoPorUnidad: data.contenido_por_unidad,
      stockMinimo: data.stock_minimo,
      stockMaximo: data.stock_maximo,
      stockActual: data.stock_actual,
      stockReservado: data.stock_reservado,
      stockDisponible: data.stock_disponible,
      ubicacion: data.ubicacion,
      almacenId: data.almacen_id,
      requiereRefrigeracion: data.requiere_refrigeracion,
      temperaturaMinima: data.temperatura_minima,
      temperaturaMaxima: data.temperatura_maxima,
      costoUnitario: data.costo_unitario,
      precioVenta: data.precio_venta,
      proveedorId: data.proveedor_id,
      proveedor: data.proveedor,
      manejaLotes: data.maneja_lotes,
      activo: data.activo,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
    };
  }

  /**
   * Mapear movimiento
   */
  private mapMovimientoFromDB(data: any): MovimientoInventario {
    return {
      id: data.id,
      empresaId: data.empresa_id,
      productoId: data.producto_id,
      loteId: data.lote_id,
      tipo: data.tipo,
      cantidad: data.cantidad,
      stockAnterior: data.stock_anterior,
      stockNuevo: data.stock_nuevo,
      motivo: data.motivo,
      documentoReferencia: data.documento_referencia,
      usuarioId: data.usuario_id,
      usuario: data.usuario,
      createdAt: data.created_at,
    };
  }

  /**
   * Manejar errores
   */
  private handleError(error: any): Error {
    const messages: Record<string, string> = {
      '23505': 'Ya existe un producto con ese código',
      'PGRST116': 'Producto no encontrado',
      '42501': 'No tienes permisos',
    };

    return new Error(messages[error.code] || error.message || 'Error desconocido');
  }
}

export const inventarioService = new InventarioService();
