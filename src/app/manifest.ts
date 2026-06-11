import type { MetadataRoute } from "next";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

// Web App Manifest: hace la app instalable (Android/desktop) y es la base
// del paquete para Play Store vía TWA (ver README, sección "App / Play Store").
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME} — ${APP_TAGLINE}`,
    short_name: APP_NAME,
    description:
      "Encontrá ayuda doméstica verificada cerca tuyo: limpieza, planchado, cocina y cuidado. Trabajadoras con identidad validada y reseñas reales.",
    id: "/",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "es-AR",
    background_color: "#faf6f0",
    theme_color: "#ffffff",
    categories: ["lifestyle", "business"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
