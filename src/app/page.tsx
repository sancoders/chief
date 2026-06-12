import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Foto } from "@/components/foto";
import { getSession } from "@/lib/auth";

// ── Assets de marketing ──────────────────────────────────────────────
// HERO_VIDEO: loop corto sin sonido en public/ (H.264). HERO_POSTER se
// muestra mientras carga o si el navegador bloquea el autoplay (vacío =
// fondo verde liso). FEATURE_IMAGE: foto de la sección de confianza.
const HERO_VIDEO = "/hero.mp4";
const HERO_POSTER = "/hero-poster.jpg";
const FEATURE_IMAGE =
  "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=70";

// Tarjetas ilustrativas del hero: caras reales con nombre, como se ven los
// perfiles adentro. Retratos de demostración (fallback local en public/demo).
const PEOPLE = [
  {
    src: "https://randomuser.me/api/portraits/women/65.jpg",
    name: "Rosa",
    service: "Limpieza",
    zone: "Palermo",
    rating: "4,9",
    tilt: "-rotate-3",
    floatDelay: "",
  },
  {
    src: "https://randomuser.me/api/portraits/women/44.jpg",
    name: "María",
    service: "Cocina",
    zone: "Belgrano",
    rating: "5,0",
    tilt: "rotate-2 translate-y-3",
    floatDelay: "floaty-d1",
  },
  {
    src: "https://randomuser.me/api/portraits/women/68.jpg",
    name: "Norma",
    service: "Planchado",
    zone: "Caballito",
    rating: "4,8",
    tilt: "-rotate-1",
    floatDelay: "floaty-d2",
  },
];

const STEPS = [
  {
    title: "Verificate una vez",
    description: "DNI, foto y dirección. Acá nadie es anónimo, de ningún lado de la puerta.",
  },
  {
    title: "Elegí con la cara adelante",
    description: "Perfiles con foto, experiencia, zona, tarifa y reseñas reales.",
  },
  {
    title: "Reservá como te convenga",
    description: "Por hora, día completo o mensual. Ves el precio antes de confirmar.",
  },
];

export default async function HomePage() {
  // Con sesión iniciada la landing no vende registro: lleva a cada rol a lo
  // suyo (cliente → buscar; trabajadora → su panel) y esconde el reclutamiento.
  const session = await getSession();
  const isWorker = session?.role === "WORKER";
  const mainHref = !session ? "/registro" : isWorker ? "/panel" : "/trabajadoras";

  return (
    <div>
      {/* Hero verde con video de fondo; una sola paleta (blanco + esmeralda) */}
      <section className="relative isolate overflow-hidden bg-emerald-950">
        {/* 7,2% más alto que el contenedor: esconde las barras letterbox
            que vienen grabadas en el video (3,5% arriba y abajo). */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          src={HERO_VIDEO}
          poster={HERO_POSTER || undefined}
          style={{ top: "-3.6%", height: "107.2%" }}
          className="absolute left-0 -z-20 w-full object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-t from-emerald-950/95 via-emerald-950/65 to-emerald-950/35"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:pt-20 md:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-white">
              Comunidad 100% verificada
            </p>
            <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
              La ayuda para tu casa,{" "}
              <span className="text-emerald-300">con nombre y cara</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/85">
              Trabajadoras con DNI verificado, foto real y reseñas de familias
              como la tuya.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {!session ? (
                <>
                  <Link
                    href="/registro"
                    className="rounded-2xl bg-white px-7 py-4 text-center text-lg font-bold text-emerald-900 shadow-lg transition hover:bg-emerald-50"
                  >
                    Buscar ayuda
                  </Link>
                  <Link
                    href="/registro?rol=trabajadora"
                    className="rounded-2xl border-2 border-white/70 px-7 py-4 text-center text-lg font-bold text-white transition hover:bg-white/10"
                  >
                    Quiero trabajar
                  </Link>
                </>
              ) : (
                <Link
                  href={isWorker ? "/panel" : "/trabajadoras"}
                  className="rounded-2xl bg-white px-7 py-4 text-center text-lg font-bold text-emerald-900 shadow-lg transition hover:bg-emerald-50"
                >
                  {isWorker ? "Ver mis solicitudes" : "Buscar trabajadoras"}
                </Link>
              )}
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-1.5 text-sm font-medium text-white/75">
              <span>✓ DNI verificado</span>
              <span>✓ Dirección validada</span>
              <span>✓ Reseñas reales</span>
            </div>
          </div>
          {/* Tarjetas de la comunidad */}
          <div className="flex items-center justify-center pb-2">
            <div className="flex -space-x-7 sm:-space-x-5">
              {PEOPLE.map((person) => (
                <div key={person.name} className={person.tilt}>
                  <div
                    className={`floaty ${person.floatDelay} w-32 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-stone-900/5 sm:w-40`}
                  >
                    <Foto
                      src={person.src}
                      alt={`${person.name}, ${person.service.toLowerCase()} en ${person.zone}`}
                      className="aspect-square w-full rounded-xl object-cover"
                    />
                    <div className="px-1 pb-1 pt-2">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-bold text-stone-900">
                          {person.name}
                        </span>
                        <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          ✓ Verificada
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {person.service} · {person.zone} · ★ {person.rating}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-stone-900">
          Así de simple
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-lg font-extrabold text-white">
                {index + 1}
              </div>
              <h3 className="mt-3 text-lg font-bold text-stone-900">{step.title}</h3>
              <p className="mt-1 text-base leading-relaxed text-stone-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Confianza, con foto */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="grid md:grid-cols-2">
            <div
              aria-hidden
              className="min-h-56 bg-stone-200 bg-cover bg-center md:min-h-full"
              style={{ backgroundImage: `url(${FEATURE_IMAGE})` }}
            />
            <div className="p-8 sm:p-10">
              <h2 className="text-3xl font-extrabold tracking-tight text-stone-900">
                La confianza se gana
              </h2>
              <p className="mt-3 text-lg leading-relaxed text-stone-600">
                Solo personas con identidad verificada pueden ver y contactar
                perfiles. Sin curiosos ni anónimos. Y a cada persona que entra
                la recibimos con una charla de bienvenida.
              </p>
              <Link
                href={mainHref}
                className="mt-6 inline-block rounded-2xl bg-emerald-700 px-7 py-4 text-lg font-bold text-white transition hover:bg-emerald-800"
              >
                {!session
                  ? "Sumarme y verificarme"
                  : isWorker
                    ? "Ir a mi panel"
                    : "Ver trabajadoras"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Para trabajadoras: solo visitas sin cuenta */}
      {!session && (
        <section className="mx-auto max-w-6xl px-4 pb-14">
          <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-stone-200 bg-white p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-stone-900">
                ¿Trabajás en casas particulares?
              </h2>
              <p className="mt-1 text-base text-stone-600">
                Tu tarifa, tus zonas, tus horarios — y familias verificadas con DNI.
              </p>
            </div>
            <Link
              href="/registro?rol=trabajadora"
              className="shrink-0 rounded-2xl bg-emerald-700 px-6 py-3.5 text-base font-bold text-white transition hover:bg-emerald-800"
            >
              Crear mi perfil gratis
            </Link>
          </div>
        </section>
      )}

      {/* Cierre */}
      <section className="px-4 pb-16 text-center">
        <h2 className="text-xl font-extrabold tracking-tight text-stone-900">
          {APP_NAME}: gente de confianza, de los dos lados de la puerta.
        </h2>
        <Link
          href={mainHref}
          className="mt-5 inline-block rounded-2xl bg-emerald-700 px-8 py-4 text-lg font-bold text-white shadow-md transition hover:bg-emerald-800"
        >
          {!session ? "Empezar ahora" : isWorker ? "Ir a mi panel" : "Buscar ayuda"}
        </Link>
      </section>
    </div>
  );
}
