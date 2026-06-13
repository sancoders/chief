import Link from "next/link";
import { APP_NAME, SERVICE_FEE_RATE } from "@/lib/constants";

export const metadata = { title: "Términos y condiciones" };

// Base de términos y condiciones. Conviene que un abogado la revise.
export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">
        Términos y condiciones
      </h1>
      <p className="mt-2 text-sm text-stone-500">
        Última actualización: junio de 2026
      </p>

      <div className="mt-6 space-y-6 text-base leading-relaxed text-stone-700">
        <section>
          <h2 className="text-xl font-bold text-stone-900">Qué es {APP_NAME}</h2>
          <p className="mt-2">
            {APP_NAME} es una plataforma que conecta a familias con trabajadoras
            de casas particulares de identidad verificada. {APP_NAME} facilita el
            contacto; el servicio doméstico lo presta directamente la trabajadora.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900">Verificación e identidad</h2>
          <p className="mt-2">
            Para operar, ambas partes deben verificar su identidad con datos
            reales. Está prohibido crear cuentas con datos falsos o de terceros.
            Podemos suspender cuentas que incumplan.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900">Reservas y pagos</h2>
          <p className="mt-2">
            Al reservar ves un precio estimado. Por ahora el pago del trabajo se
            coordina de forma directa entre la familia y la trabajadora.{" "}
            {APP_NAME} aplica una tarifa de servicio del{" "}
            {Math.round(SERVICE_FEE_RATE * 100)}% sobre el trabajo, que se
            mostrará y cobrará cuando se habiliten los pagos online.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900">Conducta</h2>
          <p className="mt-2">
            Esperamos respeto y buena fe de ambos lados. No se permite acoso,
            discriminación ni usar la plataforma para fines ilegales. Las
            reseñas deben ser honestas y basadas en experiencias reales.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900">Responsabilidad</h2>
          <p className="mt-2">
            {APP_NAME} verifica identidades pero no es empleador de las
            trabajadoras ni parte de la relación laboral o del acuerdo entre las
            partes. Hacemos nuestro mejor esfuerzo por sostener una comunidad
            segura, dentro de lo razonable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900">Baja</h2>
          <p className="mt-2">
            Podés eliminar tu cuenta cuando quieras desde tu perfil. Ver también
            nuestra{" "}
            <Link href="/privacidad" className="font-semibold text-emerald-700 hover:underline">
              política de privacidad
            </Link>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
