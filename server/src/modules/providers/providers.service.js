import { pool, withTransaction } from "../../config/db.js";
import { findProviderById, insertProvider, listProviders, updateProvider } from "./providers.repository.js";

class ProviderError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function getProviders() {
  return listProviders(pool);
}

export async function createProvider(input) {
  if (!input.name?.trim()) throw new ProviderError(400, "Falta el nombre del proveedor");
  const commission = Number(input.defaultCommissionPct);
  if (!(commission >= 0 && commission <= 100)) {
    throw new ProviderError(400, "defaultCommissionPct debe estar entre 0 y 100");
  }
  return withTransaction((client) => insertProvider(client, { ...input, defaultCommissionPct: commission }));
}

export async function patchProvider(id, patch) {
  if (patch.defaultCommissionPct != null) {
    const commission = Number(patch.defaultCommissionPct);
    if (!(commission >= 0 && commission <= 100)) {
      throw new ProviderError(400, "defaultCommissionPct debe estar entre 0 y 100");
    }
    patch = { ...patch, defaultCommissionPct: commission };
  }
  return withTransaction(async (client) => {
    const existing = await findProviderById(client, id);
    if (!existing) throw new ProviderError(404, "Proveedor no encontrado");
    return updateProvider(client, id, patch);
  });
}

export { ProviderError };
