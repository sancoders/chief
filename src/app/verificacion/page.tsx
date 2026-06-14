import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { VerificationForm } from "@/components/forms";
import { PushPrompt } from "@/components/push-toggle";
import { CONTACT_WHATSAPP, whatsappUrl } from "@/lib/constants";

export const metadata = { title: "Verificación de identidad" };

export default async function VerificationPage() {
  const session = await requireSession();
  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) redirect("/ingresar");

  const status = user.verificationStatus;
  const isWorker = user.role === "WORKER";

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <PushPrompt reason="Activá las notificaciones y te avisamos apenas aprobemos tu identidad." />
      <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">
        Verificá tu identidad
      </h1>
      <p className="mt-2 text-base leading-relaxed text-stone-600">
        {isWorker
          ? "Para aparecer en las búsquedas y recibir trabajos necesitamos validar quién sos. Es gratis y se hace una sola vez."
          : "Para ver los perfiles y contratar necesitamos validar quién sos. A las trabajadoras les pedimos lo mismo: la confianza va de los dos lados."}
      </p>

      {status === "VERIFICADA" && (
        <div className="mt-6 rounded-2xl bg-emerald-50 p-6 text-base text-emerald-800">
          ✓ <strong>¡Identidad verificada!</strong>{" "}
          {isWorker
            ? "Tu perfil ya aparece en las búsquedas de tu zona."
            : "Ya podés ver todos los perfiles y reservar."}
          <div className="mt-4">
            <Link
              href={isWorker ? "/panel" : "/trabajadoras"}
              className="inline-block rounded-xl bg-emerald-700 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-800"
            >
              {isWorker ? "Ir a mi panel" : "Buscar ayuda"}
            </Link>
          </div>
        </div>
      )}

      {status === "EN_REVISION" && (
        <div className="mt-6 rounded-2xl bg-sky-50 p-6 text-base leading-relaxed text-sky-900">
          <strong>Recibimos tus documentos ✓</strong>
          <p className="mt-2">
            Los estamos revisando — suele tomar menos de 1 día hábil. Te
            avisamos por WhatsApp al {user.phone} apenas esté lista.
          </p>
        </div>
      )}

      {status === "ENTREVISTA" && (
        <div className="mt-6 rounded-2xl bg-amber-50 p-6 text-base leading-relaxed text-amber-900">
          <strong>¡Tus documentos están aprobados! ✓</strong>
          <p className="mt-2">
            Último paso: una charla de bienvenida de 10 minutos para
            conocernos — la hacemos con cada persona que entra a la comunidad,
            de los dos lados.
            {!CONTACT_WHATSAPP &&
              ` Te escribimos por WhatsApp al ${user.phone} para coordinarla.`}
          </p>
          {CONTACT_WHATSAPP && (
            <a
              href={whatsappUrl(CONTACT_WHATSAPP, "¡Hola! Quiero coordinar la charla de bienvenida de Caseras.")}
              target="_blank"
              className="mt-4 inline-block rounded-xl bg-emerald-700 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-800"
            >
              Coordinar por WhatsApp →
            </a>
          )}
        </div>
      )}

      {(status === "SIN_DOCS" || status === "RECHAZADA") && (
        <>
          {status === "RECHAZADA" && (
            <div className="mt-6 rounded-2xl bg-rose-50 p-5 text-base text-rose-800">
              Tu intento anterior fue rechazado
              {user.verificationNote && (
                <>
                  : <strong>{user.verificationNote}</strong>
                </>
              )}
              . Subí las fotos de nuevo, bien iluminadas y sin reflejos.
            </div>
          )}
          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-xl font-bold text-stone-900">Necesitamos</h2>
            <ul className="mt-3 space-y-2 text-base text-stone-700">
              <li>
                <strong>1. Tu foto de perfil</strong> — con tu cara bien visible.
                {isWorker
                  ? " Es lo primero que ven las familias: elegí una donde se te vea bien."
                  : " Las trabajadoras también quieren saber quién las contrata."}
              </li>
              <li>
                <strong>2. DNI</strong> — frente y dorso.
              </li>
              <li>
                <strong>3. Selfie con tu DNI</strong> — sosteniéndolo al lado de tu cara.
              </li>
              <li>
                <strong>4. Tu dirección</strong> — la validamos contra tu DNI.
              </li>
            </ul>
            <p className="mt-3 text-sm text-stone-500">
              Tu DNI y la selfie son privados (solo los ve el equipo de
              verificación). La foto de perfil sí es pública.
            </p>
            <div className="mt-5">
              <VerificationForm />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
