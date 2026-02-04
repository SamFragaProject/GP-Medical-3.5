/**
 * 👤 TIPOS DE PACIENTES V2
 */

export interface Paciente {
  id: string;
  empresaId: string;
  
  // Datos personales
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  curp?: string;
  nss?: string;
  rfc?: string;
  
  // Fechas
  fechaNacimiento?: string;
  edad?: number;
  
  // Contacto
  email?: string;
  telefono?: string;
  telefonoEmergencia?: string;
  contactoEmergencia?: string;
  
  // Dirección
  direccion?: Direccion;
  
  // Datos médicos
  sexo?: 'masculino' | 'femenino' | 'otro';
  tipoSangre?: string;
  alergias?: string[];
  enfermedadesCronicas?: string[];
  medicamentos?: string[];
  
  // Laboral
  puestoId?: string;
  areaId?: string;
  fechaIngresoEmpresa?: string;
  
  // Estado
  activo: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Direccion {
  calle?: string;
  numeroExterior?: string;
  numeroInterior?: string;
  colonia?: string;
  codigoPostal?: string;
  ciudad?: string;
  estado?: string;
  pais?: string;
}

export interface CreatePacienteInput {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  curp?: string;
  nss?: string;
  fechaNacimiento?: string;
  sexo?: 'masculino' | 'femenino' | 'otro';
  email?: string;
  telefono?: string;
  direccion?: Direccion;
  puestoId?: string;
  areaId?: string;
  alergias?: string[];
  enfermedadesCronicas?: string[];
}

export interface UpdatePacienteInput extends Partial<CreatePacienteInput> {
  activo?: boolean;
}

export interface PacienteFilters {
  search?: string;
  activo?: boolean;
  sexo?: 'masculino' | 'femenino' | 'otro';
  puestoId?: string;
  areaId?: string;
  fechaIngresoDesde?: string;
  fechaIngresoHasta?: string;
}

export interface PacienteSort {
  field: keyof Paciente;
  direction: 'asc' | 'desc';
}

export interface PacienteStats {
  total: number;
  activos: number;
  inactivos: number;
  nuevosEsteMes: number;
  porSexo: {
    masculino: number;
    femenino: number;
    otro: number;
  };
}

// Enums para selects
export const TIPO_SANGRE_OPTIONS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
] as const;

export const ESTADOS_MEXICO = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
  'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo',
  'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
  'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
  'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
] as const;
