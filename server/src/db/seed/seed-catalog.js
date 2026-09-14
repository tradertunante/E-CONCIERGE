// Seed de arranque: importa el catálogo estático del frontend
// (src/data/services.js) y crea filas equivalentes en `providers`/`services`
// para poder probar el flujo de pago de punta a punta.
//
// IMPORTANTE: esto NO son proveedores reales. Todo el catálogo se asigna a un
// único "Proveedor genérico (placeholder)" con comisión y costo estimados.
// Cuando se hagan acuerdos reales con cada proveedor, hay que:
//   1. Crear su fila real en `providers` (contacto, método de pago, comisión).
//   2. Hacer UPDATE de `services.provider_id`, `services.cost_provider`,
//      `services.commission_override_pct`, `services.shared_inventory*`
//      según lo negociado.
// Este script es idempotente: puede correrse varias veces sin duplicar filas.

import { pool } from "../../config/db.js";
import { ALL_SERVICES } from "../../../../src/data/services.js";

const PLACEHOLDER_PROVIDER_NAME = "Proveedor genérico (placeholder)";
const PLACEHOLDER_COMMISSION_PCT = 20;
const PLACEHOLDER_MARGIN = 0.25; // costo_proveedor = price_client * (1 - margen)

async function upsertPlaceholderProvider(client) {
  const existing = await client.query(`select id from providers where name = $1`, [
    PLACEHOLDER_PROVIDER_NAME,
  ]);
  if (existing.rows[0]) return existing.rows[0].id;

  const { rows } = await client.query(
    `insert into providers (name, confirmation_type, default_commission_pct)
     values ($1, 'manual', $2)
     returning id`,
    [PLACEHOLDER_PROVIDER_NAME, PLACEHOLDER_COMMISSION_PCT]
  );
  return rows[0].id;
}

async function upsertService(client, providerId, service) {
  const costProvider = Math.round(service.price * (1 - PLACEHOLDER_MARGIN) * 100) / 100;
  await client.query(
    `insert into services (
       id, provider_id, category, subcategory, name, location, tagline, description,
       long_description, price_client, price_unit, is_deposit, duration, times,
       recommended, image_url, capacity,
       cost_provider, payout_basis, cancellation_loss_policy, shared_inventory
     ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,false)
     on conflict (id) do update set
       category = excluded.category,
       subcategory = excluded.subcategory,
       name = excluded.name,
       location = excluded.location,
       tagline = excluded.tagline,
       description = excluded.description,
       long_description = excluded.long_description,
       price_client = excluded.price_client,
       price_unit = excluded.price_unit,
       is_deposit = excluded.is_deposit,
       duration = excluded.duration,
       times = excluded.times,
       recommended = excluded.recommended,
       image_url = excluded.image_url,
       capacity = excluded.capacity,
       updated_at = now()`,
    [
      service.id,
      providerId,
      service.category,
      service.subcategory || null,
      service.name,
      service.location || null,
      service.tagline || null,
      service.description || null,
      service.longDescription || null,
      service.price,
      service.priceUnit,
      Boolean(service.isDeposit),
      service.duration || null,
      service.times || [],
      Boolean(service.recommended),
      service.image || null,
      service.capacity || null,
      costProvider,
      service.isDeposit ? "deposit_passthrough" : "full_provider_cost",
      "provider",
    ]
  );
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const providerId = await upsertPlaceholderProvider(client);
    for (const service of ALL_SERVICES) {
      await upsertService(client, providerId, service);
    }
    await client.query("COMMIT");
    console.log(`Seed OK: ${ALL_SERVICES.length} servicios asignados a "${PLACEHOLDER_PROVIDER_NAME}".`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
