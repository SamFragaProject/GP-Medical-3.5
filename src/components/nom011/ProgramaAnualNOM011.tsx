import React, { useState, useEffect, useCallback } from 'react';
import {
  Ear,
  Users,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HardHat,
  GraduationCap,
  ChevronRight,
  FileText,
  Plus,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { SemaforoNOM011Badge } from './SemaforoNOM011';
import { DataContainer } from '@/components/ui/DataContainer';
import { nom011Service } from '@/services/nom011Service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';
import type { ReporteAnualNom011, EstudioAudiometria } from '@/types/nom011';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

export function ProgramaAnualNOM011() {
  const { user } = useAuth();
  const [resumen, setResumen] = useState<ReporteAnualNom011 | null>(null);
  const [trabajadoresRiesgo, setTrabajadoresRiesgo] = useState<EstudioAudiometria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anioActual] = useState(new Date().getFullYear());

  const fetchData = useCallback(async () => {
    if (!user?.empresa_id) return;

    try {
      setLoading(true);
      setError(null);

      const [dataResumen, dataEstudios] = await Promise.all([
        nom011Service.generarReporteAnual(user.empresa_id, anioActual),
        nom011Service.listarAudiometrias({
          empresa_id: user.empresa_id,
          semaforo: 'rojo' // Solo mostramos los de riesgo crítico en la sección inferior
        })
      ]);

      setResumen(dataResumen);
      setTrabajadoresRiesgo(dataEstudios.data);
    } catch (err: any) {
      console.error('Error fetching NOM-011 data:', err);
      setError('No se pudo cargar el programa anual de conservación auditiva.');
      toast.error('Error al sincronizar con el Intelligence Bureau');
    } finally {
      setLoading(false);
    }
  }, [user?.empresa_id, anioActual]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const datosSemaforo = resumen ? [
    { name: 'Normal', value: resumen.por_semaforo.verde, color: '#22c55e' },
    { name: 'Observación', value: resumen.por_semaforo.amarillo, color: '#f59e0b' },
    { name: 'Daño', value: resumen.por_semaforo.rojo, color: '#ef4444' },
  ] : [];

  const chartData = resumen ? [
    { mes: 'Estudios', cantidad: resumen.total_evaluados }
  ] : [];

  return (
    <DataContainer
      loading={loading}
      error={error}
      data={resumen}
      onRetry={fetchData}
      loadingMessage="Analizando salud auditiva poblacional..."
    >
      {resumen && (
        <div className="space-y-6">
          {/* Header Premium */}
          <PremiumPageHeader
            title="Programa Anual NOM-011"
            subtitle={`Conservación de la Audición - Gestión de Salud Poblacional ${resumen.anio}`}
            icon={Ear}
            badge="HL COMPLIANT"
            actions={
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl border-white/10 bg-white/10 text-white hover:bg-white/20 font-black text-[10px] uppercase tracking-widest px-4 py-2"
                  onClick={() => fetchData()}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
                <Button className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-xl shadow-lg shadow-emerald-500/20 font-black text-[10px] uppercase tracking-widest px-6 py-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  Gestionar Programa
                </Button>
              </div>
            }
          />

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Población Expuesta</p>
                    <p className="text-3xl font-black text-slate-900">{resumen.total_trabajadores_expuestos}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Estudios Realizados</p>
                    <p className="text-3xl font-black text-slate-900">{resumen.total_evaluados}</p>
                    <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {resumen.porcentaje_cobertura}% de meta
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <Progress value={resumen.porcentaje_cobertura} className="mt-4 h-2 bg-slate-100" />
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">EPP Entregado</p>
                    <p className="text-3xl font-black text-slate-900">{resumen.total_epp_entregado}</p>
                    <p className="text-xs font-bold text-slate-500 mt-1">
                      {resumen.porcentaje_uso_conforme}% cumplimiento
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                    <HardHat className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Áreas Críticas</p>
                    <p className="text-3xl font-black text-slate-900">{resumen.areas_requieren_intervencion}</p>
                    <p className="text-xs font-bold text-rose-500 mt-1">
                      de {resumen.areas_evaluadas} áreas evaluadas
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-rose-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardHeader className="p-6 pb-0">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Estado de Avance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[250px] flex flex-col items-center justify-center text-center">
                  <p className="text-slate-400 text-sm mb-4">Sincronización con el Programa Anual</p>
                  <div className="w-full max-w-xs mx-auto">
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                      <span>COBERTURA</span>
                      <span>{resumen.porcentaje_cobertura}%</span>
                    </div>
                    <Progress value={resumen.porcentaje_cobertura} className="h-4 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardHeader className="p-6 pb-0">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-emerald-600" />
                  Distribución de Resultados HL
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[250px] flex items-center">
                  <ResponsiveContainer width="50%" height="100%">
                    <PieChart>
                      <Pie
                        data={datosSemaforo}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {datosSemaforo.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-3 pr-4">
                    {datosSemaforo.map((item) => (
                      <div key={item.name} className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs font-bold text-slate-500 flex-1 uppercase tracking-wider">{item.name}</span>
                        <span className="font-black text-slate-900 text-lg">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trabajadores en riesgo */}
          <Card className="border-none shadow-xl bg-rose-50/30 rounded-3xl overflow-hidden border border-rose-100">
            <CardHeader className="p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-black flex items-center gap-2 text-rose-900">
                  <AlertTriangle className="w-6 h-6" />
                  Casos Críticos que Requieren Intervención
                </CardTitle>
                <Badge className="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100 rounded-lg px-4 font-black">
                  {trabajadoresRiesgo.length} ALERTAS
                </Badge>
              </div>
              <CardDescription className="text-rose-600 font-medium">
                Trabajadores con daño auditivo confirmado (Semáforo Rojo) según criterios NOM-011.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-3">
                {trabajadoresRiesgo.length === 0 ? (
                  <div className="bg-white/50 rounded-2xl p-8 text-center border border-dashed border-rose-200">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-50" />
                    <p className="text-slate-500 font-bold">No se detectan casos críticos en este momento.</p>
                  </div>
                ) : (
                  trabajadoresRiesgo.map((estudio) => (
                    <div
                      key={estudio.id}
                      className="flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm border border-rose-100 hover:shadow-md transition-all active:scale-[0.99] cursor-pointer group"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                          <Ear className="w-6 h-6 text-rose-600" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg">
                            {estudio.paciente?.nombre} {estudio.paciente?.apellido_paterno}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-sm font-bold">
                            <span className="text-rose-600">
                              HL Izq: {estudio.oi_4000hz} dB • HL Der: {estudio.od_4000hz} dB
                            </span>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-400 uppercase tracking-widest text-[10px]">
                              Fecha: {new Date(estudio.fecha_estudio).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-xl hover:bg-rose-50 text-rose-600 font-black uppercase text-[10px] tracking-widest">
                        Expediente
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DataContainer>
  );
}
