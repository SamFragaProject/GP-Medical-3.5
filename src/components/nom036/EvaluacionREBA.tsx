import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, RotateCcw, Calculator, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-hot-toast';
import { 
  TablaA_REBA, 
  TablaB_REBA, 
  TablaC_REBA, 
  NivelRiesgoREBATexto,
  type NivelRiesgoREBA 
} from '@/types/nom036';

interface EvaluacionREBAProps {
  pacienteId?: string;
  onSubmit: (resultado: {
    puntuacionA: number;
    puntuacionB: number;
    puntuacionC: number;
    puntuacionFinal: number;
    nivelRiesgo: NivelRiesgoREBA;
  }) => void;
  onCancel: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface REBAState {
  // Grupo A
  cuello: { postura: number; rotacion: boolean; inclinacion: boolean };
  tronco: { postura: number; rotacion: boolean; inclinacion: boolean };
  piernas: { postura: number; apoyo: boolean };
  fuerzaCargaA: number;
  
  // Grupo B
  brazo: { postura: number; abduccion: boolean; apoyo: boolean; rotacion: boolean };
  antebrazo: { postura: number };
  muneca: { postura: number; desviacion: boolean; rotacion: boolean };
  fuerzaCargaB: number;
  
  // Agarre y Actividad
  agarre: number;
  actividad: { estatica: boolean; repetitiva: boolean; cambios: boolean };
}

export function EvaluacionREBA({ pacienteId, onSubmit, onCancel }: EvaluacionREBAProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [state, setState] = useState<REBAState>({
    cuello: { postura: 1, rotacion: false, inclinacion: false },
    tronco: { postura: 1, rotacion: false, inclinacion: false },
    piernas: { postura: 1, apoyo: true },
    fuerzaCargaA: 0,
    brazo: { postura: 1, abduccion: false, apoyo: false, rotacion: false },
    antebrazo: { postura: 1 },
    muneca: { postura: 1, desviacion: false, rotacion: false },
    fuerzaCargaB: 0,
    agarre: 0,
    actividad: { estatica: false, repetitiva: false, cambios: false },
  });

  const [resultado, setResultado] = useState<{
    puntuacionA: number;
    puntuacionB: number;
    puntuacionC: number;
    puntuacionFinal: number;
    nivelRiesgo: NivelRiesgoREBA;
  } | null>(null);

  // Calcular puntuación
  useEffect(() => {
    const filaCuello = state.cuello.postura - 1 + (state.cuello.rotacion ? 1 : 0) + (state.cuello.inclinacion ? 1 : 0);
    const columnaTronco = state.tronco.postura - 1 + (state.tronco.rotacion ? 1 : 0) + (state.tronco.inclinacion ? 1 : 0);
    const columnaPiernas = state.piernas.postura - 1;
    
    const puntuacionA = TablaA_REBA[filaCuello]?.[columnaTronco + columnaPiernas * 4] || 1;
    const puntuacionAFinal = puntuacionA + state.fuerzaCargaA;
    
    const filaBrazo = state.brazo.postura - 1 + (state.brazo.abduccion ? 1 : 0) + (state.brazo.apoyo ? -1 : 0) + (state.brazo.rotacion ? 1 : 0);
    const columnaAntebrazo = state.antebrazo.postura - 1;
    const columnaMuneca = state.muneca.postura - 1 + (state.muneca.desviacion ? 1 : 0) + (state.muneca.rotacion ? 1 : 0);
    
    const puntuacionB = TablaB_REBA[Math.min(filaBrazo, 7)]?.[Math.min(columnaAntebrazo + columnaMuneca * 2, 2)] || 1;
    const puntuacionBFinal = puntuacionB + state.fuerzaCargaB + state.agarre;
    
    const puntuacionC = TablaC_REBA[Math.min(puntuacionAFinal - 1, 11)]?.[Math.min(puntuacionBFinal - 1, 11)] || 1;
    
    let puntuacionFinal = puntuacionC;
    if (state.actividad.estatica) puntuacionFinal += 1;
    if (state.actividad.repetitiva) puntuacionFinal += 1;
    if (state.actividad.cambios) puntuacionFinal += 1;
    
    let nivelRiesgo: NivelRiesgoREBA = 'negligible';
    if (puntuacionFinal <= 1) nivelRiesgo = 'negligible';
    else if (puntuacionFinal <= 3) nivelRiesgo = 'bajo';
    else if (puntuacionFinal <= 7) nivelRiesgo = 'medio';
    else if (puntuacionFinal <= 10) nivelRiesgo = 'alto';
    else nivelRiesgo = 'muy_alto';
    
    setResultado({
      puntuacionA: puntuacionAFinal,
      puntuacionB: puntuacionBFinal,
      puntuacionC,
      puntuacionFinal,
      nivelRiesgo,
    });
  }, [state]);

  const steps: { number: Step; title: string; description: string }[] = [
    { number: 1, title: 'Cuello', description: 'Postura del cuello' },
    { number: 2, title: 'Tronco', description: 'Postura del tronco y piernas' },
    { number: 3, title: 'Carga A', description: 'Fuerza y carga' },
    { number: 4, title: 'Brazos', description: 'Postura de brazos y antebrazos' },
    { number: 5, title: 'Muñecas', description: 'Postura de muñecas' },
    { number: 6, title: 'Carga B', description: 'Fuerza, agarre y carga' },
    { number: 7, title: 'Resultado', description: 'Puntuación final' },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Postura del Cuello</h4>
            <div className="grid grid-cols-1 gap-2">
              {[
                { value: 1, label: '0° a 20° de flexión', desc: 'Posición neutral' },
                { value: 2, label: '20° a 45° de flexión o extensión', desc: 'Ligera flexión/extensión' },
                { value: 3, label: '45° o más de flexión o extensión', desc: 'Flexión/extensión extrema' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setState(s => ({ ...s, cuello: { ...s.cuello, postura: opt.value } }))}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    state.cuello.postura === opt.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-emerald-200'
                  }`}
                >
                  <span className="font-medium text-slate-900">{opt.label}</span>
                  <p className="text-sm text-slate-500">{opt.desc}</p>
                </button>
              ))}
            </div>
            <div className="space-y-2 pt-4 border-t">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state.cuello.rotacion}
                  onChange={(e) => setState(s => ({ ...s, cuello: { ...s.cuello, rotacion: e.target.checked } }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Rotación (+1)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state.cuello.inclinacion}
                  onChange={(e) => setState(s => ({ ...s, cuello: { ...s.cuello, inclinacion: e.target.checked } }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Inclinación lateral (+1)</span>
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Postura del Tronco</h4>
            <div className="grid grid-cols-1 gap-2">
              {[
                { value: 1, label: 'Neutral', desc: 'Posición erguida' },
                { value: 2, label: '0° a 20° de flexión/extensión', desc: 'Ligera inclinación' },
                { value: 3, label: '20° a 60° de flexión/extensión', desc: 'Inclinación moderada' },
                { value: 4, label: '60° o más de flexión', desc: 'Flexión extrema' },
                { value: 5, label: 'Extensión', desc: 'Inclinación hacia atrás' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setState(s => ({ ...s, tronco: { ...s.tronco, postura: opt.value } }))}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    state.tronco.postura === opt.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-emerald-200'
                  }`}
                >
                  <span className="font-medium text-slate-900">{opt.label}</span>
                  <p className="text-sm text-slate-500">{opt.desc}</p>
                </button>
              ))}
            </div>
            <div className="space-y-2 pt-4 border-t">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state.tronco.rotacion}
                  onChange={(e) => setState(s => ({ ...s, tronco: { ...s.tronco, rotacion: e.target.checked } }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Rotación (+1)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state.tronco.inclinacion}
                  onChange={(e) => setState(s => ({ ...s, tronco: { ...s.tronco, inclinacion: e.target.checked } }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Inclinación lateral (+1)</span>
              </label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Fuerza y Carga (Grupo A)</h4>
            <div className="grid grid-cols-1 gap-2">
              {[
                { value: 0, label: 'Menos de 5 kg', desc: 'Carga ligera o esfuerzo mínimo' },
                { value: 1, label: '5 kg a 10 kg', desc: 'Carga moderada' },
                { value: 2, label: 'Más de 10 kg', desc: 'Carga pesada' },
                { value: 3, label: 'Más de 10 kg con golpes/impactos', desc: 'Carga pesada con manipulación brusca' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setState(s => ({ ...s, fuerzaCargaA: opt.value }))}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    state.fuerzaCargaA === opt.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-emerald-200'
                  }`}
                >
                  <span className="font-medium text-slate-900">{opt.label}</span>
                  <p className="text-sm text-slate-500">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Postura del Brazo</h4>
            <div className="grid grid-cols-1 gap-2">
              {[
                { value: 1, label: '20° a 45° de flexión', desc: 'Posición cercana al cuerpo' },
                { value: 2, label: '45° a 90° de flexión', desc: 'Elevación moderada' },
                { value: 3, label: '90° o más de flexión', desc: 'Elevación alta' },
                { value: 4, label: 'Extensión', desc: 'Brazo hacia atrás' },
                { value: 5, label: 'Abducción', desc: 'Brazo alejado del cuerpo' },
                { value: 6, label: 'Elevación por encima del hombro', desc: 'Posición extrema' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setState(s => ({ ...s, brazo: { ...s.brazo, postura: opt.value } }))}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    state.brazo.postura === opt.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-emerald-200'
                  }`}
                >
                  <span className="font-medium text-slate-900">{opt.label}</span>
                  <p className="text-sm text-slate-500">{opt.desc}</p>
                </button>
              ))}
            </div>
            <div className="space-y-2 pt-4 border-t">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state.brazo.abduccion}
                  onChange={(e) => setState(s => ({ ...s, brazo: { ...s.brazo, abduccion: e.target.checked } }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Abducción (+1)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state.brazo.apoyo}
                  onChange={(e) => setState(s => ({ ...s, brazo: { ...s.brazo, apoyo: e.target.checked } }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Apoyo/estabilización (-1)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state.brazo.rotacion}
                  onChange={(e) => setState(s => ({ ...s, brazo: { ...s.brazo, rotacion: e.target.checked } }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Rotación del hombro (+1)</span>
              </label>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Postura de la Muñeca</h4>
            <div className="grid grid-cols-1 gap-2">
              {[
                { value: 1, label: 'Neutral', desc: 'Posición natural' },
                { value: 2, label: '0° a 15° de flexión/extensión', desc: 'Ligera desviación' },
                { value: 3, label: '15° o más de flexión', desc: 'Flexión marcada' },
                { value: 4, label: 'Extensión marcada', desc: 'Extensión extrema' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setState(s => ({ ...s, muneca: { ...s.muneca, postura: opt.value } }))}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    state.muneca.postura === opt.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-emerald-200'
                  }`}
                >
                  <span className="font-medium text-slate-900">{opt.label}</span>
                  <p className="text-sm text-slate-500">{opt.desc}</p>
                </button>
              ))}
            </div>
            <div className="space-y-2 pt-4 border-t">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state.muneca.desviacion}
                  onChange={(e) => setState(s => ({ ...s, muneca: { ...s.muneca, desviacion: e.target.checked } }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Desviación lateral (+1)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state.muneca.rotacion}
                  onChange={(e) => setState(s => ({ ...s, muneca: { ...s.muneca, rotacion: e.target.checked } }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Rotación (+1)</span>
              </label>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Fuerza y Carga (Grupo B)</h4>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: 0, label: 'Menos de 5 kg', desc: 'Carga ligera' },
                  { value: 1, label: '5 kg a 10 kg', desc: 'Carga moderada' },
                  { value: 2, label: 'Más de 10 kg', desc: 'Carga pesada' },
                  { value: 3, label: 'Más de 10 kg con golpes', desc: 'Carga con impacto' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setState(s => ({ ...s, fuerzaCargaB: opt.value }))}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      state.fuerzaCargaB === opt.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-emerald-200'
                    }`}
                  >
                    <span className="font-medium text-slate-900">{opt.label}</span>
                    <p className="text-sm text-slate-500">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Tipo de Agarre</h4>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: 0, label: 'Bueno', desc: 'Agarre adecuado con toda la mano' },
                  { value: 1, label: 'Regular', desc: 'Agarre con parte de la mano' },
                  { value: 2, label: 'Malo', desc: 'Agarre incómodo o inestable' },
                  { value: 3, label: 'Inaceptable', desc: 'Manipulación sin agarre adecuado' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setState(s => ({ ...s, agarre: opt.value }))}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      state.agarre === opt.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-emerald-200'
                    }`}
                  >
                    <span className="font-medium text-slate-900">{opt.label}</span>
                    <p className="text-sm text-slate-500">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            {resultado && (
              <>
                <Card className={`border-2 ${
                  resultado.nivelRiesgo === 'muy_alto' ? 'border-rose-500 bg-rose-50' :
                  resultado.nivelRiesgo === 'alto' ? 'border-orange-500 bg-orange-50' :
                  resultado.nivelRiesgo === 'medio' ? 'border-amber-500 bg-amber-50' :
                  resultado.nivelRiesgo === 'bajo' ? 'border-lime-500 bg-lime-50' :
                  'border-emerald-500 bg-emerald-50'
                }`}>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-3xl font-bold mb-2">{resultado.puntuacionFinal}</h3>
                    <p className="text-lg font-semibold">
                      {NivelRiesgoREBATexto[resultado.nivelRiesgo].texto}
                    </p>
                    <p className="text-sm mt-2 opacity-80">
                      {NivelRiesgoREBATexto[resultado.nivelRiesgo].accion}
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-slate-900">{resultado.puntuacionA}</p>
                    <p className="text-xs text-slate-500">Tabla A (Cuerpo)</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-slate-900">{resultado.puntuacionB}</p>
                    <p className="text-xs text-slate-500">Tabla B (Brazos)</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-slate-900">{resultado.puntuacionC}</p>
                    <p className="text-xs text-slate-500">Tabla C</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={state.actividad.estatica}
                      onChange={(e) => setState(s => ({ ...s, actividad: { ...s.actividad, estatica: e.target.checked } }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Postura mantenida por más de 1 minuto (+1)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={state.actividad.repetitiva}
                      onChange={(e) => setState(s => ({ ...s, actividad: { ...s.actividad, repetitiva: e.target.checked } }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Movimientos repetitivos (+1)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={state.actividad.cambios}
                      onChange={(e) => setState(s => ({ ...s, actividad: { ...s.actividad, cambios: e.target.checked } }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Cambios rápidos de postura (+1)</span>
                  </label>
                </div>
              </>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Paso {currentStep} de 7</span>
          <span className="font-medium">{Math.round((currentStep / 7) * 100)}%</span>
        </div>
        <Progress value={(currentStep / 7) * 100} className="h-2" />
      </div>

      {/* Step Title */}
      <div>
        <h3 className="text-lg font-bold text-slate-900">{steps[currentStep - 1].title}</h3>
        <p className="text-sm text-slate-500">{steps[currentStep - 1].description}</p>
      </div>

      {/* Step Content */}
      <Card className="border shadow-md">
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => currentStep === 1 ? onCancel() : setCurrentStep(s => (s - 1) as Step)}
          className="rounded-full"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {currentStep === 1 ? 'Cancelar' : 'Anterior'}
        </Button>

        {currentStep < 7 ? (
          <Button
            type="button"
            onClick={() => setCurrentStep(s => (s + 1) as Step)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
          >
            Siguiente
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => resultado && onSubmit(resultado)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Guardar Evaluación
          </Button>
        )}
      </div>
    </div>
  );
}
