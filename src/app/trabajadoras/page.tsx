import { listWorkers } from "@/lib/workers";
import { WorkerCard } from "@/components/ui";
import { SERVICES, ZONES } from "@/lib/constants";

export const metadata = { title: "Buscar ayuda" };

const selectClass =
  "rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-emerald-500 focus:outline-none";

export default async function WorkersPage({
  searchParams,
}: {
  searchParams: Promise<{ zona?: string; servicio?: string; tarifa?: string }>;
}) {
  const params = await searchParams;
  const maxRate = params.tarifa ? Number(params.tarifa) : undefined;
  const workers = await listWorkers({
    zone: params.zona || undefined,
    service: params.servicio || undefined,
    maxRate: maxRate && !Number.isNaN(maxRate) ? maxRate : undefined,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-900">Buscar ayuda</h1>
      <p className="mt-1 text-stone-600">
        Todas las trabajadoras publicadas están verificadas: identidad validada,
        entrevista y referencias.
      </p>

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="zona" className="mb-1 block text-xs font-medium text-stone-500">
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
          <label htmlFor="servicio" className="mb-1 block text-xs font-medium text-stone-500">
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
          <label htmlFor="tarifa" className="mb-1 block text-xs font-medium text-stone-500">
            Tarifa máxima por hora
          </label>
          <select
            id="tarifa"
            name="tarifa"
            defaultValue={params.tarifa ?? ""}
            className={selectClass}
          >
            <option value="">Sin límite</option>
            <option value="5000">Hasta $5.000</option>
            <option value="7000">Hasta $7.000</option>
            <option value="10000">Hasta $10.000</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Filtrar
        </button>
      </form>

      {workers.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center text-stone-500">
          No encontramos trabajadoras con esos filtros todavía. Probá ampliar la
          búsqueda o volvé pronto: sumamos perfiles nuevos todas las semanas.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workers.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} />
          ))}
        </div>
      )}
    </div>
  );
}
