// Página para crear nueva cita
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FormularioCita } from '@/pages/agenda/FormularioCita'

export function NuevaCita() {
  const navigate = useNavigate()

  const handleGuardar = () => {
    console.log('Cita guardada exitosamente')
    // Aquí se guardaría la cita en la base de datos
    navigate('/agenda')
  }

  const handleCancelar = () => {
    navigate('/agenda')
  }

  return (
    <FormularioCita 
      onGuardar={handleGuardar}
      onCancelar={handleCancelar}
    />
  )
}
