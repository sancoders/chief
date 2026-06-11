"use client";

import { useEffect } from "react";

// Registra el service worker (offline + push). No renderiza nada.
export function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => {
          // Sin SW la app sigue funcionando; solo se pierde offline/push.
        });
    }
  }, []);
  return null;
}
