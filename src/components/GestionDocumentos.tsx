// Componente para Gestión de Documentos Médicos
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileText,
  Download,
  Eye,
  Trash2,
  Image,
  File,
  FileSpreadsheet,
  FileVideo,
  FileAudio,
  Filter,
  Search,
  Plus,
  Check,
  AlertTriangle,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

export interface DocumentoMedico {
  id: string
  nombre: string
  tipo_documento: string
  fecha_subida: string
  url: string
  estado: 'vigente' | 'vencido' | 'pendiente' | 'revisado'
  tamaño: number
  extension: string
  subido_por: string
  categoria: 'examen_medico' | 'certificado' | 'receta' | 'laboratorio' | 'imagen' | 'incapacidad' | 'otro'
  descripcion?: string
  fecha_vencimiento?: string
  tags?: string[]
}

interface GestionDocumentosProps {
  pacienteId: string
  documentos: DocumentoMedico[]
  onUpload?: (files: FileList) => void
  onDelete?: (documentoId: string) => void
  onView?: (documento: DocumentoMedico) => void
  onDownload?: (documento: DocumentoMedico) => void
}

const getFileIcon = (extension: string, categoria: string) => {
  if (categoria === 'imagen') return <Image className="h-8 w-8 text-blue-500" />
  
  switch (extension.toLowerCase()) {
    case 'pdf':
      return <FileText className="h-8 w-8 text-red-500" />
    case 'doc':
    case 'docx':
      return <FileText className="h-8 w-8 text-blue-500" />
    case 'xls':
    case 'xlsx':
      return <FileSpreadsheet className="h-8 w-8 text-green-500" />
    case 'mp4':
    case 'avi':
    case 'mov':
      return <FileVideo className="h-8 w-8 text-purple-500" />
    case 'mp3':
    case 'wav':
      return <FileAudio className="h-8 w-8 text-orange-500" />
    default:
      return <File className="h-8 w-8 text-gray-500" />
  }
}

const getStatusBadge = (estado: string, fechaVencimiento?: string) => {
  const hoy = new Date()
  const vencimiento = fechaVencimiento ? new Date(fechaVencimiento) : null
  const estaVencido = vencimiento && vencimiento < hoy

  switch (estado) {
    case 'vigente':
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <Check className="h-3 w-3 mr-1" />
          Vigente
        </Badge>
      )
    case 'vencido':
      return (
        <Badge variant="destructive">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Vencido
        </Badge>
      )
    case 'pendiente':
      return (
        <Badge variant="outline" className="text-yellow-600">
          <Clock className="h-3 w-3 mr-1" />
          Pendiente
        </Badge>
      )
    case 'revisado':
      return (
        <Badge variant="secondary">
          <Check className="h-3 w-3 mr-1" />
          Revisado
        </Badge>
      )
    default:
      return (
        <Badge variant="outline">
          {estado}
        </Badge>
      )
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function GestionDocumentos({ 
  pacienteId, 
  documentos, 
  onUpload, 
  onDelete, 
  onView, 
  onDownload 
}: GestionDocumentosProps) {
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos')
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // Filtrar documentos
  const documentosFiltrados = documentos.filter(doc => {
    const matchesSearch = doc.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tipo_documento.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategoria = filtroCategoria === 'todos' || doc.categoria === filtroCategoria
    const matchesEstado = filtroEstado === 'todos' || doc.estado === filtroEstado

    return matchesSearch && matchesCategoria && matchesEstado
  })

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0] && onUpload) {
      onUpload(e.dataTransfer.files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onUpload) {
      onUpload(e.target.files)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Documentos Médicos</h3>
          <p className="text-sm text-gray-600">
            {documentos.length} documento{documentos.length !== 1 ? 's' : ''} registrado{documentos.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Upload className="mr-2 h-4 w-4" />
              Subir Documento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Subir Nuevo Documento</DialogTitle>
              <DialogDescription>
                Selecciona o arrastra archivos para subir al expediente del paciente
              </DialogDescription>
            </DialogHeader>
            
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">
                Arrastra archivos aquí o
              </p>
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer">
                  Seleccionar archivos
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xls,.xlsx"
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">
                PDF, DOC, imágenes, Excel hasta 10MB
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar documentos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las categorías</SelectItem>
                <SelectItem value="examen_medico">Exámenes Médicos</SelectItem>
                <SelectItem value="certificado">Certificados</SelectItem>
                <SelectItem value="laboratorio">Laboratorios</SelectItem>
                <SelectItem value="imagen">Imágenes</SelectItem>
                <SelectItem value="incapacidad">Incapacidades</SelectItem>
                <SelectItem value="receta">Recetas</SelectItem>
                <SelectItem value="otro">Otros</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="vigente">Vigente</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="revisado">Revisado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de documentos */}
      <div className="grid gap-4">
        <AnimatePresence>
          {documentosFiltrados.map((documento, index) => (
            <motion.div
              key={documento.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getFileIcon(documento.extension, documento.categoria)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {documento.nombre}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span>{documento.tipo_documento}</span>
                          <span>{formatFileSize(documento.tamaño)}</span>
                          <span>
                            Subido: {format(new Date(documento.fecha_subida), 'dd/MM/yyyy', { locale: es })}
                          </span>
                          <span>Por: {documento.subido_por}</span>
                        </div>
                        
                        {documento.descripcion && (
                          <p className="text-sm text-gray-600 mt-1">
                            {documento.descripcion}
                          </p>
                        )}
                        
                        {documento.fecha_vencimiento && (
                          <p className="text-sm text-orange-600 mt-1">
                            Vence: {format(new Date(documento.fecha_vencimiento), 'dd/MM/yyyy', { locale: es })}
                          </p>
                        )}
                        
                        {documento.tags && documento.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {documento.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(documento.estado, documento.fecha_vencimiento)}
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onView?.(documento)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownload?.(documento)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete?.(documento.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {documentosFiltrados.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No se encontraron documentos
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || filtroCategoria !== 'todos' || filtroEstado !== 'todos'
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Sube el primer documento médico para este paciente'
                  }
                </p>
                {!searchQuery && filtroCategoria === 'todos' && filtroEstado === 'todos' && (
                  <Button
                    className="mt-4 bg-primary hover:bg-primary/90"
                    onClick={() => setShowUploadDialog(true)}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Documento
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
