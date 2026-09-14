import { createContext, useContext, useEffect, useState } from "react";
import { getPublicCatalog } from "../lib/api";
import { ALL_SERVICES as FALLBACK_SERVICES } from "../data/services";

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const [services, setServices] = useState(FALLBACK_SERVICES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getPublicCatalog()
      .then(({ services }) => {
        if (!cancelled) setServices(services);
      })
      .catch((err) => {
        // Si el backend no está disponible, seguimos mostrando el catálogo
        // de demo (FALLBACK_SERVICES) para no dejar la app en blanco.
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CatalogContext.Provider value={{ services, loading, error }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
