#include <Arduino.h>
#include "helper.h"

// Fonction pour encoder Température et Humidité en hexadécimal
String encodeDHTPayload(float temp, float hum) {
  // 1. Température : * 100 et conversion en int16_t (2 octets)
  int16_t tempInt = (int16_t)(temp * 100.0);
  char hexTemp[5];
  sprintf(hexTemp, "%04X", (uint16_t)tempInt);  // Donne 4 caractères hexa (ex: 0929)

  // 2. Humidité : conversion directe en uint8_t (1 octet) car entre 0 et 100
  uint8_t humInt = (uint8_t)hum;
  char hexHum[3];
  sprintf(hexHum, "%02X", humInt);  // Donne 2 caractères hexa (ex: 32 pour 50%)

  // Combine les deux (ex: 092932)
  return String(hexTemp) + String(hexHum);
}

// Fonction pour encoder la luminosité en hexadécimal
String encodeLDRPayload(int ldrValue) {
  // Luminosité : conversion en uint16_t
  uint16_t ldrInt = (uint16_t)ldrValue;
  char hexLDR[5];
  sprintf(hexLDR, "%04X", ldrInt);  // Donne 4 caractères hexa (ex: 0929)

  // Retourne la valeur LDR en hexadécimal sur 2 octets
  return String(hexLDR);
}
// Fonction pour encoder les inputs du keypad en hexadécimal
String encodeKeypadPayload(String keypadInput) {
  String hexPayload = "";

  // Pour chaque caractère des 4 derniers inputs
  for (int i = 0; i < keypadInput.length() && i < 4; i++) {
    char c = keypadInput[i];
    char hexChar[3];
    sprintf(hexChar, "%02X", (uint8_t)c);  // Convertit le caractère en hexadécimal sur 2 octets
    hexPayload += String(hexChar);
  }

  // Si moins de 4 caractères, complète avec des zéros
  while (hexPayload.length() < 8) {
    hexPayload += "00";
  }

  return hexPayload;
}

String mergePayloads(const String& dhtPayload, const String& ldrPayload, const String& keypadPayload) {
  if (dhtPayload.length() == 0 && ldrPayload.length() == 0 && keypadPayload.length() == 0) return String("");
  if (dhtPayload.length() == 0) return ldrPayload + keypadPayload;
  if (ldrPayload.length() == 0) return dhtPayload + keypadPayload;
  return dhtPayload + ldrPayload + keypadPayload;
}

String arrayToHexString(const uint8_t* array, int len) {
  String hex = "";
  for (int i = 0; i < len; i++) {
    if (array[i] < 0x10) hex += "0";
    hex += String(array[i], HEX);
  }
  return hex;
}