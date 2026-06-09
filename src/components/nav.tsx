"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/actions/auth";
import type { Session } from "@/lib/auth";

type Tab = { href: string; label: string; icon: keyof typeof ICONS };

const ICONS = {
  home: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75"
    />
  ),
  search: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  ),
  calendar: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
    />
  ),
  briefcase: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"
    />
  ),
  user: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
    />
  ),
  shield: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
    />
  ),
  login: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
    />
  ),
} as const;

function Icon({ name, className }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
    >
      {ICONS[name]}
    </svg>
  );
}

function tabsForSession(session: Session | null): Tab[] {
  if (!session) {
    return [
      { href: "/", label: "Inicio", icon: "home" },
      { href: "/trabajadoras", label: "Buscar", icon: "search" },
      { href: "/ingresar", label: "Ingresar", icon: "login" },
    ];
  }
  if (session.role === "CLIENT") {
    return [
      { href: "/", label: "Inicio", icon: "home" },
      { href: "/trabajadoras", label: "Buscar", icon: "search" },
      { href: "/panel", label: "Reservas", icon: "calendar" },
      { href: "/perfil", label: "Perfil", icon: "user" },
    ];
  }
  if (session.role === "WORKER") {
    return [
      { href: "/", label: "Inicio", icon: "home" },
      { href: "/panel", label: "Trabajo", icon: "briefcase" },
      { href: "/perfil", label: "Perfil", icon: "user" },
    ];
  }
  return [
    { href: "/", label: "Inicio", icon: "home" },
    { href: "/panel", label: "Admin", icon: "shield" },
    { href: "/perfil", label: "Perfil", icon: "user" },
  ];
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

/** Barra de navegación inferior, solo mobile. Marca la pantalla actual. */
export function BottomTabs({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const tabs = tabsForSession(session);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid auto-cols-fr grid-flow-col">
        {tabs.map((tab) => {
          const active = isActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
                active ? "text-emerald-700" : "text-stone-400"
              }`}
            >
              <span
                className={`rounded-full px-4 py-0.5 ${active ? "bg-emerald-100" : ""}`}
              >
                <Icon name={tab.icon} className="h-6 w-6" />
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Links del header, solo desktop. Resalta la sección actual. */
export function DesktopNav({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const tabs = tabsForSession(session).filter((tab) => tab.href !== "/perfil");

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`rounded-full px-4 py-2 text-base font-medium transition ${
            isActive(pathname, tab.href)
              ? "bg-emerald-100 text-emerald-800"
              : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

const menuItemClass =
  "block w-full px-4 py-3 text-left text-base text-stone-700 hover:bg-stone-50";

/** Avatar con menú desplegable (desktop). Cerrar sesión queda al fondo. */
export function ProfileMenu({ session }: { session: Session }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initials = session.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 font-semibold text-white transition hover:bg-emerald-700"
        aria-label="Mi perfil"
      >
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg">
          <div className="border-b border-stone-100 px-4 py-3">
            <p className="font-semibold text-stone-900">{session.name}</p>
          </div>
          <Link href="/perfil" className={menuItemClass} onClick={() => setOpen(false)}>
            Mi cuenta
          </Link>
          <Link href="/perfil/direcciones" className={menuItemClass} onClick={() => setOpen(false)}>
            Mis direcciones
          </Link>
          {session.role === "WORKER" && (
            <>
              <Link href="/panel/perfil" className={menuItemClass} onClick={() => setOpen(false)}>
                Mi perfil público
              </Link>
              <Link href="/panel/verificacion" className={menuItemClass} onClick={() => setOpen(false)}>
                Verificación
              </Link>
            </>
          )}
          <div className="border-t border-stone-100">
            <form action={logout}>
              <button
                type="submit"
                className="block w-full px-4 py-3 text-left text-base text-rose-600 hover:bg-rose-50"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/** Botón de cerrar sesión con confirmación (página de perfil en mobile). */
export function LogoutButton() {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="w-full rounded-2xl border border-rose-200 bg-white px-4 py-4 text-base font-medium text-rose-600 hover:bg-rose-50"
      >
        Cerrar sesión
      </button>
    );
  }
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
      <span className="flex-1 text-base text-rose-800">¿Cerrar sesión?</span>
      <form action={logout}>
        <button
          type="submit"
          className="rounded-xl bg-rose-600 px-5 py-2.5 text-base font-semibold text-white hover:bg-rose-700"
        >
          Sí, salir
        </button>
      </form>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-base font-medium text-stone-600"
      >
        No
      </button>
    </div>
  );
}
