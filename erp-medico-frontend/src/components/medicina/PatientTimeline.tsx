import React from 'react';
import { Card, Text, Title, Badge } from '@tremor/react';
import { Calendar, FileText, Stethoscope, Pill, AlertCircle } from 'lucide-react';

interface TimelineEvent {
    id: number;
    date: string;
    title: string;
    description: string;
    type: 'consultation' | 'lab' | 'prescription' | 'alert';
    doctor?: string;
}

interface PatientTimelineProps {
    events: TimelineEvent[];
}

export function PatientTimeline({ events }: PatientTimelineProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'consultation': return Stethoscope;
            case 'lab': return FileText;
            case 'prescription': return Pill;
            case 'alert': return AlertCircle;
            default: return Calendar;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'consultation': return 'blue';
            case 'lab': return 'indigo';
            case 'prescription': return 'emerald';
            case 'alert': return 'rose';
            default: return 'slate';
        }
    };

    return (
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {events.map((event, index) => {
                const Icon = getIcon(event.type);
                const color = getColor(event.type);

                return (
                    <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Icon */}
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-${color}-100 text-${color}-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                            <Icon size={18} />
                        </div>

                        {/* Card */}
                        <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 bg-white/80 backdrop-blur-sm hover:bg-white transition-colors border-none shadow-sm ring-1 ring-slate-100">
                            <div className="flex justify-between items-start mb-1">
                                <time className="font-mono text-xs text-slate-400">{event.date}</time>
                                <Badge size="xs" color={color}>{event.type}</Badge>
                            </div>
                            <Title className="text-sm font-bold text-slate-800">{event.title}</Title>
                            <Text className="text-xs text-slate-500 mt-1">{event.description}</Text>
                            {event.doctor && (
                                <Text className="text-xs text-slate-400 mt-2 flex items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></span>
                                    {event.doctor}
                                </Text>
                            )}
                        </Card>
                    </div>
                );
            })}
        </div>
    );
}
