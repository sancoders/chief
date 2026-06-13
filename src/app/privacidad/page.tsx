import Link from "next/link";
import { APP_NAME, CONTACT_WHATSAPP } from "@/lib/constants";

export const metadata = { title: "Política de privacidad" };

// Base de política de privacidad para Argentina (Ley 25.326 de Protección de
// Datos Personales). Conviene que un abogado la revise antes de escalar.
export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">
        Política de privacidad
      </h1>
      <p className="mt-2 text-sm text-stone-500">
        Última actualización: junio de 2026
      </p>

      <div className="mt-6 space-y-6 text-base leading-relaxed text-stone-700">
        <p>
          En {APP_NAME} cuidamos tus datos. Esta política explica qué
          información recolectamos, para qué la usamos y qué derechos tenés,
          en el marco de la Ley 25.326 de Protección de Datos Personales.
        </p>

        <section>
          <h2 className="text-xl font-bold text-stone-900">Qué datos recolectamos</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Datos de cuenta: nombre, email y teléfono.</li>
            <li>
              Datos de verificación de identidad: número de DNI, fotos del DNI
              (frente y dorso), una selfie sosteniéndolo y tu dirección.
            </li>
            <li>Foto de perfil (que elegís vos y es pública dentro de la app).</li>
            <li>
              Datos de uso del servicio: reservas, reseñas y direcciones que guardás.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900">Para qué los usamos</h2>
          <p className="mt-2">
            Para validar que sos quien decís ser (la confianza de la comunidad
            depende de eso), conectar a familias con trabajadoras, coordinar
            reservas y mantener las reseñas. No vendemos tus datos a nadie.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900">
            Cuánto tiempo guardamos tus documentos
          </h2>
          <p className="mt-2">
            Las imágenes de tu DNI y la selfie se usan solo para la
            verificación: <strong>una vez aprobada tu identidad, las
            eliminamos</strong> y conservamos únicamente la constancia de que
            estás verificada y tu número de DNI. Cuanto menos guardamos, menos
            hay que pueda filtrarse.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900">Quién ve qué</h2>
          <p className="mt-2">
            Tu DNI y tu selfie son privados: solo los ve el equipo de
            verificación. Tu teléfono se comparte con la otra parte recién
            cuando una reserva es aceptada. Tu foto de perfil y tus reseñas son
            visibles para la comunidad verificada.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900">Cómo los protegemos</h2>
          <p className="mt-2">
            Los datos viajan cifrados (HTTPS), las contraseñas se guardan
            hasheadas y los documentos se almacenan en un bucket privado con
            acceso controlado. El acceso a la base está restringido.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900">Tus derechos</h2>
          <p className="mt-2">
            Podés acceder, rectificar, actualizar o suprimir tus datos en
            cualquier momento. Para borrar toda tu cuenta y tus datos, usá{" "}
            <Link href="/perfil" className="font-semibold text-emerald-700 hover:underline">
              Eliminar mi cuenta
            </Link>{" "}
            en tu perfil. La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, órgano
            de control de la Ley 25.326, tiene la atribución de atender
            denuncias respecto del incumplimiento de las normas sobre
            protección de datos personales.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900">Contacto</h2>
          <p className="mt-2">
            Por cualquier consulta sobre tus datos, escribinos
            {CONTACT_WHATSAPP ? ` por WhatsApp al ${CONTACT_WHATSAPP}` : " desde la app"}.
          </p>
        </section>
      </div>

      <div className="mt-10 border-t border-stone-200 pt-6">
        <Link href="/terminos" className="font-semibold text-emerald-700 hover:underline">
          Ver términos y condiciones →
        </Link>
      </div>
    </article>
  );
}
