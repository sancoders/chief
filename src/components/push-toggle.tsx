"use client";

import { useEffect, useState } from "react";
import { subscribeUser, unsubscribeUser } from "@/app/actions/push";

// Convierte la clave pública VAPID (base64url) al formato que pide el navegador.
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type State = "loading" | "hidden" | "off" | "on" | "busy";

export function PushToggle() {
  const [state, setState] = useState<State>("loading");
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if (!key || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("hidden");
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? "on" : "off"))
      .catch(() => setState("hidden"));
  }, [key]);

  async function enable() {
    setState("busy");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key!),
      });
      await subscribeUser(JSON.parse(JSON.stringify(sub)));
      setState("on");
    } catch {
      // Permiso denegado o error: volvemos al estado apagado.
      setState("off");
    }
  }

  async function disable() {
    setState("busy");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await unsubscribeUser(sub.endpoint);
        await sub.unsubscribe();
      }
    } finally {
      setState("off");
    }
  }

  if (state === "loading" || state === "hidden") return null;

  if (state === "on") {
    return (
      <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <span className="text-base text-emerald-800">
          🔔 Avisos activados — te notificamos las novedades de tus reservas.
        </span>
        <button
          type="button"
          onClick={disable}
          className="shrink-0 text-sm font-medium text-emerald-700 hover:underline"
        >
          Desactivar
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-base text-stone-700">
        🔔 Activá los avisos para enterarte al instante de solicitudes y respuestas.
      </span>
      <button
        type="button"
        onClick={enable}
        disabled={state === "busy"}
        className="shrink-0 rounded-xl bg-emerald-700 px-5 py-2.5 text-base font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {state === "busy" ? "Activando…" : "Activar avisos"}
      </button>
    </div>
  );
}
