import { CheckCircle2, Download, Mail, MessageCircle } from "lucide-react";
import ServiceImage from "../components/ServiceImage";
import { useApp } from "../context/AppContext";
import { ALL_SERVICES } from "../data/services";

function formatDayLabel(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
}

export default function Confirmation() {
  const { lastOrder, setScreen, formatPrice } = useApp();

  if (!lastOrder) {
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

  const byDay = new Map();
  lastOrder.lineItems.forEach((li) => {
    if (!byDay.has(li.day)) byDay.set(li.day, []);
    byDay.get(li.day).push(li);
  });
  const days = Array.from(byDay.keys()).sort();

  const whatsappText = encodeURIComponent(
    `¡Mi itinerario en Los Cabos está confirmado! Código ${lastOrder.confirmationCode}. Total: ${formatPrice(
      lastOrder.total
    )}. ${lastOrder.lineItems.length} experiencias reservadas.`
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ocean-50 text-ocean-600">
          <CheckCircle2 size={34} />
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ocean-900 sm:text-4xl">
          ¡Tu itinerario está confirmado!
        </h1>
        <p className="mt-2 text-ocean-800/70">
          Código de confirmación{" "}
          <span className="font-semibold text-ocean-900">{lastOrder.confirmationCode}</span>
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-ocean-700/70">
          <Mail size={14} /> Te enviamos la confirmación a {lastOrder.guestInfo.email}
        </p>

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
                {byDay.get(day).map((li) => {
                  const service = ALL_SERVICES.find((s) => s.id === li.serviceId);
                  if (!service) return null;
                  return (
                    <div
                      key={li.itemId}
                      className="flex items-center gap-3 rounded-xl bg-sand-50 p-3"
                    >
                      <ServiceImage service={service} className="h-12 w-12 shrink-0 rounded-lg" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ocean-900">
                          {service.name}
                        </p>
                        <p className="text-xs text-ocean-700/60">
                          {li.time} · {service.location}
                        </p>
                        {service.isDeposit && (
                          <p className="text-[11px] font-medium text-sand-600">
                            Depósito de reservación
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-ocean-900">
                        {formatPrice(li.lineTotal)}
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
              {formatPrice(lastOrder.total)}
            </p>
          </div>
        </div>
      </div>

      {/* Simulated confirmation email preview */}
      <div className="mt-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sand-600">
          Vista previa del correo de confirmación
        </p>
        <div className="overflow-hidden rounded-2xl border border-sand-200 shadow-sm">
          <div className="flex items-center gap-2 border-b border-sand-200 bg-sand-100 px-4 py-2 text-xs text-ocean-700/70">
            <Mail size={13} /> Para: {lastOrder.guestInfo.email}
          </div>
          <div className="bg-gradient-to-br from-ocean-800 to-ocean-600 p-6 text-center text-white">
            <p className="font-display text-lg font-semibold">Los Cabos Concierge</p>
            <p className="mt-1 text-sm text-ocean-50/90">Tu itinerario está listo</p>
          </div>
          <div className="p-6">
            <p className="text-sm text-ocean-900">
              Hola {lastOrder.guestInfo.name || "viajero"},
            </p>
            <p className="mt-2 text-sm text-ocean-800/80">
              Gracias por confiar tu viaje a nuestro equipo. Aquí tienes el resumen de tu
              itinerario en Los Cabos, código{" "}
              <span className="font-semibold">{lastOrder.confirmationCode}</span>.
            </p>
            <div className="mt-4 flex flex-col gap-1 rounded-xl bg-sand-50 p-4 text-sm">
              {lastOrder.lineItems.slice(0, 4).map((li) => {
                const service = ALL_SERVICES.find((s) => s.id === li.serviceId);
                return (
                  <div key={li.itemId} className="flex justify-between">
                    <span className="text-ocean-800/80">{service?.name}</span>
                    <span className="text-ocean-900">
                      {formatDayLabel(li.day)} · {li.time}
                    </span>
                  </div>
                );
              })}
              {lastOrder.lineItems.length > 4 && (
                <span className="text-xs text-ocean-700/60">
                  + {lastOrder.lineItems.length - 4} servicio(s) más
                </span>
              )}
            </div>
            <p className="mt-4 text-sm font-semibold text-ocean-900">
              Total: {formatPrice(lastOrder.total)}
            </p>
            <p className="mt-4 text-xs text-ocean-700/50">
              Cualquier duda, responde este correo o escríbenos por WhatsApp — tu concierge está
              disponible durante todo tu viaje.
            </p>
          </div>
        </div>
      </div>

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
