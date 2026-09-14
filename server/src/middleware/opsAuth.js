import { env } from "../config/env.js";

// Autenticación mínima para el panel de operaciones interno: una API key
// compartida por header. Suficiente para el equipo interno en esta etapa;
// si el panel gana una UI con múltiples usuarios, esto debe evolucionar a
// sesiones/roles reales.
export function opsAuth(req, res, next) {
  const key = req.get("X-Ops-Api-Key");
  if (!key || key !== env.opsApiKey) {
    return res.status(401).json({ error: "No autorizado" });
  }
  next();
}
