import React, { useState } from "react";
import type { Page } from "../App";
import { useGameState } from "../hooks/useGameState";

interface LoginProps {
  onNavigate: (page: Page) => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const [teamName, setTeamName] = useState("");
  const { createGame, isLoading, error } = useGameState();

  const handleEnterGame = async (e: React.FormEvent) => {
    e.preventDefault();

    if (teamName.trim()) {
      const game = await createGame(teamName.trim());
      if (game) {
        localStorage.setItem("currentGameId", game.id.toString());
        onNavigate("game");
      }
    }
  };

  return (
    <div id="login" className="page active">
      <div className="login-wrapper">
        <div className="login-header">
          <div className="login-logo">
            MATMAX<span>SCAPE</span>
          </div>
          <div className="login-sub">// SYSTÈME D'ACCÈS SÉCURISÉ //</div>
          <div className="decor-line"></div>
        </div>

        <form className="panel login-panel" onSubmit={handleEnterGame}>
          <div className="panel-corner tl"></div>
          <div className="panel-corner tr"></div>
          <div className="panel-corner bl"></div>
          <div className="panel-corner br"></div>

          <div className="field-group">
            <label className="field-label">Nom de l'équipe</label>
            <input
              className="field-input"
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Entrez le nom de votre équipe"
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="error-message" style={{
              color: '#ff4444',
              fontSize: '14px',
              marginBottom: '10px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-lg"
            style={{
              width: "100%",
              clipPath: "none",
              textAlign: "center",
              opacity: isLoading ? 0.6 : 1
            }}
            disabled={isLoading}
          >
            {isLoading ? "CRÉATION DE LA PARTIE..." : "COMMENCER L'ESCAPE GAME"}
          </button>

          <div className="status-bar">
            <div className="status-dot"></div>
            <span>SERVEUR EN LIGNE</span>
            <span style={{ marginLeft: "auto" }}>PROTOCOLE: AES-256</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
