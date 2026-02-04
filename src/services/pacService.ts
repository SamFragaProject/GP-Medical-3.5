import { CFDI } from '@/types/facturacion'

// Mock de servicio PAC para simular timbrado sin certificado real
export const pacService = {
    async timbrarFactura(cfdi: CFDI): Promise<{
        uuid: string;
        sello_sat: string;
        fecha_timbrado: string;
        xml: string;
    }> {
        // Simular latencia de red
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Generar UUID aleatorio
        const uuid = crypto.randomUUID()
        const selloSat = "SAT_MOCK_SELLO_" + Math.random().toString(36).substring(7)
        const fechaTimbrado = new Date().toISOString()

        // Generar XML simulado (string simple)
        const xml = `
<cfdi:Comprobante 
    Version="4.0" 
    Folio="${cfdi.folio || ''}" 
    Fecha="${cfdi.fechaEmision}" 
    Sello="SELLO_EMISOR_MOCK" 
    Total="${cfdi.total}" 
    SubTotal="${cfdi.subtotal}" 
    Moneda="${cfdi.moneda}" 
    TipoDeComprobante="I" 
    LugarExpedicion="${'CP_EMISOR'}"
>
  <cfdi:Emisor Rfc="XAXX010101000" Nombre="EMPRESA DEMO S.A. DE C.V." RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="${cfdi.cliente?.rfc}" Nombre="${cfdi.cliente?.razonSocial}" UsoCFDI="${cfdi.cliente?.usoCFDI}"/>
  <cfdi:Conceptos>
    <cfdi:Concepto Importe="${cfdi.total}" ValorUnitario="${cfdi.total}" Descripcion="Servicios Médicos"/>
  </cfdi:Conceptos>
  <tfd:TimbreFiscalDigital UUID="${uuid}" FechaTimbrado="${fechaTimbrado}" SelloSAT="${selloSat}"/>
</cfdi:Comprobante>`

        return {
            uuid,
            sello_sat: selloSat,
            fecha_timbrado: fechaTimbrado,
            xml
        }
    },

    async cancelarFactura(uuid: string, motivo: string): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 1500))
        console.log(`Cancelando factura ${uuid} por motivo: ${motivo}`)
        return true
    }
}
