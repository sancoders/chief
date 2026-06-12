// Recorrido E2E con navegador real en viewport de celular + capturas.
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = "http://localhost:3100";
const SHOTS = "/tmp/shots";
fs.mkdirSync(SHOTS, { recursive: true });

// PNG 1x1 para subir como "foto"
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);
fs.writeFileSync("/tmp/foto.png", PNG);

const results = [];
function ok(name, cond, extra = "") {
  results.push(`${cond ? "✓" : "✗ FALLO"} ${name} ${extra}`);
  if (!cond) process.exitCode = 1;
}

async function login(page, email) {
  await page.goto(`${BASE}/ingresar`);
  await page.fill("#email", email);
  await page.fill("#password", "demo1234");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/panel**", { timeout: 15000 });
}

async function logout(page) {
  await page.goto(`${BASE}/perfil`);
  await page.click("text=Cerrar sesión");
  await page.click("text=Sí, salir");
  await page.waitForURL(BASE + "/", { timeout: 15000 });
}

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const page = await context.newPage();
page.on("response", (r) => {
  if (r.status() >= 500) results.push(`✗ HTTP ${r.status()} en ${r.url()}`);
});

// 1. Landing anónima
await page.goto(BASE);
await page.waitForLoadState("networkidle");
await page.screenshot({ path: `${SHOTS}/01-landing.png`, fullPage: true });
ok("landing carga", await page.isVisible("text=con nombre y cara"));

// 2. Directorio anónimo → gate
await page.goto(`${BASE}/trabajadoras`);
ok("gate anónimo", await page.isVisible("text=identidad verificada"));
await page.screenshot({ path: `${SHOTS}/02-gate-anonimo.png` });

// 3. Cliente sin verificar → gate + verificación completa
await login(page, "nuevo@demo.caseras.ar");
await page.goto(`${BASE}/trabajadoras`);
ok("gate sin docs", await page.isVisible("text=verificá tu identidad", undefined) || await page.isVisible("text=Verificá tu identidad"));
await page.screenshot({ path: `${SHOTS}/03-gate-sindocs.png` });

await page.goto(`${BASE}/verificacion`);
await page.screenshot({ path: `${SHOTS}/04-verificacion-form.png`, fullPage: true });
// Foto de perfil "de celular": ruido de ~10MB para probar la compresión
// client-side (el bug real de producción era el 413 por fotos pesadas).
const bigPhoto = await page.evaluate(() => {
  const c = document.createElement("canvas");
  c.width = 2400;
  c.height = 1800;
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(c.width, c.height);
  for (let i = 0; i < img.data.length; i++) img.data[i] = (Math.random() * 256) | 0;
  ctx.putImageData(img, 0, 0);
  return c.toDataURL("image/png").split(",")[1];
});
fs.writeFileSync("/tmp/foto-grande.png", Buffer.from(bigPhoto, "base64"));
await page.setInputFiles('input[name="photo"]', "/tmp/foto-grande.png");
await page.waitForFunction(
  () => {
    const f = document.querySelector('input[name="photo"]').files[0];
    return f && f.size < 2 * 1024 * 1024;
  },
  { timeout: 20000 },
);
ok("foto pesada comprimida en el cliente", true);
await page.fill("#dniNumber", "34555666");
await page.setInputFiles('input[name="docFront"]', "/tmp/foto.png");
await page.setInputFiles('input[name="docBack"]', "/tmp/foto.png");
await page.setInputFiles('input[name="selfie"]', "/tmp/foto.png");
await page.fill("#addressStreet", "Honduras 4800, 2º A");
await page.selectOption("#addressZone", "Palermo");
await page.click("text=Enviar para revisión");
await page.waitForURL("**/panel**", { timeout: 15000 });
ok("verificación enviada", await page.isVisible("text=Recibimos tus documentos"));
await page.screenshot({ path: `${SHOTS}/05-enviada.png` });
await logout(page);

// 4. Admin aprueba los documentos → queda pendiente la charla de bienvenida
await login(page, "admin@caseras.ar");
ok("admin ve a Martín en revisión", await page.isVisible("text=Martín López"));
await page.screenshot({ path: `${SHOTS}/06-admin-cola.png`, fullPage: true });
const card = () =>
  page.locator("div.rounded-2xl", { hasText: "Martín López" }).first();
await card().locator("text=Aprobar docs").click();
await page.waitForTimeout(1500);
ok("Martín pasa a charla", await card().locator("text=Charla hecha").isVisible());
await logout(page);

// 4b. Martín ve el aviso de la charla de bienvenida
await login(page, "nuevo@demo.caseras.ar");
ok("banner de charla", await page.isVisible("text=charla de bienvenida"));
await page.screenshot({ path: `${SHOTS}/06b-charla.png` });
await logout(page);

// 4c. Admin confirma la charla → verificada
await login(page, "admin@caseras.ar");
await card().locator("text=Charla hecha").click();
await page.waitForTimeout(1500);
ok(
  "Martín verificado",
  await card().locator("text=Quitar verificación").isVisible(),
);
await logout(page);

// 5. Martín (ya verificado) ve el directorio con fotos
await login(page, "nuevo@demo.caseras.ar");
// La landing logueada no recluta: sin "Quiero trabajar", con CTA propio.
await page.goto(BASE);
await page.waitForLoadState("networkidle");
ok("landing logueada sin reclutamiento", !(await page.isVisible("text=Quiero trabajar")));
ok("landing logueada con CTA propio", await page.isVisible("text=Buscar trabajadoras"));
await page.goto(`${BASE}/trabajadoras`);
await page.waitForLoadState("networkidle");
ok("directorio visible verificado", await page.isVisible("text=María Gómez"));
ok("fotos en cards", (await page.locator("img[alt='María Gómez']").count()) > 0);
await page.screenshot({ path: `${SHOTS}/07-directorio.png`, fullPage: true });

// 6. Detalle + reserva
await page.click("text=María Gómez");
await page.waitForURL("**/trabajadoras/**");
await page.waitForLoadState("networkidle");
await page.screenshot({ path: `${SHOTS}/08-detalle.png`, fullPage: true });
await page.click("text=Reservar a María");
await page.waitForURL("**/reservar/**");
await page.fill("#date", "2026-07-15");
await page.selectOption("#zone", "Palermo");
await page.fill("#address", "Honduras 4800, 2º A");
await page.screenshot({ path: `${SHOTS}/09-reserva.png`, fullPage: true });
await page.click("text=Enviar solicitud");
await page.waitForURL("**/panel?reserva=**", { timeout: 15000 });
ok("reserva creada", await page.isVisible("text=¡Solicitud enviada!"));
await page.screenshot({ path: `${SHOTS}/10-reserva-ok.png` });
await logout(page);

// 7. María acepta
await login(page, "maria@demo.caseras.ar");
ok("maría ve solicitud", await page.isVisible("text=Martín López"));
await page.click("text=Aceptar");
await page.waitForTimeout(1500);
ok("solicitud aceptada", await page.isVisible("text=Marcar como completado"));
await page.screenshot({ path: `${SHOTS}/11-panel-trabajadora.png`, fullPage: true });

// 8. Perfil con tab bar
await page.goto(`${BASE}/perfil`);
await page.waitForLoadState("networkidle");
await page.screenshot({ path: `${SHOTS}/12-perfil.png`, fullPage: true });
ok("cerrar sesión al fondo", await page.isVisible("text=Cerrar sesión"));

// 9. PWA: manifest linkeado, service worker activo y fallback offline
ok("link rel=manifest", (await page.locator('link[rel="manifest"]').count()) > 0);
ok("meta theme-color", (await page.locator('meta[name="theme-color"]').count()) > 0);
ok("apple-touch-icon", (await page.locator('link[rel="apple-touch-icon"]').count()) > 0);
const swState = await page.evaluate(async () => {
  const reg = await navigator.serviceWorker.ready;
  return reg.active?.state;
});
ok("service worker activo", swState === "activated");
await context.setOffline(true);
await page.goto(`${BASE}/trabajadoras`).catch(() => {});
ok("fallback offline", await page.isVisible("text=Sin conexión"));
await page.screenshot({ path: `${SHOTS}/13-offline.png` });
await context.setOffline(false);

await browser.close();
console.log(results.join("\n"));
