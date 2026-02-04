import React, { useState } from 'react';
import { useGPMedical } from '@/providers/GPMedicalProvider';
import { MedicalSchemas } from '@/lib/dataExtractionService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain,
    Search,
    CheckCircle2,
    AlertCircle,
    Zap,
    FileJson,
    History,
    Terminal,
    RefreshCw,
    ShieldCheck,
    Stethoscope
} from 'lucide-react';

export function AIWorkbench() {
    const { extractor, ai, handleError } = useGPMedical();
    const [inputText, setInputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState('input');

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

    const handleExtract = async (type: 'receta' | 'laboratorio') => {
        if (!inputText.trim()) {
            handleError('Por favor ingresa un texto para analizar', 'AI Workbench');
            return;
        }

        setIsProcessing(true);
        setResult(null);
        setLogs([]);
        setActiveTab('process');

        addLog(`Iniciando extracción de tipo: ${type}`);
        addLog(`Usando OpenAI GPT-4o para máxima precisión`);

        try {
            const schema = (type === 'receta' ? MedicalSchemas.receta : MedicalSchemas.laboratorio) as any;
            const instruction = type === 'receta'
                ? 'Extrae los medicamentos y el diagnóstico del paciente.'
                : 'Extrae todos los parámetros de laboratorio con sus valores y unidades.';

            addLog('Enviando texto a la IA...');

            const data = await extractor.extract(inputText, schema, instruction);

            addLog('✅ Validación Zod exitosa');
            addLog('✅ Datos estructurados correctamente');

            setResult(data);
            setActiveTab('result');
        } catch (error: any) {
            addLog(`❌ Error detectado: ${error.message}`);
            // El error ya fue manejado por el provider (toast), aquí solo limpiamos ui
        } finally {
            setIsProcessing(false);
        }
    };

    const loadExample = (type: 'receta' | 'laboratorio') => {
        if (type === 'receta') {
            setInputText(`Paciente: Juan Pérez. Presenta cuadro de faringoamigdalitis severa. 
Tratamiento:
1. Amoxicilina con ácido clavulánico 875/125mg cada 12 horas por 7 días.
2. Paracetamol 500mg cada 8 horas por 3 días si hay fiebre.
3. Desloratadina 5mg una tableta por las noches por 10 días.`);
        } else {
            setInputText(`Biometría Hemática Completa
Resultados:
Glóbulos Rojos: 4.8 M/uL (Ref: 4.5 - 5.5)
Hemoglobina: 14.2 g/dL (Ref: 13.5 - 17.5)
Hematocrito: 42%
Leucocitos: 12,500 /uL (ALTO)
Plaquetas: 250,000 /uL
Glucosa en ayuno: 110 mg/dL (PREDIABETES)`);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        AI Workbench Profesional
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Motor de extracción médica nivel producción con validación post-procesamiento.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="px-3 py-1 bg-green-50 text-green-700 border-green-100 font-bold">
                        <ShieldCheck className="w-4 h-4 mr-1" /> Anti-Error Activo
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-100 font-bold">
                        <Zap className="w-4 h-4 mr-1" /> GPT-4o Ready
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Panel Izquierdo: Entrada */}
                <Card className="lg:col-span-12 border-slate-200 shadow-xl overflow-hidden bg-white/50 backdrop-blur-sm">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="bg-slate-50 border-b border-slate-200 px-6 pt-4 flex items-center justify-between">
                            <TabsList className="bg-slate-100 border-slate-200">
                                <TabsTrigger value="input" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <Search className="w-4 h-4 mr-2" /> Entrada de Texto
                                </TabsTrigger>
                                <TabsTrigger value="process" className="data-[state=active]:bg-white data-[state=active]:shadow-sm" disabled={!isProcessing && logs.length === 0}>
                                    <Terminal className="w-4 h-4 mr-2" /> Proceso IA
                                </TabsTrigger>
                                <TabsTrigger value="result" className="data-[state=active]:bg-white data-[state=active]:shadow-sm" disabled={!result}>
                                    <FileJson className="w-4 h-4 mr-2" /> Datos Validados
                                </TabsTrigger>
                            </TabsList>

                            <div className="flex gap-2 mb-2">
                                <Button variant="ghost" size="sm" onClick={() => loadExample('receta')} className="text-indigo-600 hover:text-indigo-700 hover:bg-white underline-offset-4">
                                    Ejemplo Receta
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => loadExample('laboratorio')} className="text-indigo-600 hover:text-indigo-700 hover:bg-white underline-offset-4">
                                    Ejemplo Lab
                                </Button>
                            </div>
                        </div>

                        <TabsContent value="input" className="p-0 animate-in fade-in duration-500">
                            <div className="p-6">
                                <div className="relative">
                                    <Textarea
                                        placeholder="Pega aquí una nota médica, resultado de laboratorio o receta..."
                                        className="min-h-[250px] text-lg p-6 bg-white border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl transition-all shadow-inner"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                    />
                                    <div className="absolute top-4 right-4 opacity-10">
                                        <Stethoscope className="w-24 h-24 text-slate-900" />
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="h-14 px-8 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
                                        onClick={() => setInputText('')}
                                    >
                                        <RefreshCw className="w-5 h-5 mr-3" /> Limpiar
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        onClick={() => handleExtract('receta')}
                                        disabled={isProcessing}
                                        className="h-14 px-8 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 border rounded-xl font-bold"
                                    >
                                        <Brain className="w-5 h-5 mr-3" /> Analizar como Receta
                                    </Button>
                                    <Button
                                        size="lg"
                                        onClick={() => handleExtract('laboratorio')}
                                        disabled={isProcessing}
                                        className="h-14 px-8 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg shadow-indigo-500/20 rounded-xl font-bold"
                                    >
                                        {isProcessing ? (
                                            <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                                        ) : (
                                            <Zap className="w-5 h-5 mr-3" />
                                        )}
                                        Extraer Datos de Laboratorio
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="process" className="p-6 bg-slate-900 text-green-400 min-h-[350px] rounded-b-xl font-mono">
                            <div className="h-[300px] overflow-auto pr-2 scrollbar-thin scrollbar-thumb-green-500/20">
                                <AnimatePresence>
                                    {logs.map((log, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="mb-2 text-sm md:text-base border-l-2 border-green-500/30 pl-4 py-1 hover:bg-white/5 transition-colors"
                                        >
                                            {log}
                                        </motion.div>
                                    ))}
                                    {isProcessing && (
                                        <motion.div
                                            animate={{ opacity: [0, 1] }}
                                            transition={{ repeat: Infinity, duration: 0.8 }}
                                            className="inline-block w-2 h-4 bg-green-500 ml-1"
                                        />
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center bg-transparent">
                                <span className="text-xs text-white/50 uppercase tracking-widest">IA Workbench Monitor</span>
                                {isProcessing && <Badge className="animate-pulse bg-indigo-500">Procesando con GPT-4o...</Badge>}
                            </div>
                        </TabsContent>

                        <TabsContent value="result" className="p-6 bg-slate-50 min-h-[400px]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Result JSON code */}
                                <Card className="border-slate-200 shadow-sm overflow-hidden">
                                    <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">JSON Estructurado</span>
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    </div>
                                    <pre className="p-6 overflow-auto text-sm h-[350px] bg-white text-indigo-900">
                                        {JSON.stringify(result, null, 2)}
                                    </pre>
                                </Card>

                                {/* Patient-Friendly View */}
                                <Card className="border-indigo-100 shadow-md overflow-hidden bg-white">
                                    <div className="bg-indigo-600 px-4 py-2 border-b border-indigo-700 flex items-center justify-between">
                                        <span className="text-xs font-bold text-white uppercase tracking-wider">Resumen para Médico</span>
                                        <History className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="p-6 space-y-6 h-[350px] overflow-auto">
                                        {result?.paciente && (
                                            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="p-3 bg-indigo-100 rounded-full">
                                                    <Stethoscope className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-500 uppercase">Paciente Detectado</h4>
                                                    <p className="text-xl font-bold text-indigo-900">{result.paciente}</p>
                                                </div>
                                            </div>
                                        )}

                                        {result?.medicamentos && (
                                            <div className="space-y-3">
                                                <h4 className="font-bold text-slate-900 flex items-center">
                                                    <Badge className="mr-2 bg-indigo-100 text-indigo-700 border-none">
                                                        {result.medicamentos.length}
                                                    </Badge>
                                                    Medicamentos en Receta
                                                </h4>
                                                <div className="grid gap-3">
                                                    {result.medicamentos.map((m: any, i: number) => (
                                                        <div key={i} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-indigo-200 transition-colors">
                                                            <p className="font-bold text-indigo-600 text-lg">{m.nombre}</p>
                                                            <div className="flex gap-4 mt-2 text-sm text-slate-500">
                                                                <span><strong>Dosis:</strong> {m.dosis}</span>
                                                                <span><strong>Frec:</strong> {m.frecuencia}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {result?.resultados && (
                                            <div className="space-y-3">
                                                <h4 className="font-bold text-slate-900">Resultados de Laboratorio</h4>
                                                <div className="overflow-hidden rounded-xl border border-slate-100 shadow-sm">
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                                                            <tr>
                                                                <th className="px-4 py-3">Parámetro</th>
                                                                <th className="px-4 py-3">Valor</th>
                                                                <th className="px-4 py-3">Estado</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {result.resultados.map((r: any, i: number) => (
                                                                <tr key={i} className="hover:bg-slate-50">
                                                                    <td className="px-4 py-3 font-medium text-slate-700">{r.parametro}</td>
                                                                    <td className="px-4 py-3 font-bold text-indigo-600">{r.valor} {r.unidad}</td>
                                                                    <td className="px-4 py-3">
                                                                        {r.estado === 'alto' || r.estado === 'bajo' ? (
                                                                            <Badge variant="destructive" className="bg-red-50 text-red-600 border-red-100">
                                                                                Fuera de Rango
                                                                            </Badge>
                                                                        ) : (
                                                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100">
                                                                                Normal
                                                                            </Badge>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </Card>

                {/* Info Cards */}
                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-none shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Brain className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-lg">Validación Zod</h3>
                            </div>
                            <p className="text-indigo-100 text-sm leading-relaxed">
                                Cada respuesta de la IA es verificada contra un esquema estricto de tipos. Si la IA "alucina", el sistema rechaza el dato y solicita corrección.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4 font-bold text-slate-900">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <AlertCircle className="w-6 h-6 text-orange-600" />
                                </div>
                                <h3 className="font-bold text-lg">Auto-Corrección</h3>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                El motor detecta fallos de formato JSON y los repara en tiempo real enviando el feedback del error a la IA de manera transparente para el usuario.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="p-6 text-slate-900 font-bold">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Zap className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="font-bold text-lg">Multi-Proveedor</h3>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Resiliencia total: Si la API de OpenAI falla por cuotas o red, el sistema intenta automáticamente con Google Gemini antes de informar al usuario.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
