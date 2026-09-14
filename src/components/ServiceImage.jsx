import { Anchor, Car, Compass, Utensils } from "lucide-react";

const ICONS = {
  restaurantes: Utensils,
  actividades: Compass,
  barcos: Anchor,
  transporte: Car,
};

const SUBCATEGORY_ICONS = {
  boats: Anchor,
};

const GRADIENTS = [
  "from-ocean-600 to-ocean-400",
  "from-sand-500 to-gold-400",
  "from-ocean-700 to-ocean-400",
  "from-sand-600 to-sand-300",
  "from-ocean-500 to-gold-400",
  "from-sand-400 to-ocean-300",
];

function gradientFor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

export default function ServiceImage({ service, className = "" }) {
  const Icon = SUBCATEGORY_ICONS[service.subcategory] || ICONS[service.category] || Compass;

  if (service.image) {
    return (
      <div className={`relative overflow-hidden bg-sand-200 ${className}`}>
        <img
          src={service.image}
          alt={service.name || ""}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/5" />
      </div>
    );
  }

  const gradient = service.gradient || gradientFor(service.id || "");
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${gradient} ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)]" />
      <Icon className="text-white/90" size={40} strokeWidth={1.5} />
    </div>
  );
}
