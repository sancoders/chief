"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";
import { SERVICES, ZONES, type Role } from "@/lib/constants";

export type FormState = { error?: string };

const registerSchema = z.object({
  name: z.string().trim().min(2, "Ingresá tu nombre completo"),
  email: z.string().trim().toLowerCase().email("Email inválido"),
  phone: z.string().trim().min(8, "Ingresá un teléfono válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["CLIENT", "WORKER"]),
});

const workerSchema = z.object({
  bio: z.string().trim().min(20, "Contanos un poco más sobre vos (mínimo 20 caracteres)"),
  hourlyRate: z.coerce.number().int().min(1000, "Ingresá tu tarifa por hora"),
  yearsExperience: z.coerce.number().int().min(0).max(60),
  zones: z.array(z.enum(ZONES)).min(1, "Elegí al menos una zona"),
  services: z.array(z.enum(Object.keys(SERVICES) as [string, ...string[]])).min(1, "Elegí al menos un servicio"),
});

export async function register(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { name, email, phone, password, role } = parsed.data;

  let workerData: z.infer<typeof workerSchema> | null = null;
  if (role === "WORKER") {
    const workerParsed = workerSchema.safeParse({
      bio: formData.get("bio"),
      hourlyRate: formData.get("hourlyRate"),
      yearsExperience: formData.get("yearsExperience"),
      zones: formData.getAll("zones"),
      services: formData.getAll("services"),
    });
    if (!workerParsed.success) {
      return { error: workerParsed.error.issues[0].message };
    }
    workerData = workerParsed.data;
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe una cuenta con ese email. Probá ingresar." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      role,
      ...(workerData
        ? {
            workerProfile: {
              create: {
                bio: workerData.bio,
                hourlyRate: workerData.hourlyRate,
                yearsExperience: workerData.yearsExperience,
                zones: JSON.stringify(workerData.zones),
                services: JSON.stringify(workerData.services),
              },
            },
          }
        : {}),
    },
  });

  await createSession({ userId: user.id, role: user.role as Role, name: user.name });
  // Ambos lados deben verificar identidad antes de operar.
  redirect("/verificacion");
}

export async function login(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Completá email y contraseña" };

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Email o contraseña incorrectos" };
  }

  await createSession({ userId: user.id, role: user.role as Role, name: user.name });
  redirect("/panel");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/");
}
