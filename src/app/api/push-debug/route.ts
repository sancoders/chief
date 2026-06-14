import { NextResponse } from "next/server";
import webpush from "web-push";
import { db } from "@/lib/db";

// Diagnóstico temporal de notificaciones. Gateado por token. Borrar después.
// ?key=caseras-diag-9f3        → estado de claves y suscripciones (por rol)
// ?key=caseras-diag-9f3&test=1 → manda una notificación de prueba a todas
const TOKEN = "caseras-diag-9f3";

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("key") !== TOKEN) {
    return new NextResponse("no", { status: 404 });
  }
  const doTest = url.searchParams.get("test") === "1";

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const configured = Boolean(publicKey && privateKey);

  const subs = await db.pushSubscription.findMany({
    include: { user: { select: { role: true } } },
  });

  const results: Array<Record<string, unknown>> = [];
  if (doTest && configured) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:hola@caseras.com.ar",
      publicKey!,
      privateKey!,
    );
    for (const s of subs) {
      try {
        const r = await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({
            title: "Prueba Caseras",
            body: "¡Las notificaciones funcionan! 🎉",
            url: "/panel",
            icon: "/icon-192.png",
          }),
        );
        results.push({ role: s.user.role, status: r.statusCode });
      } catch (err) {
        results.push({
          role: s.user.role,
          error: (err as { statusCode?: number }).statusCode ?? (err as Error).message?.slice(0, 80),
        });
      }
    }
  }

  return NextResponse.json({
    configured,
    count: subs.length,
    roles: subs.map((s) => s.user.role),
    test: results,
  });
}
