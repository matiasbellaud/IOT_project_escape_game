#include <Arduino.h>
#include <DHT.h>

#include "dhtservice.h"
#include "helper.h"
#include "lora.h"

#define DHTPIN 4   // GPIO4 pour le DHT11
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

void initDHT(){
  dht.begin();
  Serial.println("🚀 Prêt ! Envois DHT");
}

String manageDHT(){

    // Lecture du capteur
    float h = dht.readHumidity();
    float t = dht.readTemperature();

    // Vérification que la lecture a fonctionné
    if (isnan(h) || isnan(t)) {
      Serial.println("Erreur de lecture du DHT11 !");
      return String("");
    }

    Serial.print("Temp: ");
    Serial.print(t);
    Serial.print("°C, ");
    Serial.print("Hum: ");
    Serial.print(h);
    Serial.println("%");

    // Encoder et renvoyer
    String payload = encodeDHTPayload(t, h);
    return payload;
}