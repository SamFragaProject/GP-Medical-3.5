import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Paciente, dataService } from '@/services/dataService'
import { useAuth } from '@/contexts/AuthContext'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LegalConsent } from '../legal/LegalConsent'
import { CameraCapture } from '../shared/CameraCapture'
import { SignaturePad } from '../shared/SignaturePad'
import { ShieldCheck, UserPlus, FileSignature, Camera, Check, ArrowLeft, FileText } from 'lucide-react'

interface NewPatientDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (patient: Omit<Paciente, 'id' | 'created_at'> & { legal_consent?: any, foto_base64?: string, firma_base64?: string }) => void
    initialData?: Paciente | null
    empresas?: { id: string, nombre: string }[]
}

export function NewPatientDialog({ open, onOpenChange, onSubmit, initialData, empresas = [] }: NewPatientDialogProps) {
    const { user } = useAuth()
    const isSuperAdmin = user?.rol === 'super_admin'

    const [step, setStep] = useState(0) // 0: Info, 1: Photo, 2: Legal (Privacy), 3: Signature
    const [formData, setFormData] = useState({
        nombre: initialData?.nombre || '',
        apellido_paterno: initialData?.apellido_paterno || '',
        apellido_materno: initialData?.apellido_materno || '',
        email: initialData?.email || '',
        curp: initialData?.curp || '',
        rfc: initialData?.rfc || '',
        nss: initialData?.nss || '',
        fecha_nacimiento: initialData?.fecha_nacimiento || '',
        genero: initialData?.genero || 'Masculino',
        estado_civil: initialData?.estado_civil || 'Soltero',
        puesto: initialData?.puesto || '',
        area: initialData?.area || '',
        departamento: initialData?.departamento || '',
        turno: initialData?.turno || 'Matutino',
        fecha_ingreso: initialData?.fecha_ingreso || '',
        empresa_id: initialData?.empresa_id || (isSuperAdmin ? '' : user?.empresa_id) || '',
        sede_id: initialData?.sede_id || '',
        telefono: initialData?.telefono || '',
        contacto_emergencia_nombre: initialData?.contacto_emergencia_nombre || '',
        contacto_emergencia_parentesco: initialData?.contacto_emergencia_parentesco || '',
        contacto_emergencia_telefono: initialData?.contacto_emergencia_telefono || '',
    })

    const [biometrics, setBiometrics] = useState({
        foto: null as string | null,
        firma: null as string | null
    })

    const [legalAcceptance, setLegalAcceptance] = useState({
        privacy_accepted: false,
        privacy_version: '',
        informed_accepted: false,
        informed_version: ''
    })

    const [sedes, setSedes] = useState<any[]>([])

    // Cargar sedes cuando cambia la empresa
    React.useEffect(() => {
        const cargarSedes = async () => {
            if (formData.empresa_id) {
                try {
                    const data = await dataService.sedes.getAll(formData.empresa_id)
                    setSedes(data)
                } catch (error) {
                    console.error('Error cargando sedes:', error)
                }
            }
        };
        cargarSedes()
    }, [formData.empresa_id])

    // Sincronizar con initialData cuando cambia
    React.useEffect(() => {
        if (initialData) {
            setFormData({
                nombre: initialData.nombre,
                apellido_paterno: initialData.apellido_paterno,
                apellido_materno: initialData.apellido_materno || '',
                email: initialData.email || '',
                curp: initialData.curp || '',
                rfc: initialData.rfc || '',
                nss: initialData.nss || '',
                fecha_nacimiento: initialData.fecha_nacimiento || '',
                genero: initialData.genero || 'Masculino',
                estado_civil: initialData.estado_civil || 'Soltero',
                puesto: initialData.puesto || '',
                area: initialData.area || '',
                departamento: initialData.departamento || '',
                turno: (initialData.turno as any) || 'Matutino',
                fecha_ingreso: initialData.fecha_ingreso || '',
                empresa_id: initialData.empresa_id,
                sede_id: initialData.sede_id || '',
                telefono: initialData.telefono || '',
                contacto_emergencia_nombre: initialData.contacto_emergencia_nombre || '',
                contacto_emergencia_parentesco: initialData.contacto_emergencia_parentesco || '',
                contacto_emergencia_telefono: initialData.contacto_emergencia_telefono || '',
            })
            setStep(0)
        } else {
            setFormData({
                nombre: '',
                apellido_paterno: '',
                apellido_materno: '',
                email: '',
                curp: '',
                rfc: '',
                nss: '',
                fecha_nacimiento: '',
                genero: 'Masculino',
                estado_civil: 'Soltero',
                puesto: '',
                area: '',
                departamento: '',
                turno: 'Matutino',
                fecha_ingreso: '',
                empresa_id: (isSuperAdmin ? '' : user?.empresa_id) || '',
                sede_id: '',
                telefono: '',
                contacto_emergencia_nombre: '',
                contacto_emergencia_parentesco: '',
                contacto_emergencia_telefono: '',
            })
            setStep(0)
            setBiometrics({ foto: null, firma: null })
            setLegalAcceptance({
                privacy_accepted: false,
                privacy_version: '',
                informed_accepted: false,
                informed_version: ''
            })
        }
    }, [initialData, open, user, isSuperAdmin])

    const handleNext = (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (initialData) {
            handleFinalSubmit()
            return
        }
        setStep(prev => prev + 1)
    }

    const handleBack = () => setStep(prev => Math.max(0, prev - 1))

    const handleFinalSubmit = () => {
        onSubmit({
            ...formData,
            estatus: initialData?.estatus || 'activo',
            legal_consent: !initialData ? legalAcceptance : undefined,
            foto_base64: biometrics.foto || undefined,
            firma_base64: biometrics.firma || undefined
        } as any)
        onOpenChange(false)
    }

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <form onSubmit={handleNext} className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2 px-1">
                        {/* SECCIÓN I: IDENTIFICACIÓN PERSONAL */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-cyan-600 uppercase tracking-widest border-b border-cyan-100 pb-1">Identificación Personal</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre(s) *</Label>
                                    <Input
                                        id="nombre"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="apellido_paterno">Apellido Paterno *</Label>
                                    <Input
                                        id="apellido_paterno"
                                        value={formData.apellido_paterno}
                                        onChange={(e) => setFormData({ ...formData, apellido_paterno: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="apellido_materno">Apellido Materno</Label>
                                    <Input
                                        id="apellido_materno"
                                        value={formData.apellido_materno}
                                        onChange={(e) => setFormData({ ...formData, apellido_materno: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="genero">Género</Label>
                                    <Select
                                        value={formData.genero}
                                        onValueChange={(val) => setFormData({ ...formData, genero: val })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Masculino">Masculino</SelectItem>
                                            <SelectItem value="Femenino">Femenino</SelectItem>
                                            <SelectItem value="Otro">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="curp">CURP</Label>
                                    <Input
                                        id="curp"
                                        value={formData.curp}
                                        onChange={(e) => setFormData({ ...formData, curp: e.target.value.toUpperCase() })}
                                        maxLength={18}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rfc">RFC</Label>
                                    <Input
                                        id="rfc"
                                        value={formData.rfc}
                                        onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                                        maxLength={13}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nss">NSS</Label>
                                    <Input
                                        id="nss"
                                        value={formData.nss}
                                        onChange={(e) => setFormData({ ...formData, nss: e.target.value })}
                                        maxLength={11}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                                    <Input
                                        id="fecha_nacimiento"
                                        type="date"
                                        value={formData.fecha_nacimiento}
                                        onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN II: DATOS LABORALES */}
                        <div className="space-y-4 pt-2">
                            <h3 className="text-sm font-bold text-cyan-600 uppercase tracking-widest border-b border-cyan-100 pb-1">Datos Laborales</h3>

                            {isSuperAdmin && (
                                <div className="space-y-2">
                                    <Label htmlFor="empresa">Empresa Cliente *</Label>
                                    <Select
                                        value={formData.empresa_id}
                                        onValueChange={(val) => setFormData({ ...formData, empresa_id: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar empresa" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {empresas.map(e => (
                                                <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sede">Sede / Planta</Label>
                                    <Select
                                        value={formData.sede_id}
                                        onValueChange={(val) => setFormData({ ...formData, sede_id: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar sede" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sedes.map(s => (
                                                <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="area">Área / Departamento</Label>
                                    <Input
                                        id="area"
                                        value={formData.area}
                                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="puesto">Puesto de Trabajo *</Label>
                                    <Input
                                        id="puesto"
                                        value={formData.puesto}
                                        onChange={(e) => setFormData({ ...formData, puesto: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="turno">Turno</Label>
                                    <Select
                                        value={formData.turno}
                                        onValueChange={(val: any) => setFormData({ ...formData, turno: val })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Matutino">Matutino</SelectItem>
                                            <SelectItem value="Vespertino">Vespertino</SelectItem>
                                            <SelectItem value="Nocturno">Nocturno</SelectItem>
                                            <SelectItem value="Mixto">Mixto</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fecha_ingreso">Fecha de Ingreso</Label>
                                    <Input
                                        id="fecha_ingreso"
                                        type="date"
                                        value={formData.fecha_ingreso}
                                        onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Corporativo</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN III: CONTACTO DE EMERGENCIA */}
                        <div className="space-y-4 pt-2">
                            <h3 className="text-sm font-bold text-cyan-600 uppercase tracking-widest border-b border-cyan-100 pb-1">Contacto de Emergencia</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contacto_nombre">Nombre Completo</Label>
                                    <Input
                                        id="contacto_nombre"
                                        value={formData.contacto_emergencia_nombre}
                                        onChange={(e) => setFormData({ ...formData, contacto_emergencia_nombre: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="contacto_parentesco">Parentesco</Label>
                                        <Input
                                            id="contacto_parentesco"
                                            value={formData.contacto_emergencia_parentesco}
                                            onChange={(e) => setFormData({ ...formData, contacto_emergencia_parentesco: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contacto_tel">Teléfono</Label>
                                        <Input
                                            id="contacto_tel"
                                            value={formData.contacto_emergencia_telefono}
                                            onChange={(e) => setFormData({ ...formData, contacto_emergencia_telefono: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="mt-8 flex flex-col gap-2">
                            <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 h-12 text-lg rounded-xl shadow-lg">
                                {initialData ? 'Guardar Cambios' : 'Siguiente: Biometría y Legal'}
                                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                            </Button>
                        </DialogFooter>
                    </form>
                )
            case 1:
                return (
                    <div className="py-6 flex flex-col items-center">
                        <CameraCapture
                            onCapture={(img) => setBiometrics(prev => ({ ...prev, foto: img }))}
                            initialImage={biometrics.foto}
                        />
                        <div className="flex gap-3 w-full mt-8">
                            <Button variant="outline" onClick={handleBack} className="flex-1">Regresar</Button>
                            <Button
                                onClick={handleNext}
                                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                                disabled={!biometrics.foto}
                            >
                                Siguiente: Legal
                            </Button>
                        </div>
                    </div>
                )
            case 2:
                return (
                    <div className="py-2">
                        <LegalConsent
                            type="privacy"
                            onAccept={(v) => {
                                setLegalAcceptance(prev => ({ ...prev, privacy_accepted: true, privacy_version: v }))
                                setStep(3)
                            }}
                            onCancel={handleBack}
                        />
                    </div>
                )
            case 3:
                return (
                    <div className="py-2">
                        <LegalConsent
                            type="informed"
                            onAccept={(v) => {
                                setLegalAcceptance(prev => ({ ...prev, informed_accepted: true, informed_version: v }))
                                setStep(4)
                            }}
                            onCancel={handleBack}
                        />
                    </div>
                )
            case 4:
                return (
                    <div className="py-4 space-y-6">
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-sm">
                            <p className="font-bold flex items-center gap-2 mb-1">
                                <Check size={16} /> Documentos aceptados
                            </p>
                            <p className="text-xs opacity-80">Por último, por favor capture su firma autógrafa para finalizar el alta del expediente.</p>
                        </div>
                        <SignaturePad
                            onSave={(firma) => {
                                setBiometrics(prev => ({ ...prev, firma }))
                                handleFinalSubmit()
                            }}
                            onClear={() => setBiometrics(prev => ({ ...prev, firma: null }))}
                        />
                        <Button variant="ghost" onClick={handleBack} className="w-full text-slate-400">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Regresar al consentimiento
                        </Button>
                    </div>
                )
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`${step > 1 ? 'sm:max-w-[600px]' : 'sm:max-w-[425px]'} transition-all rounded-3xl p-6`}>
                <DialogHeader>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 shadow-sm border border-cyan-100">
                            {step === 0 && <UserPlus size={20} />}
                            {step === 1 && <Camera size={20} />}
                            {step === 2 && <ShieldCheck size={20} />}
                            {step === 3 && <FileText size={20} />}
                            {step === 4 && <FileSignature size={20} />}
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black">
                                {step === 0 ? (initialData ? 'Editar Expediente' : 'Datos del Trabajador') :
                                    step === 1 ? 'Fotografía de Perfil' :
                                        step === 2 ? 'Aviso de Privacidad' :
                                            step === 3 ? 'Consentimiento Informado' : 'Firma de Conformidad'}
                            </DialogTitle>
                            {step > 0 && <p className="text-xs text-slate-500 font-medium">Paso {step + 1} de 5</p>}
                        </div>
                    </div>

                    {!initialData && (
                        <div className="flex gap-2 mt-4">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-slate-100'}`}
                                />
                            ))}
                        </div>
                    )}
                </DialogHeader>

                <div className="mt-2">
                    {renderStep()}
                </div>
            </DialogContent>
        </Dialog>
    )
}

