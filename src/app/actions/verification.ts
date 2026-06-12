"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { saveUpload } from "@/lib/uploads";
import { ZONES } from "@/lib/constants";
import type { FormState } from "./auth";

const MAX_SIZE = 8 * 1024 * 1024; // 8MB por foto (fotos de celular)
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/heic": ".heic",
};

// prefix "foto-" = foto de perfil pública; el resto es privado (DNI/selfie)
async function saveImage(
  file: File,
  prefix: "foto-" | "doc-",
): Promise<string | { error: string }> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) return { error: "Las fotos tienen que ser JPG, PNG o similar" };
  if (file.size === 0) return { error: "Falta una de las fotos" };
  if (file.size > MAX_SIZE) return { error: "Cada foto puede pesar hasta 8MB" };

  const name = prefix + randomBytes(16).toString("hex") + ext;
  await saveUpload(name, Buffer.from(await file.arrayBuffer()), file.type);
  return name;
}

export async function submitVerification(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) return { error: "No encontramos tu cuenta" };
  if (["EN_REVISION", "VERIFICADA"].includes(user.verificationStatus)) {
    return { error: "Tu verificación ya está en curso" };
  }

  const dniNumber = String(formData.get("dniNumber") ?? "").replace(/\D/g, "");
  if (dniNumber.length < 7 || dniNumber.length > 8) {
    return { error: "Ingresá un número de DNI válido" };
  }

  const addressStreet = String(formData.get("addressStreet") ?? "").trim();
  const addressZone = String(formData.get("addressZone") ?? "");
  if (addressStreet.length < 5) {
    return { error: "Ingresá tu dirección como figura en tu DNI" };
  }
  if (!(ZONES as readonly string[]).includes(addressZone)) {
    return { error: "Elegí tu zona" };
  }

  const files: Array<[field: string, prefix: "foto-" | "doc-"]> = [
    ["photo", "foto-"],
    ["docFront", "doc-"],
    ["docBack", "doc-"],
    ["selfie", "doc-"],
  ];
  const saved: Record<string, string> = {};
  for (const [field, prefix] of files) {
    const value = formData.get(field);
    if (!(value instanceof File)) return { error: "Faltan fotos por subir" };
    const result = await saveImage(value, prefix);
    if (typeof result !== "string") return result;
    saved[field] = result;
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      dniNumber,
      addressStreet,
      addressZone,
      photo: saved.photo,
      docFront: saved.docFront,
      docBack: saved.docBack,
      selfie: saved.selfie,
      verificationStatus: "EN_REVISION",
      verificationNote: "",
    },
  });

  redirect("/panel?verificacion=enviada");
}
