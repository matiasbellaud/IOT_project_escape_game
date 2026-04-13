#include "dhtservice.h"
#include "ldrservice.h"
#include "keypadservice.h"
#include "helper.h"
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
  initLDR();
  initKeypad();
  Serial.println("Appuyez sur le bouton pour envoyer les données...");
}

void loop() {
  // Gestion des événements du keypad
  char key = keypad.getKey();
  if (key) {
    Serial.print("Touche pressée: ");
    Serial.println(key);

    // Ajouter la touche aux 4 derniers inputs
    CS16MC += key;

    // Garder seulement les 4 derniers caractères
    if (CS16MC.length() > 4) {
      CS16MC = CS16MC.substring(CS16MC.length() - 4);
    }

    Serial.print("CS16MC: ");
    Serial.println(CS16MC);
  }

  // Vérifier si le bouton est appuyé
  if (ValidateButton()) {
    Serial.println("\n📤 Bouton appuyé - Envoi des données...");
    String DHTPayload = manageDHT();
    String LDRPayload = manageLDR();
    String KeypadPayload = manageKeypad();

    String payload = mergePayloads(DHTPayload, LDRPayload, KeypadPayload);
    Serial.println(payload);
    sendLoRaMessage(2, payload);

  }
  
  delay(10); 
}