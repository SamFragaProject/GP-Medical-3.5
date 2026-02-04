/**
 * 📊 TIPOS DE REPORTES V2
 */

export type TipoReporte =
  | 'pacientes'
  | 'citas'
  | 'inventario'
  | 'facturacion'
  | 'medicos'
  | 'cumplimiento'
  | 'custom';

export type FormatoReporte = 'pdf' | 'excel' | 'csv' | 'json';

export type PeriodicidadReporte = 'diario' | 'semanal' | 'mensual' | 'trimestral' | 'anual' | 'unico';

export interface Reporte {
  id: string;
  empresaId: string;
  
  // Configuración
  nombre: string;
  descripcion?: string;
  tipo: TipoReporte;
  formato: FormatoReporte;
  periodicidad: PeriodicidadReporte;
  
  // Filtros
  filtros: FiltrosReporte;
  
  // Columnas a incluir
  columnas: string[];
  
  // Programación
  programado: boolean;
  diaEnvio?: number; // 1-31 para mensual
  horaEnvio?: string; // HH:MM
  emailDestinatarios?: string[];
  
  // Estado
  activo: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface FiltrosReporte {
  fechaDesde?: string;
  fechaHasta?: string;
  medicoId?: string;
  pacienteId?: string;
  estado?: string;
  tipo?: string;
  
  // Filtros específicos por tipo
  pacientesActivos?: boolean;
  citasCompletadas?: boolean;
  productosBajoStock?: boolean;
  facturasTimbradas?: boolean;
}

export interface ResultadoReporte {
  id: string;
  reporteId: string;
  empresaId: string;
  
  // Datos
  nombre: string;
  tipo: TipoReporte;
  formato: FormatoReporte;
  
  // Periodo
  fechaDesde: string;
  fechaHasta: string;
  
  // Resultados
  totalRegistros: number;
  datos: any[];
  
  // Archivo generado
  archivoUrl?: string;
  archivoNombre?: string;
  archivoSize?: number;
  
  // Metadata
  generadoPor: string;
  generadoEn: string;
  tiempoGeneracion: number; // milisegundos
}

export interface DashboardStats {
  // Pacientes
  totalPacientes: number;
  pacientesNuevosMes: number;
  pacientesPorSexo: { sexo: string; cantidad: number }[];
  pacientesPorEdad: { rango: string; cantidad: number }[];
  
  // Citas
  totalCitasMes: number;
  citasCompletadas: number;
  citasCanceladas: number;
  promedioCitasDia: number;
  
  // Inventario
  totalProductos: number;
  productosBajoStock: number;
  valorInventario: number;
  
  // Facturación
  totalFacturadoMes: number;
  totalFacturas: number;
  promedioFactura: number;
  
  // Médicos
  totalMedicos: number;
  citasPorMedico: { medicoId: string; nombre: string; citas: number }[];
}

export interface GraficaData {
  tipo: 'linea' | 'barra' | 'pastel' | 'area';
  titulo: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

// Templates predefinidos
export const TEMPLATES_REPORTES = [
  {
    id: 'pacientes_activos',
    nombre: 'Pacientes Activos',
    tipo: 'pacientes' as TipoReporte,
    descripcion: 'Listado de pacientes activos con información de contacto',
    columnasDefault: ['nombre', 'email', 'telefono', 'fechaNacimiento', 'sexo'],
  },
  {
    id: 'citas_mes',
    nombre: 'Citas del Mes',
    tipo: 'citas' as TipoReporte,
    descripcion: 'Resumen de citas del mes actual',
    columnasDefault: ['fecha', 'paciente', 'medico', 'tipo', 'estado'],
  },
  {
    id: 'inventario_stock',
    nombre: 'Inventario y Stock',
    tipo: 'inventario' as TipoReporte,
    descripcion: 'Estado actual del inventario con niveles de stock',
    columnasDefault: ['codigo', 'nombre', 'stockActual', 'stockMinimo', 'precio'],
  },
  {
    id: 'facturacion_mensual',
    nombre: 'Facturación Mensual',
    tipo: 'facturacion' as TipoReporte,
    descripcion: 'Resumen de facturación del mes',
    columnasDefault: ['folio', 'fecha', 'cliente', 'total', 'estado'],
  },
  {
    id: 'productividad_medicos',
    nombre: 'Productividad de Médicos',
    tipo: 'medicos' as TipoReporte,
    descripcion: 'Citas atendidas por médico',
    columnasDefault: ['medico', 'especialidad', 'citasAtendidas', 'citasCanceladas'],
  },
];
