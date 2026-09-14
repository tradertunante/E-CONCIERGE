# E-Concierge backend

Backend de reservas reales: cobro al cliente, comisión de la agencia y pago por
lotes a proveedores (modelo A: agencia/comisionista, sin split automático).
Pasarela de pago: Stripe Checkout (hospedado).

## Setup

1. Crea un proyecto Postgres (Supabase recomendado para arrancar rápido) y una
   cuenta/proyecto de Stripe en modo test.
2. Copia las variables de entorno necesarias a un archivo local `.env` (no se
   versiona) en esta carpeta:
   - `PG_CONNECTION_STRING` — cadena de conexión a Postgres (`postgresql://...`).
   - `STRIPE_API_KEY` — clave secreta de Stripe (modo test para desarrollo).
   - `STRIPE_WEBHOOK_SIGNING_SECRET` — secreto de firma del webhook (lo da
     `stripe listen` en desarrollo, o el dashboard de Stripe en producción).
   - `FRONTEND_SUCCESS_URL` / `FRONTEND_CANCEL_URL` — a dónde redirige Stripe
     Checkout tras el pago (default: `http://localhost:5173/confirmation` y
     `/checkout`).
   - `OPS_API_KEY` — clave compartida para autenticar los endpoints internos
     `/api/ops/*` (header `X-Ops-Api-Key`). Genera una cadena aleatoria larga;
     no la expongas al frontend público.
   - `PORT` — puerto del servidor (default `4000`).
   - `NODE_ENV` — `development` | `production`.

   Nota: se usan nombres como `PG_CONNECTION_STRING` y `STRIPE_API_KEY` en vez
   de los nombres convencionales de este tipo de variable, por una
   restricción del entorno de desarrollo local; no afecta la funcionalidad.

3. Instala dependencias:
   ```
   npm install
   ```
4. Corre las migraciones:
   ```
   npm run migrate:up
   ```
5. Puebla el catálogo de servicios/proveedores a partir de
   `src/data/services.js` (asigna todo a un proveedor placeholder — ver
   comentarios en el script para el proceso de onboarding real):
   ```
   npm run seed:catalog
   ```
6. En una terminal aparte, reenvía webhooks de Stripe a tu servidor local
   (requiere el CLI de Stripe):
   ```
   stripe listen --forward-to localhost:4000/api/webhooks/stripe
   ```
   Copia el secreto que imprime (`whsec_...`) a `STRIPE_WEBHOOK_SIGNING_SECRET`.
7. Levanta el servidor:
   ```
   npm run dev
   ```
8. Verifica: `GET http://localhost:4000/api/health` debe responder
   `{ "status": "ok", "db": "up" }`.

## Flujo de una orden

1. `POST /api/orders` con header `Idempotency-Key` (o `idempotencyKey` en el
   body) + `guestInfo`, `trip`, `items`, `currency`. Valida cada servicio
   contra la DB (nunca confía en precios del cliente), reserva cupos
   atómicamente para servicios con `shared_inventory`, crea `orders` +
   `bookings` (estado `pendiente_pago`, hold de 15 min) y una Stripe Checkout
   Session. Devuelve `{ orderId, confirmationCode, checkoutUrl }` — el
   frontend debe redirigir a `checkoutUrl`.
2. `POST /api/webhooks/stripe` recibe `checkout.session.completed` /
   `checkout.session.expired`. Idempotente (tabla `webhook_events` +
   `payments.gateway_transaction_id` únicos, todo en una sola transacción por
   evento). Al completarse el pago, cada booking pasa a `pagado` y luego,
   según `providers.confirmation_type`, a `confirmado` (auto_cupos) o
   `pendiente_confirmacion_proveedor` con un `confirmation_deadline` (SLA)
   para auto_api/manual.

## Catálogo (proveedores y servicios)

- `GET /api/services` — público, sin auth. Devuelve el catálogo activo en el
  mismo formato que usaba `src/data/services.js` en el frontend (el frontend
  ahora lo consume vía `CatalogContext`, con fallback al catálogo estático si
  el backend no responde).
- `GET/POST /api/ops/providers`, `PATCH /api/ops/providers/:id` — alta y
  edición de proveedores (contacto, método de pago, `payoutDetails` con CLABE/
  banco, tipo de confirmación, comisión por default).
- `GET/POST /api/ops/services`, `PATCH /api/ops/services/:id` — alta y edición
  del "anuncio" completo de un servicio (nombre, fotos, descripción, precio,
  horarios, comisión especial, si tiene cupo compartido, etc). El `id` es un
  slug (se autogenera del nombre si no se manda uno).
- Hay una pantalla de administración en el propio frontend
  (`src/screens/Admin.jsx`, se llega con el link "Panel de operaciones" en el
  footer o `?screen=admin`) que usa estos tres endpoints — pide la
  `OPS_API_KEY` una sola vez y la guarda en `sessionStorage`.

## Panel de operaciones — bookings y payouts (API, sin UI todavía)

Todos los endpoints `/api/ops/*` requieren el header `X-Ops-Api-Key`.

- `GET /api/ops/bookings/pending-confirmation` — lista bookings esperando
  confirmación del proveedor (con datos del huésped y del servicio), ordenados
  por `confirmation_deadline`.
- `POST /api/ops/bookings/:id/confirm` — el proveedor confirmó: pasa a
  `confirmado`.
- `POST /api/ops/bookings/:id/reject` (`{ "reason": "..." }`) — el proveedor
  no puede cumplir: pasa a `rechazado` y dispara un reembolso parcial en
  Stripe **solo por esa línea** (no afecta el resto de la orden). El cambio de
  estado y la llamada a Stripe son pasos separados con `idempotencyKey`
  (`refund-booking-<id>`), así que reintentar el endpoint tras un fallo de red
  no duplica el reembolso.
- `POST /api/ops/payouts/generate` (`{ "providerId", "periodStart", "periodEnd" }`)
  — junta los bookings `confirmado`/`completado` de ese proveedor en ese rango
  de fechas (excluyendo `payout_basis: 'none'`) en un nuevo `payout`, y los
  marca `incluido_en_payout`. Bloquea las filas (`SELECT ... FOR UPDATE`)
  mientras corre para que dos generaciones concurrentes no tomen los mismos
  bookings. Falla con 409 si ya existe un payout para ese proveedor+periodo.
- `POST /api/ops/payouts/:id/mark-paid` (`{ "paymentReference": "..." }`) —
  se hizo la transferencia por lotes al proveedor: marca el payout `pagado` y
  sus bookings `pagado_a_proveedor`.

## Estructura

- `src/db/migrations/` — schema versionado.
- `src/db/seed/seed-catalog.js` — puebla `providers`/`services` desde el
  catálogo del frontend (solo para desarrollo/demo).
- `src/config/` — env, pool de conexión (`withTransaction`), tipo de cambio.
- `src/lib/` — zona horaria fija America/Mazatlan, cálculo de SLA de
  confirmación del proveedor.
- `src/modules/orders/` — creación de órdenes + reserva atómica de inventario.
- `src/modules/bookings/` — transición de estados post-pago.
- `src/modules/payments/` — cliente de Stripe y webhook.

## Frontend

El frontend (raíz del repo) llama a este backend vía `src/lib/api.js`, que usa
la variable de Vite `VITE_API_BASE_URL` (default `http://localhost:4000/api`).
`Checkout.jsx` ya no simula el pago: crea la orden vía `POST /api/orders` y
redirige a la Checkout Session de Stripe. `Confirmation.jsx` lee `?order=<id>`
de la URL (puesto ahí por `success_url`) y hace polling a
`GET /api/orders/:id` hasta que el webhook marque el pago — solo entonces
limpia el itinerario local. El catálogo (Home/Catalog/Itinerary/etc) ya no
importa `ALL_SERVICES` de `src/data/services.js` directamente — lo hace vía
`CatalogContext`, que llama a `GET /api/services`.

## Próximos pasos (no implementados aún)

- Job que libera holds de inventario vencidos (`hold_expires_at`) para
  órdenes cuya Checkout Session nunca se completó ni expiró explícitamente.
- Job que escala bookings `pendiente_confirmacion_proveedor` cuyo
  `confirmation_deadline` ya pasó (reembolso automático o alerta a
  operaciones).
- Notificación real a proveedores manuales (WhatsApp/email) al entrar a
  `pendiente_confirmacion_proveedor`.
- Job que marca `confirmado` → `completado` cuando ya pasó la fecha del
  servicio (hoy `generatePayout` acepta ambos estados como parche, pero la
  transición explícita no existe todavía).
- UI del panel de operaciones para bookings/payouts (hoy son solo endpoints
  con API key; providers/services ya tienen UI en `Admin.jsx`).
- Autenticación real por usuario/rol para operaciones (hoy es una sola API
  key compartida).
