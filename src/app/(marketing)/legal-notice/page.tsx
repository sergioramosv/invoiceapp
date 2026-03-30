import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Aviso Legal — InvoiceApp',
  description: 'Aviso legal e información del titular de InvoiceApp conforme a la LSSI.',
}

export default function LegalNoticePage() {
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
          Aviso Legal
        </h1>
        <p className="text-sm text-text-muted mb-10">
          Última actualización: marzo 2026
        </p>

        <div className="space-y-8 text-text-secondary leading-relaxed text-[15px]">
          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              1. Datos identificativos del titular
            </h2>
            <p>
              En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio,
              de Servicios de la Sociedad de la Información y de Comercio
              Electrónico (LSSI-CE), se informa al usuario de los datos del
              titular de este sitio web:
            </p>
            <ul className="mt-3 space-y-1.5 list-none">
              <li><strong className="text-text">Titular:</strong> InvoiceApp</li>
              <li><strong className="text-text">Responsable:</strong> El responsable de InvoiceApp</li>
              <li><strong className="text-text">Email de contacto:</strong> sergioramosvicente2004@gmail.com</li>
              <li><strong className="text-text">Sitio web:</strong> https://invoiceapp.es</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              2. Objeto
            </h2>
            <p>
              El presente aviso legal regula el uso y acceso al sitio web
              invoiceapp.es (en adelante, &quot;el Sitio Web&quot;), así como la
              información y los servicios que se ponen a disposición de los
              usuarios del mismo. El acceso al Sitio Web implica la aceptación
              sin reservas de todas las disposiciones incluidas en este aviso
              legal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              3. Condiciones de uso
            </h2>
            <p>
              El usuario se compromete a hacer un uso adecuado de los contenidos
              y servicios que InvoiceApp ofrece a través de su Sitio Web. Entre
              otros, el usuario se compromete a no emplear los contenidos y
              servicios para:
            </p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside">
              <li>
                Realizar actividades ilícitas, ilegales o contrarias a la buena
                fe y al orden público.
              </li>
              <li>
                Difundir contenidos o propaganda de carácter racista, xenófobo,
                pornográfico, de apología del terrorismo o que atenten contra los
                derechos humanos.
              </li>
              <li>
                Provocar daños en los sistemas físicos y lógicos de InvoiceApp,
                de sus proveedores o de terceros.
              </li>
              <li>
                Intentar acceder y, en su caso, utilizar las cuentas de correo
                electrónico de otros usuarios y modificar o manipular sus
                mensajes.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              4. Propiedad intelectual e industrial
            </h2>
            <p>
              El Sitio Web, incluyendo a título enunciativo pero no limitativo su
              programación, edición, compilación y demás elementos necesarios
              para su funcionamiento, los diseños, logotipos, textos, fotografías
              y/o gráficos, son propiedad del titular o, en su caso, dispone de
              licencia o autorización expresa por parte de los autores.
            </p>
            <p className="mt-3">
              Todos los contenidos del Sitio Web se encuentran debidamente
              protegidos por la normativa de propiedad intelectual e industrial.
              Independientemente de la finalidad para la que fueran destinados,
              la reproducción total o parcial, uso, explotación, distribución y
              comercialización requiere en todo caso la autorización escrita
              previa por parte del titular.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              5. Exclusión de garantías y responsabilidad
            </h2>
            <p>
              InvoiceApp no se hace responsable, en ningún caso, de los daños y
              perjuicios de cualquier naturaleza que pudieran ocasionar, a título
              enunciativo: errores u omisiones en los contenidos, falta de
              disponibilidad del sitio web o la transmisión de virus o programas
              maliciosos en los contenidos, a pesar de haber adoptado todas las
              medidas tecnológicas necesarias para evitarlo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              6. Enlaces externos
            </h2>
            <p>
              El Sitio Web puede contener enlaces a sitios web de terceros. Las
              páginas de estos sitios ajenos no han sido revisadas ni están
              sujetas a controles por parte de InvoiceApp. Por lo tanto,
              InvoiceApp no podrá ser considerada responsable de los contenidos
              de estos sitios web ni de las medidas que se adopten relativas a su
              privacidad o al tratamiento de sus datos de carácter personal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              7. Protección de datos
            </h2>
            <p>
              Para conocer cómo tratamos tus datos personales, consulta
              nuestra{' '}
              <Link
                href="/privacy-policy"
                className="text-primary hover:underline"
              >
                Política de Privacidad
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              8. Legislación aplicable y jurisdicción
            </h2>
            <p>
              La relación entre InvoiceApp y el usuario se regirá por la
              normativa española vigente. Cualquier controversia se someterá a
              los Juzgados y Tribunales de la ciudad del domicilio del titular,
              salvo que la ley aplicable disponga otra cosa.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
