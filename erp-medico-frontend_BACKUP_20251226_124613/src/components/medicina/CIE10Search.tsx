// Buscador CIE-10 con fuzzy search y chips
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Fuse from 'fuse.js'

// Catálogo demo CIE-10 (en producción vendría de API o DB)
const catalogoCIE10 = [
  { codigo: 'J00', descripcion: 'Rinofaringitis aguda [resfriado común]', categoria: 'Respiratorio' },
  { codigo: 'J06.9', descripcion: 'Infección aguda de las vías respiratorias superiores, no especificada', categoria: 'Respiratorio' },
  { codigo: 'R50.9', descripcion: 'Fiebre, no especificada', categoria: 'Síntomas generales' },
  { codigo: 'R51', descripcion: 'Cefalea', categoria: 'Neurológico' },
  { codigo: 'K29.7', descripcion: 'Gastritis, no especificada', categoria: 'Gastrointestinal' },
  { codigo: 'K21.9', descripcion: 'Enfermedad por reflujo gastroesofágico sin esofagitis', categoria: 'Gastrointestinal' },
  { codigo: 'M54.5', descripcion: 'Dolor lumbar bajo', categoria: 'Musculoesquelético' },
  { codigo: 'I10', descripcion: 'Hipertensión esencial (primaria)', categoria: 'Cardiovascular' },
  { codigo: 'E11.9', descripcion: 'Diabetes mellitus tipo 2 sin complicaciones', categoria: 'Endocrino' },
  { codigo: 'J45.9', descripcion: 'Asma, no especificada', categoria: 'Respiratorio' },
  { codigo: 'A09', descripcion: 'Diarrea y gastroenteritis de presunto origen infeccioso', categoria: 'Infeccioso' },
  { codigo: 'H10.9', descripcion: 'Conjuntivitis, no especificada', categoria: 'Oftalmológico' },
  { codigo: 'N39.0', descripcion: 'Infección de vías urinarias, sitio no especificado', categoria: 'Urológico' },
  { codigo: 'L20.9', descripcion: 'Dermatitis atópica, no especificada', categoria: 'Dermatológico' },
  { codigo: 'R10.4', descripcion: 'Otros dolores abdominales y los no especificados', categoria: 'Gastrointestinal' }
]

interface CIE10SearchProps {
  selectedCodes: Array<{ codigo: string; descripcion: string }>
  onAdd: (item: { codigo: string; descripcion: string }) => void
  onRemove: (codigo: string) => void
  placeholder?: string
}

export function CIE10Search({ selectedCodes, onAdd, onRemove, placeholder }: CIE10SearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<typeof catalogoCIE10>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const fuseRef = useRef<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!fuseRef.current) {
      fuseRef.current = new Fuse(catalogoCIE10, {
        keys: ['codigo', 'descripcion', 'categoria'],
        threshold: 0.3,
        minMatchCharLength: 2
      })
    }
  }, [])

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([])
      setShowDropdown(false)
      return
    }
    
    if (query.trim().length < 2) {
      setResults([])
      return
    }

    const searchResults = fuseRef.current!.search(query.trim()).slice(0, 8).map(r => r.item)
    setResults(searchResults)
    setShowDropdown(searchResults.length > 0)
  }, [query])

  const handleSelect = (item: typeof catalogoCIE10[0]) => {
    if (!selectedCodes.some(c => c.codigo === item.codigo)) {
      onAdd({ codigo: item.codigo, descripcion: item.descripcion })
    }
    setQuery('')
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="hc-input-group">
          <Search className="hc-input-icon h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= 2 && results.length > 0 && setShowDropdown(true)}
            placeholder={placeholder || "Buscar código CIE-10..."}
            className="hc-input pl-10 focus:ring-2 focus:ring-primary/60"
          />
        </div>
        
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 mt-2 w-full bg-white border rounded-lg shadow-xl max-h-64 overflow-y-auto"
            >
              {results.map((item, idx) => (
                <motion.button
                  key={item.codigo}
                  type="button"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => handleSelect(item)}
                  className="w-full px-4 py-3 text-left hover:bg-primary/5 transition-colors border-b last:border-b-0 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-semibold text-primary">{item.codigo}</span>
                        <Badge variant="outline" className="text-[10px]">{item.categoria}</Badge>
                      </div>
                      <p className="text-xs text-gray-700 group-hover:text-gray-900">{item.descripcion}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400 transform -rotate-90 group-hover:text-primary transition-colors" />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedCodes.length > 0 && (
        <div className="space-y-2">
          <div className="hc-divider text-xs">Códigos CIE-10 seleccionados</div>
          <div className="flex flex-wrap gap-2">
            {selectedCodes.map((item) => (
              <motion.div
                key={item.codigo}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="hc-badge hc-badge-success flex items-center gap-2 px-3 py-1.5"
              >
                <span className="font-mono text-xs font-semibold">{item.codigo}</span>
                <span className="text-xs">·</span>
                <span className="text-xs max-w-[200px] truncate" title={item.descripcion}>
                  {item.descripcion}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(item.codigo)}
                  className="ml-1 hover:bg-success-700 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
