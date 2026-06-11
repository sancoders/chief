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

La base es el **Postgres de [Supabase](https://supabase.com)** (plan gratis),
tanto en desarrollo como en producción:

1. Creá un proyecto en Supabase (región **South America (São Paulo)** es la
   más cercana). Elegí una contraseña de base solo con letras y números.
2. En el dashboard: **Connect → ORMs → Prisma** y copiá las dos connection
   strings a tu `.env` local (plantilla en `.env.example`): la de transacción
   (`:6543`, con `?pgbouncer=true`) en `DATABASE_URL` y la de sesión (`:5432`)
   en `DIRECT_URL`.

```bash
npm install
npm run db:push   # crea las tablas en Supabase
npm run db:seed   # carga datos de demostración
npm run dev       # http://localhost:3000
```

> El plan gratis pausa el proyecto tras ~1 semana sin uso; se despierta con
> un click en el dashboard ("Restore").

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
admin, búsqueda, reserva y aceptación, más los chequeos de PWA (manifest,
service worker y pantalla offline). Requiere el server corrido en :3100
(`npm run build && npm start -- -p 3100`) y deja capturas en `/tmp/shots`.

> El recorrido muta datos (verifica usuarios, crea reservas): antes de
> repetirlo, resembrá desde cero con
> `npx prisma db push --force-reset && npm run db:seed`.
> (Borra TODO en esa base: usalo solo contra tu Supabase de desarrollo.)

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions) + Tailwind 4
- **Prisma 6 + Postgres** (Supabase)
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

La base ya vive en Supabase, así que solo hay que apuntar Vercel a ella:

1. Importar el repo en [vercel.com](https://vercel.com) (Add New Project).
2. Setear las variables de entorno `DATABASE_URL` y `DIRECT_URL` (las mismas
   de tu `.env`) y `AUTH_SECRET` (uno nuevo, largo y aleatorio:
   `openssl rand -hex 32`).
3. Deploy. Las tablas y los datos ya están porque `db:push`/`db:seed` corren
   contra Supabase desde tu máquina.

> Antes de tener usuarios reales conviene separar desarrollo y producción en
> dos proyectos de Supabase (el plan gratis incluye dos) para que los tests
> no toquen datos reales.

> Nota: los documentos subidos van al directorio `uploads/` (gitignoreado).
> En Vercel el filesystem es efímero: para producción hay que moverlos a
> **Supabase Storage** (cambiar `saveImage` en
> `src/app/actions/verification.ts` y la lectura en
> `src/app/api/docs/[file]/route.ts`).

## App instalable y Play Store

Caseras es una **PWA**: con el sitio deployado en HTTPS, Android y desktop
ofrecen "Instalar app" / "Agregar a pantalla de inicio" sin pasar por ninguna
tienda. Lo que ya está en el repo:

- `src/app/manifest.ts` — web app manifest (nombre, colores, íconos maskable)
- `public/sw.js` — service worker: pantalla offline (`public/offline.html`)
  y handlers de push listos para cuando se configuren claves VAPID
- `scripts/icons.mjs` — regenera todos los íconos si cambia la marca
  (`node scripts/icons.mjs`)

### Publicar en Google Play (TWA)

La app de Play Store es un envoltorio del sitio deployado (Trusted Web
Activity): se actualiza sola con cada deploy web, sin nueva revisión.

1. Deployar a producción (ver sección anterior) con dominio propio.
2. `npm i -g @bubblewrap/cli && bubblewrap init --manifest https://TUDOMINIO/manifest.webmanifest`
   y después `bubblewrap build` → genera el `.aab` para subir y el
   `assetlinks.json`, que hay que servir en
   `public/.well-known/assetlinks.json` (saca la barra del navegador).
3. Cuenta de [Play Console](https://play.google.com/console) (USD 25 una vez).
   Ojo: las cuentas personales nuevas necesitan una **prueba cerrada con 12
   testers durante 14 días** antes de poder publicar en producción.
4. Completar política de privacidad, formulario de seguridad de datos y
   clasificación de contenido, y mandar a revisión (días, hasta una semana).

## Roadmap sugerido

- [ ] Pagos con Mercado Pago (cobrar la tarifa de servicio online; mitiga
      la desintermediación junto con seguro/garantía)
- [ ] Notificaciones al recibir o aceptar solicitudes: push (el service
      worker ya trae los handlers; falta VAPID + suscripciones), WhatsApp/email
- [ ] Storage de documentos en Supabase Storage para producción
- [ ] Disponibilidad horaria y calendario de la trabajadora
- [ ] Chat interno (evitar compartir teléfono hasta la aceptación)
- [ ] Búsqueda por geolocalización y más zonas
