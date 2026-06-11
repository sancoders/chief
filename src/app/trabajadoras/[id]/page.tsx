import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorker } from "@/lib/workers";
import { getSessionUser } from "@/lib/auth";
import { ServiceChips, Stars, VerifiedBadge } from "@/components/ui";
import { VerificationGate } from "@/components/gate";
import { formatARS, photoSrc } from "@/lib/constants";
import { Foto } from "@/components/foto";

export default async function WorkerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user || user.verificationStatus !== "VERIFICADA") {
    return <VerificationGate status={user ? user.verificationStatus : null} />;
  }

  const { id } = await params;
  const worker = await getWorker(id);
  if (!worker || !worker.verified) notFound();

  const canBook = user.role === "CLIENT";
  const src = photoSrc(worker.photo);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        {/* Foto grande: la gente quiere ver a quién contrata */}
        <div className="relative aspect-[4/3] w-full bg-stone-200 sm:aspect-[16/9]">
          {src ? (
            <Foto src={src} alt={worker.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-8xl font-bold text-stone-400">
              {worker.name[0]}
            </div>
          )}
          {worker.verified && (
            <span className="absolute left-4 top-4">
              <VerifiedBadge />
            </span>
          )}
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">
                {worker.name}
              </h1>
              <p className="mt-1 text-base text-stone-500">
                {worker.yearsExperience} años de experiencia
                {worker.rating != null && (
                  <>
                    {" · "}
                    <Stars rating={worker.rating} /> {worker.rating} (
                    {worker.reviewCount} reseñas)
                  </>
                )}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-5 py-3 text-center">
              <p className="text-2xl font-extrabold text-emerald-800">
                {formatARS(worker.hourlyRate)}
              </p>
              <p className="text-sm font-medium text-emerald-700">por hora</p>
            </div>
          </div>

          <p className="mt-5 text-lg leading-relaxed text-stone-700">{worker.bio}</p>

          <div className="mt-5">
            <ServiceChips services={worker.services} />
          </div>
          <p className="mt-4 text-base text-stone-500">
            <span className="font-semibold text-stone-700">Trabaja en:</span>{" "}
            {worker.zones.join(" · ")}
          </p>

          {canBook && (
            <Link
              href={`/reservar/${worker.id}`}
              className="mt-6 block rounded-2xl bg-emerald-700 px-6 py-4 text-center text-lg font-bold text-white shadow-sm transition hover:bg-emerald-800"
            >
              Reservar a {worker.name.split(" ")[0]}
            </Link>
          )}
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-stone-900">
          Reseñas {worker.reviewCount > 0 && `(${worker.reviewCount})`}
        </h2>
        {worker.reviews.length === 0 ? (
          <p className="mt-3 text-base text-stone-500">
            Todavía no tiene reseñas. Sé la primera persona en contratarla y contar
            cómo fue.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {worker.reviews.map((review, index) => (
              <div
                key={index}
                className="rounded-2xl border border-stone-200 bg-white p-5"
              >
                <div className="flex items-center justify-between">
                  <Stars rating={review.rating} />
                  <span className="text-sm text-stone-400">
                    {review.createdAt.toLocaleDateString("es-AR")}
                  </span>
                </div>
                <p className="mt-2 text-base text-stone-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
