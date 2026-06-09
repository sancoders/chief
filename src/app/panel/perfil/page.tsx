import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ProfileForm } from "@/components/forms";

export const metadata = { title: "Mi perfil" };

export default async function ProfileEditPage() {
  const session = await requireRole("WORKER");
  const profile = await db.workerProfile.findUnique({
    where: { userId: session.userId },
  });
  if (!profile) redirect("/panel");

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Link href="/panel" className="text-sm text-stone-500 hover:underline">
        ← Volver al panel
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-stone-900">Mi perfil</h1>
      <p className="mt-1 text-stone-600">
        Esto es lo que ven los clientes cuando te buscan.
      </p>
      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
        <ProfileForm
          defaults={{
            bio: profile.bio,
            hourlyRate: profile.hourlyRate,
            yearsExperience: profile.yearsExperience,
            zones: JSON.parse(profile.zones),
            services: JSON.parse(profile.services),
          }}
        />
      </div>
    </div>
  );
}
