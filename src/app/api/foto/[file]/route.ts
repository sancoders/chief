import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { UPLOADS_DIR } from "@/lib/uploads";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".heic": "image/heic",
};

// Fotos de perfil: públicas. Solo sirve archivos con prefijo "foto-";
// los documentos (DNI/selfie) usan "doc-" y van por /api/docs con auth.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  const name = path.basename(file);
  if (!name.startsWith("foto-")) {
    return new NextResponse("No autorizado", { status: 403 });
  }

  try {
    const data = await readFile(path.join(UPLOADS_DIR, name));
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": CONTENT_TYPES[path.extname(name)] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("No encontrado", { status: 404 });
  }
}
