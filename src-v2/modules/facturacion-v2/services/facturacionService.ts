/**
 * 💰 SERVICIO DE FACTURACIÓN V2
 */

import { supabase } from '@/lib/supabase';
import type {
  Factura,
  ClienteFiscal,
  CreateFacturaInput,
  FacturaFilters,
  FacturaStats,
  ConceptoFactura,
} from '../types/facturacion.types';

class FacturacionService {
  private readonly TABLE_FACTURAS = 'facturas';
  private readonly TABLE_CLIENTES = 'clientes_fiscales';

  /**
   * Obtener facturas
   */
  async getFacturas(
    empresaId: string,
    filters: FacturaFilters = {}
  ): Promise<Factura[]> {
    let query = supabase
      .from(this.TABLE_FACTURAS)
      .select(`
        *,
        conceptos:conceptos_factura(*)
      `)
      .eq('empresa_id', empresaId);

    if (filters.estado) {
      query = query.eq('estado', filters.estado);
    }
    if (filters.receptorId) {
      query = query.eq('receptor_id', filters.receptorId);
    }
    if (filters.fechaDesde) {
      query = query.gte('fecha_emision', filters.fechaDesde);
    }
    if (filters.fechaHasta) {
      query = query.lte('fecha_emision', filters.fechaHasta);
    }
    if (filters.serie) {
      query = query.eq('serie', filters.serie);
    }
    if (filters.folio) {
      query = query.eq('folio', filters.folio);
    }

    query = query.order('fecha_emision', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw this.handleError(error);
    }

    return (data || []).map(this.mapFacturaFromDB);
  }

  /**
   * Obtener una factura
   */
  async getFactura(id: string, empresaId: string): Promise<Factura | null> {
    const { data, error } = await supabase
      .from(this.TABLE_FACTURAS)
      .select(`
        *,
        conceptos:conceptos_factura(*)
      `)
      .eq('id', id)
      .eq('empresa_id', empresaId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw this.handleError(error);
    }

    return data ? this.mapFacturaFromDB(data) : null;
  }

  /**
   * Crear factura (borrador)
   */
  async createFactura(
    input: CreateFacturaInput,
    empresaId: string,
    userId: string
  ): Promise<Factura> {
    // Obtener datos del receptor
    const { data: receptor, error: errorReceptor } = await supabase
      .from(this.TABLE_CLIENTES)
      .select('*')
      .eq('id', input.receptorId)
      .eq('empresa_id', empresaId)
      .single();

    if (errorReceptor || !receptor) {
      throw new Error('Cliente no encontrado');
    }

    // Calcular totales
    const conceptosConImporte = input.conceptos.map(c => ({
      ...c,
      importe: c.cantidad * c.valorUnitario - (c.descuento || 0),
    }));

    const subtotal = conceptosConImporte.reduce((sum, c) => sum + c.importe, 0);
    const descuento = conceptosConImporte.reduce((sum, c) => sum + (c.descuento || 0), 0);
    
    // Calcular impuestos (IVA 16% por defecto)
    const tasaIVA = 0.16;
    const impuestosTrasladados = subtotal * tasaIVA;
    const total = subtotal + impuestosTrasladados;

    // Crear factura
    const { data: factura, error: errorFactura } = await supabase
      .from(this.TABLE_FACTURAS)
      .insert([{
        empresa_id: empresaId,
        receptor_id: receptor.id,
        receptor_rfc: receptor.rfc,
        receptor_nombre: receptor.nombre,
        receptor_uso_cfdi: receptor.uso_cfdi_predeterminado,
        tipo_comprobante: input.tipoComprobante,
        fecha_emision: new Date().toISOString(),
        subtotal,
        descuento,
        impuestos_trasladados: impuestosTrasladados,
        impuestos_retenidos: 0,
        total,
        moneda: 'MXN',
        tipo_cambio: 1,
        metodo_pago: input.metodoPago,
        forma_pago: input.formaPago,
        condiciones_pago: input.condicionesPago,
        estado: 'borrador',
        created_by: userId,
      }])
      .select()
      .single();

    if (errorFactura) {
      throw this.handleError(errorFactura);
    }

    // Crear conceptos
    const conceptosDB = conceptosConImporte.map(c => ({
      factura_id: factura.id,
      clave_prod_serv: c.claveProdServ,
      clave_unidad: c.claveUnidad,
      unidad: c.unidad,
      descripcion: c.descripcion,
      cantidad: c.cantidad,
      valor_unitario: c.valorUnitario,
      importe: c.importe,
      descuento: c.descuento || 0,
    }));

    const { error: errorConceptos } = await supabase
      .from('conceptos_factura')
      .insert(conceptosDB);

    if (errorConceptos) {
      // Rollback: eliminar factura
      await supabase.from(this.TABLE_FACTURAS).delete().eq('id', factura.id);
      throw this.handleError(errorConceptos);
    }

    return this.getFactura(factura.id, empresaId) as Promise<Factura>;
  }

  /**
   * Timbrar factura (simulado)
   * En producción, esto conectaría con un PAC
   */
  async timbrarFactura(
    id: string,
    empresaId: string
  ): Promise<Factura> {
    // Simular timbrado
    const uuid = `UUID-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const { data, error } = await supabase
      .from(this.TABLE_FACTURAS)
      .update({
        uuid,
        estado: 'timbrada',
        fecha_certificacion: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('empresa_id', empresaId)
      .select()
      .single();

    if (error) {
      throw this.handleError(error);
    }

    return this.mapFacturaFromDB(data);
  }

  /**
   * Cancelar factura
   */
  async cancelarFactura(
    id: string,
    motivo: string,
    empresaId: string
  ): Promise<void> {
    const { error } = await supabase
      .from(this.TABLE_FACTURAS)
      .update({
        estado: 'cancelada',
        motivo_cancelacion: motivo,
        fecha_cancelacion: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('empresa_id', empresaId);

    if (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtener clientes fiscales
   */
  async getClientes(empresaId: string): Promise<ClienteFiscal[]> {
    const { data, error } = await supabase
      .from(this.TABLE_CLIENTES)
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('activo', true)
      .order('nombre');

    if (error) {
      throw this.handleError(error);
    }

    return (data || []).map(this.mapClienteFromDB);
  }

  /**
   * Crear cliente fiscal
   */
  async createCliente(
    cliente: Omit<ClienteFiscal, 'id' | 'empresaId' | 'createdAt'>,
    empresaId: string
  ): Promise<ClienteFiscal> {
    const { data, error } = await supabase
      .from(this.TABLE_CLIENTES)
      .insert([{
        empresa_id: empresaId,
        rfc: cliente.rfc,
        nombre: cliente.nombre,
        regimen_fiscal: cliente.regimenFiscal,
        codigo_postal: cliente.codigoPostal,
        calle: cliente.calle,
        numero_exterior: cliente.numeroExterior,
        numero_interior: cliente.numeroInterior,
        colonia: cliente.colonia,
        municipio: cliente.municipio,
        estado: cliente.estado,
        pais: cliente.pais,
        email: cliente.email,
        telefono: cliente.telefono,
        uso_cfdi_predeterminado: cliente.usoCFDIPredeterminado,
        activo: true,
      }])
      .select()
      .single();

    if (error) {
      throw this.handleError(error);
    }

    return this.mapClienteFromDB(data);
  }

  /**
   * Obtener estadísticas
   */
  async getStats(empresaId: string): Promise<FacturaStats> {
    const { data, error } = await supabase
      .from(this.TABLE_FACTURAS)
      .select('*')
      .eq('empresa_id', empresaId);

    if (error || !data) {
      return {
        totalFacturas: 0,
        totalTimbradas: 0,
        totalCanceladas: 0,
        montoTotal: 0,
        montoPendiente: 0,
        facturasPorMes: [],
      };
    }

    const facturas = data.map(this.mapFacturaFromDB);

    // Agrupar por mes
    const porMes = new Map<string, { total: number; monto: number }>();
    facturas.forEach(f => {
      const mes = f.fechaEmision.substring(0, 7); // YYYY-MM
      const actual = porMes.get(mes) || { total: 0, monto: 0 };
      actual.total++;
      actual.monto += f.total;
      porMes.set(mes, actual);
    });

    return {
      totalFacturas: facturas.length,
      totalTimbradas: facturas.filter(f => f.estado === 'timbrada').length,
      totalCanceladas: facturas.filter(f => f.estado === 'cancelada').length,
      montoTotal: facturas
        .filter(f => f.estado === 'timbrada')
        .reduce((sum, f) => sum + f.total, 0),
      montoPendiente: facturas
        .filter(f => f.estado === 'borrador')
        .reduce((sum, f) => sum + f.total, 0),
      facturasPorMes: Array.from(porMes.entries())
        .map(([mes, datos]) => ({
          mes,
          total: datos.total,
          monto: datos.monto,
        }))
        .sort((a, b) => a.mes.localeCompare(b.mes)),
    };
  }

  // Mappers
  private mapFacturaFromDB(data: any): Factura {
    return {
      id: data.id,
      empresaId: data.empresa_id,
      uuid: data.uuid,
      serie: data.serie,
      folio: data.folio,
      emisorRFC: data.emisor_rfc,
      emisorNombre: data.emisor_nombre,
      emisorRegimenFiscal: data.emisor_regimen_fiscal,
      receptorId: data.receptor_id,
      receptorRFC: data.receptor_rfc,
      receptorNombre: data.receptor_nombre,
      receptorUsoCFDI: data.receptor_uso_cfdi,
      tipoComprobante: data.tipo_comprobante,
      fechaEmision: data.fecha_emision,
      fechaCertificacion: data.fecha_certificacion,
      subtotal: data.subtotal,
      descuento: data.descuento,
      impuestosTrasladados: data.impuestos_trasladados,
      impuestosRetenidos: data.impuestos_retenidos,
      total: data.total,
      moneda: data.moneda,
      tipoCambio: data.tipo_cambio,
      metodoPago: data.metodo_pago,
      formaPago: data.forma_pago,
      condicionesPago: data.condiciones_pago,
      conceptos: (data.conceptos || []).map((c: any) => ({
        id: c.id,
        facturaId: c.factura_id,
        claveProdServ: c.clave_prod_serv,
        claveUnidad: c.clave_unidad,
        unidad: c.unidad,
        descripcion: c.descripcion,
        cantidad: c.cantidad,
        valorUnitario: c.valor_unitario,
        importe: c.importe,
        descuento: c.descuento,
        impuestos: [], // Simplificado
      })),
      estado: data.estado,
      motivoCancelacion: data.motivo_cancelacion,
      fechaCancelacion: data.fecha_cancelacion,
      xmlUrl: data.xml_url,
      pdfUrl: data.pdf_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
    };
  }

  private mapClienteFromDB(data: any): ClienteFiscal {
    return {
      id: data.id,
      empresaId: data.empresa_id,
      rfc: data.rfc,
      nombre: data.nombre,
      regimenFiscal: data.regimen_fiscal,
      codigoPostal: data.codigo_postal,
      calle: data.calle,
      numeroExterior: data.numero_exterior,
      numeroInterior: data.numero_interior,
      colonia: data.colonia,
      municipio: data.municipio,
      estado: data.estado,
      pais: data.pais,
      email: data.email,
      telefono: data.telefono,
      usoCFDIPredeterminado: data.uso_cfdi_predeterminado,
      activo: data.activo,
      createdAt: data.created_at,
    };
  }

  private handleError(error: any): Error {
    const messages: Record<string, string> = {
      '23505': 'Ya existe un registro con esos datos',
      'PGRST116': 'Registro no encontrado',
      '42501': 'No tienes permisos',
    };

    return new Error(messages[error.code] || error.message || 'Error desconocido');
  }
}

export const facturacionService = new FacturacionService();
