import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Términos de Servicio — InvoiceApp',
  description: 'Términos y condiciones de uso del servicio InvoiceApp.',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text transition-colors mb-8"
        >
          &larr; Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold text-text tracking-tight mb-2">
          Términos de Servicio
        </h1>
        <p className="text-sm text-text-muted mb-10">
          Última actualización: marzo 2026
        </p>

        <div className="space-y-8 text-text-secondary leading-relaxed text-[15px]">
          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              1. Descripción del servicio
            </h2>
            <p>
              InvoiceApp es una <strong className="text-text">herramienta de diseño y generación de documentos comerciales</strong> (facturas,
              presupuestos) en formato PDF. El servicio está disponible a través de la web en invoiceapp.es.
            </p>
            <div className="mt-4 p-4 border border-border rounded-lg bg-surface-tertiary">
              <p className="font-semibold text-text mb-2">
                Aviso importante — Naturaleza del servicio
              </p>
              <p>
                InvoiceApp <strong className="text-text">NO es un software de gestión fiscal, contable ni de facturación electrónica</strong> en
                el sentido del Real Decreto 1007/2023 (VeriFactu) ni de la Ley Crea y Crece. InvoiceApp es una herramienta
                de diseño de documentos comerciales que genera archivos PDF. No realiza ningún tipo de registro fiscal,
                no envía datos a la Agencia Tributaria (AEAT), no genera cadenas de hash, no cumple con los requisitos
                de los Sistemas Informáticos de Facturación (SIF) y no sustituye a un software de contabilidad o ERP.
              </p>
              <p className="mt-2">
                El usuario es el <strong className="text-text">único responsable</strong> de cumplir con la normativa fiscal aplicable en su
                jurisdicción, incluyendo pero no limitado a: la obligación de utilizar un sistema de facturación
                homologado, la presentación de impuestos, la conservación de facturas y cualquier otro requisito legal.
                InvoiceApp no asume ninguna responsabilidad sobre la validez fiscal o legal de los documentos generados.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              2. Planes y precios
            </h2>
            <p>InvoiceApp ofrece dos modalidades de uso:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>
                <strong className="text-text">Plan Gratuito:</strong> Permite
                crear hasta 5 facturas al mes con funcionalidades básicas de
                personalización. No requiere método de pago.
              </li>
              <li>
                <strong className="text-text">Plan Pro (pago único):</strong>{' '}
                Desbloquea facturas ilimitadas, plantillas premium,
                personalización avanzada de marca, exportación en múltiples
                formatos y soporte prioritario. Se adquiere mediante un único
                pago, sin suscripciones recurrentes.
              </li>
            </ul>
            <p className="mt-3">
              Los precios indicados en el Sitio Web incluyen los impuestos
              aplicables salvo que se indique expresamente lo contrario.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              3. Registro y cuenta de usuario
            </h2>
            <p>
              Para utilizar el servicio es necesario crear una cuenta
              proporcionando información veraz y actualizada. El usuario es
              responsable de mantener la confidencialidad de sus credenciales de
              acceso y de todas las actividades realizadas desde su cuenta.
            </p>
            <p className="mt-3">
              InvoiceApp se reserva el derecho de suspender o cancelar cuentas
              que incumplan estos términos o que muestren un uso fraudulento o
              abusivo del servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              4. Responsabilidades del usuario
            </h2>
            <p>El usuario se compromete a:</p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside">
              <li>
                Proporcionar información veraz y completa en sus facturas.
              </li>
              <li>
                Cumplir con la legislación fiscal aplicable en su jurisdicción.
              </li>
              <li>
                No utilizar el servicio para actividades ilegales o fraudulentas.
              </li>
              <li>
                No intentar acceder a sistemas, datos o cuentas de otros
                usuarios.
              </li>
              <li>
                No realizar ingeniería inversa, descompilación o desmontaje del
                software.
              </li>
            </ul>
            <p className="mt-3">
              InvoiceApp es una herramienta de generación de documentos y no
              constituye asesoramiento fiscal, contable o legal. El usuario es
              responsable de verificar que sus facturas cumplen con la normativa
              aplicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              5. Limitación de responsabilidad
            </h2>
            <p>
              InvoiceApp se proporciona &quot;tal cual&quot; y &quot;según
              disponibilidad&quot;. No garantizamos que el servicio esté libre de
              errores o interrupciones. En la máxima medida permitida por la ley:
            </p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside">
              <li>
                InvoiceApp no será responsable de pérdidas indirectas,
                incidentales, especiales o consecuentes.
              </li>
              <li>
                La responsabilidad total de InvoiceApp se limita al importe
                efectivamente pagado por el usuario en los 12 meses anteriores
                al evento que genere la reclamación.
              </li>
              <li>
                InvoiceApp no es responsable de la exactitud, legalidad o
                validez fiscal de las facturas generadas por los usuarios.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              6. Política de cancelación y reembolsos
            </h2>
            <p>
              <strong className="text-text">Plan Gratuito:</strong> Puedes dejar
              de usar el servicio en cualquier momento y solicitar la eliminación
              de tu cuenta y datos.
            </p>
            <p className="mt-3">
              <strong className="text-text">Plan Pro:</strong> Dado que se trata
              de un pago único, ofrecemos una garantía de devolución de 30 días
              naturales desde la fecha de compra. Si no estás satisfecho con el
              servicio, puedes solicitar un reembolso completo dentro de ese
              plazo escribiendo a contacto@invoiceapp.es. Transcurridos los 30
              días, no se realizarán reembolsos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              7. Propiedad intelectual
            </h2>
            <p>
              El software, diseño, logotipos, textos y demás elementos del Sitio
              Web son propiedad de InvoiceApp (SRSoftware) y están protegidos por
              las leyes de propiedad intelectual e industrial.
            </p>
            <p className="mt-3">
              El usuario conserva todos los derechos sobre los datos y contenidos
              que introduce en el servicio (datos de clientes, conceptos de
              facturas, etc.). InvoiceApp no adquiere ningún derecho de
              propiedad sobre dichos contenidos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              8. Tratamiento de datos personales
            </h2>
            <p>
              El tratamiento de los datos personales de los usuarios se rige por
              nuestra{' '}
              <Link
                href="/privacy-policy"
                className="text-primary hover:underline"
              >
                Política de Privacidad
              </Link>
              , que forma parte integrante de estos Términos de Servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              9. Modificaciones del servicio y los términos
            </h2>
            <p>
              InvoiceApp se reserva el derecho de modificar, suspender o
              discontinuar cualquier aspecto del servicio en cualquier momento.
              Notificaremos los cambios sustanciales en estos términos a través
              del email registrado o mediante un aviso en el Sitio Web con al
              menos 30 días de antelación.
            </p>
            <p className="mt-3">
              El uso continuado del servicio tras la entrada en vigor de las
              modificaciones constituye la aceptación de los nuevos términos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              10. Legislación aplicable
            </h2>
            <p>
              Estos términos se rigen por la legislación española. Para la
              resolución de cualquier controversia derivada de estos términos, las
              partes se someten a los juzgados y tribunales del domicilio del
              titular, salvo que la legislación aplicable disponga otra cosa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              Contacto
            </h2>
            <p>
              Para cualquier consulta sobre estos términos, puedes escribir a{' '}
              <a
                href="mailto:contacto@invoiceapp.es"
                className="text-primary hover:underline"
              >
                contacto@invoiceapp.es
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
