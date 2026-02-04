// Sistema de Plantillas Personalizables para Certificados
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  FileText,
  Eye,
  Download,
  Upload,
  Edit,
  Trash2,
  Plus,
  Image,
  Type,
  Palette,
  Layout,
  Code,
  Smartphone,
  Monitor,
  Tablet,
  CheckCircle,
  AlertCircle,
  Save,
  RotateCcw,
  Copy,
  Star,
  Lock,
  Building
} from 'lucide-react'
import { PlantillaCertificado, Empresa, TipoCertificado } from '@/types/certificacion'

interface PlantillasCertificadoProps {
  plantillas: PlantillaCertificado[]
  empresas: Empresa[]
  tiposCertificado: TipoCertificado[]
  onCrearPlantilla: (plantilla: Partial<PlantillaCertificado>) => Promise<void>
  onActualizarPlantilla: (id: string, datos: Partial<PlantillaCertificado>) => Promise<void>
  onEliminarPlantilla: (id: string) => Promise<void>
  onPreviewPlantilla: (plantilla: PlantillaCertificado) => void
  onActivarPlantilla: (id: string, empresaId: string) => Promise<void>
}

export function PlantillasCertificado({
  plantillas,
  empresas,
  tiposCertificado,
  onCrearPlantilla,
  onActualizarPlantilla,
  onEliminarPlantilla,
  onPreviewPlantilla,
  onActivarPlantilla
}: PlantillasCertificadoProps) {
  const [mostrarEditor, setMostrarEditor] = useState(false)
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<PlantillaCertificado | null>(null)
  const [nuevaPlantilla, setNuevaPlantilla] = useState<Partial<PlantillaCertificado>>({
    nombre: '',
    empresaId: '',
    tipoCertificadoId: '',
    htmlTemplate: '',
    esDefecto: false
  })
  const [vistaPrevia, setVistaPrevia] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [editorMode, setEditorMode] = useState<'visual' | 'html' | 'css'>('visual')

  const camposPlantilla = [
    { key: '{{numero_certificado}}', nombre: 'Número de Certificado', tipo: 'texto' },
    { key: '{{nombre_paciente}}', nombre: 'Nombre del Paciente', tipo: 'texto' },
    { key: '{{fecha_emision}}', nombre: 'Fecha de Emisión', tipo: 'fecha' },
    { key: '{{fecha_vencimiento}}', nombre: 'Fecha de Vencimiento', tipo: 'fecha' },
    { key: '{{empresa_nombre}}', nombre: 'Nombre de la Empresa', tipo: 'texto' },
    { key: '{{puesto_trabajo}}', nombre: 'Puesto de Trabajo', tipo: 'texto' },
    { key: '{{medico_nombre}}', nombre: 'Médico Responsable', tipo: 'texto' },
    { key: '{{cedula_medico}}', nombre: 'Cédula del Médico', tipo: 'texto' },
    { key: '{{aptitud_trabajo}}', nombre: 'Aptitud para el Trabajo', tipo: 'texto' },
    { key: '{{restricciones}}', nombre: 'Restricciones Médicas', tipo: 'texto' },
    { key: '{{recomendaciones}}', nombre: 'Recomendaciones', tipo: 'texto' },
    { key: '{{observaciones}}', nombre: 'Observaciones Médicas', tipo: 'texto' }
  ]

  const templatesPorDefecto = [
    {
      nombre: 'Certificado Oficial Simplificado',
      descripcion: 'Plantilla básica con formato oficial',
      contenido: `
        <div class="certificado">
          <header class="header">
            <div class="logo">
              <img src="{{logo_empresa}}" alt="Logo" />
            </div>
            <div class="titulo">
              <h1>CERTIFICADO MÉDICO</h1>
              <h2>DE APTITUD PARA EL TRABAJO</h2>
            </div>
          </header>
          
          <main class="contenido">
            <p class="certifico">Certifico que:</p>
            <div class="datos-paciente">
              <strong>{{nombre_paciente}}</strong>
            </div>
            
            <p>Con puesto de trabajo: <strong>{{puesto_trabajo}}</strong></p>
            <p>Empresa: <strong>{{empresa_nombre}}</strong></p>
            
            <div class="resultado">
              <p><strong>RESULTADO:</strong></p>
              <p class="apto">{{aptitud_trabajo}}</p>
            </div>
            
            {{#if restricciones}}
            <div class="restricciones">
              <p><strong>RESTRICCIONES:</strong></p>
              <p>{{restricciones}}</p>
            </div>
            {{/if}}
          </main>
          
          <footer class="footer">
            <div class="fecha">
              <p>Fecha de emisión: {{fecha_emision}}</p>
              <p>Vigencia hasta: {{fecha_vencimiento}}</p>
            </div>
            <div class="firma">
              <p>_________________________</p>
              <p><strong>{{medico_nombre}}</strong></p>
              <p>Céd. Prof. {{cedula_medico}}</p>
              <p>{{especialidad}}</p>
            </div>
          </footer>
        </div>
      `
    },
    {
      nombre: 'Certificado Empresarial Completo',
      descripcion: 'Plantilla completa con branding empresarial',
      contenido: `
        <div class="certificado-empresarial">
          <div class="header-corporativo">
            <div class="empresa-info">
              <img src="{{logo_empresa}}" class="logo-empresa" />
              <div class="datos-empresa">
                <h3>{{empresa_nombre}}</h3>
                <p>{{razon_social}}</p>
                <p>RFC: {{rfc_empresa}}</p>
              </div>
            </div>
            <div class="titulo-certificado">
              <h1>CERTIFICADO MÉDICO</h1>
              <h2>DE APTITUD OCUPACIONAL</h2>
              <span class="numero">No. {{numero_certificado}}</span>
            </div>
          </div>
          
          <div class="body-certificado">
            <div class="seccion">
              <h3>DATOS DEL TRABAJADOR</h3>
              <div class="datos-grid">
                <div class="campo">
                  <label>Nombre completo:</label>
                  <span>{{nombre_paciente}}</span>
                </div>
                <div class="campo">
                  <label>Puesto de trabajo:</label>
                  <span>{{puesto_trabajo}}</span>
                </div>
                <div class="campo">
                  <label>Empresa:</label>
                  <span>{{empresa_nombre}}</span>
                </div>
              </div>
            </div>
            
            <div class="seccion">
              <h3>RESULTADO DEL EXAMEN</h3>
              <div class="resultado-principal">
                <div class="apto-container">
                  <div class="apto-icono">✓</div>
                  <div class="apto-texto">
                    <h4>{{aptitud_trabajo}}</h4>
                  </div>
                </div>
              </div>
              
              {{#if restricciones}}
              <div class="restricciones-box">
                <h4>RESTRICCIONES MÉDICAS:</h4>
                <p>{{restricciones}}</p>
              </div>
              {{/if}}
              
              {{#if recomendaciones}}
              <div class="recomendaciones-box">
                <h4>RECOMENDACIONES:</h4>
                <p>{{recomendaciones}}</p>
              </div>
              {{/if}}
            </div>
          </div>
          
          <div class="footer-certificado">
            <div class="fechas-vigencia">
              <div class="fecha-item">
                <label>Fecha de emisión:</label>
                <span>{{fecha_emision}}</span>
              </div>
              <div class="fecha-item">
                <label>Vigente hasta:</label>
                <span class="fecha-vencimiento">{{fecha_vencimiento}}</span>
              </div>
            </div>
            
            <div class="firma-medico">
              <div class="firma-area">
                <p class="firma-linea">_________________________</p>
                <p class="firma-nombre">{{medico_nombre}}</p>
                <p class="firma-cedula">Cédula Profesional: {{cedula_medico}}</p>
                <p class="firma-especialidad">{{especialidad}}</p>
              </div>
            </div>
          </div>
        </div>
      `
    }
  ]

  const abrirEditor = (plantilla?: PlantillaCertificado) => {
    if (plantilla) {
      setPlantillaSeleccionada(plantilla)
      setNuevaPlantilla(plantilla)
    } else {
      setPlantillaSeleccionada(null)
      setNuevaPlantilla({
        nombre: '',
        empresaId: '',
        tipoCertificadoId: '',
        htmlTemplate: '',
        esDefecto: false
      })
    }
    setMostrarEditor(true)
  }

  const guardarPlantilla = async () => {
    try {
      if (plantillaSeleccionada) {
        await onActualizarPlantilla(plantillaSeleccionada.id, nuevaPlantilla)
      } else {
        await onCrearPlantilla(nuevaPlantilla)
      }
      setMostrarEditor(false)
    } catch (error) {
      console.error('Error al guardar plantilla:', error)
    }
  }

  const insertarCampo = (campo: string) => {
    const textarea = document.getElementById('template-editor') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = nuevaPlantilla.htmlTemplate || ''
      const newText = text.substring(0, start) + campo + text.substring(end)

      setNuevaPlantilla({
        ...nuevaPlantilla,
        htmlTemplate: newText
      })
    }
  }

  const plantillasPorEmpresa = empresas.map(empresa => ({
    ...empresa,
    plantillas: plantillas.filter(p => p.empresaId === empresa.id)
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Layout className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Plantillas Personalizables</h2>
              <p className="text-gray-600">Diseños de certificados personalizables por empresa</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => abrirEditor()}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus size={16} />
              <span>Nueva Plantilla</span>
            </button>
          </div>
        </div>
      </div>

      {/* Plantillas por Empresa */}
      <div className="space-y-6">
        {plantillasPorEmpresa.map((empresa) => (
          <div key={empresa.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{empresa.nombre}</h3>
                    <p className="text-sm text-gray-600">{empresa.plantillas.length} plantillas</p>
                  </div>
                </div>
                <button
                  onClick={() => abrirEditor()}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  + Agregar Plantilla
                </button>
              </div>
            </div>

            <div className="p-6">
              {empresa.plantillas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {empresa.plantillas.map((plantilla) => {
                    const tipo = tiposCertificado.find(t => t.id === plantilla.tipoCertificadoId)
                    return (
                      <div key={plantilla.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{plantilla.nombre}</h4>
                            <p className="text-sm text-gray-600">{tipo?.nombre}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            {plantilla.esDefecto && (
                              <span title="Plantilla por defecto">
                                <Star className="h-4 w-4 text-yellow-500" />
                              </span>
                            )}
                            <button
                              onClick={() => onPreviewPlantilla(plantilla)}
                              className="text-primary hover:text-primary/80"
                              title="Vista previa"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="bg-gray-100 rounded p-3 text-xs font-mono">
                            <div className="text-gray-600 mb-1">Variables disponibles:</div>
                            <div className="text-gray-800">
                              {plantilla.variables.slice(0, 3).join(', ')}
                              {plantilla.variables.length > 3 && ` +${plantilla.variables.length - 3} más`}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              Creada {new Date(plantilla.fechaCreacion).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => abrirEditor(plantilla)}
                              className="text-gray-600 hover:text-gray-800"
                              title="Editar"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className="text-gray-600 hover:text-gray-800"
                              title="Duplicar"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              onClick={() => onActivarPlantilla(plantilla.id, empresa.id)}
                              className="text-success hover:text-success/80"
                              title="Activar como defecto"
                            >
                              <CheckCircle size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Layout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-sm font-medium text-gray-900 mb-2">No hay plantillas</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Esta empresa aún no tiene plantillas personalizadas
                  </p>
                  <button
                    onClick={() => abrirEditor()}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    Crear primera plantilla
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Editor de Plantillas Modal */}
      {mostrarEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header del Editor */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {plantillaSeleccionada ? 'Editar Plantilla' : 'Nueva Plantilla'}
              </h3>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setEditorMode('visual')}
                    className={`px-3 py-1 text-sm rounded ${editorMode === 'visual' ? 'bg-white shadow-sm' : 'text-gray-600'
                      }`}
                  >
                    Visual
                  </button>
                  <button
                    onClick={() => setEditorMode('html')}
                    className={`px-3 py-1 text-sm rounded ${editorMode === 'html' ? 'bg-white shadow-sm' : 'text-gray-600'
                      }`}
                  >
                    HTML
                  </button>
                </div>
                <button
                  onClick={() => setMostrarEditor(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Panel de Configuración */}
              <div className="w-80 border-r border-gray-200 p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Configuración</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre de la Plantilla
                        </label>
                        <input
                          type="text"
                          value={nuevaPlantilla.nombre || ''}
                          onChange={(e) => setNuevaPlantilla({ ...nuevaPlantilla, nombre: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Nombre descriptivo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Empresa
                        </label>
                        <select
                          value={nuevaPlantilla.empresaId || ''}
                          onChange={(e) => setNuevaPlantilla({ ...nuevaPlantilla, empresaId: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">Seleccionar empresa</option>
                          {empresas.map(empresa => (
                            <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Certificado
                        </label>
                        <select
                          value={nuevaPlantilla.tipoCertificadoId || ''}
                          onChange={(e) => setNuevaPlantilla({ ...nuevaPlantilla, tipoCertificadoId: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">Seleccionar tipo</option>
                          {tiposCertificado.map(tipo => (
                            <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={nuevaPlantilla.esDefecto || false}
                          onChange={(e) => setNuevaPlantilla({ ...nuevaPlantilla, esDefecto: e.target.checked })}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label className="text-sm text-gray-700">Plantilla por defecto</label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Variables Disponibles</h4>
                    <div className="space-y-2">
                      {camposPlantilla.map(campo => (
                        <button
                          key={campo.key}
                          onClick={() => insertarCampo(campo.key)}
                          className="w-full text-left px-3 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-mono text-primary">{campo.key}</div>
                          <div className="text-gray-600">{campo.nombre}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Templates Base</h4>
                    <div className="space-y-2">
                      {templatesPorDefecto.map((template, index) => (
                        <button
                          key={index}
                          onClick={() => setNuevaPlantilla({
                            ...nuevaPlantilla,
                            htmlTemplate: template.contenido
                          })}
                          className="w-full text-left px-3 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium text-gray-900">{template.nombre}</div>
                          <div className="text-gray-600 text-xs">{template.descripcion}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Editor Principal */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 p-6 overflow-auto">
                  {editorMode === 'visual' ? (
                    <div className="border border-gray-200 rounded-lg p-6 bg-white">
                      <div className="prose max-w-none">
                        <div className="whitespace-pre-wrap font-mono text-sm">
                          {nuevaPlantilla.htmlTemplate || 'Selecciona un template base o crea uno nuevo...'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código HTML
                      </label>
                      <textarea
                        id="template-editor"
                        value={nuevaPlantilla.htmlTemplate || ''}
                        onChange={(e) => setNuevaPlantilla({ ...nuevaPlantilla, htmlTemplate: e.target.value })}
                        className="w-full h-96 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                        placeholder="Escribe el código HTML de la plantilla..."
                      />
                    </div>
                  )}
                </div>

                {/* Footer del Editor */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditorMode(editorMode === 'visual' ? 'html' : 'visual')}
                      className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      {editorMode === 'visual' ? <Code size={16} /> : <Eye size={16} />}
                      <span>{editorMode === 'visual' ? 'Ver Código' : 'Vista Previa'}</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setMostrarEditor(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={guardarPlantilla}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Save size={16} />
                      <span>Guardar Plantilla</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
