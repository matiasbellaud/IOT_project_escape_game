# Frontend - IoT Escape Game

Application React + TypeScript du projet IoT Escape Game.

Ce frontend affiche le statut du jeu, les étapes en cours et les mesures issues des capteurs LoRaWAN via le backend.

## Objectif

- Présenter l’état de la partie
- Afficher les données capteurs (température, humidité, luminosité, code keypad)
- Suivre l'avancée des énigmes
- Communiquer avec le backend via API REST

## Installation

```bash
cd frontend
npm install
```

## Lancement

```bash
cd frontend
npm run dev
```

L'interface se lance généralement sur `http://localhost:5173`.

## Build de production

```bash
cd frontend
npm run build
```

## Structure principale

- `src/components/` : composants de l'interface
- `src/services/api.ts` : appels API vers le backend
- `src/hooks/useGameState.ts` : état de l'application
- `src/App.tsx` : point d'entrée principal

## Connexion au backend

Le frontend utilise l'API backend sur `http://localhost:3001`.

### Endpoints utilisés

- `GET /api/game/history`
- `GET /api/game/unfinished`
- `GET /api/game/:id`
- `POST /api/iot/uplink` (via Node-RED)

## Notes

- Ce README remplace le template Vite par la documentation spécifique du projet.
- Pour le backend, consultez [../backend/README.md](../backend/README.md).
