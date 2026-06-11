import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Header, Footer } from "@/components/header";
import { SwRegister } from "@/components/sw-register";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${APP_NAME} — ${APP_TAGLINE}`,
  description:
    "Encontrá ayuda doméstica verificada cerca tuyo: limpieza, planchado, cocina y cuidado. Trabajadoras con identidad validada y reseñas reales.",
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  // Blanco como el header sticky, para que la barra de estado se funda con él.
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-screen flex-col">
        <SwRegister />
        <Header />
        {/* pb-24 deja lugar para la tab bar fija en mobile */}
        <main className="flex-1 pb-24 md:pb-0">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
