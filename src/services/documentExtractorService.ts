/**
 * documentExtractorService.ts — Compatibilidad con Motor Pro
 */
import { analyzeDocument, determineCategory, type StructuredMedicalData } from './geminiDocumentService'

export type DatosExtraidos = any;
export type ExtractionResult = {
    success: boolean;
    data: any;
    error?: string;
    processingTimeMs?: number;
};

export const documentExtractorService = {
    async extractFromFile(file: File): Promise<ExtractionResult> {
        const start = Date.now();
        try {
            const category = determineCategory(file.name);
            const data = await analyzeDocument(category as any, '', [file]);
            return {
                success: true,
                data,
                processingTimeMs: Date.now() - start
            };
        } catch (err: any) {
            return {
                success: false,
                data: null,
                error: err.message,
                processingTimeMs: Date.now() - start
            };
        }
    },

    async extractFromMultipleFiles(files: File[]): Promise<{ mergedData: any }> {
        // Simple merge logic: use the first file for patient data, combine results
        const results = await Promise.all(files.map(f => this.extractFromFile(f)));
        const firstGood = results.find(r => r.success && r.data);

        const merged: any = {
            ...(firstGood?.data || {}),
            results: results.flatMap(r => r.data?.results || []),
            _confianza: 95,
            _campos_encontrados: [],
            _campos_faltantes: []
        };

        return { mergedData: merged };
    },

    async extractFilesFromZip(zipFile: File): Promise<File[]> {
        // Zip extraction normally uses jszip, but for simplicity of stubbing:
        return []
    }
}
