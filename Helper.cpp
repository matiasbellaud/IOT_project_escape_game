#include <Arduino.h>
#include "helper.h"

// Fonction pour encoder Température et Humidité en hexadécimal
String encodePayload(float temp, float hum) {
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



String arrayToHexString(const uint8_t* array, int len) {
  String hex = "";
  for (int i = 0; i < len; i++) {
    if (array[i] < 0x10) hex += "0";
    hex += String(array[i], HEX);
  }
  return hex;
}