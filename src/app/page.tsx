import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Foto } from "@/components/foto";

// Retratos ilustrativos para la landing (placeholders de marketing).
// Los perfiles reales solo se ven con cuenta verificada.
const HERO_PHOTOS = [
  "https://randomuser.me/api/portraits/women/65.jpg",
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
];

const STEPS = [
  {
    title: "Verificate una vez",
    description:
      "DNI, foto y dirección. Acá nadie es anónimo: ni quien trabaja ni quien contrata. Por eso adentro hay confianza.",
  },
  {
    title: "Elegí con la cara adelante",
    description:
      "Perfiles con foto grande, experiencia, zona, tarifa y reseñas de familias reales. Sabés exactamente a quién le abrís la puerta.",
  },
  {
    title: "Reservá como te convenga",
    description:
      "Por hora, día completo o mensual fijo. Ves el precio antes de confirmar y coordinás directo cuando ella acepta.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-orange-50 via-[#faf3ea] to-[#faf6f0]">
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-10 sm:pb-20 sm:pt-16">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="inline-block rounded-full bg-emerald-700 px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-white">
                Comunidad 100% verificada
              </p>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-5xl">
                La ayuda para tu casa,{" "}
                <span className="text-orange-700">con nombre y cara</span>
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-stone-600">
                Trabajadoras de casas particulares con DNI verificado, foto real
                y reseñas de familias como la tuya. Y si trabajás en casas:
                clientes serios, también verificados.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/registro"
                  className="rounded-2xl bg-emerald-700 px-7 py-4 text-center text-lg font-bold text-white shadow-md transition hover:bg-emerald-800"
                >
                  Buscar ayuda
                </Link>
                <Link
                  href="/registro?rol=trabajadora"
                  className="rounded-2xl border-2 border-orange-700 px-7 py-4 text-center text-lg font-bold text-orange-800 transition hover:bg-orange-50"
                >
                  Quiero trabajar
                </Link>
              </div>
            </div>
            {/* Collage de retratos */}
            <div className="mx-auto flex items-center justify-center">
              <div className="flex -space-x-6 sm:-space-x-8">
                {HERO_PHOTOS.map((src, index) => (
                  <Foto
                    key={src}
                    src={src}
                    alt="Trabajadora de la comunidad"
                    className={`h-28 w-28 rounded-full border-4 border-white object-cover shadow-xl sm:h-40 sm:w-40 ${
                      index === 1 ? "z-10 -translate-y-4 scale-110" : ""
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-base font-medium text-stone-500">
            <span>✓ DNI verificado</span>
            <span>✓ Dirección validada</span>
            <span>✓ Reseñas reales</span>
            <span>✓ De los dos lados</span>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-stone-900">
          Así de simple
        </h2>
        <div className="mt-10 space-y-8">
          {STEPS.map((step, index) => (
            <div key={step.title} className="flex gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-700 text-xl font-extrabold text-white">
                {index + 1}
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900">{step.title}</h3>
                <p className="mt-1 text-base leading-relaxed text-stone-600">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Por qué cerrada */}
      <section className="bg-emerald-900">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            ¿Por qué no mostramos los perfiles acá?
          </h2>
          <p className="mx-auto mt-4 text-lg leading-relaxed text-emerald-100">
            Porque la confianza se gana. Solo las personas con identidad
            verificada pueden ver y contactar a las trabajadoras — igual que
            ellas verifican su identidad para trabajar. Sin curiosos, sin
            anónimos, sin riesgos de más.
          </p>
          <Link
            href="/registro"
            className="mt-8 inline-block rounded-2xl bg-white px-8 py-4 text-lg font-bold text-emerald-900 transition hover:bg-emerald-50"
          >
            Sumarme y verificarme
          </Link>
        </div>
      </section>

      {/* Para trabajadoras */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="overflow-hidden rounded-3xl bg-orange-700">
          <div className="grid items-center md:grid-cols-2">
            <div className="p-8 sm:p-12">
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                ¿Trabajás en casas particulares?
              </h2>
              <p className="mt-3 text-lg leading-relaxed text-orange-100">
                Dejá de depender del boca a boca. Vos ponés tu tarifa, tus zonas
                y tus horarios — y las familias que te contactan también están
                verificadas con DNI. Registrarte es gratis.
              </p>
              <Link
                href="/registro?rol=trabajadora"
                className="mt-6 inline-block rounded-2xl bg-white px-7 py-4 text-lg font-bold text-orange-800 transition hover:bg-orange-50"
              >
                Crear mi perfil gratis
              </Link>
            </div>
            <div className="hidden h-full min-h-72 md:block">
              <Foto
                src="https://randomuser.me/api/portraits/women/26.jpg"
                alt="Trabajadora de la comunidad"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Cierre */}
      <section className="px-4 pb-16 pt-4 text-center">
        <h2 className="text-2xl font-extrabold tracking-tight text-stone-900">
          {APP_NAME}: gente de confianza, de los dos lados de la puerta.
        </h2>
        <Link
          href="/registro"
          className="mt-6 inline-block rounded-2xl bg-emerald-700 px-8 py-4 text-lg font-bold text-white shadow-md transition hover:bg-emerald-800"
        >
          Empezar ahora
        </Link>
      </section>
    </div>
  );
}
