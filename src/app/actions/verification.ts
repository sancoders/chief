"use server";

import { mkdir, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { UPLOADS_DIR } from "@/lib/uploads";
import type { FormState } from "./auth";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB por foto
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/heic": ".heic",
};

async function saveImage(file: File): Promise<string | { error: string }> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) return { error: "Las fotos tienen que ser JPG, PNG o similar" };
  if (file.size === 0) return { error: "Falta una de las fotos" };
  if (file.size > MAX_SIZE) return { error: "Cada foto puede pesar hasta 5MB" };

  const name = randomBytes(16).toString("hex") + ext;
  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(
    path.join(UPLOADS_DIR, name),
    Buffer.from(await file.arrayBuffer()),
  );
  return name;
}

export async function submitVerification(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireRole("WORKER");

  const profile = await db.workerProfile.findUnique({
    where: { userId: session.userId },
  });
  if (!profile) return { error: "No encontramos tu perfil" };
  if (["EN_REVISION", "VERIFICADA"].includes(profile.verificationStatus)) {
    return { error: "Tu verificación ya está en curso" };
  }

  const dniNumber = String(formData.get("dniNumber") ?? "").replace(/\D/g, "");
  if (dniNumber.length < 7 || dniNumber.length > 8) {
    return { error: "Ingresá un número de DNI válido" };
  }

  const files = {
    docFront: formData.get("docFront"),
    docBack: formData.get("docBack"),
    selfie: formData.get("selfie"),
  };
  const saved: Record<string, string> = {};
  for (const [field, value] of Object.entries(files)) {
    if (!(value instanceof File)) return { error: "Faltan fotos por subir" };
    const result = await saveImage(value);
    if (typeof result !== "string") return result;
    saved[field] = result;
  }

  await db.workerProfile.update({
    where: { id: profile.id },
    data: {
      dniNumber,
      docFront: saved.docFront,
      docBack: saved.docBack,
      selfie: saved.selfie,
      verificationStatus: "EN_REVISION",
      verificationNote: "",
    },
  });

  redirect("/panel?verificacion=enviada");
}
