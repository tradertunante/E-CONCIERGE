import { AlertTriangle, ArrowRight, Trash2, Users } from "lucide-react";
import { useMemo } from "react";
import ServiceImage from "../components/ServiceImage";
import { useApp } from "../context/AppContext";
import { ALL_SERVICES } from "../data/services";

function parseDurationMinutes(duration) {
  const match = duration.match(/([\d.]+)\s*(hrs?|min)/i);
  if (!match) return null;
  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  return unit.startsWith("h") ? value * 60 : value;
}

function timeToMinutes(time) {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

function formatDayLabel(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function detectConflicts(dayItems) {
  const withRanges = dayItems
    .map((it) => {
      const service = ALL_SERVICES.find((s) => s.id === it.serviceId);
      const start = timeToMinutes(it.time);
      const dur = service ? parseDurationMinutes(service.duration) : null;
      return {
        ...it,
        service,
        start,
        end: start !== null && dur !== null ? start + dur : null,
      };
    })
    .filter((it) => it.start !== null);

  const conflictIds = new Set();
  for (let i = 0; i < withRanges.length; i++) {
    for (let j = i + 1; j < withRanges.length; j++) {
      const a = withRanges[i];
      const b = withRanges[j];
      if (a.end === null || b.end === null) continue;
      if (a.start < b.end && b.start < a.end) {
        conflictIds.add(a.itemId);
        conflictIds.add(b.itemId);
      }
    }
  }
  return conflictIds;
}

export default function Itinerary() {
  const { items, removeItem, tripDays, formatPrice, setScreen } = useApp();

  const grouped = useMemo(() => {
    const map = new Map();
    tripDays.forEach((d) => map.set(d, []));
    items.forEach((it) => {
      if (!map.has(it.day)) map.set(it.day, []);
      map.get(it.day).push(it);
    });
    for (const dayItems of map.values()) {
      dayItems.sort((a, b) => (a.time > b.time ? 1 : -1));
    }
    return map;
  }, [items, tripDays]);

  const total = items.reduce((sum, it) => {
    const service = ALL_SERVICES.find((s) => s.id === it.serviceId);
    if (!service) return sum;
    const multiplier = service.priceUnit === "persona" ? it.people : 1;
    return sum + service.price * multiplier;
  }, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-sand-600">
        Mi itinerario
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ocean-900">
        Tu viaje día por día
      </h1>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-sand-300 bg-white p-10 text-center">
          <p className="text-ocean-800/70">
            Todavía no has agregado servicios a tu itinerario.
          </p>
          <button
            onClick={() => setScreen("catalog")}
            className="mt-4 rounded-full bg-ocean-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-ocean-800"
          >
            Explorar catálogo
          </button>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-8">
          {Array.from(grouped.entries()).map(([day, dayItems]) => {
            if (dayItems.length === 0) return null;
            const conflicts = detectConflicts(dayItems);
            return (
              <div key={day}>
                <h2 className="mb-3 font-display text-xl font-semibold capitalize text-ocean-900">
                  {formatDayLabel(day)}
                </h2>
                <div className="flex flex-col gap-3 border-l-2 border-sand-200 pl-5">
                  {dayItems.map((it) => {
                    const service = ALL_SERVICES.find((s) => s.id === it.serviceId);
                    if (!service) return null;
                    const hasConflict = conflicts.has(it.itemId);
                    const lineTotal =
                      service.priceUnit === "persona"
                        ? service.price * it.people
                        : service.price;
                    return (
                      <div
                        key={it.itemId}
                        className={`relative flex gap-3 rounded-2xl border bg-white p-3 shadow-sm sm:p-4 ${
                          hasConflict ? "border-red-300" : "border-sand-200"
                        }`}
                      >
                        <span className="absolute -left-[27px] top-6 h-3 w-3 rounded-full border-2 border-white bg-ocean-600" />
                        <ServiceImage
                          service={service}
                          className="h-16 w-16 shrink-0 rounded-xl sm:h-20 sm:w-20"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-ocean-50 px-2.5 py-0.5 text-xs font-semibold text-ocean-700">
                              {it.time}
                            </span>
                            <span className="text-xs text-ocean-700/60">{service.duration}</span>
                            {hasConflict && (
                              <span className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                                <AlertTriangle size={12} /> Choca con otro horario
                              </span>
                            )}
                          </div>
                          <p className="mt-1 truncate font-display text-base font-semibold text-ocean-900">
                            {service.name}
                          </p>
                          <p className="text-xs text-ocean-700/60">{service.location}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="flex items-center gap-1 text-xs text-ocean-700/70">
                              <Users size={12} />
                              {service.priceUnit === "persona"
                                ? `${it.people} persona${it.people > 1 ? "s" : ""}`
                                : "1 reserva"}
                            </span>
                            <span className="text-right">
                              <span className="font-display text-sm font-semibold text-ocean-900">
                                {formatPrice(lineTotal)}
                              </span>
                              {service.isDeposit && (
                                <span className="block text-[11px] font-medium text-sand-600">
                                  depósito de reservación
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(it.itemId)}
                          className="self-start text-ocean-700/40 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {items.length > 0 && (
        <div className="sticky bottom-4 mt-8 rounded-2xl border border-sand-200 bg-white/95 p-5 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-ocean-700/60">
                {items.length} servicio{items.length > 1 ? "s" : ""} en tu itinerario
              </p>
              <p className="font-display text-2xl font-semibold text-ocean-900">
                {formatPrice(total)}
              </p>
            </div>
            <button
              onClick={() => setScreen("checkout")}
              className="flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-ocean-900 hover:bg-gold-400"
            >
              Ir a checkout <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
