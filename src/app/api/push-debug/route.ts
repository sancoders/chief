import { NextResponse } from "next/server";
import webpush from "web-push";
import { db } from "@/lib/db";
import { notifyUser } from "@/lib/push";

// Diagnóstico temporal de notificaciones. Gateado por token. Borrar después.
//   ?key=TOKEN                         → suscripciones con su email/rol
//   ?key=TOKEN&test=1                  → envío de prueba a TODAS
//   ?key=TOKEN&notifyEmail=a@b.com     → simula el aviso de una reserva a ese usuario
const TOKEN = "caseras-diag-9f3";

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("key") !== TOKEN) {
    return new NextResponse("no", { status: 404 });
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const configured = Boolean(publicKey && privateKey);

  // Simula exactamente lo que hace una reserva: avisar a un usuario puntual.
  const notifyEmail = url.searchParams.get("notifyEmail");
  if (notifyEmail) {
    const user = await db.user.findUnique({
      where: { email: notifyEmail.toLowerCase() },
      select: { id: true, role: true },
    });
    if (!user) return NextResponse.json({ error: "usuario no encontrado", notifyEmail });
    const subscriptionsForUser = await db.pushSubscription.count({ where: { userId: user.id } });
    await notifyUser(user.id, "Prueba de reserva", "Simulación de aviso de reserva 🧪");
    return NextResponse.json({ notifyEmail, role: user.role, subscriptionsForUser });
  }

  const subs = await db.pushSubscription.findMany({
    include: { user: { select: { email: true, role: true } } },
  });

  const results: Array<Record<string, unknown>> = [];
  if (url.searchParams.get("test") === "1" && configured) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:hola@caseras.com.ar",
      publicKey!,
      privateKey!,
    );
    for (const s of subs) {
      try {
        const r = await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title: "Prueba Caseras", body: "¡Funciona! 🎉", url: "/panel", icon: "/icon-192.png" }),
        );
        results.push({ email: s.user.email, status: r.statusCode });
      } catch (err) {
        results.push({ email: s.user.email, error: (err as { statusCode?: number }).statusCode });
      }
    }
  }

  return NextResponse.json({
    configured,
    count: subs.length,
    subs: subs.map((s) => ({ email: s.user.email, role: s.user.role })),
    test: results,
  });
}
