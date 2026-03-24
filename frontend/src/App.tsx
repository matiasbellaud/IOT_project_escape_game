import React, { useState } from "react";
import Login from "./components/Login";
import Saves from "./components/Saves";
import Game from "./components/Game";
import "./index.css"; // Pensez à y coller tout le contenu de la balise <style> de Maquette.html

export type Page = "login" | "saves" | "game";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>("login");

  // Fonction pour gérer la navigation
  const handleNavigation = (page: Page) => {
    setCurrentPage(page);
  };

  return (
    <div className="app-container">
      {/* Affichage conditionnel selon la page active */}
      {currentPage === "login" && <Login onNavigate={handleNavigation} />}

      {/* À implémenter en découpant le reste du HTML */}
      {currentPage === "saves" && <Saves onNavigate={handleNavigation} />}
      {currentPage === "game" && <Game onNavigate={handleNavigation} />}
    </div>
  );
};

export default App;
