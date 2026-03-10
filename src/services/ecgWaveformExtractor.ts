import * as pdfjsLib from 'pdfjs-dist'

// Configure pdf.js worker via CDN (reliable across all bundlers)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`


// ── Types ──
export interface LeadWaveform {
    /** Normalized amplitude points (-1 to 1, 0 = baseline) */
    points: number[]
    /** Lead name (I, II, III, aVR, aVL, aVF, V1-V6) */
    lead: string
}

export interface ExtractedWaveforms {
    leads: LeadWaveform[]
    sourceWidth: number
    sourceHeight: number
    success: boolean
    message: string
}

// ── Standard 12-lead ECG layout (BTL CardioPoint) ──
// [xStart%, yStart%, xEnd%, yEnd%] of the grid area
const LEAD_REGIONS: Record<string, [number, number, number, number]> = {
    // Left column (6 leads stacked vertically)
    'I': [0.00, 0.000, 0.50, 0.142],
    'II': [0.00, 0.142, 0.50, 0.285],
    'III': [0.00, 0.285, 0.50, 0.428],
    'aVR': [0.00, 0.428, 0.50, 0.571],
    'aVL': [0.00, 0.571, 0.50, 0.714],
    'aVF': [0.00, 0.714, 0.50, 0.857],
    // Right column
    'V1': [0.50, 0.000, 1.00, 0.142],
    'V2': [0.50, 0.142, 1.00, 0.285],
    'V3': [0.50, 0.285, 1.00, 0.428],
    'V4': [0.50, 0.428, 1.00, 0.571],
    'V5': [0.50, 0.571, 1.00, 0.714],
    'V6': [0.50, 0.714, 1.00, 0.857],
}

// ── Pixel classification helpers ──

const isRedGrid = (r: number, g: number, b: number): boolean =>
    (r > 150 && g < 130 && b < 130) ||
    (r > 180 && g < 160 && b < 160 && r - g > 40) ||
    (r > 120 && g < 100 && b < 100)

const isTraceDark = (r: number, g: number, b: number): boolean => {
    const brightness = (r + g + b) / 3
    return brightness < 100 && !isRedGrid(r, g, b)
}

// ── Core: Extract waveform from a pixel region ──
const extractWaveformFromRegion = (
    imageData: ImageData,
    fullWidth: number,
    x1: number, y1: number, x2: number, y2: number,
    targetPoints = 300
): number[] => {
    const regionWidth = x2 - x1
    const regionHeight = y2 - y1
    const rawPoints: number[] = []

    for (let col = 0; col < targetPoints; col++) {
        const imgX = Math.floor(x1 + (col / targetPoints) * regionWidth)
        const tracePixels: number[] = []

        for (let scanY = y1; scanY < y2; scanY++) {
            const pixIdx = (scanY * fullWidth + imgX) * 4
            if (isTraceDark(imageData.data[pixIdx], imageData.data[pixIdx + 1], imageData.data[pixIdx + 2])) {
                tracePixels.push(scanY)
            }
        }

        if (tracePixels.length > 0) {
            const centerY = tracePixels.reduce((sum, y) => sum + y, 0) / tracePixels.length
            const normalized = (centerY - y1) / regionHeight
            rawPoints.push(1 - 2 * normalized) // top = positive deflection
        } else {
            rawPoints.push(0) // baseline
        }
    }

    return smoothWaveform(rawPoints, 2)
}

// ── Moving average smoothing ──
const smoothWaveform = (points: number[], windowSize: number): number[] => {
    const result: number[] = []
    for (let i = 0; i < points.length; i++) {
        const start = Math.max(0, i - windowSize)
        const end = Math.min(points.length - 1, i + windowSize)
        let sum = 0
        for (let j = start; j <= end; j++) sum += points[j]
        result.push(sum / (end - start + 1))
    }
    return result
}

// ── Detect red grid area boundaries ──
const detectGridArea = (imageData: ImageData, width: number, height: number) => {
    let gridX1 = 0, gridY1 = 0, gridX2 = width, gridY2 = height

    // Top boundary
    for (let y = 0; y < height; y++) {
        let redCount = 0
        for (let x = 0; x < width; x += 3) {
            const idx = (y * width + x) * 4
            if (isRedGrid(imageData.data[idx], imageData.data[idx + 1], imageData.data[idx + 2])) redCount++
        }
        if (redCount > width / 30) { gridY1 = y; break }
    }

    // Bottom boundary
    for (let y = height - 1; y > gridY1; y--) {
        let redCount = 0
        for (let x = 0; x < width; x += 3) {
            const idx = (y * width + x) * 4
            if (isRedGrid(imageData.data[idx], imageData.data[idx + 1], imageData.data[idx + 2])) redCount++
        }
        if (redCount > width / 30) { gridY2 = y; break }
    }

    // Left boundary
    for (let x = 0; x < width; x++) {
        let redCount = 0
        for (let y = gridY1; y < gridY2; y += 3) {
            const idx = (y * width + x) * 4
            if (isRedGrid(imageData.data[idx], imageData.data[idx + 1], imageData.data[idx + 2])) redCount++
        }
        if (redCount > (gridY2 - gridY1) / 30) { gridX1 = x; break }
    }

    // Right boundary
    for (let x = width - 1; x > gridX1; x--) {
        let redCount = 0
        for (let y = gridY1; y < gridY2; y += 3) {
            const idx = (y * width + x) * 4
            if (isRedGrid(imageData.data[idx], imageData.data[idx + 1], imageData.data[idx + 2])) redCount++
        }
        if (redCount > (gridY2 - gridY1) / 30) { gridX2 = x; break }
    }

    return { gridX1, gridY1, gridX2, gridY2 }
}

// ── Extract from rendered canvas (shared logic) ──
const extractFromCanvas = (canvas: HTMLCanvasElement): ExtractedWaveforms => {
    const ctx = canvas.getContext('2d')!
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const grid = detectGridArea(imageData, canvas.width, canvas.height)
    const gridWidth = grid.gridX2 - grid.gridX1
    const gridHeight = grid.gridY2 - grid.gridY1

    if (gridWidth < 100 || gridHeight < 100) {
        return { leads: [], sourceWidth: canvas.width, sourceHeight: canvas.height, success: false, message: 'No se detectó la cuadrícula roja del ECG.' }
    }

    const leads: LeadWaveform[] = []

    for (const [leadName, [xPct1, yPct1, xPct2, yPct2]] of Object.entries(LEAD_REGIONS)) {
        const x1 = Math.floor(grid.gridX1 + xPct1 * gridWidth)
        const y1 = Math.floor(grid.gridY1 + yPct1 * gridHeight)
        const x2 = Math.floor(grid.gridX1 + xPct2 * gridWidth)
        const y2 = Math.floor(grid.gridY1 + yPct2 * gridHeight)
        const points = extractWaveformFromRegion(imageData, canvas.width, x1, y1, x2, y2, 300)
        leads.push({ lead: leadName, points })
    }

    const hasData = leads.some(l => {
        const range = Math.max(...l.points) - Math.min(...l.points)
        return range > 0.1
    })

    return {
        leads,
        sourceWidth: canvas.width,
        sourceHeight: canvas.height,
        success: hasData,
        message: hasData
            ? `${leads.length} derivaciones digitalizadas`
            : 'Trazados vacíos — la imagen podría no contener un ECG con cuadrícula roja.'
    }
}

// ── Extract waveforms from PDF ──
export const extractWaveformsFromPDF = async (file: File): Promise<ExtractedWaveforms> => {
    try {
        const pdf = await pdfjsLib.getDocument(await file.arrayBuffer()).promise
        const page = await pdf.getPage(1)
        const scale = 3
        const viewport = page.getViewport({ scale })

        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')!
        await page.render({ canvasContext: ctx, viewport } as any).promise

        return extractFromCanvas(canvas)
    } catch (err: any) {
        return { leads: [], sourceWidth: 0, sourceHeight: 0, success: false, message: `Error PDF: ${err.message}` }
    }
}

// ── Extract waveforms from image ──
export const extractWaveformsFromImage = async (file: File): Promise<ExtractedWaveforms> => {
    try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const el = new Image()
            el.onload = () => resolve(el)
            el.onerror = reject
            el.src = URL.createObjectURL(file)
        })

        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)
        URL.revokeObjectURL(img.src)

        return extractFromCanvas(canvas)
    } catch (err: any) {
        return { leads: [], sourceWidth: 0, sourceHeight: 0, success: false, message: `Error imagen: ${err.message}` }
    }
}

// ── Auto-detect file type and extract ──
export const extractWaveforms = async (file: File): Promise<ExtractedWaveforms> => {
    if (file.type === 'application/pdf') return extractWaveformsFromPDF(file)
    if (file.type.startsWith('image/')) return extractWaveformsFromImage(file)
    return { leads: [], sourceWidth: 0, sourceHeight: 0, success: false, message: 'Formato no soportado. Usa PDF o imagen.' }
}
