import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, Info, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { RestriccionCatalogo } from '@/types/dictamen';

interface SelectorRestriccionesProps {
  selected: string[];
  onChange: (value: string[]) => void;
  puestoId?: string;
}

// Catálogo de restricciones de ejemplo
const restriccionesEjemplo: RestriccionCatalogo[] = [
  { id: '1', codigo: 'R001', nombre: 'No manipular sustancias tóxicas', descripcion: 'Restricción para manipulación de químicos, solventes y sustancias peligrosas', categoria: 'Químicos', activo: true },
  { id: '2', codigo: 'R002', nombre: 'No trabajar en alturas', descripcion: 'Restricción para trabajo en alturas mayores a 1.8 metros', categoria: 'Físicos', activo: true },
  { id: '3', codigo: 'R003', nombre: 'No exponerse a ruido >85dB', descripcion: 'Restricción para zonas con nivel de ruido superior a 85 decibeles', categoria: 'Físicos', activo: true },
  { id: '4', codigo: 'R004', nombre: 'No realizar esfuerzos físicos mayores', descripcion: 'Restricción para carga manual >25kg (hombres) o >15kg (mujeres)', categoria: 'Ergonomía', activo: true },
  { id: '5', codigo: 'R005', nombre: 'No manipular vibraciones segmentarias', descripcion: 'Restricción para uso de herramientas vibratorias', categoria: 'Físicos', activo: true },
  { id: '6', codigo: 'R006', nombre: 'No exposición a temperaturas extremas', descripcion: 'Restricción para trabajo en cámaras frigoríficas o ambientes calurosos', categoria: 'Físicos', activo: true },
  { id: '7', codigo: 'R007', nombre: 'No conducir vehículos de empresa', descripcion: 'Restricción para operación de vehículos automotores', categoria: 'Seguridad', activo: true },
  { id: '8', codigo: 'R008', nombre: 'No manipular alimentos', descripcion: 'Restricción para trabajo en áreas de manipulación de alimentos', categoria: 'Higiene', activo: true },
  { id: '9', codigo: 'R009', nombre: 'No trabajar turno nocturno', descripcion: 'Restricción para trabajo nocturno por condiciones de salud', categoria: 'Horario', activo: true },
  { id: '10', codigo: 'R010', nombre: 'No manipular metales pesados', descripcion: 'Restricción para trabajo con plomo, mercurio, cadmio, etc.', categoria: 'Químicos', activo: true },
  { id: '11', codigo: 'R011', nombre: 'No exposición a polvos orgánicos', descripcion: 'Restricción para trabajo con granos, harinas, fibras textiles', categoria: 'Químicos', activo: true },
  { id: '12', codigo: 'R012', nombre: 'No usar EPP respiratorio', descripcion: 'Contraindicación para uso de respiradores por condiciones respiratorias', categoria: 'EPP', activo: true },
];

const categorias = Array.from(new Set(restriccionesEjemplo.map(r => r.categoria)));

export function SelectorRestricciones({ selected, onChange, puestoId }: SelectorRestriccionesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('todas');
  const [hoveredRestriccion, setHoveredRestriccion] = useState<string | null>(null);
  const [restricciones, setRestricciones] = useState<RestriccionCatalogo[]>(restriccionesEjemplo);

  // Cargar restricciones desde API (simulado)
  useEffect(() => {
    // Aquí iría la llamada a la API para cargar restricciones filtradas por puesto
    // if (puestoId) {
    //   restriccionesService.getByPuesto(puestoId).then(setRestricciones);
    // }
  }, [puestoId]);

  const restriccionesFiltradas = restricciones.filter(r => {
    const matchesSearch = r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         r.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         r.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = categoriaSeleccionada === 'todas' || r.categoria === categoriaSeleccionada;
    return matchesSearch && matchesCategoria && !selected.includes(r.id);
  });

  const restriccionesSeleccionadas = restricciones.filter(r => selected.includes(r.id));

  const toggleRestriccion = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const removeRestriccion = (id: string) => {
    onChange(selected.filter(s => s !== id));
  };

  return (
    <div className="space-y-4">
      {/* Restricciones seleccionadas */}
      {restriccionesSeleccionadas.length > 0 && (
        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <p className="text-sm font-semibold text-emerald-800 mb-2">
            Restricciones seleccionadas ({restriccionesSeleccionadas.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {restriccionesSeleccionadas.map((r) => (
              <Badge
                key={r.id}
                variant="secondary"
                className="bg-white border border-emerald-200 text-emerald-800 pl-2 pr-1 py-1"
              >
                <span className="mr-1">{r.nombre}</span>
                <button
                  type="button"
                  onClick={() => removeRestriccion(r.id)}
                  className="ml-1 p-0.5 hover:bg-emerald-100 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Búsqueda y filtros */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar restricción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros por categoría */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoriaSeleccionada('todas')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              categoriaSeleccionada === 'todas'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas
          </button>
          {categorias.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoriaSeleccionada(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                categoriaSeleccionada === cat
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de restricciones */}
      <ScrollArea className="h-[200px] border rounded-lg">
        <div className="p-2 space-y-1">
          {restriccionesFiltradas.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No se encontraron restricciones</p>
            </div>
          ) : (
            restriccionesFiltradas.map((restriccion) => (
              <div
                key={restriccion.id}
                className="relative"
                onMouseEnter={() => setHoveredRestriccion(restriccion.id)}
                onMouseLeave={() => setHoveredRestriccion(null)}
              >
                <button
                  type="button"
                  onClick={() => toggleRestriccion(restriccion.id)}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-500">{restriccion.codigo}</span>
                        <Badge variant="outline" className="text-xs">{restriccion.categoria}</Badge>
                      </div>
                      <p className="font-medium text-sm text-slate-900 mt-1">{restriccion.nombre}</p>
                    </div>
                    <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </div>
                </button>

                {/* Tooltip con descripción */}
                {hoveredRestriccion === restriccion.id && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-lg">
                    <p className="font-medium mb-1">{restriccion.nombre}</p>
                    <p className="opacity-90">{restriccion.descripcion}</p>
                    <div className="absolute -top-1 left-4 w-2 h-2 bg-slate-800 rotate-45"></div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {selected.length === 0 && (
        <p className="text-sm text-amber-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Seleccione al menos una restricción
        </p>
      )}
    </div>
  );
}
