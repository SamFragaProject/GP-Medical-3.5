import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Brain, FileText, CheckCircle, Users, BarChart2,
    Clock, AlertTriangle, Send, Search, ChevronRight,
    ClipboardList
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSystemIntegration } from '@/contexts/SystemIntegrationContext';
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { useCurrentUser } from '@/hooks/useCurrentUserDemo';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PsicometriaTest {
    id: string;
    nombre: string;
    categoria: 'personalidad' | 'aptitud' | 'riesgo' | 'clima';
    duracion: number; // minutos
    preguntas: number;
    asignados: number;
    completados: number;
}

const TESTS_DEMO: PsicometriaTest[] = [
    { id: '1', nombre: 'Evaluación NOM-035', categoria: 'riesgo', duracion: 25, preguntas: 72, asignados: 45, completados: 32 },
    { id: '2', nombre: 'Test de Liderazgo Situacional', categoria: 'aptitud', duracion: 15, preguntas: 20, asignados: 10, completados: 8 },
    { id: '3', nombre: 'Clima Laboral Q1', categoria: 'clima', duracion: 10, preguntas: 15, asignados: 120, completados: 115 },
    { id: '4', nombre: 'Perfil de Personalidad (DISC)', categoria: 'personalidad', duracion: 30, preguntas: 40, asignados: 5, completados: 2 },
];

export const Psicometria = () => {
    const { isModuleActive } = useSystemIntegration();
    const isActive = isModuleActive('hr_psychometrics');
    const { currentUser } = useCurrentUser();
    const [tests, setTests] = useState<PsicometriaTest[]>(TESTS_DEMO);
    const [selectedTest, setSelectedTest] = useState<PsicometriaTest | null>(null);
    const [isAssigning, setIsAssigning] = useState(false);

    // Create Test State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newTest, setNewTest] = useState({ title: '', description: '', category: 'riesgo' });
    const [loading, setLoading] = useState(false);

    // Fetch Tests
    React.useEffect(() => {
        if (!currentUser?.enterpriseId) return;
        const fetchTests = async () => {
            const { data } = await supabase.from('psychometric_tests').select('*').eq('empresa_id', currentUser.enterpriseId);
            if (data && data.length > 0) {
                const mappedTests: PsicometriaTest[] = data.map(t => ({
                    id: t.id,
                    nombre: t.title,
                    categoria: t.category || 'riesgo',
                    duracion: t.duration_minutes || 15,
                    preguntas: t.questions?.length || 0,
                    asignados: 0,
                    completados: 0
                }));
                setTests([...TESTS_DEMO, ...mappedTests]);
            }
        };
        fetchTests();
    }, [currentUser]);

    const handleCreateTest = async () => {
        if (!newTest.title || !currentUser?.enterpriseId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase.from('psychometric_tests').insert({
                empresa_id: currentUser.enterpriseId,
                title: newTest.title,
                description: newTest.description,
                category: newTest.category,
                duration_minutes: 15, // Default or add to UI
                questions: [] // Empty for now
            }).select().single();

            if (error) throw error;

            toast.success('Evaluación creada exitosamente');
            setTests(prev => [...prev, {
                id: data.id,
                nombre: data.title,
                categoria: data.category || 'riesgo',
                duracion: data.duration_minutes || 15,
                preguntas: 0,
                asignados: 0,
                completados: 0
            }]);
            setIsCreateOpen(false);
            setNewTest({ title: '', description: '', category: 'riesgo' });
        } catch (e: any) {
            toast.error('Error al crear evaluación: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isActive) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] p-8 text-center space-y-6">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
                    <Brain className="w-12 h-12 text-slate-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Módulo de Psicometría No Activo</h2>
                    <p className="text-slate-500 max-w-md mx-auto mt-2">
                        Esta funcionalidad requiere la activación del plugin "Suite Psicométrica".
                        Contacta a tu administrador para habilitarlo.
                    </p>
                </div>
                <Button disabled variant="outline">Requiere Activación</Button>
            </div>
        );
    }

    const handleAssign = () => {
        setIsAssigning(true);
        // Simular proceso
        setTimeout(() => {
            setIsAssigning(false);
            toast.success('Test asignado a 3 empleados seleccionados');
        }, 1500);
    };

    return (
        <div className="space-y-6 p-6">
            <PremiumPageHeader
                title="Evaluaciones Psicométricas"
                subtitle="Gestión de pruebas para RRHH y Salud Ocupacional"
                icon={Brain}
                badge="HR MODULE"
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="md:col-span-3 border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Batería de Pruebas Disponibles</span>
                            <Button onClick={() => setIsCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                                <FileText className="w-4 h-4 mr-2" />
                                Nueva Evaluación
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            {tests.map((test) => (
                                <motion.div
                                    key={test.id}
                                    whileHover={{ scale: 1.01 }}
                                    className="p-4 rounded-xl border border-slate-100 bg-white hover:shadow-md transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${test.categoria === 'riesgo' ? 'bg-red-100 text-red-600' :
                                            test.categoria === 'aptitud' ? 'bg-blue-100 text-blue-600' :
                                                test.categoria === 'clima' ? 'bg-emerald-100 text-emerald-600' :
                                                    'bg-purple-100 text-purple-600'
                                            }`}>
                                            <Brain className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{test.nombre}</h3>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                <span className="flex items-center gap-1"><Clock size={12} /> {test.duracion} min</span>
                                                <span className="flex items-center gap-1"><ClipboardList size={12} /> {test.preguntas} preg.</span>
                                                <Badge variant="secondary" className="text-[10px] uppercase">{test.categoria}</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden md:block">
                                            <div className="text-sm font-bold text-slate-700">{Math.round((test.completados / test.asignados) * 100)}%</div>
                                            <div className="text-xs text-slate-400">Completado</div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setSelectedTest(test)}>
                                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Asignación Rápida
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-indigo-100 text-sm mb-4">
                                Envía evaluaciones a empleados por lote o departamento.
                            </p>
                            <div className="space-y-3">
                                <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <div className="text-2xl font-bold">12</div>
                                    <div className="text-xs text-indigo-200">Pendientes de asignar (Ingresos)</div>
                                </div>
                                <Button
                                    onClick={handleAssign}
                                    disabled={isAssigning}
                                    className="w-full bg-white text-indigo-600 hover:bg-white/90 font-bold"
                                >
                                    {isAssigning ? 'Enviando...' : 'Asignar Lote'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Resultados Recientes</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                        JD
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">Juan Doe</div>
                                        <div className="text-xs text-slate-500">Liderazgo • 85/100</div>
                                    </div>
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Dialog Detalles */}
            <Dialog open={!!selectedTest} onOpenChange={() => setSelectedTest(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <Brain className="w-8 h-8 text-indigo-500" />
                            {selectedTest?.nombre}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <div className="text-2xl font-bold text-indigo-600">{selectedTest?.asignados}</div>
                                <div className="text-xs text-slate-500 uppercase font-bold">Asignados</div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <div className="text-2xl font-bold text-emerald-600">{selectedTest?.completados}</div>
                                <div className="text-xs text-slate-500 uppercase font-bold">Completados</div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <div className="text-2xl font-bold text-amber-600">{selectedTest?.duracion}'</div>
                                <div className="text-xs text-slate-500 uppercase font-bold">Duración Prom.</div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-800 mb-2">Vista Previa de Preguntas</h4>
                            <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex gap-3 text-sm text-slate-600">
                                    <span className="font-bold text-slate-400">1.</span>
                                    <p>¿Con qué frecuencia siente que su trabajo le exige más de lo que puede dar?</p>
                                </div>
                                <div className="flex gap-3 text-sm text-slate-600">
                                    <span className="font-bold text-slate-400">2.</span>
                                    <p>¿Recibe retroalimentación constante sobre su desempeño?</p>
                                </div>
                                <div className="text-center pt-2">
                                    <Button variant="link" className="text-indigo-600 text-xs">Ver las {selectedTest?.preguntas} preguntas</Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setSelectedTest(null)}>Cerrar</Button>
                            <Button className="bg-indigo-600 text-white">Ver Resultados Detallados</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog Crear Test */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nueva Evaluación Psicométrica</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Título de la Evaluación</Label>
                            <Input
                                value={newTest.title}
                                onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                                placeholder="Ej. Test de Estrés Laboral"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Descripción</Label>
                            <Textarea
                                value={newTest.description}
                                onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                                placeholder="Describe el propósito de esta prueba..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Categoría</Label>
                            <Select value={newTest.category} onValueChange={(v) => setNewTest({ ...newTest, category: v as any })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="riesgo">Riesgo Psicosocial</SelectItem>
                                    <SelectItem value="aptitud">Aptitud y Habilidades</SelectItem>
                                    <SelectItem value="clima">Clima Laboral</SelectItem>
                                    <SelectItem value="personalidad">Personalidad</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button className="w-full bg-indigo-600" onClick={handleCreateTest} disabled={loading}>
                            {loading && <Brain className="animate-spin mr-2 h-4 w-4" />}
                            Crear Evaluación
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
