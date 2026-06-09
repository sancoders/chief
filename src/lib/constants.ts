// Branding centralizado: cambiar acá renombra toda la app.
export const APP_NAME = "Caseras";
export const APP_TAGLINE = "Ayuda de confianza para tu hogar";

// Comisión de la plataforma sobre el subtotal del trabajo.
export const SERVICE_FEE_RATE = 0.15;

export const ROLES = ["CLIENT", "WORKER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const BOOKING_TYPES = {
  HORA: "Por hora",
  DIA: "Día completo",
  MENSUAL: "Mensual fijo",
} as const;
export type BookingType = keyof typeof BOOKING_TYPES;

export const VERIFICATION_STATUSES = {
  SIN_DOCS: "Falta documentación",
  EN_REVISION: "En revisión",
  VERIFICADA: "Verificada",
  RECHAZADA: "Rechazada",
} as const;
export type VerificationStatus = keyof typeof VERIFICATION_STATUSES;

export const BOOKING_STATUSES = {
  PENDIENTE: "Pendiente",
  ACEPTADA: "Aceptada",
  RECHAZADA: "Rechazada",
  CANCELADA: "Cancelada",
  COMPLETADA: "Completada",
} as const;
export type BookingStatus = keyof typeof BOOKING_STATUSES;

export const SERVICES = {
  limpieza: "Limpieza general",
  profunda: "Limpieza profunda",
  planchado: "Planchado",
  cocina: "Cocina",
  ninos: "Cuidado de niños",
  mayores: "Cuidado de adultos mayores",
} as const;
export type ServiceKey = keyof typeof SERVICES;

// Zonas iniciales: CABA + primer cordón de GBA. Hiperlocal a propósito.
export const ZONES = [
  "Palermo",
  "Belgrano",
  "Recoleta",
  "Caballito",
  "Villa Urquiza",
  "Núñez",
  "Almagro",
  "Villa Crespo",
  "Colegiales",
  "Flores",
  "San Telmo",
  "Puerto Madero",
  "Vicente López",
  "Olivos",
  "San Isidro",
  "Martínez",
  "Ramos Mejía",
  "Quilmes",
  "Lomas de Zamora",
  "Morón",
] as const;

// Un día completo se estima en 8 horas de trabajo.
export const DAY_HOURS = 8;
// Un mensual fijo se estima en 4 visitas de día completo.
export const MONTHLY_VISITS = 4;

export function formatARS(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function estimateSubtotal(
  type: BookingType,
  hourlyRate: number,
  hours: number,
): number {
  if (type === "HORA") return hourlyRate * hours;
  if (type === "DIA") return hourlyRate * DAY_HOURS;
  return hourlyRate * DAY_HOURS * MONTHLY_VISITS;
}

export function calcFee(subtotal: number): number {
  return Math.round(subtotal * SERVICE_FEE_RATE);
}
