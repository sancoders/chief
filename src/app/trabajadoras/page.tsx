import { listWorkers } from "@/lib/workers";
import { getSessionUser } from "@/lib/auth";
import { WorkerCard } from "@/components/ui";
import { VerificationGate } from "@/components/gate";
import { SERVICES, ZONES } from "@/lib/constants";

export const metadata = { title: "Buscar ayuda" };

const selectClass =
  "h-12 rounded-xl border border-stone-300 bg-white px-3 text-base text-stone-900 focus:border-emerald-600 focus:outline-none";

export default async function WorkersPage({
  searchParams,
}: {
  searchParams: Promise<{ zona?: string; servicio?: string; tarifa?: string }>;
}) {
  const user = await getSessionUser();

  // Comunidad cerrada: solo cuentas verificadas ven los perfiles.
  if (!user || user.verificationStatus !== "VERIFICADA") {
    return <VerificationGate status={user ? user.verificationStatus : null} />;
  }

  const params = await searchParams;
  const maxRate = params.tarifa ? Number(params.tarifa) : undefined;
  const workers = await listWorkers({
    zone: params.zona || undefined,
    service: params.servicio || undefined,
    maxRate: maxRate && !Number.isNaN(maxRate) ? maxRate : undefined,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">
        Buscar ayuda
      </h1>
      <p className="mt-1 text-base text-stone-600">
        Todas con identidad verificada: DNI, dirección y entrevista. ✓
      </p>

      <form method="get" className="mt-5 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="zona" className="mb-1 block text-sm font-medium text-stone-500">
            Zona
          </label>
          <select id="zona" name="zona" defaultValue={params.zona ?? ""} className={selectClass}>
            <option value="">Todas las zonas</option>
            {ZONES.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="servicio" className="mb-1 block text-sm font-medium text-stone-500">
            Servicio
          </label>
          <select
            id="servicio"
            name="servicio"
            defaultValue={params.servicio ?? ""}
            className={selectClass}
          >
            <option value="">Todos los servicios</option>
            {Object.entries(SERVICES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tarifa" className="mb-1 block text-sm font-medium text-stone-500">
            Tarifa máxima
          </label>
          <select
            id="tarifa"
            name="tarifa"
            defaultValue={params.tarifa ?? ""}
            className={selectClass}
          >
            <option value="">Sin límite</option>
            <option value="5000">Hasta $5.000/h</option>
            <option value="7000">Hasta $7.000/h</option>
            <option value="10000">Hasta $10.000/h</option>
          </select>
        </div>
        <button
          type="submit"
          className="h-12 rounded-xl bg-emerald-700 px-6 text-base font-semibold text-white hover:bg-emerald-800"
        >
          Filtrar
        </button>
      </form>

      {workers.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center text-base text-stone-500">
          No encontramos trabajadoras con esos filtros todavía. Probá ampliar la
          búsqueda o volvé pronto: sumamos perfiles nuevos todas las semanas.
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {workers.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} />
          ))}
        </div>
      )}
    </div>
  );
}
