/**
 * 📊 SERVICIO DE REPORTES V2
 */

import { supabase } from '@/lib/supabase';
import type {
  Reporte,
  ResultadoReporte,
  FiltrosReporte,
  DashboardStats,
  GraficaData,
} from '../types/reportes.types';

class ReportesService {
  private readonly TABLE_REPORTES = 'reportes';
  private readonly TABLE_RESULTADOS = 'resultados_reportes';

  /**
   * Obtener reportes guardados
   */
  async getReportes(empresaId: string): Promise<Reporte[]> {
    const { data, error } = await supabase
      .from(this.TABLE_REPORTES)
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('activo', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw this.handleError(error);
    }

    return (data || []).map(this.mapReporteFromDB);
  }

  /**
   * Crear reporte
   */
  async createReporte(
    reporte: Omit<Reporte, 'id' | 'empresaId' | 'createdAt' | 'updatedAt'>,
    empresaId: string,
    userId: string
  ): Promise<Reporte> {
    const { data, error } = await supabase
      .from(this.TABLE_REPORTES)
      .insert([{
        empresa_id: empresaId,
        nombre: reporte.nombre,
        descripcion: reporte.descripcion,
        tipo: reporte.tipo,
        formato: reporte.formato,
        periodicidad: reporte.periodicidad,
        filtros: reporte.filtros,
        columnas: reporte.columnas,
        programado: reporte.programado,
        dia_envio: reporte.diaEnvio,
        hora_envio: reporte.horaEnvio,
        email_destinatarios: reporte.emailDestinatarios,
        activo: true,
        created_by: userId,
      }])
      .select()
      .single();

    if (error) {
      throw this.handleError(error);
    }

    return this.mapReporteFromDB(data);
  }

  /**
   * Generar reporte
   */
  async generarReporte(
    tipo: Reporte['tipo'],
    filtros: FiltrosReporte,
    empresaId: string,
    userId: string
  ): Promise<ResultadoReporte> {
    const inicio = Date.now();

    // Obtener datos según el tipo
    let datos: any[] = [];
    let totalRegistros = 0;

    switch (tipo) {
      case 'pacientes':
        const pacientes = await this.getDatosPacientes(empresaId, filtros);
        datos = pacientes;
        break;

      case 'citas':
        const citas = await this.getDatosCitas(empresaId, filtros);
        datos = citas;
        break;

      case 'inventario':
        const inventario = await this.getDatosInventario(empresaId, filtros);
        datos = inventario;
        break;

      case 'facturacion':
        const facturas = await this.getDatosFacturacion(empresaId, filtros);
        datos = facturas;
        break;

      case 'medicos':
        const medicos = await this.getDatosMedicos(empresaId, filtros);
        datos = medicos;
        break;

      default:
        throw new Error('Tipo de reporte no soportado');
    }

    totalRegistros = datos.length;

    const resultado: ResultadoReporte = {
      id: crypto.randomUUID(),
      reporteId: '',
      empresaId,
      nombre: `Reporte de ${tipo}`,
      tipo,
      formato: 'json',
      fechaDesde: filtros.fechaDesde || new Date().toISOString(),
      fechaHasta: filtros.fechaHasta || new Date().toISOString(),
      totalRegistros,
      datos,
      generadoPor: userId,
      generadoEn: new Date().toISOString(),
      tiempoGeneracion: Date.now() - inicio,
    };

    return resultado;
  }

  /**
   * Obtener datos de pacientes
   */
  private async getDatosPacientes(
    empresaId: string,
    filtros: FiltrosReporte
  ): Promise<any[]> {
    let query = supabase
      .from('pacientes')
      .select('*')
      .eq('empresa_id', empresaId);

    if (filtros.fechaDesde) {
      query = query.gte('created_at', filtros.fechaDesde);
    }
    if (filtros.fechaHasta) {
      query = query.lte('created_at', filtros.fechaHasta);
    }
    if (filtros.pacientesActivos !== undefined) {
      query = query.eq('activo', filtros.pacientesActivos);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(p => ({
      id: p.id,
      nombre: `${p.nombre} ${p.apellido_paterno}`,
      email: p.email,
      telefono: p.telefono,
      fechaNacimiento: p.fecha_nacimiento,
      sexo: p.sexo,
      activo: p.activo,
      fechaRegistro: p.created_at,
    }));
  }

  /**
   * Obtener datos de citas
   */
  private async getDatosCitas(
    empresaId: string,
    filtros: FiltrosReporte
  ): Promise<any[]> {
    let query = supabase
      .from('citas')
      .select(`
        *,
        paciente:paciente_id(nombre, apellido_paterno),
        medico:medico_id(nombre, apellido_paterno)
      `)
      .eq('empresa_id', empresaId);

    if (filtros.fechaDesde) {
      query = query.gte('fecha_inicio', filtros.fechaDesde);
    }
    if (filtros.fechaHasta) {
      query = query.lte('fecha_inicio', filtros.fechaHasta);
    }
    if (filtros.medicoId) {
      query = query.eq('medico_id', filtros.medicoId);
    }
    if (filtros.estado) {
      query = query.eq('estado', filtros.estado);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(c => ({
      id: c.id,
      fecha: c.fecha_inicio,
      paciente: `${c.paciente?.nombre} ${c.paciente?.apellido_paterno}`,
      medico: `${c.medico?.nombre} ${c.medico?.apellido_paterno}`,
      tipo: c.tipo,
      estado: c.estado,
      motivo: c.motivo,
    }));
  }

  /**
   * Obtener datos de inventario
   */
  private async getDatosInventario(
    empresaId: string,
    filtros: FiltrosReporte
  ): Promise<any[]> {
    let query = supabase
      .from('productos')
      .select('*')
      .eq('empresa_id', empresaId);

    if (filtros.productosBajoStock) {
      query = query.lte('stock_actual', supabase.raw('stock_minimo'));
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(p => ({
      id: p.id,
      codigo: p.codigo,
      nombre: p.nombre,
      tipo: p.tipo,
      stockActual: p.stock_actual,
      stockMinimo: p.stock_minimo,
      precio: p.precio_venta,
      costo: p.costo_unitario,
      valorTotal: p.stock_actual * p.costo_unitario,
    }));
  }

  /**
   * Obtener datos de facturación
   */
  private async getDatosFacturacion(
    empresaId: string,
    filtros: FiltrosReporte
  ): Promise<any[]> {
    let query = supabase
      .from('facturas')
      .select('*')
      .eq('empresa_id', empresaId);

    if (filtros.fechaDesde) {
      query = query.gte('fecha_emision', filtros.fechaDesde);
    }
    if (filtros.fechaHasta) {
      query = query.lte('fecha_emision', filtros.fechaHasta);
    }
    if (filtros.facturasTimbradas) {
      query = query.eq('estado', 'timbrada');
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(f => ({
      id: f.id,
      folio: f.folio,
      fecha: f.fecha_emision,
      cliente: f.receptor_nombre,
      total: f.total,
      estado: f.estado,
    }));
  }

  /**
   * Obtener datos de médicos
   */
  private async getDatosMedicos(
    empresaId: string,
    filtros: FiltrosReporte
  ): Promise<any[]> {
    // Obtener médicos
    const { data: medicos, error: errorMedicos } = await supabase
      .from('usuarios')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('rol', 'medico')
      .eq('activo', true);

    if (errorMedicos) throw errorMedicos;

    // Para cada médico, contar citas
    const resultado = await Promise.all(
      (medicos || []).map(async (medico) => {
        const { count: citasAtendidas } = await supabase
          .from('citas')
          .select('*', { count: 'exact', head: true })
          .eq('medico_id', medico.id)
          .eq('estado', 'completada');

        const { count: citasCanceladas } = await supabase
          .from('citas')
          .select('*', { count: 'exact', head: true })
          .eq('medico_id', medico.id)
          .eq('estado', 'cancelada');

        return {
          id: medico.id,
          nombre: `${medico.nombre} ${medico.apellido_paterno}`,
          especialidad: medico.especialidad,
          citasAtendidas: citasAtendidas || 0,
          citasCanceladas: citasCanceladas || 0,
        };
      })
    );

    return resultado;
  }

  /**
   * Obtener estadísticas del dashboard
   */
  async getDashboardStats(empresaId: string): Promise<DashboardStats> {
    // Pacientes
    const { count: totalPacientes } = await supabase
      .from('pacientes')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresaId);

    // Citas del mes
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const { data: citasMes } = await supabase
      .from('citas')
      .select('estado')
      .eq('empresa_id', empresaId)
      .gte('fecha_inicio', inicioMes.toISOString());

    // Inventario
    const { data: productos } = await supabase
      .from('productos')
      .select('*')
      .eq('empresa_id', empresaId);

    // Facturación
    const { data: facturas } = await supabase
      .from('facturas')
      .select('total')
      .eq('empresa_id', empresaId)
      .eq('estado', 'timbrada')
      .gte('fecha_emision', inicioMes.toISOString());

    return {
      totalPacientes: totalPacientes || 0,
      pacientesNuevosMes: 0, // Calcular
      pacientesPorSexo: [],
      pacientesPorEdad: [],
      totalCitasMes: citasMes?.length || 0,
      citasCompletadas: citasMes?.filter(c => c.estado === 'completada').length || 0,
      citasCanceladas: citasMes?.filter(c => c.estado === 'cancelada').length || 0,
      promedioCitasDia: 0,
      totalProductos: productos?.length || 0,
      productosBajoStock: productos?.filter(
        p => p.stock_actual <= p.stock_minimo
      ).length || 0,
      valorInventario: productos?.reduce(
        (sum, p) => sum + p.stock_actual * p.costo_unitario, 0
      ) || 0,
      totalFacturadoMes: facturas?.reduce((sum, f) => sum + f.total, 0) || 0,
      totalFacturas: facturas?.length || 0,
      promedioFactura: facturas?.length 
        ? (facturas.reduce((sum, f) => sum + f.total, 0) / facturas.length)
        : 0,
      totalMedicos: 0,
      citasPorMedico: [],
    };
  }

  // Mappers
  private mapReporteFromDB(data: any): Reporte {
    return {
      id: data.id,
      empresaId: data.empresa_id,
      nombre: data.nombre,
      descripcion: data.descripcion,
      tipo: data.tipo,
      formato: data.formato,
      periodicidad: data.periodicidad,
      filtros: data.filtros,
      columnas: data.columnas,
      programado: data.programado,
      diaEnvio: data.dia_envio,
      horaEnvio: data.hora_envio,
      emailDestinatarios: data.email_destinatarios,
      activo: data.activo,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
    };
  }

  private handleError(error: any): Error {
    return new Error(error.message || 'Error en reportes');
  }
}

export const reportesService = new ReportesService();
