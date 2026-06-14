"use client";

import { useCallback, useEffect, useState } from "react";
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

type State = "loading" | "hidden" | "prompt" | "busy" | "on";

// Aviso de notificaciones que se muestra solo (no hay que buscar un botón):
// aparece apenas la persona puede activar, con un motivo según el contexto.
export function PushPrompt({
  reason = "Activá los avisos para no perderte ninguna novedad.",
}: {
  reason?: string;
}) {
  const [state, setState] = useState<State>("loading");
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  const saveSubscription = useCallback(async () => {
    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    const sub =
      existing ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key!),
      }));
    await subscribeUser(JSON.parse(JSON.stringify(sub)));
  }, [key]);

  useEffect(() => {
    if (
      !key ||
      typeof Notification === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setState("hidden");
      return;
    }
    if (Notification.permission === "denied") {
      setState("hidden");
      return;
    }
    if (Notification.permission === "granted") {
      // Ya dio permiso antes: nos aseguramos de tener la suscripción guardada.
      saveSubscription()
        .then(() => setState("on"))
        .catch(() => setState("hidden"));
      return;
    }
    setState("prompt");
  }, [key, saveSubscription]);

  async function enable() {
    setState("busy");
    try {
      // subscribe() dispara el pedido de permiso del navegador si hace falta.
      await saveSubscription();
      setState("on");
    } catch {
      // Permiso denegado o no soportado: ocultamos sin molestar.
      setState("hidden");
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
      setState("hidden");
    }
  }

  if (state === "loading" || state === "hidden") return null;

  if (state === "on") {
    return (
      <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <span className="text-base text-emerald-800">🔔 Avisos activados.</span>
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

  // prompt / busy: tarjeta prominente que aparece sola.
  return (
    <div className="mb-4 rounded-2xl border border-emerald-300 bg-emerald-50 p-5">
      <p className="text-lg font-bold text-emerald-900">🔔 Activá las notificaciones</p>
      <p className="mt-1 text-base text-emerald-800">{reason}</p>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={enable}
          disabled={state === "busy"}
          className="rounded-xl bg-emerald-700 px-6 py-3 text-base font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {state === "busy" ? "Activando…" : "Activar"}
        </button>
        <button
          type="button"
          onClick={() => setState("hidden")}
          className="text-base font-medium text-emerald-700 hover:underline"
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}
