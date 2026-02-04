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
    async getClientes(empresa_id: string, search?: string): Promise<ClienteFiscal[]> {
        let query = supabase
            .from('facturacion_clientes')
            .select('*')
            .eq('empresa_id', empresa_id)
            .order('razon_social')

        if (search) {
            query = query.or(`razon_social.ilike.%${search}%,rfc.ilike.%${search}%`)
        }

        const { data, error } = await query
        if (error) throw error

        return (data || []).map(c => ({
            id: c.id,
            rfc: c.rfc,
            razonSocial: c.razon_social,
            email: c.email_envio,
            direccion: {
                calle: c.direccion_fiscal || '',
                numero: '', // No separado en BD
                colonia: '',
                ciudad: '',
                estado: '',
                cp: c.codigo_postal,
                pais: 'México'
            },
            tipo: c.rfc.length === 12 ? 'moral' : 'fisica',
            regimenFiscal: c.regimen_fiscal,
            usoCFDI: c.uso_cfdi
        }))
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
    async getFacturas(empresa_id: string): Promise<CFDI[]> {
        const { data, error } = await supabase
            .from('facturacion_cfdis')
            .select(`
                *,
                cliente:facturacion_clientes(*)
            `)
            .eq('empresa_id', empresa_id)
            .order('created_at', { ascending: false })

        if (error) throw error

        return (data || []).map(f => ({
            id: f.id,
            folio: f.folio || '',
            fechaEmision: new Date(f.fecha_emision),
            fechaVencimiento: new Date(f.fecha_emision), // Fallback
            cliente: f.cliente ? {
                id: f.cliente.id,
                rfc: f.cliente.rfc,
                razonSocial: f.cliente.razon_social,
                email: f.cliente.email_envio,
                direccion: {
                    calle: f.cliente.direccion_fiscal || '',
                    numero: '',
                    colonia: '',
                    ciudad: '',
                    estado: '',
                    cp: f.cliente.codigo_postal,
                    pais: 'México'
                },
                tipo: f.cliente.rfc.length === 12 ? 'moral' : 'fisica',
                regimenFiscal: f.cliente.regimen_fiscal,
                usoCFDI: f.cliente.uso_cfdi
            } : ({} as any),
            servicios: [], // Se cargan por ID si es necesario
            subtotal: f.subtotal,
            impuestos: f.total_impuestos_trasladados,
            total: f.total,
            moneda: f.moneda,
            estado: f.estado,
            metodoPago: f.metodo_pago,
            lugarExpedicion: '', // No en cabecera directa
            regimeFiscal: '601', // Default emisor
            usoCFDI: 'G03',
            serie: f.serie || '',
            numero: parseInt(f.folio?.split('-')[1] || '0'),
            created_at: new Date(f.created_at),
            updated_at: new Date(f.created_at)
        }))
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
            impuestos_json: c.impuesto // Mapeo especial si necesario
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
        const { data: f, error } = await supabase
            .from('facturacion_cfdis')
            .select(`
                *,
                cliente:facturacion_clientes(*),
                conceptos:facturacion_conceptos(*)
            `)
            .eq('id', id)
            .single()

        if (error || !f) return null

        return {
            id: f.id,
            folio: f.folio || '',
            serie: f.serie || '',
            numero: parseInt(f.folio?.split('-')[1] || '0'),
            fechaEmision: new Date(f.fecha_emision),
            fechaVencimiento: new Date(f.fecha_emision),
            cliente: f.cliente ? {
                id: f.cliente.id,
                rfc: f.cliente.rfc,
                razonSocial: f.cliente.razon_social,
                email: f.cliente.email_envio,
                direccion: {
                    calle: f.cliente.direccion_fiscal || '',
                    cp: f.cliente.codigo_postal,
                    pais: 'México'
                } as any,
                regimenFiscal: f.cliente.regimen_fiscal,
                usoCFDI: f.cliente.uso_cfdi
            } : ({} as any),
            servicios: (f.conceptos || []).map((c: any) => ({
                id: c.id,
                servicioId: c.servicio_id,
                servicioNombre: c.descripcion,
                cantidad: c.cantidad,
                precioUnitario: c.valor_unitario,
                descuento: 0,
                impuesto: c.impuestos_json || 0,
                total: c.importe
            })),
            subtotal: f.subtotal,
            impuestos: f.total_impuestos_trasladados,
            total: f.total,
            moneda: f.moneda,
            estado: f.estado,
            metodoPago: f.metodo_pago,
            formaPago: f.forma_pago,
            lugarExpedicion: 'CP_EMISOR',
            regimeFiscal: '601',
            usoCFDI: f.cliente?.uso_cfdi || 'G03',
            created_at: new Date(f.created_at),
            updated_at: new Date(f.created_at)
        } as CFDI
    }
}
