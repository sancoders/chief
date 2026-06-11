import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
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
        <span className="block text-base font-bold text-stone-900">{title}</span>
        <span className="block text-sm text-stone-500">{subtitle}</span>
      </span>
      <span className="text-xl text-stone-300">›</span>
    </Link>
  );
}

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/ingresar");

  const verificationLabel =
    VERIFICATION_STATUSES[user.verificationStatus as VerificationStatus] ??
    user.verificationStatus;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5">
        <Avatar name={user.name} photo={user.photo} size="lg" />
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-stone-900">{user.name}</h1>
          <p className="text-base text-stone-500">
            {ROLE_LABELS[user.role]}
            {user.verificationStatus === "VERIFICADA" && " · ✓ Verificada"}
          </p>
          <p className="mt-1 truncate text-sm text-stone-500">{user.email}</p>
          <p className="text-sm text-stone-500">{user.phone}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {user.role !== "ADMIN" && (
          <MenuRow
            href="/verificacion"
            title="Verificación de identidad"
            subtitle={`Estado: ${verificationLabel}`}
          />
        )}
        <MenuRow
          href="/perfil/direcciones"
          title="Mis direcciones"
          subtitle="Guardá tus direcciones para reservar más rápido"
        />
        {user.role === "WORKER" && (
          <MenuRow
            href="/panel/perfil"
            title="Mi perfil público"
            subtitle="Lo que ven los clientes: tarifa, zonas y servicios"
          />
        )}
        <MenuRow
          href="/panel"
          title={
            user.role === "CLIENT"
              ? "Mis reservas"
              : user.role === "WORKER"
                ? "Mi trabajo"
                : "Administración"
          }
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
