import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Navigation from "@/components/Navigation";
import HomePage from "@/pages/HomePage";
import PlayerProfile from "@/pages/PlayerProfile";
import GameFilm from "@/pages/GameFilm";
import StatsPage from "@/pages/StatsPage";
import AcademicPage from "@/pages/AcademicPage";
import ContactPage from "@/pages/ContactPage";

function App() {
  return (
    <div className="App min-h-screen bg-[#0A0A0A]">
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<PlayerProfile />} />
          <Route path="/film" element={<GameFilm />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/academic" element={<AcademicPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
        <Toaster position="bottom-right" />
      </BrowserRouter>
      <div className="grain-overlay" />
    </div>
  );
}

export default App;
