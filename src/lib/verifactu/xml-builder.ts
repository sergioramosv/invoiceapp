import type { TaxBreakdownItem } from '@/types'

export interface VerifactuXMLInput {
  // Software info
  softwareName: string
  softwareNIF: string
  softwareId: string
  softwareVersion: string

  // Invoice data
  issuerNIF: string
  issuerName: string
  invoiceNumber: string
  issueDate: string  // DD-MM-YYYY format
  invoiceType: string // F1, F2, etc.
  description: string

  // Recipient
  recipientNIF: string
  recipientName: string

  // Tax breakdown
  taxBreakdown: TaxBreakdownItem[]

  // Totals
  totalAmount: number

  // Chain
  previousInvoiceNIF?: string
  previousInvoiceNumber?: string
  previousInvoiceDate?: string
  previousHash?: string

  // Current hash
  hash: string

  // Timestamp
  timestamp: string  // DD-MM-YYYY
  time: string       // HH:MM:SS
  timezone: string   // 01 or 02
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildTaxBreakdown(items: TaxBreakdownItem[]): string {
  return items.map(item => `
            <sum1:DetalleDesglose>
              <sum1:ClaveRegimen>${escapeXml(item.taxRegime || '01')}</sum1:ClaveRegimen>
              <sum1:CalificacionOperacion>${escapeXml(item.operationType || 'S1')}</sum1:CalificacionOperacion>
              <sum1:TipoImpositivo>${item.taxRate.toFixed(2)}</sum1:TipoImpositivo>
              <sum1:BaseImponibleOimporteNoSujeto>${item.taxBase.toFixed(2)}</sum1:BaseImponibleOimporteNoSujeto>
              <sum1:CuotaRepercutida>${item.taxAmount.toFixed(2)}</sum1:CuotaRepercutida>
            </sum1:DetalleDesglose>`).join('')
}

function buildChainBlock(input: VerifactuXMLInput): string {
  if (!input.previousHash || !input.previousInvoiceNIF) return ''

  return `
          <sum1:EncadenamientoRegistroAnterior>
            <sum1:IDEmisorFacturaRegistroAnterior>
              <sum1:NIF>${escapeXml(input.previousInvoiceNIF)}</sum1:NIF>
            </sum1:IDEmisorFacturaRegistroAnterior>
            <sum1:NumSerieFacturaRegistroAnterior>${escapeXml(input.previousInvoiceNumber || '')}</sum1:NumSerieFacturaRegistroAnterior>
            <sum1:FechaExpedicionFacturaRegistroAnterior>${escapeXml(input.previousInvoiceDate || '')}</sum1:FechaExpedicionFacturaRegistroAnterior>
            <sum1:HuellaRegistroAnterior>${escapeXml(input.previousHash)}</sum1:HuellaRegistroAnterior>
          </sum1:EncadenamientoRegistroAnterior>`
}

export function buildVerifactuXML(input: VerifactuXMLInput): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sum="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SusAltaFactuSistemaFacturacion.xsd" xmlns:sum1="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd">
  <soapenv:Body>
    <sum:AltaFactuSistemaFacturacion>
      <sum1:Cabecera>
        <sum1:IDVersion>1.0</sum1:IDVersion>
        <sum1:ObligadoEmision>
          <sum1:NombreRazon>${escapeXml(input.issuerName)}</sum1:NombreRazon>
          <sum1:NIF>${escapeXml(input.issuerNIF)}</sum1:NIF>
        </sum1:ObligadoEmision>
      </sum1:Cabecera>
      <sum:RegistroAltaFacturas>
        <sum:RegistroFacturacion>
          <sum1:IDFactura>
            <sum1:IDEmisorFactura><sum1:NIF>${escapeXml(input.issuerNIF)}</sum1:NIF></sum1:IDEmisorFactura>
            <sum1:NumSerieFacturaEmisor>${escapeXml(input.invoiceNumber)}</sum1:NumSerieFacturaEmisor>
            <sum1:FechaExpedicionFacturaEmisor>${escapeXml(input.issueDate)}</sum1:FechaExpedicionFacturaEmisor>
          </sum1:IDFactura>
          <sum1:TipoFactura>${escapeXml(input.invoiceType)}</sum1:TipoFactura>
          <sum1:DescripcionOperacion>${escapeXml(input.description)}</sum1:DescripcionOperacion>
          <sum1:Destinatarios>
            <sum1:IDDestinatario>
              <sum1:NombreRazon>${escapeXml(input.recipientName)}</sum1:NombreRazon>
              <sum1:NIF>${escapeXml(input.recipientNIF)}</sum1:NIF>
            </sum1:IDDestinatario>
          </sum1:Destinatarios>
          <sum1:Desglose>${buildTaxBreakdown(input.taxBreakdown)}
          </sum1:Desglose>
          <sum1:ImporteTotal>${input.totalAmount.toFixed(2)}</sum1:ImporteTotal>${buildChainBlock(input)}
          <sum1:SistemaInformatico>
            <sum1:NombreRazon>${escapeXml(input.softwareName)}</sum1:NombreRazon>
            <sum1:NIF>${escapeXml(input.softwareNIF)}</sum1:NIF>
            <sum1:NombreSistemaInformatico>InvoiceApp</sum1:NombreSistemaInformatico>
            <sum1:IdSistemaInformatico>${escapeXml(input.softwareId)}</sum1:IdSistemaInformatico>
            <sum1:Version>${escapeXml(input.softwareVersion)}</sum1:Version>
            <sum1:NumeroInstalacion>001</sum1:NumeroInstalacion>
            <sum1:TipoUsoPosibleSoloVerifactu>S</sum1:TipoUsoPosibleSoloVerifactu>
            <sum1:TipoUsoPosibleOtros>N</sum1:TipoUsoPosibleOtros>
            <sum1:TipoUsoPosibleMultiOT>S</sum1:TipoUsoPosibleMultiOT>
          </sum1:SistemaInformatico>
          <sum1:FechaGenRegistro>${escapeXml(input.timestamp)}</sum1:FechaGenRegistro>
          <sum1:HoraGenRegistro>${escapeXml(input.time)}</sum1:HoraGenRegistro>
          <sum1:HusoHorarioGenRegistro>${escapeXml(input.timezone)}</sum1:HusoHorarioGenRegistro>
        </sum:RegistroFacturacion>
        <sum:DatosControl>
          <sum1:Huella>${escapeXml(input.hash)}</sum1:Huella>
          <sum1:TipoHash>01</sum1:TipoHash>
        </sum:DatosControl>
      </sum:RegistroAltaFacturas>
    </sum:AltaFactuSistemaFacturacion>
  </soapenv:Body>
</soapenv:Envelope>`
}
