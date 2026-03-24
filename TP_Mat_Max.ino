#include "dhtservice.h"
#include "lora.h"
#include "button.h"

unsigned long dernierEnvoi = 0;
const unsigned long intervalleEnvoi = 10000;

// méthodes principales
void setup() {
  Serial.begin(115200);
  
  // Configuration du bouton de validation
  pinMode(18, INPUT_PULLUP);  // bouton sur GPIO18

  initLoRa();
  delay(2000);

  initDHT();
  Serial.println("Appuyez sur le bouton pour envoyer les données...");
}

void loop() {
  // Vérifier si le bouton est appuyé
  if (ValidateButton()) {
    Serial.println("\n📤 Bouton appuyé - Envoi des données...");
    manageDHT();
  }

  // --- PARTIE PONT SÉRIE ---
  // while (Serial.available()) {
  //   Serial2.write(Serial.read());
  // }
  // while (Serial2.available()) {
  //   Serial.write(Serial2.read());
  // }
  
  delay(10);  // Petit délai pour éviter de surcharger
}