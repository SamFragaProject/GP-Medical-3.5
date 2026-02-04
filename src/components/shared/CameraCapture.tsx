import React, { useRef, useState, useCallback } from 'react'
import { Camera, RefreshCw, Check, X, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CameraCaptureProps {
    onCapture: (imageDataUrl: string | null) => void;
    initialImage?: string | null;
}

export function CameraCapture({ onCapture, initialImage }: CameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(initialImage || null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsStreaming(true);
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
            setIsStreaming(false);
        }
    };

    const capturePhoto = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                // Square crop logic
                const video = videoRef.current;
                const size = Math.min(video.videoWidth, video.videoHeight);
                const x = (video.videoWidth - size) / 2;
                const y = (video.videoHeight - size) / 2;

                canvasRef.current.width = 400;
                canvasRef.current.height = 400;

                context.drawImage(video, x, y, size, size, 0, 0, 400, 400);
                const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
                setCapturedImage(dataUrl);
                onCapture(dataUrl);
                stopCamera();
            }
        }
    }, [onCapture]);

    const retakePhoto = () => {
        setCapturedImage(null);
        onCapture(null);
        startCamera();
    };

    return (
        <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
            <div className="relative w-64 h-64 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-inner flex items-center justify-center">
                {capturedImage ? (
                    <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                ) : isStreaming ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover scale-x-[-1]"
                    />
                ) : (
                    <div className="flex flex-col items-center text-slate-400">
                        <User size={64} strokeWidth={1} />
                        <p className="text-xs mt-2 font-medium">Cámara no activa</p>
                    </div>
                )}

                <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="flex gap-2 w-full">
                {!isStreaming && !capturedImage && (
                    <Button onClick={startCamera} className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                        <Camera className="w-4 h-4 mr-2" /> Activar Cámara
                    </Button>
                )}

                {isStreaming && (
                    <Button onClick={capturePhoto} className="flex-1 bg-teal-600 hover:bg-teal-700">
                        <Check className="w-4 h-4 mr-2" /> Capturar Foto
                    </Button>
                )}

                {capturedImage && (
                    <Button variant="outline" onClick={retakePhoto} className="flex-1 border-cyan-200 text-cyan-700 hover:bg-cyan-50">
                        <RefreshCw className="w-4 h-4 mr-2" /> Tomar otra
                    </Button>
                )}

                {isStreaming && (
                    <Button variant="ghost" onClick={stopCamera} className="px-3 hover:bg-red-50 hover:text-red-600">
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>

            <p className="text-[10px] text-slate-500 text-center px-4">
                Capture una fotografía clara del rostro del trabajador/paciente para su expediente.
            </p>
        </div>
    )
}
