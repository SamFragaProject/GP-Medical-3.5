import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  Grid,
  Title,
  Text,
  Metric,
  Badge,
  Flex,
  Button,
  ProgressBar,
  Dialog,
  DialogPanel
} from '@tremor/react';
import {
  Calendar,
  FileText,
  Activity,
  Clock,
  Heart,
  AlertCircle,
  CheckCircle,
  Plus,
  ChevronRight,
  Pill
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Mock Data
const CITAS_PROXIMAS = [
  {
    id: '1',
    fecha: '2025-11-05',
    hora: '10:00 AM',
    medico: 'Dra. Luna Rivera',
    especialidad: 'Medicina del Trabajo',
    motivo: 'Revisión periódica anual',
    status: 'confirmada'
  }
];

const RECOMENDACIONES = [
  {
    id: '1',
    tipo: 'dieta',
    titulo: 'Alimentación Balanceada',
    descripcion: 'Incrementar consumo de frutas y verduras, reducir alimentos procesados.',
    prioridad: 'media',
    fecha: '15 Oct'
  },
  {
    id: '2',
    tipo: 'ejercicio',
    titulo: 'Actividad Física Regular',
    descripcion: 'Realizar ejercicio cardiovascular 30 minutos, 3 veces por semana.',
    prioridad: 'alta',
    fecha: '20 Oct'
  }
];

const EXAMENES = [
  {
    id: '1',
    fecha: '01 Oct 2025',
    tipo: 'Examen General',
    resultado: 'Normal',
    medico: 'Dr. Roberto Silva',
    status: 'completado'
  },
  {
    id: '2',
    fecha: '15 Sep 2025',
    tipo: 'Análisis de Sangre',
    resultado: 'En revisión',
    medico: 'Dr. Miguel Ángel Torres',
    status: 'pendiente'
  }
];

export default function DashboardPaciente() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-8">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-xl shadow-emerald-500/20 relative overflow-hidden text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              ¡Hola, {user?.nombre}!
            </h1>
            <p className="text-emerald-100 mt-2 text-lg">
              Bienvenido a tu centro de salud personal
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-md p-3 rounded-full">
            <Heart className="w-8 h-8 text-white" />
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="ring-0 border-l-4 border-blue-500 shadow-lg bg-white">
            <Flex justifyContent="start" className="space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Calendar size={24} />
              </div>
              <div>
                <Text>Próxima Cita</Text>
                <Metric>{CITAS_PROXIMAS.length}</Metric>
              </div>
            </Flex>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="ring-0 border-l-4 border-orange-500 shadow-lg bg-white">
            <Flex justifyContent="start" className="space-x-4">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <AlertCircle size={24} />
              </div>
              <div>
                <Text>Recomendaciones</Text>
                <Metric>{RECOMENDACIONES.length}</Metric>
              </div>
            </Flex>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="ring-0 border-l-4 border-purple-500 shadow-lg bg-white">
            <Flex justifyContent="start" className="space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <FileText size={24} />
              </div>
              <div>
                <Text>Exámenes</Text>
                <Metric>{EXAMENES.length}</Metric>
              </div>
            </Flex>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="ring-0 border-l-4 border-emerald-500 shadow-lg bg-white">
            <Flex justifyContent="start" className="space-x-4">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <Activity size={24} />
              </div>
              <div>
                <Text>Estado de Salud</Text>
                <Metric className="text-emerald-600">Bueno</Metric>
              </div>
            </Flex>
          </Card>
        </motion.div>
      </Grid>

      <Grid numItems={1} numItemsLg={2} className="gap-6">
        {/* Próximas Citas */}
        <Card className="ring-0 shadow-lg bg-white">
          <Flex className="mb-6">
            <Title>Mis Próximas Citas</Title>
            <Button size="xs" variant="secondary" icon={Plus} onClick={() => setIsOpen(true)}>
              Nueva Cita
            </Button>
          </Flex>
          <div className="space-y-4">
            {CITAS_PROXIMAS.map((cita) => (
              <div key={cita.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-slate-800">{cita.medico}</h4>
                    <p className="text-sm text-slate-500">{cita.especialidad}</p>
                  </div>
                  <Badge color="blue">{cita.status}</Badge>
                </div>
                <div className="flex gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-blue-500" />
                    {cita.fecha}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-blue-500" />
                    {cita.hora}
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                  {cita.motivo}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Recomendaciones */}
        <Card className="ring-0 shadow-lg bg-white">
          <Title className="mb-6">Recomendaciones Médicas</Title>
          <div className="space-y-4">
            {RECOMENDACIONES.map((rec) => (
              <div key={rec.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {rec.tipo === 'dieta' ? <Heart size={18} className="text-rose-500" /> : <Activity size={18} className="text-orange-500" />}
                    <h4 className="font-bold text-slate-800">{rec.titulo}</h4>
                  </div>
                  <Badge color={rec.prioridad === 'alta' ? 'red' : 'orange'}>
                    {rec.prioridad}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-3">{rec.descripcion}</p>
                <Text className="text-xs text-slate-400 text-right">{rec.fecha}</Text>
              </div>
            ))}
          </div>
        </Card>
      </Grid>

      {/* Historial */}
      <Card className="ring-0 shadow-lg bg-white">
        <Title className="mb-6">Historial Médico Reciente</Title>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Tipo Examen</th>
                <th className="px-4 py-3">Médico</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Resultado</th>
                <th className="px-4 py-3 rounded-r-lg text-right">Estado</th>
              </tr>
            </thead>
            <tbody>
              {EXAMENES.map((examen) => (
                <tr key={examen.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-900">{examen.tipo}</td>
                  <td className="px-4 py-3 text-slate-600">{examen.medico}</td>
                  <td className="px-4 py-3 text-slate-500">{examen.fecha}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{examen.resultado}</td>
                  <td className="px-4 py-3 text-right">
                    <Badge color={examen.status === 'completado' ? 'emerald' : 'amber'} size="xs">
                      {examen.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Nueva Cita (Placeholder) */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} static={true}>
        <DialogPanel>
          <Title className="mb-4">Solicitar Nueva Cita</Title>
          <Text className="mb-6">
            Complete el formulario para solicitar una cita con nuestros especialistas.
          </Text>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg text-center text-slate-500">
              Formulario de solicitud de cita aquí...
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsOpen(false)}>
                Enviar Solicitud
              </Button>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </div>
  );
}
