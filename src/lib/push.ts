import "server-only";
import webpush from "web-push";
import { db } from "./db";

// Notificaciones push. Requiere las claves VAPID en el entorno; sin ellas
// queda inactivo (la app funciona igual, solo no manda avisos).
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const configured = Boolean(publicKey && privateKey);

if (configured) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:hola@caseras.com.ar",
    publicKey!,
    privateKey!,
  );
}

export async function notifyUser(
  userId: string,
  title: string,
  body: string,
  url = "/panel",
): Promise<{ configured: boolean; count: number; statuses: Array<number | string> }> {
  if (!configured) {
    console.warn("[push] inactivo: falta NEXT_PUBLIC_VAPID_PUBLIC_KEY o VAPID_PRIVATE_KEY");
    return { configured: false, count: 0, statuses: [] };
  }
  const subs = await db.pushSubscription.findMany({ where: { userId } });
  const statuses: Array<number | string> = [];
  await Promise.all(
    subs.map(async (s) => {
      try {
        const r = await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title, body, url, icon: "/icon-192.png" }),
          // urgency alta: despierta dispositivos en ahorro de batería (Doze).
          // TTL 24h: si está offline, el push espera y llega al reconectar.
          { urgency: "high", TTL: 86400 },
        );
        statuses.push(r.statusCode);
      } catch (err: unknown) {
        const code = (err as { statusCode?: number })?.statusCode;
        statuses.push(code ?? "error");
        // 404/410 = suscripción vencida: la limpiamos para no reintentar.
        if (code === 404 || code === 410) {
          await db.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
        }
      }
    }),
  );
  return { configured: true, count: subs.length, statuses };
}
