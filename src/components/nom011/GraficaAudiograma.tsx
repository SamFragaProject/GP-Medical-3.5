import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface GraficaAudiogramaProps {
  data: {
    od_250hz?: number;
    od_500hz?: number;
    od_1000hz?: number;
    od_2000hz?: number;
    od_3000hz?: number;
    od_4000hz?: number;
    od_6000hz?: number;
    od_8000hz?: number;
    oi_250hz?: number;
    oi_500hz?: number;
    oi_1000hz?: number;
    oi_2000hz?: number;
    oi_3000hz?: number;
    oi_4000hz?: number;
    oi_6000hz?: number;
    oi_8000hz?: number;
  };
  height?: number;
}

export function GraficaAudiograma({ data, height = 300 }: GraficaAudiogramaProps) {
  // Preparar datos para el gráfico
  const chartData = [
    { frecuencia: '250', hz: 250, od: data.od_250hz ?? null, oi: data.oi_250hz ?? null },
    { frecuencia: '500', hz: 500, od: data.od_500hz ?? null, oi: data.oi_500hz ?? null },
    { frecuencia: '1K', hz: 1000, od: data.od_1000hz ?? null, oi: data.oi_1000hz ?? null },
    { frecuencia: '2K', hz: 2000, od: data.od_2000hz ?? null, oi: data.oi_2000hz ?? null },
    { frecuencia: '3K', hz: 3000, od: data.od_3000hz ?? null, oi: data.oi_3000hz ?? null },
    { frecuencia: '4K', hz: 4000, od: data.od_4000hz ?? null, oi: data.oi_4000hz ?? null },
    { frecuencia: '6K', hz: 6000, od: data.od_6000hz ?? null, oi: data.oi_6000hz ?? null },
    { frecuencia: '8K', hz: 8000, od: data.od_8000hz ?? null, oi: data.oi_8000hz ?? null },
  ];

  // Verificar si hay datos para mostrar
  const hasData = chartData.some(d => d.od !== null || d.oi !== null);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] bg-slate-50 rounded-lg border border-dashed border-slate-300">
        <div className="text-center">
          <p className="text-slate-500 text-sm">Ingrese los valores de audiometría</p>
          <p className="text-slate-400 text-xs mt-1">El gráfico se actualizará automáticamente</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-sm mb-2">{label} Hz</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value} dB
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="frecuencia" 
            label={{ value: 'Frecuencia (Hz)', position: 'insideBottom', offset: -10 }}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={[120, -10]}
            reversed
            label={{ value: 'dB HL', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
            ticks={[120, 110, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0, -10]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} />
          
          {/* Líneas de referencia para semáforo NOM-011 */}
          <ReferenceLine y={25} stroke="#fbbf24" strokeDasharray="5 5" strokeWidth={1.5} />
          <ReferenceLine y={45} stroke="#f87171" strokeDasharray="5 5" strokeWidth={1.5} />
          
          <Line
            type="monotone"
            dataKey="od"
            name="Oído Derecho"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="oi"
            name="Oído Izquierdo"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Leyenda de referencias */}
      <div className="flex justify-center gap-6 mt-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-amber-400 border-dashed" style={{ borderTop: '1.5px dashed #fbbf24' }} />
          <span className="text-slate-600">Límite observación (25 dB)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-red-400 border-dashed" style={{ borderTop: '1.5px dashed #f87171' }} />
          <span className="text-slate-600">Límite daño (45 dB)</span>
        </div>
      </div>
    </div>
  );
}
