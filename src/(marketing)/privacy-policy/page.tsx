import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidad — Facturas',
  description: 'Política de privacidad y protección de datos de Facturas conforme al RGPD.',
}

export default function PrivacyPolicyPage() {
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
          Política de Privacidad
        </h1>
        <p className="text-sm text-text-muted mb-10">
          Última actualización: marzo 2026
        </p>

        <div className="space-y-8 text-text-secondary leading-relaxed text-[15px]">
          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              1. Responsable del tratamiento
            </h2>
            <ul className="space-y-1.5 list-none">
              <li><strong className="text-text">Titular:</strong> Facturas</li>
              <li><strong className="text-text">Responsable:</strong> Sergio Ramos Vicente</li>
              <li><strong className="text-text">Email de contacto:</strong> sergioramosvicente2004@gmail.com</li>
              <li><strong className="text-text">Sitio web:</strong> https://localhost:3000</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              2. Datos que recopilamos
            </h2>
            <p>
              Recopilamos y tratamos los siguientes datos personales en función
              del uso que hagas del servicio:
            </p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside">
              <li>
                <strong className="text-text">Datos de registro:</strong> nombre,
                dirección de email y contraseña (o datos proporcionados por el
                proveedor de autenticación social si usas Google Sign-In).
              </li>
              <li>
                <strong className="text-text">Datos de facturación:</strong>{' '}
                información fiscal del emisor (nombre o razón social, NIF/CIF,
                dirección), datos de clientes y conceptos de las facturas que
                generas.
              </li>
              <li>
                <strong className="text-text">Datos de uso:</strong> información
                sobre cómo interactúas con el servicio (páginas visitadas,
                funcionalidades utilizadas) a través de analíticas anónimas.
              </li>
              <li>
                <strong className="text-text">Datos técnicos:</strong> dirección
                IP, tipo de navegador y dispositivo, para garantizar la seguridad
                y el correcto funcionamiento del servicio.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              3. Finalidad del tratamiento
            </h2>
            <p>Tratamos tus datos personales para las siguientes finalidades:</p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside">
              <li>Gestionar tu cuenta de usuario y proporcionar el servicio.</li>
              <li>
                Generar y almacenar las facturas que crees en la plataforma.
              </li>
              <li>
                Procesar pagos y gestionar la compra del plan Pro.
              </li>
              <li>
                Enviarte comunicaciones relacionadas con el servicio
                (confirmaciones, cambios en los términos, etc.).
              </li>
              <li>
                Mejorar el servicio mediante analíticas agregadas y anónimas.
              </li>
              <li>
                Cumplir con las obligaciones legales que nos sean aplicables.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              4. Base legal del tratamiento
            </h2>
            <p>
              El tratamiento de tus datos se fundamenta en las siguientes bases
              legales conforme al Reglamento General de Protección de Datos
              (RGPD):
            </p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside">
              <li>
                <strong className="text-text">Ejecución del contrato:</strong>{' '}
                para prestarte el servicio que has contratado (art. 6.1.b RGPD).
              </li>
              <li>
                <strong className="text-text">Consentimiento:</strong> para el
                envío de comunicaciones comerciales, cuando lo hayas autorizado
                expresamente (art. 6.1.a RGPD).
              </li>
              <li>
                <strong className="text-text">Interés legítimo:</strong> para
                mejorar nuestro servicio y garantizar su seguridad (art. 6.1.f
                RGPD).
              </li>
              <li>
                <strong className="text-text">Obligación legal:</strong> para
                cumplir con obligaciones fiscales o requerimientos legales
                (art. 6.1.c RGPD).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              5. Encargados del tratamiento
            </h2>
            <p>
              Utilizamos los siguientes servicios de terceros que actúan como
              encargados del tratamiento:
            </p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside">
              <li>
                <strong className="text-text">Firebase (Google LLC):</strong>{' '}
                Almacenamiento de datos, autenticación de usuarios y hosting.
                Google cumple con el RGPD y dispone de cláusulas contractuales
                tipo para transferencias internacionales de datos. Más
                información en la{' '}
                <a
                  href="https://firebase.google.com/support/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  política de privacidad de Firebase
                </a>
                .
              </li>
              <li>
                <strong className="text-text">Plausible Analytics:</strong>{' '}
                Servicio de analítica web que no utiliza cookies y no recopila
                datos personales. Cumplimiento total con RGPD sin necesidad de
                consentimiento.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              6. Conservación de los datos
            </h2>
            <p>
              Conservaremos tus datos personales mientras mantengas tu cuenta
              activa o mientras sea necesario para prestarte el servicio. Una vez
              solicites la eliminación de tu cuenta, procederemos a borrar tus
              datos en un plazo máximo de 30 días, salvo que exista una
              obligación legal que nos exija conservarlos durante un período
              mayor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              7. Derechos del usuario
            </h2>
            <p>
              Conforme al RGPD, tienes los siguientes derechos sobre tus datos
              personales:
            </p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside">
              <li>
                <strong className="text-text">Derecho de acceso:</strong>{' '}
                solicitar información sobre los datos personales que tratamos.
              </li>
              <li>
                <strong className="text-text">Derecho de rectificación:</strong>{' '}
                corregir datos inexactos o incompletos.
              </li>
              <li>
                <strong className="text-text">Derecho de supresión:</strong>{' '}
                solicitar la eliminación de tus datos cuando ya no sean
                necesarios para la finalidad para la que fueron recogidos.
              </li>
              <li>
                <strong className="text-text">Derecho a la portabilidad:</strong>{' '}
                recibir tus datos en un formato estructurado y de uso común.
              </li>
              <li>
                <strong className="text-text">Derecho de oposición:</strong>{' '}
                oponerte al tratamiento de tus datos en determinadas
                circunstancias.
              </li>
              <li>
                <strong className="text-text">
                  Derecho a la limitación del tratamiento:
                </strong>{' '}
                solicitar la limitación del tratamiento en los supuestos
                previstos por la normativa.
              </li>
            </ul>
            <p className="mt-3">
              Para ejercer cualquiera de estos derechos, envía un email a{' '}
              <a
                href="mailto:sergioramosvicente2004@gmail.com"
                className="text-primary hover:underline"
              >
                sergioramosvicente2004@gmail.com
              </a>{' '}
              indicando tu solicitud. Responderemos en un plazo máximo de 30
              días.
            </p>
            <p className="mt-3">
              Asimismo, tienes derecho a presentar una reclamación ante la
              Agencia Española de Protección de Datos (AEPD) si consideras que
              el tratamiento de tus datos no es conforme a la normativa vigente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              8. Cookies
            </h2>
            <p>
              Facturas utiliza únicamente cookies técnicas necesarias para el
              funcionamiento del servicio (sesión de usuario, preferencias). No
              utilizamos cookies de seguimiento ni publicitarias. Nuestro
              servicio de analítica (Plausible) no utiliza cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              9. Seguridad
            </h2>
            <p>
              Implementamos medidas técnicas y organizativas adecuadas para
              proteger tus datos personales contra el acceso no autorizado, la
              alteración, divulgación o destrucción. Entre estas medidas se
              incluyen el cifrado de datos en tránsito (HTTPS/TLS),
              autenticación segura y controles de acceso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              10. Cambios en esta política
            </h2>
            <p>
              Nos reservamos el derecho de actualizar esta política de privacidad
              en cualquier momento. Notificaremos los cambios significativos a
              través del email registrado o mediante un aviso en el Sitio Web.
              La fecha de &quot;última actualización&quot; en la parte superior
              de esta página indica cuándo se realizó la última modificación.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">
              Contacto
            </h2>
            <p>
              Para cualquier consulta relacionada con la privacidad o el
              tratamiento de tus datos, puedes escribir a{' '}
              <a
                href="mailto:sergioramosvicente2004@gmail.com"
                className="text-primary hover:underline"
              >
                sergioramosvicente2004@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
