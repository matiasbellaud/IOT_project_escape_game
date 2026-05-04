# Documentation RGPD — IoT et Architecture

## 1. Contexte et périmètre

Ce document couvre les aspects RGPD du système IoT et de l'architecture associée du projet Escape Game.

Le périmètre inclut :
- les capteurs et actionneurs Arduino (DHT, LDR, clavier, LoRa, etc.)
- la collecte et le transport des données via les services IoT
- l'architecture des flux de données entre l'IoT et le back-end
- les mesures de sécurité et de confidentialité applicables aux données

## 2. Typologie des données collectées

### 2.1 Données techniques et environnementales

Les objets connectés collectent principalement des données techniques et d'environnement :
- température et humidité
- luminosité
- états de capteurs et boutons
- événements de saisie clavier
- données LoRa de transmission

Ces données sont utilisées pour piloter et surveiller les dispositifs de l'escape game.

### 2.2 Données potentiellement personnelles

Dans la partie IoT, les données personnelles sont limitées.
Cependant, certains éléments peuvent être considérés comme des données personnelles ou pseudonymes si associés à une personne :
- identifiants de dispositifs IoT (adresse MAC, ID de module, clés LoRa)
- identifiants de session ou de partie
- logs de connexion ou d'accès techniques

Ces éléments doivent être traités avec précaution et réservés au strict nécessaire pour le fonctionnement, la maintenance ou la cybersécurité.

## 3. Rôles et responsabilités

### 3.1 Responsable de traitement

Le responsable de traitement est l'entité qui détermine les finalités et les moyens du traitement des données IoT.
Pour ce projet étudiant, il s'agit de l'équipe projet ou de l'organisme porteur du projet.

### 3.2 Sous-traitant

Le back-end et les services IoT (hébergement, broker MQTT, éventuelles APIs) sont des opérations de traitement exécutées pour le compte du responsable.
Le fournisseur d'infrastructure ou l'hébergeur peut être considéré comme un sous-traitant s'il traite des données à titre externe.

## 4. Finalités du traitement

Les finalités liées à la partie IoT et architecture sont :
- collecte de données d'environnement pour le déroulement du jeu
- surveillance opérationnelle et détection d'anomalies
- acheminement sécurisé des données vers le serveur
- maintenance et diagnostic des équipements
- sécurité des communications et prévention des pannes

Aucune finalité marketing ou commerciale ne relève de ce périmètre.

## 5. Bases légales applicables

Les bases légales pertinentes sont :
- exécution d'une mission d'intérêt public ou d'une obligation contractuelle liée à la prestation de service de l'escape game
- intérêt légitime pour assurer la sécurité et la disponibilité des dispositifs IoT
- consentement lorsque des données personnelles des joueurs sont explicitement recueillies en dehors du système IoT (cependant, ce n'est pas le cas du côté IoT)

## 6. Architecture des flux et minimisation des données

### 6.1 Flux IoT

1. Les capteurs Arduino mesurent des paramètres physiques.
2. Les données sont traitées localement par les services embarqués (DHTService, LDRService, KeypadService, etc.).
3. Les paquets sont transmis via LoRa ou liaison série vers une passerelle.
4. La passerelle envoie les données au back-end ou au broker MQTT.

### 6.2 Minimisation et traitement local

La logique embarquée doit :
- ne transmettre que les données nécessaires
- éviter d'envoyer des logs ou informations inutiles
- ne pas stocker de données personnelles sensibles sur l'objet lui-même

### 6.3 Stockage et persistances backend

Le stockage backend est utilisé uniquement pour conserver l'état du jeu et les données de capteurs nécessaires au fonctionnement. Pour la partie RGPD, il est important de :
- limiter la durée de conservation
- anonymiser ou pseudonymiser les éléments techniques lorsqu'ils ne sont pas requis
- ne pas mêler les données IoT aux informations personnelles des joueurs si ce n'est pas nécessaire

## 7. Sécurité et intégrité

### 7.1 Sécurité des communications

Les communications entre les dispositifs IoT et l'architecture doivent être protégées selon les moyens disponibles :
- chiffrement des liens LoRa si possible
- utilisation de protocoles sécurisés pour le transport vers le back-end
- isolation des réseaux IoT des réseaux publics

### 7.2 Sécurité des équipements

Les appareils doivent être configurés avec :
- mots de passe ou clés sécurisées pour l'accès à la configuration
- protection contre les accès non autorisés physiques et réseau

## 8. Durée de conservation

Pour la partie IoT, la durée de conservation doit rester limitée :
- données de capteurs : conservation uniquement pendant le temps de la partie ou la durée utile de diagnostic
- journaux techniques : conservation temporaire pour l'analyse d'anomalies, puis suppression après résolution
- identifiants devices/session : conservation strictement nécessaire pour le fonctionnement du système

## 9. Droits des personnes

Même si la partie IoT ne traite pas directement de données personnelles sensibles, le principe s'applique :
- droit d'accès, de rectification, de suppression pour les données personnelles
- droit à la limitation du traitement
- droit d'opposition si des données personnelles venaient à être collectées ou reliées à un joueur

## 10. Conformité et bonnes pratiques

### 10.1 Documentation des traitements

- conserver une cartographie des flux IoT
- documenter les finalités et les catégories de données traitées
- identifier les mesures de sécurité mises en place

### 10.2 Revue régulière

- vérifier périodiquement l'architecture IoT
- s'assurer que seules les données nécessaires sont collectées
- mettre à jour les mesures de sécurité en fonction des évolutions techniques

### 10.3 Confidentialité dès la conception

Appliquer le principe de "privacy by design" :
- penser la protection des données dès la conception des objets connectés
- minimiser la collecte
- isoler les composants et limiter leur capacité à exposer des informations

## 11. Notes spécifiques au projet

- Le back-end n'est utilisé que pour la gestion de l'état du jeu et l'agrégation de données de capteurs.

