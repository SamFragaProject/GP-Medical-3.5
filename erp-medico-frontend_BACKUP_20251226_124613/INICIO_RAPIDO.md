#  INICIO RÁPIDO - Sistema HC/RX V2

##  Servidor Corriendo

El servidor está activo en: **http://localhost:5173/**

##  Activar HC/RX V2

### Paso 1: Abrir el navegador
Ir a: http://localhost:5173/

### Paso 2: Activar el feature flag
Abrir la consola del navegador (F12) y ejecutar:
\\\javascript
localStorage.setItem('HC_RX_V2', 'true')
location.reload()
\\\

### Paso 3: Navegar a Historial Clínico
Hacer clic en "Historial Clínico" en el menú lateral.

##  Características Implementadas

 **Layout Profesional**: Grid 12 columnas con preview sticky
 **3 Modos**: Manual  / Rápido  / Voz 
 **IA Asistida**: Panel con sugerencias inteligentes 
 **Autosave**: Cada 10s con banner de restauración
 **Atajos de Teclado**: F2, Alt+D, Ctrl+/, Alt+S, etc.
 **Design Tokens**: Sistema visual completo
 **Telemetría**: Eventos rastreados

##  Atajos de Teclado

- **F2**: Toggle micrófono
- **Alt+N**: Nuevo medicamento rápido
- **Alt+D**: Duplicar último medicamento
- **Ctrl+Enter**: Siguiente paso
- **Ctrl+/**: Focus búsqueda
- **Alt+S**: Firmar y PDF
- **Shift+?**: Ayuda
- **Esc**: Cerrar

##  Si el servidor se detiene

### Opción 1: Usar el script
\\\powershell
.\start-dev.ps1
\\\

### Opción 2: Comando directo
\\\powershell
cd "c:\Users\Marc XVII\Documents\GPMedical\ERP 3.0\GPMedical 3\GPMedical 3.5\erp-medico-frontend"
pnpm dev
\\\

##  Archivos Clave

- \PrescripcionBuilderWrapperV2.tsx\ - Wrapper principal
- \AIAssistPanel.tsx\ - Panel de IA
- \hc_rx_v2.css\ - Design tokens
- \README_HC_RX_V2.md\ - Documentación completa

##  Troubleshooting

**Problema**: No veo los cambios
**Solución**: 
1. Verificar que el flag esté activo: \localStorage.getItem('HC_RX_V2')\
2. Recargar la página con Ctrl+F5
3. Verificar en la consola si hay errores

**Problema**: El servidor no inicia
**Solución**:
1. Cerrar todos los procesos node: \	askkill /F /IM node.exe\
2. Limpiar caché: \pnpm store prune\
3. Reinstalar: \pnpm install\
4. Iniciar: \pnpm dev\

---

**Última actualización**: 08/11/2025 16:18
**Estado**:  Servidor corriendo
**URL**: http://localhost:5173/
