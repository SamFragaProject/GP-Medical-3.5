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
    <div className="bg-[#0b1120]/80 backdrop-blur-2xl text-white/90 w-full rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ══ HEADER ══ */}
      <div className="bg-gradient-to-r from-violet-900/50 via-purple-900/30 to-slate-900/50 px-8 py-6 border-b border-white/10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight drop-shadow-md">REPORTE DE ESPIROMETRÍA</h1>
            <p className="text-purple-300 text-xs mt-1 font-black uppercase tracking-widest drop-shadow-sm">Función Pulmonar — FVC</p>
          </div>
          <div className="text-right">
            <p className="text-white/50 text-[9px] uppercase tracking-widest font-black">Fecha del estudio</p>
            <p className="text-xl font-black text-white drop-shadow-md">{data.testDetails.date || '—'}</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">

        {/* ══ PATIENT CARD ══ */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5 relative z-10">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">Paciente</p>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight drop-shadow-md">{data.patient.name}</h2>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="bg-white/5 rounded-xl border border-white/10 px-4 py-2 shadow-sm backdrop-blur-sm">
                <p className="text-[8px] font-black uppercase tracking-widest text-white/40">ID</p>
                <p className="text-sm font-bold text-white/90">{data.patient.id}</p>
              </div>
              <div className="bg-white/5 rounded-xl border border-white/10 px-4 py-2 shadow-sm backdrop-blur-sm">
                <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Edad</p>
                <p className="text-sm font-bold text-white/90">{data.patient.age}</p>
              </div>
              <div className="bg-purple-500/10 rounded-xl border border-purple-500/20 px-4 py-2 shadow-sm backdrop-blur-sm">
                <p className="text-[8px] font-black uppercase tracking-widest text-purple-400">FEV1 / Pred</p>
                <p className="text-sm font-black text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">{data.testDetails.fev1PredPercent}</p>
              </div>
            </div>
          </div>

          {/* Patient info grid */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 relative z-10">
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
              <div key={i} className={`rounded-lg px-3 py-2 border backdrop-blur-sm ${item.highlight ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/10'}`}>
                <p className="text-[8px] font-black uppercase tracking-widest text-white/40">{item.label}</p>
                <p className={`text-xs font-bold ${item.highlight ? 'text-amber-400' : 'text-white/80'}`}>{item.value || '—'}</p>
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
            <div key={i} className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 px-4 py-3 shadow-sm">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">{item.label}</p>
              <p className="text-xs font-bold text-white/90 leading-relaxed">{item.value || '—'}</p>
            </div>
          ))}
        </div>

        {/* ══ RESULTS TABLE ══ */}
        <div className="rounded-2xl border border-white/10 overflow-hidden shadow-lg bg-black/20 backdrop-blur-md">
          <div className="bg-gradient-to-r from-purple-600/40 to-cyan-700/40 px-5 py-3 border-b border-white/10 backdrop-blur-md">
            <p className="text-xs font-black text-white uppercase tracking-widest drop-shadow-sm">Resultados Espirométricos</p>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="text-left py-2.5 px-3 text-[9px] font-black uppercase tracking-wider text-white/50">Parámetro</th>
                <th className="text-right py-2.5 px-2 text-[9px] font-black uppercase tracking-wider text-white/50">Pred</th>
                <th className="text-right py-2.5 px-2 text-[9px] font-black uppercase tracking-wider text-white/50">LLN</th>
                <th className="text-right py-2.5 px-2 text-[9px] font-black uppercase tracking-wider text-cyan-400">Mejor</th>
                <th className="text-right py-2.5 px-2 text-[9px] font-black uppercase tracking-wider text-white/40 hidden sm:table-cell">P2</th>
                <th className="text-right py-2.5 px-2 text-[9px] font-black uppercase tracking-wider text-white/40 hidden sm:table-cell">P6</th>
                <th className="text-right py-2.5 px-2 text-[9px] font-black uppercase tracking-wider text-white/40 hidden sm:table-cell">P5</th>
                <th className="text-right py-2.5 px-2 text-[9px] font-black uppercase tracking-wider text-purple-400">%Pred</th>
                <th className="text-right py-2.5 px-3 text-[9px] font-black uppercase tracking-wider text-white/50">Z</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((row, idx) => {
                const low = isPctLow(row.percentPred);
                const abnZ = isAbnormal(row.zScore);
                const rowBg = (low || abnZ) ? 'bg-rose-500/10 hover:bg-rose-500/20' : (idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]');
                return (
                  <tr key={idx} className={`border-b border-white/5 ${rowBg} transition-colors hover:bg-white/5`}>
                    <td className="py-2.5 px-3 font-bold text-white/90 text-[11px]">{row.parameter}</td>
                    <td className="py-2.5 px-2 text-right text-white/50 text-[11px] font-medium">{row.pred}</td>
                    <td className="py-2.5 px-2 text-right text-white/50 text-[11px] font-medium">{row.lln}</td>
                    <td className="py-2.5 px-2 text-right font-black text-cyan-300 text-[11px] drop-shadow-sm">{row.mejor}</td>
                    <td className="py-2.5 px-2 text-right text-white/40 text-[11px] font-medium hidden sm:table-cell">{row.prueba2}</td>
                    <td className="py-2.5 px-2 text-right text-white/40 text-[11px] font-medium hidden sm:table-cell">{row.prueba6}</td>
                    <td className="py-2.5 px-2 text-right text-white/40 text-[11px] font-medium hidden sm:table-cell">{row.prueba5}</td>
                    <td className={`py-2.5 px-2 text-right font-black text-[11px] ${low ? 'text-rose-400' : 'text-purple-300 drop-shadow-sm'}`}>
                      {row.percentPred}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-bold text-[11px] ${abnZ ? 'text-rose-400' : 'text-white/60'}`}>
                      {row.zScore}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>

        {/* ══ Z-SCORE BAR (built-in SVG) ══ */}
        <div className="rounded-2xl border border-white/10 overflow-hidden shadow-lg bg-black/20 backdrop-blur-md">
          <div className="bg-white/5 px-5 py-3 border-b border-white/10">
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Puntuación Z — Posición relativa al predicho</p>
          </div>
          <div className="p-4 flex justify-center overflow-x-auto">
            <ZScoreGraph results={data.results} />
          </div>
        </div>

        {/* ══ GRAPHS ══ */}
        {data.graphs && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Flow-Volume */}
            <div className="rounded-2xl border border-white/10 p-5 shadow-lg bg-white/5 backdrop-blur-md">
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest text-center mb-4">Curva Flujo-Volumen</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.graphs.flowVolume} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="volume" type="number" domain={[0, 8]} tickCount={9}
                      label={{ value: 'Volumen [L]', position: 'bottom', offset: 0, fontSize: 10, fill: '#94a3b8' }}
                      tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
                    <YAxis domain={[0, 14]} tickCount={8}
                      label={{ value: 'Flujo [L/s]', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }}
                      tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15,23,42,0.9)', color: '#fff' }} />
                    <Legend wrapperStyle={{ fontSize: '10px', color: '#e2e8f0' }} />
                    <Line type="monotone" dataKey="flowMejor" name="Mejor" stroke="#00f2fe" strokeWidth={2.5} dot={false} isAnimationActive={false} connectNulls={true} />
                    <Line type="monotone" dataKey="flowPrueba2" name="Prueba 2" stroke="#64748b" strokeWidth={1.2} dot={false} isAnimationActive={false} connectNulls={true} />
                    <Line type="monotone" dataKey="flowPrueba5" name="Prueba 5" stroke="#64748b" strokeWidth={1.2} strokeDasharray="3 3" dot={false} isAnimationActive={false} connectNulls={true} />
                    <Line type="monotone" dataKey="flowPrueba6" name="Prueba 6" stroke="#64748b" strokeWidth={1.2} strokeDasharray="5 5" dot={false} isAnimationActive={false} connectNulls={true} />
                    <Line type="monotone" dataKey="flowPred" name="Predicho" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="2 2" dot={<CustomDot color="#a855f7" />} isAnimationActive={false} connectNulls={true} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Volume-Time */}
            <div className="rounded-2xl border border-white/10 p-5 shadow-lg bg-white/5 backdrop-blur-md">
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest text-center mb-4">Curva Volumen-Tiempo</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.graphs.volumeTime} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" type="number" domain={[-1, 8]} tickCount={10}
                      label={{ value: 'Tiempo [s]', position: 'bottom', offset: 0, fontSize: 10, fill: '#94a3b8' }}
                      tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
                    <YAxis domain={[0, 8]} tickCount={9}
                      label={{ value: 'Volumen [L]', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }}
                      tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15,23,42,0.9)', color: '#fff' }} />
                    <Legend wrapperStyle={{ fontSize: '10px', color: '#e2e8f0' }} />
                    <ReferenceLine x={0} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
                    <Line type="monotone" dataKey="volumeMejor" name="Mejor" stroke="#00f2fe" strokeWidth={2.5} dot={false} isAnimationActive={false} connectNulls={true} />
                    <Line type="monotone" dataKey="volumePrueba2" name="Prueba 2" stroke="#64748b" strokeWidth={1.2} dot={false} isAnimationActive={false} connectNulls={true} />
                    <Line type="monotone" dataKey="volumePrueba5" name="Prueba 5" stroke="#64748b" strokeWidth={1.2} strokeDasharray="3 3" dot={false} isAnimationActive={false} connectNulls={true} />
                    <Line type="monotone" dataKey="volumePrueba6" name="Prueba 6" stroke="#64748b" strokeWidth={1.2} strokeDasharray="5 5" dot={false} isAnimationActive={false} connectNulls={true} />
                    <Line type="monotone" dataKey="volumePred" name="Predicho" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="2 2" dot={<CustomDot color="#a855f7" />} isAnimationActive={false} connectNulls={true} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ══ SESSION + DOCTOR ══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 p-5 bg-white/5 backdrop-blur-md shadow-lg">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-3">Sesión</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Calidad</span>
                <span className="text-xs font-bold text-white/90">{data.session.quality}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Interpretación</span>
                <span className="text-xs font-bold text-cyan-400 drop-shadow-sm">{data.session.interpretation}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 p-5 bg-white/5 backdrop-blur-md shadow-lg">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-3">Médico Responsable</p>
            <p className="text-sm font-black text-white/90 uppercase">{data.doctor.name}</p>
            <p className="text-xs text-white/50 mt-1 font-medium">{data.doctor.date}</p>
            {data.doctor.notes && (
              <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-xs text-white/80 font-medium leading-relaxed">{data.doctor.notes}</p>
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
  const { cx, cy, payload, dataKey, index, color } = props;
  if (payload[dataKey] == null) return null;
  if (index % 3 !== 0) return null;
  return (
    <svg x={cx - 3} y={cy - 3} width={6} height={6} fill="none" viewBox="0 0 10 10">
      <path d="M5 0L10 5L5 10L0 5Z" fill="#0f172a" stroke={color || '#64748b'} strokeWidth="1.5" />
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
          const badColor = isMinor ? 'rgba(245, 158, 11, 0.15)' : 'rgba(244, 63, 94, 0.15)';
          const goodColor = 'rgba(16, 185, 129, 0.15)';
          return (
            <g key={`bg-${i}`}>
              <rect x={getX(-5)} y={y} width={getX(llnZ) - getX(-5)} height={h} fill={badColor} stroke="rgba(255,255,255,0.05)" strokeWidth="1" rx="2" />
              <rect x={getX(llnZ)} y={y} width={getX(maxZ) - getX(llnZ)} height={h} fill={goodColor} stroke="rgba(255,255,255,0.05)" strokeWidth="1" rx="2" />
            </g>
          );
        })}

        {/* Grid lines */}
        {[-5, -4, -3, -2, -1, 0, 1, 2, 3].map(tick => (
          <g key={tick}>
            <line x1={getX(tick)} y1={margin.top} x2={getX(tick)} y2={height - margin.bottom} stroke="rgba(255,255,255,0.2)" strokeWidth={tick === 0 ? '1' : '0.3'} opacity={tick === 0 ? 0.8 : 0.5} />
            <text x={getX(tick)} y={height - margin.bottom + 14} fontSize="9" textAnchor="middle" fill="#94a3b8" fontWeight="600">{tick}</text>
          </g>
        ))}

        {/* LLN Line */}
        <line x1={getX(llnZ)} y1={margin.top - 10} x2={getX(llnZ)} y2={height - margin.bottom} stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="2 2" />
        <text x={getX(llnZ)} y={margin.top - 14} fontSize="8" textAnchor="middle" fill="#f43f5e" fontWeight="800">LLN</text>

        {/* Predicho Line label */}
        <text x={getX(0)} y={margin.top - 14} fontSize="8" textAnchor="middle" fill="#94a3b8" fontWeight="800">predicho</text>

        {/* Data markers */}
        {data.map((item, i) => {
          const y = margin.top + (i + 0.5) * (chartHeight / data.length);
          const isLow = item.zScore < -1.64;
          return (
            <g key={item.name}>
              <text x={margin.left - 8} y={y + 3} fontSize="10" textAnchor="end" fill="#cbd5e1" fontWeight="700">{item.name}</text>
              <circle cx={getX(item.zScore)} cy={y} r="5" fill={isLow ? '#f43f5e' : '#00f2fe'} stroke="rgba(15,23,42,0.9)" strokeWidth="1.5" />
              <text x={getX(item.zScore)} y={y - 10} fontSize="8" textAnchor="middle" fill={isLow ? '#fda4af' : '#67e8f9'} fontWeight="700">
                {item.zScore.toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
