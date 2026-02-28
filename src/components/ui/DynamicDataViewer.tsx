import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface DynamicDataViewerProps {
    data: any;
    title?: string;
}

export default function DynamicDataViewer({ data, title }: DynamicDataViewerProps) {
    if (!data || Object.keys(data).length === 0) return <div className="text-slate-500 italic">No hay datos extraídos disponibles</div>;

    const formatKey = (key: string) => {
        const result = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
        return result.charAt(0).toUpperCase() + result.slice(1);
    };

    const renderValue = (value: any, key: string): React.ReactNode => {
        if (value === null || value === undefined || value === '') return <span className="text-slate-400">—</span>;

        if (typeof value === 'boolean') {
            return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${value ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{value ? 'Sí' : 'No'}</span>;
        }

        if (typeof value === 'string' || typeof value === 'number') {
            return <span className="text-slate-700 font-medium break-words leading-relaxed">{value.toString()}</span>;
        }

        if (Array.isArray(value)) {
            if (value.length === 0) return <span className="text-slate-400 italic">Vacío</span>;

            // If it's an array of objects
            if (typeof value[0] === 'object' && value[0] !== null) {
                return (
                    <div className="space-y-3 w-full mt-2">
                        {value.map((item, index) => (
                            <div key={index} className="bg-slate-50/80 border border-slate-100 p-4 rounded-xl shadow-sm">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Object.entries(item).map(([k, v]) => {
                                        if (k === 'visualizationType') return null; // Skip metadata
                                        return (
                                            <div key={k} className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{formatKey(k)}</span>
                                                <div className="text-sm">{renderValue(v, k)}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }

            // If it's an array of primitive strings/numbers
            return (
                <ul className="list-disc list-inside space-y-1 mt-1 text-slate-700 text-sm">
                    {value.map((item, index) => (
                        <li key={index} className="leading-relaxed">{item}</li>
                    ))}
                </ul>
            );
        }

        if (typeof value === 'object') {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 w-full">
                    {Object.entries(value).map(([k, v]) => {
                        // Omit empty objects
                        if (typeof v === 'object' && v !== null && Object.keys(v).length === 0) return null;
                        // Avoid rendering false booleans as massive empty spaces if they are part of a massive toggle list
                        if (typeof v === 'boolean' && !v) return null;

                        return (
                            <div key={k} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{formatKey(k)}</span>
                                <div className="text-sm">{renderValue(v, k)}</div>
                            </div>
                        );
                    })}
                </div>
            );
        }

        return <span>{JSON.stringify(value)}</span>;
    };

    return (
        <Card className="border-0 shadow-sm ring-1 ring-slate-100/50 bg-white/80 backdrop-blur-md overflow-hidden h-full flex flex-col">
            {title && (
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 shrink-0">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        {title}
                    </CardTitle>
                </CardHeader>
            )}
            <CardContent className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="space-y-8">
                    {Object.entries(data).map(([key, value]) => {
                        if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) return null;

                        return (
                            <div key={key} className="flex flex-col items-start w-full group">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400/50 group-hover:bg-blue-500 transition-colors"></span>
                                    {formatKey(key)}
                                </h3>
                                <div className="w-full pl-4 border-l-2 border-slate-100 group-hover:border-blue-200 transition-colors">
                                    {renderValue(value, key)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
