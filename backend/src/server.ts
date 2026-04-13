import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// --- ROUTES API FRONTEND ---

// Route de connexion (Login)
app.post("/api/auth/login", (req: Request, res: Response) => {
  const { username, password, roomCode } = req.body;

  // Logique métier basique en rapport avec la maquette
  if (username === "agent_042" && roomCode === "ROOM-7749") {
    res.json({
      success: true,
      token: "fake-jwt-token-12345",
      user: { username, role: "agent" },
    });
  } else {
    res
      .status(401)
      .json({
        success: false,
        message: "Identifiants ou code salle incorrects.",
      });
  }
});

// Route pour récupérer les sauvegardes
app.get("/api/saves", (req: Request, res: Response) => {
  // À terme, ces données viendront d'une base de données (ex: MongoDB ou PostgreSQL)
  res.json([
    {
      id: 1,
      title: "LA CHAMBRE FROIDE",
      status: "IN_PROGRESS",
      progress: 33,
      duration: "24:17",
    },
    {
      id: 2,
      title: "LE LABORATOIRE",
      status: "COMPLETED",
      progress: 100,
      duration: "42:53",
    },
    {
      id: 3,
      title: "L'OBSERVATOIRE",
      status: "LOCKED",
      progress: 0,
      duration: null,
    },
  ]);
});

// --- ROUTES IOT (LoRaWAN Webhook) ---

// Route pour recevoir les données des capteurs (ex: depuis The Things Network / ChirpStack)
app.post("/api/iot/uplink", (req: Request, res: Response) => {
  const payload = req.body;
  console.log("📡 Trame LoRa reçue :", payload);
  // Ici vous pourrez décoder le payload hexadécimal (ex: 092932) généré par Helper.cpp
  // et mettre à jour l'état de la partie en temps réel via WebSockets pour le Front.
  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur CIPHER ROOM démarré sur http://localhost:${PORT}`);
});
