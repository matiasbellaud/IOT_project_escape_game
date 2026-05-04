# IoT Escape Game Project

Projet IoT pour un escape game utilisant ESP32, LoRaWAN, The Things Network (TTN), Raspberry Pi avec stack MING (Mosquitto, Node-RED, InfluxDB, Grafana), backend TypeScript et frontend React.

## Description

Ce projet implémente un système IoT end-to-end pour un jeu d'évasion :
- **Capteurs** : Température, humidité, luminosité, clavier matriciel sur ESP32
- **Transmission** : LoRaWAN via module RAK3272S vers TTN
- **Traitement** : Node-RED sur Raspberry Pi pour décodage et règles métier
- **Stockage** : InfluxDB pour données temporelles
- **Visualisation** : Grafana pour dashboards et alertes
- **Application** : Backend API Express pour logique de jeu, frontend React pour interface utilisateur

## Architecture

Voir [docs/architecture.md](docs/architecture.md) pour le schéma détaillé.

## Structure du projet

- `arduino/` : Code ESP32 Arduino
- `backend/` : API serveur TypeScript - [Voir README backend](backend/README.md)
- `frontend/` : Application React/Vite - [Voir README frontend](frontend/README.md)
- `docker/` : Configuration Docker Compose pour la stack MING
- `docs/` : Documentation architecture et RGPD
- `graphana/` : Dashboard Grafana exporté
- `nodered/` : Flow Node-RED

## Installation

### Prérequis
- Node.js 18+
- Docker et Docker Compose
- Arduino IDE pour ESP32
- Raspberry Pi (optionnel pour déploiement)

### Installation globale
```bash
git clone <repo-url>
cd IOT_project_escape_game

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Docker stack
cd ../docker
docker-compose up -d
```

## Utilisation

### Développement
```bash
# Backend
cd backend && npm run dev  # http://localhost:3001

# Frontend
cd frontend && npm run dev  # http://localhost:5173

# Docker stack
cd docker && docker-compose up -d
```

### Déploiement
- Flashez le code Arduino sur ESP32
- Déployez la stack Docker sur Raspberry Pi
- Configurez TTN avec l'Application ID `tpmatmax`
- Importez le dashboard Grafana depuis `graphana/`

## Équipe

- Bellaud Matias
- Fuzeau Maxime