# Caseras — Ayuda de confianza para tu hogar

Marketplace que conecta **trabajadoras de casas particulares verificadas** con
familias que buscan ayuda de confianza: limpieza, planchado, cocina y cuidado.
Por hora, día completo o mensual fijo. Pensado para arrancar hiperlocal en
CABA / GBA.

## El modelo

- **Clientes** buscan por zona, servicio y tarifa; mandan una solicitud y ven
  el precio estimado antes de confirmar.
- **Comunidad cerrada y verificada de los dos lados**: nadie (cliente o
  trabajadora) puede ver perfiles, reservar ni trabajar sin antes verificar
  su identidad en `/verificacion`: foto de perfil (pública y obligatoria),
  DNI frente/dorso, selfie con el DNI y dirección declarada (el admin la
  valida contra el DNI). Estados: `SIN_DOCS → EN_REVISION → VERIFICADA/RECHAZADA`.
  El admin aprueba o rechaza (con motivo) desde su panel. El DNI y la selfie
  se guardan fuera de `public/` y se sirven por `/api/docs` solo al admin o
  al dueño; la foto de perfil es pública vía `/api/foto`.
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
| Cliente verificada | `cliente@demo.caseras.ar` |
| Cliente sin verificar (para ver el gate) | `nuevo@demo.caseras.ar` |
| Trabajadora verificada | `maria@demo.caseras.ar` |
| Trabajadora en revisión | `patricia@demo.caseras.ar` |

Flujo completo para probar: ingresá como cliente → buscá en *Palermo* →
reservá a María (guardando tu dirección) → salí e ingresá como María → aceptá
la solicitud → marcala completada → volvé como cliente y dejá la reseña. Como
admin verificás a Patricia (está en revisión) y ves las métricas. Registrate
como trabajadora nueva para probar la subida de DNI.

**Mobile-first**: la interfaz principal es la del celular (tab bar inferior
con la pantalla actual resaltada); en desktop hay header con navegación y
menú de perfil desplegable. Probalo con el inspector en viewport ~390px.

## Tests

`npm run test:e2e` corre un recorrido completo con navegador real (Playwright,
viewport de celular): verificación con subida de documentos, aprobación del
admin, búsqueda, reserva y aceptación. Requiere el server corrido en :3100
(`npm run build && npm start -- -p 3100`) y deja capturas en `/tmp/shots`.

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

> Nota: los documentos subidos van al directorio `uploads/` (gitignoreado).
> En Vercel el filesystem es efímero: para producción hay que moverlos a
> Vercel Blob o S3 (cambiar `saveImage` en `src/app/actions/verification.ts`
> y la lectura en `src/app/api/docs/[file]/route.ts`).

## Roadmap sugerido

- [ ] Pagos con Mercado Pago (cobrar la tarifa de servicio online; mitiga
      la desintermediación junto con seguro/garantía)
- [ ] Notificaciones por WhatsApp/email al recibir o aceptar solicitudes
- [ ] Storage de documentos en Vercel Blob/S3 para producción
- [ ] Disponibilidad horaria y calendario de la trabajadora
- [ ] Chat interno (evitar compartir teléfono hasta la aceptación)
- [ ] Búsqueda por geolocalización y más zonas
