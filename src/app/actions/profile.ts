"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { SERVICES, ZONES } from "@/lib/constants";
import type { FormState } from "./auth";

const profileSchema = z.object({
  bio: z.string().trim().min(20, "Contanos un poco más sobre vos (mínimo 20 caracteres)"),
  hourlyRate: z.coerce.number().int().min(1000, "Ingresá tu tarifa por hora"),
  yearsExperience: z.coerce.number().int().min(0).max(60),
  zones: z.array(z.enum(ZONES)).min(1, "Elegí al menos una zona"),
  services: z.array(z.enum(Object.keys(SERVICES) as [string, ...string[]])).min(1, "Elegí al menos un servicio"),
});

export async function updateProfile(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireRole("WORKER");

  const parsed = profileSchema.safeParse({
    bio: formData.get("bio"),
    hourlyRate: formData.get("hourlyRate"),
    yearsExperience: formData.get("yearsExperience"),
    zones: formData.getAll("zones"),
    services: formData.getAll("services"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const data = parsed.data;

  await db.workerProfile.update({
    where: { userId: session.userId },
    data: {
      bio: data.bio,
      hourlyRate: data.hourlyRate,
      yearsExperience: data.yearsExperience,
      zones: JSON.stringify(data.zones),
      services: JSON.stringify(data.services),
    },
  });

  revalidatePath("/panel/perfil");
  revalidatePath("/trabajadoras");
  return {};
}
