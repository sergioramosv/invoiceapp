import type { Invoice, VatBreakdownLine } from '@/types'

export interface SoftwareIdentification {
  nifDesarrollador: string
  nombreRazon: string
  nombre: string
  version: string
  idSistemaInformatico: string
}

const DEFAULT_SOFTWARE_ID: SoftwareIdentification = {
  nifDesarrollador: '00000000T', // Placeholder — replace with real NIF
  nombreRazon: 'SRSoftware',
  nombre: 'Facturas',
  version: '1.0.0',
  idSistemaInformatico: '01',
}

// Official AEAT namespaces from WSDL/XSD
const NS_LR = 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroLR.xsd'
const NS_SF = 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd'

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function toAEATDate(isoDate: string): string {
  // Handle full ISO timestamps (YYYY-MM-DDTHH:mm:ss...) or plain dates (YYYY-MM-DD)
  const datePart = isoDate.split('T')[0]
  const [year, month, day] = datePart.split('-')
  return `${day}-${month}-${year}`
}

function normalizeNif(nif: string): string {
  // Strip spaces, hyphens, dots, and "ES" country prefix; uppercase
  let clean = (nif || '').replace(/[\s\-\.]/g, '').toUpperCase()
  if (clean.startsWith('ES') && clean.length > 9) {
    clean = clean.slice(2)
  }
  return clean
}

function isValidSpanishNif(nif: string): boolean {
  return /^[0-9A-Z]{9}$/.test(nif)
}

function buildDesgloseXml(vatBreakdown: VatBreakdownLine[]): string {
  if (!vatBreakdown || vatBreakdown.length === 0) {
    return `<sf:DetalleDesglose>
              <sf:Impuesto>01</sf:Impuesto>
              <sf:ClaveRegimen>01</sf:ClaveRegimen>
              <sf:CalificacionOperacion>S1</sf:CalificacionOperacion>
              <sf:TipoImpositivo>0.00</sf:TipoImpositivo>
              <sf:BaseImponibleOimporteNoSujeto>0.00</sf:BaseImponibleOimporteNoSujeto>
              <sf:CuotaRepercutida>0.00</sf:CuotaRepercutida>
            </sf:DetalleDesglose>`
  }

  return vatBreakdown.map((line) => {
    const calificacion = line.rate === 0 ? 'E1' : 'S1'
    return `<sf:DetalleDesglose>
              <sf:Impuesto>01</sf:Impuesto>
              <sf:ClaveRegimen>01</sf:ClaveRegimen>
              <sf:CalificacionOperacion>${calificacion}</sf:CalificacionOperacion>
              <sf:TipoImpositivo>${line.rate.toFixed(2)}</sf:TipoImpositivo>
              <sf:BaseImponibleOimporteNoSujeto>${line.base.toFixed(2)}</sf:BaseImponibleOimporteNoSujeto>
              <sf:CuotaRepercutida>${line.quota.toFixed(2)}</sf:CuotaRepercutida>
            </sf:DetalleDesglose>`
  }).join('\n')
}

/**
 * Builds the SOAP XML envelope for VeriFactu RegFactuSistemaFacturacion.
 * Follows the official AEAT WSDL/XSD schema exactly.
 */
export function buildAltaFacturaXml(
  invoice: Invoice,
  hash: string,
  previousHash: string,
  previousInvoice?: { nif: string; numSerie: string; fecha: string },
  softwareId: SoftwareIdentification = DEFAULT_SOFTWARE_ID,
): string {
  const now = new Date()
  // FechaHoraHusoGenRegistro must be in format: YYYY-MM-DDTHH:MM:SS+HH:00
  const pad = (n: number) => String(n).padStart(2, '0')
  const offsetMin = -now.getTimezoneOffset()
  const offsetH = Math.floor(Math.abs(offsetMin) / 60)
  const offsetSign = offsetMin >= 0 ? '+' : '-'
  const fechaHoraHuso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}${offsetSign}${pad(offsetH)}:00`

  const fechaExpedicion = toAEATDate(invoice.issueDate)
  const cuotaTotal = (invoice.taxAmount || 0).toFixed(2)
  const importeTotal = (invoice.total || 0).toFixed(2)
  const tipoFactura = invoice.invoiceType || 'F1'
  const nifEmisor = normalizeNif(invoice.fromTaxId || '')
  const nombreEmisor = esc(invoice.fromName || '')

  // For SistemaInformatico: use configured developer NIF or fall back to the emisor's own NIF
  // (valid for single-entity / self-developed software with TipoUsoPosibleSoloVerifactu=S)
  const nifDesarrollador = normalizeNif(
    softwareId.nifDesarrollador === '00000000T' ? nifEmisor : softwareId.nifDesarrollador
  )

  // Encadenamiento: PrimerRegistro if no previous, or RegistroAnterior
  let encadenamientoXml: string
  if (!previousHash || !previousInvoice) {
    encadenamientoXml = `<sf:Encadenamiento>
            <sf:PrimerRegistro>S</sf:PrimerRegistro>
          </sf:Encadenamiento>`
  } else {
    encadenamientoXml = `<sf:Encadenamiento>
            <sf:RegistroAnterior>
              <sf:IDEmisorFactura>${normalizeNif(previousInvoice.nif)}</sf:IDEmisorFactura>
              <sf:NumSerieFactura>${previousInvoice.numSerie}</sf:NumSerieFactura>
              <sf:FechaExpedicionFactura>${previousInvoice.fecha}</sf:FechaExpedicionFactura>
              <sf:Huella>${previousHash}</sf:Huella>
            </sf:RegistroAnterior>
          </sf:Encadenamiento>`
  }

  // Destinatarios (optional — only include if we have a valid Spanish NIF; foreign/blank skipped)
  let destinatariosXml = ''
  const billToNif = normalizeNif(invoice.billToTaxId || '')
  console.log('[VeriFactu] NIFs — emisor:', nifEmisor, `(${nifEmisor.length} chars)`, '| destinatario:', billToNif, `(${billToNif.length} chars)`, '| desarrollador:', nifDesarrollador)
  if (tipoFactura === 'F1' && billToNif && isValidSpanishNif(billToNif)) {
    destinatariosXml = `
          <sf:Destinatarios>
            <sf:IDDestinatario>
              <sf:NombreRazon>${esc(invoice.billToName || '')}</sf:NombreRazon>
              <sf:NIF>${billToNif}</sf:NIF>
            </sf:IDDestinatario>
          </sf:Destinatarios>`
  }

  // Rectificativa
  let rectificativaXml = ''
  if (['R1', 'R2', 'R3', 'R4', 'R5'].includes(tipoFactura) && invoice.rectifiedInvoiceNumber) {
    rectificativaXml = `
          <sf:TipoRectificativa>S</sf:TipoRectificativa>
          <sf:FacturasRectificadas>
            <sf:IDFacturaRectificada>
              <sf:IDEmisorFactura>${esc(nifEmisor)}</sf:IDEmisorFactura>
              <sf:NumSerieFactura>${esc(invoice.rectifiedInvoiceNumber)}</sf:NumSerieFactura>
              <sf:FechaExpedicionFactura>${fechaExpedicion}</sf:FechaExpedicionFactura>
            </sf:IDFacturaRectificada>
          </sf:FacturasRectificadas>`
  }

  // Descripcion
  const descripcion = esc(
    invoice.items?.map(i => i.description).filter(Boolean).join(', ').slice(0, 500) || 'Servicios profesionales'
  )

  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:sfLR="${NS_LR}"
  xmlns:sf="${NS_SF}">
  <soapenv:Header/>
  <soapenv:Body>
    <sfLR:RegFactuSistemaFacturacion>
      <sfLR:Cabecera>
        <sf:ObligadoEmision>
          <sf:NombreRazon>${nombreEmisor}</sf:NombreRazon>
          <sf:NIF>${esc(nifEmisor)}</sf:NIF>
        </sf:ObligadoEmision>
      </sfLR:Cabecera>
      <sfLR:RegistroFactura>
        <sf:RegistroAlta>
          <sf:IDVersion>1.0</sf:IDVersion>
          <sf:IDFactura>
            <sf:IDEmisorFactura>${nifEmisor}</sf:IDEmisorFactura>
            <sf:NumSerieFactura>${esc(invoice.invoiceNumber)}</sf:NumSerieFactura>
            <sf:FechaExpedicionFactura>${fechaExpedicion}</sf:FechaExpedicionFactura>
          </sf:IDFactura>
          <sf:NombreRazonEmisor>${nombreEmisor}</sf:NombreRazonEmisor>
          <sf:TipoFactura>${tipoFactura}</sf:TipoFactura>${rectificativaXml}
          <sf:DescripcionOperacion>${descripcion}</sf:DescripcionOperacion>${destinatariosXml}
          <sf:Desglose>
            ${buildDesgloseXml(invoice.vatBreakdown || [])}
          </sf:Desglose>
          <sf:CuotaTotal>${cuotaTotal}</sf:CuotaTotal>
          <sf:ImporteTotal>${importeTotal}</sf:ImporteTotal>
          ${encadenamientoXml}
          <sf:SistemaInformatico>
            <sf:NombreRazon>${esc(softwareId.nombreRazon)}</sf:NombreRazon>
            <sf:NIF>${esc(nifDesarrollador)}</sf:NIF>
            <sf:NombreSistemaInformatico>${esc(softwareId.nombre)}</sf:NombreSistemaInformatico>
            <sf:IdSistemaInformatico>${esc(softwareId.idSistemaInformatico)}</sf:IdSistemaInformatico>
            <sf:Version>${esc(softwareId.version)}</sf:Version>
            <sf:NumeroInstalacion>001</sf:NumeroInstalacion>
            <sf:TipoUsoPosibleSoloVerifactu>S</sf:TipoUsoPosibleSoloVerifactu>
            <sf:TipoUsoPosibleMultiOT>N</sf:TipoUsoPosibleMultiOT>
            <sf:IndicadorMultiplesOT>N</sf:IndicadorMultiplesOT>
          </sf:SistemaInformatico>
          <sf:FechaHoraHusoGenRegistro>${fechaHoraHuso}</sf:FechaHoraHusoGenRegistro>
          <sf:TipoHuella>01</sf:TipoHuella>
          <sf:Huella>${hash}</sf:Huella>
        </sf:RegistroAlta>
      </sfLR:RegistroFactura>
    </sfLR:RegFactuSistemaFacturacion>
  </soapenv:Body>
</soapenv:Envelope>`
}
