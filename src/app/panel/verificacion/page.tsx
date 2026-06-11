import { redirect } from "next/navigation";

// La verificación ahora es para ambos roles y vive en /verificacion.
export default function LegacyVerificationRedirect() {
  redirect("/verificacion");
}
