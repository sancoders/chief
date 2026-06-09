import Link from "next/link";
import { APP_NAME, SERVICES } from "@/lib/constants";
import { listWorkers } from "@/lib/workers";
import { WorkerCard } from "@/components/ui";

const STEPS = [
  {
    title: "Buscá en tu zona",
    description:
      "Filtrá por barrio, servicio y tarifa. Todas las trabajadoras publicadas pasaron una entrevista y validación de identidad.",
  },
  {
    title: "Mandá tu solicitud",
    description:
      "Elegí por hora, día completo o mensual fijo. Ves el precio estimado antes de confirmar, sin sorpresas.",
  },
  {
    title: "Ella acepta y coordinan",
    description:
      "La trabajadora confirma la solicitud y coordinan los detalles. Vos pagás directo, sin intermediarios.",
  },
  {
    title: "Calificá el servicio",
    description:
      "Tu reseña ayuda a otras familias a elegir con confianza, y a las trabajadoras a conseguir más clientes.",
  },
];

const TRUST_POINTS = [
  {
    title: "Identidad validada",
    description: "DNI verificado y entrevista personal antes de publicar cada perfil.",
  },
  {
    title: "Referencias reales",
    description: "Pedimos referencias laborales comprobables a cada trabajadora.",
  },
  {
    title: "Reseñas de clientes",
    description: "Solo puede dejar reseña quien contrató de verdad por la plataforma.",
  },
];

export default async function HomePage() {
  const featured = (await listWorkers({})).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-emerald-50 to-stone-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
              Ayuda doméstica de confianza,{" "}
              <span className="text-emerald-700">verificada de verdad</span>
            </h1>
            <p className="mt-4 text-lg text-stone-600">
              Encontrá trabajadoras de casas particulares con identidad validada,
              referencias y reseñas reales — en tu barrio, por hora, por día o
              mensual. Y si trabajás en casas, conseguí más clientes sin depender
              del boca a boca.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/trabajadoras"
                className="rounded-xl bg-emerald-600 px-6 py-3 text-center font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Buscar ayuda en mi zona
              </Link>
              <Link
                href="/registro?rol=trabajadora"
                className="rounded-xl border border-emerald-600 px-6 py-3 text-center font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                Quiero trabajar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-wrap justify-center gap-2">
          {Object.entries(SERVICES).map(([key, label]) => (
            <Link
              key={key}
              href={`/trabajadoras?servicio=${key}`}
              className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-emerald-400 hover:text-emerald-700"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-center text-3xl font-bold text-stone-900">
          ¿Cómo funciona?
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-stone-200 bg-white p-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                {index + 1}
              </div>
              <h3 className="mt-4 font-semibold text-stone-900">{step.title}</h3>
              <p className="mt-2 text-sm text-stone-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Confianza */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center text-3xl font-bold text-stone-900">
            La confianza es el producto
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-stone-600">
            Hoy encontrar a alguien para tu casa depende de conocidos. {APP_NAME}{" "}
            existe para que no tengas que cruzar los dedos.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {TRUST_POINTS.map((point) => (
              <div key={point.title} className="rounded-2xl bg-emerald-50 p-6">
                <h3 className="font-semibold text-emerald-900">✓ {point.title}</h3>
                <p className="mt-2 text-sm text-emerald-800">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destacadas */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-stone-900">
              Trabajadoras verificadas
            </h2>
            <Link
              href="/trabajadoras"
              className="text-sm font-medium text-emerald-700 hover:underline"
            >
              Ver todas →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        </section>
      )}

      {/* CTA trabajadoras */}
      <section className="bg-emerald-700">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-white">
            ¿Trabajás en casas particulares?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-emerald-100">
            Conseguí clientes nuevos sin depender del boca a boca. Vos ponés tu
            tarifa, tus zonas y tus horarios. Registrarte es gratis.
          </p>
          <Link
            href="/registro?rol=trabajadora"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            Crear mi perfil gratis
          </Link>
        </div>
      </section>
    </div>
  );
}
