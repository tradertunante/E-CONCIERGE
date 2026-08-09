import { Clock, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";
import ServiceImage from "./ServiceImage";

export default function ServiceCard({ service, onOpen }) {
  const { formatPrice } = useApp();

  return (
    <button
      onClick={() => onOpen(service)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative">
        <ServiceImage service={service} className="h-40 w-full" />
        {service.recommended && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-gold-500/95 px-2.5 py-1 text-[11px] font-semibold text-ocean-900 shadow">
            <Sparkles size={12} />
            Recomendado por el concierge
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold leading-tight text-ocean-900">
            {service.name}
          </h3>
        </div>
        <p className="text-xs font-medium uppercase tracking-wide text-sand-600">
          {service.location}
        </p>
        <p className="line-clamp-2 text-sm text-ocean-800/80">{service.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="flex items-center gap-1 text-xs text-ocean-700/70">
            <Clock size={13} />
            {service.duration}
          </span>
          <span className="text-right">
            <span className="font-display text-base font-semibold text-ocean-800">
              {formatPrice(service.price)}
              <span className="ml-1 text-xs font-normal text-ocean-700/60">
                /{service.priceUnit}
              </span>
            </span>
            {service.isDeposit && (
              <span className="block text-[11px] font-medium text-sand-600">
                depósito para reservar
              </span>
            )}
          </span>
        </div>
        <span className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-ocean-700 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-ocean-800">
          Ver detalle
        </span>
      </div>
    </button>
  );
}
