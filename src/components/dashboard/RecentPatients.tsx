import React from 'react'
import {
    Card,
    Table,
    TableHead,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    Text,
    Title,
    Badge,
} from '@tremor/react'
import { User, Clock, MoreHorizontal } from 'lucide-react'

const data = [
    {
        name: 'Ana García',
        age: 32,
        condition: 'Control Rutina',
        status: 'active',
        time: '09:30 AM',
    },
    {
        name: 'Carlos Ruiz',
        age: 45,
        condition: 'Dolor Lumbar',
        status: 'waiting',
        time: '10:15 AM',
    },
    {
        name: 'María López',
        age: 28,
        condition: 'Migraña',
        status: 'completed',
        time: '08:45 AM',
    },
    {
        name: 'Juan Pérez',
        age: 56,
        condition: 'Hipertensión',
        status: 'active',
        time: '11:00 AM',
    },
]

export function RecentPatients() {
    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <Title>Pacientes en Sala</Title>
                <Badge color="slate" size="xs">4 Total</Badge>
            </div>
            <Table className="mt-5">
                <TableHead>
                    <TableRow>
                        <TableHeaderCell>Paciente</TableHeaderCell>
                        <TableHeaderCell>Condición</TableHeaderCell>
                        <TableHeaderCell>Estado</TableHeaderCell>
                        <TableHeaderCell>Hora</TableHeaderCell>
                        <TableHeaderCell></TableHeaderCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={item.name} className="hover:bg-slate-50 transition-colors">
                            <TableCell>
                                <div className="flex items-center space-x-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <User size={16} />
                                    </div>
                                    <Text className="font-medium text-slate-900">{item.name}</Text>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Text>{item.condition}</Text>
                            </TableCell>
                            <TableCell>
                                <Badge color={item.status === 'active' ? 'emerald' : item.status === 'waiting' ? 'amber' : 'slate'} size="xs">
                                    {item.status === 'active' ? 'En Consulta' : item.status === 'waiting' ? 'Espera' : 'Finalizado'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center text-slate-500">
                                    <Clock size={14} className="mr-1" />
                                    <Text>{item.time}</Text>
                                </div>
                            </TableCell>
                            <TableCell>
                                <button className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                                    <MoreHorizontal size={16} className="text-slate-400" />
                                </button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    )
}
