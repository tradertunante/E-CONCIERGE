import { Check, Info, Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { DEPOSIT_NOTE } from "../data/services";
import ServiceImage from "./ServiceImage";

function formatDayLabel(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });
}

export default function ServiceDetailModal({ service, onClose }) {
  const { tripDays, trip, addItem, formatPrice } = useApp();
  const [day, setDay] = useState(tripDays[0]);
  const [time, setTime] = useState(service.times[0]);
  const [people, setPeople] = useState(trip.guests);
  const [confirmed, setConfirmed] = useState(false);

  const total = service.priceUnit === "persona" ? service.price * people : service.price;

  function handleReserve() {
    addItem(service, { day, time, people });
    setConfirmed(true);
    setTimeout(() => {
      onClose();
    }, 1100);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ocean-900/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-sand-50 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <ServiceImage service={service} className="h-56 w-full sm:rounded-t-3xl" />
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ocean-900 shadow hover:bg-white"
          >
            <X size={18} />
          </button>
          {service.recommended && (
            <span className="absolute left-4 top-4 rounded-full bg-gold-500/95 px-3 py-1 text-xs font-semibold text-ocean-900 shadow">
              Recomendado por el concierge
            </span>
          )}
        </div>

        <div className="p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-sand-600">
            {service.location}
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-ocean-900 sm:text-3xl">
            {service.name}
          </h2>
          <p className="mt-1 text-sm font-medium text-ocean-700/80">{service.tagline}</p>
          <p className="mt-4 text-sm leading-relaxed text-ocean-900/80">
            {service.longDescription}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-white p-3">
              <p className="text-xs text-ocean-700/60">Duración</p>
              <p className="font-semibold text-ocean-900">{service.duration}</p>
            </div>
            <div className="rounded-xl bg-white p-3">
              <p className="text-xs text-ocean-700/60">
                {service.isDeposit ? "Depósito para reservar" : "Precio"}
              </p>
              <p className="font-semibold text-ocean-900">
                {formatPrice(service.price)} / {service.priceUnit}
              </p>
            </div>
          </div>

          {service.isDeposit && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-ocean-50 p-3 text-xs text-ocean-800/80">
              <Info size={15} className="mt-0.5 shrink-0 text-ocean-600" />
              <p>{DEPOSIT_NOTE}</p>
            </div>
          )}

          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold text-ocean-900">Día del viaje</p>
            <div className="flex flex-wrap gap-2">
              {tripDays.map((d) => (
                <button
                  key={d}
                  onClick={() => setDay(d)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                    day === d
                      ? "bg-ocean-700 text-white"
                      : "bg-white text-ocean-800 hover:bg-ocean-100"
                  }`}
                >
                  {formatDayLabel(d)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold text-ocean-900">Horario disponible</p>
            <div className="flex flex-wrap gap-2">
              {service.times.map((t) => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    time === t
                      ? "bg-ocean-700 text-white"
                      : "bg-white text-ocean-800 hover:bg-ocean-100"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold text-ocean-900">Número de personas</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPeople((p) => Math.max(1, p - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ocean-800 shadow-sm hover:bg-ocean-100"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center text-base font-semibold text-ocean-900">
                {people}
              </span>
              <button
                onClick={() => setPeople((p) => Math.min(20, p + 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ocean-800 shadow-sm hover:bg-ocean-100"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between rounded-2xl bg-ocean-50 p-4">
            <div>
              <p className="text-xs text-ocean-700/70">
                {service.isDeposit ? "Depósito total" : "Total estimado"}
              </p>
              <p className="font-display text-xl font-semibold text-ocean-900">
                {formatPrice(total)}
              </p>
            </div>
            <button
              onClick={handleReserve}
              disabled={confirmed}
              className="flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-ocean-900 shadow-sm transition-colors hover:bg-gold-400 disabled:opacity-70"
            >
              {confirmed ? (
                <>
                  <Check size={16} /> Agregado
                </>
              ) : (
                "Reservar"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
