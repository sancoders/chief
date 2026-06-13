"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { deleteUpload } from "@/lib/uploads";

/**
 * Resuelve una verificación de identidad (de cliente o trabajadora).
 * decision: "ENTREVISTA" (docs aprobados, falta la charla de bienvenida)
 *         | "VERIFICADA" | "RECHAZADA" | "SIN_DOCS" (quitar verificación)
 */
export async function resolveVerification(formData: FormData): Promise<void> {
  await requireRole("ADMIN");

  const userId = String(formData.get("userId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!["ENTREVISTA", "VERIFICADA", "RECHAZADA", "SIN_DOCS"].includes(decision)) return;

  // Minimización de datos: al verificar, las imágenes de DNI y selfie ya
  // cumplieron su función. Las borramos del storage y guardamos solo el ✓
  // y el número de DNI — así una eventual brecha no expone documentos.
  let docCleanup: Record<string, null> = {};
  if (decision === "VERIFICADA") {
    const u = await db.user.findUnique({
      where: { id: userId },
      select: { docFront: true, docBack: true, selfie: true },
    });
    for (const f of [u?.docFront, u?.docBack, u?.selfie]) {
      if (f && !f.startsWith("http")) await deleteUpload(f).catch(() => {});
    }
    docCleanup = { docFront: null, docBack: null, selfie: null };
  }

  await db.user.update({
    where: { id: userId },
    data: {
      verificationStatus: decision,
      verifiedAt: decision === "VERIFICADA" ? new Date() : null,
      verificationNote: decision === "RECHAZADA" ? note : "",
      ...docCleanup,
    },
  });

  revalidatePath("/panel");
  revalidatePath("/trabajadoras");
}
