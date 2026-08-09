import { Anchor, Globe, Menu, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { ALL_SERVICES } from "../data/services";

const NAV_ITEMS = [
  { id: "home", label: { es: "Inicio", en: "Home" } },
  { id: "catalog", label: { es: "Catálogo", en: "Catalog" } },
  { id: "itinerary", label: { es: "Mi itinerario", en: "My itinerary" } },
];

export default function NavBar() {
  const { screen, setScreen, items, currency, setCurrency, language, setLanguage, formatPrice } =
    useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const total = items.reduce((sum, it) => {
    const service = ALL_SERVICES.find((s) => s.id === it.serviceId);
    if (!service) return sum;
    const multiplier = service.priceUnit === "persona" ? it.people : 1;
    return sum + service.price * multiplier;
  }, 0);

  function go(id) {
    setScreen(id);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200 bg-sand-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <button
          onClick={() => go("home")}
          className="flex items-center gap-2 font-display text-lg font-semibold text-ocean-800 sm:text-xl"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ocean-700 text-gold-300 sm:h-9 sm:w-9">
            <Anchor size={16} />
          </span>
          Los Cabos <span className="text-sand-600">Concierge</span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                screen === item.id
                  ? "bg-ocean-700 text-white"
                  : "text-ocean-800 hover:bg-ocean-100"
              }`}
            >
              {item.label[language]}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={() => setLanguage((l) => (l === "es" ? "en" : "es"))}
            className="flex items-center gap-1 rounded-full border border-sand-300 px-3 py-1.5 text-xs font-semibold text-ocean-800 hover:bg-sand-100"
            title="Language / Idioma"
          >
            <Globe size={14} />
            {language === "es" ? "ES" : "EN"}
          </button>
          <div className="flex overflow-hidden rounded-full border border-sand-300 text-xs font-semibold">
            {["MXN", "USD"].map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-3 py-1.5 ${
                  currency === c ? "bg-gold-500 text-ocean-900" : "bg-transparent text-ocean-800"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <button
            onClick={() => go("itinerary")}
            className="relative rounded-full bg-ocean-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-ocean-800"
          >
            {language === "es" ? "Itinerario" : "Itinerary"} · {formatPrice(total)}
            {items.length > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[11px] font-bold text-ocean-900">
                {items.length}
              </span>
            )}
          </button>
        </div>

        <button
          className="rounded-full p-2 text-ocean-800 md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-sand-200 bg-sand-50 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className={`rounded-lg px-3 py-2 text-left text-sm font-medium ${
                  screen === item.id ? "bg-ocean-700 text-white" : "text-ocean-800"
                }`}
              >
                {item.label[language]}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              onClick={() => setLanguage((l) => (l === "es" ? "en" : "es"))}
              className="flex items-center gap-1 rounded-full border border-sand-300 px-3 py-1.5 text-xs font-semibold"
            >
              <Globe size={14} />
              {language === "es" ? "ES" : "EN"}
            </button>
            <div className="flex overflow-hidden rounded-full border border-sand-300 text-xs font-semibold">
              {["MXN", "USD"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-3 py-1.5 ${
                    currency === c ? "bg-gold-500 text-ocean-900" : "bg-transparent"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => go("itinerary")}
            className="mt-3 w-full rounded-full bg-ocean-700 px-4 py-2 text-sm font-semibold text-white"
          >
            {language === "es" ? "Ver itinerario" : "View itinerary"} ({items.length}) ·{" "}
            {formatPrice(total)}
          </button>
        </div>
      )}
    </header>
  );
}
