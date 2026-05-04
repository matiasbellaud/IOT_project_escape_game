import express, { Request, Response } from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import {
  addSensorPayload,
  completeGame,
  createGame,
  getGame,
  listGames,
  listSensorPayloads,
  listUnfinishedGames,
  updateGame,
} from "./db";

const app = express();
const PORT = process.env.PORT || 3001;
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: "*" },
});

const TEMPERATURE_THRESHOLD = 30;
const LIGHT_THRESHOLD = 50;
const SECRET_CODE = "4327";

// Middlewares
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ success: true, status: "ok" });
});

// --- ROUTES GAME ---

app.post("/api/game/create", async (req: Request, res: Response) => {
  try {
    const teamName = String(req.body.teamName ?? "").trim();
    if (!teamName) {
      return res.status(400).json({ success: false, message: "Le nom de l'équipe est requis." });
    }

    const game = await createGame(teamName);
    res.status(201).json({ success: true, game });
  } catch (error) {
    console.error("Erreur création partie:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

app.get("/api/game/history", async (_req: Request, res: Response) => {
  try {
    const games = await listGames();
    res.json(games);
  } catch (error) {
    console.error("Erreur récupération historique:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

app.get("/api/game/unfinished", async (_req: Request, res: Response) => {
  try {
    const games = await listUnfinishedGames();
    res.json(games);
  } catch (error) {
    console.error("Erreur récupération parties non terminées:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

app.get("/api/game/:id", async (req: Request, res: Response) => {
  try {
    const gameId = Number(req.params.id);
    const game = await getGame(gameId);
    if (!game) {
      return res.status(404).json({ success: false, message: "Partie introuvable." });
    }
    res.json(game);
  } catch (error) {
    console.error("Erreur récupération partie:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

app.patch("/api/game/:id", async (req: Request, res: Response) => {
  try {
    const gameId = Number(req.params.id);
    const { step, remainingSeconds, isFinished, durationSeconds } = req.body;

    if (!Number.isInteger(gameId) || gameId <= 0) {
      return res.status(400).json({ success: false, message: "Identifiant de partie invalide." });
    }

    const updatePayload: {
      step?: number;
      remainingSeconds?: number;
      isFinished?: boolean;
      durationSeconds?: number;
    } = {};

    if (step !== undefined) updatePayload.step = Number(step);
    if (remainingSeconds !== undefined) updatePayload.remainingSeconds = Number(remainingSeconds);
    if (isFinished !== undefined) updatePayload.isFinished = Boolean(isFinished);
    if (durationSeconds !== undefined) updatePayload.durationSeconds = Number(durationSeconds);

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({ success: false, message: "Aucune donnée de mise à jour fournie." });
    }

    const game = await updateGame(gameId, updatePayload);
    if (!game) {
      return res.status(404).json({ success: false, message: "Partie introuvable." });
    }

    res.json({ success: true, game });
  } catch (error) {
    console.error("Erreur mise à jour partie:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

app.post("/api/game/:id/complete", async (req: Request, res: Response) => {
  try {
    const gameId = Number(req.params.id);
    const durationSeconds = typeof req.body.durationSeconds === "number"
      ? req.body.durationSeconds
      : undefined;

    const game = await completeGame(gameId, durationSeconds);
    if (!game) {
      return res.status(404).json({ success: false, message: "Partie introuvable." });
    }

    res.json({ success: true, game });
  } catch (error) {
    console.error("Erreur complétion partie:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// --- ROUTES IOT ---

app.post("/api/iot/uplink", async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const { device, temperature, humidity, luminosity, keypad } = payload ?? {};

    if (
      !device ||
      typeof device !== "string" ||
      typeof temperature !== "number" ||
      typeof humidity !== "number" ||
      typeof luminosity !== "number" ||
      typeof keypad !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payload invalide. Utilisez { device, temperature, humidity, luminosity, keypad }.",
      });
    }

    const unfinishedGames = await listUnfinishedGames();
    const currentGame = unfinishedGames.length > 0 ? unfinishedGames[0] : null;
    const gamePayload = currentGame ? { ...payload, gameId: currentGame.id } : payload;

    const sensorRecord: {
      gameId?: number;
      device: string;
      temperature: number;
      humidity: number;
      luminosity: number;
      keypad: string;
    } = {
      device,
      temperature,
      humidity,
      luminosity,
      keypad,
    };

    if (currentGame?.id !== undefined) {
      sensorRecord.gameId = currentGame.id;
    }

    await addSensorPayload(sensorRecord);

    let stepSolved = false;
    let nextStep = currentGame?.step ?? 1;
    let isCompleted = false;

    if (currentGame) {
      if (currentGame.step === 1 && temperature >= TEMPERATURE_THRESHOLD) {
        nextStep = 2;
        stepSolved = true;
        await updateGame(currentGame.id, { step: 2 });
      } else if (currentGame.step === 2 && luminosity <= LIGHT_THRESHOLD) {
        nextStep = 3;
        stepSolved = true;
        await updateGame(currentGame.id, { step: 3 });
      } else if (currentGame.step === 3 && keypad === SECRET_CODE) {
        stepSolved = true;
        isCompleted = true;
        await completeGame(currentGame.id);
      }
    }

    io.emit("iot_update", {
      payload: gamePayload,
      currentStep: nextStep,
      stepSolved,
      gameId: currentGame?.id ?? null,
      isCompleted,
    });

    res.json({ success: true, message: "Données reçues." });
  } catch (error) {
    console.error("Erreur traitement payload IoT:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

app.get("/api/iot/payloads", async (_req: Request, res: Response) => {
  try {
    const payloads = await listSensorPayloads(100);
    res.json(payloads);
  } catch (error) {
    console.error("Erreur récupération payloads:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

io.on("connection", async (socket) => {
  console.log("Un client frontend est connecté :", socket.id);
  const unfinishedGames = await listUnfinishedGames();
  const currentGame = unfinishedGames.length > 0 ? unfinishedGames[0] : null;

  socket.emit("game_state_init", {
    currentStep: currentGame?.step ?? 1,
    gameId: currentGame?.id ?? null,
    isFinished: currentGame?.isFinished ?? false,
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Serveur MatMaxScape démarré sur http://localhost:${PORT}`);
});
