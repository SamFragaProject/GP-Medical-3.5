/**
 * FotoPaciente — Upload & display component for patient photo
 */
import React, { useState, useRef } from 'react'
import { Camera, Upload, X, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface FotoPacienteProps {
    currentUrl?: string | null
    nombre: string
    initials: string
    gradient: string
    size?: 'sm' | 'md' | 'lg'
    editable?: boolean
    onPhotoChange?: (url: string) => void
}

export default function FotoPaciente({
    currentUrl,
    nombre,
    initials,
    gradient,
    size = 'lg',
    editable = true,
    onPhotoChange
}: FotoPacienteProps) {
    const [photoUrl, setPhotoUrl] = useState<string | null>(currentUrl || null)
    const [hovering, setHovering] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    const sizeClasses = {
        sm: 'h-16 w-16 text-lg',
        md: 'h-24 w-24 text-2xl',
        lg: 'h-32 w-32 text-3xl',
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Solo se permiten archivos de imagen')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen no debe superar 5 MB')
            return
        }

        const reader = new FileReader()
        reader.onload = (ev) => {
            const url = ev.target?.result as string
            setPhotoUrl(url)
            onPhotoChange?.(url)
            toast.success('Foto actualizada')
        }
        reader.readAsDataURL(file)
    }

    const handleRemove = () => {
        setPhotoUrl(null)
        onPhotoChange?.('')
        toast.success('Foto eliminada')
    }

    return (
        <div className="relative inline-block">
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            <div
                className={`${sizeClasses[size]} rounded-2xl overflow-hidden border-4 border-white/20 shadow-xl relative cursor-pointer group`}
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                onClick={() => editable && fileRef.current?.click()}
            >
                {photoUrl ? (
                    <img
                        src={photoUrl}
                        alt={`Foto de ${nombre}`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black`}>
                        {initials || <User className="w-8 h-8" />}
                    </div>
                )}

                {/* Hover overlay */}
                {editable && hovering && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1 transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                        <span className="text-[9px] text-white font-bold uppercase tracking-wider">
                            {photoUrl ? 'Cambiar' : 'Subir Foto'}
                        </span>
                    </div>
                )}
            </div>

            {/* Remove button */}
            {photoUrl && editable && hovering && (
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        handleRemove()
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
        </div>
    )
}
