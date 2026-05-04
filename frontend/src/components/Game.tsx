import React, { useState, useEffect } from "react";
import type { Page } from "../App";
import { apiService } from "../services/api";
import { io } from "socket.io-client";

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
    const currentId = localStorage.getItem("currentGameId");
    const storedSaves = localStorage.getItem("escape_saves");
    if (currentId && storedSaves) {
      const parsedSaves = JSON.parse(storedSaves);
      const save = parsedSaves.find((s: any) => s.id.toString() === currentId);
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
  // Énigme 1 (Température DHT11)
  const initialTempSequence = [22, 25, 27, 30];
  const [temp, setTemp] = useState(initialTempSequence[0]);
  const [hum, setHum] = useState(65);
  const [step1Done, setStep1Done] = useState(false);
  const [tempIndex, setTempIndex] = useState(0);

  // Énigme 2 (LDR lumière)
  const lightSequence = [820, 450, 95, 12];
  const [lux, setLux] = useState(lightSequence[0]);
  const [step2Done, setStep2Done] = useState(false);
  const [lightIndex, setLightIndex] = useState(0);

  // Énigme 3 (Code)
  const [code, setCode] = useState<string[]>([]);
  const [codeError, setCodeError] = useState(false);
  const [codeHint, setCodeHint] = useState("Entrez le code à 4 chiffres.");
  const [step3Done, setStep3Done] = useState(false);
  const SECRET_CODE = "4327";

  const [socketConnected, setSocketConnected] = useState(false);
  const [iotEvent, setIotEvent] = useState<string | null>(null);

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

  const TEMPERATURE_SEQUENCE = [22, 25, 27, 30];
  const LDR_SEQUENCE = [820, 450, 95, 12];

  const sendSensorPayload = async (payload: {
    device: string;
    temperature: number;
    humidity: number;
    luminosity: number;
    keypad: string;
  }) => {
    try {
      const result = await apiService.sendSensorPayload(payload);
      setIotEvent(result.message);
      addLog(`Payload envoyé (${payload.device})`);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Erreur envoi payload";
      setIotEvent(errMsg);
      addLog(`Erreur d'envoi payload: ${errMsg}`);
    }
  };

  const handleSendTemp = async () => {
    if (step1Done) return;
    const nextIndex = Math.min(tempIndex + 1, TEMPERATURE_SEQUENCE.length - 1);
    const nextTemp = TEMPERATURE_SEQUENCE[nextIndex];
    const nextHum = Math.max(35, 70 - (nextTemp - TEMPERATURE_SEQUENCE[0]) * 2);

    setTemp(nextTemp);
    setHum(nextHum);
    setTempIndex(nextIndex);

    await sendSensorPayload({
      device: "DHT11",
      temperature: nextTemp,
      humidity: nextHum,
      luminosity: lux,
      keypad: "",
    });
  };

  const handleSendLight = async () => {
    if (step2Done) return;
    const nextIndex = Math.min(lightIndex + 1, LDR_SEQUENCE.length - 1);
    const nextLux = LDR_SEQUENCE[nextIndex];

    setLux(nextLux);
    setLightIndex(nextIndex);

    await sendSensorPayload({
      device: "LDR",
      temperature: temp,
      humidity: hum,
      luminosity: nextLux,
      keypad: "",
    });
  };

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
      setStep3Done(true);
      addLog("Code correct — coffre-fort déverrouillé");
      setShowFinal(true);
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

  useEffect(() => {
    if (!gameData) return;

    const socket = io("http://localhost:3001", { transports: ["websocket"] });

    socket.on("connect", () => {
      setSocketConnected(true);
      addLog("WebSocket connecté au back-end");
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
      setIotEvent("WebSocket déconnecté");
      addLog("WebSocket déconnecté");
    });

    socket.on("game_state_init", (data: { currentStep: number }) => {
      setCurrentStep(data.currentStep ?? 1);
      addLog(`État initial reçu : étape ${data.currentStep}`);
    });

    socket.on(
      "iot_update",
      (data: { currentStep: number; stepSolved: boolean; payload: any; isCompleted?: boolean }) => {
        const payload = data.payload;
        if (payload) {
          if (typeof payload.temperature === "number") setTemp(payload.temperature);
          if (typeof payload.humidity === "number") setHum(payload.humidity);
          if (typeof payload.luminosity === "number") setLux(payload.luminosity);
        }

        setCurrentStep(data.currentStep ?? 1);
        setIotEvent(data.stepSolved ? "Étape résolue côté back-end" : "Mesure reçue côté back-end");
        addLog(`Mise à jour IoT reçue : étape ${data.currentStep}`);
        if (data.stepSolved && data.currentStep === 2) {
          setStep1Done(true);
        }
        if (data.stepSolved && data.currentStep === 3) {
          if (data.isCompleted) {
            setStep3Done(true);
            setShowFinal(true);
          } else {
            setStep2Done(true);
          }
        }
        if (data.isCompleted) {
          setShowFinal(true);
        }
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [gameData]);

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
          MATMAX<span>SCAPE</span>
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
            <div className="step-name">Capteur LDR</div>
            <div className="step-sensor">LUMINOSITÉ</div>
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
            <div className="step-name">Code Secret</div>
            <div className="step-sensor">CRYPTAGE</div>
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
              <div className="enigma-title">LE SOUFFLE DU SPHINX</div>

              <div className="sensor-display">
                <div className="panel sensor-card">
                  <div className="panel-corner tl"></div>
                  <div className="panel-corner tr"></div>
                  <div className="panel-corner bl"></div>
                  <div className="panel-corner br"></div>
                  <span className="sensor-icon">🌡️</span>
                  <div>
                    <span className="sensor-value">{temp}</span>
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
                <strong>« Je ne m'ouvre qu'à la chaleur du vivant.</strong>
              </div>

              <div
                style={{
                  marginTop: "12px",
                  fontSize: "12px",
                  color: socketConnected ? "#7cfc00" : "#ff6b6b",
                }}
              >
                WebSocket {socketConnected ? "connecté" : "déconnecté"} — {iotEvent || "en attente de retour"}
              </div>

              {step1Done && (
                <div className="step-success show" style={{ marginTop: "20px" }}>
                  <div className="success-icon">🔥</div>
                  <div className="success-title">TEMPÉRATURE ATTEINTE</div>
                  <div className="success-text">
                    Le backend a validé la mesure. Le mécanisme commence à céder.
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
              <div className="enigma-tag">// ÉNIGME 02 — CAPTEUR LDR</div>
              <div className="enigma-title">L'ŒIL DE LA NUIT</div>

              <div className="sensor-display">
                <div className="panel sensor-card">
                  <div className="panel-corner tl"></div>
                  <div className="panel-corner tr"></div>
                  <div className="panel-corner bl"></div>
                  <div className="panel-corner br"></div>
                  <span className="sensor-icon">🌙</span>
                  <div>
                    <span className="sensor-value">{lux}</span>
                    <span className="sensor-unit">lux</span>
                  </div>
                  <div className="sensor-label">LUMINOSITÉ</div>
                </div>
              </div>

              <div className="enigma-riddle">
                <strong>« Je suis aveugle quand la lumière est trop forte.</strong>
              </div>

              {step2Done && (
                <div className="step-success show" style={{ marginTop: "20px" }}>
                  <div className="success-icon">🌑</div>
                  <div className="success-title">OBSCURITÉ TOTALE</div>
                  <div className="success-text">
                    Le backend a validé la mesure. Le passage est prêt.
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
              <div className="enigma-tag">// ÉNIGME 03 — CODE SECRET</div>
              <div className="enigma-title">LE COFFRE-FORT DU CRYPTOGRAPHE</div>

              <div className="enigma-riddle">
                <strong>1.</strong> Le premier chiffre est le double du troisième.
                <br />
                <strong>2.</strong> Le deuxième chiffre = le nombre de voyelles dans « MYSTÈRE ».
                <br />
                <strong>3.</strong> Le troisième chiffre = le plus petit nombre premier.
                <br />
                <strong>4.</strong> Le quatrième chiffre = la somme des deux premiers chiffres.
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label className="field-label">ENTREZ LE CODE — 4 CHIFFRES</label>
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

              {step3Done && (
                <div className="step-success show" style={{ marginTop: "20px" }}>
                  <div className="success-icon">💥</div>
                  <div className="success-title">CODE CORRECT — COFFRE-FORT OUVERT</div>
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
