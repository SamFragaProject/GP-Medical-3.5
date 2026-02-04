import { supabase } from '@/lib/supabase'
import type {
    CFDI,
    ClienteFiscal,
    EmisorConfig,
    ConceptoFactura
} from '@/types/facturacion'

export const billingService = {
    // --- EMISOR ---
    async getEmisorConfig(empresaId: string): Promise<EmisorConfig | null> {
        const { data, error } = await supabase
            .from('facturacion_emisor')
            .select('*')
            .eq('empresa_id', empresaId)
            .single()

        if (error && error.code !== 'PGRST116') throw error
        return data
    },

    async saveEmisorConfig(config: Partial<EmisorConfig>): Promise<EmisorConfig> {
        const { data, error } = await supabase
            .from('facturacion_emisor')
            .upsert(config)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // --- CLIENTES ---
    async getClientes(empresaId: string, search?: string): Promise<ClienteFiscal[]> {
        let query = supabase
            .from('facturacion_clientes')
            .select('*')
            .eq('empresa_id', empresaId)
            .order('razon_social')

        if (search) {
            query = query.or(`razon_social.ilike.%${search}%,rfc.ilike.%${search}%`)
        }

        const { data, error } = await query
        if (error) throw error
        return data || []
    },

    async createCliente(cliente: Omit<ClienteFiscal, 'id'>): Promise<ClienteFiscal> {
        const { data, error } = await supabase
            .from('facturacion_clientes')
            .insert(cliente)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // --- FACTURAS (CFDI) ---
    async getFacturas(empresaId: string): Promise<CFDI[]> {
        const { data, error } = await supabase
            .from('facturacion_cfdis')
            .select(`
                *,
                cliente:facturacion_clientes(*)
            `)
            .eq('empresa_id', empresaId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    async createFacturaBorrador(
        factura: Omit<CFDI, 'id' | 'created_at' | 'estado'>,
        conceptos: ConceptoFactura[]
    ): Promise<CFDI> {
        // 1. Crear Cabecera
        const { data: cfdi, error: errCfdi } = await supabase
            .from('facturacion_cfdis')
            .insert({
                ...factura,
                estado: 'borrador'
            })
            .select()
            .single()

        if (errCfdi) throw errCfdi

        // 2. Insertar Conceptos
        const conceptosConId = conceptos.map(c => ({
            ...c,
            cfdi_id: cfdi.id,
            impuestos_json: c.impuestos // Mapeo especial si necesario
        }))

        const { error: errConceptos } = await supabase
            .from('facturacion_conceptos')
            .insert(conceptosConId)

        if (errConceptos) {
            // Rollback manual (opcional)
            console.error(errConceptos)
            // throw errConceptos
        }

        return cfdi
    },

    async updateEstadoFactura(id: string, updates: Partial<CFDI>): Promise<void> {
        const { error } = await supabase
            .from('facturacion_cfdis')
            .update(updates)
            .eq('id', id)

        if (error) throw error
    },

    async getFacturaById(id: string): Promise<CFDI | null> {
        const { data, error } = await supabase
            .from('facturacion_cfdis')
            .select(`
                *,
                cliente:facturacion_clientes(*),
                conceptos:facturacion_conceptos(*)
            `)
            .eq('id', id)
            .single()

        if (error) return null
        return data
    }
}
