# Historia Clínica + Generador de Recetas V2 

## Descripción General

Sistema profesional rediseñado para la generación de recetas médicas con integración de IA, múltiples modos de entrada y experiencia optimizada para médicos.

##  Características Principales

###  Completamente Implementado

#### Bloque 1: Layout Profesional
- **Grid responsive 12 columnas** (7 editor / 5 preview)
- **Vista previa sticky** con glassmorphism y scroll independiente
- **Panel de contexto interactivo** con chips (Alergias, Enf. crónicas, Signos vitales, Estudios, Recetas previas)
- **Drawer inline** para detalles contextuales (cierra con Esc)
- **Footer sticky** con glassmorphism, CTAs y contadores en tiempo real
- **Preservación de foco** entre pasos

#### Bloque 2: Modos de Entrada
- **SegmentedControl moderno** con 3 modos:
  -  **Manual**: Interfaz completa paso a paso
  -  **Rápido**: Parser de texto multi-línea inteligente
  -  **Voz**: Dictado con Web Speech API
- **Persistencia de modo** en localStorage
- **Parser regex avanzado** para entrada rápida (formato: "medicamento dosis via frecuencia duración")
- **Estado de micrófono** en tiempo real
- **Help tooltip** contextual (Shift+?)

#### Bloque 3: Keyboard-First & Validaciones
- **Enter** para agregar primer resultado de búsqueda
- **Límite de 8 medicamentos** con mensaje de error helpful
- **Duplicar último medicamento** (botón + Alt+D)
- **Generador de horarios** desde "cada N horas"  chips editables
- **Advertencias de duplicados** al agregar medicamentos similares
- **Búsqueda fuzzy universal** (Fuse.js) por nombre/genérico/categoría
- **Comandos imperativos** avanzados: restoreDraft, setDiagnostico, appendDiagnostico, correctGrammar, duplicateLast

#### Bloque 4: IA Asistida 
- **Panel de sugerencias inteligentes** con gradiente purple/indigo
- **Sugerencias contextuales** basadas en diagnóstico y medicamentos
- **4 tipos de sugerencias**: diagnóstico, medicamento, plan, observación
- **Indicador de confianza** (porcentaje)
- **Click-to-insert** con feedback visual (highlight 5s)
- **Feedback thumbs up/down** para mejorar sugerencias
- **Botón "Corregir redacción"** integrado con contador
- **Registro de auditoría IA** expandible
- **Animaciones fluidas** con Framer Motion

#### Bloque 5: Autosave & Restore
- **Autosave cada 10s** cuando hay cambios
- **Banner de borrador** con animación y botones Restaurar/Descartar
- **Toast con timestamp** al guardar
- **Clave por paciente**: HC_RX_DRAFT_
- **Sin pérdida de datos** al cambiar de modo

#### Bloque 6-7: Tokens Visuales & CSS
- **Design System completo** con tokens CSS custom properties
- **Spacing System** basado en 8px
- **Typography Scale** optimizada para lectura médica
- **Paleta de colores** Medical Green Primary + semánticos
- **Shadows & Radius** consistentes
- **Transiciones** con cubic-bezier suaves
- **Scrollbar estilizado** para preview sticky
- **Glassmorphism** en preview y footer
- **Animaciones** hc-fade-in y hc-pulse

#### Bloque 8: Telemetría
- **HC_OPEN**: al abrir la página
- **RX_MODE_CHANGE**: al cambiar modo
- **RX_SAVE_DRAFT**: al guardar borrador
- **RX_PDF_VIEW**: al generar PDF
- **RX_AI_SUGGEST**: al insertar sugerencia IA
- **Hook useAuditLog** integrado con localStorage

###  Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| F2 | Toggle micrófono (modo voz) |
| Alt+N | Agregar medicamento rápido |
| Alt+D | Duplicar último medicamento |
| Ctrl+Enter | Siguiente paso |
| Ctrl+/ | Focus en búsqueda |
| Alt+S | Firmar y generar PDF |
| Shift+? | Ayuda de modos |
| Esc | Cerrar drawer/help |
| Enter | (en búsqueda) Agregar primer resultado |

##  Activación

### Opción 1: LocalStorage
\\\javascript
localStorage.setItem('HC_RX_V2', 'true')
\\\

### Opción 2: Variable de entorno
\\\env
VITE_HC_RX_V2=true
\\\

##  Estructura de Archivos

\\\
src/
 components/
    medicina/
        PrescripcionBuilderInline.tsx      # Builder core (sin cambios)
        PrescripcionBuilderWrapperV2.tsx   # Wrapper V2 con todos los features
        AIAssistPanel.tsx                  # Panel de IA asistida
        PrescriptionPreview.tsx            # Vista previa de receta
        hc_rx_v2.css                       # Tokens visuales y estilos
 lib/
    flags.ts                               # Feature flags
 hooks/
    useAuditLog.ts                        # Hook de telemetría
 pages/
     HistorialClinico.tsx                  # Integración condicional
\\\

##  Design Tokens

\\\css
[data-hc-rx-v2] {
  /* Spacing */
  --hc-space-xs: 4px
  --hc-space-sm: 8px
  --hc-space-md: 16px
  --hc-space-lg: 24px
  --hc-space-xl: 32px

  /* Colors */
  --hc-primary-500: #10B981   /* Medical Green */
  --hc-neutral-900: #171717   /* Text Primary */
  
  /* Shadows */
  --hc-shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1)
  
  /* Transitions */
  --hc-transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1)
}
\\\

##  Modo Rápido - Formato de Entrada

\\\
medicamento dosis via frecuencia duración
\\\

**Ejemplos:**
\\\
amoxicilina 500 mg VO c/8h x 7d
paracetamol 500 mg VO PRN
ibuprofeno 400 mg VO c/8h x 5d
\\\

**Frecuencias soportadas:**
- c/6h, c/8h, c/12h, c/24h
- PRN o según necesidad

##  IA Asistida

El sistema genera sugerencias contextuales basadas en:

1. **Diagnóstico ingresado**  Sugerencias de planes y medicamentos
2. **Medicamentos agregados**  Sugerencias de seguimiento
3. **Síntomas comunes**  Recomendaciones de tratamiento

**Niveles de confianza:**
-  **85-100%**: Alta confianza
-  **70-84%**: Confianza media
-  **<70%**: Revisar cuidadosamente

##  Telemetría & Auditoría

Todos los eventos son registrados en:
\\\javascript
localStorage.getItem('demo_audit_logs')
\\\

**Eventos rastreados:**
- Apertura de página
- Cambios de modo
- Guardado de borradores
- Generación de PDFs
- Sugerencias IA insertadas
- Correcciones gramaticales

##  Seguridad & Privacidad

-  Sin cambios al builder original (no destructivo)
-  Borradores almacenados localmente
-  Sin envío de datos a servidores externos
-  IA simulada con reglas locales (demo)
-  Auditoría completa de acciones

##  Próximas Mejoras (Roadmap)

- [ ] Selector categorías  medicamento  presentación/gramaje
- [ ] Validación de dosis fuera de rango
- [ ] Bloqueo hard si hay alergias críticas
- [ ] QR code en PDF generado
- [ ] A11y completa (roles ARIA, navegación teclado)
- [ ] Tests unitarios y de integración
- [ ] IA real con API externa

##  Notas de Desarrollo

### Non-Breaking Changes
El sistema V2 está completamente encapsulado detrás de un feature flag. El builder original (PrescripcionBuilderInline) **NO ha sido modificado** en su funcionalidad core, solo se agregaron props opcionales para el adapter.

### Performance
- Fuzzy search optimizado con Fuse.js
- Autosave debounced a 10s
- Animaciones con will-change para hardware acceleration
- Preview sticky con ackdrop-filter: blur(10px)

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Web Speech API (opcional, fallback disponible)

##  Contribuciones

Para reportar bugs o sugerir mejoras:
1. Verificar que el flag HC_RX_V2 esté activo
2. Revisar consola del navegador
3. Incluir screenshots/video si es visual
4. Mencionar modo activo (Manual/Rápido/Voz)

---

**Versión:** 2.0.0  
**Última actualización:** 8 de noviembre, 2025  
**Autor:** Lead Product Designer + Front Lead  
**Stack:** React 18 + TypeScript + Tailwind CSS + Framer Motion
