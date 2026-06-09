"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import type { FormState } from "./auth";

const reviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.coerce.number().int().min(1, "Elegí una calificación").max(5),
  comment: z.string().trim().min(5, "Contanos cómo fue el servicio").max(500),
});

export async function createReview(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();

  const parsed = reviewSchema.safeParse({
    bookingId: formData.get("bookingId"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { bookingId, rating, comment } = parsed.data;

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { review: true },
  });
  if (!booking || booking.clientId !== session.userId) {
    return { error: "Reserva inválida" };
  }
  if (booking.status !== "COMPLETADA") {
    return { error: "Solo se puede calificar un trabajo completado" };
  }
  if (booking.review) {
    return { error: "Esta reserva ya tiene una reseña" };
  }

  await db.review.create({ data: { bookingId, rating, comment } });
  revalidatePath("/panel");
  return {};
}
