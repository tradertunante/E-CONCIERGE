import { APP_TIMEZONE } from "./timezone.js";

const CONFIRMATION_BUFFER_HOURS = 24;

// Convierte day ("YYYY-MM-DD") + time ("HH:MM", u otro texto no parseable)
// a un Date en UTC, interpretando el reloj de pared en APP_TIMEZONE.
// TODO: si se necesita más precisión, mover a una librería de zonas horarias
// (date-fns-tz / luxon) — por ahora Los Cabos siempre está en UTC-7 sin
// horario de verano, así que el offset fijo es seguro.
const FIXED_UTC_OFFSET_HOURS = 7;

function serviceDateTimeUtc(day, time) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time || "");
  const [hours, minutes] = match ? [Number(match[1]), Number(match[2])] : [0, 0];
  return new Date(`${day}T00:00:00Z`).getTime() + (hours + FIXED_UTC_OFFSET_HOURS) * 3600_000 + minutes * 60_000;
}

export function computeConfirmationDeadline(day, time) {
  const serviceAt = serviceDateTimeUtc(day, time);
  const deadline = serviceAt - CONFIRMATION_BUFFER_HOURS * 3600_000;
  const now = Date.now();
  // Si el servicio es en menos de 24h, no des un plazo negativo: exige
  // confirmación casi inmediata en vez de un deadline ya vencido.
  return new Date(Math.max(deadline, now + 5 * 60_000));
}

export { APP_TIMEZONE };
