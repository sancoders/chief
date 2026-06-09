import Link from "next/link";
import {
  BOOKING_STATUSES,
  SERVICES,
  formatARS,
  type BookingStatus,
  type ServiceKey,
} from "@/lib/constants";
import type { WorkerListItem } from "@/lib/workers";

const AVATAR_COLORS = [
  "bg-rose-200 text-rose-800",
  "bg-amber-200 text-amber-800",
  "bg-emerald-200 text-emerald-800",
  "bg-sky-200 text-sky-800",
  "bg-violet-200 text-violet-800",
  "bg-teal-200 text-teal-800",
];

export function Avatar({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  const color = AVATAR_COLORS[name.length % AVATAR_COLORS.length];
  const sizeClasses = size === "lg" ? "h-20 w-20 text-2xl" : "h-12 w-12 text-base";
  return (
    <div
      className={`${color} ${sizeClasses} flex shrink-0 items-center justify-center rounded-full font-semibold`}
    >
      {initials}
    </div>
  );
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-sm font-medium text-emerald-700">
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
          className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600"
        >
          {SERVICES[service as ServiceKey] ?? service}
        </span>
      ))}
    </div>
  );
}

export function WorkerCard({ worker }: { worker: WorkerListItem }) {
  return (
    <Link
      href={`/trabajadoras/${worker.id}`}
      className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <Avatar name={worker.name} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-stone-900">{worker.name}</h3>
            {worker.verified && <VerifiedBadge />}
          </div>
          <p className="text-sm text-stone-500">
            {worker.yearsExperience} años de experiencia
            {worker.rating != null && (
              <>
                {" · "}
                <Stars rating={worker.rating} /> ({worker.reviewCount})
              </>
            )}
          </p>
        </div>
      </div>
      <p className="line-clamp-2 text-base text-stone-600">{worker.bio}</p>
      <ServiceChips services={worker.services} />
      <div className="flex items-center justify-between border-t border-stone-100 pt-3">
        <span className="text-sm text-stone-500">{worker.zones.slice(0, 3).join(" · ")}</span>
        <span className="font-semibold text-emerald-700">
          {formatARS(worker.hourlyRate)}/h
        </span>
      </div>
    </Link>
  );
}
