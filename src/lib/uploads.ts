import path from "node:path";

// Documentos de verificación (DNI, selfies). Fuera de public/ a propósito:
// se sirven solo vía /api/docs con control de acceso.
export const UPLOADS_DIR = path.join(process.cwd(), "uploads");
