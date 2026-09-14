// Mismo valor que src/data/services.js (EXCHANGE_RATE_MXN_USD) en el frontend.
// TODO: mover a una fuente compartida (o feed de tipo de cambio) cuando se
// automatice; por ahora se mantiene sincronizado a mano en ambos lados.
export const EXCHANGE_RATE_MXN_USD = 18.5;

export function mxnToCents(mxnAmount) {
  return Math.round(mxnAmount * 100);
}

export function mxnToUsdCents(mxnAmount, exchangeRate) {
  return Math.round((mxnAmount / exchangeRate) * 100);
}
