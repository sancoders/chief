import Link from "next/link";

/**
 * Pantalla de acceso restringido: la comunidad es verificada en ambos lados.
 * status: null = sin sesión; SIN_DOCS | EN_REVISION | ENTREVISTA | RECHAZADA según el usuario.
 */
export function VerificationGate({ status }: { status: string | null }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
          🔒
        </div>
        {status === null && (
          <>
            <h1 className="mt-5 text-2xl font-extrabold text-stone-900">
              Una comunidad con identidad verificada
            </h1>
            <p className="mt-3 text-base leading-relaxed text-stone-600">
              Acá nadie es anónimo: tanto las familias como las trabajadoras
              verifican su identidad con DNI antes de poder ver perfiles,
              contratar o trabajar. Por eso adentro hay confianza.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/registro"
                className="rounded-xl bg-emerald-700 px-6 py-3.5 text-base font-semibold text-white hover:bg-emerald-800"
              >
                Crear mi cuenta gratis
              </Link>
              <Link
                href="/ingresar"
                className="rounded-xl border border-stone-300 px-6 py-3.5 text-base font-semibold text-stone-700 hover:bg-stone-50"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </>
        )}
        {status === "SIN_DOCS" && (
          <>
            <h1 className="mt-5 text-2xl font-extrabold text-stone-900">
              Te falta un paso: verificá tu identidad
            </h1>
            <p className="mt-3 text-base leading-relaxed text-stone-600">
              Para ver los perfiles y reservar necesitamos validar quién sos
              (DNI + foto + dirección). Lo mismo le pedimos a cada trabajadora:
              así funciona la confianza de los dos lados.
            </p>
            <Link
              href="/verificacion"
              className="mt-6 inline-block w-full rounded-xl bg-emerald-700 px-6 py-3.5 text-base font-semibold text-white hover:bg-emerald-800"
            >
              Verificarme ahora (5 minutos)
            </Link>
          </>
        )}
        {status === "EN_REVISION" && (
          <>
            <h1 className="mt-5 text-2xl font-extrabold text-stone-900">
              Estamos revisando tus datos
            </h1>
            <p className="mt-3 text-base leading-relaxed text-stone-600">
              Recibimos tus documentos. La revisión suele tomar menos de 1 día
              hábil; te avisamos por WhatsApp apenas esté lista. Después vas a
              poder ver todos los perfiles y reservar.
            </p>
          </>
        )}
        {status === "ENTREVISTA" && (
          <>
            <h1 className="mt-5 text-2xl font-extrabold text-stone-900">
              ¡Tus documentos están aprobados!
            </h1>
            <p className="mt-3 text-base leading-relaxed text-stone-600">
              Falta el último paso: una charla de bienvenida de 10 minutos
              para conocernos. La hacemos con cada persona que entra a la
              comunidad. Te escribimos por WhatsApp para coordinarla.
            </p>
          </>
        )}
        {status === "RECHAZADA" && (
          <>
            <h1 className="mt-5 text-2xl font-extrabold text-stone-900">
              Tu verificación fue rechazada
            </h1>
            <p className="mt-3 text-base leading-relaxed text-stone-600">
              Revisá el motivo y volvé a intentarlo con fotos claras de tu DNI.
            </p>
            <Link
              href="/verificacion"
              className="mt-6 inline-block w-full rounded-xl bg-emerald-700 px-6 py-3.5 text-base font-semibold text-white hover:bg-emerald-800"
            >
              Ver motivo y reintentar
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
