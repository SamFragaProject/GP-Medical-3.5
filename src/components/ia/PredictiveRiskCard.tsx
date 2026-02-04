import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, BrainCircuit, AlertOctagon, CheckCircle2, RefreshCw } from 'lucide-react';
import { aiService, PredictiveAnalysis } from '@/services/aiService';

interface PredictiveRiskCardProps {
    pacienteId: string;
}

export function PredictiveRiskCard({ pacienteId }: PredictiveRiskCardProps) {
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<PredictiveAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchPrediction = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await aiService.getRiskAnalysis(pacienteId);
            if (result) {
                setAnalysis(result);
            } else {
                setError("No se pudo conectar con el servicio de IA local.");
            }
        } catch (e) {
            setError("Error al procesar la predicción.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (pacienteId) {
            fetchPrediction();
        }
    }, [pacienteId]);

    if (error) {
        return (
            <Card className="border-red-200 bg-red-50">
                <CardContent className="py-4 flex items-center justify-between text-sm text-red-800">
                    <div className="flex items-center gap-2">
                        <AlertOctagon className="h-5 w-5" />
                        {error} (Asegúrate que 'python predictive-service/main.py' esté corriendo)
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchPrediction} className="bg-white hover:bg-red-100 text-red-700 border-red-200">
                        <RefreshCw className="h-4 w-4 mr-2" /> Reintentar
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!analysis && !loading) return null; // O mostrar estado vacío

    return (
        <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-white shadow-sm overflow-hidden">
            <CardHeader className="pb-2 border-b border-indigo-100 bg-white/50">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-indigo-900">
                    <BrainCircuit className="h-5 w-5 text-indigo-600" />
                    Análisis de Riesgo Predictivo (IA)
                    {loading && <Loader2 className="h-4 w-4 animate-spin text-indigo-400 ml-auto" />}
                    {!loading && analysis && (
                        <Badge variant="outline" className="ml-auto bg-indigo-100 text-indigo-700 border-indigo-200">
                            {analysis.model_info}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-6 gap-2 text-indigo-400">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p className="text-sm">Procesando historial médico con CUDA...</p>
                    </div>
                ) : analysis ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Columna Izquierda: Scores */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Nivel de Riesgo General</span>
                                <Badge className={`px-3 py-1 text-base capitalize ${analysis.nivel_riesgo === 'Bajo' ? 'bg-green-500 hover:bg-green-600' :
                                        analysis.nivel_riesgo === 'Medio' ? 'bg-yellow-500 hover:bg-yellow-600' :
                                            analysis.nivel_riesgo === 'Alto' ? 'bg-orange-500 hover:bg-orange-600' :
                                                'bg-red-600 hover:bg-red-700'
                                    }`}>
                                    {analysis.nivel_riesgo}
                                </Badge>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>Score de Riesgo Laboral</span>
                                    <span className="font-bold">{(analysis.score_riesgo * 100).toFixed(1)}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${analysis.score_riesgo > 0.5 ? 'bg-red-500' : 'bg-indigo-500'
                                            }`}
                                        style={{ width: `${analysis.score_riesgo * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>Probabilidad de Lesión (12 meses)</span>
                                    <span className="font-bold">{(analysis.probabilidad_lesion * 100).toFixed(1)}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-orange-400 transition-all duration-1000"
                                        style={{ width: `${analysis.probabilidad_lesion * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha: Recomendaciones */}
                        <div className="bg-white/60 rounded-lg p-4 border border-indigo-100">
                            <h4 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center">
                                <CheckCircle2 className="h-4 w-4 mr-2 text-indigo-600" />
                                Recomendaciones Sugeridas
                            </h4>
                            <ul className="space-y-2">
                                {analysis.recomendaciones.map((rec, idx) => (
                                    <li key={idx} className="text-sm text-gray-700 flex items-start">
                                        <span className="mr-2 text-indigo-400">•</span>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
