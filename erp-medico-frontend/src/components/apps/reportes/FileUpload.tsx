import React, { useState, useRef } from 'react';

interface FileUploadProps {
    onLabFileChange: (file: File | null) => void;
    onAudioFileChange: (file: File | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onLabFileChange, onAudioFileChange }) => {
    const [labFile, setLabFile] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [isDraggingLab, setIsDraggingLab] = useState(false);
    const [isDraggingAudio, setIsDraggingAudio] = useState(false);

    const labInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, callback: (file: File | null) => void, setFile: (file: File | null) => void) => {
        const file = e.target.files ? e.target.files[0] : null;
        setFile(file);
        callback(file);
    };

    const handleDragEvent = (e: React.DragEvent<HTMLDivElement>, isEntering: boolean, setDragging: (is: boolean) => void) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(isEntering);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, callback: (file: File | null) => void, setFile: (file: File | null) => void, setDragging: (is: boolean) => void) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === "application/pdf") {
                setFile(file);
                callback(file);
            } else {
                alert("Por favor, sube un archivo PDF.");
            }
        }
    };

    const removeFile = (callback: (file: File | null) => void, setFile: (file: File | null) => void, inputRef: React.RefObject<HTMLInputElement>) => {
        setFile(null);
        callback(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const renderDropZone = (
        id: string,
        label: string,
        file: File | null,
        isDragging: boolean,
        setIsDragging: (is: boolean) => void,
        onFileChange: (file: File | null) => void,
        setFile: (file: File | null) => void,
        inputRef: React.RefObject<HTMLInputElement>,
        colorTheme: { text: string, border: string }
    ) => (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            <div
                onDragEnter={(e) => handleDragEvent(e, true, setIsDragging)}
                onDragLeave={(e) => handleDragEvent(e, false, setIsDragging)}
                onDragOver={(e) => handleDragEvent(e, true, setIsDragging)}
                onDrop={(e) => handleDrop(e, onFileChange, setFile, setIsDragging)}
                onClick={() => inputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center w-full h-24 p-4 text-center bg-white border-2 border-dashed rounded-lg cursor-pointer transition-colors
        ${isDragging ? colorTheme.border : 'border-gray-300'} 
        ${!file ? 'hover:bg-gray-50' : ''}`}
            >
                <input
                    ref={inputRef}
                    id={id}
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, onFileChange, setFile)}
                    className="hidden"
                />
                {!file ? (
                    <div className="text-sm text-gray-500">
                        <svg className="w-6 h-6 mx-auto mb-1 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" /></svg>
                        <p>Arrastra y suelta o <span className={`font-semibold ${colorTheme.text}`}>haz clic</span></p>
                    </div>
                ) : (
                    <div className="text-sm text-gray-700">
                        <p className="font-semibold truncate max-w-full px-2">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                        <button
                            onClick={(e) => { e.stopPropagation(); removeFile(onFileChange, setFile, inputRef); }}
                            className={`mt-2 text-xs font-bold text-red-600 hover:text-red-800`}
                        >
                            Quitar archivo
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 gap-4">
            {renderDropZone(
                "lab-results",
                "1. Archivo de Laboratorios (PDF)",
                labFile,
                isDraggingLab,
                setIsDraggingLab,
                onLabFileChange,
                setLabFile,
                labInputRef,
                { text: 'text-blue-700', border: 'border-blue-500' }
            )}
            {renderDropZone(
                "audiometry",
                "2. Archivo de Audiometría (PDF)",
                audioFile,
                isDraggingAudio,
                setIsDraggingAudio,
                onAudioFileChange,
                setAudioFile,
                audioInputRef,
                { text: 'text-green-700', border: 'border-green-500' }
            )}
        </div>
    );
};

export default FileUpload;
