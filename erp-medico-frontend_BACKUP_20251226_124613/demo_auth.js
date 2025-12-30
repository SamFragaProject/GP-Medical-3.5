// Simulación del sistema de autenticación demo
const DEMO_USERS = [
  {
    id: 'admin-001',
    email: 'admin@mediflow.mx',
    password: 'admin123',
    name: 'Dr. Carlos Admin',
    hierarchy: 'super_admin',
    permissions: ['*']
  },
  {
    id: 'admin-empresa-001',
    email: 'admin.empresa@mediflow.mx',
    password: 'adminemp123',
    name: 'Dra. Patricia Fernández',
    hierarchy: 'admin_empresa',
    permissions: ['patients_manage', 'billing_manage', 'reports_manage', 'agenda_manage', 'inventory_manage', 'enterprise_config']
  },
  {
    id: 'medico-001',
    email: 'medico@mediflow.mx',
    password: 'medico123',
    name: 'Dra. Luna Rivera',
    hierarchy: 'medico_trabajo',
    permissions: ['patients_manage', 'medical_view', 'medical_manage', 'exams_manage', 'reports_view', 'agenda_manage', 'billing_view', 'certifications_view']
  },
  {
    id: 'especialista-001',
    email: 'especialista@mediflow.mx',
    password: 'especialista123',
    name: 'Dr. Roberto Silva',
    hierarchy: 'medico_especialista',
    permissions: ['patients_manage', 'medical_view', 'medical_manage', 'exams_specialized', 'reports_view']
  },
  {
    id: 'laboratorio-001',
    email: 'laboratorio@mediflow.mx',
    password: 'lab123',
    name: 'Dr. Miguel Ángel Torres',
    hierarchy: 'medico_laboratorista',
    permissions: ['medical_view', 'medical_manage', 'laboratory_manage', 'exams_laboratory', 'reports_laboratory', 'patients_manage']
  },
  {
    id: 'recepcion-001',
    email: 'recepcion@mediflow.mx',
    password: 'recepcion123',
    name: 'Ana Patricia López',
    hierarchy: 'recepcion',
    permissions: ['patients_manage', 'billing_view', 'agenda_manage', 'scheduling_view']
  },
  {
    id: 'paciente-001',
    email: 'paciente@mediflow.mx',
    password: 'paciente123',
    name: 'Juan Carlos Pérez',
    hierarchy: 'paciente',
    permissions: ['medical_view', 'appointments_view', 'reports_view']
  },
  {
    id: 'recepcion-demo-001',
    email: 'recepcion@demo.mx',
    password: 'demo123',
    name: 'Sra. Carmen Ruiz',
    hierarchy: 'recepcion',
    permissions: ['patients_manage', 'billing_view', 'agenda_manage', 'scheduling_view']
  },
  {
    id: 'paciente-demo-001',
    email: 'paciente@demo.mx',
    password: 'demo123',
    name: 'Juan Pérez',
    hierarchy: 'paciente',
    permissions: ['medical_view', 'appointments_view', 'reports_view']
  }
];

// Función de prueba de autenticación
function testAuthentication(email, password) {
  const user = DEMO_USERS.find(u => u.email === email && u.password === password);
  
  if (user) {
    return {
      success: true,
      message: `¡Login exitoso para ${user.name}!`,
      user: {
        name: user.name,
        email: user.email,
        hierarchy: user.hierarchy,
        permissions: user.permissions
      }
    };
  } else {
    return {
      success: false,
      message: 'Credenciales incorrectas',
      user: null
    };
  }
}

// Exportar para uso en el navegador
if (typeof window !== 'undefined') {
  window.DemoAuth = { testAuthentication, DEMO_USERS };
}

// Exportar para Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testAuthentication, DEMO_USERS };
}
