import Link from "next/link";
import {
  BOOKING_STATUSES,
  SERVICES,
  formatARS,
  photoSrc,
  type BookingStatus,
  type ServiceKey,
} from "@/lib/constants";
import type { WorkerListItem } from "@/lib/workers";
import { Foto } from "./foto";

const AVATAR_COLORS = [
  "bg-rose-200 text-rose-800",
  "bg-amber-200 text-amber-800",
  "bg-emerald-200 text-emerald-800",
  "bg-sky-200 text-sky-800",
  "bg-violet-200 text-violet-800",
  "bg-teal-200 text-teal-800",
];

const AVATAR_SIZES = {
  md: "h-12 w-12 text-base",
  lg: "h-24 w-24 text-3xl",
  xl: "h-32 w-32 text-4xl",
} as const;

/** Foto de perfil real si existe; iniciales como último recurso. */
export function Avatar({
  name,
  photo,
  size = "md",
}: {
  name: string;
  photo?: string | null;
  size?: keyof typeof AVATAR_SIZES;
}) {
  const src = photoSrc(photo);
  if (src) {
    return (
      <Foto
        src={src}
        alt={name}
        className={`${AVATAR_SIZES[size]} shrink-0 rounded-full border-2 border-white object-cover shadow-md`}
      />
    );
  }
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  const color = AVATAR_COLORS[name.length % AVATAR_COLORS.length];
  return (
    <div
      className={`${color} ${AVATAR_SIZES[size]} flex shrink-0 items-center justify-center rounded-full font-semibold`}
    >
      {initials}
    </div>
  );
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-700 px-2.5 py-0.5 text-sm font-semibold text-white">
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
        <path
          fillRule="evenodd"
          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
          clipRule="evenodd"
        />
      </svg>
      Verificada
    </span>
  );
}

export function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-500" aria-label={`${rating} de 5 estrellas`}>
      {"★".repeat(Math.round(rating))}
      <span className="text-stone-300">{"★".repeat(5 - Math.round(rating))}</span>
    </span>
  );
}

const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDIENTE: "bg-amber-100 text-amber-700",
  ACEPTADA: "bg-sky-100 text-sky-700",
  RECHAZADA: "bg-stone-200 text-stone-600",
  CANCELADA: "bg-stone-200 text-stone-600",
  COMPLETADA: "bg-emerald-100 text-emerald-700",
};

export function StatusBadge({ status }: { status: string }) {
  const key = status as BookingStatus;
  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_STYLES[key] ?? "bg-stone-200 text-stone-600"}`}
    >
      {BOOKING_STATUSES[key] ?? status}
    </span>
  );
}

export function ServiceChips({ services }: { services: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {services.map((service) => (
        <span
          key={service}
          className="rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-800"
        >
          {SERVICES[service as ServiceKey] ?? service}
        </span>
      ))}
    </div>
  );
}

/** Card de trabajadora: la foto es la protagonista. */
export function WorkerCard({ worker }: { worker: WorkerListItem }) {
  const src = photoSrc(worker.photo);
  return (
    <Link
      href={`/trabajadoras/${worker.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-200">
        {src ? (
          <Foto
            src={src}
            alt={worker.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl font-bold text-stone-400">
            {worker.name[0]}
          </div>
        )}
        {worker.verified && (
          <span className="absolute left-3 top-3">
            <VerifiedBadge />
          </span>
        )}
        <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1.5 text-base font-bold text-emerald-800 shadow">
          {formatARS(worker.hourlyRate)}/h
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-xl font-bold text-stone-900">{worker.name}</h3>
          {worker.rating != null && (
            <span className="shrink-0 text-base font-semibold text-stone-700">
              ★ {worker.rating}{" "}
              <span className="font-normal text-stone-400">({worker.reviewCount})</span>
            </span>
          )}
        </div>
        <p className="text-base text-stone-500">
          {worker.yearsExperience} años de experiencia · {worker.zones.slice(0, 2).join(", ")}
          {worker.zones.length > 2 && ` +${worker.zones.length - 2}`}
        </p>
        <p className="line-clamp-2 text-base text-stone-600">{worker.bio}</p>
        <div className="mt-auto pt-1">
          <ServiceChips services={worker.services} />
        </div>
      </div>
    </Link>
  );
}
