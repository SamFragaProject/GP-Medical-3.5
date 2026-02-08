// =====================================================
// COMPONENTE: Expediente Clínico Pro - GPMedical ERP Pro
// =====================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Calendar, FileText, Activity, ClipboardList, Heart, Shield, AlertCircle,
  Stethoscope, Pill, FlaskConical, Eye, CheckCircle, Save, Printer, ChevronLeft,
  Plus, Edit2, Trash2, MoreVertical, Clock, MapPin, Briefcase, AlertTriangle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-hot-toast';

import { expedienteService, apnpService, ahfService, historiaOcupacionalService, exploracionFisicaService } from '@/services/expedienteService';
import type { ExpedienteClinico, APNP, AHF, HistoriaOcupacional, ExploracionFisica } from '@/types/expediente';

// Importar sub-componentes (se crearán después)
import { APNPForm } from '@/components/expediente/APNPForm';
import { AHFForm } from '@/components/expediente/AHFForm';
import { HistoriaOcupacionalList } from '@/components/expediente/HistoriaOcupacionalList';
import { ExploracionFisicaForm } from '@/components/expediente/ExploracionFisicaForm';
import { ConsultasList } from '@/components/expediente/ConsultasList';
import { EstudiosList } from '@/components/expediente/EstudiosList';

export default function ExpedienteClinicoPro() {
  const { pacienteId } = useParams<{ pacienteId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('general');

  // Query para obtener expediente
  const { data: expediente, isLoading: loadingExpediente } = useQuery({
    queryKey: ['expediente', pacienteId],
    queryFn: () => pacienteId ? expedienteService.getByPaciente(pacienteId) : null,
    enabled: !!pacienteId,
  });

  // Query para APNP
  const { data: apnp } = useQuery({
    queryKey: ['apnp', expediente?.id],
    queryFn: () => expediente?.id ? apnpService.getByExpediente(expediente.id) : null,
    enabled: !!expediente?.id,
  });

  // Query para AHF
  const { data: ahf } = useQuery({
    queryKey: ['ahf', expediente?.id],
    queryFn: () => expediente?.id ? ahfService.getByExpediente(expediente.id) : null,
    enabled: !!expediente?.id,
  });

  // Query para Historia Ocupacional
  const { data: historiasOcupacionales } = useQuery({
    queryKey: ['historia-ocupacional', expediente?.id],
    queryFn: () => expediente?.id ? historiaOcupacionalService.listByExpediente(expediente.id) : [],
    enabled: !!expediente?.id,
  });

  // Query para Exploración Física
  const { data: exploraciones } = useQuery({
    queryKey: ['exploracion-fisica', expediente?.id],
    queryFn: () => expediente?.id ? exploracionFisicaService.listByExpediente(expediente.id) : [],
    enabled: !!expediente?.id,
  });

  // Mutación para crear expediente
  const crearExpedienteMutation = useMutation({
    mutationFn: expedienteService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expediente', pacienteId] });
      toast.success('Expediente creado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear expediente');
      console.error(error);
    },
  });

  if (loadingExpediente) {
    return (
      <AdminLayout
        title="Expediente Clínico"
        subtitle="Cargando información..."
        icon={FileText}
      >
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!expediente) {
    return (
      <AdminLayout
        title="Expediente Clínico"
        subtitle="No existe expediente para este paciente"
        icon={FileText}
      >
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <FileText className="h-16 w-16 text-slate-300" />
          <p className="text-slate-500 text-lg">No existe un expediente clínico para este paciente</p>
          <Button
            onClick={() => pacienteId && crearExpedienteMutation.mutate({
              paciente_id: pacienteId,
              empresa_id: '', // TODO: Obtener empresa del paciente
            })}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Expediente
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const paciente = expediente.paciente;

  return (
    <AdminLayout
      title={`Expediente: ${paciente?.nombre} ${paciente?.apellido_paterno}`}
      subtitle={`Folio: ${expediente.id.slice(0, 8)} | Empresa: ${expediente.empresa?.nombre}`}
      icon={FileText}
      backButton
      badges={[
        { text: expediente.estado, variant: expediente.estado === 'activo' ? 'success' : 'default' },
        { text: `Apertura: ${new Date(expediente.fecha_apertura).toLocaleDateString()}` },
      ]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Consulta
          </Button>
        </div>
      }
    >
      {/* Resumen del Paciente */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Paciente</p>
                <p className="font-semibold">{paciente?.nombre} {paciente?.apellido_paterno}</p>
                <p className="text-sm text-slate-400">
                  {paciente?.fecha_nacimiento && calcularEdad(paciente.fecha_nacimiento)} años • {paciente?.sexo === 'masculino' ? 'M' : 'F'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Empresa</p>
                <p className="font-semibold">{expediente.empresa?.nombre}</p>
                <p className="text-sm text-slate-400">RFC: {expediente.empresa?.rfc}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <Activity className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Tipo de Sangre</p>
                <p className="font-semibold text-xl">{expediente.tipo_sangre || 'No registrado'}</p>
                <p className="text-sm text-slate-400">{expediente.alergias ? `Alergias: ${expediente.alergias}` : 'Sin alergias registradas'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Última Actualización</p>
                <p className="font-semibold">{new Date(expediente.updated_at).toLocaleDateString()}</p>
                <p className="text-sm text-slate-400">
                  {new Date(expediente.updated_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs del Expediente */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-8 gap-2 bg-white p-2 rounded-xl border">
          <TabsTrigger value="general" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
            <ClipboardList className="w-4 h-4 mr-2 hidden md:inline" />
            General
          </TabsTrigger>
          <TabsTrigger value="apnp" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
            <Heart className="w-4 h-4 mr-2 hidden md:inline" />
            APNP
          </TabsTrigger>
          <TabsTrigger value="ahf" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
            <User className="w-4 h-4 mr-2 hidden md:inline" />
            AHF
          </TabsTrigger>
          <TabsTrigger value="ocupacional" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
            <Briefcase className="w-4 h-4 mr-2 hidden md:inline" />
            Ocupacional
          </TabsTrigger>
          <TabsTrigger value="exploracion" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
            <Stethoscope className="w-4 h-4 mr-2 hidden md:inline" />
            Exploración
          </TabsTrigger>
          <TabsTrigger value="consultas" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
            <Calendar className="w-4 h-4 mr-2 hidden md:inline" />
            Consultas
          </TabsTrigger>
          <TabsTrigger value="estudios" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
            <FlaskConical className="w-4 h-4 mr-2 hidden md:inline" />
            Estudios
          </TabsTrigger>
          <TabsTrigger value="consentimientos" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
            <Shield className="w-4 h-4 mr-2 hidden md:inline" />
            Consentimientos
          </TabsTrigger>
        </TabsList>

        {/* Contenido de Tabs */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value="general" className="mt-0">
              <GeneralTab expediente={expediente} />
            </TabsContent>

            <TabsContent value="apnp" className="mt-0">
              <APNPForm 
                expedienteId={expediente.id} 
                data={apnp} 
              />
            </TabsContent>

            <TabsContent value="ahf" className="mt-0">
              <AHFForm 
                expedienteId={expediente.id} 
                data={ahf} 
              />
            </TabsContent>

            <TabsContent value="ocupacional" className="mt-0">
              <HistoriaOcupacionalList 
                expedienteId={expediente.id} 
                data={historiasOcupacionales || []} 
              />
            </TabsContent>

            <TabsContent value="exploracion" className="mt-0">
              <ExploracionFisicaList 
                expedienteId={expediente.id} 
                data={exploraciones || []} 
              />
            </TabsContent>

            <TabsContent value="consultas" className="mt-0">
              <ConsultasList expedienteId={expediente.id} />
            </TabsContent>

            <TabsContent value="estudios" className="mt-0">
              <EstudiosList expedienteId={expediente.id} />
            </TabsContent>

            <TabsContent value="consentimientos" className="mt-0">
              <ConsentimientosTab expedienteId={expediente.id} />
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </AdminLayout>
  );
}

// =====================================================
// SUB-COMPONENTES
// =====================================================

function GeneralTab({ expediente }: { expediente: ExpedienteClinico }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Alertas y Alergias
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expediente.alergias ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">{expediente.alergias}</p>
            </div>
          ) : (
            <p className="text-slate-500">No hay alergias registradas</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            Resumen Clínico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-slate-600">Tipo de Sangre:</span>
            <Badge variant="outline" className="font-mono text-lg">
              {expediente.tipo_sangre || 'No registrado'}
            </Badge>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-slate-600">Estado:</span>
            <Badge className={expediente.estado === 'activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}>
              {expediente.estado}
            </Badge>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-slate-600">Fecha de Apertura:</span>
            <span className="font-medium">{new Date(expediente.fecha_apertura).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ExploracionFisicaList({ expedienteId, data }: { expedienteId: string; data: ExploracionFisica[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Exploraciones Físicas</h3>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Exploración
        </Button>
      </div>

      {data.length === 0 ? (
        <Card className="p-8 text-center">
          <Stethoscope className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">No hay exploraciones físicas registradas</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {data.map((exploracion) => (
            <Card key={exploracion.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-lg">
                      Exploración del {new Date(exploracion.fecha_exploracion).toLocaleDateString()}
                    </p>
                    <p className="text-slate-500">
                      IMC: {exploracion.imc || 'N/A'} • PA: {exploracion.ta_sistolica || '--'}/{exploracion.ta_diastolica || '--'}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalle
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ConsentimientosTab({ expedienteId }: { expedienteId: string }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Consentimientos Informados</h3>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Consentimiento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Consentimiento de Prestación de Servicios</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Autorización para realización de exámenes médicos ocupacionales
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                    Pendiente de firma
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Consentimiento de Manejo de Datos</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Autorización para tratamiento de datos personales (LFPDPPP)
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                    Firmado
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// =====================================================
// UTILIDADES
// =====================================================

function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  
  return edad;
}
