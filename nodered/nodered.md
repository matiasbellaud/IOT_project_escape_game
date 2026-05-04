# Documentation du Flow Node-RED

## Aperçu

Le fichier `nodered.json` contient un flux Node-RED qui traite les données IoT en provenance de The Things Network (TTN). Le flux décode les données des capteurs, les valide et les achemine vers différentes destinations selon leur valeur.

## Architecture du Flow

### 1. **Entrées MQTT**

#### Entrée Principale (TTN)
- **Topic** : `v3/tpmatmax@ttn/devices/+/up`
- **Broker** : The Things Network (eu1.cloud.thethings.network)
- **QoS** : 1
- **Format** : JSON
- Reçoit les messages uplink (remontées de données) depuis l'ESP32 via LoRaWAN

#### Entrée de Test
- **Topic** : `test/campus/#`
- **Broker** : Mosquitto local
- **QoS** : 2
- Utilisée pour les tests locaux avec le broker MQTT local

### 2. **Décodage du Payload**

**Nœud** : `décodage payload hexa`

Traite le payload reçu en base64 et le décode en extrayant les capteurs :

- **Bytes 0-1** : Température (big-endian, divisé par 100)
- **Byte 2** : Humidité
- **Bytes 3-4** : Luminosité
- **Bytes 5-8** : Code Keypad (4 caractères ASCII)

Ajoute aussi :
- ID du dispositif
- Timestamp ISO

### 3. **Logique Conditionnelle**

**Nœud** : `switch` (basé sur la température)

Crée deux branches :

#### **Branche 1 : Température ≤ 35°C** (données normales)
1. Formate les données pour InfluxDB
2. Envoie vers **InfluxDB** (bucket: `iot_data`, measurement: `capteurs`)
3. Envoie vers **API Backend** (`http://10.44.20.4:3001/api/iot/uplink`)
4. Affiche les logs de débogage

#### **Branche 2 : Température > 35°C** (alerte)
1. Formate les données d'alerte
2. Envoie vers **Google Script** (webhook)
3. Déclenche une alerte externalisée

### 4. **Sorties**

| Destination | Type | Détails |
|---|---|---|
| **InfluxDB** | Sortie directe | Stocke les séries temporelles dans le bucket `iot_data` |
| **API Backend** | HTTP POST | Endpoint `/api/iot/uplink` pour traitement applicatif |
| **Google Script** | HTTP POST | Webhook pour alertes température > 35°C |
| **Debug Console** | Console Node-RED | Logs de suivi en temps réel |

## Flux de Données Simplifié

```
TTN (MQTT) 
  ↓
[Décodage Payload]
  ↓
[Switch Température]
  ↙ (≤35°C)        ↘ (>35°C)
  ↓                 ↓
InfluxDB          Google Script
API Backend
```

## Configuration Importantes

- **Broker InfluxDB** : 127.0.0.1:8086
- **Organisation InfluxDB** : iot-campus
- **Bucket InfluxDB** : iot_data
- **Measurement InfluxDB** : capteurs
- **API Backend** : 10.44.20.4:3001
- **Seuil d'alerte** : 35°C
