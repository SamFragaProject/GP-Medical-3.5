import React, { useCallback } from 'react';
import { Upload, FileText, X, FileArchive } from 'lucide-react';

interface FileUploaderProps {
    files: File[];
    setFiles: React.Dispatch<React.SetStateAction<File[]>>;
    disabled?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ files, setFiles, disabled }) => {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const newFiles = Array.from(event.target.files);
            setFiles((prev) => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (disabled) return;
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files);
            setFiles((prev) => [...prev, ...newFiles]);
        }
    }, [disabled, setFiles]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div className="w-full">
            <div
                className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors duration-200 min-h-[120px] flex flex-col justify-center ${disabled ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'bg-brand-50 border-brand-500 hover:bg-brand-100 cursor-pointer'
                    }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    multiple
                    accept="application/pdf,image/*,.zip,application/zip,application/x-zip-compressed"
                    onChange={handleFileChange}
                    disabled={disabled}
                />
                <label htmlFor="file-upload" className={`flex flex-col items-center justify-center w-full h-full ${disabled ? 'pointer-events-none' : 'cursor-pointer'}`}>
                    <div className="bg-white p-2 rounded-full shadow-sm mb-1.5">
                        <Upload className={`w-4 h-4 ${disabled ? 'text-gray-400' : 'text-brand-600'}`} />
                    </div>
                    <p className={`text-xs font-semibold ${disabled ? 'text-gray-500' : 'text-gray-900'}`}>
                        Haz clic o arrastra archivos aquí
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                        PDF, Imágenes o <strong>ZIP (Carpetas Masivas)</strong>
                    </p>
                </label>
            </div>

            {files.length > 0 && (
                <div className="mt-2 space-y-1.5 max-h-[100px] overflow-y-auto custom-scrollbar">
                    <h4 className="text-[10px] font-medium text-gray-700 mb-1">Seleccionados ({files.length})</h4>
                    <div className="grid grid-cols-1 gap-1.5">
                        {files.map((file, index) => (
                            <div key={`${file.name}-${index}`} className="flex items-center justify-between bg-white p-1.5 rounded border border-gray-200 shadow-sm">
                                <div className="flex items-center overflow-hidden">
                                    {file.name.endsWith('.zip') ? (
                                        <FileArchive className="w-3 h-3 text-amber-500 mr-2 flex-shrink-0" />
                                    ) : (
                                        <FileText className="w-3 h-3 text-brand-500 mr-2 flex-shrink-0" />
                                    )}
                                    <span className="text-[10px] text-gray-700 truncate" title={file.name}>{file.name}</span>
                                </div>
                                {!disabled && (
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="ml-2 p-0.5 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
