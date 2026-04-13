import React, { useState } from "react";
import type { Page } from "../App";

interface LoginProps {
  onNavigate: (page: Page) => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const [pseudo, setPseudo] = useState("");

  const handleEnterGame = (e: React.FormEvent) => {
    e.preventDefault();

    if (pseudo.trim()) {
      localStorage.setItem("pseudo", pseudo.trim());
      onNavigate("saves");
    }
  };

  return (
    <div id="login" className="page active">
      <div className="login-wrapper">
        <div className="login-header">
          <div className="login-logo">
            CIPHER<span>ROOM</span>
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
            <label className="field-label">Pseudo</label>
            <input
              className="field-input"
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder="Entrez votre pseudo"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-lg"
            style={{ width: "100%", clipPath: "none", textAlign: "center" }}
          >
            ENTRER DANS LE JEU
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
