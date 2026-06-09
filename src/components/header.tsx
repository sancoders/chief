import Link from "next/link";
import { getSession } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import { APP_NAME } from "@/lib/constants";

export async function Header() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-xl font-bold tracking-tight text-emerald-700">
          {APP_NAME}
        </Link>
        <nav className="flex items-center gap-2 text-sm sm:gap-4">
          <Link
            href="/trabajadoras"
            className="rounded-lg px-3 py-2 font-medium text-stone-600 hover:bg-stone-100"
          >
            Buscar ayuda
          </Link>
          {session ? (
            <>
              <Link
                href="/panel"
                className="rounded-lg px-3 py-2 font-medium text-stone-600 hover:bg-stone-100"
              >
                Mi panel
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-lg px-3 py-2 font-medium text-stone-500 hover:bg-stone-100"
                >
                  Salir
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/ingresar"
                className="rounded-lg px-3 py-2 font-medium text-stone-600 hover:bg-stone-100"
              >
                Ingresar
              </Link>
              <Link
                href="/registro"
                className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-stone-500 sm:flex-row">
        <span>
          {APP_NAME} · Hecho en Argentina 🇦🇷 · {new Date().getFullYear()}
        </span>
        <div className="flex gap-4">
          <Link href="/trabajadoras" className="hover:text-stone-700">
            Buscar ayuda
          </Link>
          <Link href="/registro?rol=trabajadora" className="hover:text-stone-700">
            Trabajá con nosotras
          </Link>
        </div>
      </div>
    </footer>
  );
}
