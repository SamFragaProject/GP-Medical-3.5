import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  Shield,
  MoreVertical,
  Users,
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Edit,
  Globe,
  Briefcase
} from 'lucide-react'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { dataService } from '@/services/dataService'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

import { NewSedeDialog } from '@/components/admin/NewSedeDialog'

export default function Sedes() {
  const { user } = useAuth()
  const [sedes, setSedes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedSede, setSelectedSede] = useState<any>(null)

  useEffect(() => {
    cargarSedes()
  }, [])

  const cargarSedes = async () => {
    setLoading(true)
    try {
      const data = await dataService.sedes.getAll(user?.empresa_id)
      setSedes(data)
    } catch (error) {
      toast.error('Error al cargar sedes')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (sede: any) => {
    setSelectedSede(sede)
    setIsDialogOpen(true)
  }

  const handleToggleStatus = async (sede: any) => {
    try {
      await dataService.sedes.toggleStatus(sede.id, !sede.activa)
      toast.success(sede.activa ? 'Sede desactivada' : 'Sede activada')
      cargarSedes()
    } catch (error) {
      toast.error('Error al cambiar el estado')
    }
  }

  const filteredSedes = sedes.filter(sede =>
    sede.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (sede.ciudad && sede.ciudad.toLowerCase().includes(busqueda.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-8">
      <PremiumPageHeader
        title="Centros Operativos & Sedes"
        subtitle="Sincronización logística total y administración de infraestructura física."
        icon={MapPin}
        badge="NETWORK ACTIVE"
        actions={
          <Button
            variant="premium"
            onClick={() => {
              setSelectedSede(null)
              setIsDialogOpen(true)
            }}
            className="h-11 px-8 shadow-xl shadow-emerald-500/20"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Sede
          </Button>
        }
      />

      <div className="flex items-center gap-4 bg-white/40 backdrop-blur-md p-4 rounded-3xl border border-white/60 shadow-sm mb-8">
        <Search className="text-slate-400 w-5 h-5 ml-2" />
        <input
          type="text"
          placeholder="Rastrear ubicación por nombre o geolocalización..."
          className="flex-1 bg-transparent border-none outline-none text-slate-700 font-bold placeholder:text-slate-400"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sincronizando Sedes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSedes.map((sede) => (
            <motion.div
              key={sede.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
            >
              <Card className="rounded-[2.5rem] border-none shadow-xl hover:shadow-2xl transition-all overflow-hidden bg-white/80 backdrop-blur-sm group">
                <div className={`h-2 ${sede.activa ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-slate-300'}`} />
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-16 h-16 rounded-2xl ${sede.activa ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                      <MapPin size={32} />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={sede.activa ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}>
                        {sede.activa ? 'Operativa' : 'Inactiva'}
                      </Badge>
                      {sede.es_sede_principal && (
                        <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[9px] uppercase">
                          Principal
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 mb-8">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{sede.nombre}</h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                      <MapPin size={14} className="text-slate-400" />
                      {sede.ciudad || 'N/A'}, {sede.estado || 'N/A'}
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                        <Phone size={14} />
                      </div>
                      {sede.telefono || 'Sin teléfono'}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <Mail size={14} />
                      </div>
                      {sede.email || 'Sin email'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Users size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Personal</span>
                      </div>
                      <p className="text-sm font-bold text-slate-700">--</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Briefcase size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Estado</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-700 uppercase truncate">Sincronizado</p>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button
                      onClick={() => handleEdit(sede)}
                      className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all font-sans"
                    >
                      Administrar
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all">
                          <MoreVertical size={16} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl p-2 border-slate-100 shadow-2xl">
                        <DropdownMenuItem onClick={() => handleEdit(sede)} className="rounded-xl gap-3 font-bold text-xs py-2.5">
                          <Edit size={14} className="text-blue-600" /> Editar Sede
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl gap-3 font-bold text-xs py-2.5">
                          <Globe size={14} className="text-slate-600" /> Ver Mapa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(sede)}
                          className={`rounded-xl gap-3 font-bold text-xs py-2.5 ${sede.activa ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                        >
                          {sede.activa ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                          {sede.activa ? 'Desactivar Sede' : 'Activar Sede'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {filteredSedes.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <MapPin size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900">No hay sedes registradas</h3>
              <p className="text-slate-500 mt-2">Personaliza las ubicaciones de tu organización para una mejor gestión operativa.</p>
            </div>
          )}
        </div>
      )}

      <NewSedeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={cargarSedes}
        initialData={selectedSede}
      />
    </div>
  )
}
