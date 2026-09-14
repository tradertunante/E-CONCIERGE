const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] || "http://localhost:4000/api";
const OPS_KEY_STORAGE = "loscabos-concierge-ops-key";

export function getOpsKey() {
  try {
    return sessionStorage.getItem(OPS_KEY_STORAGE) || "";
  } catch {
    return "";
  }
}

export function setOpsKey(key) {
  try {
    sessionStorage.setItem(OPS_KEY_STORAGE, key);
  } catch {
    // sessionStorage no disponible (modo privado, etc): la sesión de admin
    // simplemente no persiste entre recargas.
  }
}

export function clearOpsKey() {
  try {
    sessionStorage.removeItem(OPS_KEY_STORAGE);
  } catch {
    // ver nota en setOpsKey
  }
}

async function opsRequest(path, options) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      "X-Ops-Api-Key": getOpsKey(),
      ...options?.headers,
    },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.error || `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const opsListProviders = () => opsRequest("/ops/providers");
export const opsCreateProvider = (body) =>
  opsRequest("/ops/providers", { method: "POST", body: JSON.stringify(body) });
export const opsUpdateProvider = (id, body) =>
  opsRequest(`/ops/providers/${id}`, { method: "PATCH", body: JSON.stringify(body) });

export const opsListServices = () => opsRequest("/ops/services");
export const opsCreateService = (body) =>
  opsRequest("/ops/services", { method: "POST", body: JSON.stringify(body) });
export const opsUpdateService = (id, body) =>
  opsRequest(`/ops/services/${id}`, { method: "PATCH", body: JSON.stringify(body) });

export const opsListPendingBookings = () => opsRequest("/ops/bookings/pending-confirmation");
export const opsConfirmBooking = (id) =>
  opsRequest(`/ops/bookings/${id}/confirm`, { method: "POST" });
export const opsRejectBooking = (id, reason) =>
  opsRequest(`/ops/bookings/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) });

export const opsGeneratePayout = (body) =>
  opsRequest("/ops/payouts/generate", { method: "POST", body: JSON.stringify(body) });
export const opsMarkPayoutPaid = (id, paymentReference) =>
  opsRequest(`/ops/payouts/${id}/mark-paid`, {
    method: "POST",
    body: JSON.stringify({ paymentReference }),
  });
