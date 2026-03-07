---
description: 📦 Skill Midudev — Código & Desarrollo. React moderno, TypeScript estricto, performance first.
---

# 📦 /midu — Midudev (Código & Desarrollo)

Cuando se invoque este skill, adopta la filosofía de desarrollo de Miguel Ángel Durán (Midudev) para escribir código frontend limpio, moderno y de alta calidad.

## Stack Preferido

- **React 19+** con hooks modernos y Server Components cuando aplique
- **Astro** para sitios estáticos (favorito 2025/2026)
- **Vite** como bundler — rápido, moderno, sin webpack legacy
- **Next.js** para apps fullstack con SSR/SSG
- **TypeScript** siempre — nunca JavaScript plano en producción

## JavaScript / TypeScript

### Variables
```typescript
// ✅ SIEMPRE const, solo let cuando sea estrictamente necesario
const users = await getUsers()
const total = users.length

// ❌ NUNCA var, NUNCA let innecesario
let count = 0 // Solo si se reasigna
```

### Funciones
```typescript
// ✅ Funciones puras — misma entrada, misma salida, sin side effects
const calculateIMC = (peso: number, altura: number): number => {
  return peso / (altura / 100) ** 2
}

// ✅ Parámetros nombrados con destructuring
const createPatient = ({ nombre, apellido, curp }: CreatePatientParams) => { ... }

// ❌ NUNCA más de 3 parámetros posicionales
// ❌ NUNCA funciones de más de 20 líneas — divide en subfunciones
```

### Naming conventions
```typescript
// ✅ Descriptivo y en inglés para código, español para UI labels
const isPatientActive = patient.status === 'activo'
const hasCompletedStudies = studies.length > 0

// ✅ Handlers con prefijo handle
const handleSubmit = () => { ... }
const handleFileUpload = (file: File) => { ... }

// ✅ Hooks custom con prefijo use
const usePatients = () => { ... }
const useSpirometryData = (patientId: string) => { ... }
```

## CSS

### Prioridades
1. **Custom Properties** (CSS variables) para tokens de diseño
2. **Container Queries** cuando sea responsive por componente
3. **CSS > JS** cuando sea posible — animaciones CSS son más performantes
4. **Tailwind** solo si el proyecto ya lo usa — no mezclar paradigmas

```css
/* ✅ Custom properties para theming */
:root {
  --color-primary: #06b6d4;
  --radius-lg: 1rem;
  --shadow-card: 0 1px 3px rgba(0,0,0,0.1);
}

/* ✅ Container queries para componentes reutilizables */
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card { display: grid; grid-template-columns: 1fr 2fr; }
}
```

## Performance

### Core Web Vitals — son ley
- **LCP** (Largest Contentful Paint) < 2.5s
- **FID/INP** (Interaction to Next Paint) < 200ms
- **CLS** (Cumulative Layout Shift) < 0.1

### Técnicas obligatorias
```typescript
// ✅ Lazy loading de componentes pesados
const EspirometriaTab = lazy(() => import('./EspirometriaTab'))

// ✅ Code splitting por ruta
const routes = [
  { path: '/pacientes', component: lazy(() => import('./PacientesHub')) },
  { path: '/agenda', component: lazy(() => import('./Agenda')) },
]

// ✅ Imágenes optimizadas
<img loading="lazy" decoding="async" src={url} width={300} height={200} />

// ✅ Memoización selectiva — NO memo de todo, solo lo costoso
const expensiveResult = useMemo(() => computeComplexAnalysis(data), [data])

// ❌ NUNCA useCallback/useMemo sin dependency array correcto
// ❌ NUNCA React.memo en componentes que siempre re-renderizan
```

## Testing

### TDD con Vitest + React Testing Library
```typescript
// ✅ Test describe-it pattern
describe('calculateSpirometryPattern', () => {
  it('should return NORMAL when FEV1/FVC >= 70 and FVC >= 80', () => {
    const result = calculatePattern({ fev1_fvc: 82, fvc_pct: 81 })
    expect(result).toBe('normal')
  })

  it('should return OBSTRUCTIVE when FEV1/FVC < 70', () => {
    const result = calculatePattern({ fev1_fvc: 65, fvc_pct: 85 })
    expect(result).toBe('obstructivo')
  })
})

// ✅ Testing Library — testear comportamiento, NO implementación
test('muestra datos del paciente al cargar', async () => {
  render(<PatientProfile id="123" />)
  expect(await screen.findByText('URIBE LOPEZ, FEDERICO')).toBeInTheDocument()
})
```

## Estructura de Proyecto

### Evolución según complejidad
```
// Nivel 1: Por tipo (proyectos pequeños)
src/
  components/
  hooks/
  services/
  pages/

// Nivel 2: Por feature (proyectos medianos) ← GP Medical está aquí
src/
  features/
    pacientes/
      components/
      hooks/
      services/
    expediente/
      components/
      hooks/
    agenda/

// Nivel 3: Por dominio (proyectos grandes)
src/
  domains/
    clinical/
    administrative/
    billing/
```

## React Patterns Modernos

### Custom Hooks para lógica de negocio
```typescript
// ✅ Separar lógica de UI
const useSpirometry = (patientId: string) => {
  const [data, setData] = useState<SpirometryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSpirometry(patientId).then(setData).finally(() => setLoading(false))
  }, [patientId])

  const isNormal = data?.patron === 'normal'
  const alerts = useMemo(() => calculateAlerts(data), [data])

  return { data, loading, isNormal, alerts }
}
```

### Composition over Inheritance
```typescript
// ✅ Componentes composables
<Card>
  <Card.Header icon={<Wind />} title="Espirometría" />
  <Card.Body>
    <ParameterTable data={spirometry} />
  </Card.Body>
  <Card.Footer>
    <Button onClick={handleExport}>Exportar PDF</Button>
  </Card.Footer>
</Card>
```

### Error Boundaries en producción
```typescript
// ✅ Siempre envolver features independientes
<ErrorBoundary fallback={<ErrorCard module="Espirometría" />}>
  <Suspense fallback={<Skeleton />}>
    <EspirometriaTab pacienteId={id} />
  </Suspense>
</ErrorBoundary>
```

## Checklist de código /midu

- [ ] ¿Usa `const` en vez de `let` donde sea posible?
- [ ] ¿Las funciones son puras y de menos de 20 líneas?
- [ ] ¿Los componentes tienen una sola responsabilidad?
- [ ] ¿Se usa lazy loading para rutas/componentes pesados?
- [ ] ¿Los tipos están definidos (no `any`)?
- [ ] ¿Los hooks custom separan lógica de UI?
- [ ] ¿Las animaciones usan CSS en vez de JS cuando es posible?
- [ ] ¿No hay console.log sueltos en producción?
- [ ] ¿El naming es descriptivo y consistente?
