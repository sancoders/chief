import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { updateBookingStatus } from "@/app/actions/bookings";
import { resolveVerification } from "@/app/actions/admin";
import { Avatar, StatusBadge, VerifiedBadge } from "@/components/ui";
import { ReviewForm } from "@/components/forms";
import {
  BOOKING_TYPES,
  VERIFICATION_STATUSES,
  formatARS,
  type BookingType,
  type VerificationStatus,
} from "@/lib/constants";

export const metadata = { title: "Mi panel" };

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ActionButton({
  bookingId,
  status,
  label,
  variant,
}: {
  bookingId: string;
  status: string;
  label: string;
  variant: "primary" | "secondary" | "danger";
}) {
  const styles = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700",
    secondary: "border border-stone-300 text-stone-600 hover:bg-stone-100",
    danger: "border border-rose-300 text-rose-600 hover:bg-rose-50",
  };
  return (
    <form action={updateBookingStatus}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${styles[variant]}`}
      >
        {label}
      </button>
    </form>
  );
}

function BookingMeta({
  booking,
}: {
  booking: {
    type: string;
    date: Date;
    hours: number;
    zone: string;
    address: string;
    notes: string;
    subtotal: number;
  };
}) {
  return (
    <div className="mt-2 space-y-0.5 text-sm text-stone-600">
      <p>
        {BOOKING_TYPES[booking.type as BookingType]} · {formatDate(booking.date)}
        {booking.type === "HORA" && ` · ${booking.hours} hs`}
      </p>
      <p>
        {booking.zone} — {booking.address}
      </p>
      {booking.notes && <p className="text-stone-500">Notas: {booking.notes}</p>}
      <p className="font-medium text-stone-800">
        Estimado: {formatARS(booking.subtotal)}
        {booking.type === "MENSUAL" && " por mes"}
      </p>
    </div>
  );
}

async function ClientPanel(userId: string, newBookingId?: string) {
  const bookings = await db.booking.findMany({
    where: { clientId: userId },
    include: { worker: { include: { user: true } }, review: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      {newBookingId && bookings.some((b) => b.id === newBookingId) && (
        <div className="mb-6 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-800">
          ✓ ¡Solicitud enviada! La trabajadora la va a revisar y te confirmamos.
          Cuando acepte, vas a ver su teléfono acá para coordinar.
        </div>
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-stone-900">Mis reservas</h2>
        <Link
          href="/trabajadoras"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Nueva búsqueda
        </Link>
      </div>
      {bookings.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-500">
          Todavía no hiciste ninguna reserva.{" "}
          <Link href="/trabajadoras" className="font-medium text-emerald-700 hover:underline">
            Buscá ayuda en tu zona
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-2xl border border-stone-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={booking.worker.user.name} />
                  <div>
                    <Link
                      href={`/trabajadoras/${booking.worker.id}`}
                      className="font-semibold text-stone-900 hover:underline"
                    >
                      {booking.worker.user.name}
                    </Link>
                    {booking.status === "ACEPTADA" && (
                      <p className="text-sm text-emerald-700">
                        📞 {booking.worker.user.phone}
                      </p>
                    )}
                  </div>
                </div>
                <StatusBadge status={booking.status} />
              </div>
              <BookingMeta booking={booking} />
              <div className="mt-3 flex gap-2">
                {["PENDIENTE", "ACEPTADA"].includes(booking.status) && (
                  <ActionButton
                    bookingId={booking.id}
                    status="CANCELADA"
                    label="Cancelar"
                    variant="danger"
                  />
                )}
              </div>
              {booking.status === "COMPLETADA" && !booking.review && (
                <div className="mt-4">
                  <ReviewForm bookingId={booking.id} />
                </div>
              )}
              {booking.review && (
                <p className="mt-3 text-sm text-stone-500">
                  Tu reseña: {"★".repeat(booking.review.rating)} — “
                  {booking.review.comment}”
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

async function WorkerPanel(userId: string) {
  const profile = await db.workerProfile.findUnique({
    where: { userId },
    include: {
      bookings: {
        include: { client: true, review: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!profile) redirect("/");

  const pending = profile.bookings.filter((b) => b.status === "PENDIENTE");
  const accepted = profile.bookings.filter((b) => b.status === "ACEPTADA");
  const history = profile.bookings.filter(
    (b) => !["PENDIENTE", "ACEPTADA"].includes(b.status),
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-stone-900">Mi trabajo</h2>
        <Link
          href="/panel/perfil"
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
        >
          Editar mi perfil
        </Link>
      </div>

      {profile.verificationStatus === "SIN_DOCS" && (
        <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-base text-amber-800">
          Tu perfil todavía <strong>no aparece en las búsquedas</strong>. Subí tu
          DNI y una selfie para empezar la verificación.{" "}
          <Link href="/panel/verificacion" className="font-semibold underline">
            Verificarme ahora →
          </Link>
        </div>
      )}
      {profile.verificationStatus === "EN_REVISION" && (
        <div className="mt-4 rounded-xl bg-sky-50 px-4 py-3 text-base text-sky-800">
          Tus documentos están <strong>en revisión</strong>. Te contactamos por
          WhatsApp para la entrevista. Mientras tanto tu perfil no aparece en las
          búsquedas.
        </div>
      )}
      {profile.verificationStatus === "RECHAZADA" && (
        <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-base text-rose-800">
          Tu verificación fue <strong>rechazada</strong>
          {profile.verificationNote && <>: {profile.verificationNote}</>}.{" "}
          <Link href="/panel/verificacion" className="font-semibold underline">
            Volver a intentar →
          </Link>
        </div>
      )}

      <section className="mt-6">
        <h3 className="font-semibold text-stone-900">
          Solicitudes nuevas {pending.length > 0 && `(${pending.length})`}
        </h3>
        {pending.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">No tenés solicitudes pendientes.</p>
        ) : (
          <div className="mt-3 space-y-4">
            {pending.map((booking) => (
              <div
                key={booking.id}
                className="rounded-2xl border border-amber-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold text-stone-900">
                    {booking.client.name}
                  </span>
                  <StatusBadge status={booking.status} />
                </div>
                <BookingMeta booking={booking} />
                <div className="mt-3 flex gap-2">
                  <ActionButton
                    bookingId={booking.id}
                    status="ACEPTADA"
                    label="Aceptar"
                    variant="primary"
                  />
                  <ActionButton
                    bookingId={booking.id}
                    status="RECHAZADA"
                    label="Rechazar"
                    variant="secondary"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h3 className="font-semibold text-stone-900">Trabajos confirmados</h3>
        {accepted.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">Nada confirmado por ahora.</p>
        ) : (
          <div className="mt-3 space-y-4">
            {accepted.map((booking) => (
              <div
                key={booking.id}
                className="rounded-2xl border border-stone-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-semibold text-stone-900">
                      {booking.client.name}
                    </span>
                    <p className="text-sm text-emerald-700">📞 {booking.client.phone}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
                <BookingMeta booking={booking} />
                <div className="mt-3">
                  <ActionButton
                    bookingId={booking.id}
                    status="COMPLETADA"
                    label="Marcar como completado"
                    variant="primary"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {history.length > 0 && (
        <section className="mt-8">
          <h3 className="font-semibold text-stone-900">Historial</h3>
          <div className="mt-3 space-y-2">
            {history.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm"
              >
                <span className="text-stone-700">
                  {booking.client.name} · {formatDate(booking.date)} ·{" "}
                  {formatARS(booking.subtotal)}
                </span>
                <span className="flex items-center gap-2">
                  {booking.review && (
                    <span className="text-amber-500">
                      {"★".repeat(booking.review.rating)}
                    </span>
                  )}
                  <StatusBadge status={booking.status} />
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

const STATUS_ORDER: Record<string, number> = {
  EN_REVISION: 0,
  SIN_DOCS: 1,
  RECHAZADA: 2,
  VERIFICADA: 3,
};

function AdminVerificationCard({
  worker,
}: {
  worker: {
    id: string;
    verificationStatus: string;
    dniNumber: string | null;
    docFront: string | null;
    docBack: string | null;
    selfie: string | null;
    hourlyRate: number;
    user: { name: string; email: string; phone: string };
  };
}) {
  const status = worker.verificationStatus;
  const docs = [
    ["DNI frente", worker.docFront],
    ["DNI dorso", worker.docBack],
    ["Selfie", worker.selfie],
  ].filter((d): d is [string, string] => d[1] != null);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={worker.user.name} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-stone-900">
                {worker.user.name}
              </span>
              {status === "VERIFICADA" && <VerifiedBadge />}
            </div>
            <p className="text-sm text-stone-500">
              {worker.user.email} · {worker.user.phone} ·{" "}
              {formatARS(worker.hourlyRate)}/h
            </p>
            {worker.dniNumber && (
              <p className="text-sm text-stone-500">DNI: {worker.dniNumber}</p>
            )}
          </div>
        </div>
        <StatusVerification status={status} />
      </div>

      {docs.length > 0 && status !== "VERIFICADA" && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {docs.map(([label, file]) => (
            <a
              key={file}
              href={`/api/docs/${file}`}
              target="_blank"
              className="block overflow-hidden rounded-xl border border-stone-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/docs/${file}`}
                alt={label}
                className="h-32 w-full object-cover"
              />
              <span className="block bg-stone-50 px-2 py-1 text-center text-xs text-stone-600">
                {label}
              </span>
            </a>
          ))}
        </div>
      )}

      {status === "EN_REVISION" && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <form action={resolveVerification}>
            <input type="hidden" name="workerId" value={worker.id} />
            <input type="hidden" name="decision" value="VERIFICADA" />
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-base font-semibold text-white hover:bg-emerald-700"
            >
              Verificar ✓
            </button>
          </form>
          <form action={resolveVerification} className="flex flex-1 gap-2">
            <input type="hidden" name="workerId" value={worker.id} />
            <input type="hidden" name="decision" value="RECHAZADA" />
            <input
              name="note"
              placeholder="Motivo del rechazo"
              className="h-11 min-w-40 flex-1 rounded-xl border border-stone-300 px-3 text-base"
            />
            <button
              type="submit"
              className="rounded-xl border border-rose-300 px-4 py-2.5 text-base font-medium text-rose-600 hover:bg-rose-50"
            >
              Rechazar
            </button>
          </form>
        </div>
      )}
      {status === "VERIFICADA" && (
        <form action={resolveVerification} className="mt-3">
          <input type="hidden" name="workerId" value={worker.id} />
          <input type="hidden" name="decision" value="SIN_DOCS" />
          <button
            type="submit"
            className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100"
          >
            Quitar verificación
          </button>
        </form>
      )}
    </div>
  );
}

function StatusVerification({ status }: { status: string }) {
  const styles: Record<string, string> = {
    EN_REVISION: "bg-sky-100 text-sky-700",
    SIN_DOCS: "bg-stone-200 text-stone-600",
    RECHAZADA: "bg-rose-100 text-rose-700",
    VERIFICADA: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${styles[status] ?? ""}`}
    >
      {VERIFICATION_STATUSES[status as VerificationStatus] ?? status}
    </span>
  );
}

async function AdminPanel() {
  const [workers, stats] = await Promise.all([
    db.workerProfile.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }),
    Promise.all([
      db.user.count({ where: { role: "CLIENT" } }),
      db.booking.count(),
      db.booking.aggregate({ _sum: { fee: true }, where: { status: "COMPLETADA" } }),
    ]),
  ]);
  const [clientCount, bookingCount, feeAgg] = stats;
  const sorted = [...workers].sort(
    (a, b) =>
      (STATUS_ORDER[a.verificationStatus] ?? 9) -
      (STATUS_ORDER[b.verificationStatus] ?? 9),
  );
  const inReview = workers.filter((w) => w.verificationStatus === "EN_REVISION");

  return (
    <>
      <h2 className="text-2xl font-bold text-stone-900">Administración</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Trabajadoras", workers.length],
          ["Clientes", clientCount],
          ["Reservas", bookingCount],
          ["Comisiones (completadas)", formatARS(feeAgg._sum.fee ?? 0)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-stone-200 bg-white p-4">
            <p className="text-xs text-stone-500">{label}</p>
            <p className="mt-1 text-xl font-bold text-stone-900">{value}</p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h3 className="text-lg font-semibold text-stone-900">
          Verificaciones {inReview.length > 0 && `· ${inReview.length} en revisión`}
        </h3>
        <div className="mt-3 space-y-3">
          {sorted.map((worker) => (
            <AdminVerificationCard key={worker.id} worker={worker} />
          ))}
        </div>
      </section>
    </>
  );
}

export default async function PanelPage({
  searchParams,
}: {
  searchParams: Promise<{ reserva?: string }>;
}) {
  const session = await requireSession();
  const { reserva } = await searchParams;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-stone-500">Hola, {session.name.split(" ")[0]} 👋</p>
      <div className="mt-4">
        {session.role === "CLIENT" && (await ClientPanel(session.userId, reserva))}
        {session.role === "WORKER" && (await WorkerPanel(session.userId))}
        {session.role === "ADMIN" && (await AdminPanel())}
      </div>
    </div>
  );
}
