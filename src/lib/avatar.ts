// Avatares GENERADOS a partir de las iniciales de un nombre inventado.
// A propósito no son fotos de personas reales: este repo es público y las
// trabajadoras de demostración no existen. En producción cada persona sube
// su propia foto durante la verificación.
export function generatedAvatar(name: string): string {
  const seed = encodeURIComponent(name.split(",")[0].trim() || "Caseras");
  return (
    `https://api.dicebear.com/9.x/initials/svg?seed=${seed}` +
    `&backgroundColor=047857,0f766e,7c3aed,b45309,be123c`
  );
}
