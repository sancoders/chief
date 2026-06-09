"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function setVerified(formData: FormData): Promise<void> {
  await requireRole("ADMIN");

  const workerId = String(formData.get("workerId") ?? "");
  const verified = formData.get("verified") === "true";

  await db.workerProfile.update({
    where: { id: workerId },
    data: { verified, verifiedAt: verified ? new Date() : null },
  });

  revalidatePath("/panel");
  revalidatePath("/trabajadoras");
}
