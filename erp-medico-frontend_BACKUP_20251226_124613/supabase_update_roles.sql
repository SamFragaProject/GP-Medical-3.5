-- ALERTA: Ejecuta este script DESPUÉS de haberte logueado al menos una vez con cada usuario.
-- (El login inicial crea el perfil en la tabla usuarios con rol 'paciente' por defecto)

-- Asignar rol de Super Admin a tu usuario (Sam Fraga)
UPDATE usuarios 
SET 
  rol = 'super_admin',
  nombre = 'Sam',
  apellido_paterno = 'Fraga'
WHERE email = 'sam@mediflow.com';

-- Asignar rol de Admin Empresa
UPDATE usuarios 
SET 
  rol = 'admin_empresa',
  nombre = 'Ana',
  apellido_paterno = 'Gerente'
WHERE email = 'admin@empresa.com';

-- Asignar rol de Médico
UPDATE usuarios 
SET 
  rol = 'medico',
  nombre = 'Dr. Roberto',
  apellido_paterno = 'Pérez',
  especialidad = 'Medicina General',
  cedula_profesional = '12345678'
WHERE email = 'medico@mediflow.com';

-- Asignar rol de Paciente (Confirmación)
UPDATE usuarios 
SET 
  rol = 'paciente',
  nombre = 'María',
  apellido_paterno = 'López'
WHERE email = 'paciente@mediflow.com';
