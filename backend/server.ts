import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
// Autoriser le CORS pour que le front puisse se connecter
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.json());

// Définition de la machine à état du jeu (State Machine)
enum GameStep {
    WAITING_START = 0,
    STEP_1_TEMP = 1,
    STEP_2_KEYPAD = 2,
    ESCAPED = 3
}

// Le backend mémorise l'état en cours de la partie
let currentStep: GameStep = GameStep.WAITING_START;

// Endpoint cible du POST HTTP de Node-RED (d'après ton architecture)
app.post('/api/iot/uplink', (req, res) => {
    const payload = req.body;
    console.log('Données capteurs reçues via Node-RED:', payload);

    let stepSolved = false;

    // Le back gère la partie et ne traite que l'info qui l'intéresse
    switch (currentStep) {
        case GameStep.WAITING_START:
            if (payload.action === 'start') {
                currentStep = GameStep.STEP_1_TEMP;
            }
            break;
        case GameStep.STEP_1_TEMP:
            // À cette étape, on ne surveille que la température
            if (payload.temperature && payload.temperature > 35) {
                stepSolved = true;
                currentStep = GameStep.STEP_2_KEYPAD; // On passe à l'étape suivante
            }
            break;
        case GameStep.STEP_2_KEYPAD:
            // À cette étape, on ignore la température et on ne lit que le clavier
            if (payload.keypad === '7382') {
                stepSolved = true;
                currentStep = GameStep.ESCAPED; // Victoire !
            }
            break;
    }

    // On pousse les données en temps réel au front-end via WebSockets
    io.emit('iot_update', { payload, currentStep, stepSolved });

    res.status(200).json({ success: true, currentStep });
});

// Quand un client front-end se connecte, on lui donne l'état actuel
io.on('connection', (socket) => {
    console.log('Un client frontend est connecté :', socket.id);
    socket.emit('game_state_init', { currentStep });
});

server.listen(3001, () => {
    console.log('Backend Express & Socket.io démarré sur le port 3001');
});