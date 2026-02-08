import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Ear,
  Save,
  Upload,
  Activity,
  ChevronRight,
  ChevronLeft,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-hot-toast';
import { GraficaAudiograma } from './GraficaAudiograma';
import { SemaforoNOM011 } from './SemaforoNOM011';
import type { TipoEstudioAudiometria as TipoAudiometria, SemaforoNom011 as SemaforoType } from '@/types/nom011';

const audiometriaSchema = z.object({
  tipo: z.enum(['ingreso', 'periodico', 'cambio_area', 'baja', 'especial', 'reevaluacion']),

  // Oído Derecho
  od_250hz: z.number().min(0).max(120).optional(),
  od_500hz: z.number().min(0).max(120).optional(),
  od_1000hz: z.number().min(0).max(120).optional(),
  od_2000hz: z.number().min(0).max(120).optional(),
  od_3000hz: z.number().min(0).max(120).optional(),
  od_4000hz: z.number().min(0).max(120).optional(),
  od_6000hz: z.number().min(0).max(120).optional(),
  od_8000hz: z.number().min(0).max(120).optional(),

  // Oído Izquierdo
  oi_250hz: z.number().min(0).max(120).optional(),
  oi_500hz: z.number().min(0).max(120).optional(),
  oi_1000hz: z.number().min(0).max(120).optional(),
  oi_2000hz: z.number().min(0).max(120).optional(),
  oi_3000hz: z.number().min(0).max(120).optional(),
  oi_4000hz: z.number().min(0).max(120).optional(),
  oi_6000hz: z.number().min(0).max(120).optional(),
  oi_8000hz: z.number().min(0).max(120).optional(),

  // Interpretación
  interpretacion: z.string().optional(),
  retardo_auditivo_od: z.boolean().default(false),
  retardo_auditivo_oi: z.boolean().default(false),
  requiere_reevaluacion: z.boolean().default(false),
  tiempo_reevaluacion_meses: z.number().optional(),

  // Archivo
  imagen_audiograma: z.instanceof(File).optional(),
});

type AudiometriaFormValues = z.infer<typeof audiometriaSchema>;

interface AudiometriaFormProps {
  pacienteId?: string;
  onSubmit: (data: AudiometriaFormValues) => void;
  onCancel: () => void;
}

const frecuencias = [
  { key: '250hz', label: '250 Hz' },
  { key: '500hz', label: '500 Hz' },
  { key: '1000hz', label: '1,000 Hz' },
  { key: '2000hz', label: '2,000 Hz' },
  { key: '3000hz', label: '3,000 Hz' },
  { key: '4000hz', label: '4,000 Hz' },
  { key: '6000hz', label: '6,000 Hz' },
  { key: '8000hz', label: '8,000 Hz' },
];

export function AudiometriaForm({ pacienteId, onSubmit, onCancel }: AudiometriaFormProps) {
  const { register, handleSubmit, watch, setValue, control, formState: { errors, isSubmitting } } = useForm<AudiometriaFormValues>({
    resolver: zodResolver(audiometriaSchema),
    defaultValues: {
      tipo: 'periodico',
      retardo_auditivo_od: false,
      retardo_auditivo_oi: false,
      requiere_reevaluacion: false,
    },
  });

  const tipo = watch('tipo');
  const requiereReevaluacion = watch('requiere_reevaluacion');

  // Calcular semáforo basado en valores (simplificado)
  const calcularSemaforo = (): SemaforoType => {
    const odValues = frecuencias.map(f => watch(`od_${f.key}` as keyof AudiometriaFormValues) as number).filter(v => v !== undefined);
    const oiValues = frecuencias.map(f => watch(`oi_${f.key}` as keyof AudiometriaFormValues) as number).filter(v => v !== undefined);

    const allValues = [...odValues, ...oiValues];
    if (allValues.length === 0) return 'verde';

    const maxValue = Math.max(...allValues);
    if (maxValue >= 45) return 'rojo';
    if (maxValue >= 25) return 'amarillo';
    return 'verde';
  };

  const semaforo = calcularSemaforo();

  const handleGuardar = async (values: AudiometriaFormValues) => {
    try {
      // Aquí iría la llamada a la API
      // await audiometriaService.create(values);
      toast.success('Audiometría guardada correctamente');
      onSubmit(values);
    } catch (error) {
      toast.error('Error al guardar la audiometría');
    }
  };

  const limpiarFormulario = () => {
    frecuencias.forEach(f => {
      setValue(`od_${f.key}` as keyof AudiometriaFormValues, undefined);
      setValue(`oi_${f.key}` as keyof AudiometriaFormValues, undefined);
    });
  };

  const renderFrecuenciaInput = (ear: 'od' | 'oi', freq: { key: string; label: string }) => {
    const fieldName = `${ear}_${freq.key}` as keyof AudiometriaFormValues;
    const value = watch(fieldName);

    let borderColor = 'border-gray-200';
    if (value !== undefined) {
      const numValue = value as number;
      if (numValue >= 45) borderColor = 'border-rose-300 focus:border-rose-500 focus:ring-rose-500';
      else if (numValue >= 25) borderColor = 'border-amber-300 focus:border-amber-500 focus:ring-amber-500';
      else borderColor = 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500';
    }

    return (
      <div key={freq.key} className="space-y-1">
        <Label className="text-xs font-medium text-slate-600">{freq.label}</Label>
        <Input
          type="number"
          min={0}
          max={120}
          placeholder="dB"
          className={`text-center ${borderColor}`}
          {...register(fieldName, { valueAsNumber: true })}
        />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(handleGuardar)} className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Ear className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Audiometría NOM-011</h3>
            <p className="text-xs text-slate-500">Registro de estudio audiométrico</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
            {...register('tipo')}
          >
            <option value="ingreso">Ingreso</option>
            <option value="periodico">Periódico</option>
            <option value="reevaluacion">Reevaluación</option>
            <option value="baja">Egreso / Baja</option>
            <option value="cambio_area">Cambio de Área</option>
            <option value="especial">Especial</option>
          </select>
          <Button
            type="button"
            variant="outline"
            onClick={limpiarFormulario}
            className="rounded-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Limpiar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Oído Derecho */}
        <Card className="border shadow-md border-blue-100">
          <CardHeader className="bg-blue-50/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              Oído Derecho (OD)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-4 gap-3">
              {frecuencias.map(freq => renderFrecuenciaInput('od', freq))}
            </div>
          </CardContent>
        </Card>

        {/* Oído Izquierdo */}
        <Card className="border shadow-md border-red-100">
          <CardHeader className="bg-red-50/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              Oído Izquierdo (OI)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-4 gap-3">
              {frecuencias.map(freq => renderFrecuenciaInput('oi', freq))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Semáforo y Gráfica */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border shadow-md lg:col-span-1">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Resultado NOM-011
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <SemaforoNOM011 estado={semaforo} />

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="retardo_od"
                  {...register('retardo_auditivo_od')}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="retardo_od" className="text-sm cursor-pointer">
                  Retardo auditivo OD
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="retardo_oi"
                  {...register('retardo_auditivo_oi')}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="retardo_oi" className="text-sm cursor-pointer">
                  Retardo auditivo OI
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reevaluacion"
                  {...register('requiere_reevaluacion')}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="reevaluacion" className="text-sm cursor-pointer">
                  Requiere reevaluación
                </Label>
              </div>
              {requiereReevaluacion && (
                <div className="ml-6">
                  <Label className="text-xs">Tiempo (meses)</Label>
                  <Input
                    type="number"
                    {...register('tiempo_reevaluacion_meses', { valueAsNumber: true })}
                    className="w-24"
                    placeholder="6"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-md lg:col-span-2">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-lg">Audiograma</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <GraficaAudiograma data={watch()} height={250} />
          </CardContent>
        </Card>
      </div>

      {/* Interpretación y Archivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border shadow-md">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-lg">Interpretación</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <textarea
              {...register('interpretacion')}
              placeholder="Ingrese la interpretación clínica de la audiometría..."
              className="w-full min-h-[120px] p-3 rounded-md border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </CardContent>
        </Card>

        <Card className="border shadow-md">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-lg">Imagen del Audiograma</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                Arrastre una imagen o haga clic para seleccionar
              </p>
              <p className="text-xs text-slate-400 mt-1">
                JPG, PNG o PDF hasta 10MB
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-full">
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Guardando...' : 'Guardar Audiometría'}
        </Button>
      </div>
    </form>
  );
}
