import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export async function downloadPNG(element: HTMLElement, filename: string): Promise<void> {
  const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
  const link = document.createElement('a')
  link.download = `${filename}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export async function generatePDF(
  element: HTMLElement,
  filename: string,
  addWatermark?: boolean
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  })

  const imgWidth = 210 // A4 width in mm
  const pageHeight = 297 // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  const pdf = new jsPDF('p', 'mm', 'a4')
  const imgData = canvas.toDataURL('image/png')

  let heightLeft = imgHeight
  let position = 0

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight

  while (heightLeft > 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  if (addWatermark) {
    const totalPages = pdf.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.saveGraphicsState()
      const gState = new (pdf as unknown as { GState: new (opts: Record<string, number>) => object }).GState({ opacity: 0.12 })
      pdf.setGState(gState)
      pdf.setFontSize(50)
      pdf.setTextColor(79, 70, 229)
      const centerX = imgWidth / 2
      const centerY = pageHeight / 2
      pdf.text('InvoiceApp — Free', centerX, centerY, {
        align: 'center',
        angle: 45,
      })
      pdf.restoreGraphicsState()
    }
  }

  pdf.save(filename)
}

export async function downloadPDF(
  previewRef: HTMLElement,
  invoiceNumber: string,
  isPaid: boolean
): Promise<void> {
  const filename = invoiceNumber
    ? `factura-${invoiceNumber}.pdf`
    : 'factura.pdf'
  await generatePDF(previewRef, filename, !isPaid)
}
