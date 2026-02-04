import React from 'react'
import { Card, Title, Text, List, ListItem, Icon } from '@tremor/react'
import { CheckCircle, Circle, Clock } from 'lucide-react'

const tasks = [
    {
        id: 1,
        title: 'Revisar resultados de laboratorio',
        patient: 'Juan Pérez',
        status: 'pending',
        priority: 'high',
    },
    {
        id: 2,
        title: 'Firmar recetas pendientes',
        patient: 'Ana García',
        status: 'completed',
        priority: 'medium',
    },
    {
        id: 3,
        title: 'Actualizar historia clínica',
        patient: 'Carlos Ruiz',
        status: 'pending',
        priority: 'low',
    },
    {
        id: 4,
        title: 'Llamada de seguimiento',
        patient: 'María López',
        status: 'pending',
        priority: 'medium',
    },
]

export function DailyTasks() {
    return (
        <Card className="h-full">
            <Title>Tareas Pendientes</Title>
            <List className="mt-4">
                {tasks.map((task) => (
                    <ListItem key={task.id} className="cursor-pointer hover:bg-slate-50 transition-colors rounded-lg p-2">
                        <div className="flex items-start space-x-3">
                            <Icon
                                icon={task.status === 'completed' ? CheckCircle : Circle}
                                color={task.status === 'completed' ? 'emerald' : 'slate'}
                                variant="simple"
                                size="sm"
                                className="mt-0.5"
                            />
                            <div>
                                <Text className={`font-medium ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                    {task.title}
                                </Text>
                                <Text className="text-xs text-slate-500">
                                    {task.patient}
                                </Text>
                            </div>
                        </div>
                        <div className="flex items-center">
                            {task.status === 'pending' && (
                                <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                                    }`} />
                            )}
                        </div>
                    </ListItem>
                ))}
            </List>
        </Card>
    )
}
