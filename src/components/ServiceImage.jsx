import { Anchor, Car, Compass, Utensils } from "lucide-react";

const ICONS = {
  restaurantes: Utensils,
  actividades: Compass,
  barcos: Anchor,
  transporte: Car,
};

export default function ServiceImage({ service, className = "" }) {
  const Icon = ICONS[service.category] || Compass;

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

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${service.gradient} ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)]" />
      <Icon className="text-white/90" size={40} strokeWidth={1.5} />
    </div>
  );
}
