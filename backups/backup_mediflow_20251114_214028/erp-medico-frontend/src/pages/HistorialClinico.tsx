import React, { useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Phone, Mail, Stethoscope, ArrowLeft, AlertTriangle, FileText, Activity, HeartPulse, ClipboardPlus, FlaskConical, Pill } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PrescripcionBuilderOrganizado } from '@/components/medicina/PrescripcionBuilderOrganizado'
import { TimelineMedico } from '@/components/TimelineMedico'
import toast from 'react-hot-toast'

export default function HistorialClinico() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation() as any

  const paciente = useMemo(() => {
    if (state?.paciente) return state.paciente
    // Fallback demo si se accede directo
    return {
      id: id || '1',
      numero_empleado: 'EMP' + (id || '001'),
      nombre: 'Paciente',
      apellido_paterno: 'Demo',
      apellido_materno: '',
      genero: 'masculino',
      fecha_nacimiento: '1990-01-01',
      email: 'paciente@demo.mx',
      telefono: '555-0000',
      estatus: 'activo',
      puesto_trabajo: { nombre: 'Puesto', departamento: 'Área' },
      alergias: 'Ninguna conocida',
      enfermedades_cronicas: '—',
    }
  }, [id, state])

  return (
    <div className="space-y-6">
      {/* Header Paciente */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14"><AvatarImage src={paciente.foto_url}/><AvatarFallback>{paciente.nombre?.[0]}{paciente.apellido_paterno?.[0]}</AvatarFallback></Avatar>
          <div>
            <h1 className="text-2xl font-bold">{paciente.nombre} {paciente.apellido_paterno} {paciente.apellido_materno}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              <span className="flex items-center"><FileText className="h-4 w-4 mr-1"/> {paciente.numero_empleado}</span>
              <span className="flex items-center"><MapPin className="h-4 w-4 mr-1"/> {paciente.puesto_trabajo?.departamento || '—'}</span>
              <span className="flex items-center"><Calendar className="h-4 w-4 mr-1"/> {new Date(paciente.fecha_nacimiento).toLocaleDateString('es-MX')}</span>
              {paciente.email && <span className="flex items-center"><Mail className="h-4 w-4 mr-1"/> {paciente.email}</span>}
              {paciente.telefono && <span className="flex items-center"><Phone className="h-4 w-4 mr-1"/> {paciente.telefono}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">{paciente.genero}</Badge>
          <Badge className="bg-emerald-100 text-emerald-800">Activo</Badge>
          <Button variant="outline" onClick={()=>navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2"/>Volver</Button>
        </div>
      </div>

      {/* Estadísticas y alertas con tarjetas de color */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-emerald-700">Consultas</div>
                <div className="text-3xl font-extrabold text-emerald-900">12</div>
              </div>
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700"><Activity className="h-6 w-6"/></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-700">Exámenes</div>
                <div className="text-3xl font-extrabold text-blue-900">5</div>
              </div>
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700"><FlaskConical className="h-6 w-6"/></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-orange-700">Alertas</div>
                <div className="text-3xl font-extrabold text-orange-900">1</div>
              </div>
              <div className="p-2 rounded-lg bg-orange-100 text-orange-700"><AlertTriangle className="h-6 w-6"/></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-purple-700">Última atención</div>
                <div className="text-3xl font-extrabold text-purple-900">hoy</div>
              </div>
              <div className="p-2 rounded-lg bg-purple-100 text-purple-700"><HeartPulse className="h-6 w-6"/></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas importantes */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="py-4 flex items-center gap-3 text-sm text-yellow-800">
          <AlertTriangle className="h-5 w-5"/> Tiene un seguimiento pendiente en 7 días.
        </CardContent>
      </Card>

      {/* Timeline simple demo */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center"><Stethoscope className="h-5 w-5 mr-2 text-primary"/> Línea de tiempo clínica</h2>
          </div>
          <TimelineMedico eventos={[{id:'1',fecha_evento:'2025-10-15',tipo_evento:'consulta',descripcion:'Consulta general',estado:'completado'}]} maxEventos={10}/>
        </CardContent>
      </Card>

      {/* Constructor de Prescripción - Versión Organizada */}
      <Card className="border-primary/30 bg-gradient-to-br from-white to-green-50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            Generador de Recetas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PrescripcionBuilderOrganizado 
            paciente={paciente} 
            onCreated={() => {
              toast.success('Receta guardada exitosamente')
              // Aquí podrías recargar el timeline o actualizar el estado
            }} 
          />
        </CardContent>
      </Card>
    </div>
  )
}
