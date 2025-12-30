// Componente OrganigramaTree - Visualización de estructura organizacional
import React from 'react'
import { NodoOrganigrama } from '@/types/rrhh'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, ChevronDown, Building2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface OrganigramaTreeProps {
    raiz: NodoOrganigrama | null
    loading?: boolean
}

interface NodoProps {
    nodo: NodoOrganigrama
    level: number
}

function NodoEmpleado({ nodo, level }: NodoProps) {
    const [expanded, setExpanded] = React.useState(level < 2)
    const tieneHijos = nodo.hijos && nodo.hijos.length > 0

    const iniciales = nodo.nombre.split(' ').slice(0, 2).map(n => n[0]).join('')

    return (
        <div className="flex flex-col items-center">
            {/* Línea vertical arriba */}
            {level > 0 && (
                <div className="w-px h-6 bg-gradient-to-b from-primary/40 to-primary/20" />
            )}

            {/* Card del empleado */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: level * 0.1 }}
            >
                <Card
                    className={`
            border-slate-200/60 hover:shadow-lg transition-all cursor-pointer
            ${level === 0 ? 'ring-2 ring-primary/20 shadow-lg' : ''}
          `}
                    onClick={() => tieneHijos && setExpanded(!expanded)}
                >
                    <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                            <Avatar className={`${level === 0 ? 'h-12 w-12' : 'h-10 w-10'} ring-2 ring-primary/10`}>
                                <AvatarImage src={nodo.foto_url} />
                                <AvatarFallback className={`
                  bg-gradient-to-br from-primary/80 to-primary text-white font-semibold
                  ${level === 0 ? 'text-sm' : 'text-xs'}
                `}>
                                    {iniciales}
                                </AvatarFallback>
                            </Avatar>

                            <div className="text-left">
                                <h4 className={`font-semibold text-slate-800 ${level === 0 ? 'text-base' : 'text-sm'}`}>
                                    {nodo.nombre}
                                </h4>
                                <p className="text-xs text-primary font-medium">{nodo.puesto}</p>
                                <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                    <Building2 className="h-3 w-3" />
                                    {nodo.departamento}
                                </div>
                            </div>

                            {tieneHijos && (
                                <ChevronDown
                                    className={`h-4 w-4 text-slate-400 transition-transform ml-2 ${expanded ? 'rotate-180' : ''}`}
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Hijos */}
            {tieneHijos && expanded && (
                <>
                    {/* Línea vertical abajo */}
                    <div className="w-px h-6 bg-gradient-to-b from-primary/20 to-primary/40" />

                    {/* Línea horizontal */}
                    {nodo.hijos.length > 1 && (
                        <div
                            className="h-px bg-primary/30"
                            style={{
                                width: `${Math.min(nodo.hijos.length * 220, 800)}px`,
                                maxWidth: '90vw'
                            }}
                        />
                    )}

                    {/* Contenedor de hijos */}
                    <div className="flex flex-wrap justify-center gap-8 mt-0">
                        {nodo.hijos.map((hijo) => (
                            <NodoEmpleado key={hijo.id} nodo={hijo} level={level + 1} />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export function OrganigramaTree({ raiz, loading }: OrganigramaTreeProps) {
    if (loading) {
        return (
            <div className="flex flex-col items-center py-12">
                <div className="w-48 h-24 bg-slate-100 animate-pulse rounded-lg" />
                <div className="w-px h-8 bg-slate-200 mt-2" />
                <div className="flex gap-8 mt-2">
                    <div className="w-40 h-20 bg-slate-100 animate-pulse rounded-lg" />
                    <div className="w-40 h-20 bg-slate-100 animate-pulse rounded-lg" />
                    <div className="w-40 h-20 bg-slate-100 animate-pulse rounded-lg" />
                </div>
            </div>
        )
    }

    if (!raiz) {
        return (
            <div className="text-center py-12 text-slate-500">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No hay estructura organizacional definida</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto py-8">
            <div className="min-w-max flex justify-center">
                <NodoEmpleado nodo={raiz} level={0} />
            </div>
        </div>
    )
}
