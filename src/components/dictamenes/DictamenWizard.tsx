import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  FileCheck,
  AlertTriangle,
  FileSignature,
  ChevronRight,
  ChevronLeft,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { SignaturePad } from '@/components/shared/SignaturePad';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { usePermisosDinamicos } from '@/hooks/usePermisosDinamicos';
import { DictamenForm } from './DictamenForm';
import { ValidadorEstudios } from './ValidadorEstudios';
import { toast } from 'react-hot-toast';
import type { TipoEvaluacionDictamen as TipoEvaluacion, ResultadoDictamen } from '@/types/dictamen';

const dictamenWizardSchema = z.object({
  paciente_id: z.string().min(1, 'Seleccione un paciente'),
  tipo_evaluacion: z.enum(['preempleo', 'ingreso', 'periodico', 'retorno', 'egreso', 'reubicacion', 'reincorporacion']),
  resultado: z.enum(['apto', 'apto_restricciones', 'no_apto_temporal', 'no_apto', 'evaluacion_complementaria']),
  restricciones: z.array(z.string()),
  restricciones_detalle: z.string().optional(),
  recomendaciones_medicas: z.string().optional(),
  recomendaciones_epp: z.array(z.string()),
  fecha_vigencia_inicio: z.string(),
  fecha_vigencia_fin: z.string().optional(),
  firma_digital: z.string().optional(),
}).refine((data) => {
  // Si resultado no es 'apto', debe tener al menos una restricción
  if (data.resultado !== 'apto' && data.restricciones.length === 0) {
    return false;
  }
  return true;
}, {
  message: 'Debe seleccionar al menos una restricción cuando el resultado no es "Apto"',
  path: ['restricciones'],
});

export type DictamenWizardValues = z.infer<typeof dictamenWizardSchema>;

interface DictamenWizardProps {
  pacienteId?: string;
  onComplete: () => void;
  onCancel: () => void;
}

type WizardStep = 1 | 2 | 3 | 4;

export function DictamenWizard({ pacienteId, onComplete, onCancel }: DictamenWizardProps) {
  const { puede } = usePermisosDinamicos();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [estudiosValidos, setEstudiosValidos] = useState(false);
  const [estudiosFaltantes, setEstudiosFaltantes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>(pacienteId || '');
  const [tipoEvaluacion, setTipoEvaluacion] = useState<TipoEvaluacion>('preempleo');

  const methods = useForm<DictamenWizardValues>({
    resolver: zodResolver(dictamenWizardSchema),
    defaultValues: {
      paciente_id: pacienteId || '',
      tipo_evaluacion: 'preempleo',
      resultado: 'apto',
      restricciones: [],
      restricciones_detalle: '',
      recomendaciones_medicas: '',
      recomendaciones_epp: [],
      fecha_vigencia_inicio: new Date().toISOString().split('T')[0],
      fecha_vigencia_fin: '',
      firma_digital: '',
    },
  });

  const { watch, handleSubmit, setValue, formState: { errors } } = methods;
  const resultado = watch('resultado');
  const restricciones = watch('restricciones');

  useEffect(() => {
    if (pacienteId) {
      setSelectedPacienteId(pacienteId);
      setValue('paciente_id', pacienteId);
    }
  }, [pacienteId, setValue]);

  const handleValidacionChange = (valido: boolean, faltantes: string[]) => {
    setEstudiosValidos(valido);
    setEstudiosFaltantes(faltantes);
  };

  const canAdvance = () => {
    switch (currentStep) {
      case 1:
        return selectedPacienteId && tipoEvaluacion;
      case 2:
        return estudiosValidos;
      case 3:
        return resultado && (resultado === 'apto' || restricciones.length > 0);
      case 4:
        return true;
      default:
        return false;
    }
  };

  const onSubmit = async (values: DictamenWizardValues) => {
    if (!puede('dictamenes', 'crear')) {
      toast.error('No tiene permisos para crear dictámenes');
      return;
    }

    setIsSubmitting(true);
    try {
      // Aquí iría la llamada a la API
      // await dictamenService.create(values);
      toast.success('Dictamen creado exitosamente');
      onComplete();
    } catch (error) {
      toast.error('Error al crear el dictamen');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Paciente', icon: User },
    { number: 2, title: 'Estudios', icon: FileCheck },
    { number: 3, title: 'Resultado', icon: AlertTriangle },
    { number: 4, title: 'Firma', icon: FileSignature },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Card className="border shadow-md">
              <CardHeader className="bg-slate-50/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  Selección de Paciente y Tipo de Evaluación
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Paciente <span className="text-red-500">*</span>
                    </label>
                    {/* Aquí iría el componente de búsqueda de pacientes */}
                    <div className="p-3 border rounded-lg bg-slate-50">
                      <p className="text-sm text-slate-500">
                        {selectedPacienteId ? 'Paciente seleccionado' : 'Buscar paciente...'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Tipo de Evaluación <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
                      value={tipoEvaluacion}
                      onChange={(e) => {
                        setTipoEvaluacion(e.target.value as TipoEvaluacion);
                        setValue('tipo_evaluacion', e.target.value as TipoEvaluacion);
                      }}
                    >
                      <option value="preempleo">Preempleo</option>
                      <option value="periodico">Periódico</option>
                      <option value="retorno">Retorno a Trabajo</option>
                      <option value="egreso">Egreso</option>
                      <option value="reubicacion">Reubicación</option>
                      <option value="reincorporacion">Reincorporación</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {selectedPacienteId && (
              <ValidadorEstudios
                pacienteId={selectedPacienteId}
                tipoEvaluacion={tipoEvaluacion}
                onValidacionChange={handleValidacionChange}
              />
            )}
            {!estudiosValidos && estudiosFaltantes.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Estudios pendientes
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Complete los estudios faltantes antes de continuar con el dictamen.
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <FormProvider {...methods}>
            <DictamenForm />
          </FormProvider>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Card className="border shadow-md">
              <CardHeader className="bg-slate-50/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileSignature className="w-5 h-5 text-emerald-600" />
                  Firma Digital y Recomendaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="p-4 bg-slate-50 rounded-lg border">
                  <h4 className="font-semibold text-slate-900 mb-2">Resumen del Dictamen</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Resultado:</span>
                      <Badge
                        variant={resultado === 'apto' ? 'success' : resultado.includes('no_apto') ? 'destructive' : 'warning'}
                        className="ml-2"
                      >
                        {resultado === 'apto' && 'Apto'}
                        {resultado === 'apto_restricciones' && 'Apto con Restricciones'}
                        {resultado === 'no_apto_temporal' && 'No Apto Temporal'}
                        {resultado === 'no_apto' && 'No Apto'}
                        {resultado === 'evaluacion_complementaria' && 'Evaluación Complementaria'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-slate-500">Restricciones:</span>
                      <span className="ml-2 font-medium">{restricciones.length}</span>
                    </div>
                  </div>
                </div>

                {/* Componente de firma digital */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-black text-white/40 uppercase tracking-widest">
                      Firma del Médico Responsable <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setValue('firma_digital', '')}
                      className="text-[10px] font-black uppercase text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      Limpiar Firma
                    </button>
                  </div>

                  <div className="bg-white/5 border-2 border-dashed border-white/10 rounded-3xl overflow-hidden p-4">
                    <SignaturePad
                      onSave={(signatureUrl) => setValue('firma_digital', signatureUrl)}
                      onClear={() => setValue('firma_digital', '')}
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider leading-tight">
                      Esta firma será estampada digitalmente en el dictamen PDF y vinculada a su cédula profesional.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                    : isCompleted
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-100 text-slate-400'
                    }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${isActive ? 'text-emerald-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <Separator />

      {/* Step Content */}
      <div className="min-h-[400px]">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => currentStep === 1 ? onCancel() : setCurrentStep((prev) => (prev - 1) as WizardStep)}
          className="rounded-full"
        >
          {currentStep === 1 ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </>
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </>
          )}
        </Button>

        {currentStep < 4 ? (
          <Button
            type="button"
            onClick={() => setCurrentStep((prev) => (prev + 1) as WizardStep)}
            disabled={!canAdvance()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
          >
            Siguiente
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Guardando...' : 'Finalizar Dictamen'}
          </Button>
        )}
      </div>
    </div>
  );
}
