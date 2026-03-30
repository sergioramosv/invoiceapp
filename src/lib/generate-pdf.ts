import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'

export async function downloadPNG(element: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
  })
  const link = document.createElement('a')
  link.download = `${filename}.png`
  link.href = dataUrl
  link.click()
}

export async function generatePDF(
  element: HTMLElement,
  filename: string,
  addWatermark?: boolean
): Promise<void> {
  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
  })

  const img = new Image()
  img.src = dataUrl
  await new Promise<void>((resolve) => {
    img.onload = () => resolve()
  })

  const imgWidth = 210 // A4 mm
  const pageHeight = 297
  const imgHeight = (img.height * imgWidth) / img.width

  const pdf = new jsPDF('p', 'mm', 'a4')

  let heightLeft = imgHeight
  let position = 0

  pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight

  while (heightLeft > 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  if (addWatermark) {
    const totalPages = pdf.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.saveGraphicsState()
      const gState = new (pdf as unknown as { GState: new (opts: Record<string, number>) => object }).GState({ opacity: 0.06 })
      pdf.setGState(gState)
      pdf.setFontSize(14)
      pdf.setTextColor(180, 180, 180)
      pdf.text('invoiceapp.es', imgWidth - 8, pageHeight - 6, {
        align: 'right',
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
