import { CheckCircle2, Clock, Download, Loader2, Mail, MessageCircle, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ServiceImage from "../components/ServiceImage";
import { useApp } from "../context/AppContext";
import { useCatalog } from "../context/CatalogContext";
import { getOrder } from "../lib/api";

function formatDayLabel(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
}

const BOOKING_STATUS_LABEL = {
  pendiente_pago: "Pendiente de pago",
  pagado: "Pago recibido",
  pendiente_confirmacion_proveedor: "Confirmando con el proveedor",
  confirmado: "Confirmado",
  rechazado: "No disponible — se reembolsará esta línea",
  completado: "Completado",
  incluido_en_payout: "Completado",
  pagado_a_proveedor: "Completado",
  cancelado: "Cancelado",
  reembolsado: "Reembolsado",
};

const POLL_INTERVAL_MS = 2500;
const MAX_POLLS = 12;

export default function Confirmation() {
  const { setScreen, formatPrice, clearItinerary } = useApp();
  const { services: ALL_SERVICES } = useCatalog();
  const [orderId] = useState(() => new URLSearchParams(window.location.search).get("order"));
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const clearedRef = useRef(false);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    let pollCount = 0;

    async function poll() {
      try {
        const result = await getOrder(orderId);
        if (cancelled) return;
        setData(result);
        pollCount += 1;
        if (result.order.paymentStatus === "pendiente" && pollCount < MAX_POLLS) {
          setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch (err) {
        if (!cancelled) setLoadError(err.message || "No se pudo cargar tu orden.");
      }
    }
    poll();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  useEffect(() => {
    if (data?.order.paymentStatus === "pagado" && !clearedRef.current) {
      clearedRef.current = true;
      clearItinerary();
    }
  }, [data, clearItinerary]);

  if (!orderId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-ocean-800/70">No hay ninguna confirmación reciente.</p>
        <button
          onClick={() => setScreen("home")}
          className="mt-4 rounded-full bg-ocean-700 px-6 py-2.5 text-sm font-semibold text-white"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <XCircle className="mx-auto text-red-400" size={40} />
        <p className="mt-4 text-ocean-800/70">{loadError}</p>
        <button
          onClick={() => setScreen("home")}
          className="mt-4 rounded-full bg-ocean-700 px-6 py-2.5 text-sm font-semibold text-white"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <Loader2 className="mx-auto animate-spin text-ocean-600" size={32} />
        <p className="mt-4 text-ocean-800/70">Confirmando tu pago...</p>
      </div>
    );
  }

  const { order, bookings } = data;

  if (order.paymentStatus === "fallido") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <XCircle className="mx-auto text-red-400" size={40} />
        <h1 className="mt-4 font-display text-2xl font-semibold text-ocean-900">
          El pago no se completó
        </h1>
        <p className="mt-2 text-ocean-800/70">
          Tu itinerario sigue guardado, puedes intentar pagar de nuevo cuando quieras.
        </p>
        <button
          onClick={() => setScreen("checkout")}
          className="mt-6 rounded-full bg-ocean-700 px-6 py-2.5 text-sm font-semibold text-white"
        >
          Volver a intentar
        </button>
      </div>
    );
  }

  const byDay = new Map();
  bookings.forEach((b) => {
    if (!byDay.has(b.day)) byDay.set(b.day, []);
    byDay.get(b.day).push(b);
  });
  const days = Array.from(byDay.keys()).sort();

  const stillConfirming = order.paymentStatus === "pendiente";
  const whatsappText = encodeURIComponent(
    `¡Mi itinerario en Los Cabos está confirmado! Código ${order.confirmationCode}. Total: ${formatPrice(
      order.totalMxn
    )}. ${bookings.length} experiencias reservadas.`
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ocean-50 text-ocean-600">
          {stillConfirming ? <Loader2 className="animate-spin" size={30} /> : <CheckCircle2 size={34} />}
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ocean-900 sm:text-4xl">
          {stillConfirming ? "Confirmando tu pago..." : "¡Tu itinerario está confirmado!"}
        </h1>
        <p className="mt-2 text-ocean-800/70">
          Código de confirmación{" "}
          <span className="font-semibold text-ocean-900">{order.confirmationCode}</span>
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-ocean-700/70">
          <Mail size={14} /> Te enviamos la confirmación a {order.guestEmail}
        </p>

        {!stillConfirming && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={`https://wa.me/?text=${whatsappText}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              <MessageCircle size={16} /> Compartir por WhatsApp
            </a>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-full border border-sand-300 bg-white px-5 py-2.5 text-sm font-semibold text-ocean-800 hover:bg-sand-100"
            >
              <Download size={16} /> Descargar PDF
            </button>
          </div>
        )}
      </div>

      <div className="mt-10 rounded-2xl border border-sand-200 bg-white p-6">
        <h2 className="font-display text-xl font-semibold text-ocean-900">
          Itinerario día por día
        </h2>
        <div className="mt-5 flex flex-col gap-6">
          {days.map((day) => (
            <div key={day}>
              <h3 className="mb-2 font-display text-base font-semibold capitalize text-ocean-800">
                {formatDayLabel(day)}
              </h3>
              <div className="flex flex-col gap-2">
                {byDay.get(day).map((b) => {
                  const service = ALL_SERVICES.find((s) => s.id === b.serviceId);
                  if (!service) return null;
                  return (
                    <div
                      key={b.id}
                      className="flex items-center gap-3 rounded-xl bg-sand-50 p-3"
                    >
                      <ServiceImage service={service} className="h-12 w-12 shrink-0 rounded-lg" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ocean-900">
                          {service.name}
                        </p>
                        <p className="text-xs text-ocean-700/60">
                          {b.time} · {service.location}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-ocean-600">
                          <Clock size={11} /> {BOOKING_STATUS_LABEL[b.status] || b.status}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-ocean-900">
                        {formatPrice(b.priceClient)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end border-t border-sand-100 pt-4">
          <div className="text-right">
            <p className="text-xs text-ocean-700/60">Total pagado</p>
            <p className="font-display text-2xl font-semibold text-ocean-900">
              {formatPrice(order.totalMxn)}
            </p>
          </div>
        </div>
      </div>

      {!stillConfirming && (
        <div className="mt-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sand-600">
            Vista previa del correo de confirmación
          </p>
          <div className="overflow-hidden rounded-2xl border border-sand-200 shadow-sm">
            <div className="flex items-center gap-2 border-b border-sand-200 bg-sand-100 px-4 py-2 text-xs text-ocean-700/70">
              <Mail size={13} /> Para: {order.guestEmail}
            </div>
            <div className="bg-gradient-to-br from-ocean-800 to-ocean-600 p-6 text-center text-white">
              <p className="font-display text-lg font-semibold">Los Cabos Concierge</p>
              <p className="mt-1 text-sm text-ocean-50/90">Tu itinerario está listo</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-ocean-900">Hola {order.guestName || "viajero"},</p>
              <p className="mt-2 text-sm text-ocean-800/80">
                Gracias por confiar tu viaje a nuestro equipo. Aquí tienes el resumen de tu
                itinerario en Los Cabos, código{" "}
                <span className="font-semibold">{order.confirmationCode}</span>.
              </p>
              <div className="mt-4 flex flex-col gap-1 rounded-xl bg-sand-50 p-4 text-sm">
                {bookings.slice(0, 4).map((b) => {
                  const service = ALL_SERVICES.find((s) => s.id === b.serviceId);
                  return (
                    <div key={b.id} className="flex justify-between">
                      <span className="text-ocean-800/80">{service?.name}</span>
                      <span className="text-ocean-900">
                        {formatDayLabel(b.day)} · {b.time}
                      </span>
                    </div>
                  );
                })}
                {bookings.length > 4 && (
                  <span className="text-xs text-ocean-700/60">
                    + {bookings.length - 4} servicio(s) más
                  </span>
                )}
              </div>
              <p className="mt-4 text-sm font-semibold text-ocean-900">
                Total: {formatPrice(order.totalMxn)}
              </p>
              <p className="mt-4 text-xs text-ocean-700/50">
                Cualquier duda, responde este correo o escríbenos por WhatsApp — tu concierge está
                disponible durante todo tu viaje.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10 text-center">
        <button
          onClick={() => setScreen("home")}
          className="rounded-full bg-ocean-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-ocean-800"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
