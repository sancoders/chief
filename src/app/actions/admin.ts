"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

/**
 * Resuelve una verificación de identidad (de cliente o trabajadora).
 * decision: "VERIFICADA" | "RECHAZADA" | "SIN_DOCS" (quitar verificación)
 */
export async function resolveVerification(formData: FormData): Promise<void> {
  await requireRole("ADMIN");

  const userId = String(formData.get("userId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!["VERIFICADA", "RECHAZADA", "SIN_DOCS"].includes(decision)) return;

  await db.user.update({
    where: { id: userId },
    data: {
      verificationStatus: decision,
      verifiedAt: decision === "VERIFICADA" ? new Date() : null,
      verificationNote: decision === "RECHAZADA" ? note : "",
    },
  });

  revalidatePath("/panel");
  revalidatePath("/trabajadoras");
}
