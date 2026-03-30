export const INVOICE_TYPES = [
  { code: 'F1', label: 'Factura completa' },
  { code: 'F2', label: 'Factura simplificada' },
  { code: 'R1', label: 'Rectificativa (art. 80.1-2)' },
  { code: 'R2', label: 'Rectificativa (art. 80.3)' },
  { code: 'R3', label: 'Rectificativa (art. 80.4)' },
  { code: 'R4', label: 'Rectificativa (otros)' },
  { code: 'R5', label: 'Rectificativa simplificada' },
]

export const TAX_REGIMES = [
  { code: '01', label: 'Régimen general' },
  { code: '02', label: 'Exportación' },
  { code: '05', label: 'Inversión sujeto pasivo' },
  { code: '06', label: 'Régimen simplificado' },
]

export const OPERATION_TYPES = [
  { code: 'S1', label: 'Sujeta - No exenta' },
  { code: 'S2', label: 'Inversión sujeto pasivo' },
  { code: 'E1', label: 'Exenta' },
  { code: 'N1', label: 'No sujeta (art. 7)' },
  { code: 'N2', label: 'No sujeta (loc. reglas)' },
]

export const SOFTWARE_INFO = {
  name: 'SRSoftware',
  nif: '', // To be filled with actual NIF
  softwareName: 'InvoiceApp',
  softwareId: '001',
  version: '1.0.0',
}
