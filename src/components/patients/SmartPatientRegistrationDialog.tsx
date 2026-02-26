import React from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import WizardAltaPaciente from '@/pages/pacientes/WizardAltaPaciente'

interface SmartPatientRegistrationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
    empresaId?: string
}

export function SmartPatientRegistrationDialog({
    open,
    onOpenChange,
    onSuccess,
    empresaId
}: SmartPatientRegistrationDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] w-[1200px] p-0 overflow-hidden border-none bg-transparent shadow-none">
                <div className="bg-slate-50 rounded-[2.5rem] overflow-hidden h-[90vh] flex flex-col">
                    <WizardAltaPaciente
                        onComplete={async () => {
                            onSuccess?.()
                            onOpenChange(false)
                        }}
                        onCancel={() => onOpenChange(false)}
                        empresaId={empresaId}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
