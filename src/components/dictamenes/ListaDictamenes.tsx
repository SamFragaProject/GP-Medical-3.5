import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit2, 
  FileSignature,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermisosDinamicos } from '@/hooks/usePermisosDinamicos';
import { toast } from 'react-hot-toast';
import type { DictamenMedico, TipoEvaluacion, ResultadoDictamen, EstadoDictamen } from '@/types/dictamen';

interface ListaDictamenesProps {
  onNuevoDictamen: () => void;
  onVerDictamen: (id: string) => void;
  onEditarDictamen: (id: string) => void;
}

const resultadosColors: Record<ResultadoDictamen, { badge: string; icon: React.ReactNode }> = {
  apto: { 
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />
  },
  apto_restricciones: { 
    badge: 'bg-amber-100 text-amber-800 border-amber-200', 
    icon: <AlertCircle className="w-4 h-4 text-amber-600" />
  },
  no_apto_temporal: { 
    badge: 'bg-orange-100 text-orange-800 border-orange-200', 
    icon: <Clock className="w-4 h-4 text-orange-600" />
  },
  no_apto: { 
    badge: 'bg-rose-100 text-rose-800 border-rose-200', 
    icon: <XCircle className="w-4 h-4 text-rose-600" />
  },
  evaluacion_complementaria: { 
    badge: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: <AlertCircle className="w-4 h-4 text-blue-600" />
  },
};

const estadoColors: Record<EstadoDictamen, string> = {
  borrador: 'bg-slate-100 text-slate-800',
  completado: 'bg-emerald-100 text-emerald-800',
  firmado: 'bg-blue-100 text-blue-800',
  cancelado: 'bg-rose-100 text-rose-800',
};

const tipoEvaluacionLabels: Record<TipoEvaluacion, string> = {
  preempleo: 'Preempleo',
  periodico: 'Periódico',
  retorno: 'Retorno',
  egreso: 'Egreso',
  reubicacion: 'Reubicación',
  reincorporacion: 'Reincorporación',
};

// Datos de ejemplo
const dictamenesEjemplo: DictamenMedico[] = [
  {
    id: '1',
    paciente_id: 'p1',
    expediente_id: 'e1',
    empresa_id: 'emp1',
    tipo_evaluacion: 'preempleo',
    resultado: 'apto',
    restricciones: [],
    restricciones_detalle: '',
    recomendaciones_medicas: 'Mantener hábitos saludables',
    recomendaciones_epp: ['lentes_seguridad'],
    fecha_emision: '2026-02-08',
    fecha_vigencia_inicio: '2026-02-08',
    fecha_vigencia_fin: '2027-02-08',
    estado: 'firmado',
    paciente: {
      id: 'p1',
      nombre: 'Juan Carlos',
      apellido_paterno: 'Martínez',
      apellido_materno: 'López',
      puesto: 'Operador de maquinaria',
    },
    empresa: {
      id: 'emp1',
      nombre: 'Constructora del Norte S.A.',
    },
    created_at: '2026-02-08T10:00:00Z',
    updated_at: '2026-02-08T10:00:00Z',
  },
  {
    id: '2',
    paciente_id: 'p2',
    expediente_id: 'e2',
    empresa_id: 'emp1',
    tipo_evaluacion: 'periodico',
    resultado: 'apto_restricciones',
    restricciones: ['R003'],
    restricciones_detalle: 'No exponerse a ruido superior a 80dB',
    recomendaciones_medicas: 'Usar protección auditiva permanente',
    recomendaciones_epp: ['tapones_auditivos', 'protector_auditivo'],
    fecha_emision: '2026-02-07',
    fecha_vigencia_inicio: '2026-02-07',
    fecha_vigencia_fin: '2027-02-07',
    estado: 'completado',
    paciente: {
      id: 'p2',
      nombre: 'María Elena',
      apellido_paterno: 'García',
      apellido_materno: 'Santos',
      puesto: 'Operaria de producción',
    },
    empresa: {
      id: 'emp1',
      nombre: 'Constructora del Norte S.A.',
    },
    created_at: '2026-02-07T14:30:00Z',
    updated_at: '2026-02-07T14:30:00Z',
  },
  {
    id: '3',
    paciente_id: 'p3',
    expediente_id: 'e3',
    empresa_id: 'emp2',
    tipo_evaluacion: 'retorno',
    resultado: 'apto',
    restricciones: [],
    restricciones_detalle: '',
    recomendaciones_medicas: 'Retorno gradual a actividades',
    recomendaciones_epp: [],
    fecha_emision: '2026-02-06',
    fecha_vigencia_inicio: '2026-02-06',
    estado: 'firmado',
    paciente: {
      id: 'p3',
      nombre: 'Roberto',
      apellido_paterno: 'Hernández',
      apellido_materno: 'Flores',
      puesto: 'Almacenista',
    },
    empresa: {
      id: 'emp2',
      nombre: 'Distribuidora Nacional S.A.',
    },
    created_at: '2026-02-06T09:00:00Z',
    updated_at: '2026-02-06T09:00:00Z',
  },
];

export function ListaDictamenes({ onNuevoDictamen, onVerDictamen, onEditarDictamen }: ListaDictamenesProps) {
  const { puede } = usePermisosDinamicos();
  const [dictamenes, setDictamenes] = useState<DictamenMedico[]>(dictamenesEjemplo);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoEvaluacion | 'todos'>('todos');
  const [filtroResultado, setFiltroResultado] = useState<ResultadoDictamen | 'todos'>('todos');

  const dictamenesFiltrados = dictamenes.filter(d => {
    const matchesSearch = 
      d.paciente?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.paciente?.apellido_paterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.empresa?.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filtroTipo === 'todos' || d.tipo_evaluacion === filtroTipo;
    const matchesResultado = filtroResultado === 'todos' || d.resultado === filtroResultado;
    return matchesSearch && matchesTipo && matchesResultado;
  });

  const handleExportarPDF = (id: string) => {
    toast.success('Descargando PDF del dictamen...');
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-MX');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dictámenes Médico-Laborales</h1>
          <p className="text-slate-500">Gestión de evaluaciones de aptitud laboral</p>
        </div>
        {puede('dictamenes', 'crear') && (
          <Button
            onClick={onNuevoDictamen}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Dictamen
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por paciente o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as TipoEvaluacion | 'todos')}
              >
                <option value="todos">Todos los tipos</option>
                <option value="preempleo">Preempleo</option>
                <option value="periodico">Periódico</option>
                <option value="retorno">Retorno</option>
                <option value="egreso">Egreso</option>
                <option value="reubicacion">Reubicación</option>
              </select>
              <select
                className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm"
                value={filtroResultado}
                onChange={(e) => setFiltroResultado(e.target.value as ResultadoDictamen | 'todos')}
              >
                <option value="todos">Todos los resultados</option>
                <option value="apto">Apto</option>
                <option value="apto_restricciones">Apto con Restricciones</option>
                <option value="no_apto_temporal">No Apto Temporal</option>
                <option value="no_apto">No Apto</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card className="border shadow-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>Paciente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Vigencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dictamenesFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>No se encontraron dictámenes</p>
                  </TableCell>
                </TableRow>
              ) : (
                dictamenesFiltrados.map((dictamen) => (
                  <TableRow key={dictamen.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">
                          {dictamen.paciente?.nombre} {dictamen.paciente?.apellido_paterno}
                        </p>
                        <p className="text-xs text-slate-500">
                          {dictamen.paciente?.puesto}
                        </p>
                        <p className="text-xs text-slate-400">
                          {dictamen.empresa?.nombre}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {tipoEvaluacionLabels[dictamen.tipo_evaluacion]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${resultadosColors[dictamen.resultado].badge}`}>
                        {resultadosColors[dictamen.resultado].icon}
                        <span>
                          {dictamen.resultado === 'apto' && 'Apto'}
                          {dictamen.resultado === 'apto_restricciones' && 'Apto con Restricciones'}
                          {dictamen.resultado === 'no_apto_temporal' && 'No Apto Temporal'}
                          {dictamen.resultado === 'no_apto' && 'No Apto'}
                          {dictamen.resultado === 'evaluacion_complementaria' && 'Eval. Complementaria'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{formatDate(dictamen.fecha_vigencia_inicio)}</p>
                        {dictamen.fecha_vigencia_fin && (
                          <p className="text-xs text-slate-500">
                            al {formatDate(dictamen.fecha_vigencia_fin)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${estadoColors[dictamen.estado]}`}>
                        {dictamen.estado === 'borrador' && 'Borrador'}
                        {dictamen.estado === 'completado' && 'Completado'}
                        {dictamen.estado === 'firmado' && 'Firmado'}
                        {dictamen.estado === 'cancelado' && 'Cancelado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onVerDictamen(dictamen.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {puede('dictamenes', 'editar') && dictamen.estado !== 'firmado' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditarDictamen(dictamen.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExportarPDF(dictamen.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Paginación (placeholder) */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Mostrando {dictamenesFiltrados.length} de {dictamenes.length} dictámenes
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm" disabled>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
