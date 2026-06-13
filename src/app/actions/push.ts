"use server";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";

type SerializedSub = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function subscribeUser(sub: SerializedSub): Promise<{ ok: boolean }> {
  const session = await requireSession();
  await db.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    create: {
      userId: session.userId,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
    update: { userId: session.userId, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
  });
  return { ok: true };
}

export async function unsubscribeUser(endpoint: string): Promise<{ ok: boolean }> {
  await requireSession();
  await db.pushSubscription.deleteMany({ where: { endpoint } });
  return { ok: true };
}
