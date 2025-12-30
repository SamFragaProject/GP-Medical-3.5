import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    FileText,
    FlaskConical,
    Scan,
    AlertTriangle,
    ChevronRight,
    Search,
    Download,
    Eye,
    Calendar,
    Maximize2,
    Minimize2,
    Contrast,
    ZoomIn,
    Move,
    User,
    Droplets,
    Heart,
    Thermometer,
    Weight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge as ShadcnBadge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AnatomyViewer } from '@/components/dashboard/AnatomyViewer';
import { VitalSignCard } from './VitalSignCard';
import { PatientTimeline } from './PatientTimeline';
import { Card, Title, Text, Badge, Grid, Col, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from '@tremor/react';

interface ClinicalRecordViewProps {
    patient: any;
    onBack: () => void;
}

// Mock Data
const LAB_RESULTS = [
    { id: 1, name: 'Biometría Hemática', date: '2024-10-15', status: 'Normal', doctor: 'Dr. Ramírez' },
    { id: 2, name: 'Química Sanguínea 24', date: '2024-10-15', status: 'Alerta', doctor: 'Dr. Ramírez' },
    { id: 3, name: 'Examen General de Orina', date: '2024-09-10', status: 'Normal', doctor: 'Dra. López' },
];

const IMAGING_STUDIES = [
    { id: 1, name: 'Radiografía de Tórax PA', date: '2024-10-15', modality: 'RX', image: 'https://prod-images-static.radiopaedia.org/images/53396886/0b7f6f5b3e1f45709656134567890123_jumbo.jpeg' },
    { id: 2, name: 'Resonancia Magnética Cerebral', date: '2024-08-20', modality: 'RM', image: 'https://prod-images-static.radiopaedia.org/images/157210/33249853f2f3245678901234567890_jumbo.jpg' },
];

interface TimelineEvent {
    id: number;
    date: string;
    title: string;
    description: string;
    type: 'consultation' | 'lab' | 'prescription' | 'alert';
    doctor?: string;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
    { id: 1, date: '15 OCT 2024', title: 'Consulta Periódica', description: 'Evaluación anual. Se solicitan laboratorios.', type: 'consultation', doctor: 'Dr. Ramírez' },
    { id: 2, date: '15 OCT 2024', title: 'Biometría Hemática', description: 'Resultados dentro de rango normal.', type: 'lab', doctor: 'Dr. Ramírez' },
    { id: 3, date: '10 SEP 2024', title: 'Receta Médica', description: 'Ibuprofeno 400mg cada 8 horas.', type: 'prescription', doctor: 'Dra. López' },
    { id: 4, date: '01 AGO 2024', title: 'Alerta Ergonomía', description: 'Reporte de dolor lumbar.', type: 'alert', doctor: 'Sistema' },
];

const VITAL_SIGNS_DATA = [
    { date: 'Jan', value: 110 }, { date: 'Feb', value: 115 }, { date: 'Mar', value: 120 }, { date: 'Apr', value: 118 }, { date: 'May', value: 122 }, { date: 'Jun', value: 120 }
];

export function ClinicalRecordView({ patient, onBack }: ClinicalRecordViewProps) {
    const [activeTab, setActiveTab] = useState('summary');
    const [selectedImage, setSelectedImage] = useState<any>(null);

    return (
        <div className="h-full flex flex-col bg-slate-50/50 rounded-3xl overflow-hidden relative">

            {/* 360° Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-6 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-slate-100 rounded-full -ml-2">
                            <ChevronRight className="w-6 h-6 text-slate-500 rotate-180" />
                        </Button>

                        <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/30">
                                {patient.nombre.charAt(0)}{patient.apellido_paterno.charAt(0)}
                            </div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">{patient.nombre} {patient.apellido_paterno} {patient.apellido_materno}</h2>
                            <div className="flex items-center space-x-4 mt-1">
                                <Badge size="xs" color="blue">ID: {patient.id}</Badge>
                                <Text className="text-slate-500 text-sm flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" /> {patient.edad} años
                                </Text>
                                <Text className="text-slate-500 text-sm flex items-center">
                                    <Droplets className="w-3 h-3 mr-1" /> O+
                                </Text>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        <Button variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
                            <Download className="w-4 h-4 mr-2" /> Resumen PDF
                        </Button>
                    </div>
                </div>

                <div className="mt-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="bg-slate-100/50 p-1">
                            <TabsTrigger value="summary" className="px-6">Resumen 360°</TabsTrigger>
                            <TabsTrigger value="labs" className="px-6">Laboratorio</TabsTrigger>
                            <TabsTrigger value="imaging" className="px-6">Imagenología</TabsTrigger>
                            <TabsTrigger value="history" className="px-6">Historial</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                <AnimatePresence mode="wait">
                    {activeTab === 'summary' && (
                        <motion.div
                            key="summary"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Vital Signs Grid */}
                            <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
                                <VitalSignCard
                                    title="Presión Arterial"
                                    value="120/80"
                                    unit="mmHg"
                                    icon={Activity}
                                    color="blue"
                                    trend="stable"
                                    data={VITAL_SIGNS_DATA}
                                />
                                <VitalSignCard
                                    title="Frecuencia Cardíaca"
                                    value="72"
                                    unit="bpm"
                                    icon={Heart}
                                    color="rose"
                                    trend="down"
                                    data={VITAL_SIGNS_DATA}
                                />
                                <VitalSignCard
                                    title="Temperatura"
                                    value="36.5"
                                    unit="°C"
                                    icon={Thermometer}
                                    color="amber"
                                    trend="stable"
                                    data={VITAL_SIGNS_DATA}
                                />
                                <VitalSignCard
                                    title="Peso"
                                    value="75.4"
                                    unit="kg"
                                    icon={Weight}
                                    color="emerald"
                                    trend="up"
                                    data={VITAL_SIGNS_DATA}
                                />
                            </Grid>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Anatomy Viewer */}
                                <Card className="col-span-1 lg:col-span-2 p-0 overflow-hidden border-none shadow-lg bg-white rounded-2xl">
                                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                        <Title>Mapa de Salud Laboral</Title>
                                        <Badge color="amber">1 Alerta Activa</Badge>
                                    </div>
                                    <div className="p-6 flex justify-center bg-slate-50/50 h-[400px]">
                                        <AnatomyViewer
                                            highlightedSystems={[
                                                { id: 'musculo', status: 'warning', count: 1 },
                                                { id: 'resp', status: 'normal', count: 0 }
                                            ]}
                                        />
                                    </div>
                                </Card>

                                {/* Quick Alerts & Allergies */}
                                <div className="space-y-6">
                                    <Card className="border-none shadow-lg bg-white rounded-2xl">
                                        <Title className="mb-4">Alertas Activas</Title>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                                <div className="flex items-start space-x-3">
                                                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                                    <div>
                                                        <h4 className="font-bold text-amber-900 text-sm">Riesgo Ergonómico</h4>
                                                        <p className="text-amber-700 text-xs mt-1">Dolor lumbar persistente tras jornada.</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                                                <div className="flex items-start space-x-3">
                                                    <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5" />
                                                    <div>
                                                        <h4 className="font-bold text-rose-900 text-sm">Alergia: Penicilina</h4>
                                                        <p className="text-rose-700 text-xs mt-1">Reacción anafiláctica severa.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="max-w-3xl mx-auto"
                        >
                            <PatientTimeline events={TIMELINE_EVENTS} />
                        </motion.div>
                    )}

                    {activeTab === 'labs' && (
                        <motion.div
                            key="labs"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card className="p-0 overflow-hidden border-none shadow-lg bg-white rounded-2xl">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableHeaderCell>Estudio</TableHeaderCell>
                                            <TableHeaderCell>Fecha</TableHeaderCell>
                                            <TableHeaderCell>Doctor</TableHeaderCell>
                                            <TableHeaderCell>Estado</TableHeaderCell>
                                            <TableHeaderCell className="text-right">Acciones</TableHeaderCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {LAB_RESULTS.map((lab) => (
                                            <TableRow key={lab.id} className="hover:bg-slate-50 transition-colors">
                                                <TableCell className="font-medium text-slate-900">
                                                    <div className="flex items-center">
                                                        <FlaskConical className="w-4 h-4 mr-2 text-slate-400" />
                                                        {lab.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{lab.date}</TableCell>
                                                <TableCell>{lab.doctor}</TableCell>
                                                <TableCell>
                                                    <Badge color={lab.status === 'Alerta' ? 'rose' : 'emerald'} size="xs">
                                                        {lab.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                                        Ver Detalles
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'imaging' && (
                        <motion.div
                            key="imaging"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-[600px] flex gap-6"
                        >
                            {/* List */}
                            <Card className="w-1/3 p-0 overflow-hidden flex flex-col border-none shadow-lg bg-white rounded-2xl">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                    <Title>Estudios Disponibles</Title>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                    {IMAGING_STUDIES.map((study) => (
                                        <div
                                            key={study.id}
                                            onClick={() => setSelectedImage(study)}
                                            className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedImage?.id === study.id ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-blue-50/30'}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-sm">{study.name}</h4>
                                                <Badge size="xs" color={selectedImage?.id === study.id ? 'slate' : 'gray'}>{study.modality}</Badge>
                                            </div>
                                            <p className={`text-xs mt-2 ${selectedImage?.id === study.id ? 'text-slate-400' : 'text-slate-500'}`}>{study.date}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Viewer */}
                            <div className="flex-1 bg-black rounded-2xl shadow-2xl overflow-hidden flex flex-col relative group ring-4 ring-slate-900/5">
                                {selectedImage ? (
                                    <>
                                        <div className="absolute top-4 left-4 z-10 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="secondary" className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border-0"><Contrast className="w-4 h-4" /></Button>
                                            <Button size="icon" variant="secondary" className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border-0"><ZoomIn className="w-4 h-4" /></Button>
                                            <Button size="icon" variant="secondary" className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border-0"><Move className="w-4 h-4" /></Button>
                                        </div>

                                        <div className="flex-1 flex items-center justify-center bg-black relative">
                                            <img src={selectedImage.image} alt="Medical Imaging" className="max-h-full max-w-full object-contain opacity-90" />

                                            {/* DICOM Overlays */}
                                            <div className="absolute top-4 left-4 text-white/70 text-[10px] font-mono space-y-1 pointer-events-none mix-blend-difference">
                                                <p className="font-bold text-lg">{patient.nombre.toUpperCase()} {patient.apellido_paterno.toUpperCase()}</p>
                                                <p>ID: {patient.id}</p>
                                                <p>{selectedImage.date}</p>
                                            </div>
                                            <div className="absolute bottom-4 right-4 text-white/70 text-[10px] font-mono space-y-1 text-right pointer-events-none mix-blend-difference">
                                                <p>WL: 128 WW: 256</p>
                                                <p>{selectedImage.modality}</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-slate-600 flex-col bg-slate-900">
                                        <Scan className="w-16 h-16 mb-4 opacity-20" />
                                        <p className="text-slate-500">Seleccione un estudio para visualizar</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
