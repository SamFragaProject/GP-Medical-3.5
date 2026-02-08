import React, { useState, useEffect } from 'react';
import { Calculator, RotateCcw, Info, CheckCircle2, AlertTriangle, Weight, ArrowUp, MoveHorizontal, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  NivelRiesgoNIOSHTexto,
  type NivelRiesgoNIOSH,
  type InterpretacionNIOSH
} from '@/types/nom036';

interface EvaluacionNIOSHProps {
  pacienteId?: string;
  onSubmit: (resultado: {
    li: number;
    nivelRiesgo: NivelRiesgoNIOSH;
    interpretacion: InterpretacionNIOSH;
    factores: {
      fh: number;
      fv: number;
      fd: number;
      fa: number;
      ff: number;
      fc: number;
    };
  }) => void;
  onCancel: () => void;
}

export function EvaluacionNIOSH({ pacienteId, onSubmit, onCancel }: EvaluacionNIOSHProps) {
  const [values, setValues] = useState({
    pesoCarga: 10,
    distanciaVertical: 75, // cm (altura de las manos al inicio)
    distanciaHorizontal: 30, // cm (distancia del cuerpo)
    anguloAsimetria: 0, // grados
    frecuencia: 1, // levantamientos por minuto
    duracion: 'corta' as 'corta' | 'mediana' | 'larga',
    agarre: 'bueno' as 'bueno' | 'regular' | 'malo',
    sexo: 'masculino' as 'masculino' | 'femenino',
  });

  const [resultado, setResultado] = useState<{
    li: number;
    lc: number;
    nivelRiesgo: NivelRiesgoNIOSH;
    interpretacion: InterpretacionNIOSH;
    factores: {
      fh: number;
      fv: number;
      fd: number;
      fa: number;
      ff: number;
      fc: number;
    };
  } | null>(null);

  // Cálculo del Índice de Elevación NIOSH
  useEffect(() => {
    // LC (Lifting Constant)
    const lc = values.sexo === 'masculino' ? 23 : 14; // kg

    // FM (Frequency Multiplier)
    let ff: number;
    if (values.duracion === 'corta') {
      if (values.frecuencia <= 0.2) ff = 1.0;
      else if (values.frecuencia <= 1) ff = 0.94;
      else if (values.frecuencia <= 4) ff = 0.84;
      else if (values.frecuencia <= 6) ff = 0.75;
      else ff = 0.52;
    } else if (values.duracion === 'mediana') {
      if (values.frecuencia <= 0.2) ff = 0.95;
      else if (values.frecuencia <= 1) ff = 0.88;
      else if (values.frecuencia <= 4) ff = 0.72;
      else if (values.frecuencia <= 6) ff = 0.50;
      else ff = 0.37;
    } else {
      if (values.frecuencia <= 0.2) ff = 0.85;
      else if (values.frecuencia <= 1) ff = 0.75;
      else if (values.frecuencia <= 4) ff = 0.50;
      else if (values.frecuencia <= 6) ff = 0.37;
      else ff = 0.0;
    }

    // HM (Horizontal Multiplier)
    const fh = Math.max(0, 25 / values.distanciaHorizontal);

    // VM (Vertical Multiplier)
    const fv = Math.max(0, 1 - 0.003 * Math.abs(values.distanciaVertical - 75));

    // DM (Distance Multiplier)
    const verticalDestino = values.distanciaVertical - 50; // Asumimos que baja 50cm
    const distanciaVerticalTotal = Math.abs(verticalDestino - values.distanciaVertical);
    const fd = Math.max(0, 0.82 + 4.5 / (distanciaVerticalTotal || 1));

    // AM (Asymmetric Multiplier)
    const fa = Math.max(0, 1 - 0.0032 * values.anguloAsimetria);

    // CM (Coupling Multiplier)
    const fc = values.agarre === 'bueno' ? 1.0 : values.agarre === 'regular' ? 0.9 : 0.8;

    // RWL (Recommended Weight Limit)
    const rwl = lc * fh * fv * fd * fa * ff * fc;

    // LI (Lifting Index)
    const li = values.pesoCarga / (rwl || 1);

    // Interpretación
    let interpretacion: InterpretacionNIOSH;
    let nivelRiesgo: NivelRiesgoNIOSH;
    if (li <= 1) {
      interpretacion = 'sin_riesgo';
      nivelRiesgo = 'aceptable';
    } else if (li <= 2) {
      interpretacion = 'con_riesgo';
      nivelRiesgo = 'mejora';
    } else if (li <= 3) {
      interpretacion = 'con_riesgo';
      nivelRiesgo = 'pronto';
    } else {
      interpretacion = 'excesivo';
      nivelRiesgo = 'ahora';
    }

    setResultado({
      li: Math.round(li * 100) / 100,
      lc,
      nivelRiesgo,
      interpretacion,
      factores: { fh, fv, fd, fa, ff, fc },
    });
  }, [values]);

  const handleReset = () => {
    setValues({
      pesoCarga: 10,
      distanciaVertical: 75,
      distanciaHorizontal: 30,
      anguloAsimetria: 0,
      frecuencia: 1,
      duracion: 'corta',
      agarre: 'bueno',
      sexo: 'masculino',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-emerald-600" />
            Calculadora NIOSH
          </h2>
          <p className="text-sm text-slate-500">
            Índice de Elevación para manejo de cargas
          </p>
        </div>
        <Button variant="outline" onClick={handleReset} className="rounded-full">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reiniciar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="space-y-4">
          {/* Peso y Sexo */}
          <Card className="border shadow-md">
            <CardHeader className="bg-slate-50/50 py-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Weight className="w-4 h-4" />
                Carga y Trabajador
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Peso de la carga (kg)</Label>
                  <Input
                    type="number"
                    value={values.pesoCarga}
                    onChange={(e) => setValues(v => ({ ...v, pesoCarga: Number(e.target.value) }))}
                    min={0}
                    max={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Sexo</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
                    value={values.sexo}
                    onChange={(e) => setValues(v => ({ ...v, sexo: e.target.value as 'masculino' | 'femenino' }))}
                  >
                    <option value="masculino">Masculino (LC=23kg)</option>
                    <option value="femenino">Femenino (LC=14kg)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distancias */}
          <Card className="border shadow-md">
            <CardHeader className="bg-slate-50/50 py-4">
              <CardTitle className="text-base flex items-center gap-2">
                <MoveHorizontal className="w-4 h-4" />
                Distancias y Posición
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Distancia vertical (cm)</Label>
                  <span className="text-sm font-mono">{values.distanciaVertical} cm</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={175}
                  value={values.distanciaVertical}
                  onChange={(e) => setValues(v => ({ ...v, distanciaVertical: Number(e.target.value) }))}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">Altura de las manos respecto al piso</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Distancia horizontal (cm)</Label>
                  <span className="text-sm font-mono">{values.distanciaHorizontal} cm</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={80}
                  value={values.distanciaHorizontal}
                  onChange={(e) => setValues(v => ({ ...v, distanciaHorizontal: Number(e.target.value) }))}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">Distancia entre la carga y las piernas</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Ángulo de asimetría (°)</Label>
                  <span className="text-sm font-mono">{values.anguloAsimetria}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={135}
                  value={values.anguloAsimetria}
                  onChange={(e) => setValues(v => ({ ...v, anguloAsimetria: Number(e.target.value) }))}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">Rotación del tronco respecto a las piernas</p>
              </div>
            </CardContent>
          </Card>

          {/* Frecuencia y Duración */}
          <Card className="border shadow-md">
            <CardHeader className="bg-slate-50/50 py-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Frecuencia y Duración
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Frecuencia (levantamientos/min)</Label>
                  <span className="text-sm font-mono">{values.frecuencia}/min</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={15}
                  step={0.1}
                  value={values.frecuencia}
                  onChange={(e) => setValues(v => ({ ...v, frecuencia: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Duración</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
                    value={values.duracion}
                    onChange={(e) => setValues(v => ({ ...v, duracion: e.target.value as 'corta' | 'mediana' | 'larga' }))}
                  >
                    <option value="corta">Corta (&lt;1h)</option>
                    <option value="mediana">Mediana (1-2h)</option>
                    <option value="larga">Larga (2-8h)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Tipo de agarre</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
                    value={values.agarre}
                    onChange={(e) => setValues(v => ({ ...v, agarre: e.target.value as 'bueno' | 'regular' | 'malo' }))}
                  >
                    <option value="bueno">Bueno</option>
                    <option value="regular">Regular</option>
                    <option value="malo">Malo</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resultado */}
        <div className="space-y-4">
          {resultado && (
            <>
              <Card className={`border-2 ${
                resultado.nivelRiesgo === 'ahora' ? 'border-rose-500' :
                resultado.nivelRiesgo === 'pronto' ? 'border-amber-500' :
                resultado.nivelRiesgo === 'mejora' ? 'border-lime-500' :
                'border-emerald-500'
              }`}>
                <CardContent className="p-6 text-center">
                  <h3 className="text-sm text-slate-500 mb-2">Índice de Elevación (LI)</h3>
                  <p className="text-5xl font-bold mb-4" style={{ color: NivelRiesgoNIOSHTexto[resultado.nivelRiesgo].color }}>
                    {resultado.li}
                  </p>
                  <Badge 
                    className="text-base px-4 py-1"
                    style={{ 
                      backgroundColor: NivelRiesgoNIOSHTexto[resultado.nivelRiesgo].color,
                      color: 'white'
                    }}
                  >
                    {NivelRiesgoNIOSHTexto[resultado.nivelRiesgo].texto}
                  </Badge>
                  <p className="text-sm text-slate-600 mt-4">
                    {NivelRiesgoNIOSHTexto[resultado.nivelRiesgo].descripcion}
                  </p>
                </CardContent>
              </Card>

              <Card className="border shadow-md">
                <CardHeader className="bg-slate-50/50 py-4">
                  <CardTitle className="text-base">Factores de Multiplicación</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-lg font-bold text-slate-900">{resultado.factores.fh.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">Horizontal (HM)</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-lg font-bold text-slate-900">{resultado.factores.fv.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">Vertical (VM)</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-lg font-bold text-slate-900">{resultado.factores.fd.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">Distancia (DM)</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-lg font-bold text-slate-900">{resultado.factores.fa.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">Asimetría (AM)</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-lg font-bold text-slate-900">{resultado.factores.ff.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">Frecuencia (FM)</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-lg font-bold text-slate-900">{resultado.factores.fc.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">Agarre (CM)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-md">
                <CardHeader className="bg-slate-50/50 py-4">
                  <CardTitle className="text-base">Límite Recomendado (RWL)</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-900">
                      {(resultado.lc * resultado.factores.fh * resultado.factores.fv * resultado.factores.fd * resultado.factores.fa * resultado.factores.ff * resultado.factores.fc).toFixed(2)} kg
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Peso máximo recomendado para estas condiciones
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-full">
          Cancelar
        </Button>
        {resultado && (
          <Button
            type="button"
            onClick={() => onSubmit({
              li: resultado.li,
              nivelRiesgo: resultado.nivelRiesgo,
              interpretacion: resultado.interpretacion,
              factores: resultado.factores,
            })}
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
