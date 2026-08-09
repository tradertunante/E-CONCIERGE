import { Anchor, Compass, Minus, Plus, ShieldCheck, Sparkles, Utensils } from "lucide-react";
import { useApp } from "../context/AppContext";
import { PACKAGES, ALL_SERVICES } from "../data/services";
import ServiceImage from "../components/ServiceImage";

export default function Home() {
  const { trip, setTrip, setScreen, addItem, tripDays, language } = useApp();

  function handleStart() {
    setScreen("catalog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function applyPackage(pkg) {
    pkg.serviceIds.forEach((id, idx) => {
      const service = ALL_SERVICES.find((s) => s.id === id);
      if (!service) return;
      const day = tripDays[idx % Math.max(tripDays.length, 1)] || tripDays[0];
      addItem(service, { day, time: service.times[0], people: trip.guests });
    });
    setScreen("itinerary");
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ocean-800 via-ocean-700 to-ocean-500 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.18),transparent_55%)]" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:py-32">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-gold-300">
              <Sparkles size={14} /> Concierge privado en Los Cabos
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Arma tu viaje perfecto en Los Cabos, sin llamadas ni esperas
            </h1>
            <p className="mt-5 max-w-xl text-base text-ocean-50/90 sm:text-lg">
              Elige entre los mejores restaurantes, actividades, paseos en barco y transporte
              privado de la región, y arma tu itinerario día por día en minutos.
            </p>

            <div className="mt-8 rounded-2xl bg-white/95 p-4 text-ocean-900 shadow-xl sm:p-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <label className="col-span-1 flex flex-col gap-1">
                  <span className="text-xs font-semibold text-ocean-700/70">Llegada</span>
                  <input
                    type="date"
                    value={trip.start}
                    onChange={(e) => setTrip((t) => ({ ...t, start: e.target.value }))}
                    className="rounded-lg border border-sand-200 px-2 py-2 text-sm"
                  />
                </label>
                <label className="col-span-1 flex flex-col gap-1">
                  <span className="text-xs font-semibold text-ocean-700/70">Salida</span>
                  <input
                    type="date"
                    value={trip.end}
                    onChange={(e) => setTrip((t) => ({ ...t, end: e.target.value }))}
                    className="rounded-lg border border-sand-200 px-2 py-2 text-sm"
                  />
                </label>
                <div className="col-span-2 flex flex-col gap-1 sm:col-span-1">
                  <span className="text-xs font-semibold text-ocean-700/70">Personas</span>
                  <div className="flex items-center justify-between rounded-lg border border-sand-200 px-2 py-1.5">
                    <button
                      onClick={() => setTrip((t) => ({ ...t, guests: Math.max(1, t.guests - 1) }))}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-sand-100 text-ocean-800"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="text-sm font-semibold">{trip.guests}</span>
                    <button
                      onClick={() => setTrip((t) => ({ ...t, guests: Math.min(20, t.guests + 1) }))}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-sand-100 text-ocean-800"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
                <div className="col-span-2 flex items-end sm:col-span-1">
                  <button
                    onClick={handleStart}
                    className="w-full rounded-lg bg-ocean-700 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-ocean-800"
                  >
                    Comenzar mi itinerario
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-ocean-50/80">
              <ShieldCheck size={16} className="text-gold-300" />
              Curado por tu concierge personal · Confirmación inmediata
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 h-48 overflow-hidden rounded-3xl shadow-xl sm:h-56">
              <ServiceImage
                service={{
                  category: "barcos",
                  gradient: "from-ocean-400 to-ocean-700",
                  image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
                  name: "Catamarán al atardecer en Los Cabos",
                }}
                className="h-full w-full"
              />
            </div>
            <div className="h-32 overflow-hidden rounded-2xl shadow-lg sm:h-40">
              <ServiceImage
                service={{
                  category: "restaurantes",
                  gradient: "from-sand-500 to-gold-400",
                  image: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=800&q=80",
                  name: "Cena frente al mar",
                }}
                className="h-full w-full"
              />
            </div>
            <div className="h-32 overflow-hidden rounded-2xl shadow-lg sm:h-40">
              <ServiceImage
                service={{
                  category: "actividades",
                  gradient: "from-sand-400 to-ocean-300",
                  image: "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=800&q=80",
                  name: "Aventura en el desierto de Baja",
                }}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: Utensils,
              title: "10 restaurantes de alta gama",
              text: "De ACRE a Cocina de Autor, reserva las mesas más codiciadas de Los Cabos.",
            },
            {
              icon: Compass,
              title: "Aventura a tu medida",
              text: "Tirolesas, UTV, snorkel en El Arco y más, con guías certificados.",
            },
            {
              icon: Anchor,
              title: "Pesca y paseos en barco",
              text: "Desde pangas íntimas hasta yates privados de día completo.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-sand-200 bg-white p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-50 text-ocean-700">
                <Icon size={20} />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-ocean-900">{title}</h3>
              <p className="mt-1 text-sm text-ocean-800/70">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Suggested packages */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-sand-600">
                Curaduría del concierge
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-ocean-900 sm:text-3xl">
                Paquetes sugeridos
              </h2>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className="flex flex-col rounded-2xl border border-sand-200 bg-sand-50 p-6"
              >
                <h3 className="font-display text-xl font-semibold text-ocean-900">{pkg.name}</h3>
                <p className="mt-2 flex-1 text-sm text-ocean-800/75">{pkg.description}</p>
                <p className="mt-3 text-xs text-ocean-700/60">
                  {pkg.serviceIds.length} servicios incluidos
                </p>
                <button
                  onClick={() => applyPackage(pkg)}
                  className="mt-4 w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-ocean-900 hover:bg-gold-400"
                >
                  Usar este paquete
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
