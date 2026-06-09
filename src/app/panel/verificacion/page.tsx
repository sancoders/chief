import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { VerificationForm } from "@/components/forms";

export const metadata = { title: "Verificación" };

export default async function VerificationPage() {
  const session = await requireRole("WORKER");
  const profile = await db.workerProfile.findUnique({
    where: { userId: session.userId },
  });
  if (!profile) redirect("/panel");

  const status = profile.verificationStatus;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link href="/panel" className="text-base text-stone-500 hover:underline">
        ← Volver al panel
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-stone-900">Verificación</h1>
      <p className="mt-1 text-base text-stone-600">
        Para aparecer en las búsquedas necesitamos validar tu identidad. Es gratis
        y se hace una sola vez.
      </p>

      {status === "VERIFICADA" && (
        <div className="mt-6 rounded-2xl bg-emerald-50 p-6 text-base text-emerald-800">
          ✓ <strong>¡Estás verificada!</strong> Tu perfil ya aparece en las
          búsquedas de tu zona.
        </div>
      )}

      {status === "EN_REVISION" && (
        <div className="mt-6 rounded-2xl bg-sky-50 p-6 text-base text-sky-800">
          Recibimos tus documentos y están <strong>en revisión</strong>. Te vamos a
          contactar por WhatsApp para una entrevista corta. Suele tomar 1 o 2 días
          hábiles.
        </div>
      )}

      {(status === "SIN_DOCS" || status === "RECHAZADA") && (
        <>
          {status === "RECHAZADA" && (
            <div className="mt-6 rounded-2xl bg-rose-50 p-6 text-base text-rose-800">
              Tu verificación anterior fue rechazada
              {profile.verificationNote && (
                <>
                  : <strong>{profile.verificationNote}</strong>
                </>
              )}
              . Podés volver a intentar subiendo las fotos de nuevo.
            </div>
          )}
          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-stone-900">
              Subí tus documentos
            </h2>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-base text-stone-600">
              <li>Foto del frente de tu DNI</li>
              <li>Foto del dorso de tu DNI</li>
              <li>Una selfie sosteniendo tu DNI</li>
            </ol>
            <p className="mt-2 text-sm text-stone-500">
              Tus documentos son privados: solo los ve el equipo de verificación,
              nunca los clientes.
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
