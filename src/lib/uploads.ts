import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";

// Almacenamiento de fotos subidas (perfil, DNI, selfies).
// Con SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY usa Supabase Storage
// (bucket privado "uploads"; necesario en Vercel, donde el disco es de
// solo lectura). Sin esas variables cae a un directorio local: ideal
// para desarrollo y para el e2e.
// El acceso SIEMPRE pasa por /api/foto y /api/docs (ahí vive el control
// de permisos); por eso el bucket es privado y acá se usa la service key.

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

const BUCKET = "uploads";
const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function saveUpload(
  name: string,
  data: Buffer,
  contentType: string,
): Promise<void> {
  if (supabaseUrl && serviceKey) {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${name}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${serviceKey}`,
        "content-type": contentType,
      },
      body: new Uint8Array(data),
    });
    if (!res.ok) {
      throw new Error(`Supabase Storage ${res.status}: ${await res.text()}`);
    }
    return;
  }
  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(path.join(UPLOADS_DIR, name), data);
}

export async function readUpload(name: string): Promise<Buffer | null> {
  if (supabaseUrl && serviceKey) {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${name}`, {
      headers: { authorization: `Bearer ${serviceKey}` },
    });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  }
  try {
    return await readFile(path.join(UPLOADS_DIR, name));
  } catch {
    return null;
  }
}
