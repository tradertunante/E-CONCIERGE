import NavBar from "./components/NavBar";
import { AppProvider, useApp } from "./context/AppContext";
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
    default:
      return <Home />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-sand-50">
        <NavBar />
        <main>
          <Screens />
        </main>
        <footer className="border-t border-sand-200 bg-white py-8 text-center text-xs text-ocean-700/50">
          Los Cabos Concierge — demo visual. Datos y pagos simulados con fines de presentación.
        </footer>
      </div>
    </AppProvider>
  );
}
