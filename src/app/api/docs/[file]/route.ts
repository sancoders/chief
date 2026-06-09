import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { UPLOADS_DIR } from "@/lib/uploads";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".heic": "image/heic",
};

// Sirve documentos de verificación SOLO al admin o a la dueña del documento.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const session = await getSession();
  if (!session) return new NextResponse("No autorizado", { status: 401 });

  const { file } = await params;
  // path.basename bloquea cualquier intento de path traversal.
  const name = path.basename(file);

  if (session.role !== "ADMIN") {
    const profile = await db.workerProfile.findUnique({
      where: { userId: session.userId },
      select: { docFront: true, docBack: true, selfie: true },
    });
    const ownFiles = [profile?.docFront, profile?.docBack, profile?.selfie];
    if (!ownFiles.includes(name)) {
      return new NextResponse("No autorizado", { status: 403 });
    }
  }

  try {
    const data = await readFile(path.join(UPLOADS_DIR, name));
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": CONTENT_TYPES[path.extname(name)] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch {
    return new NextResponse("No encontrado", { status: 404 });
  }
}
