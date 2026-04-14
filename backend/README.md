# Backend API - Escape Game

API REST pour gérer un escape game avec 3 énigmes, utilisant une base de données JSON pour le développement.

## Installation

```bash
cd backend
npm install
npm run dev
```

Le serveur démarre sur `http://localhost:3001`

## Endpoints API

### Santé du serveur
- `GET /api/health` - Vérifie que le serveur fonctionne

### Gestion des parties

#### Créer une partie
- `POST /api/game/create`
- Body: `{ "teamName": "Nom de l'équipe" }`
- Retourne: `{ "success": true, "game": {...} }`

#### Historique des parties
- `GET /api/game/history`
- Retourne: Liste de toutes les parties (terminées et en cours)

#### Parties non terminées
- `GET /api/game/unfinished`
- Retourne: Liste des parties en cours

#### Détail d'une partie
- `GET /api/game/:id`
- Retourne: Détails d'une partie spécifique

#### Mettre à jour une partie
- `PATCH /api/game/:id`
- Body: `{ "step": 2, "remainingSeconds": 1800, "isFinished": false, "durationSeconds": null }`
- Met à jour l'étape, le temps restant, le statut terminé, ou la durée

#### Terminer une partie
- `POST /api/game/:id/complete`
- Body: `{ "durationSeconds": 3600 }` (optionnel)
- Marque la partie comme terminée

### Réception des données IoT

#### Uplink capteurs
- `POST /api/iot/uplink`
- Body: `{ "device": "mat-max", "temperature": 23.5, "humidity": 39, "luminosity": 174, "keypad": "5638" }`
- Stocke les données des capteurs LoRaWAN

#### Historique des payloads IoT
- `GET /api/iot/payloads`
- Retourne: Les 100 derniers payloads reçus

## Structure des données

### Game
```typescript
{
  id: number;
  teamName: string;
  step: number; // 1, 2, ou 3
  remainingSeconds: number;
  isFinished: boolean;
  finishedAt: string | null;
  durationSeconds: number | null;
  createdAt: string;
  updatedAt: string;
}
```

### Sensor Payload
```typescript
{
  id: number;
  device: string;
  temperature: number;
  humidity: number;
  luminosity: number;
  keypad: string;
  receivedAt: string;
}
```

## Base de données

Utilise un fichier JSON `backend/data/escape_game.json` pour le stockage persistant.

## Développement

- TypeScript avec configuration stricte
- Express.js pour l'API REST
- Base de données JSON pour simplicité (remplaçable par SQLite/PostgreSQL en production)</content>
<parameter name="filePath">c:\Users\bella\Desktop\cours\M1\IOT\Projet\IOT_project_escape_game\backend\README.md