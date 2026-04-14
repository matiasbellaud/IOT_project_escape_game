import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const DB_FILE = join(__dirname, "..", "data", "escape_game.json");

interface Database {
  games: Game[];
  sensorPayloads: SensorPayload[];
  nextGameId: number;
  nextPayloadId: number;
}

let db: Database = {
  games: [],
  sensorPayloads: [],
  nextGameId: 1,
  nextPayloadId: 1,
};

if (existsSync(DB_FILE)) {
  try {
    db = JSON.parse(readFileSync(DB_FILE, "utf-8"));
  } catch (error) {
    console.error("Erreur chargement DB:", error);
  }
}

const saveDb = () => {
  try {
    writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error("Erreur sauvegarde DB:", error);
  }
};

type SensorPayload = {
  id: number;
  device: string;
  temperature: number;
  humidity: number;
  luminosity: number;
  keypad: string;
  receivedAt: string;
};

export type Game = {
  id: number;
  teamName: string;
  step: number;
  remainingSeconds: number;
  isFinished: boolean;
  finishedAt: string | null;
  durationSeconds: number | null;
  createdAt: string;
  updatedAt: string;
};

export const createGame = async (teamName: string): Promise<Game> => {
  const game: Game = {
    id: db.nextGameId++,
    teamName,
    step: 1,
    remainingSeconds: 0,
    isFinished: false,
    finishedAt: null,
    durationSeconds: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.games.push(game);
  saveDb();
  return game;
};

export const getGame = async (id: number): Promise<Game | null> => {
  return db.games.find(game => game.id === id) || null;
};

export const listGames = async (): Promise<Game[]> => {
  return [...db.games].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const listUnfinishedGames = async (): Promise<Game[]> => {
  return db.games
    .filter(game => !game.isFinished)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

export const updateGame = async (id: number, update: {
  step?: number;
  remainingSeconds?: number;
  isFinished?: boolean;
  durationSeconds?: number | null;
}): Promise<Game | null> => {
  const gameIndex = db.games.findIndex(game => game.id === id);
  if (gameIndex === -1) return null;

  const game = db.games[gameIndex]!;
  if (update.step !== undefined) game.step = update.step;
  if (update.remainingSeconds !== undefined) game.remainingSeconds = update.remainingSeconds;
  if (update.isFinished !== undefined) {
    game.isFinished = update.isFinished;
    if (update.isFinished) {
      game.finishedAt = new Date().toISOString();
    }
  }
  if (update.durationSeconds !== undefined) game.durationSeconds = update.durationSeconds;

  game.updatedAt = new Date().toISOString();
  saveDb();
  return game;
};

export const completeGame = async (id: number, durationSeconds?: number | null): Promise<Game | null> => {
  return await updateGame(id, {
    isFinished: true,
    durationSeconds: durationSeconds ?? null,
    remainingSeconds: 0,
  });
};

export const addSensorPayload = async (payload: {
  device: string;
  temperature: number;
  humidity: number;
  luminosity: number;
  keypad: string;
}) => {
  const sensorPayload: SensorPayload = {
    id: db.nextPayloadId++,
    ...payload,
    receivedAt: new Date().toISOString(),
  };
  db.sensorPayloads.push(sensorPayload);
  saveDb();
};

export const listSensorPayloads = async (limit = 100) => {
  return db.sensorPayloads
    .slice(-limit)
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
};