import React, { useState, useEffect } from "react";
import type { Page } from "../App";

interface SavesProps {
  onNavigate: (page: Page) => void;
}

const Saves: React.FC<SavesProps> = ({ onNavigate }) => {
  const pseudo = localStorage.getItem("pseudo") || "Joueur";
  const [showNewForm, setShowNewForm] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saves, setSaves] = useState<any[]>([]);

  useEffect(() => {
    const storedSaves = localStorage.getItem("escape_saves");
    if (storedSaves) {
      setSaves(JSON.parse(storedSaves));
    }
  }, []);

  const handleCreateSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (saveName.trim()) {
      const newGameData = {
        id: Date.now().toString(), // ID unique généré
        name: saveName.trim(),
        pseudo: pseudo,
        startTime: new Date().toISOString(),
        currentStep: 1,
        timerSeconds: 42 * 60 + 17,
        penalties: 0,
        logs: [{ time: "42:17", msg: "Session démarrée" }],
        isCompleted: false,
      };

      const updatedSaves = [...saves, newGameData];
      setSaves(updatedSaves);
      localStorage.setItem("escape_saves", JSON.stringify(updatedSaves));
      localStorage.setItem("currentSaveId", newGameData.id);
      onNavigate("game");
    }
  };

  const handleResumeSave = (id: string) => {
    localStorage.setItem("currentSaveId", id);
    onNavigate("game");
  };

  const handleDeleteSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedSaves = saves.filter((s) => s.id !== id);
    setSaves(updatedSaves);
    localStorage.setItem("escape_saves", JSON.stringify(updatedSaves));
  };

  return (
    <div id="saves" className="page active" style={{ padding: 0 }}>
      <nav>
        <div className="nav-logo">
          CIPHER<span>ROOM</span>
        </div>
        <div className="nav-right">
          <span>SESSION ACTIVE</span>
          <div className="nav-user">
            <div className="avatar">{pseudo.charAt(0).toUpperCase()}</div>
            <span>{pseudo}</span>
          </div>
          <button className="btn" onClick={() => onNavigate("login")}>
            DÉCONNEXION
          </button>
        </div>
      </nav>

      <div className="saves-content">
        <div className="page-title">MES SAUVEGARDES</div>
        <div className="page-subtitle">
          {saves.length > 0
            ? `// ${saves.length} SESSION(S) TROUVÉE(S) — CHOISISSEZ VOTRE MISSION //`
            : "// AUCUNE SESSION TROUVÉE — DÉMARREZ UNE NOUVELLE MISSION //"}
        </div>

        {saves.length > 0 && (
          <div className="saves-grid">
            {saves.map((save) => (
              <div
                key={save.id}
                className={`panel save-card ${save.isCompleted ? "completed" : ""}`}
                onClick={() => !save.isCompleted && handleResumeSave(save.id)}
              >
                <div className="panel-corner tl"></div>
                <div className="panel-corner tr"></div>
                <div className="panel-corner bl"></div>
                <div className="panel-corner br"></div>

                <div
                  className={`save-badge ${save.isCompleted ? "badge-completed" : "badge-progress"}`}
                >
                  {save.isCompleted ? "TERMINÉE" : "EN COURS"}
                </div>
                <div className="save-title">{save.name.toUpperCase()}</div>
                <div className="save-meta">
                  JOUEUR: {save.pseudo} · TEMPS REQUIS:{" "}
                  {Math.floor((42 * 60 + 17 - save.timerSeconds) / 60)} MIN
                </div>

                <div className="save-progress-bar">
                  <div
                    className={`save-progress-fill ${save.isCompleted ? "green" : "orange"}`}
                    style={{ width: `${(save.currentStep / 3) * 100}%` }}
                  ></div>
                </div>
                <div
                  style={{
                    fontFamily: '"Share Tech Mono", monospace',
                    fontSize: "11px",
                    color: save.isCompleted
                      ? "var(--success)"
                      : "var(--text-dim)",
                    marginBottom: "8px",
                  }}
                >
                  PROGRESSION: {save.currentStep}/3 ÉNIGMES{" "}
                  {save.isCompleted && "✓"}
                </div>

                <div className="save-actions">
                  {!save.isCompleted ? (
                    <button
                      className="btn btn-orange"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResumeSave(save.id);
                      }}
                    >
                      REPRENDRE
                    </button>
                  ) : (
                    <button
                      className="btn btn-success"
                      onClick={(e) => e.stopPropagation()}
                    >
                      VOIR RÉSULTATS
                    </button>
                  )}
                  <button
                    className="btn btn-danger"
                    onClick={(e) => handleDeleteSave(save.id, e)}
                  >
                    SUPPRIMER
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="new-game-section">
          {!showNewForm ? (
            <>
              <div className="new-game-info">
                <h3>NOUVELLE PARTIE</h3>
                <p style={{ color: "var(--text-dim)", fontSize: "13px" }}>
                  Commencer une mission fraîche avec un nouveau code salle
                </p>
              </div>
              <button
                className="btn btn-lg btn-orange"
                onClick={() => setShowNewForm(true)}
              >
                ＋ NOUVELLE PARTIE
              </button>
            </>
          ) : (
            <form
              className="panel"
              style={{ width: "100%", padding: "20px" }}
              onSubmit={handleCreateSave}
            >
              <div className="panel-corner tl"></div>
              <div className="panel-corner tr"></div>
              <div className="panel-corner bl"></div>
              <div className="panel-corner br"></div>

              <div className="field-group">
                <label className="field-label">Nom de la sauvegarde</label>
                <input
                  className="field-input"
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Ex: Opération Alpha"
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button type="submit" className="btn btn-orange">
                  DÉMARRER
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowNewForm(false)}
                >
                  ANNULER
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Saves;
