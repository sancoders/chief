# Caseras — Ayuda de confianza para tu hogar

Marketplace que conecta **trabajadoras de casas particulares verificadas** con
familias que buscan ayuda de confianza: limpieza, planchado, cocina y cuidado.
Por hora, día completo o mensual fijo. Pensado para arrancar hiperlocal en
CABA / GBA.

## El modelo

- **Clientes** buscan por zona, servicio y tarifa; mandan una solicitud y ven
  el precio estimado antes de confirmar.
- **Trabajadoras** crean su perfil gratis (tarifa, zonas, servicios) y reciben
  solicitudes. Solo aparecen en búsquedas después de la **verificación**
  (entrevista + DNI + referencias, hecha manualmente por el admin).
- **Confianza** como producto: badge de verificada, reseñas que solo pueden
  dejar clientes con una reserva completada, y teléfono visible recién cuando
  la trabajadora acepta.
- **Monetización**: tarifa de servicio del 15% (configurable en
  `src/lib/constants.ts`). En el MVP se muestra en el estimado; se cobra
  efectivamente cuando se integren pagos online (Mercado Pago).

## Correr el proyecto

```bash
npm install
npm run db:push   # crea la base SQLite (prisma/dev.db)
npm run db:seed   # carga datos de demostración
npm run dev       # http://localhost:3000
```

### Cuentas de demo (contraseña: `demo1234`)

| Rol | Email |
| --- | --- |
| Admin | `admin@caseras.ar` |
| Cliente | `cliente@demo.caseras.ar` |
| Trabajadora verificada | `maria@demo.caseras.ar` |
| Trabajadora sin verificar | `patricia@demo.caseras.ar` |

Flujo completo para probar: ingresá como cliente → buscá en *Palermo* →
reservá a María → salí e ingresá como María → aceptá la solicitud → marcala
completada → volvé como cliente y dejá la reseña. Como admin podés verificar a
Patricia y ver las métricas.

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions) + Tailwind 4
- **Prisma 6 + SQLite** en desarrollo
- Sesiones JWT en cookie httpOnly (`jose`) + `bcryptjs`
- Validación con `zod`

## Estructura

```
prisma/schema.prisma     Modelos: User, WorkerProfile, Booking, Review
prisma/seed.ts           Datos de demo
src/lib/constants.ts     Branding, zonas, servicios, comisión, helpers de precio
src/lib/auth.ts          Sesiones (JWT cookie) y guards por rol
src/lib/workers.ts       Queries de listado/detalle con rating agregado
src/app/actions/         Server actions: auth, reservas, reseñas, perfil, admin
src/app/                 Páginas: landing, búsqueda, detalle, reserva, panel
```

## Deploy a producción (Vercel)

SQLite no persiste en serverless. Antes de deployar:

1. Crear un Postgres (Neon desde el marketplace de Vercel es lo más simple).
2. En `prisma/schema.prisma` cambiar `provider = "sqlite"` por
   `provider = "postgresql"`.
3. Setear en Vercel las variables `DATABASE_URL` (la de Neon) y `AUTH_SECRET`
   (un secreto largo y aleatorio: `openssl rand -hex 32`).
4. `npx prisma db push` contra esa base y correr el seed si querés demo data.

## Roadmap sugerido

- [ ] Pagos con Mercado Pago (cobrar la tarifa de servicio online; mitiga
      la desintermediación junto con seguro/garantía)
- [ ] Notificaciones por WhatsApp/email al recibir o aceptar solicitudes
- [ ] Fotos de perfil y carga de DNI para la verificación
- [ ] Disponibilidad horaria y calendario de la trabajadora
- [ ] Chat interno (evitar compartir teléfono hasta la aceptación)
- [ ] Búsqueda por geolocalización y más zonas
