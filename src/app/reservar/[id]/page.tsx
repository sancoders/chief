import { notFound, redirect } from "next/navigation";
import { getWorker } from "@/lib/workers";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Avatar, Stars, VerifiedBadge } from "@/components/ui";
import { BookingForm } from "@/components/forms";
import { VerificationGate } from "@/components/gate";
import { formatARS } from "@/lib/constants";

export const metadata = { title: "Reservar" };

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/ingresar");
  if (user.role !== "CLIENT") redirect("/panel");
  if (user.verificationStatus !== "VERIFICADA") {
    return <VerificationGate status={user.verificationStatus} />;
  }
  const session = { userId: user.id };

  const { id } = await params;
  const [worker, addresses] = await Promise.all([
    getWorker(id),
    db.address.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "asc" },
      select: { id: true, label: true, zone: true, street: true },
    }),
  ]);
  if (!worker || !worker.verified) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-stone-900">Nueva solicitud</h1>
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4">
        <Avatar name={worker.name} photo={worker.photo} size="lg" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-900">{worker.name}</span>
            {worker.verified && <VerifiedBadge />}
          </div>
          <p className="text-sm text-stone-500">
            {formatARS(worker.hourlyRate)}/h
            {worker.rating != null && (
              <>
                {" · "}
                <Stars rating={worker.rating} />
              </>
            )}
          </p>
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
        <BookingForm
          workerId={worker.id}
          hourlyRate={worker.hourlyRate}
          workerZones={worker.zones}
          addresses={addresses}
        />
      </div>
    </div>
  );
}
