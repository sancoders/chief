import Link from "next/link";
import { getSession } from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";
import { BottomTabs, DesktopNav, ProfileMenu } from "./nav";

export async function Header() {
  const session = await getSession();

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight text-emerald-700"
          >
            {APP_NAME}
          </Link>
          <div className="flex items-center gap-3">
            <DesktopNav session={session} />
            {session ? (
              <ProfileMenu session={session} />
            ) : (
              <Link
                href="/registro"
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-base font-semibold text-white hover:bg-emerald-700"
              >
                Crear cuenta
              </Link>
            )}
          </div>
        </div>
      </header>
      <BottomTabs session={session} />
    </>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto hidden border-t border-stone-200 bg-white md:block">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-base text-stone-500 sm:flex-row">
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
