import React, { useState, useEffect } from "react";
import type { Page } from "../App";

interface GameProps {
  onNavigate: (page: Page) => void;
}

const Game: React.FC<GameProps> = ({ onNavigate }) => {
  const [gameData, setGameData] = useState<any>(null);

  // --- ÉTATS GLOBAUX DU JEU ---
  const [currentStep, setCurrentStep] = useState(1);
  const [timerSeconds, setTimerSeconds] = useState(42 * 60 + 17);
  const [penalties, setPenalties] = useState(0);
  const [showFinal, setShowFinal] = useState(false);
  const [logs, setLogs] = useState<{ time: string; msg: string }[]>([]);

  useEffect(() => {
    const currentId = localStorage.getItem("currentSaveId");
    const storedSaves = localStorage.getItem("escape_saves");
    if (currentId && storedSaves) {
      const parsedSaves = JSON.parse(storedSaves);
      const save = parsedSaves.find((s: any) => s.id === currentId);
      if (save) {
        setGameData(save);
        setCurrentStep(save.currentStep || 1);
        setTimerSeconds(save.timerSeconds ?? 42 * 60 + 17);
        setPenalties(save.penalties || 0);
        setLogs(save.logs || [{ time: "42:17", msg: "Session démarrée" }]);
        if (save.isCompleted) {
          setShowFinal(true);
        }
        return;
      }
    }
    onNavigate("saves");
  }, [onNavigate]);

  // --- ÉTATS DES ÉNIGMES ---
  // Énigme 1 (Temp/Hum)
  const [temp, setTemp] = useState(8);
  const [hum, setHum] = useState(87);
  const [step1Done, setStep1Done] = useState(false);

  // Énigme 2 (Code)
  const [code, setCode] = useState<string[]>([]);
  const [codeError, setCodeError] = useState(false);
  const [codeHint, setCodeHint] = useState(
    "(Indice : 4 = année de fondation ÷ 500 = 2 · fenêtres dans la pièce = 0 · ...)",
  );
  const [step2Done, setStep2Done] = useState(false);
  const SECRET_CODE = "2022";

  // Énigme 3 (Lumière)
  const [lux, setLux] = useState(247);
  const [targetRevealed, setTargetRevealed] = useState(false);
  const [step3Done, setStep3Done] = useState(false);
  const TARGET_LUX = 300;

  // --- GESTION DU MINUTEUR ---
  useEffect(() => {
    if (showFinal) return; // Stoppe le minuteur si fini
    const interval = setInterval(() => {
      setTimerSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [showFinal]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // --- HELPER : AJOUTER UN LOG ---
  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, { time: formatTime(timerSeconds), msg }]);
  };

  // --- ACTIONS ÉNIGME 1 ---
  const handleTempChange = (newTemp: number) => {
    setTemp(newTemp);
    setHum(Math.min(99, Math.max(40, Math.round(87 + (8 - newTemp) * 0.8))));
    if (newTemp <= 2 && !step1Done) {
      setStep1Done(true);
      addLog("Seuil de température atteint !");
    }
  };

  // --- ACTIONS ÉNIGME 2 ---
  const typeDigit = (digit: string) => {
    if (code.length < 4) setCode([...code, digit]);
  };
  const deleteDigit = () => {
    setCode(code.slice(0, -1));
  };
  const validateCode = () => {
    if (code.length < 4) {
      setCodeHint("⚠ Entrez 4 chiffres complets.");
      return;
    }
    if (code.join("") === SECRET_CODE) {
      setStep2Done(true);
      addLog("Code correct — terminal déverrouillé");
    } else {
      setPenalties((p) => p + 50);
      setCodeError(true);
      setCodeHint("✗ Code incorrect. Réessayez. (−50 pts)");
      addLog(`Code incorrect (−50 pts)`);
      setTimeout(() => {
        setCodeError(false);
        setCode([]);
      }, 400);
    }
  };

  // --- ACTIONS ÉNIGME 3 ---
  const handleLightChange = (newLux: number) => {
    setLux(newLux);
    if (Math.abs(newLux - TARGET_LUX) <= 15 && !step3Done) {
      setStep3Done(true);
      addLog("Calibration lumineuse réussie !");
    }
  };
  const revealTarget = () => {
    setTargetRevealed(true);
    setPenalties((p) => p + 5);
    addLog("Valeur cible révélée (−5 pts)");
  };

  // --- SCORES ---
  const speedBonus = Math.floor(timerSeconds / 6);
  const totalScore = 1000 + speedBonus - penalties;

  const handleSaveAndQuit = (isCompleted = false) => {
    if (!gameData) return;
    const storedSaves = localStorage.getItem("escape_saves");
    if (storedSaves) {
      let parsedSaves = JSON.parse(storedSaves);
      parsedSaves = parsedSaves.map((s: any) => {
        if (s.id === gameData.id) {
          return {
            ...s,
            currentStep,
            timerSeconds,
            penalties,
            logs,
            isCompleted,
          };
        }
        return s;
      });
      localStorage.setItem("escape_saves", JSON.stringify(parsedSaves));
    }
    onNavigate("saves");
  };

  if (!gameData) return null; // Attente du chargement

  return (
    <div id="game" className="page active" style={{ padding: 0 }}>
      <nav>
        <div className="nav-logo">
          CIPHER<span>ROOM</span>
        </div>
        <div className="nav-right">
          <span style={{ color: "var(--accent2)" }}>
            {gameData.name.toUpperCase()}
          </span>
          <div className="nav-user" style={{ marginLeft: "15px" }}>
            <div className="avatar">
              {gameData.pseudo.charAt(0).toUpperCase()}
            </div>
            <span>{gameData.pseudo}</span>
          </div>
          <button className="btn" onClick={() => handleSaveAndQuit(false)}>
            SAUVEGARDER & QUITTER
          </button>
        </div>
      </nav>

      {/* En-tête du jeu */}
      <div className="game-header">
        <div>
          <div className="mission-id">MISSION // CR-2026-0342</div>
          <div className="mission-title">LA CHAMBRE FROIDE</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="timer-label">TEMPS RESTANT</div>
          <div className="timer-display">{formatTime(timerSeconds)}</div>
        </div>
      </div>

      {/* Progression */}
      <div className="step-progress">
        <div
          className={`step-node ${currentStep > 1 ? "done" : ""} ${currentStep === 1 ? "active" : ""}`}
        >
          <div className="step-circle">01</div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: "8px",
            }}
          >
            <div className="step-name">Capteur DHT11</div>
            <div className="step-sensor">TEMP + HUMIDITÉ</div>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            height: "1px",
            background: currentStep > 1 ? "var(--success)" : "var(--border)",
            margin: "0 20px",
          }}
        ></div>

        <div
          className={`step-node ${currentStep > 2 ? "done" : ""} ${currentStep === 2 ? "active" : ""}`}
        >
          <div className="step-circle">02</div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: "8px",
            }}
          >
            <div className="step-name">Code Secret</div>
            <div className="step-sensor">SAISIE NUMÉRIQUE</div>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            height: "1px",
            background: currentStep > 2 ? "var(--success)" : "var(--border)",
            margin: "0 20px",
          }}
        ></div>

        <div className={`step-node ${currentStep === 3 ? "active" : ""}`}>
          <div className="step-circle">03</div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: "8px",
            }}
          >
            <div className="step-name">Capteur Lumineux</div>
            <div className="step-sensor">PHOTORÉSISTANCE</div>
          </div>
        </div>
      </div>

      {/* Corps du jeu */}
      <div className="game-body">
        <div className="game-main">
          {/* ÉNIGME 1 */}
          {currentStep === 1 && (
            <div className="enigma active">
              <div className="enigma-tag">// ÉNIGME 01 — CAPTEUR DHT11</div>
              <div className="enigma-title">LA TEMPÉRATURE DE L'OMBRE</div>
              <div className="enigma-desc">
                Le capteur DHT11 surveille l'environnement en temps réel.
                Analysez les données — la température anormalement basse indique
                que quelque chose se cache ici.
              </div>

              <div className="sensor-display">
                <div className="panel sensor-card">
                  <div className="panel-corner tl"></div>
                  <div className="panel-corner tr"></div>
                  <div className="panel-corner bl"></div>
                  <div className="panel-corner br"></div>
                  <span className="sensor-icon">🌡️</span>
                  <div>
                    <span
                      className={`sensor-value ${temp < 10 ? "warning" : ""}`}
                    >
                      {temp.toFixed(1)}
                    </span>
                    <span className="sensor-unit">°C</span>
                  </div>
                  <div className="sensor-label">TEMPÉRATURE</div>
                </div>
                <div className="panel sensor-card">
                  <div className="panel-corner tl"></div>
                  <div className="panel-corner tr"></div>
                  <div className="panel-corner bl"></div>
                  <div className="panel-corner br"></div>
                  <span className="sensor-icon">💧</span>
                  <div>
                    <span className="sensor-value">{hum}</span>
                    <span className="sensor-unit">%</span>
                  </div>
                  <div className="sensor-label">HUMIDITÉ</div>
                </div>
              </div>

              <div className="enigma-riddle">
                <strong>« Là où la glace naît dans l'obscurité,</strong> là où
                l'air pleure à 87%, le seuil critique se cache entre le gel et
                le zéro. Descendez sous les <strong>10 degrés</strong> et
                l'ombre vous révélera son secret. »
              </div>

              <label className="field-label">
                SIMULER DÉPLACEMENT DU CAPTEUR:
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <span className="slider-label">25°C</span>
                <input
                  type="range"
                  min="1"
                  max="25"
                  step="0.5"
                  value={temp}
                  onChange={(e) => handleTempChange(parseFloat(e.target.value))}
                />
                <span className="slider-label">1°C</span>
              </div>

              {step1Done && (
                <div className="step-success show">
                  <div className="success-icon">❄️</div>
                  <div className="success-title">
                    SEUIL ATTEINT — VERROU OUVERT
                  </div>
                  <div className="success-text">
                    La température a atteint le point critique. La chambre
                    froide révèle son secret...
                  </div>
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      setCurrentStep(2);
                      addLog("Énigme 2 activée");
                    }}
                  >
                    PASSER À L'ÉNIGME SUIVANTE →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ÉNIGME 2 */}
          {currentStep === 2 && (
            <div className="enigma active">
              <div className="enigma-tag">// ÉNIGME 02 — CODE SECRET</div>
              <div className="enigma-title">LE MOT DE PASSE OUBLIÉ</div>
              <div className="enigma-desc">
                Un terminal verrouillé à 4 chiffres. Utilisez les notes trouvées
                pour reconstituer le code d'accès.
              </div>

              <div className="enigma-riddle">
                <strong>Note 1:</strong> "Le premier chiffre est l'année de
                création divisée par 500..."
                <br />
                <strong>Note 2:</strong> "Le deuxième ? Regardez le nombre de
                fenêtres dans cette pièce."
                <br />
                <strong>Note 3:</strong> "Troisième chiffre = premier +
                deuxième."
                <br />
                <strong>Note 4:</strong> "Le dernier chiffre est le premier à
                l'envers."
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label className="field-label">
                  ENTREZ LE CODE — 4 CHIFFRES
                </label>
                <div className="code-digits">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`digit-box ${code.length === i ? "active" : ""} ${codeError ? "error" : ""}`}
                    >
                      {code[i] || "_"}
                    </div>
                  ))}
                </div>
              </div>

              <div className="numpad">
                {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((num) => (
                  <div
                    key={num}
                    className="numpad-btn"
                    onClick={() => typeDigit(num)}
                  >
                    {num}
                  </div>
                ))}
                <div
                  className="numpad-btn"
                  style={{ gridColumn: 2 }}
                  onClick={() => typeDigit("0")}
                >
                  0
                </div>
                <div
                  className="numpad-btn"
                  style={{ color: "var(--danger)" }}
                  onClick={deleteDigit}
                >
                  ⌫
                </div>
              </div>

              <button className="btn btn-orange" onClick={validateCode}>
                VALIDER LE CODE
              </button>
              <div
                style={{
                  fontFamily: '"Share Tech Mono", monospace',
                  fontSize: "12px",
                  color: "var(--text-dim)",
                  marginTop: "10px",
                }}
              >
                {codeHint}
              </div>

              {step2Done && (
                <div
                  className="step-success show"
                  style={{ marginTop: "20px" }}
                >
                  <div className="success-icon">🔓</div>
                  <div className="success-title">
                    CODE CORRECT — ACCÈS ACCORDÉ
                  </div>
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      setCurrentStep(3);
                      addLog("Énigme 3 activée");
                    }}
                  >
                    PASSER À L'ÉNIGME SUIVANTE →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ÉNIGME 3 */}
          {currentStep === 3 && (
            <div className="enigma active">
              <div className="enigma-tag">// ÉNIGME 03 — CAPTEUR LUMINEUX</div>
              <div className="enigma-title">LA LUMIÈRE DE LA VÉRITÉ</div>

              <div className="enigma-riddle">
                <strong>« Ni aveugle ni ébloui,</strong> la vérité se cache dans
                la pénombre exacte. Cherchez le nombre de{" "}
                <strong>planètes visibles à l'œil nu</strong>, multipliez par la{" "}
                <strong>vitesse de la lumière en millions</strong>. »
              </div>

              <div className="light-big">
                <span>{lux}</span>
                <span style={{ fontSize: "24px", color: "var(--text-dim)" }}>
                  {" "}
                  lux
                </span>
              </div>

              <div className="light-target">
                VALEUR CIBLE:{" "}
                <strong>{targetRevealed ? TARGET_LUX : "???"}</strong> lux
                &nbsp;|&nbsp; TOLÉRANCE: ±15 lux
              </div>

              <div className="light-meter">
                <div
                  className="light-fill"
                  style={{ width: `${lux / 10}%` }}
                ></div>
              </div>
              <div className="light-value-row">
                <span>0 lux</span>
                <span>{(lux / 10).toFixed(1)}%</span>
                <span>1000 lux</span>
              </div>

              <div className="light-slider-wrap">
                <span
                  className="slider-label"
                  style={{ width: "50px", fontSize: "10px" }}
                >
                  OBTUREZ
                </span>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={lux}
                  onChange={(e) => handleLightChange(parseInt(e.target.value))}
                />
                <span
                  className="slider-label"
                  style={{ width: "50px", fontSize: "10px" }}
                >
                  ÉCLAIREZ
                </span>
              </div>

              <button
                className="btn btn-orange"
                onClick={revealTarget}
                disabled={targetRevealed}
              >
                {targetRevealed
                  ? "✓ Valeur révélée"
                  : "🔍 RÉVÉLER LA VALEUR CIBLE (−5 pts)"}
              </button>

              {step3Done && (
                <div
                  className="step-success show"
                  style={{ marginTop: "20px" }}
                >
                  <div className="success-icon">💡</div>
                  <div className="success-title">CALIBRATION PARFAITE</div>
                  <button
                    className="btn btn-success"
                    onClick={() => setShowFinal(true)}
                  >
                    VOIR LES RÉSULTATS FINAUX 🏆
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SIDEBAR D'INFORMATIONS */}
        <div className="game-sidebar">
          <div className="panel sidebar-panel">
            <div className="panel-corner tl"></div>
            <div className="panel-corner tr"></div>
            <div className="panel-corner bl"></div>
            <div className="panel-corner br"></div>
            <div className="sidebar-title">INDICES DISPONIBLES</div>
            <div className="hint-item">
              <span className="hint-num">[01]</span>
              <span>
                Le capteur DHT11 ne peut pas mesurer en dessous de 0°C.
              </span>
            </div>
            <div className="hint-item">
              <span className="hint-num">[02]</span>
              <span>
                L'année de fondation du bâtiment est gravée sur la plaque
                d'entrée.
              </span>
            </div>
            <div
              className="hint-locked"
              onClick={() => {
                setPenalties((p) => p + 10);
                alert(
                  "Indice : La solution est toujours plus simple qu'elle n'y paraît...",
                );
                addLog("Indice utilisé (-10 pts)");
              }}
            >
              🔒 DÉBLOQUER INDICE <span className="hint-cost">(−10 pts)</span>
            </div>
          </div>

          <div className="panel sidebar-panel">
            <div className="panel-corner tl"></div>
            <div className="panel-corner tr"></div>
            <div className="panel-corner bl"></div>
            <div className="panel-corner br"></div>
            <div className="sidebar-title">SCORE EN COURS</div>
            <div className="score-row">
              <span className="score-label">Points de base</span>
              <span className="score-value">1000</span>
            </div>
            <div className="score-row">
              <span className="score-label">Bonus rapidité</span>
              <span className="score-value">+{speedBonus}</span>
            </div>
            <div className="score-row">
              <span className="score-label">Pénalités</span>
              <span className="score-value" style={{ color: "var(--danger)" }}>
                −{penalties}
              </span>
            </div>
            <div
              className="score-row"
              style={{ border: "none", marginTop: "4px" }}
            >
              <span className="score-label" style={{ color: "var(--text)" }}>
                TOTAL
              </span>
              <span
                className="score-value"
                style={{ fontSize: "18px", color: "var(--success)" }}
              >
                {totalScore}
              </span>
            </div>
          </div>

          <div className="panel sidebar-panel">
            <div className="panel-corner tl"></div>
            <div className="panel-corner tr"></div>
            <div className="panel-corner bl"></div>
            <div className="panel-corner br"></div>
            <div className="sidebar-title">JOURNAL D'ACTIVITÉ</div>
            <div style={{ maxHeight: "150px", overflowY: "auto" }}>
              {logs.map((log, idx) => (
                <div key={idx} className="log-entry">
                  <span className="log-time">{log.time}</span>
                  <span>{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* OVERLAY DE FIN DE JEU */}
      {showFinal && (
        <div className="final-success show">
          <div className="final-title">ÉCHAPPÉ !</div>
          <div className="final-sub">
            // FÉLICITATIONS, AGENT_042 — MISSION ACCOMPLIE //
          </div>
          <div
            className="panel"
            style={{
              padding: "32px",
              maxWidth: "480px",
              width: "100%",
              textAlign: "left",
              marginBottom: "32px",
            }}
          >
            <div className="panel-corner tl"></div>
            <div className="panel-corner tr"></div>
            <div className="panel-corner bl"></div>
            <div className="panel-corner br"></div>
            <div
              style={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: "20px",
                letterSpacing: "3px",
                marginBottom: "20px",
                color: "var(--accent)",
              }}
            >
              RAPPORT DE MISSION
            </div>
            <div className="score-row">
              <span className="score-label">Temps total</span>
              <span className="score-value">
                {formatTime(42 * 60 + 17 - timerSeconds)}
              </span>
            </div>
            <div className="score-row">
              <span className="score-label">Score final</span>
              <span
                className="score-value"
                style={{ color: "var(--success)", fontSize: "22px" }}
              >
                {totalScore} pts
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            <button
              className="btn btn-success btn-lg"
              onClick={() => handleSaveAndQuit(true)}
            >
              RETOUR AUX SAUVEGARDES
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
