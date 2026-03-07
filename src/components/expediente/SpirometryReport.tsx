// @ts-nocheck
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
  ReferenceLine
} from 'recharts';

export interface SpirometryData {
  patient: {
    name: string;
    id: string;
    age: string;
    dob: string;
    sex: string;
    height: string;
    weight: string;
    origin: string;
    smoker: string;
    asthma: string;
    copd: string;
    bmi: string;
  };
  testDetails: {
    date: string;
    interpretation: string;
    predicted: string;
    selection: string;
    bestValue: string;
    fev1PredPercent: string;
  };
  results: {
    parameter: string;
    pred: string;
    lln: string;
    mejor: string;
    prueba2: string;
    prueba6: string;
    prueba5: string;
    percentPred: string;
    zScore: string;
  }[];
  session: {
    quality: string;
    interpretation: string;
  };
  doctor: {
    name: string;
    date: string;
    notes: string;
  };
  graphs: {
    flowVolume: {
      volume: number;
      flowPred: number;
      flowMejor: number;
      flowPrueba2: number;
      flowPrueba5: number;
      flowPrueba6: number;
    }[];
    volumeTime: {
      time: number;
      volumePred: number;
      volumeMejor: number;
      volumePrueba2: number;
      volumePrueba5: number;
      volumePrueba6: number;
    }[];
  };
}

interface Props {
  data: SpirometryData;
}

export function SpirometryReport({ data }: Props) {
  return (
    <div className="bg-white text-gray-800 font-sans p-8 max-w-4xl mx-auto shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">GP Medical Health</h1>
          <p className="text-sm">GP Medicina Laboral</p>
          <p className="text-sm">Dr. José Carlos Guido Pancardo</p>
          <p className="text-sm">Medicina del Trabajo y Salud Ocupacional</p>
        </div>
        <div className="text-right">
          {/* Logo Placeholder */}
          <div className="flex items-center text-teal-500 font-bold text-xl">
            <span className="mr-2">➕</span> GP Medical Health
          </div>
        </div>
      </div>

      {/* Patient Info */}
      <div className="border-t-2 border-blue-200 pt-2 pb-4 mb-4">
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-xl font-bold text-blue-900 uppercase tracking-wide">{data.patient.name}</h2>
          <div className="flex space-x-6 text-blue-900 font-semibold">
            <span>ID: {data.patient.id}</span>
            <span>Edad: {data.patient.age} ({data.patient.dob})</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Sexo</span> <span className="text-blue-600 font-medium">{data.patient.sex}</span>
          </div>
          <div>
            <span className="text-gray-600">Altura</span> <span className="text-blue-600 font-medium">{data.patient.height}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">Asma</span> <span className="text-blue-600 font-medium">{data.patient.asthma}</span>
          </div>

          <div>
            <span className="text-gray-600">Origen étnico</span> <span className="text-blue-600 font-medium">{data.patient.origin}</span>
          </div>
          <div>
            <span className="text-gray-600">Peso</span> <span className="text-blue-600 font-medium">{data.patient.weight}</span>
          </div>
          <div>
            <span className="text-gray-600">IMC</span> <span className="text-blue-600 font-medium">{data.patient.bmi}</span>
          </div>
          <div>
            <span className="text-gray-600">EPOC</span> <span className="text-blue-600 font-medium">{data.patient.copd}</span>
          </div>

          <div>
            <span className="text-gray-600">Fumador</span> <span className="text-blue-600 font-medium">{data.patient.smoker}</span>
          </div>
        </div>
      </div>

      {/* Test Details */}
      <div className="border-t-2 border-blue-200 pt-2 pb-4 mb-4">
        <div className="flex justify-between items-end mb-2">
          <h3 className="text-lg font-bold text-blue-900">FVC (sólo esp)</h3>
          <div className="text-blue-900 font-semibold text-lg">
            Su FEV1 / Predicho: {data.testDetails.fev1PredPercent}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600 block">Fecha del test</span>
            <span className="text-blue-600 font-medium">{data.testDetails.date}</span>
          </div>
          <div>
            <span className="text-gray-600 block">Interpretación</span>
            <span className="text-blue-600 font-medium">{data.testDetails.interpretation}</span>
          </div>
          <div>
            <span className="text-gray-600 block">Selección del valor</span>
            <span className="text-blue-600 font-medium">{data.testDetails.selection}</span>
          </div>
          <div>
            <span className="text-gray-600 block">Mejor valor</span>
            <span className="text-blue-600 font-medium">{data.testDetails.bestValue}</span>
          </div>
          <div className="col-span-4">
            <span className="text-gray-600 block">Tiempo posterior</span>
            <span className="text-blue-600 font-medium">{data.testDetails.predicted}</span>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="mb-6">
        <table className="w-full text-sm text-right">
          <thead>
            <tr className="bg-blue-50 text-blue-900 font-semibold border-b border-blue-200">
              <th className="text-left py-2 px-1">Parámetro</th>
              <th className="py-2 px-1">Pred</th>
              <th className="py-2 px-1">LLN</th>
              <th className="py-2 px-1 text-blue-700">Mejor</th>
              <th className="py-2 px-1">Prueba 2</th>
              <th className="py-2 px-1">Prueba 6</th>
              <th className="py-2 px-1">Prueba 5</th>
              <th className="py-2 px-1 text-blue-700">%Pred</th>
              <th className="py-2 px-1 text-blue-700">Puntuación Z</th>
            </tr>
          </thead>
          <tbody>
            {data.results.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="text-left py-1 px-1 font-medium">{row.parameter}</td>
                <td className="py-1 px-1">{row.pred}</td>
                <td className="py-1 px-1">{row.lln}</td>
                <td className="py-1 px-1 text-blue-600 font-semibold">{row.mejor}</td>
                <td className="py-1 px-1">{row.prueba2}</td>
                <td className="py-1 px-1">{row.prueba6}</td>
                <td className="py-1 px-1">{row.prueba5}</td>
                <td className="py-1 px-1 text-blue-600 font-semibold">{row.percentPred}</td>
                <td className="py-1 px-1 text-blue-600 font-semibold">{row.zScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-500 mt-2">* Indica valor situado fuera del rango normal o cambio posterior significativo.</p>
      </div>

      {/* Z-Score Graph */}
      <div className="mb-8 flex justify-center">
        <ZScoreGraph results={data.results} />
      </div>

      {/* Graphs */}
      {data.graphs && (
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Flow-Volume Graph */}
          <div className="border border-gray-200 p-4 rounded-lg bg-white">
            <h4 className="text-center text-sm font-semibold mb-4 text-gray-700">Flujo-Volumen</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.graphs.flowVolume} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="volume"
                    type="number"
                    domain={[0, 8]}
                    tickCount={9}
                    label={{ value: 'Volumen [L]', position: 'bottom', offset: 0, fontSize: 12 }}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    domain={[0, 14]}
                    tickCount={8}
                    label={{ value: 'Flujo [L/s]', angle: -90, position: 'insideLeft', fontSize: 12 }}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip contentStyle={{ fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="flowMejor" name="Mejor" stroke="#2563eb" strokeWidth={2} dot={false} isAnimationActive={false} connectNulls={true} />
                  <Line type="monotone" dataKey="flowPrueba2" name="Prueba 2" stroke="#9ca3af" strokeWidth={1.5} dot={false} isAnimationActive={false} connectNulls={true} />
                  <Line type="monotone" dataKey="flowPrueba5" name="Prueba 5" stroke="#9ca3af" strokeWidth={1.5} strokeDasharray="3 3" dot={false} isAnimationActive={false} connectNulls={true} />
                  <Line type="monotone" dataKey="flowPrueba6" name="Prueba 6" stroke="#9ca3af" strokeWidth={1.5} strokeDasharray="5 5" dot={false} isAnimationActive={false} connectNulls={true} />
                  <Line type="monotone" dataKey="flowPred" name="Predicho" stroke="#6b7280" strokeWidth={1.5} strokeDasharray="2 2" dot={<CustomDot />} isAnimationActive={false} connectNulls={true} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Volume-Time Graph */}
          <div className="border border-gray-200 p-4 rounded-lg bg-white">
            <h4 className="text-center text-sm font-semibold mb-4 text-gray-700">Volumen-Tiempo</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.graphs.volumeTime} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="time"
                    type="number"
                    domain={[-1, 8]}
                    tickCount={10}
                    label={{ value: 'Tiempo [s]', position: 'bottom', offset: 0, fontSize: 12 }}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    domain={[0, 8]}
                    tickCount={9}
                    label={{ value: 'Volumen [L]', angle: -90, position: 'insideLeft', fontSize: 12 }}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip contentStyle={{ fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <ReferenceLine x={0} stroke="#000" strokeWidth={1} />
                  <Line type="monotone" dataKey="volumeMejor" name="Mejor" stroke="#2563eb" strokeWidth={2} dot={false} isAnimationActive={false} connectNulls={true} />
                  <Line type="monotone" dataKey="volumePrueba2" name="Prueba 2" stroke="#9ca3af" strokeWidth={1.5} dot={false} isAnimationActive={false} connectNulls={true} />
                  <Line type="monotone" dataKey="volumePrueba5" name="Prueba 5" stroke="#9ca3af" strokeWidth={1.5} strokeDasharray="3 3" dot={false} isAnimationActive={false} connectNulls={true} />
                  <Line type="monotone" dataKey="volumePrueba6" name="Prueba 6" stroke="#9ca3af" strokeWidth={1.5} strokeDasharray="5 5" dot={false} isAnimationActive={false} connectNulls={true} />
                  <Line type="monotone" dataKey="volumePred" name="Predicho" stroke="#6b7280" strokeWidth={1.5} strokeDasharray="2 2" dot={<CustomDot />} isAnimationActive={false} connectNulls={true} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Session Info */}
      <div className="grid grid-cols-2 gap-4 text-sm mb-8">
        <div>
          <span className="text-gray-600">Calidad de la sesión</span>
          <span className="ml-4 text-gray-800">{data.session.quality}</span>
        </div>
        <div>
          <span className="text-gray-600">Interpretación del sistema</span>
          <span className="ml-4 text-gray-800">{data.session.interpretation}</span>
        </div>
      </div>

      {/* Footer / Doctor */}
      <div className="mt-12 pt-4 border-t border-gray-200 flex justify-between items-end">
        <div>
          <h4 className="text-blue-900 font-bold uppercase">{data.doctor.name} {data.doctor.date}</h4>
          <p className="text-blue-700 text-sm mt-1">{data.doctor.notes}</p>
        </div>
        <div className="text-center">
          {/* Signature Placeholder */}
          <div className="w-48 h-24 border-b border-gray-400 mb-2 relative">
            <span className="absolute bottom-2 left-0 right-0 text-gray-300 italic text-2xl" style={{ fontFamily: 'cursive' }}>Firma del Médico</span>
          </div>
          <p className="text-xs font-bold">{data.doctor.name}</p>
          <p className="text-xs">Medicina del Trabajo y Salud Ocupacional</p>
        </div>
      </div>
    </div>
  );
}

// Custom dot for predicted values (diamonds)
const CustomDot = (props: any) => {
  const { cx, cy, payload, dataKey, index } = props;

  // Only render dot if value exists and only every few points to avoid clutter
  if (payload[dataKey] == null) return null;
  if (index % 3 !== 0) return null;

  return (
    <svg x={cx - 3} y={cy - 3} width={6} height={6} fill="none" viewBox="0 0 10 10">
      <path d="M5 0L10 5L5 10L0 5Z" fill="white" stroke="#6b7280" strokeWidth="1.5" />
    </svg>
  );
};

const ZScoreGraph = ({ results }: { results: SpirometryData['results'] }) => {
  const params = ['FVC [L]', 'FEV1 [L]', 'FEF25-75 [L/s]', 'PEF [L/s]', 'FEV1/FVC'];
  const data = params.map(p => {
    const row = results.find(r => r.parameter === p);
    const name = p.split(' ')[0];
    const zScore = row && row.zScore ? parseFloat(row.zScore) : 0;
    const isAbnormal = row && row.mejor ? row.mejor.includes('*') : false;
    return { name, zScore, isAbnormal };
  });

  const width = 400;
  const height = 160;
  const margin = { top: 30, right: 20, bottom: 20, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const minZ = -5;
  const maxZ = 3;
  const range = maxZ - minZ;

  const getX = (z: number) => margin.left + ((z - minZ) / range) * chartWidth;
  const llnZ = -1.64;

  return (
    <div className="w-full max-w-md">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full font-sans">
        {/* Background rows */}
        {data.map((item, i) => {
          const y = margin.top + i * (chartHeight / data.length);
          const h = chartHeight / data.length;
          const isYellow = item.name === 'FEF25-75' || item.name === 'PEF';
          const badColor = isYellow ? '#fef08a' : '#fed7aa'; // yellow-200 or orange-200
          const goodColor = '#d9f99d'; // lime-200

          return (
            <g key={`bg-${i}`}>
              <rect x={getX(-5)} y={y} width={getX(llnZ) - getX(-5)} height={h} fill={badColor} opacity={0.6} stroke="#fff" strokeWidth="1" />
              <rect x={getX(llnZ)} y={y} width={getX(maxZ) - getX(llnZ)} height={h} fill={goodColor} opacity={0.6} stroke="#fff" strokeWidth="1" />
            </g>
          );
        })}

        {/* Grid lines */}
        {[-5, -4, -3, -2, -1, 0, 1, 2, 3].map(tick => (
          <g key={tick}>
            <line x1={getX(tick)} y1={margin.top} x2={getX(tick)} y2={height - margin.bottom} stroke="#000" strokeWidth={tick === 0 ? "1" : "0.5"} opacity={tick === 0 ? 1 : 0.3} />
            <text x={getX(tick)} y={height - margin.bottom + 12} fontSize="10" textAnchor="middle" fill="#4b5563">{tick}</text>
          </g>
        ))}

        {/* LLN Line */}
        <line x1={getX(llnZ)} y1={margin.top - 10} x2={getX(llnZ)} y2={height - margin.bottom} stroke="#000" strokeWidth="2" />
        <text x={getX(llnZ)} y={margin.top - 12} fontSize="10" textAnchor="middle" fill="#000">LLN</text>

        {/* Predicho Line */}
        <text x={getX(0)} y={margin.top - 12} fontSize="10" textAnchor="middle" fill="#000">predicho</text>

        {/* Data rows */}
        {data.map((item, i) => {
          const y = margin.top + (i + 0.5) * (chartHeight / data.length);
          return (
            <g key={item.name}>
              <text x={margin.left - 8} y={y + 3} fontSize="10" textAnchor="end" fill="#374151">{item.name}</text>
              {/* Marker */}
              <text x={getX(item.zScore)} y={y + 6} fontSize="16" textAnchor="middle" fill="#0369a1" fontWeight="bold">*</text>
            </g>
          );
        })}

        {/* X-axis label */}
        <text x={margin.left - 8} y={height - margin.bottom + 12} fontSize="10" textAnchor="end" fill="#4b5563">puntuación z</text>
      </svg>
    </div>
  );
};
