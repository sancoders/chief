import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Avatar } from "@/components/ui";
import { LogoutButton } from "@/components/nav";
import { VERIFICATION_STATUSES, type VerificationStatus } from "@/lib/constants";

export const metadata = { title: "Mi perfil" };

const ROLE_LABELS: Record<string, string> = {
  CLIENT: "Cliente",
  WORKER: "Trabajadora",
  ADMIN: "Administración",
};

function MenuRow({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-5 py-4 transition hover:border-emerald-300"
    >
      <span>
        <span className="block text-base font-semibold text-stone-900">{title}</span>
        <span className="block text-sm text-stone-500">{subtitle}</span>
      </span>
      <span className="text-xl text-stone-300">›</span>
    </Link>
  );
}

export default async function ProfilePage() {
  const session = await requireSession();
  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: { workerProfile: true },
  });
  if (!user) redirect("/ingresar");

  const verificationLabel = user.workerProfile
    ? VERIFICATION_STATUSES[user.workerProfile.verificationStatus as VerificationStatus]
    : null;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5">
        <Avatar name={user.name} size="lg" />
        <div>
          <h1 className="text-xl font-bold text-stone-900">{user.name}</h1>
          <p className="text-sm text-stone-500">{ROLE_LABELS[user.role]}</p>
          <p className="mt-1 text-sm text-stone-500">{user.email}</p>
          <p className="text-sm text-stone-500">{user.phone}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <MenuRow
          href="/perfil/direcciones"
          title="Mis direcciones"
          subtitle="Guardá tus direcciones para reservar más rápido"
        />
        {user.role === "WORKER" && (
          <>
            <MenuRow
              href="/panel/perfil"
              title="Mi perfil público"
              subtitle="Lo que ven los clientes: tarifa, zonas y servicios"
            />
            <MenuRow
              href="/panel/verificacion"
              title="Verificación"
              subtitle={`Estado: ${verificationLabel}`}
            />
          </>
        )}
        <MenuRow
          href="/panel"
          title={user.role === "CLIENT" ? "Mis reservas" : user.role === "WORKER" ? "Mi trabajo" : "Administración"}
          subtitle={
            user.role === "CLIENT"
              ? "Solicitudes, confirmaciones y reseñas"
              : user.role === "WORKER"
                ? "Solicitudes nuevas y trabajos confirmados"
                : "Verificaciones y métricas"
          }
        />
      </div>

      <div className="mt-8">
        <LogoutButton />
      </div>
    </div>
  );
}
