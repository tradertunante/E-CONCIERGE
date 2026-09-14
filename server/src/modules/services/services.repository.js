// Forma que espera el frontend (src/data/services.js) para cada servicio del
// catálogo público — se mantiene el mismo "shape" para no tocar los
// componentes de UI que ya consumen ALL_SERVICES.
function toPublicShape(row) {
  return {
    id: row.id,
    category: row.category,
    subcategory: row.subcategory || undefined,
    name: row.name,
    location: row.location || "",
    tagline: row.tagline || "",
    description: row.description || "",
    longDescription: row.long_description || "",
    price: Number(row.price_client),
    priceUnit: row.price_unit,
    isDeposit: row.is_deposit,
    duration: row.duration || "",
    times: row.times || [],
    recommended: row.recommended,
    image: row.image_url || undefined,
    capacity: row.capacity || undefined,
  };
}

export async function listPublicServices(client) {
  const { rows } = await client.query(
    `select * from services where active order by category, name`
  );
  return rows.map(toPublicShape);
}

export async function listServicesForOps(client) {
  const { rows } = await client.query(
    `select s.*, p.name as provider_name
     from services s join providers p on p.id = s.provider_id
     order by s.category, s.name`
  );
  return rows;
}

export async function findServiceForOps(client, id) {
  const { rows } = await client.query(
    `select s.*, p.name as provider_name
     from services s join providers p on p.id = s.provider_id
     where s.id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function insertService(client, service) {
  const { rows } = await client.query(
    `insert into services (
       id, provider_id, category, subcategory, name, location, tagline, description,
       long_description, price_client, price_unit, is_deposit, cost_provider,
       commission_override_pct, payout_basis, cancellation_loss_policy,
       shared_inventory, shared_inventory_capacity, duration, times, recommended,
       image_url, capacity, active
     ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
     returning *`,
    [
      service.id,
      service.providerId,
      service.category,
      service.subcategory || null,
      service.name,
      service.location || null,
      service.tagline || null,
      service.description || null,
      service.longDescription || null,
      service.priceClient,
      service.priceUnit,
      Boolean(service.isDeposit),
      service.costProvider,
      service.commissionOverridePct ?? null,
      service.payoutBasis || (service.isDeposit ? "deposit_passthrough" : "full_provider_cost"),
      service.cancellationLossPolicy || "provider",
      Boolean(service.sharedInventory),
      service.sharedInventoryCapacity ?? null,
      service.duration || null,
      service.times || [],
      Boolean(service.recommended),
      service.imageUrl || null,
      service.capacity || null,
      service.active ?? true,
    ]
  );
  return rows[0];
}

const UPDATABLE_COLUMNS = {
  providerId: "provider_id",
  category: "category",
  subcategory: "subcategory",
  name: "name",
  location: "location",
  tagline: "tagline",
  description: "description",
  longDescription: "long_description",
  priceClient: "price_client",
  priceUnit: "price_unit",
  isDeposit: "is_deposit",
  costProvider: "cost_provider",
  commissionOverridePct: "commission_override_pct",
  payoutBasis: "payout_basis",
  cancellationLossPolicy: "cancellation_loss_policy",
  sharedInventory: "shared_inventory",
  sharedInventoryCapacity: "shared_inventory_capacity",
  duration: "duration",
  times: "times",
  recommended: "recommended",
  imageUrl: "image_url",
  capacity: "capacity",
  active: "active",
};

export async function updateService(client, id, patch) {
  const entries = Object.entries(patch).filter(([key]) => key in UPDATABLE_COLUMNS);
  if (entries.length === 0) return findServiceForOps(client, id);

  const setClauses = entries.map(([key], i) => `${UPDATABLE_COLUMNS[key]} = $${i + 2}`);
  const values = entries.map(([, value]) => value);
  const { rows } = await client.query(
    `update services set ${setClauses.join(", ")}, updated_at = now() where id = $1 returning *`,
    [id, ...values]
  );
  return rows[0] || null;
}

export { toPublicShape };
