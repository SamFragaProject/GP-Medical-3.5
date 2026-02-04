import React from 'react'
import { FileText, Activity, Zap, CheckCircle, Clock } from 'lucide-react'
import { List, ListItem, Icon, Text, Badge, Flex } from '@tremor/react'

export function RecentTests() {
    const tests = [
        {
            id: 1,
            name: 'Análisis de Sangre',
            date: 'Mañana, 10:00 AM',
            status: 'scheduled',
            icon: FileText,
            color: 'blue',
            badgeColor: 'blue',
            badgeText: 'Agendado'
        },
        {
            id: 2,
            name: 'Electrocardiograma',
            date: '15 Ene, 2024',
            status: 'completed',
            icon: Activity,
            color: 'emerald',
            badgeColor: 'emerald',
            badgeText: 'Listo'
        },
        {
            id: 3,
            name: 'Rayos X Torax',
            date: '12 Ene, 2024',
            status: 'pending',
            icon: Zap,
            color: 'amber',
            badgeColor: 'amber',
            badgeText: 'Pendiente'
        }
    ]

    return (
        <List className="mt-2">
            {tests.map((test) => (
                <ListItem key={test.id} className="hover:bg-gray-50 transition-colors rounded-xl p-2">
                    <Flex justifyContent="start" className="space-x-4 truncate">
                        <div className={`p-2 rounded-lg ${test.color === 'blue' ? 'bg-blue-100 text-blue-600' : test.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                            <test.icon size={20} />
                        </div>
                        <div className="truncate">
                            <Text className="truncate font-bold text-slate-700">{test.name}</Text>
                            <Text className="truncate text-xs">{test.date}</Text>
                        </div>
                    </Flex>
                    <Badge size="xs" color={test.badgeColor} icon={test.status === 'completed' ? CheckCircle : (test.status === 'scheduled' ? Clock : undefined)}>
                        {test.badgeText}
                    </Badge>
                </ListItem>
            ))}
        </List>
    )
}
