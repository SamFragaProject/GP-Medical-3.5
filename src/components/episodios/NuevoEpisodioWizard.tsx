// =====================================================
// COMPONENTE: NuevoEpisodioWizard
// Wizard de 3 pasos para crear un nuevo episodio
// GPMedical ERP Pro - Motor de Flujos
// =====================================================

import React, { useState, useEffect } from 'react';
import { useEpisodios } from '@/hooks/useEpisodios';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { TipoEvaluacion } from '@/types/episodio';
import {
  UserPlus,
  Search,
  Building2,
  Stethoscope,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  User,
  Briefcase,
  Calendar,
  AlertTriangle,
  Save,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
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
  fecha_nacimiento?: string;
  sexo?: string;
  foto_url?: string;
  empresa_id?: string;
}

interface Empresa {
  id: string;
  nombre: string;
  rfc?: string;
}

interface Campana {
  id: string;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
}

interface NuevoEpisodioWizardProps {
  sedeId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (episodioId: string) => void;
}

// =====================================================
// COMPONENTE
// =====================================================

export function NuevoEpisodioWizard({ sedeId, isOpen, onClose, onSuccess }: NuevoEpisodioWizardProps) {
  const { user } = useAuth();
  const { crearEpisodio, isCreating } = useEpisodios({ sedeId });

  // Estados del wizard
  const [paso, setPaso] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [resultados, setResultados] = useState<PacienteResult[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<PacienteResult | null>(null);
  
  // Datos del nuevo paciente (si no existe)
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    curp: '',
    nss: '',
    fecha_nacimiento: '',
    sexo: 'M',
  });
  const [creandoPaciente, setCreandoPaciente] = useState(false);

  // Configuración del episodio
  const [tipoEvaluacion, setTipoEvaluacion] = useState<TipoEvaluacion>('preempleo');
  const [empresaId, setEmpresaId] = useState<string>('');
  const [campanaId, setCampanaId] = useState<string>('');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [observaciones, setObservaciones] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadEmpresas();
      setPaso(1);
      resetForm();
    }
  }, [isOpen]);

  const loadEmpresas = async () => {
    const { data } = await supabase
      .from('empresas')
      .select('id, nombre, rfc')
      .eq('activo', true)
      .order('nombre');
    
    if (data) {
      setEmpresas(data);
    }
  };

  const loadCampanas = async (empId: string) => {
    const { data } = await supabase
      .from('campanas_evaluacion')
      .select('id, nombre, fecha_inicio, fecha_fin')
      .eq('empresa_id', empId)
      .eq('estado', 'activa')
      .order('fecha_inicio', { ascending: false });
    
    setCampanas(data || []);
  };

  const resetForm = () => {
    setBusqueda('');
    setResultados([]);
    setPacienteSeleccionado(null);
    setTipoEvaluacion('preempleo');
    setEmpresaId('');
    setCampanaId('');
    setObservaciones('');
    setNuevoPaciente({
      nombre: '',
      apellido_paterno: '',
      apellido_materno: '',
      curp: '',
      nss: '',
      fecha_nacimiento: '',
      sexo: 'M',
    });
  };

  // Búsqueda de pacientes
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!busqueda || busqueda.length < 3) {
        setResultados([]);
        return;
      }

      setBuscando(true);
      try {
        const { data, error } = await supabase
          .from('pacientes')
          .select('id, nombre, apellido_paterno, apellido_materno, curp, nss, fecha_nacimiento, sexo, foto_url, empresa_id')
          .or(`nombre.ilike.%${busqueda}%,apellido_paterno.ilike.%${busqueda}%,curp.ilike.%${busqueda}%,nss.ilike.%${busqueda}%`)
          .limit(10);

        if (!error) {
          setResultados(data || []);
        }
      } finally {
        setBuscando(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [busqueda]);

  // Cambio de empresa
  const handleEmpresaChange = (empId: string) => {
    setEmpresaId(empId);
    setCampanaId('');
    loadCampanas(empId);
  };

  // Crear nuevo paciente
  const handleCrearPaciente = async () => {
    if (!nuevoPaciente.nombre || !nuevoPaciente.apellido_paterno) {
      toast.error('Nombre y apellido paterno son obligatorios');
      return;
    }

    setCreandoPaciente(true);
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .insert([{
          ...nuevoPaciente,
          empresa_id: empresaId || null,
        }])
        .select()
        .single();

      if (error) throw error;

      setPacienteSeleccionado(data);
      toast.success('Paciente creado exitosamente');
    } catch (error) {
      toast.error('Error al crear paciente');
    } finally {
      setCreandoPaciente(false);
    }
  };

  // Crear episodio
  const handleCrearEpisodio = async () => {
    if (!pacienteSeleccionado || !user?.id) return;

    try {
      const episodio = await crearEpisodio({
        paciente_id: pacienteSeleccionado.id,
        tipo: tipoEvaluacion,
        empresa_id: empresaId || pacienteSeleccionado.empresa_id || '',
        sede_id: sedeId,
        campana_id: campanaId || undefined,
        observaciones,
      });

      if (episodio) {
        toast.success('Episodio creado exitosamente');
        onSuccess?.(episodio.id);
        onClose();
      }
    } catch (error) {
      toast.error('Error al crear episodio');
    }
  };

  // Navegación
  const puedeAvanzar = () => {
    switch (paso) {
      case 1:
        return !!pacienteSeleccionado;
      case 2:
        return !!tipoEvaluacion && !!empresaId;
      default:
        return true;
    }
  };

  const avanzar = () => {
    if (paso < 3) setPaso(paso + 1);
  };

  const retroceder = () => {
    if (paso > 1) setPaso(paso - 1);
  };

  // Render paso 1: Buscar/Crear Paciente
  const renderPaso1 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
        <User className="w-5 h-5 text-blue-600" />
        <span className="text-sm text-blue-800">
          Paso 1: Selecciona o crea un paciente
        </span>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, CURP o NSS..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-10"
        />
        {buscando && (
          <RefreshCw className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Resultados */}
      {resultados.length > 0 && (
        <div className="border rounded-lg divide-y max-h-[200px] overflow-y-auto">
          {resultados.map((paciente) => (
            <div
              key={paciente.id}
              onClick={() => setPacienteSeleccionado(paciente)}
              className={`
                flex items-center gap-3 p-3 cursor-pointer transition-colors
                ${pacienteSeleccionado?.id === paciente.id ? 'bg-primary/10' : 'hover:bg-muted'}
              `}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={paciente.foto_url} />
                <AvatarFallback>
                  {paciente.nombre[0]}{paciente.apellido_paterno[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{paciente.nombre} {paciente.apellido_paterno}</p>
                <p className="text-sm text-muted-foreground">{paciente.curp || paciente.nss}</p>
              </div>
              {pacienteSeleccionado?.id === paciente.id && (
                <CheckCircle2 className="w-5 h-5 text-primary" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Crear nuevo */}
      <div className="border-t pt-4">
        <p className="text-sm font-medium mb-3">O crear nuevo paciente:</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Nombre *</Label>
            <Input
              value={nuevoPaciente.nombre}
              onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, nombre: e.target.value })}
              placeholder="Nombre"
            />
          </div>
          <div>
            <Label>Apellido Paterno *</Label>
            <Input
              value={nuevoPaciente.apellido_paterno}
              onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, apellido_paterno: e.target.value })}
              placeholder="Apellido Paterno"
            />
          </div>
          <div>
            <Label>Apellido Materno</Label>
            <Input
              value={nuevoPaciente.apellido_materno}
              onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, apellido_materno: e.target.value })}
              placeholder="Apellido Materno"
            />
          </div>
          <div>
            <Label>CURP</Label>
            <Input
              value={nuevoPaciente.curp}
              onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, curp: e.target.value })}
              placeholder="CURP"
            />
          </div>
        </div>
        <Button
          className="mt-3 w-full"
          variant="outline"
          onClick={handleCrearPaciente}
          disabled={creandoPaciente || !nuevoPaciente.nombre || !nuevoPaciente.apellido_paterno}
        >
          {creandoPaciente ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4 mr-2" />
          )}
          Crear Paciente
        </Button>
      </div>
    </div>
  );

  // Render paso 2: Configuración
  const renderPaso2 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
        <Briefcase className="w-5 h-5 text-blue-600" />
        <span className="text-sm text-blue-800">
          Paso 2: Configura la evaluación
        </span>
      </div>

      {/* Tipo de evaluación */}
      <div className="space-y-2">
        <Label>Tipo de Evaluación</Label>
        <div className="grid grid-cols-3 gap-2">
          {(['preempleo', 'periodico', 'retorno', 'egreso', 'reubicacion', 'consulta'] as TipoEvaluacion[]).map((tipo) => (
            <button
              key={tipo}
              onClick={() => setTipoEvaluacion(tipo)}
              className={`
                p-3 rounded-lg border text-center transition-colors
                ${tipoEvaluacion === tipo
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:bg-muted'
                }
              `}
            >
              <Stethoscope className={`w-4 h-4 mx-auto mb-1 ${tipoEvaluacion === tipo ? 'text-primary' : ''}`} />
              <span className="text-sm capitalize">{tipo}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Empresa */}
      <div className="space-y-2">
        <Label>Empresa</Label>
        <Select value={empresaId} onValueChange={handleEmpresaChange}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar empresa" />
          </SelectTrigger>
          <SelectContent>
            {empresas.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Campaña (opcional) */}
      {campanas.length > 0 && (
        <div className="space-y-2">
          <Label>Campaña (opcional)</Label>
          <Select value={campanaId} onValueChange={setCampanaId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar campaña" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin campaña</SelectItem>
              {campanas.map((camp) => (
                <SelectItem key={camp.id} value={camp.id}>
                  {camp.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );

  // Render paso 3: Confirmación
  const renderPaso3 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
        <CheckCircle2 className="w-5 h-5 text-green-600" />
        <span className="text-sm text-green-800">
          Paso 3: Confirma y crea el episodio
        </span>
      </div>

      {/* Resumen */}
      <div className="space-y-3 p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Paciente</p>
            <p className="font-medium">
              {pacienteSeleccionado?.nombre} {pacienteSeleccionado?.apellido_paterno}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Stethoscope className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Tipo de Evaluación</p>
            <p className="font-medium capitalize">{tipoEvaluacion}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Empresa</p>
            <p className="font-medium">
              {empresas.find(e => e.id === empresaId)?.nombre}
            </p>
          </div>
        </div>

        {campanaId && (
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Campaña</p>
              <p className="font-medium">
                {campanas.find(c => c.id === campanaId)?.nombre}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Observaciones */}
      <div className="space-y-2">
        <Label>Observaciones (opcional)</Label>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Notas adicionales..."
          className="w-full p-3 border rounded-lg min-h-[80px] resize-none"
        />
      </div>

      {/* Info SLA */}
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <span className="text-sm text-amber-800">
          Tiempo estimado: 60-90 minutos dependiendo de los estudios requeridos
        </span>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Nuevo Episodio de Atención
          </DialogTitle>
        </DialogHeader>

        {/* Progress bar */}
        <div className="mb-6">
          <Progress value={(paso / 3) * 100} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span className={paso >= 1 ? 'text-primary font-medium' : ''}>Paciente</span>
            <span className={paso >= 2 ? 'text-primary font-medium' : ''}>Configuración</span>
            <span className={paso >= 3 ? 'text-primary font-medium' : ''}>Confirmar</span>
          </div>
        </div>

        {/* Contenido del paso */}
        {paso === 1 && renderPaso1()}
        {paso === 2 && renderPaso2()}
        {paso === 3 && renderPaso3()}

        {/* Botones de navegación */}
        <div className="flex justify-between pt-4 border-t mt-6">
          <Button
            variant="outline"
            onClick={retroceder}
            disabled={paso === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {paso < 3 ? (
            <Button
              onClick={avanzar}
              disabled={!puedeAvanzar()}
            >
              Siguiente
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleCrearEpisodio}
              disabled={isCreating}
            >
              {isCreating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isCreating ? 'Creando...' : 'Crear Episodio'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
