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

  pdf.save(filename)
}

export async function downloadPDF(
  previewRef: HTMLElement,
  invoiceNumber: string,
): Promise<void> {
  const filename = invoiceNumber
    ? `factura-${invoiceNumber}.pdf`
    : 'factura.pdf'
  await generatePDF(previewRef, filename)
}

export async function downloadDemoPDF(
  previewRef: HTMLElement,
  invoiceNumber: string,
): Promise<void> {
  const dataUrl = await toPng(previewRef, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
  })

  const img = new Image()
  img.src = dataUrl
  await new Promise<void>((resolve) => {
    img.onload = () => resolve()
  })

  const imgWidth = 210
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

  // Add watermark to every page
  const pageCount = pdf.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i)
    pdf.saveGraphicsState()
    // @ts-expect-error jsPDF internal GState
    pdf.setGState(new pdf.GState({ opacity: 0.08 }))
    pdf.setFontSize(54)
    pdf.setTextColor(100, 100, 100)
    // Diagonal watermarks
    const cx = 105
    const cy = 148.5
    for (const offsetY of [-80, 0, 80]) {
      pdf.text('InvoiceApp Demo Free', cx, cy + offsetY, {
        align: 'center',
        angle: 35,
      })
    }
    pdf.restoreGraphicsState()
  }

  const filename = invoiceNumber
    ? `factura-${invoiceNumber}.pdf`
    : 'factura.pdf'
  pdf.save(filename)
}
