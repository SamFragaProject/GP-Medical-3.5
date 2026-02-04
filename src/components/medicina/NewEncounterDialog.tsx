import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SOAPEditor } from './SOAPEditor';
import { consultasService } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface NewEncounterDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    paciente: any;
    citaId?: string;
    onSuccess?: () => void;
}

export function NewEncounterDialog({ open, onOpenChange, paciente, citaId, onSuccess }: NewEncounterDialogProps) {
    const { user } = useAuth();

    const handleSaveEncounter = async (formData: any) => {
        try {
            const payload = {
                ...formData,
                paciente_id: paciente.id,
                cita_id: citaId,
                doctor_id: user?.id,
                tipo_encuentro: 'consulta'
            };

            await consultasService.createEncounter(payload);
            toast.success('Nota médica guardada correctamente');
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error saving encounter:', error);
            toast.error('Error al guardar la nota médica');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] w-[1200px] h-[90vh] p-0 overflow-hidden border-none rounded-3xl shadow-2xl">
                <SOAPEditor
                    paciente={paciente}
                    citaId={citaId}
                    onSave={handleSaveEncounter}
                />
            </DialogContent>
        </Dialog>
    );
}
