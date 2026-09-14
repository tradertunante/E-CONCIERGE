import { pool, withTransaction } from "../../config/db.js";
import { findProviderById } from "../providers/providers.repository.js";
import {
  findServiceForOps,
  insertService,
  listPublicServices,
  listServicesForOps,
  updateService,
} from "./services.repository.js";

const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const VALID_CATEGORIES = ["restaurantes", "actividades", "transporte"];

class ServiceError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function getPublicCatalog() {
  return listPublicServices(pool);
}

export async function getServicesForOps() {
  return listServicesForOps(pool);
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createService(input) {
  if (!input.name?.trim()) throw new ServiceError(400, "Falta el nombre del servicio");
  if (!VALID_CATEGORIES.includes(input.category)) {
    throw new ServiceError(400, `category debe ser una de: ${VALID_CATEGORIES.join(", ")}`);
  }
  if (!input.providerId) throw new ServiceError(400, "Falta providerId");
  if (!(Number(input.priceClient) > 0)) throw new ServiceError(400, "priceClient debe ser mayor a 0");
  if (!(Number(input.costProvider) >= 0)) throw new ServiceError(400, "costProvider debe ser mayor o igual a 0");
  if (input.sharedInventory && !(Number(input.sharedInventoryCapacity) > 0)) {
    throw new ServiceError(400, "sharedInventoryCapacity es obligatorio y > 0 cuando sharedInventory es true");
  }

  const id = input.id?.trim() || slugify(input.name);
  if (!ID_RE.test(id)) {
    throw new ServiceError(400, "id inválido: usa minúsculas, números y guiones (ej. utv-rental-1)");
  }

  return withTransaction(async (client) => {
    const provider = await findProviderById(client, input.providerId);
    if (!provider) throw new ServiceError(404, "Proveedor no encontrado");

    try {
      return await insertService(client, { ...input, id });
    } catch (err) {
      if (err.code === "23505") throw new ServiceError(409, `Ya existe un servicio con id "${id}"`);
      throw err;
    }
  });
}

export async function patchService(id, patch) {
  return withTransaction(async (client) => {
    const existing = await findServiceForOps(client, id);
    if (!existing) throw new ServiceError(404, "Servicio no encontrado");

    if (patch.providerId) {
      const provider = await findProviderById(client, patch.providerId);
      if (!provider) throw new ServiceError(404, "Proveedor no encontrado");
    }
    const sharedInventory = patch.sharedInventory ?? existing.shared_inventory;
    const sharedCapacity = patch.sharedInventoryCapacity ?? existing.shared_inventory_capacity;
    if (sharedInventory && !(Number(sharedCapacity) > 0)) {
      throw new ServiceError(400, "sharedInventoryCapacity es obligatorio y > 0 cuando sharedInventory es true");
    }

    return updateService(client, id, patch);
  });
}

export { ServiceError };
