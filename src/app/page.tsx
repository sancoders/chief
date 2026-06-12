import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Foto } from "@/components/foto";
import { getSession } from "@/lib/auth";

// ── Assets de marketing ──────────────────────────────────────────────
// Para reemplazar por arte propio (p. ej. generado con Higgsfield):
// poné los archivos en public/ y cambiá estas constantes, p. ej.
// HERO_IMAGE = "/hero.jpg" y HERO_VIDEO = "/hero.mp4" (loop corto, sin
// audio). Con HERO_VIDEO seteado, el hero usa el video; si no, la foto.
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=70";
const HERO_VIDEO = "";
const FEATURE_IMAGE =
  "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=70";

// Retratos de la comunidad (con fallback local en public/demo).
const COMMUNITY = [
  "https://randomuser.me/api/portraits/women/65.jpg",
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
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
      {/* Hero con foto/video de fondo */}
      <section className="relative isolate overflow-hidden bg-emerald-950">
        {HERO_VIDEO ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={HERO_IMAGE}
            src={HERO_VIDEO}
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="kenburns absolute inset-0 -z-20 bg-cover bg-center"
            style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-t from-emerald-950/95 via-emerald-950/60 to-emerald-900/25"
        />
        <div className="mx-auto flex min-h-[76vh] max-w-6xl flex-col justify-end px-4 pb-12 pt-28 sm:min-h-[80vh] sm:pb-16">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {COMMUNITY.map((src) => (
                <Foto
                  key={src}
                  src={src}
                  alt="Trabajadora de la comunidad"
                  className="h-9 w-9 rounded-full border-2 border-emerald-100 object-cover"
                />
              ))}
            </div>
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-100">
              Comunidad 100% verificada
            </p>
          </div>
          <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
            La ayuda para tu casa,{" "}
            <span className="text-orange-300">con nombre y cara</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-emerald-50/90">
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
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-1.5 text-sm font-medium text-emerald-100/80">
            <span>✓ DNI verificado</span>
            <span>✓ Dirección validada</span>
            <span>✓ Reseñas reales</span>
            <span>✓ De los dos lados</span>
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
        <div className="overflow-hidden rounded-3xl bg-emerald-900 shadow-sm">
          <div className="grid md:grid-cols-2">
            <div
              aria-hidden
              className="min-h-56 bg-emerald-800 bg-cover bg-center md:min-h-full"
              style={{ backgroundImage: `url(${FEATURE_IMAGE})` }}
            />
            <div className="p-8 sm:p-10">
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                La confianza se gana
              </h2>
              <p className="mt-3 text-lg leading-relaxed text-emerald-100">
                Solo personas con identidad verificada pueden ver y contactar
                perfiles. Sin curiosos ni anónimos. Y a cada persona que entra
                la recibimos con una charla de bienvenida.
              </p>
              <Link
                href={mainHref}
                className="mt-6 inline-block rounded-2xl bg-white px-7 py-4 text-lg font-bold text-emerald-900 transition hover:bg-emerald-50"
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
          <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-orange-200 bg-orange-50 p-6 sm:flex-row sm:items-center sm:p-8">
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
              className="shrink-0 rounded-2xl bg-orange-700 px-6 py-3.5 text-base font-bold text-white transition hover:bg-orange-800"
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
