import { Lock, ShieldCheck, Tag } from "lucide-react";
import { useMemo, useState } from "react";
import ServiceImage from "../components/ServiceImage";
import { useApp } from "../context/AppContext";
import { useCatalog } from "../context/CatalogContext";
import { createOrder } from "../lib/api";

function formatDayLabel(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });
}

const VALID_PROMO = { CONCIERGE10: 0.1, CABOS2026: 0.05 };

export default function Checkout() {
  const { items, tripDays, trip, currency, formatPrice, guestInfo, setGuestInfo, setScreen } =
    useApp();
  const { services: ALL_SERVICES } = useCatalog();
  const [promoApplied, setPromoApplied] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Se regenera solo si cambia el conjunto de items del itinerario, para que
  // un doble clic en "Pagar" reutilice la misma orden en vez de duplicarla.
  const idempotencyKey = useMemo(
    () => crypto.randomUUID(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items.map((it) => it.itemId).join(",")]
  );

  const lineItems = items.map((it) => {
    const service = ALL_SERVICES.find((s) => s.id === it.serviceId);
    const lineTotal =
      service && service.priceUnit === "persona" ? service.price * it.people : service?.price || 0;
    return { ...it, service, lineTotal };
  });

  const subtotal = lineItems.reduce((sum, li) => sum + li.lineTotal, 0);
  const discount = promoApplied ? subtotal * promoApplied.rate : 0;
  const total = subtotal - discount;

  const formValid =
    guestInfo.name.trim() && guestInfo.email.trim().includes("@") && guestInfo.phone.trim();

  function applyPromo() {
    const code = guestInfo.promoCode.trim().toUpperCase();
    if (VALID_PROMO[code]) {
      setPromoApplied({ code, rate: VALID_PROMO[code] });
    } else {
      setPromoApplied({ code, rate: 0, invalid: true });
    }
  }

  async function handlePay() {
    setError(null);
    setProcessing(true);
    try {
      const { checkoutUrl } = await createOrder({
        idempotencyKey,
        guestInfo,
        trip,
        currency,
        items: items.map(({ serviceId, day, time, people }) => ({ serviceId, day, time, people })),
      });
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err.message || "No se pudo iniciar el pago. Intenta de nuevo.");
      setProcessing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-ocean-800/70">Tu itinerario está vacío.</p>
        <button
          onClick={() => setScreen("catalog")}
          className="mt-4 rounded-full bg-ocean-700 px-6 py-2.5 text-sm font-semibold text-white"
        >
          Ir al catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-sand-600">Checkout</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ocean-900">
        Confirma tu itinerario
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="flex flex-col gap-8">
          {/* Guest form */}
          <div className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-ocean-900">
              Datos del huésped
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-ocean-800">Nombre completo</span>
                <input
                  value={guestInfo.name}
                  onChange={(e) => setGuestInfo((g) => ({ ...g, name: e.target.value }))}
                  placeholder="Andrés García"
                  className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-ocean-800">Correo electrónico</span>
                <input
                  type="email"
                  value={guestInfo.email}
                  onChange={(e) => setGuestInfo((g) => ({ ...g, email: e.target.value }))}
                  placeholder="andres@correo.com"
                  className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-ocean-800">Teléfono</span>
                <input
                  value={guestInfo.phone}
                  onChange={(e) => setGuestInfo((g) => ({ ...g, phone: e.target.value }))}
                  placeholder="+52 624 123 4567"
                  className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-ocean-800">Código de descuento (opcional)</span>
                <div className="flex gap-2">
                  <input
                    value={guestInfo.promoCode}
                    onChange={(e) =>
                      setGuestInfo((g) => ({ ...g, promoCode: e.target.value }))
                    }
                    placeholder="CONCIERGE10"
                    className="flex-1 rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
                  />
                  <button
                    onClick={applyPromo}
                    className="flex items-center gap-1 rounded-lg bg-sand-200 px-3 text-sm font-semibold text-ocean-800 hover:bg-sand-300"
                  >
                    <Tag size={14} /> Aplicar
                  </button>
                </div>
                {promoApplied?.invalid && (
                  <span className="text-xs text-red-500">Código no válido.</span>
                )}
                {promoApplied && !promoApplied.invalid && (
                  <span className="text-xs text-ocean-600">
                    Código aplicado: {promoApplied.rate * 100}% de descuento
                  </span>
                )}
              </label>
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-2xl border border-sand-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ocean-900">Pago</h2>
              <span className="flex items-center gap-1 text-xs text-ocean-700/60">
                <Lock size={12} /> Procesado de forma segura por Stripe
              </span>
            </div>
            <p className="mt-3 text-sm text-ocean-800/70">
              Al hacer clic serás redirigido a la página segura de pago de Stripe para completar
              tu compra con tarjeta.
            </p>
            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
            <button
              onClick={handlePay}
              disabled={!formValid || processing}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ocean-700 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-ocean-800 disabled:opacity-40"
            >
              {processing ? (
                "Redirigiendo a pago seguro..."
              ) : (
                <>
                  <Lock size={15} /> Pagar {formatPrice(total)}
                </>
              )}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1 text-center text-xs text-ocean-700/50">
              <ShieldCheck size={12} /> Nunca vemos ni almacenamos los datos de tu tarjeta.
            </p>
          </div>
        </div>

        {/* Order summary */}
        <aside>
          <div className="sticky top-24 rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-ocean-900">
              Resumen de tu itinerario
            </h2>
            <p className="mt-1 text-xs text-ocean-700/60">
              {formatDayLabel(tripDays[0])} – {formatDayLabel(tripDays[tripDays.length - 1])} ·{" "}
              {trip.guests} persona{trip.guests > 1 ? "s" : ""}
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {lineItems.map((li) => (
                <li key={li.itemId} className="flex items-start gap-3">
                  <ServiceImage service={li.service} className="h-11 w-11 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ocean-900">
                      {li.service.name}
                    </p>
                    <p className="text-xs text-ocean-700/60">
                      {formatDayLabel(li.day)} · {li.time}
                    </p>
                    {li.service.isDeposit && (
                      <p className="text-[11px] font-medium text-sand-600">
                        Depósito de reservación
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-ocean-900">
                    {formatPrice(li.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-col gap-2 border-t border-sand-100 pt-4 text-sm">
              <div className="flex justify-between text-ocean-800/80">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {promoApplied && !promoApplied.invalid && (
                <div className="flex justify-between text-ocean-600">
                  <span>Descuento ({promoApplied.code})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-sand-100 pt-2 font-display text-lg font-semibold text-ocean-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            {lineItems.some((li) => li.service.isDeposit) && (
              <p className="mt-4 border-t border-sand-100 pt-4 text-xs leading-relaxed text-ocean-700/60">
                Las cenas incluyen únicamente el depósito de reservación; se aplica como crédito
                en tu cuenta de consumo la noche de la cena y el resto se paga directamente en el
                restaurante.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
