// =====================================================
// COMPONENTE: CheckInRecepcion
// Pantalla para recepcionista: Check-in y creación de episodios
// GPMedical ERP Pro - Motor de Flujos
// =====================================================

import React, { useState, useEffect } from 'react';
import { useEpisodios } from '@/hooks/useEpisodios';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { TipoEvaluacion } from '@/types/episodio';
import {
  Search,
  UserPlus,
  QrCode,
  Clock,
  Building2,
  Stethoscope,
  CheckCircle2,
  Printer,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  ScanLine,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';

// =====================================================
// INTERFACES
// =====================================================

interface PacienteResult {
  id: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  curp?: string;
  nss?: string;
  foto_url?: string;
  fecha_nacimiento?: string;
  empresa_id?: string;
  empresa_nombre?: string;
}

interface CheckInRecepcionProps {
  sedeId: string;
  onEpisodioCreado?: (episodioId: string) => void;
}

// =====================================================
// COMPONENTE
// =====================================================

export function CheckInRecepcion({ sedeId, onEpisodioCreado }: CheckInRecepcionProps) {
  const { user } = useAuth();
  const { crearEpisodio, isCreating } = useEpisodios({ sedeId });

  // Estados
  const [busqueda, setBusqueda] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [resultados, setResultados] = useState<PacienteResult[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<PacienteResult | null>(null);
  const [tipoEvaluacion, setTipoEvaluacion] = useState<TipoEvaluacion>('preempleo');
  const [empresaId, setEmpresaId] = useState<string>('');
  const [empresas, setEmpresas] = useState<{ id: string; nombre: string }[]>([]);
  const [showNuevoPaciente, setShowNuevoPaciente] = useState(false);
  const [episodioCreado, setEpisodioCreado] = useState<string | null>(null);
  const [escanerActivo, setEscanerActivo] = useState(false);

  // Cargar empresas
  useEffect(() => {
    const loadEmpresas = async () => {
      const { data } = await supabase
        .from('empresas')
        .select('id, nombre')
        .eq('activo', true)
        .order('nombre');
      
      if (data) {
        setEmpresas(data);
        if (data.length === 1) {
          setEmpresaId(data[0].id);
        }
      }
    };
    loadEmpresas();
  }, []);

  // Buscar pacientes
  const buscarPacientes = async (termino: string) => {
    if (!termino || termino.length < 3) {
      setResultados([]);
      return;
    }

    setBuscando(true);
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select(`
          id, nombre, apellido_paterno, apellido_materno,
          curp, nss, foto_url, fecha_nacimiento,
          empresa:empresa_id(id, nombre)
        `)
        .or(`nombre.ilike.%${termino}%,apellido_paterno.ilike.%${termino}%,curp.ilike.%${termino}%,nss.ilike.%${termino}%`)
        .limit(10);

      if (error) throw error;

      const pacientesFormateados = (data || []).map((p: any) => ({
        ...p,
        empresa_id: p.empresa?.id,
        empresa_nombre: p.empresa?.nombre,
      }));

      setResultados(pacientesFormateados);
    } catch (error) {
      console.error('Error buscando pacientes:', error);
      toast.error('Error al buscar pacientes');
    } finally {
      setBuscando(false);
    }
  };

  // Debounce para búsqueda
  useEffect(() => {
    const timeout = setTimeout(() => {
      buscarPacientes(busqueda);
    }, 300);

    return () => clearTimeout(timeout);
  }, [busqueda]);

  // Crear episodio
  const handleCrearEpisodio = async () => {
    if (!pacienteSeleccionado || !user?.id) return;

    try {
      const episodio = await crearEpisodio({
        paciente_id: pacienteSeleccionado.id,
        tipo: tipoEvaluacion,
        empresa_id: empresaId || pacienteSeleccionado.empresa_id || '',
        sede_id: sedeId,
      });

      if (episodio) {
        setEpisodioCreado(episodio.id);
        toast.success('Episodio creado exitosamente');
        onEpisodioCreado?.(episodio.id);
      }
    } catch (error) {
      toast.error('Error al crear episodio');
    }
  };

  // Simular escaneo QR
  const handleEscanearQR = () => {
    setEscanerActivo(true);
    // Simular escaneo exitoso después de 2 segundos
    setTimeout(() => {
      setEscanerActivo(false);
      // Aquí se procesaría el resultado real del escaneo
      toast.success('QR escaneado correctamente');
    }, 2000);
  };

  // Reset
  const handleNuevoCheckIn = () => {
    setPacienteSeleccionado(null);
    setEpisodioCreado(null);
    setBusqueda('');
    setResultados([]);
    setTipoEvaluacion('preempleo');
  };

  // Vista: Éxito (ticket generado)
  if (episodioCreado) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="py-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">¡Check-in Exitoso!</h2>
          <p className="text-green-700 mb-4">
            El paciente ha sido registrado correctamente
          </p>

          {/* Ticket */}
          <div className="bg-white rounded-lg p-6 shadow-sm max-w-sm mx-auto mb-6 border-2 border-dashed border-green-300">
            <div className="text-center border-b pb-4 mb-4">
              <h3 className="font-bold text-lg">GPMedical</h3>
              <p className="text-sm text-muted-foreground">Ticket de Atención</p>
            </div>
            <div className="space-y-2 text-left text-sm">
              <p><strong>Paciente:</strong> {pacienteSeleccionado?.nombre} {pacienteSeleccionado?.apellido_paterno}</p>
              <p><strong>Tipo:</strong> <span className="capitalize">{tipoEvaluacion}</span></p>
              <p><strong>Folio:</strong> {episodioCreado.slice(0, 8).toUpperCase()}</p>
              <p><strong>Hora:</strong> {new Date().toLocaleTimeString('es-MX')}</p>
            </div>
            <div className="mt-4 pt-4 border-t text-center">
              <div className="w-32 h-32 bg-gray-100 mx-auto flex items-center justify-center rounded">
                <QrCode className="w-20 h-20 text-gray-400" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Escanea para seguimiento</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button onClick={handleNuevoCheckIn}>
              <UserPlus className="w-4 h-4 mr-2" />
              Nuevo Check-in
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ScanLine className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Check-in de Paciente</CardTitle>
              <CardDescription>
                Busque un paciente existente o registre uno nuevo
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Columna izquierda: Búsqueda */}
        <div className="space-y-4">
          {/* Búsqueda */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Buscar Paciente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Input búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nombre, CURP o NSS..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 h-12"
                />
                {buscando && (
                  <RefreshCw className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>

              {/* Botón escanear */}
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={handleEscanearQR}
                disabled={escanerActivo}
              >
                {escanerActivo ? (
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <QrCode className="w-5 h-5 mr-2" />
                )}
                {escanerActivo ? 'Escaneando...' : 'Escanear QR de Cita'}
              </Button>

              {/* Resultados */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {busqueda.length > 0 && busqueda.length < 3 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Escribe al menos 3 caracteres para buscar
                  </p>
                )}

                {resultados.length === 0 && busqueda.length >= 3 && !buscando && (
                  <div className="text-center py-6 border-2 border-dashed rounded-lg">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">
                      No se encontraron pacientes
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setShowNuevoPaciente(true)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Crear nuevo paciente
                    </Button>
                  </div>
                )}

                {resultados.map((paciente) => (
                  <div
                    key={paciente.id}
                    onClick={() => setPacienteSeleccionado(paciente)}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
                      ${pacienteSeleccionado?.id === paciente.id
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-muted border border-transparent'
                      }
                    `}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={paciente.foto_url} />
                      <AvatarFallback>
                        {paciente.nombre[0]}{paciente.apellido_paterno[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {paciente.nombre} {paciente.apellido_paterno}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {paciente.curp || paciente.nss || 'Sin identificación'}
                      </p>
                      {paciente.empresa_nombre && (
                        <p className="text-xs text-muted-foreground">
                          {paciente.empresa_nombre}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: Configuración */}
        <div className="space-y-4">
          {pacienteSeleccionado ? (
            <>
              {/* Info del paciente seleccionado */}
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Paciente Seleccionado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={pacienteSeleccionado.foto_url} />
                      <AvatarFallback className="text-lg">
                        {pacienteSeleccionado.nombre[0]}{pacienteSeleccionado.apellido_paterno[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido_paterno}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {pacienteSeleccionado.empresa_nombre || 'Sin empresa asignada'}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {pacienteSeleccionado.curp || pacienteSeleccionado.nss}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Configuración del episodio */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Configurar Evaluación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Tipo de evaluación */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Evaluación</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['preempleo', 'periodico', 'retorno', 'egreso', 'consulta'] as TipoEvaluacion[]).map((tipo) => (
                        <button
                          key={tipo}
                          onClick={() => setTipoEvaluacion(tipo)}
                          className={`
                            p-3 rounded-lg border text-left transition-colors
                            ${tipoEvaluacion === tipo
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:bg-muted'
                            }
                          `}
                        >
                          <Stethoscope className={`w-4 h-4 mb-1 ${tipoEvaluacion === tipo ? 'text-primary' : ''}`} />
                          <span className="text-sm font-medium capitalize">{tipo}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Empresa */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Empresa
                    </label>
                    <Select
                      value={empresaId}
                      onValueChange={setEmpresaId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {pacienteSeleccionado.empresa_id && (
                          <SelectItem value={pacienteSeleccionado.empresa_id}>
                            {pacienteSeleccionado.empresa_nombre} (Actual)
                          </SelectItem>
                        )}
                        {empresas
                          .filter(e => e.id !== pacienteSeleccionado.empresa_id)
                          .map(empresa => (
                            <SelectItem key={empresa.id} value={empresa.id}>
                              {empresa.nombre}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Resumen */}
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Clock className="w-4 h-4" />
                      Tiempo estimado: <strong>60-90 minutos</strong>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      El paciente será asignado a la cola de triage después del check-in.
                    </p>
                  </div>

                  {/* Botón crear */}
                  <Button
                    className="w-full h-12"
                    onClick={handleCrearEpisodio}
                    disabled={isCreating || !empresaId}
                  >
                    {isCreating ? (
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                    )}
                    {isCreating ? 'Creando...' : 'Confirmar Check-in'}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setPacienteSeleccionado(null)}
                  >
                    Cancelar
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-dashed h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Selecciona un paciente para continuar
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
