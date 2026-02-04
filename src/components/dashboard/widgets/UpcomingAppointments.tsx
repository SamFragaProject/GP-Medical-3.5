import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, Video, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function UpcomingAppointments() {
    const appointments = [
        {
            id: 1,
            patient: 'Ana García',
            type: 'Consulta General',
            time: '09:00 AM',
            mode: 'Presencial',
            image: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
            status: 'confirmed'
        },
        {
            id: 2,
            patient: 'Carlos Ruiz',
            type: 'Seguimiento',
            time: '10:30 AM',
            mode: 'Virtual',
            image: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
            status: 'pending'
        },
        {
            id: 3,
            patient: 'María López',
            type: 'Examen Médico',
            time: '11:45 AM',
            mode: 'Presencial',
            image: 'https://i.pravatar.cc/150?u=a04258114e29026302d',
            status: 'confirmed'
        }
    ]

    return (
        <Card className="h-full border-none shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    Próximas Citas
                </CardTitle>
                <Button variant="default" size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700">
                    Ver todas
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {appointments.map((apt, index) => (
                    <motion.div
                        key={apt.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/60 hover:bg-white/80 transition-all duration-200 border border-gray-100 hover:border-indigo-100 group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img
                                    src={apt.image}
                                    alt={apt.patient}
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                                />
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${apt.status === 'confirmed' ? 'bg-green-500' : 'bg-amber-500'
                                    }`} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">
                                    {apt.patient}
                                </h4>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    {apt.type}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1 text-sm font-medium text-gray-700 bg-gray-100/50 px-2 py-1 rounded-md">
                                <Clock className="w-3 h-3" />
                                {apt.time}
                            </div>
                            <Badge variant={apt.mode === 'Virtual' ? 'secondary' : 'outline'} className="text-[10px]">
                                {apt.mode === 'Virtual' ? (
                                    <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Virtual</span>
                                ) : (
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Presencial</span>
                                )}
                            </Badge>
                        </div>
                    </motion.div>
                ))}
            </CardContent>
        </Card>
    )
}
