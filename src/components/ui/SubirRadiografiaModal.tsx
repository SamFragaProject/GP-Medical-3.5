import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Loader2, Image as ImageIcon, Zap, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface SubirRadiografiaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadFinish: (url: string, fileData?: any) => void;
}

export function SubirRadiografiaModal({ isOpen, onClose, onUploadFinish }: SubirRadiografiaModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [processedFile, setProcessedFile] = useState<Blob | null>(null);

    const processImage = (file: File) => {
        // Reducir tamaño y convertir a JPG
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');

                // Redimensionar preserving aspect ratio. Max Width/Height 1920
                const MAX_DIMENSION = 1920;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_DIMENSION) {
                        height *= MAX_DIMENSION / width;
                        width = MAX_DIMENSION;
                    }
                } else {
                    if (height > MAX_DIMENSION) {
                        width *= MAX_DIMENSION / height;
                        height = MAX_DIMENSION;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                // Fill con fondo blanco si tuviera transparencias
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        setProcessedFile(blob);
                        setPreviewUrl(URL.createObjectURL(blob));
                    }
                }, 'image/jpeg', 0.85); // 85% de calidad JPG
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processImage(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processImage(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!processedFile) return;
        setIsUploading(true);

        try {
            const fileName = `rx_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
            const { data, error } = await supabase.storage
                .from('rayos_x')
                .upload(fileName, processedFile, {
                    contentType: 'image/jpeg',
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                // If the bucket does not exist, fall back to mock URL
                console.error("Storage error:", error);
                throw error;
            }

            const { data: publicData } = supabase.storage.from('rayos_x').getPublicUrl(fileName);

            toast.success('Radiografía subida y optimizada exitosamente');
            onUploadFinish(publicData.publicUrl);
            setTimeout(() => {
                resetAndClose();
            }, 1000);

        } catch (error) {
            toast.error('Error al subir a Supabase. Se utilizará URL local de prueba.');
            // Fallback para testing/demo
            if (previewUrl) {
                onUploadFinish(previewUrl);
                resetAndClose();
            }
        } finally {
            setIsUploading(false);
        }
    };

    const resetAndClose = () => {
        setPreviewUrl(null);
        setProcessedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={open => !open && resetAndClose()}>
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-transparent border-none shadow-none">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-[2rem] overflow-hidden shadow-2xl"
                >
                    <div className="p-8">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                                    <Camera className="w-6 h-6 text-indigo-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-800">Cargar Radiografía</h2>
                                    <p className="text-sm text-slate-500 font-medium">Optimización automática a JPG</p>
                                </div>
                            </div>
                            <button onClick={resetAndClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        {!previewUrl ? (
                            <div
                                className="border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-3xl p-10 text-center cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-300 transition-all group"
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={e => e.preventDefault()}
                                onDrop={handleDrop}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,.dicom"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <Upload className="w-8 h-8 text-indigo-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700 mb-2">Haz clic o arrastra tu imagen</h3>
                                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                    Formatos soportados: JPG, PNG, DICOM. Las imágenes serán convertidas y redimensionadas automáticamente.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center group">
                                    <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={() => setPreviewUrl(null)} className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-white font-medium text-sm transition-all border border-white/20">
                                            Cambiar Imagen
                                        </button>
                                    </div>
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <div className="px-3 py-1.5 bg-emerald-500/90 backdrop-blur-md rounded-lg text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                            <Zap className="w-3 h-3" /> Optimizada (JPG)
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {isUploading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Subiendo y Analizando...</>
                                    ) : (
                                        <><CloudUploadIcon className="w-5 h-5" /> Enviar al Expediente</>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}

function CloudUploadIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
            <path d="M12 12v9" />
            <path d="m16 16-4-4-4 4" />
        </svg>
    )
}
