/**
 * Demo Data Context - GPMedical ERP
 * Manages demo data state with full CRUD operations
 * Works entirely in-memory during the session
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import toast from 'react-hot-toast'
import {
    DEMO_PATIENTS,
    DEMO_USERS,
    DEMO_APPOINTMENTS,
    DEMO_EXAMS,
    DemoPatient,
    DemoUser,
    DemoAppointment,
    DemoExam,
    DEMO_EMPRESA_ID,
    DEMO_SEDE_ID
} from '@/data/mockDemoData'

// ============================================
// TYPES
// ============================================

interface DemoDataContextType {
    // Data
    patients: DemoPatient[]
    users: DemoUser[]
    appointments: DemoAppointment[]
    exams: DemoExam[]

    // Patient CRUD
    addPatient: (patient: Omit<DemoPatient, 'id'>) => DemoPatient
    updatePatient: (id: string, updates: Partial<DemoPatient>) => void
    deletePatient: (id: string) => void

    // User CRUD
    addUser: (user: Omit<DemoUser, 'id'>) => DemoUser
    updateUser: (id: string, updates: Partial<DemoUser>) => void
    deleteUser: (id: string) => void

    // Appointment CRUD
    addAppointment: (appointment: Omit<DemoAppointment, 'id'>) => DemoAppointment
    updateAppointment: (id: string, updates: Partial<DemoAppointment>) => void
    deleteAppointment: (id: string) => void

    // Reset
    resetData: () => void
}

const DemoDataContext = createContext<DemoDataContextType | null>(null)

// ============================================
// PROVIDER
// ============================================

export function DemoDataProvider({ children }: { children: ReactNode }) {
    const [patients, setPatients] = useState<DemoPatient[]>([...DEMO_PATIENTS])
    const [users, setUsers] = useState<DemoUser[]>([...DEMO_USERS])
    const [appointments, setAppointments] = useState<DemoAppointment[]>([...DEMO_APPOINTMENTS])
    const [exams, setExams] = useState<DemoExam[]>([...DEMO_EXAMS])

    // Generate unique ID
    const generateId = () => `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // ============================================
    // PATIENT CRUD
    // ============================================

    const addPatient = useCallback((patientData: Omit<DemoPatient, 'id'>): DemoPatient => {
        const newPatient: DemoPatient = {
            ...patientData,
            id: generateId(),
            empresaId: DEMO_EMPRESA_ID,
        }
        setPatients(prev => [...prev, newPatient])
        toast.success(`Paciente ${newPatient.nombre} ${newPatient.apellidoPaterno} creado`, { icon: '✅' })
        return newPatient
    }, [])

    const updatePatient = useCallback((id: string, updates: Partial<DemoPatient>) => {
        setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
        toast.success('Paciente actualizado', { icon: '✏️' })
    }, [])

    const deletePatient = useCallback((id: string) => {
        const patient = patients.find(p => p.id === id)
        setPatients(prev => prev.filter(p => p.id !== id))
        toast.success(`Paciente ${patient?.nombre || ''} eliminado`, { icon: '🗑️' })
    }, [patients])

    // ============================================
    // USER CRUD
    // ============================================

    const addUser = useCallback((userData: Omit<DemoUser, 'id'>): DemoUser => {
        const newUser: DemoUser = {
            ...userData,
            id: generateId(),
            empresaId: DEMO_EMPRESA_ID,
            sedeId: DEMO_SEDE_ID,
        }
        setUsers(prev => [...prev, newUser])
        toast.success(`Usuario ${newUser.nombre} ${newUser.apellidoPaterno} creado`, { icon: '✅' })
        return newUser
    }, [])

    const updateUser = useCallback((id: string, updates: Partial<DemoUser>) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u))
        toast.success('Usuario actualizado', { icon: '✏️' })
    }, [])

    const deleteUser = useCallback((id: string) => {
        const user = users.find(u => u.id === id)
        setUsers(prev => prev.filter(u => u.id !== id))
        toast.success(`Usuario ${user?.nombre || ''} eliminado`, { icon: '🗑️' })
    }, [users])

    // ============================================
    // APPOINTMENT CRUD
    // ============================================

    const addAppointment = useCallback((appointmentData: Omit<DemoAppointment, 'id'>): DemoAppointment => {
        const newAppointment: DemoAppointment = {
            ...appointmentData,
            id: generateId(),
            empresaId: DEMO_EMPRESA_ID,
        }
        setAppointments(prev => [...prev, newAppointment])
        toast.success('Cita programada', { icon: '📅' })
        return newAppointment
    }, [])

    const updateAppointment = useCallback((id: string, updates: Partial<DemoAppointment>) => {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))
        toast.success('Cita actualizada', { icon: '✏️' })
    }, [])

    const deleteAppointment = useCallback((id: string) => {
        setAppointments(prev => prev.filter(a => a.id !== id))
        toast.success('Cita cancelada', { icon: '❌' })
    }, [])

    // ============================================
    // RESET
    // ============================================

    const resetData = useCallback(() => {
        setPatients([...DEMO_PATIENTS])
        setUsers([...DEMO_USERS])
        setAppointments([...DEMO_APPOINTMENTS])
        setExams([...DEMO_EXAMS])
        toast.success('Datos demo reiniciados', { icon: '🔄' })
    }, [])

    return (
        <DemoDataContext.Provider value={{
            patients,
            users,
            appointments,
            exams,
            addPatient,
            updatePatient,
            deletePatient,
            addUser,
            updateUser,
            deleteUser,
            addAppointment,
            updateAppointment,
            deleteAppointment,
            resetData,
        }}>
            {children}
        </DemoDataContext.Provider>
    )
}

// ============================================
// HOOK
// ============================================

export function useDemoData() {
    const context = useContext(DemoDataContext)
    if (!context) {
        throw new Error('useDemoData must be used within a DemoDataProvider')
    }
    return context
}

export default DemoDataContext
