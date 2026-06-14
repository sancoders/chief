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
): Promise<void> {
  if (!configured) {
    console.warn("[push] inactivo: falta NEXT_PUBLIC_VAPID_PUBLIC_KEY o VAPID_PRIVATE_KEY en el entorno");
    return;
  }
  const subs = await db.pushSubscription.findMany({ where: { userId } });
  console.log(`[push] enviando a ${subs.length} suscripción(es) de ${userId}`);
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title, body, url, icon: "/icon-192.png" }),
        );
      } catch (err: unknown) {
        const code = (err as { statusCode?: number })?.statusCode;
        console.warn(`[push] fallo envío (status ${code ?? "?"})`);
        // 404/410 = suscripción vencida: la limpiamos para no reintentar.
        if (code === 404 || code === 410) {
          await db.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
        }
      }
    }),
  );
}
