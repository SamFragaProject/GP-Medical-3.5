/**
 * 👤 PACIENTES V2 - Exportaciones
 */

export { Pacientes } from './components/Pacientes';
export { PacientesTable } from './components/PacientesTable';
export { PacienteSearch } from './components/PacienteSearch';

export { usePacientes, usePaciente } from './hooks/usePacientes';
export { pacienteService } from './services/pacienteService';

export type {
  Paciente,
  Direccion,
  CreatePacienteInput,
  UpdatePacienteInput,
  PacienteFilters,
  PacienteSort,
  PacienteStats,
} from './types/paciente.types';

export { TIPO_SANGRE_OPTIONS, ESTADOS_MEXICO } from './types/paciente.types';
