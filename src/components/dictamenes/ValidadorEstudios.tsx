import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileCheck,
  Microscope,
  Activity,
  Bone,
  Eye,
  Ear
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { EstudioRequerido, TipoEvaluacion } from '@/types/dictamen';

interface ValidadorEstudiosProps {
  pacienteId: string;
  tipoEvaluacion: TipoEvaluacion;
  onValidacionChange: (valido: boolean, faltantes: string[]) => void;
}

// Definición de estudios requeridos por tipo de evaluación
const estudiosPorTipo: Record<TipoEvaluacion, EstudioRequerido[]> = {
  preempleo: [
    { tipo: 'exploracion_fisica', nombre: 'Exploración Física', obligatorio: true, completado: false },
    { tipo: 'audiometria', nombre: 'Audiometría', obligatorio: false, completado: false },
    { tipo: 'espirometria', nombre: 'Espirometría', obligatorio: false, completado: false },
    { tipo: 'rx_torax', nombre: 'Rayos X de Tórax', obligatorio: true, completado: false },
    { tipo: 'examenes_laboratorio', nombre: 'Exámenes de Laboratorio', obligatorio: true, completado: false },
    { tipo: 'vision', nombre: 'Agudeza Visual', obligatorio: true, completado: false },
  ],
  periodico: [
    { tipo: 'exploracion_fisica', nombre: 'Exploración Física', obligatorio: true, completado: false },
    { tipo: 'audiometria', nombre: 'Audiometría', obligatorio: true, completado: false },
    { tipo: 'espirometria', nombre: 'Espirometría', obligatorio: true, completado: false },
    { tipo: 'rx_torax', nombre: 'Rayos X de Tórax', obligatorio: true, completado: false },
    { tipo: 'examenes_laboratorio', nombre: 'Exámenes de Laboratorio', obligatorio: true, completado: false },
    { tipo: 'vision', nombre: 'Agudeza Visual', obligatorio: true, completado: false },
  ],
  retorno: [
    { tipo: 'exploracion_fisica', nombre: 'Exploración Física', obligatorio: true, completado: false },
    { tipo: 'laboratorio_especifico', nombre: 'Laboratorio Específico', obligatorio: false, completado: false },
  ],
  egreso: [
    { tipo: 'exploracion_fisica', nombre: 'Exploración Física', obligatorio: true, completado: false },
    { tipo: 'audiometria', nombre: 'Audiometría', obligatorio: false, completado: false },
    { tipo: 'espirometria', nombre: 'Espirometría', obligatorio: false, completado: false },
    { tipo: 'rx_torax', nombre: 'Rayos X de Tórax', obligatorio: false, completado: false },
  ],
  reubicacion: [
    { tipo: 'exploracion_fisica', nombre: 'Exploración Física', obligatorio: true, completado: false },
    { tipo: 'evaluacion_ergonomica', nombre: 'Evaluación Ergonómica', obligatorio: false, completado: false },
  ],
  reincorporacion: [
    { tipo: 'exploracion_fisica', nombre: 'Exploración Física', obligatorio: true, completado: false },
    { tipo: 'laboratorio_especifico', nombre: 'Laboratorio Específico', obligatorio: false, completado: false },
  ],
};

const iconosEstudios: Record<string, React.ReactNode> = {
  exploracion_fisica: <Activity className="w-5 h-5" />,
  audiometria: <Ear className="w-5 h-5" />,
  espirometria: <Activity className="w-5 h-5" />,
  rx_torax: <Bone className="w-5 h-5" />,
  examenes_laboratorio: <Microscope className="w-5 h-5" />,
  vision: <Eye className="w-5 h-5" />,
  laboratorio_especifico: <Microscope className="w-5 h-5" />,
  evaluacion_ergonomica: <Activity className="w-5 h-5" />,
};

export function ValidadorEstudios({ pacienteId, tipoEvaluacion, onValidacionChange }: ValidadorEstudiosProps) {
  const [estudios, setEstudios] = useState<EstudioRequerido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de estudios del paciente
    const cargarEstudios = async () => {
      setLoading(true);
      try {
        // Aquí iría la llamada a la API
        // const estudiosCompletados = await estudiosService.getByPaciente(pacienteId);
        
        // Simulación de datos
        const estudiosBase = estudiosPorTipo[tipoEvaluacion];
        const estudiosSimulados = estudiosBase.map((est, index) => ({
          ...est,
          completado: index < 3, // Simula que los primeros 3 están completados
          fecha_completado: index < 3 ? new Date().toISOString() : undefined,
          resultado: index < 3 ? 'Normal' : undefined,
        }));
        
        setEstudios(estudiosSimulados);
      } catch (error) {
        console.error('Error cargando estudios:', error);
      } finally {
        setLoading(false);
      }
    };

    if (pacienteId) {
      cargarEstudios();
    }
  }, [pacienteId, tipoEvaluacion]);

  useEffect(() => {
    const faltantesObligatorios = estudios
      .filter(e => e.obligatorio && !e.completado)
      .map(e => e.nombre);
    
    const valido = faltantesObligatorios.length === 0;
    onValidacionChange(valido, faltantesObligatorios);
  }, [estudios, onValidacionChange]);

  const estudiosCompletados = estudios.filter(e => e.completado).length;
  const estudiosObligatorios = estudios.filter(e => e.obligatorio);
  const obligatoriosCompletados = estudiosObligatorios.filter(e => e.completado).length;
  const progreso = estudios.length > 0 ? (estudiosCompletados / estudios.length) * 100 : 0;

  const getEstadoColor = (estudio: EstudioRequerido) => {
    if (estudio.completado) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (estudio.obligatorio) return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-slate-50 text-slate-500 border-slate-200';
  };

  const getEstadoIcono = (estudio: EstudioRequerido) => {
    if (estudio.completado) return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    if (estudio.obligatorio) return <XCircle className="w-5 h-5 text-rose-500" />;
    return <AlertCircle className="w-5 h-5 text-slate-400" />;
  };

  if (loading) {
    return (
      <Card className="border shadow-md">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
            <div className="h-2 bg-slate-200 rounded w-full"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-md">
      <CardHeader className="bg-slate-50/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-600" />
            Validación de Estudios Completados
          </CardTitle>
          <Badge variant={obligatoriosCompletados === estudiosObligatorios.length ? 'success' : 'warning'}>
            {obligatoriosCompletados}/{estudiosObligatorios.length} Obligatorios
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Progreso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Progreso general</span>
            <span className="font-medium text-slate-900">{Math.round(progreso)}%</span>
          </div>
          <Progress value={progreso} className="h-2" />
        </div>

        {/* Lista de estudios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {estudios.map((estudio) => (
            <div
              key={estudio.tipo}
              className={`p-4 rounded-lg border ${getEstadoColor(estudio)} transition-all duration-200`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {iconosEstudios[estudio.tipo] || <FileCheck className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{estudio.nombre}</span>
                    {estudio.obligatorio && (
                      <Badge variant="outline" className="text-xs">Obligatorio</Badge>
                    )}
                  </div>
                  {estudio.completado && estudio.resultado && (
                    <p className="text-xs mt-1 opacity-80">
                      Resultado: {estudio.resultado}
                    </p>
                  )}
                  {estudio.completado && estudio.fecha_completado && (
                    <p className="text-xs mt-0.5 opacity-70">
                      {new Date(estudio.fecha_completado).toLocaleDateString('es-MX')}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {getEstadoIcono(estudio)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="flex flex-wrap gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm text-slate-600">
              <strong>{estudiosCompletados}</strong> Completados
            </span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-rose-500" />
            <span className="text-sm text-slate-600">
              <strong>{estudiosObligatorios.length - obligatoriosCompletados}</strong> Obligatorios pendientes
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-600">
              <strong>{estudios.filter(e => !e.obligatorio && !e.completado).length}</strong> Opcionales pendientes
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
