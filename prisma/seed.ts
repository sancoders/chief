// Datos de demostración: admin, clientes y trabajadoras verificadas con
// fotos, reservas completadas y reseñas. Correr con `npm run db:seed`.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const PASSWORD = "demo1234";

// Avatares GENERADOS a partir de las iniciales del nombre inventado.
// A propósito no son fotos de personas reales: este repo es público y las
// trabajadoras del seed no existen. En producción cada persona sube su propia
// foto durante la verificación.
const portrait = (name: string) =>
  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}` +
  `&backgroundColor=047857,0f766e,7c3aed,b45309,be123c`;

const WORKERS = [
  {
    name: "María Gómez",
    email: "maria@demo.caseras.ar",
    phone: "+54 9 11 5555-0101",
    photo: portrait("María Gómez"),
    bio: "Hace 12 años trabajo en casas de Palermo y Belgrano. Soy muy detallista con la limpieza profunda y me encanta dejar la cocina impecable. Tengo referencias comprobables.",
    zones: ["Palermo", "Belgrano", "Colegiales"],
    services: ["limpieza", "profunda", "planchado"],
    hourlyRate: 6500,
    yearsExperience: 12,
    verified: true,
    address: "Gorriti 4520",
    addressZone: "Palermo",
    reviews: [
      { rating: 5, comment: "Impecable todo. Súper puntual y de confianza, ya la contraté de nuevo." },
      { rating: 5, comment: "María es una genia, dejó el departamento perfecto y es muy amorosa." },
      { rating: 4, comment: "Muy buen trabajo de planchado. Volvería a contratarla." },
    ],
  },
  {
    name: "Rosa Benítez",
    email: "rosa@demo.caseras.ar",
    phone: "+54 9 11 5555-0102",
    photo: portrait("Rosa Benítez"),
    bio: "Trabajo por hora o mensual en zona norte. Cocino casero (¡mis tartas son famosas!) y tengo mucha experiencia cuidando adultos mayores con paciencia y cariño.",
    zones: ["Vicente López", "Olivos", "Núñez", "Belgrano"],
    services: ["limpieza", "cocina", "mayores"],
    hourlyRate: 7000,
    yearsExperience: 18,
    verified: true,
    address: "Av. Maipú 2300",
    addressZone: "Olivos",
    reviews: [
      { rating: 5, comment: "Rosa cuida a mi mamá hace meses por la plataforma. Totalmente confiable." },
      { rating: 5, comment: "Cocina riquísimo y es súper prolija. La recomiendo con los ojos cerrados." },
    ],
  },
  {
    name: "Norma Acosta",
    email: "norma@demo.caseras.ar",
    phone: "+54 9 11 5555-0103",
    photo: portrait("Norma Acosta"),
    bio: "Vivo en Caballito y trabajo en barrios cercanos. Rápida, ordenada y de palabra: si digo un horario, lo cumplo. Hago limpieza general y profunda de mudanzas.",
    zones: ["Caballito", "Almagro", "Villa Crespo", "Flores"],
    services: ["limpieza", "profunda"],
    hourlyRate: 5500,
    yearsExperience: 8,
    verified: true,
    address: "Av. Rivadavia 5120",
    addressZone: "Caballito",
    reviews: [
      { rating: 5, comment: "Hizo la limpieza post mudanza y quedó todo nuevo. Excelente precio." },
      { rating: 4, comment: "Muy cumplidora. El departamento quedó muy bien." },
    ],
  },
  {
    name: "Claudia Romero",
    email: "claudia@demo.caseras.ar",
    phone: "+54 9 11 5555-0104",
    photo: portrait("Claudia Romero"),
    bio: "Niñera y ayuda doméstica con 10 años de experiencia y curso de primeros auxilios. Los chicos me adoran y las casas quedan en orden. Disponible por día o mensual.",
    zones: ["Recoleta", "Palermo", "Almagro"],
    services: ["ninos", "limpieza", "cocina"],
    hourlyRate: 7500,
    yearsExperience: 10,
    verified: true,
    address: "Juncal 2810",
    addressZone: "Recoleta",
    reviews: [
      { rating: 5, comment: "Claudia cuida a mis dos hijos y es espectacular. Responsable y cariñosa." },
    ],
  },
  {
    name: "Susana Ledesma",
    email: "susana@demo.caseras.ar",
    phone: "+54 9 11 5555-0105",
    photo: portrait("Susana Ledesma"),
    bio: "Trabajo en zona oeste y sur. Especialista en planchado (camisas perfectas) y limpieza semanal de mantenimiento. Busco casas fijas por mes.",
    zones: ["Ramos Mejía", "Morón", "Lomas de Zamora", "Quilmes"],
    services: ["planchado", "limpieza"],
    hourlyRate: 5000,
    yearsExperience: 15,
    verified: true,
    address: "Espora 940",
    addressZone: "Ramos Mejía",
    reviews: [],
  },
  {
    name: "Patricia Vega",
    email: "patricia@demo.caseras.ar",
    phone: "+54 9 11 5555-0106",
    photo: portrait("Patricia Vega"),
    bio: "Recién me sumo a la plataforma. Tengo 5 años de experiencia en limpieza y cocina en San Isidro y Martínez, con referencias de las familias con las que trabajé.",
    zones: ["San Isidro", "Martínez", "Olivos"],
    services: ["limpieza", "cocina"],
    hourlyRate: 6000,
    yearsExperience: 5,
    verified: false, // queda EN_REVISION en la cola del admin
    address: "Alsina 1230",
    addressZone: "San Isidro",
    reviews: [],
  },
];

async function main() {
  // Este seed crea cuentas con una contraseña publicada en el repo, incluido un
  // ADMIN. Corriéndolo contra una base real quedaría un administrador abierto.
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_PROD_SEED) {
    throw new Error(
      "Seed bloqueado: NODE_ENV=production. Son cuentas demo con contraseña pública. " +
        "Si de verdad querés correrlo, setea ALLOW_PROD_SEED=1.",
    );
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  await db.user.upsert({
    where: { email: "admin@caseras.ar" },
    update: {},
    create: {
      email: "admin@caseras.ar",
      passwordHash,
      name: "Admin Caseras",
      phone: "+54 9 11 5555-0000",
      role: "ADMIN",
      verificationStatus: "VERIFICADA",
      verifiedAt: new Date(),
    },
  });

  // Cliente demo: verificada (puede ver perfiles y reservar).
  const client = await db.user.upsert({
    where: { email: "cliente@demo.caseras.ar" },
    update: {},
    create: {
      email: "cliente@demo.caseras.ar",
      passwordHash,
      name: "Julieta Pérez",
      phone: "+54 9 11 5555-0201",
      role: "CLIENT",
      photo: portrait("Julieta Pérez"),
      verificationStatus: "VERIFICADA",
      dniNumber: "33222111",
      addressStreet: "Av. Santa Fe 3200, 4º B",
      addressZone: "Palermo",
      verifiedAt: new Date(),
    },
  });

  // Cliente demo SIN verificar: para ver la experiencia del gate.
  await db.user.upsert({
    where: { email: "nuevo@demo.caseras.ar" },
    update: {},
    create: {
      email: "nuevo@demo.caseras.ar",
      passwordHash,
      name: "Martín López",
      phone: "+54 9 11 5555-0202",
      role: "CLIENT",
      verificationStatus: "SIN_DOCS",
    },
  });

  for (const data of WORKERS) {
    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) continue;

    const user = await db.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        phone: data.phone,
        role: "WORKER",
        photo: data.photo,
        verificationStatus: data.verified ? "VERIFICADA" : "EN_REVISION",
        dniNumber: data.verified ? "28456789" : "30123456",
        addressStreet: data.address,
        addressZone: data.addressZone,
        verifiedAt: data.verified ? new Date() : null,
        workerProfile: {
          create: {
            bio: data.bio,
            zones: JSON.stringify(data.zones),
            services: JSON.stringify(data.services),
            hourlyRate: data.hourlyRate,
            yearsExperience: data.yearsExperience,
          },
        },
      },
      include: { workerProfile: true },
    });

    // Reservas completadas (pasadas) que respaldan cada reseña.
    for (const [index, review] of data.reviews.entries()) {
      const subtotal = data.hourlyRate * 4;
      const date = new Date();
      date.setDate(date.getDate() - (index + 1) * 14);
      await db.booking.create({
        data: {
          clientId: client.id,
          workerId: user.workerProfile!.id,
          type: "HORA",
          date,
          hours: 4,
          zone: data.zones[0],
          address: "Av. Demo 1234, 5º A",
          subtotal,
          fee: Math.round(subtotal * 0.15),
          status: "COMPLETADA",
          review: { create: review },
        },
      });
    }
  }

  console.log("Seed listo ✔");
  console.log(`Contraseña de todas las cuentas demo: ${PASSWORD}`);
  console.log("  Admin:               admin@caseras.ar");
  console.log("  Cliente verificada:  cliente@demo.caseras.ar");
  console.log("  Cliente sin verificar: nuevo@demo.caseras.ar");
  console.log("  Trabajadora:         maria@demo.caseras.ar (y otras @demo.caseras.ar)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
