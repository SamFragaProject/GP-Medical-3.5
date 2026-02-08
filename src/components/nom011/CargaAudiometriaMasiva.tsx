import React, { useState, useCallback } from 'react';
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Download,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'react-hot-toast';

interface RegistroAudiometria {
  fila: number;
  paciente_id?: string;
  paciente_nombre?: string;
  tipo: string;
  od_500hz?: number;
  od_1000hz?: number;
  od_2000hz?: number;
  od_3000hz?: number;
  od_4000hz?: number;
  od_6000hz?: number;
  od_8000hz?: number;
  oi_500hz?: number;
  oi_1000hz?: number;
  oi_2000hz?: number;
  oi_3000hz?: number;
  oi_4000hz?: number;
  oi_6000hz?: number;
  oi_8000hz?: number;
  fecha_estudio: string;
  valido: boolean;
  errores: string[];
}

interface CargaAudiometriaMasivaProps {
  empresaId: string;
  onComplete: () => void;
  onCancel: () => void;
}

// Plantilla CSV de ejemplo
const plantillaCSV = `paciente_id,tipo,od_500hz,od_1000hz,od_2000hz,od_3000hz,od_4000hz,od_6000hz,od_8000hz,oi_500hz,oi_1000hz,oi_2000hz,oi_3000hz,oi_4000hz,oi_6000hz,oi_8000hz,fecha_estudio
P001,anual,10,15,20,25,30,35,40,10,15,20,25,30,35,40,2026-02-08
P002,anual,5,10,15,20,25,30,35,5,10,15,20,25,30,35,2026-02-08`;

export function CargaAudiometriaMasiva({ empresaId, onComplete, onCancel }: CargaAudiometriaMasivaProps) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [registros, setRegistros] = useState<RegistroAudiometria[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    const validTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Formato de archivo no válido. Use CSV o Excel.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo excede los 10MB permitidos.');
      return;
    }

    setArchivo(file);
    procesarArchivo(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => {
    setDragOver(false);
  };

  const procesarArchivo = async (file: File) => {
    setLoading(true);
    try {
      // Simulación de procesamiento
      // En producción, aquí se parsearía el CSV/Excel
      const registrosSimulados: RegistroAudiometria[] = [
        {
          fila: 2,
          paciente_id: 'P001',
          paciente_nombre: 'Juan Martínez',
          tipo: 'anual',
          od_500hz: 10,
          od_1000hz: 15,
          od_2000hz: 20,
          od_3000hz: 25,
          od_4000hz: 30,
          od_6000hz: 35,
          od_8000hz: 40,
          oi_500hz: 10,
          oi_1000hz: 15,
          oi_2000hz: 20,
          oi_3000hz: 25,
          oi_4000hz: 30,
          oi_6000hz: 35,
          oi_8000hz: 40,
          fecha_estudio: '2026-02-08',
          valido: true,
          errores: [],
        },
        {
          fila: 3,
          paciente_id: 'P002',
          paciente_nombre: 'María García',
          tipo: 'anual',
          od_500hz: 5,
          od_1000hz: 10,
          od_2000hz: 15,
          od_3000hz: 20,
          od_4000hz: 25,
          od_6000hz: 30,
          od_8000hz: 35,
          oi_500hz: 5,
          oi_1000hz: 10,
          oi_2000hz: 15,
          oi_3000hz: 20,
          oi_4000hz: 25,
          oi_6000hz: 30,
          oi_8000hz: 35,
          fecha_estudio: '2026-02-08',
          valido: true,
          errores: [],
        },
        {
          fila: 4,
          paciente_id: '',
          paciente_nombre: '',
          tipo: 'anual',
          fecha_estudio: '2026-02-08',
          valido: false,
          errores: ['ID de paciente requerido', 'Valores de audiometría faltantes'],
        },
      ];

      setTimeout(() => {
        setRegistros(registrosSimulados);
        setPreviewMode(true);
        setLoading(false);
      }, 1500);
    } catch (error) {
      toast.error('Error al procesar el archivo');
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    const registrosValidos = registros.filter(r => r.valido);
    if (registrosValidos.length === 0) {
      toast.error('No hay registros válidos para guardar');
      return;
    }

    setLoading(true);
    try {
      // Simulación de guardado progresivo
      for (let i = 0; i <= 100; i += 10) {
        setProgreso(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      toast.success(`${registrosValidos.length} audiometrías guardadas correctamente`);
      onComplete();
    } catch (error) {
      toast.error('Error al guardar las audiometrías');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarPlantilla = () => {
    const blob = new Blob([plantillaCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_audiometria.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Plantilla descargada');
  };

  const registrosValidos = registros.filter(r => r.valido);
  const registrosInvalidos = registros.filter(r => !r.valido);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Upload className="w-6 h-6 text-emerald-600" />
            Carga Masiva de Audiometrías
          </h2>
          <p className="text-sm text-slate-500">
            Importe múltiples audiometrías desde un archivo CSV o Excel
          </p>
        </div>
        <Button variant="outline" onClick={handleDescargarPlantilla} className="rounded-full">
          <Download className="w-4 h-4 mr-2" />
          Descargar Plantilla
        </Button>
      </div>

      {!previewMode ? (
        /* Área de Drop */
        <Card className="border shadow-md">
          <CardContent className="p-8">
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => document.getElementById('file-input')?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${dragOver
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
                }`}
            >
              <input
                id="file-input"
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
              </div>
              {dragOver ? (
                <p className="text-emerald-600 font-medium">Suelte el archivo aquí...</p>
              ) : (
                <>
                  <p className="text-slate-700 font-medium mb-2">
                    Arrastre un archivo o haga clic para seleccionar
                  </p>
                  <p className="text-sm text-slate-500">
                    Formatos soportados: CSV, Excel (.xlsx, .xls)
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Tamaño máximo: 10MB
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Preview de datos */
        <>
          {/* Resumen */}
          <Card className="border shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{archivo?.name}</p>
                    <p className="text-sm text-slate-500">
                      {registros.length} registros encontrados
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="success" className="bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {registrosValidos.length} válidos
                  </Badge>
                  {registrosInvalidos.length > 0 && (
                    <Badge variant="destructive">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {registrosInvalidos.length} con errores
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de preview */}
          <Card className="border shadow-md">
            <CardHeader className="bg-slate-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-600" />
                Vista Previa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="w-16">Fila</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>OD (dB)</TableHead>
                      <TableHead>OI (dB)</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registros.map((registro) => (
                      <TableRow
                        key={registro.fila}
                        className={!registro.valido ? 'bg-rose-50/50' : ''}
                      >
                        <TableCell className="font-mono text-xs">{registro.fila}</TableCell>
                        <TableCell>
                          {registro.paciente_id ? (
                            <div>
                              <p className="font-medium text-sm">{registro.paciente_nombre}</p>
                              <p className="text-xs text-slate-500">ID: {registro.paciente_id}</p>
                            </div>
                          ) : (
                            <span className="text-rose-500 text-sm">No identificado</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {registro.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {registro.od_500hz !== undefined ? (
                            <span className="text-slate-600">
                              {registro.od_500hz}-{registro.od_1000hz}-{registro.od_2000hz}...
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {registro.oi_500hz !== undefined ? (
                            <span className="text-slate-600">
                              {registro.oi_500hz}-{registro.oi_1000hz}-{registro.oi_2000hz}...
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{registro.fecha_estudio}</TableCell>
                        <TableCell>
                          {registro.valido ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <div className="group relative">
                              <AlertTriangle className="w-5 h-5 text-rose-500" />
                              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50">
                                <div className="bg-slate-800 text-white text-xs rounded-lg p-2 whitespace-nowrap">
                                  {registro.errores.join(', ')}
                                </div>
                              </div>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Progreso de guardado */}
          {loading && progreso > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Guardando registros...</span>
                <span className="font-medium">{progreso}%</span>
              </div>
              <Progress value={progreso} className="h-2" />
            </div>
          )}
        </>
      )}

      {/* Botones */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-full">
          Cancelar
        </Button>
        {previewMode && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewMode(false)}
              className="rounded-full"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar Carga
            </Button>
            <Button
              type="button"
              onClick={handleGuardar}
              disabled={loading || registrosValidos.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : `Guardar ${registrosValidos.length} registros`}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
