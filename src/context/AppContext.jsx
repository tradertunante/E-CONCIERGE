import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { EXCHANGE_RATE_MXN_USD } from "../data/services";

const AppContext = createContext(null);

const STORAGE_KEY = "loscabos-concierge-demo";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function defaultTrip() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() + 14);
  const end = new Date(start);
  end.setDate(end.getDate() + 4);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
    guests: 2,
  };
}

export function AppProvider({ children }) {
  const saved = loadState();

  const [screen, setScreen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("order")) return "confirmation";
    if (params.get("screen") === "admin") return "admin";
    return "home";
  });
  const [trip, setTrip] = useState(saved?.trip || defaultTrip());
  const [items, setItems] = useState(saved?.items || []); // { itemId, serviceId, day, time, people }
  const [currency, setCurrency] = useState(saved?.currency || "MXN");
  const [language, setLanguage] = useState(saved?.language || "es");
  const [guestInfo, setGuestInfo] = useState(
    saved?.guestInfo || { name: "", email: "", phone: "", promoCode: "" }
  );
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ trip, items, currency, language, guestInfo })
    );
  }, [trip, items, currency, language, guestInfo]);

  const tripDays = useMemo(() => {
    const days = [];
    if (!trip.start || !trip.end) return days;
    const start = new Date(trip.start + "T00:00:00");
    const end = new Date(trip.end + "T00:00:00");
    const cursor = new Date(start);
    while (cursor <= end) {
      days.push(cursor.toISOString().slice(0, 10));
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }, [trip.start, trip.end]);

  function addItem(service, { day, time, people }) {
    const itemId = `${service.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setItems((prev) => [
      ...prev,
      {
        itemId,
        serviceId: service.id,
        day: day || tripDays[0],
        time,
        people: people || trip.guests,
      },
    ]);
    return itemId;
  }

  function removeItem(itemId) {
    setItems((prev) => prev.filter((it) => it.itemId !== itemId));
  }

  function clearItinerary() {
    setItems([]);
  }

  function formatPrice(mxnAmount) {
    if (currency === "USD") {
      const usd = mxnAmount / EXCHANGE_RATE_MXN_USD;
      return `$${usd.toLocaleString("en-US", { maximumFractionDigits: 0 })} USD`;
    }
    return `$${mxnAmount.toLocaleString("es-MX", { maximumFractionDigits: 0 })} MXN`;
  }

  const value = {
    screen,
    setScreen,
    trip,
    setTrip,
    tripDays,
    items,
    addItem,
    removeItem,
    clearItinerary,
    currency,
    setCurrency,
    language,
    setLanguage,
    guestInfo,
    setGuestInfo,
    formatPrice,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
