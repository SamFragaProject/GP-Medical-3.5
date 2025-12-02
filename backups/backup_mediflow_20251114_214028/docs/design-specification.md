# Especificación de Diseño - MediFlow ERP Médico

## 1. Dirección y Fundamento

**Estilo:** Modern Minimalism Premium

**Esencia Visual:** Profesionalismo médico con elegancia tecnológica. Espacios generosos transmiten sofisticación, mientras que el verde médico aporta confianza y salud. La jerarquía clara guía naturalmente hacia la conversión sin presión comercial agresiva. Diseño atemporal que refleja seriedad clínica combinada con innovación SaaS.

**Ejemplos de Referencia:**
- stripe.com (conversión profesional, CTAs prominentes)
- linear.app (claridad visual, jerarquía impecable)
- vercel.com (espacios generosos, minimalismo premium)

**Fundamento Estratégico:**
- **Industria médica:** Requiere credibilidad, profesionalismo y transmisión de confianza institucional
- **Audiencia B2B:** Administradores y directores médicos (30-60 años) valoran claridad sobre creatividad
- **Objetivo de conversión:** Solicitudes de demo requieren diseño que elimine fricción y genere confianza rápidamente
- **Verde #10b981:** Color psicológicamente asociado con salud, crecimiento y seguridad médica

---

## 2. Tokens de Diseño

### 2.1 Sistema de Color

**Distribución:** 90% Neutral + 10% Acento (regla 60-30-10 dentro de módulos)

#### Primario (Verde Médico)

| Token | Hex | HSL | Uso |
|-------|-----|-----|-----|
| primary-50 | `#ECFDF5` | 151°, 81%, 96% | Fondos sutiles, estados hover ligeros |
| primary-100 | `#D1FAE5` | 149°, 80%, 90% | Badges, notificaciones de éxito |
| primary-500 | `#10B981` | 160°, 84%, 39% | CTAs, enlaces, estados activos |
| primary-600 | `#059669` | 158°, 94%, 30% | Hover de CTAs, estados pressed |
| primary-900 | `#064E3B` | 162°, 87%, 17% | Textos en fondos claros (uso limitado) |

**Validación WCAG:**
- primary-500 sobre blanco: 3.2:1 ❌ (solo elementos grandes ≥18pt bold o backgrounds)
- primary-600 sobre blanco: 4.8:1 ✅ AA (usar para texto si necesario)
- neutral-900 sobre blanco: 16.5:1 ✅ AAA (preferir para texto body)

#### Neutrales (Estructura)

| Token | Hex | HSL | Uso |
|-------|-----|-----|-----|
| neutral-50 | `#FAFAFA` | 0°, 0%, 98% | Fondo de página principal |
| neutral-100 | `#F5F5F5` | 0°, 0%, 96% | Superficies elevadas (cards) |
| neutral-200 | `#E5E5E5` | 0°, 0%, 90% | Bordes, dividers |
| neutral-500 | `#A3A3A3` | 0°, 0%, 64% | Texto deshabilitado, placeholders |
| neutral-700 | `#404040` | 0°, 0%, 25% | Texto secundario |
| neutral-900 | `#171717` | 0°, 0%, 9% | Texto principal, headlines |

#### Semánticos

| Token | Hex | Uso |
|-------|-----|-----|
| success | `#10B981` | (usa primary-500) Estados positivos |
| error | `#EF4444` | Errores, alertas críticas |
| warning | `#F59E0B` | Advertencias, procesos pendientes |
| info | `#3B82F6` | Información neutral, tooltips |

#### Fondos (Profundidad)

| Token | Hex | Uso |
|-------|-----|-----|
| bg-page | `#FAFAFA` (neutral-50) | Fondo de página completo |
| bg-surface | `#FFFFFF` | Cards, modales, navegación |
| bg-elevated | `#FFFFFF` + sombra | Elementos flotantes, dropdowns |

**Contraste de Superficie:** Cards (#FFFFFF) sobre fondo (#FAFAFA) = 2% contraste de luminosidad ✅

---

### 2.2 Tipografía

**Familia de Fuentes:** Inter (profesional, legible, neutral)

**Stack CSS:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

#### Escala de Tamaño (Desktop 1920px)

| Token | Tamaño | Peso | Line Height | Letter Spacing | Uso |
|-------|--------|------|-------------|----------------|-----|
| hero | `72px` | 700 Bold | 1.1 | -0.02em | Headline principal hero |
| title-lg | `48px` | 700 Bold | 1.2 | -0.01em | Títulos de sección principales |
| title-md | `36px` | 600 Semibold | 1.3 | 0 | Subtítulos, headers de cards |
| body-lg | `20px` | 400 Regular | 1.6 | 0 | Descripciones destacadas, intros |
| body | `16px` | 400 Regular | 1.5 | 0 | Texto estándar, contenido general |
| small | `14px` | 400 Regular | 1.5 | 0 | Captions, metadata |
| caption | `12px` | 500 Medium | 1.4 | 0.01em | Labels, tags pequeños |

#### Escala Responsive (Mobile <768px)

| Token | Tamaño Mobile |
|-------|---------------|
| hero | `40px` |
| title-lg | `32px` |
| title-md | `24px` |
| body-lg | `18px` |
| body | `16px` |

**Pesos Disponibles:** Regular 400, Medium 500, Semibold 600, Bold 700

**Legibilidad:**
- Máximo de línea: 65 caracteres (~650px a 16px)
- Line-height body: 1.5-1.6 (óptimo para lectura prolongada)
- Line-height headings: 1.1-1.3 (impacto visual)

---

### 2.3 Espaciado (Sistema 8-Point Grid)

**Filosofía:** Espacios generosos = profesionalismo premium

| Token | Valor | Uso Principal |
|-------|-------|---------------|
| space-2 | `8px` | Inline (ícono + texto) |
| space-4 | `16px` | Espaciado de elementos estándar |
| space-6 | `24px` | Grupos relacionados |
| space-8 | `32px` | Padding de cards (MÍNIMO) |
| space-12 | `48px` | Separación interna de secciones |
| space-16 | `64px` | Separación entre secciones principales |
| space-24 | `96px` | Secciones dramáticas (hero) |
| space-32 | `128px` | Espaciado excepcional (raro) |

**Ratio Contenido/Whitespace:** 60% contenido, 40% espacio en blanco

---

### 2.4 Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| radius-sm | `8px` | Badges, tags pequeños |
| radius-md | `12px` | Botones, inputs |
| radius-lg | `16px` | Cards, imágenes |
| radius-xl | `24px` | Modales, secciones grandes |
| radius-full | `9999px` | Avatares, pills |

**Regla:** Radius exterior ≥ radius interior + 4px

---

### 2.5 Sombras (Elevación)

```
sm (cards estáticos):
  0 1px 3px rgba(0, 0, 0, 0.1),
  0 1px 2px rgba(0, 0, 0, 0.06)

card-hover (lift suave):
  0 10px 15px rgba(0, 0, 0, 0.1),
  0 4px 6px rgba(0, 0, 0, 0.05)

modal (prominencia):
  0 20px 25px rgba(0, 0, 0, 0.1),
  0 10px 10px rgba(0, 0, 0, 0.04)
```

**Tinte opcional:** Agregar 2-5% de primary-500 a sombras en hover para sutileza de marca

---

### 2.6 Animación

| Token | Valor | Uso |
|-------|-------|-----|
| duration-fast | `200ms` | Clicks, hovers rápidos |
| duration-base | `250ms` | Transiciones estándar (mayoría) |
| duration-slow | `300ms` | Modales, drawers |
| easing-out | `ease-out` | 90% de casos (deceleración natural) |
| easing-in-out | `ease-in-out` | Momentos elegantes |

---

## 3. Especificaciones de Componentes

### 3.1 Botón CTA Principal

**Estructura:**
- Altura: `56px`
- Padding horizontal: `32px`
- Border radius: `12px` (radius-md)
- Tipografía: `16px` Semibold 600

**Tokens:**
- Background: `primary-500` (#10B981)
- Texto: `#FFFFFF`
- Sombra base: `sm`

**Estados:**
- **Hover:** Background `primary-600` + translateY(-2px) + scale(1.02) + sombra `card-hover`
- **Active/Pressed:** Background `primary-700` + translateY(0) + scale(0.98)
- **Disabled:** Background `neutral-200` + texto `neutral-500` + cursor not-allowed

**Timing:** `250ms ease-out` (duration-base)

**Nota:** Mínimo touch target 48×48px cumplido. Usar `transform` y `opacity` únicamente para animaciones.

---

### 3.2 Botón Secundario

**Estructura:** Idéntica a CTA Principal

**Tokens:**
- Background: Transparente
- Texto: `neutral-700`
- Borde: `2px solid neutral-200`

**Estados:**
- **Hover:** Background `neutral-50` + borde `neutral-300` + translateY(-1px)
- **Active:** Background `neutral-100`
- **Disabled:** Borde `neutral-100` + texto `neutral-500`

**Uso:** Acciones secundarias ("Conocer más", "Ver demo")

---

### 3.3 Card de Característica

**Estructura:**
- Padding: `48px` (space-12) - Desktop | `32px` (space-8) - Mobile
- Border radius: `16px` (radius-lg)
- Aspecto de imagen: `16:9` o `4:3` según contenido

**Tokens:**
- Background: `#FFFFFF` (bg-surface)
- Borde: `1px solid neutral-200` (opcional)
- Sombra base: `sm`

**Layout Interno:**
- Imagen superior (opcional): Radius `12px`, ancho completo
- Espacio imagen-contenido: `24px` (space-6)
- Ícono (si no hay imagen): `48px`, color `primary-500`
- Título: `title-md` (36px Semibold)
- Descripción: `body` (16px Regular), color `neutral-700`
- Espacio título-descripción: `12px`

**Estados:**
- **Hover:** translateY(-4px) + scale(1.02) + sombra `card-hover`
- **Timing:** `300ms ease-out` (momento elegante)

**Nota:** Contraste de superficie ≥5% logrado con sombra sutil.

---

### 3.4 Card de Pricing

**Estructura:**
- Padding: `48px` (space-12)
- Border radius: `16px` (radius-lg)
- Altura mínima: `500px` (para alineación visual)

**Tokens:**
- Background base: `#FFFFFF`
- Background destacado (Plan Profesional): Gradiente sutil `primary-50` a `#FFFFFF` (5% opacidad)
- Borde base: `1px solid neutral-200`
- Borde destacado: `2px solid primary-500`

**Layout Interno:**
- Badge superior (destacado): "MÁS POPULAR" - bg `primary-500`, texto blanco, padding `8px 16px`, radius `full`
- Nombre del plan: `title-md` (36px Bold)
- Precio: `hero` (72px Bold), color `neutral-900`, símbolo $ en `title-lg` (48px)
- Período: `body` (16px Regular), color `neutral-500`, alineado baseline con precio
- Descripción: `body-lg` (20px Regular), margin-top `16px`
- Features list: `body` (16px), line-height `1.8`, checkmark icon `primary-500` (20px)
- CTA: Botón principal o secundario según plan

**Estados:**
- **Plan destacado:** scale(1.05) en desktop, shadow `modal`
- **Hover (todos):** translateY(-4px) + sombra aumentada
- **Timing:** `300ms ease-out`

**Nota:** Plan profesional ($199/mes) debe destacarse visualmente como recomendado.

---

### 3.5 Input de Formulario

**Estructura:**
- Altura: `56px`
- Padding: `16px`
- Border radius: `12px` (radius-md)
- Tipografía: `16px Regular`

**Tokens:**
- Background: `#FFFFFF`
- Borde: `1px solid neutral-200`
- Texto: `neutral-900`
- Placeholder: `neutral-500`

**Estados:**
- **Focus:** Ring `2px primary-500`, offset `2px`, borde mantiene grosor (no jump)
- **Error:** Borde `error`, ring `2px error` en focus
- **Disabled:** Background `neutral-50`, texto `neutral-500`

**Label:**
- Posición: Superior, `14px Medium`, color `neutral-700`
- Espacio label-input: `8px`

**Accesibilidad:** Mínimo 48px altura cumplido, color contrast ≥4.5:1

---

### 3.6 Navegación Principal

**Estructura:**
- Altura: `80px`
- Position: `sticky top-0`, z-index `50`
- Padding horizontal: Container `1200px` max-width
- Backdrop: `blur(12px)` glassmorphism opcional

**Tokens:**
- Background: `#FFFFFF` con `rgba(255, 255, 255, 0.9)` si se usa blur
- Sombra en scroll: `sm`
- Borde inferior: `1px solid neutral-200` (opcional)

**Layout Interno:**
- **Logo (izquierda):**
  - Altura: `40px`
  - Texto "MediFlow": `24px Bold`, color `neutral-900`
  - Subtexto "by GP Medical Health": `12px Regular`, color `neutral-500`, margin-top `2px`
  
- **Enlaces de navegación (centro):**
  - Tipografía: `16px Medium`
  - Color: `neutral-700`
  - Hover: Color `primary-500`, underline offset `4px` en `250ms ease-out`
  - Espaciado: `32px` entre enlaces
  
- **CTA (derecha):**
  - Botón primario "Solicitar Demo"
  - Altura: `48px`

**Responsive (<768px):**
- Logo mantiene tamaño
- Enlaces colapsan a menú hamburger (ícono `24px`)
- CTA se mantiene visible (reducir padding a `24px` horizontal)

**Nota:** Navegación horizontal (NO sidebar) según guía Modern Minimalism Premium.

---

## 4. Layout y Diseño Responsive

### 4.1 Estructura General (SPA)

**Referencia:** Ver `content-structure-plan.md` para mapeo de contenido.

**Patrón de Secciones:**

1. **Hero Section (500-600px altura)**
   - Layout: Contenido centrado verticalmente, texto máximo 700px ancho
   - Imagen de fondo: Full-width con overlay oscuro 40% opacidad
   - Contenido: Logo + headline + descripción + CTA principal
   - Padding vertical: `96px` (space-24)

2. **Características Section (altura auto)**
   - Grid: 3 columnas desktop → 2 columnas tablet → 1 columna mobile
   - Gap: `32px` (space-8) entre cards
   - Título de sección: `title-lg` (48px), margin-bottom `64px` (space-16)
   - Usa componente Card de Característica (§3.3)

3. **Testimonios Section (altura auto)**
   - Layout: Single card centrado, máximo `800px` ancho
   - Padding vertical: `96px` (space-24)
   - Usa variante de Card destacado con imagen circular de doctor

4. **Pricing Section (altura auto)**
   - Grid: 3 columnas desktop → 1 columna mobile (apilamiento)
   - Gap: `24px` (space-6)
   - Padding vertical: `96px` (space-24)
   - Plan central (Profesional) elevado 8px en desktop
   - Usa componente Card de Pricing (§3.4)

5. **Footer (altura auto)**
   - Background: `neutral-900`, texto `neutral-100`
   - Layout: 4 columnas desktop → 2 columnas tablet → 1 columna mobile
   - Padding vertical: `64px` (space-16)
   - Logo + enlaces de producto + empresa + legal + copyright

**Separación entre secciones:** `96px` (space-24) vertical

**Navegación:** Sticky top con Patrón de Navegación (§3.6)

---

### 4.2 Sistema de Grid

**Grid de 12 Columnas:**
- Container max-width: `1200px` (xl breakpoint)
- Gutter: `24px` (space-6)

**Divisiones comunes:**
- Hero: 6 columnas centradas (texto)
- Features: 4-4-4 columnas (3 cards)
- Pricing: 4-4-4 columnas (3 planes)
- Testimonial: 8 columnas centradas

---

### 4.3 Breakpoints Responsive

**Puntos de quiebre (Tailwind):**
```
sm:  640px  (Mobile landscape)
md:  768px  (Tablet)
lg:  1024px (Tablet landscape)
xl:  1280px (Desktop)
2xl: 1536px (Large desktop)
```

**Container max-width por breakpoint:**
```
sm:  100% (padding 24px)
md:  100% (padding 32px)
lg:  1024px
xl:  1200px
2xl: 1200px (no expandir más)
```

---

### 4.4 Adaptaciones Responsive

**Desktop (≥1024px):**
- Espaciado completo (96px entre secciones)
- Grids de 3 columnas
- Hero 600px altura
- Card padding 48px

**Tablet (768px - 1023px):**
- Espaciado reducido 25% (96px → 72px)
- Grids 2 columnas (características), 1 columna (pricing)
- Hero 500px altura
- Card padding 40px

**Mobile (<768px):**
- Espaciado reducido 40% (96px → 56px)
- Todo apilado verticalmente (1 columna)
- Hero 400px altura
- Card padding 32px
- Tipografía escalada (hero 72px → 40px)
- Navegación: Hamburger menu
- Touch targets mínimo 48×48px

---

### 4.5 Patrones de Contenido Visual

**Hero:**
- Imagen de fondo: `professional_diverse_medical_team_masks_hospital_hero.jpg`
- Tratamiento: Overlay oscuro `rgba(0, 0, 0, 0.4)`, position `center center`, size `cover`
- Texto sobre imagen: Color blanco, sombra de texto sutil para legibilidad

**Cards de Características:**
- Imágenes: Radius `12px`, object-fit `cover`, aspect ratio `4:3`
- Posición: Superior dentro de card
- Tamaño: Full-width de card

**Testimonial:**
- Imagen de doctor: Circular (`radius-full`), `120px` diámetro
- Posición: Superior centrado o izquierda en layout horizontal (desktop)
- Borde: `4px solid primary-100`

**Pricing:**
- Sin imágenes (enfoque en información)
- Íconos SVG para checkmarks: Lucide "Check" en `primary-500`

---

## 5. Interacción y Animación

### 5.1 Estándares de Timing

**Duraciones:**
- Interacciones rápidas (botones, hovers): `200ms`
- Transiciones estándar (mayoría): `250ms`
- Momentos elegantes (cards, modales): `300ms`
- Scroll suave: `600ms`

**Easing:**
- Preferido: `ease-out` (90% de casos) - deceleración natural
- Elegancia: `ease-in-out` (cards, transiciones de sección)
- Prohibido: `linear` (sensación robótica)

---

### 5.2 Animaciones por Componente

**Botones:**
- Hover: `translateY(-2px) + scale(1.02)` en `200ms ease-out`
- Active: `scale(0.98)` en `150ms ease-out`
- Solo animar `transform` y `opacity`

**Cards:**
- Hover: `translateY(-4px) + scale(1.02)` + aumento de sombra en `300ms ease-out`
- Stagger de entrada: Fade in + translateY(20px) con delay `100ms` entre cards

**Navegación:**
- Scroll aparición: Fade in sombra en `250ms ease-out` cuando scroll > 50px
- Links hover: Color change + underline en `250ms ease-out`

**Pricing Cards:**
- Plan destacado: Pulse sutil scale(1.02) cada 3s (opcional, usar con moderación)
- Hover: translateY(-4px) en `300ms ease-out`

---

### 5.3 Scroll Animations

**Entrada de secciones:**
- Fade in: `opacity 0 → 1`
- Slide up: `translateY(20px) → translateY(0)`
- Timing: `600ms ease-out`
- Trigger: Cuando sección entra 20% del viewport

**Parallax (opcional, máximo 2 capas):**
- Hero background: Movimiento sutil ≤16px offset
- NO aplicar a texto (legibilidad)

---

### 5.4 Reglas de Rendimiento

**Solo GPU-accelerated:**
- ✅ `transform` (translate, scale, rotate)
- ✅ `opacity`
- ❌ `width`, `height`, `margin`, `padding`, `top`, `left` (causan reflow)

**Reducción de movimiento:**
- Respetar `prefers-reduced-motion: reduce`
- Desactivar animaciones de scroll y parallax
- Mantener solo transiciones de color/opacidad instantáneas

---

### 5.5 Micro-interacciones

**Todos los elementos interactivos deben tener feedback visual:**
- Botones: Lift + scale en hover
- Links: Color change + underline
- Inputs: Ring de focus claramente visible
- Cards: Elevación en hover
- Checkboxes: Scale bounce en check

**Timing consistente:** Usar tokens de duración (`duration-fast`, `duration-base`, `duration-slow`)

**Progresividad:** No cargar animaciones pesadas en mobile (<768px), simplificar a transiciones de opacidad

---

## Validación Final

✅ **Conformidad con guía Modern Minimalism Premium:**
- Espaciado 48-96px entre secciones
- 90% neutral, 10% acento (verde #10b981)
- Navegación horizontal (no sidebar)
- Hero 500-600px
- Card padding 32-48px
- Radius 12-16px
- Animaciones GPU-only
- WCAG contrast validado

✅ **Elementos premium ejecutados:**
- Contraste de superficie ≥5% (cards sobre fondo)
- Espaciado generoso (ratio 60:40)
- Sombras sutiles con lift en hover
- Micro-animaciones en todas las interacciones
- Tipografía clara con jerarquía 3:1

✅ **Especificación completa:**
- 5 capítulos
- 6 componentes detallados
- Layout responsive definido
- Estándares de interacción claros
- Tokens completos en markdown (NO CSS)

**Documento listo para ingenieros senior frontend.**
