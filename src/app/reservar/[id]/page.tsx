import { notFound, redirect } from "next/navigation";
import { getWorker } from "@/lib/workers";
import { requireSession } from "@/lib/auth";
import { Avatar, Stars, VerifiedBadge } from "@/components/ui";
import { BookingForm } from "@/components/forms";
import { formatARS } from "@/lib/constants";

export const metadata = { title: "Reservar" };

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  if (session.role !== "CLIENT") redirect("/panel");

  const { id } = await params;
  const worker = await getWorker(id);
  if (!worker || !worker.verified) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-stone-900">Nueva solicitud</h1>
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4">
        <Avatar name={worker.name} />
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
        />
      </div>
    </div>
  );
}
