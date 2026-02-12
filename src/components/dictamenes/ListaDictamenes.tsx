import React, { useState, useEffect, useCallback } from 'react';
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
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataContainer } from '@/components/ui/DataContainer';
import { usePermisosDinamicos } from '@/hooks/usePermisosDinamicos';
import { dictamenService } from '@/services/dictamenService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';
import type { DictamenMedico, TipoEvaluacionDictamen as TipoEvaluacion, ResultadoDictamen, EstadoDictamen } from '@/types/dictamen';

interface ListaDictamenesProps {
  onNuevoDictamen: () => void;
  onVerDictamen: (id: string) => void;
  onEditarDictamen: (id: string) => void;
}

const resultadosColors: Record<ResultadoDictamen, { badge: string; icon: React.ReactNode }> = {
  apto: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />
  },
  apto_restricciones: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: <AlertCircle className="w-4 h-4 text-amber-600" />
  },
  no_apto_temporal: {
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: <Clock className="w-4 h-4 text-orange-600" />
  },
  no_apto: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: <XCircle className="w-4 h-4 text-rose-600" />
  },
  evaluacion_complementaria: {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: <AlertCircle className="w-4 h-4 text-blue-600" />
  },
};

const estadoColors: Record<EstadoDictamen, string> = {
  borrador: 'bg-slate-100 text-slate-800',
  pendiente: 'bg-amber-100 text-amber-800',
  completado: 'bg-emerald-100 text-emerald-800',
  anulado: 'bg-rose-100 text-rose-800',
  vencido: 'bg-gray-100 text-gray-800',
  firmado: 'bg-blue-100 text-blue-800',
  cancelado: 'bg-rose-100 text-rose-800',
};

const tipoEvaluacionLabels: Record<TipoEvaluacion, string> = {
  preempleo: 'Pre-empleo',
  ingreso: 'Ingreso',
  periodico: 'Periódico',
  retorno: 'Retorno',
  egreso: 'Egreso',
  reubicacion: 'Reubicación',
  reincorporacion: 'Reincorporación',
};

export function ListaDictamenes({ onNuevoDictamen, onVerDictamen, onEditarDictamen }: ListaDictamenesProps) {
  const { user } = useAuth();
  const { puede } = usePermisosDinamicos();
  const [dictamenes, setDictamenes] = useState<DictamenMedico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoEvaluacion | 'todos'>('todos');
  const [filtroResultado, setFiltroResultado] = useState<ResultadoDictamen | 'todos'>('todos');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchDictamenes = useCallback(async () => {
    if (!user?.empresa_id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await dictamenService.listar({
        empresa_id: user.empresa_id,
        tipo_evaluacion: filtroTipo === 'todos' ? undefined : filtroTipo,
        resultado: filtroResultado === 'todos' ? undefined : filtroResultado,
      }, {
        page,
        limit,
        ordenar_por: 'created_at',
        direccion: 'desc'
      });

      setDictamenes(response.data);
      setTotal(response.total);
    } catch (err: any) {
      console.error('Error fetching dictámenes:', err);
      setError('No se pudieron cargar los dictámenes médico-laborales.');
      toast.error('Error al sincronizar con el servidor');
    } finally {
      setLoading(false);
    }
  }, [user?.empresa_id, filtroTipo, filtroResultado, page]);

  useEffect(() => {
    fetchDictamenes();
  }, [fetchDictamenes]);

  const handleExportarPDF = async (id: string, folio: string) => {
    try {
      toast.loading(`Generando PDF para ${folio}...`, { id: 'pdf-gen' });
      await dictamenService.generarPDF(id);
      toast.success('PDF generado exitosamente', { id: 'pdf-gen' });
    } catch (err) {
      toast.error('Error al generar el documento técnico', { id: 'pdf-gen' });
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Premium */}
      <PremiumPageHeader
        title="Dictámenes Médico-Laborales"
        subtitle="Gestión avanzada de aptitud y vigilancia de la salud poblacional"
        icon={FileSignature}
        badge="VALIDATED"
        actions={
          puede('dictamenes', 'crear') && (
            <Button
              onClick={onNuevoDictamen}
              className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl shadow-xl shadow-emerald-500/20 group"
            >
              <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
              Emisión de Dictamen
            </Button>
          )
        }
      />

      {/* Filtros */}
      <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por paciente, folio o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-emerald-500 font-medium"
              />
            </div>
            <div className="flex gap-2">
              <select
                className="px-4 py-2 rounded-xl border-none bg-slate-50 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-emerald-500"
                value={filtroTipo}
                onChange={(e) => { setFiltroTipo(e.target.value as TipoEvaluacion | 'todos'); setPage(1); }}
              >
                <option value="todos">Todos los Tipos</option>
                {Object.entries(tipoEvaluacionLabels).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <select
                className="px-4 py-2 rounded-xl border-none bg-slate-50 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-emerald-500"
                value={filtroResultado}
                onChange={(e) => { setFiltroResultado(e.target.value as ResultadoDictamen | 'todos'); setPage(1); }}
              >
                <option value="todos">Todos los Resultados</option>
                <option value="apto">Apto</option>
                <option value="apto_restricciones">Apto c/ Restricciones</option>
                <option value="no_apto_temporal">No Apto Temporal</option>
                <option value="no_apto">No Apto</option>
              </select>
              <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl" onClick={fetchDictamenes}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <DataContainer
        loading={loading}
        error={error}
        data={dictamenes}
        onRetry={fetchDictamenes}
        loadingMessage="Sincronizando expedientes digitales..."
        emptyAction={onNuevoDictamen}
        emptyActionLabel="Emitir Primer Dictamen"
      >
        <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-100">
                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] py-4">Paciente</TableHead>
                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] py-4">Evaluación</TableHead>
                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] py-4">Resultado Clínico</TableHead>
                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] py-4">Vigencia</TableHead>
                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] py-4">Estado</TableHead>
                    <TableHead className="text-right font-bold text-slate-400 uppercase tracking-widest text-[10px] py-4 pr-6">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dictamenes.map((dictamen) => (
                    <TableRow key={dictamen.id} className="hover:bg-slate-50/30 transition-colors border-b border-slate-50 last:border-0 group">
                      <TableCell className="py-4">
                        <div className="pl-2">
                          <p className="font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {dictamen.paciente?.nombre} {dictamen.paciente?.apellido_paterno}
                          </p>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter mt-0.5">
                            {dictamen.folio || `#${dictamen.id.slice(0, 8)}`}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-lg bg-white border-slate-100 text-slate-600 font-bold px-3 py-1">
                          {tipoEvaluacionLabels[dictamen.tipo_evaluacion]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl text-xs font-black border transition-all ${resultadosColors[dictamen.resultado]?.badge || 'bg-slate-50 border-slate-100'}`}>
                          {resultadosColors[dictamen.resultado]?.icon}
                          <span className="uppercase tracking-wide">
                            {dictamen.resultado === 'apto' && 'Apto'}
                            {dictamen.resultado === 'apto_restricciones' && 'Apto con Restricciones'}
                            {dictamen.resultado === 'no_apto_temporal' && 'No Apto Temporal'}
                            {dictamen.resultado === 'no_apto' && 'No Apto'}
                            {dictamen.resultado === 'evaluacion_complementaria' && 'Eval. Complementaria'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-700">{formatDate(dictamen.fecha_vigencia_inicio || dictamen.vigencia_inicio)}</span>
                          {dictamen.vigencia_fin && (
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Expira: {formatDate(dictamen.vigencia_fin)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`rounded-xl px-3 py-1 font-black text-[10px] tracking-widest uppercase border-none ${estadoColors[dictamen.estado]}`}>
                          {dictamen.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onVerDictamen(dictamen.id)}
                            className="h-10 w-10 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            title="Ver Detalle"
                          >
                            <Eye className="w-5 h-5" />
                          </Button>
                          {puede('dictamenes', 'editar') && (dictamen.estado === 'borrador' || dictamen.estado === 'pendiente') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEditarDictamen(dictamen.id)}
                              className="h-10 w-10 text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                              title="Editar"
                            >
                              <Edit2 className="w-5 h-5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleExportarPDF(dictamen.id, dictamen.folio || dictamen.id)}
                            className="h-10 w-10 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            title="Descargar PDF Técnico"
                          >
                            <Download className="w-5 h-5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Paginación */}
            <div className="p-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Mostrando <span className="text-slate-900 font-black">{dictamenes.length}</span> de <span className="text-slate-900 font-black">{total}</span> registros
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="rounded-xl border-slate-200 h-10 px-4 font-black text-[10px] uppercase tracking-widest"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page * limit >= total}
                  onClick={() => setPage(p => p + 1)}
                  className="rounded-xl border-slate-200 h-10 px-4 font-black text-[10px] uppercase tracking-widest"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </DataContainer>
    </div>
  );
}
