import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreHorizontal, ThumbsUp, MessageSquare, Share2, Download, FileText, BadgeCheck, Clock, Heart } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { comunicadosService, type Comunicado } from '@/services/comunicadosService'
import { useAuth } from '@/contexts/AuthContext'

// Datos demo en caso de no conectar a BD
const DEMO_COMUNICADOS: Comunicado[] = [
    {
        id: '1',
        titulo: 'Actualización MediFlow v3.5',
        mensaje: 'Hemos lanzado la nueva funcionalidad de Extracción Inteligente con Inteligencia Artificial. Ahora puedes importar expedientes médicos completos arrastrando archivos PDF y DOCX en el Hub de Pacientes.',
        tipo: 'update',
        autor_id: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
        archivo_url: 'https://images.unsplash.com/photo-1576091160399-11cbbe989951?q=80&w=2069&auto=format&fit=crop',
    },
    {
        id: '2',
        titulo: 'Mantén tu cuenta segura',
        mensaje: 'Recordatorio mensual: Te recomendamos actualizar tus contraseñas y asegurarte de cerrar sesión en dispositivos compartidos.',
        tipo: 'info',
        autor_id: 'admin',
        is_active: true,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
        id: '3',
        titulo: 'Gran Inauguración de la Nueva Clínica',
        mensaje: 'Nos complace anunciar la apertura de nuestra nueva sucursal. Gracias a todo el equipo por su esfuerzo y dedicación. ¡Los esperamos en el brindis de inauguración!',
        tipo: 'success',
        autor_id: 'admin',
        is_active: true,
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        archivo_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop',
    }
]

export function ComunicadosFeed() {
    const [comunicados, setComunicados] = useState<Comunicado[]>([])
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()

    // Podemos usar el logo de la empresa desde AuthContext/Preferences, o un genérico
    const companyLogo = user?.empresa?.logo_url || '/logo-gp.png'
    const companyName = user?.empresa?.nombre || 'GPMedical'

    useEffect(() => {
        const fetchComunicados = async () => {
            try {
                const data = await comunicadosService.getActiveFeed()
                setComunicados(data.length > 0 ? data : DEMO_COMUNICADOS)
            } catch (err) {
                console.warn('Usando comunicados demo por error de conexión')
                setComunicados(DEMO_COMUNICADOS)
            } finally {
                setLoading(false)
            }
        }
        fetchComunicados()
    }, [])

    if (loading) {
        return (
            <div className="animate-pulse space-y-6 w-full">
                <div className="h-48 bg-slate-100/50 rounded-[2rem] w-full mt-4" />
                <div className="h-48 bg-slate-100/50 rounded-[2rem] w-full" />
            </div>
        )
    }

    if (comunicados.length === 0) return null

    // Componente interno para manejar los likes animaditos
    const LikeButton = ({ initialLikes }: { initialLikes: number }) => {
        const [liked, setLiked] = useState(false)
        const [likes, setLikes] = useState(initialLikes)
        const [clickAnim, setClickAnim] = useState(false)

        const handleLike = () => {
            setLiked(!liked)
            setLikes(liked ? likes - 1 : likes + 1)
            setClickAnim(true)
            setTimeout(() => setClickAnim(false), 300)
        }

        return (
            <button
                onClick={handleLike}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[14px] font-bold transition-all ${liked ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-500 hover:text-slate-700'
                    }`}
            >
                <motion.div
                    animate={clickAnim ? { scale: [1, 1.4, 1], rotate: [0, -15, 0] } : {}}
                    transition={{ duration: 0.3 }}
                >
                    <ThumbsUp className={`w-5 h-5 ${liked ? 'fill-blue-600 border-none' : ''}`} />
                </motion.div>
                Me gusta {liked && <span className="text-xs bg-blue-100 px-1.5 py-0.5 rounded-md ml-1">{likes}</span>}
            </button>
        )
    }

    return (
        <div className="space-y-6 w-full pb-10">
            <h3 className="text-xl font-black text-slate-800 mb-6 tracking-tight px-2 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <MessageSquare className="w-4 h-4 text-white" />
                </div>
                Feed Corporativo
            </h3>

            <AnimatePresence>
                {comunicados.map((item, i) => {
                    const fakeLikes = Math.floor(Math.random() * 50) + 12;
                    const fakeComments = Math.floor(Math.random() * 10);

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: i * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                            className="bg-white border text-slate-900 shadow-xl shadow-slate-900/5 rounded-[2rem] overflow-hidden border-slate-100 group hover:border-blue-100 relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                            {/* Facebook Post Header */}
                            <div className="p-6 pb-4 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center p-1 shadow-inner relative">
                                        <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <img
                                            src={companyLogo}
                                            alt={companyName}
                                            className="w-full h-full object-contain relative z-10 scale-95"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=GP&background=random'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5 cursor-pointer">
                                            <span className="font-black text-[16px] text-slate-800 hover:text-blue-600 transition-colors">{companyName}</span>
                                            <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/10" />
                                        </div>
                                        <div className="flex items-center text-xs text-slate-400 font-medium mt-0.5">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: es })}
                                            </span>
                                            <span className="mx-2 text-slate-300">•</span>
                                            <span className="capitalize bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 text-[10px] font-bold tracking-wider">{item.tipo}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Post Content */}
                            <div className="px-6 pb-4">
                                <h3 className="text-lg font-black text-slate-900 mb-2 leading-snug">{item.titulo}</h3>
                                <p className="text-[15px] text-slate-600 whitespace-pre-wrap leading-relaxed">
                                    {item.mensaje}
                                </p>
                            </div>

                            {/* Attachement / Media (If any) */}
                            {item.archivo_url && (
                                <div className="mb-4 px-6">
                                    {item.archivo_url.match(/\.(jpeg|jpg|gif|png|webp)$/i) || item.archivo_url.includes('unsplash.com') ? (
                                        <div className="w-full relative group/image cursor-pointer overflow-hidden rounded-2xl shadow-md" onClick={() => window.open(item.archivo_url, '_blank')}>
                                            <div className="absolute inset-0 bg-slate-900/10 group-hover/image:bg-transparent transition-colors z-10" />
                                            <img
                                                src={item.archivo_url}
                                                alt="Media"
                                                className="w-full h-auto max-h-[350px] object-cover 2xl:max-h-[450px] group-hover/image:scale-105 transition-transform duration-700"
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className="w-[calc(100%-3rem)] mx-auto border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-2xl cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col items-center justify-center group/file"
                                            onClick={() => window.open(item.archivo_url, '_blank')}
                                        >
                                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover/file:scale-110 transition-transform">
                                                <FileText className="w-8 h-8 text-blue-500" />
                                            </div>
                                            <span className="font-black text-[15px] text-blue-900">{item.archivo_nombre || 'Documento Oficial'}</span>
                                            <span className="text-xs text-blue-600/70 font-bold uppercase tracking-widest mt-2 flex items-center gap-1">
                                                <Download className="w-3.5 h-3.5" /> Descargar Archivo
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Engagement stats */}
                            <div className="px-6 py-3 flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-100/60 mx-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center -space-x-1">
                                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white z-20 shadow-sm">
                                            <ThumbsUp className="w-3 h-3 text-white fill-white" />
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center border-2 border-white z-10 shadow-sm">
                                            <Heart className="w-3 h-3 text-white fill-white" />
                                        </div>
                                    </div>
                                    <span className="hover:underline cursor-pointer">{fakeLikes} interacciones</span>
                                </div>
                                <span className="hover:underline cursor-pointer">{fakeComments} comentarios</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="px-4 py-2 flex items-center justify-between gap-2 mb-1 bg-slate-50/30">
                                <LikeButton initialLikes={fakeLikes} />
                                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-700 font-bold text-[14px] transition-colors">
                                    <MessageSquare className="w-5 h-5" />
                                    Comentar
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-700 font-bold text-[14px] transition-colors">
                                    <Share2 className="w-5 h-5" />
                                    Compartir
                                </button>
                            </div>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}
