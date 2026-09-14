const API_BASE_URL = import.meta["env"]["VITE_API_BASE_URL"] || "http://localhost:4000/api";

async function request(path, options) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Error ${res.status}`);
  }
  return data;
}

export function createOrder({ idempotencyKey, guestInfo, trip, items, currency }) {
  return request("/orders", {
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey },
    body: JSON.stringify({ guestInfo, trip, items, currency }),
  });
}

export function getOrder(orderId) {
  return request(`/orders/${orderId}`);
}

export function getPublicCatalog() {
  return request("/services");
}
