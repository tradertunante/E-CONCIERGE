import { ArrowRight, X } from "lucide-react";
import { useMemo, useState } from "react";
import ServiceCard from "../components/ServiceCard";
import ServiceDetailModal from "../components/ServiceDetailModal";
import ServiceImage from "../components/ServiceImage";
import { useApp } from "../context/AppContext";
import { ACTIVITY_SUBCATEGORIES, ALL_SERVICES, CATEGORIES } from "../data/services";

export default function Catalog() {
  const { items, removeItem, formatPrice, setScreen } = useApp();
  const [activeCategory, setActiveCategory] = useState("restaurantes");
  const [activeSubcategory, setActiveSubcategory] = useState("all");
  const [openService, setOpenService] = useState(null);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setActiveSubcategory("all");
  };

  const filtered = useMemo(
    () =>
      ALL_SERVICES.filter((s) => {
        if (s.category !== activeCategory) return false;
        if (activeCategory === "actividades" && activeSubcategory !== "all") {
          return s.subcategory === activeSubcategory;
        }
        return true;
      }),
    [activeCategory, activeSubcategory]
  );

  const total = items.reduce((sum, it) => {
    const service = ALL_SERVICES.find((s) => s.id === it.serviceId);
    if (!service) return sum;
    const multiplier = service.priceUnit === "persona" ? it.people : 1;
    return sum + service.price * multiplier;
  }, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-sand-600">Catálogo</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ocean-900">
          Elige los servicios de tu viaje
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <div className="mb-6 flex gap-2 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeCategory === cat.id
                    ? "bg-ocean-700 text-white"
                    : "bg-white text-ocean-800 border border-sand-200 hover:bg-ocean-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {activeCategory === "actividades" && (
            <div className="mb-6 flex gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveSubcategory("all")}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  activeSubcategory === "all"
                    ? "bg-ocean-100 text-ocean-800 border border-ocean-200"
                    : "bg-white text-ocean-700/70 border border-sand-200 hover:bg-sand-50"
                }`}
              >
                Todas
              </button>
              {ACTIVITY_SUBCATEGORIES.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubcategory(sub.id)}
                  className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    activeSubcategory === sub.id
                      ? "bg-ocean-100 text-ocean-800 border border-ocean-200"
                      : "bg-white text-ocean-700/70 border border-sand-200 hover:bg-sand-50"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((service) => (
              <ServiceCard key={service.id} service={service} onOpen={setOpenService} />
            ))}
          </div>
        </div>

        {/* Sticky itinerary summary sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-ocean-900">Tu itinerario</h2>
            {items.length === 0 ? (
              <p className="mt-3 text-sm text-ocean-800/60">
                Aún no has agregado servicios. Explora el catálogo y da clic en "Agregar".
              </p>
            ) : (
              <ul className="mt-3 flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
                {items.map((it) => {
                  const service = ALL_SERVICES.find((s) => s.id === it.serviceId);
                  if (!service) return null;
                  return (
                    <li key={it.itemId} className="flex items-start gap-3">
                      <ServiceImage service={service} className="h-12 w-12 shrink-0 rounded-lg" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ocean-900">
                          {service.name}
                        </p>
                        <p className="text-xs text-ocean-700/60">
                          {it.day} · {it.time}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(it.itemId)}
                        className="mt-0.5 text-ocean-700/40 hover:text-red-500"
                      >
                        <X size={15} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-4 flex items-center justify-between border-t border-sand-100 pt-4">
              <span className="text-sm font-semibold text-ocean-900">Total</span>
              <span className="font-display text-lg font-semibold text-ocean-900">
                {formatPrice(total)}
              </span>
            </div>
            <button
              onClick={() => setScreen("itinerary")}
              disabled={items.length === 0}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-ocean-700 py-2.5 text-sm font-semibold text-white hover:bg-ocean-800 disabled:opacity-40"
            >
              Ver itinerario completo <ArrowRight size={15} />
            </button>
          </div>
        </aside>
      </div>

      {/* Mobile sticky bar */}
      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sand-200 bg-white p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] lg:hidden">
          <button
            onClick={() => setScreen("itinerary")}
            className="flex w-full items-center justify-between rounded-full bg-ocean-700 px-5 py-3 text-sm font-semibold text-white"
          >
            <span>
              {items.length} servicio{items.length > 1 ? "s" : ""} · {formatPrice(total)}
            </span>
            <span className="flex items-center gap-1">
              Ver itinerario <ArrowRight size={15} />
            </span>
          </button>
        </div>
      )}

      {openService && (
        <ServiceDetailModal service={openService} onClose={() => setOpenService(null)} />
      )}
    </div>
  );
}
