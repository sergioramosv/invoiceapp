import { getResend } from './resend'

const FROM_EMAIL = 'InvoiceApp <sergioramosvicente2004@gmail.com>'

function baseLayout(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background-color:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#4f46e5;padding:32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">InvoiceApp</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px 32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #e5e5e5;text-align:center;">
              <p style="margin:0;font-size:13px;color:#999;">
                &copy; 2026 InvoiceApp. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendWelcomeEmail(email: string, name: string) {
  const content = `
    <h2 style="margin:0 0 16px;font-size:22px;color:#1a1a1a;">
      Bienvenido, ${name}!
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
      Gracias por crear tu cuenta en InvoiceApp. Ya puedes empezar a crear facturas profesionales en segundos.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background-color:#4f46e5;border-radius:10px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/workspace" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
            Crear mi primera factura
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:14px;color:#888;">
      Si tienes alguna pregunta, responde directamente a este correo.
    </p>`

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Bienvenido a InvoiceApp',
    html: baseLayout(content),
  })
}

export async function sendPaymentConfirmation(
  email: string,
  name: string,
  amount: string
) {
  const content = `
    <h2 style="margin:0 0 16px;font-size:22px;color:#1a1a1a;">
      Pago confirmado
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
      Hola ${name}, tu pago de <strong>${amount}</strong> ha sido procesado correctamente.
      Ya tienes acceso completo al plan Pro de InvoiceApp.
    </p>
    <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin:0 0 24px;">
      <p style="margin:0;font-size:14px;color:#166534;font-weight:600;">
        Plan Pro activado
      </p>
      <p style="margin:4px 0 0;font-size:13px;color:#166534;">
        Sin watermark, templates ilimitados y soporte prioritario.
      </p>
    </div>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background-color:#4f46e5;border-radius:10px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/workspace" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
            Ir a mi workspace
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:14px;color:#888;">
      Gracias por confiar en InvoiceApp.
    </p>`

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Pago confirmado — InvoiceApp Pro',
    html: baseLayout(content),
  })
}
