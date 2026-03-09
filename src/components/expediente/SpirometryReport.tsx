// @ts-nocheck
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

export interface SpirometryData {
  patient: {
    name: string; id: string; age: string; dob: string;
    sex: string; height: string; weight: string;
    origin: string; smoker: string; asthma: string;
    copd: string; bmi: string;
  };
  testDetails: {
    date: string; interpretation: string; predicted: string;
    selection: string; bestValue: string; fev1PredPercent: string;
  };
  results: {
    parameter: string; pred: string; lln: string; mejor: string;
    prueba2: string; prueba6: string; prueba5: string;
    percentPred: string; zScore: string;
  }[];
  session: { quality: string; interpretation: string; };
  doctor: { name: string; date: string; notes: string; };
  graphs: {
    flowVolume: { volume: number; flowPred: number; flowMejor: number; flowPrueba2: number; flowPrueba5: number; flowPrueba6: number; }[];
    volumeTime: { time: number; volumePred: number; volumeMejor: number; volumePrueba2: number; volumePrueba5: number; volumePrueba6: number; }[];
  };
}

interface Props { data: SpirometryData; }

// ── Helper: is value abnormal ──
const isAbnormal = (val: string | undefined) => {
  if (!val) return false;
  const n = parseFloat(val.replace(/[^0-9.\-]/g, ''));
  if (isNaN(n)) return false;
  return n < -1.64;
};

const isPctLow = (val: string | undefined) => {
  if (!val) return false;
  const n = parseFloat(val.replace(/[^0-9.\-]/g, ''));
  return !isNaN(n) && n < 80;
};

export function SpirometryReport({ data }: Props) {
  return (
    <div className="bg-white text-slate-800 w-full rounded-2xl overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ══ HEADER ══ */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">REPORTE DE ESPIROMETRÍA</h1>
            <p className="text-blue-300 text-xs mt-1 font-medium uppercase tracking-widest">Función Pulmonar — FVC</p>
          </div>
          <div className="text-right">
            <p className="text-white/50 text-[9px] uppercase tracking-widest">Fecha del estudio</p>
            <p className="text-xl font-black text-white">{data.testDetails.date || '—'}</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">

        {/* ══ PATIENT CARD ══ */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Paciente</p>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{data.patient.name}</h2>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="bg-white rounded-xl border border-slate-200 px-4 py-2 shadow-sm">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">ID</p>
                <p className="text-sm font-bold text-slate-800">{data.patient.id}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 px-4 py-2 shadow-sm">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Edad</p>
                <p className="text-sm font-bold text-slate-800">{data.patient.age}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 px-4 py-2 shadow-sm">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">FEV1 / Pred</p>
                <p className="text-sm font-black text-blue-700">{data.testDetails.fev1PredPercent}</p>
              </div>
            </div>
          </div>

          {/* Patient info grid */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {[
              { label: 'Sexo', value: data.patient.sex },
              { label: 'Altura', value: data.patient.height },
              { label: 'Peso', value: data.patient.weight },
              { label: 'IMC', value: data.patient.bmi },
              { label: 'Origen', value: data.patient.origin },
              { label: 'Fumador', value: data.patient.smoker, highlight: data.patient.smoker?.toLowerCase() !== 'no' },
              { label: 'Asma', value: data.patient.asthma },
              { label: 'EPOC', value: data.patient.copd },
              { label: 'F. Nac.', value: data.patient.dob },
            ].map((item, i) => (
              <div key={i} className={`rounded-lg px-3 py-2 ${item.highlight ? 'bg-amber-50 border border-amber-200' : 'bg-white border border-slate-100'}`}>
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                <p className={`text-xs font-bold ${item.highlight ? 'text-amber-700' : 'text-slate-700'}`}>{item.value || '—'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ══ TEST DETAILS ══ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Interpretación', value: data.testDetails.interpretation },
            { label: 'Selección', value: data.testDetails.selection },
            { label: 'Mejor valor', value: data.testDetails.bestValue },
            { label: 'Predicho', value: data.testDetails.predicted },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
              <p className="text-xs font-bold text-slate-700 leading-relaxed">{item.value || '—'}</p>
            </div>
          ))}
        </div>

        {/* ══ RESULTS TABLE ══ */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-3">
            <p className="text-xs font-black text-white uppercase tracking-widest">Resultados Espirométricos</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-2.5 px-3 text-[9px] font-black uppercase tracking-wider text-slate-500">Parámetro</th>
                <th className="text-right py-2.5 px-2 text-[9px] font-black uppercase tracking-wider text-slate-500">Pred</th>
                <th className="text-right py-2.5 px-2 text-[9px] font-black uppercase tracking-wider text-slate-500">LLN</th>
                <th className="text-right py-2.5 px-2 text-[9px] font-black uppercase tracking-wider text-blue-600">Mejor</th>
                <th className="text-right py-2.5 px-2 text-[9px] font-black uppercase tracking-wider text-slate-400 hidden sm:table-cell">P2</th>
                <th className="text-right py-2.5 px-2 text-[9px] font-black uppercase tracking-wider text-slate-400 hidden sm:table-cell">P6</th>
                <th className="text-right py-2.5 px-2 text-[9px] font-black uppercase tracking-wider text-slate-400 hidden sm:table-cell">P5</th>
                <th className="text-right py-2.5 px-2 text-[9px] font-black uppercase tracking-wider text-blue-600">%Pred</th>
                <th className="text-right py-2.5 px-3 text-[9px] font-black uppercase tracking-wider text-blue-600">Z</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((row, idx) => {
                const low = isPctLow(row.percentPred);
                const abnZ = isAbnormal(row.zScore);
                const rowBg = (low || abnZ) ? 'bg-red-50/60' : (idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50');
                return (
                  <tr key={idx} className={`border-b border-slate-100 ${rowBg} transition-colors`}>
                    <td className="py-2.5 px-3 font-bold text-slate-800 text-xs">{row.parameter}</td>
                    <td className="py-2.5 px-2 text-right text-slate-500 text-xs">{row.pred}</td>
                    <td className="py-2.5 px-2 text-right text-slate-500 text-xs">{row.lln}</td>
                    <td className="py-2.5 px-2 text-right font-black text-blue-700 text-xs">{row.mejor}</td>
                    <td className="py-2.5 px-2 text-right text-slate-400 text-xs hidden sm:table-cell">{row.prueba2}</td>
                    <td className="py-2.5 px-2 text-right text-slate-400 text-xs hidden sm:table-cell">{row.prueba6}</td>
                    <td className="py-2.5 px-2 text-right text-slate-400 text-xs hidden sm:table-cell">{row.prueba5}</td>
                    <td className={`py-2.5 px-2 text-right font-black text-xs ${low ? 'text-red-600' : 'text-emerald-600'}`}>
                      {row.percentPred}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-bold text-xs ${abnZ ? 'text-red-600' : 'text-slate-600'}`}>
                      {row.zScore}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ══ Z-SCORE BAR (built-in SVG) ══ */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Puntuación Z — Posición relativa al predicho</p>
          </div>
          <div className="p-4 flex justify-center">
            <ZScoreGraph results={data.results} />
          </div>
        </div>

        {/* ══ GRAPHS ══ */}
        {data.graphs && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Flow-Volume */}
            <div className="rounded-2xl border border-slate-200 p-5 shadow-sm bg-white">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center mb-4">Curva Flujo-Volumen</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.graphs.flowVolume} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="volume" type="number" domain={[0, 8]} tickCount={9}
                      label={{ value: 'Volumen [L]', position: 'bottom', offset: 0, fontSize: 10, fill: '#94a3b8' }}
                      tick={{ fontSize: 9, fill: '#94a3b8' }} />
                    <YAxis domain={[0, 14]} tickCount={8}
                      label={{ value: 'Flujo [L/s]', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }}
                      tick={{ fontSize: 9, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: 12, border: '1px solid #e2e8f0' }} />
                    <Legend wrapperStyle={{ fontSize: '9px' }} />
                    <Line type="monotone" dataKey="flowMejor" name="Mejor" stroke="#2563eb" strokeWidth={2.5} dot={false} isAnimationActive={false} connectNulls={true} />
                    <Line type="monotone" dataKey="flowPrueba2" name="Prueba 2" stroke="#94a3b8" strokeWidth={1.2} dot={false} isAnimationActive={false} connectNulls={true} />
                    <Line type="monotone" dataKey="flowPrueba5" name="Prueba 5" stroke="#94a3b8" strokeWidth={1.2} strokeDasharray="3 3" dot={false} isAnimationActive={false} connectNulls={true} />
                    <Line type="monotone" dataKey="flowPrueba6" name="Prueba 6" stroke="#94a3b8" strokeWidth={1.2} strokeDasharray="5 5" dot={false} isAnimationActive={false} connectNulls={true} />
                    <Line type="monotone" dataKey="flowPred" name="Predicho" stroke="#64748b" strokeWidth={1.5} strokeDasharray="2 2" dot={<CustomDot />} isAnimationActive={false} connectNulls={true} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Volume-Time */}
            <div className="rounded-2xl border border-slate-200 p-5 shadow-sm bg-white">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center mb-4">Curva Volumen-Tiempo</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.graphs.volumeTime} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" type="number" domain={[-1, 8]} tickCount={10}
                      label={{ value: 'Tiempo [s]', position: 'bottom', offset: 0, fontSize: 10, fill: '#94a3b8' }}
                      tick={{ fontSize: 9, fill: '#94a3b8' }} />
                    <YAxis domain={[0, 8]} tickCount={9}
                      label={{ value: 'Volumen [L]', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }}
                      tick={{ fontSize: 9, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: 12, border: '1px solid #e2e8f0' }} />
                    <Legend wrapperStyle={{ fontSize: '9px' }} />
                    <ReferenceLine x={0} stroke="#1e293b" strokeWidth={1} />
                    <Line type="monotone" dataKey="volumeMejor" name="Mejor" stroke="#2563eb" strokeWidth={2.5} dot={false} isAnimationActive={false} connectNulls={true} />
                    <Line type="monotone" dataKey="volumePrueba2" name="Prueba 2" stroke="#94a3b8" strokeWidth={1.2} dot={false} isAnimationActive={false} connectNulls={true} />
                    <Line type="monotone" dataKey="volumePrueba5" name="Prueba 5" stroke="#94a3b8" strokeWidth={1.2} strokeDasharray="3 3" dot={false} isAnimationActive={false} connectNulls={true} />
                    <Line type="monotone" dataKey="volumePrueba6" name="Prueba 6" stroke="#94a3b8" strokeWidth={1.2} strokeDasharray="5 5" dot={false} isAnimationActive={false} connectNulls={true} />
                    <Line type="monotone" dataKey="volumePred" name="Predicho" stroke="#64748b" strokeWidth={1.5} strokeDasharray="2 2" dot={<CustomDot />} isAnimationActive={false} connectNulls={true} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ══ SESSION + DOCTOR ══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Sesión</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Calidad</span>
                <span className="text-xs font-bold text-slate-800">{data.session.quality}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Interpretación</span>
                <span className="text-xs font-bold text-emerald-700">{data.session.interpretation}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Médico Responsable</p>
            <p className="text-sm font-black text-slate-800 uppercase">{data.doctor.name}</p>
            <p className="text-xs text-slate-500 mt-1">{data.doctor.date}</p>
            {data.doctor.notes && (
              <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-800 font-medium leading-relaxed">{data.doctor.notes}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Custom dot for predicted curves ──
const CustomDot = (props: any) => {
  const { cx, cy, payload, dataKey, index } = props;
  if (payload[dataKey] == null) return null;
  if (index % 3 !== 0) return null;
  return (
    <svg x={cx - 3} y={cy - 3} width={6} height={6} fill="none" viewBox="0 0 10 10">
      <path d="M5 0L10 5L5 10L0 5Z" fill="white" stroke="#64748b" strokeWidth="1.5" />
    </svg>
  );
};

// ── Z-Score horizontal chart (SVG) ──
const ZScoreGraph = ({ results }: { results: SpirometryData['results'] }) => {
  const params = ['FVC [L]', 'FEV1 [L]', 'FEF25-75 [L/s]', 'PEF [L/s]', 'FEV1/FVC'];
  const data = params.map(p => {
    const row = results.find(r => r.parameter === p);
    const name = p.split(' ')[0];
    const zScore = row && row.zScore ? parseFloat(row.zScore) : 0;
    return { name, zScore };
  });

  const width = 440;
  const height = 170;
  const margin = { top: 30, right: 20, bottom: 20, left: 70 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const minZ = -5;
  const maxZ = 3;
  const range = maxZ - minZ;
  const getX = (z: number) => margin.left + ((z - minZ) / range) * chartWidth;
  const llnZ = -1.64;

  return (
    <div className="w-full max-w-lg">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        {/* Background rows */}
        {data.map((item, i) => {
          const y = margin.top + i * (chartHeight / data.length);
          const h = chartHeight / data.length;
          const isMinor = item.name === 'FEF25-75' || item.name === 'PEF';
          const badColor = isMinor ? '#fef3c7' : '#fee2e2';
          const goodColor = '#dcfce7';
          return (
            <g key={`bg-${i}`}>
              <rect x={getX(-5)} y={y} width={getX(llnZ) - getX(-5)} height={h} fill={badColor} opacity={0.7} stroke="#fff" strokeWidth="1" rx="2" />
              <rect x={getX(llnZ)} y={y} width={getX(maxZ) - getX(llnZ)} height={h} fill={goodColor} opacity={0.5} stroke="#fff" strokeWidth="1" rx="2" />
            </g>
          );
        })}

        {/* Grid lines */}
        {[-5, -4, -3, -2, -1, 0, 1, 2, 3].map(tick => (
          <g key={tick}>
            <line x1={getX(tick)} y1={margin.top} x2={getX(tick)} y2={height - margin.bottom} stroke="#1e293b" strokeWidth={tick === 0 ? '1' : '0.3'} opacity={tick === 0 ? 0.5 : 0.3} />
            <text x={getX(tick)} y={height - margin.bottom + 14} fontSize="9" textAnchor="middle" fill="#94a3b8" fontWeight="600">{tick}</text>
          </g>
        ))}

        {/* LLN Line */}
        <line x1={getX(llnZ)} y1={margin.top - 10} x2={getX(llnZ)} y2={height - margin.bottom} stroke="#ef4444" strokeWidth="2" />
        <text x={getX(llnZ)} y={margin.top - 14} fontSize="8" textAnchor="middle" fill="#ef4444" fontWeight="800">LLN</text>

        {/* Predicho Line label */}
        <text x={getX(0)} y={margin.top - 14} fontSize="8" textAnchor="middle" fill="#64748b" fontWeight="800">predicho</text>

        {/* Data markers */}
        {data.map((item, i) => {
          const y = margin.top + (i + 0.5) * (chartHeight / data.length);
          const isLow = item.zScore < -1.64;
          return (
            <g key={item.name}>
              <text x={margin.left - 8} y={y + 4} fontSize="10" textAnchor="end" fill="#334155" fontWeight="700">{item.name}</text>
              <circle cx={getX(item.zScore)} cy={y} r="5" fill={isLow ? '#ef4444' : '#2563eb'} stroke="white" strokeWidth="2" />
              <text x={getX(item.zScore)} y={y - 10} fontSize="8" textAnchor="middle" fill={isLow ? '#ef4444' : '#2563eb'} fontWeight="700">
                {item.zScore.toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
