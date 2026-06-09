import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorker } from "@/lib/workers";
import { getSession } from "@/lib/auth";
import { Avatar, ServiceChips, Stars, VerifiedBadge } from "@/components/ui";
import { formatARS } from "@/lib/constants";

export default async function WorkerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [worker, session] = await Promise.all([getWorker(id), getSession()]);
  if (!worker || !worker.verified) notFound();

  const canBook = !session || session.role === "CLIENT";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar name={worker.name} size="lg" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-stone-900">{worker.name}</h1>
              {worker.verified && <VerifiedBadge />}
            </div>
            <p className="mt-1 text-stone-500">
              {worker.yearsExperience} años de experiencia
              {worker.rating != null && (
                <>
                  {" · "}
                  <Stars rating={worker.rating} /> {worker.rating} ({worker.reviewCount}{" "}
                  reseñas)
                </>
              )}
            </p>
            <p className="mt-3 text-stone-700">{worker.bio}</p>
            <div className="mt-4">
              <ServiceChips services={worker.services} />
            </div>
            <p className="mt-4 text-sm text-stone-500">
              <span className="font-medium text-stone-700">Zonas:</span>{" "}
              {worker.zones.join(" · ")}
            </p>
          </div>
          <div className="shrink-0 rounded-xl bg-emerald-50 p-4 text-center sm:w-44">
            <p className="text-2xl font-bold text-emerald-700">
              {formatARS(worker.hourlyRate)}
            </p>
            <p className="text-sm text-emerald-800">por hora</p>
            {canBook ? (
              <Link
                href={session ? `/reservar/${worker.id}` : `/ingresar`}
                className="mt-3 block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Reservar
              </Link>
            ) : (
              <p className="mt-3 text-xs text-emerald-800">
                Ingresá como cliente para reservar
              </p>
            )}
          </div>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-stone-900">
          Reseñas {worker.reviewCount > 0 && `(${worker.reviewCount})`}
        </h2>
        {worker.reviews.length === 0 ? (
          <p className="mt-3 text-stone-500">
            Todavía no tiene reseñas. Sé la primera persona en contratarla y contar
            cómo fue.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {worker.reviews.map((review, index) => (
              <div
                key={index}
                className="rounded-xl border border-stone-200 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <Stars rating={review.rating} />
                  <span className="text-xs text-stone-400">
                    {review.createdAt.toLocaleDateString("es-AR")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-stone-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
