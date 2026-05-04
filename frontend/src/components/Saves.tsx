import React, { useState, useEffect } from "react";
import type { Page } from "../App";
import { useGameState } from "../hooks/useGameState";
import type { Game } from "../hooks/useGameState";

interface SavesProps {
  onNavigate: (page: Page) => void;
}

const Saves: React.FC<SavesProps> = ({ onNavigate }) => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newGameName, setNewGameName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const {
    loadGameHistory,
    loadUnfinishedGames,
    createGame,
    error,
    setError
  } = useGameState();

  const [allGames, setAllGames] = useState<Game[]>([]);
  const [unfinishedGames, setUnfinishedGames] = useState<Game[]>([]);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    const history = await loadGameHistory();
    const unfinished = await loadUnfinishedGames();
    setAllGames(history);
    setUnfinishedGames(unfinished);
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameName.trim()) return;

    setIsCreating(true);
    try {
      const game = await createGame(newGameName.trim());
      if (game) {
        localStorage.setItem("currentGameId", game.id.toString());
        onNavigate("game");
      }
    } catch (err) {
      console.error("Erreur lors de la création:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleResumeGame = (game: Game) => {
    localStorage.setItem("currentGameId", game.id.toString());
    onNavigate("game");
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressPercentage = (step: number) => {
    return Math.round((step / 3) * 100);
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
            <div className="avatar">🎯</div>
            <span>AGENT</span>
          </div>
          <button className="btn" onClick={() => onNavigate("login")}>
            DÉCONNEXION
          </button>
        </div>
      </nav>

      <div className="saves-content">
        <div className="page-title">ESCAPE GAME - HISTORIQUE</div>
        <div className="page-subtitle">
          {unfinishedGames.length > 0
            ? `// ${unfinishedGames.length} PARTIE(S) EN COURS — ${allGames.length} PARTIE(S) TOTALE(S) //`
            : `// ${allGames.length} PARTIE(S) ARCHIVÉE(S) — CRÉEZ UNE NOUVELLE MISSION //`}
        </div>

        {error && (
          <div className="error-message" style={{
            color: '#ff4444',
            fontSize: '14px',
            marginBottom: '20px',
            textAlign: 'center',
            padding: '10px',
            background: 'rgba(255, 68, 68, 0.1)',
            border: '1px solid #ff4444'
          }}>
            {error}
          </div>
        )}

        {/* Section nouvelle partie */}
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
            <div className="new-game-form">
              <h3>CRÉER UNE NOUVELLE PARTIE</h3>
              <form onSubmit={handleCreateGame}>
                <div className="form-group">
                  <label htmlFor="teamName">NOM D'ÉQUIPE</label>
                  <input
                    id="teamName"
                    type="text"
                    value={newGameName}
                    onChange={(e) => setNewGameName(e.target.value)}
                    placeholder="Entrez le nom de votre équipe"
                    required
                    disabled={isCreating}
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowNewForm(false);
                      setNewGameName("");
                      setError(null);
                    }}
                    disabled={isCreating}
                  >
                    ANNULER
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isCreating || !newGameName.trim()}
                  >
                    {isCreating ? "CRÉATION..." : "CRÉER LA PARTIE"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Parties en cours */}
        {unfinishedGames.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{
              color: 'var(--accent)',
              fontSize: '18px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              // PARTIES EN COURS //
            </h3>
            <div className="saves-grid">
              {unfinishedGames.map((game) => (
                <div
                  key={game.id}
                  className="panel save-card"
                  onClick={() => handleResumeGame(game)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="panel-corner tl"></div>
                  <div className="panel-corner tr"></div>
                  <div className="panel-corner bl"></div>
                  <div className="panel-corner br"></div>

                  <div className="save-badge badge-progress">
                    EN COURS
                  </div>
                  <div className="save-title">{game.teamName.toUpperCase()}</div>
                  <div className="save-meta">
                    ÉTAPE: {game.step}/3 · CRÉÉE: {formatDate(game.createdAt)}
                  </div>

                  <div className="save-progress-bar">
                    <div
                      className="save-progress-fill orange"
                      style={{ width: `${getProgressPercentage(game.step)}%` }}
                    ></div>
                  </div>
                  <div
                    style={{
                      fontFamily: '"Share Tech Mono", monospace',
                      fontSize: "11px",
                      color: "var(--text-dim)",
                      marginBottom: "8px",
                    }}
                  >
                    PROGRESSION: {game.step}/3 ÉNIGMES
                  </div>

                  <div className="save-actions">
                    <button
                      className="btn btn-orange"
                      onClick={() => handleResumeGame(game)}
                    >
                      REPRENDRE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historique complet */}
        {allGames.filter(game => game.isFinished).length > 0 && (
          <div>
            <h3 style={{
              color: 'var(--text-dim)',
              fontSize: '16px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              // HISTORIQUE COMPLET //
            </h3>
            <div className="saves-grid">
              {allGames
                .filter(game => game.isFinished)
                .map((game) => (
                <div
                  key={game.id}
                  className="panel save-card completed"
                >
                  <div className="panel-corner tl"></div>
                  <div className="panel-corner tr"></div>
                  <div className="panel-corner bl"></div>
                  <div className="panel-corner br"></div>

                  <div className="save-badge badge-completed">
                    TERMINÉE
                  </div>
                  <div className="save-title">{game.teamName.toUpperCase()}</div>
                  <div className="save-meta">
                    DURÉE: {game.durationSeconds ? formatDuration(game.durationSeconds) : 'N/A'} · FINIE: {game.finishedAt ? formatDate(game.finishedAt) : 'N/A'}
                  </div>

                  <div className="save-progress-bar">
                    <div
                      className="save-progress-fill green"
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                  <div
                    style={{
                      fontFamily: '"Share Tech Mono", monospace',
                      fontSize: "11px",
                      color: "var(--success)",
                      marginBottom: "8px",
                    }}
                  >
                    MISSION ACCOMPLIE ✓
                  </div>

                  <div className="save-actions">
                    <button
                      className="btn btn-success"
                      onClick={() => {/* TODO: Afficher détails */}}
                    >
                      DÉTAILS
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Saves;

