"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

/**
 * Resuelve una verificación pendiente o revierte una existente.
 * decision: "VERIFICADA" | "RECHAZADA" | "SIN_DOCS" (quitar verificación)
 */
export async function resolveVerification(formData: FormData): Promise<void> {
  await requireRole("ADMIN");

  const workerId = String(formData.get("workerId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!["VERIFICADA", "RECHAZADA", "SIN_DOCS"].includes(decision)) return;

  await db.workerProfile.update({
    where: { id: workerId },
    data: {
      verificationStatus: decision,
      verifiedAt: decision === "VERIFICADA" ? new Date() : null,
      verificationNote: decision === "RECHAZADA" ? note : "",
    },
  });

  revalidatePath("/panel");
  revalidatePath("/trabajadoras");
}
