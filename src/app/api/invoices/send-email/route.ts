import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getResend } from '@/lib/resend'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { recipientEmail, subject, message, pdfBase64, filename } = await request.json()

  try {
    const resend = getResend()
    await resend.emails.send({
      from: 'InvoiceApp <noreply@invoiceapp.es>',
      to: recipientEmail,
      subject: subject || 'Factura adjunta',
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <p>${message || 'Adjuntamos su factura.'}</p>
        <p style="color:#666;font-size:12px;margin-top:40px">Enviado con InvoiceApp</p>
      </div>`,
      attachments: [{
        filename: filename || 'factura.pdf',
        content: pdfBase64,
      }],
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
