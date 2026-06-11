// Genera los íconos de la PWA renderizando SVG con Chromium (sin dependencias nuevas).
// Uso: node scripts/icons.mjs  (CHROMIUM_PATH opcional, igual que e2e.mjs)
import { chromium } from "playwright";
import fs from "node:fs";

const EMERALD = "#059669"; // emerald-600, color de marca (ver header)
const EMERALD_DARK = "#047857"; // emerald-700

// Casita con corazón: el glifo de Caseras. viewBox 0 0 100 100.
function svg({ fullBleed }) {
  // Maskable/apple: fondo a sangre completa y glifo más chico (zona segura 80%).
  const rx = fullBleed ? 0 : 22;
  const scale = fullBleed ? 0.68 : 0.84;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${EMERALD}"/>
      <stop offset="1" stop-color="${EMERALD_DARK}"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="${rx}" fill="url(#bg)"/>
  <g transform="translate(50 52) scale(${scale}) translate(-50 -50)">
    <path fill="#ffffff" d="M50 12 L92 48 L82 48 L82 86 L18 86 L18 48 L8 48 Z"/>
    <path fill="url(#bg)" d="M50 74 C41 66 35 61 35 54 C35 48.7 39.2 45 43.8 45 C46.4 45 48.8 46.3 50 48.4 C51.2 46.3 53.6 45 56.2 45 C60.8 45 65 48.7 65 54 C65 61 59 66 50 74 Z"/>
  </g>
</svg>`;
}

const OUT = [
  // [archivo, tamaño, fullBleed]
  ["public/icon-192.png", 192, false],
  ["public/icon-512.png", 512, false],
  ["public/icon-maskable-192.png", 192, true],
  ["public/icon-maskable-512.png", 512, true],
  ["src/app/icon.png", 192, false], // favicon (convención de Next)
  ["src/app/apple-icon.png", 180, true], // iOS aplica su propia máscara
];

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
const page = await browser.newPage();

for (const [file, size, fullBleed] of OUT) {
  await page.setViewportSize({ width: size, height: size });
  const html = `<!doctype html><body style="margin:0">${svg({ fullBleed })
    .replace('viewBox="0 0 100 100"', `viewBox="0 0 100 100" width="${size}" height="${size}"`)}</body>`;
  await page.setContent(html);
  await page.screenshot({ path: file, omitBackground: !fullBleed });
  console.log(`✓ ${file} (${size}x${size})`);
}

await browser.close();
fs.rmSync("src/app/favicon.ico", { force: true }); // reemplazado por icon.png
