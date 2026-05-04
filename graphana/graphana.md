# Grafana -- Dashboard du projet

## Contenu de ce dossier
- `dashboard.json` : export JSON du dashboard Grafana

### Importer le dashboard dans Grafana
- Menu latéral gauche -> Dashboards -> Import
- Cliquer Upload JSON file et sélectionner dashboard.json
- Ou coller le contenu JSON dans le champ Import via panel JSON
- Cliquer Load puis Import
- Note : vérifier que le nom de la source de données dans le JSON correspond à celle configurée dans votre Grafana (par défaut : InfluxDB).

## Panneaux du dashboard
| Panneau | Type | Description |
|---------|------|-------------|
| Moyenne 1 Heure | Stat | Moyenne de température sur les dernières 24h |
| Température actuel | Gauge | Dernière valeur de température avec seuils de couleur |
| Température en temps réel | Time series | Historique de température sur les dernières 24h |

### Exemple de requete Flux (Time series)
```
from(bucket: "iot_data")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "capteurs")
  |> filter(fn: (r) => r._field == "temperature")
```

### Exemple de requete Flux (derniere valeur -- Stat/Gauge)
```
from(bucket: "iot_data")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "capteurs")
  |> filter(fn: (r) => r._field == "temperature")
  |> last()
```