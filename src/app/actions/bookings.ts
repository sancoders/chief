"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import {
  ZONES,
  calcFee,
  estimateSubtotal,
  type BookingStatus,
  type BookingType,
} from "@/lib/constants";
import type { FormState } from "./auth";

const bookingSchema = z.object({
  workerId: z.string().min(1),
  type: z.enum(["HORA", "DIA", "MENSUAL"]),
  date: z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Elegí una fecha válida"),
  hours: z.coerce.number().int().min(2, "Mínimo 2 horas").max(12, "Máximo 12 horas"),
  zone: z.enum(ZONES),
  address: z.string().trim().min(5, "Ingresá la dirección"),
  notes: z.string().trim().max(500).default(""),
});

export async function createBooking(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  if (session.role !== "CLIENT") {
    return { error: "Solo los clientes pueden hacer reservas" };
  }

  const parsed = bookingSchema.safeParse({
    workerId: formData.get("workerId"),
    type: formData.get("type"),
    date: formData.get("date"),
    hours: formData.get("hours") || 4,
    zone: formData.get("zone"),
    address: formData.get("address"),
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const data = parsed.data;

  const worker = await db.workerProfile.findUnique({ where: { id: data.workerId } });
  if (!worker) return { error: "La trabajadora no existe" };

  const workerZones: string[] = JSON.parse(worker.zones);
  if (!workerZones.includes(data.zone)) {
    return { error: "La trabajadora no atiende esa zona" };
  }

  const date = new Date(data.date);
  if (date < new Date()) return { error: "La fecha tiene que ser futura" };

  const subtotal = estimateSubtotal(data.type as BookingType, worker.hourlyRate, data.hours);
  const booking = await db.booking.create({
    data: {
      clientId: session.userId,
      workerId: worker.id,
      type: data.type,
      date,
      hours: data.type === "HORA" ? data.hours : 8,
      zone: data.zone,
      address: data.address,
      notes: data.notes,
      subtotal,
      fee: calcFee(subtotal),
    },
  });

  redirect(`/panel?reserva=${booking.id}`);
}

const TRANSITIONS: Record<string, { from: BookingStatus[]; by: "WORKER" | "CLIENT" }> = {
  ACEPTADA: { from: ["PENDIENTE"], by: "WORKER" },
  RECHAZADA: { from: ["PENDIENTE"], by: "WORKER" },
  COMPLETADA: { from: ["ACEPTADA"], by: "WORKER" },
  CANCELADA: { from: ["PENDIENTE", "ACEPTADA"], by: "CLIENT" },
};

export async function updateBookingStatus(formData: FormData): Promise<void> {
  const session = await requireSession();
  const bookingId = String(formData.get("bookingId") ?? "");
  const status = String(formData.get("status") ?? "");

  const transition = TRANSITIONS[status];
  if (!transition) return;

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { worker: true },
  });
  if (!booking) return;
  if (!transition.from.includes(booking.status as BookingStatus)) return;

  const isOwner =
    transition.by === "WORKER"
      ? booking.worker.userId === session.userId
      : booking.clientId === session.userId;
  if (!isOwner) return;

  await db.booking.update({ where: { id: bookingId }, data: { status } });
  revalidatePath("/panel");
}
