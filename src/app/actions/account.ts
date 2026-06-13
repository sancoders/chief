"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession, destroySession } from "@/lib/auth";
import { deleteUpload } from "@/lib/uploads";

// Borrado de cuenta (derecho de supresión, Ley 25.326). Elimina al usuario
// y, en cascada (ver schema), sus reservas, reseñas, direcciones y perfil.
export async function deleteAccount(): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/ingresar");
  // El admin no puede autoborrarse (no quedarse sin quien verifique).
  if (session.role === "ADMIN") redirect("/panel");

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { photo: true, docFront: true, docBack: true, selfie: true },
  });

  await db.user.delete({ where: { id: session.userId } });

  // Borra los archivos subidos (las fotos de demo son URLs externas: se saltan).
  for (const f of [user?.photo, user?.docFront, user?.docBack, user?.selfie]) {
    if (f && !f.startsWith("http")) await deleteUpload(f).catch(() => {});
  }

  await destroySession();
  redirect("/");
}
