"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { ZONES } from "@/lib/constants";
import type { FormState } from "./auth";

const addressSchema = z.object({
  label: z.string().trim().min(1, "Poné un nombre, ej: Casa").max(30),
  zone: z.enum(ZONES, { message: "Elegí la zona" }),
  street: z.string().trim().min(5, "Ingresá calle y número"),
  details: z.string().trim().max(200).default(""),
});

export async function addAddress(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();

  const parsed = addressSchema.safeParse({
    label: formData.get("label"),
    zone: formData.get("zone"),
    street: formData.get("street"),
    details: formData.get("details") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db.address.create({
    data: { userId: session.userId, ...parsed.data },
  });
  revalidatePath("/perfil/direcciones");
  return {};
}

export async function deleteAddress(formData: FormData): Promise<void> {
  const session = await requireSession();
  const id = String(formData.get("addressId") ?? "");
  // deleteMany con userId evita borrar direcciones ajenas.
  await db.address.deleteMany({ where: { id, userId: session.userId } });
  revalidatePath("/perfil/direcciones");
}
