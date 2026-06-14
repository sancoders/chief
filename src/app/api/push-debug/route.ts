import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Diagnóstico de notificaciones (solo cuenta agregada, sin datos personales).
// Sirve para verificar config y suscripciones en producción. Borrar después.
export async function GET() {
  const publicKeySet = Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
  const privateKeySet = Boolean(process.env.VAPID_PRIVATE_KEY);

  let subscriptions: number | string;
  try {
    subscriptions = await db.pushSubscription.count();
  } catch (err) {
    subscriptions = `error: ${(err as Error).message.slice(0, 120)}`;
  }

  return NextResponse.json({
    publicKeySet,
    privateKeySet,
    configured: publicKeySet && privateKeySet,
    subscriptions,
  });
}
