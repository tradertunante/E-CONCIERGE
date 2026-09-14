import NavBar from "./components/NavBar";
import { AppProvider, useApp } from "./context/AppContext";
import { CatalogProvider } from "./context/CatalogContext";
import Admin from "./screens/Admin";
import Catalog from "./screens/Catalog";
import Checkout from "./screens/Checkout";
import Confirmation from "./screens/Confirmation";
import Home from "./screens/Home";
import Itinerary from "./screens/Itinerary";

function Screens() {
  const { screen } = useApp();
  switch (screen) {
    case "catalog":
      return <Catalog />;
    case "itinerary":
      return <Itinerary />;
    case "checkout":
      return <Checkout />;
    case "confirmation":
      return <Confirmation />;
    case "admin":
      return <Admin />;
    default:
      return <Home />;
  }
}

function Chrome() {
  const { screen, setScreen } = useApp();
  const isAdmin = screen === "admin";

  return (
    <div className="min-h-screen bg-sand-50">
      {!isAdmin && <NavBar />}
      <main>
        <Screens />
      </main>
      <footer className="border-t border-sand-200 bg-white py-8 text-center text-xs text-ocean-700/50">
        Los Cabos Concierge — demo visual. Datos y pagos simulados con fines de presentación.
        {!isAdmin && (
          <>
            {" · "}
            <button onClick={() => setScreen("admin")} className="underline hover:text-ocean-700">
              Panel de operaciones
            </button>
          </>
        )}
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <CatalogProvider>
        <Chrome />
      </CatalogProvider>
    </AppProvider>
  );
}
