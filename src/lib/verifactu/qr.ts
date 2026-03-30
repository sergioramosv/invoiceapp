export function generateVerifactuQRData(params: {
  nif: string
  invoiceNumber: string
  totalAmount: number
  issueDate: string
}): string {
  const base = 'https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR'
  const queryParams = new URLSearchParams({
    nif: params.nif,
    numserie: params.invoiceNumber,
    fecha: params.issueDate,
    importe: params.totalAmount.toFixed(2),
  })
  return `${base}?${queryParams.toString()}`
}
