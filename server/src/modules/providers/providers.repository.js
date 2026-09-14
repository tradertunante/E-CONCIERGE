export async function listProviders(client) {
  const { rows } = await client.query(`select * from providers order by name`);
  return rows;
}

export async function findProviderById(client, id) {
  const { rows } = await client.query(`select * from providers where id = $1`, [id]);
  return rows[0] || null;
}

export async function insertProvider(client, provider) {
  const { rows } = await client.query(
    `insert into providers (
       name, contact_name, contact_phone, contact_email, payment_method,
       payout_details, confirmation_type, default_commission_pct, active
     ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     returning *`,
    [
      provider.name,
      provider.contactName || null,
      provider.contactPhone || null,
      provider.contactEmail || null,
      provider.paymentMethod || null,
      provider.payoutDetails || {},
      provider.confirmationType || "manual",
      provider.defaultCommissionPct,
      provider.active ?? true,
    ]
  );
  return rows[0];
}

const UPDATABLE_COLUMNS = {
  name: "name",
  contactName: "contact_name",
  contactPhone: "contact_phone",
  contactEmail: "contact_email",
  paymentMethod: "payment_method",
  payoutDetails: "payout_details",
  confirmationType: "confirmation_type",
  defaultCommissionPct: "default_commission_pct",
  active: "active",
};

export async function updateProvider(client, id, patch) {
  const entries = Object.entries(patch).filter(([key]) => key in UPDATABLE_COLUMNS);
  if (entries.length === 0) return findProviderById(client, id);

  const setClauses = entries.map(([key], i) => `${UPDATABLE_COLUMNS[key]} = $${i + 2}`);
  const values = entries.map(([, value]) => value);
  const { rows } = await client.query(
    `update providers set ${setClauses.join(", ")}, updated_at = now() where id = $1 returning *`,
    [id, ...values]
  );
  return rows[0] || null;
}
