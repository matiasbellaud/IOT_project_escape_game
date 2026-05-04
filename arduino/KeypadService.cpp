#include <Arduino.h>
#include <Keypad.h>

#include "keypadservice.h"
#include "helper.h"
#include "lora.h"

// Définition du nombre de lignes et de colonnes
const byte ROWS = 4;
const byte COLS = 4;

// Définition de la carte des touches (Layout)
char keys[ROWS][COLS] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};

// Broches GPIO connectées aux Lignes (R1, R2, R3, R4)
byte rowPins[ROWS] = {13, 12, 14, 27};

// Broches GPIO connectées aux Colonnes (C1, C2, C3, C4)
byte colPins[COLS] = {26, 25, 33, 32};

// Création de l'objet Keypad
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

// Variable pour retenir les 4 derniers inputs
String CS16MC = "";

void initKeypad(){
  Serial.println("🚀 Prêt ! Keypad initialisé");
}

String manageKeypad(){
  // Retourne les 4 derniers inputs stockés
  Serial.print("Keypad inputs: ");
  Serial.println(CS16MC);

  // Encoder les 4 caractères en hexadécimal
  String payload = encodeKeypadPayload(CS16MC);
  return payload;
}
