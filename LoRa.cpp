#include <Arduino.h>
#include "lora.h"
#include "helper.h"

#define RXD2 16  // GPIO16 -> branché sur TX du RAK3272S
#define TXD2 17  // GPIO17 -> branché sur RX du RAK3272S

#include "lorawan_keys.h"
#include "helper.h"

bool loraJoined = false;

bool checkLoRaStatus() {
  String rep = envoyerAT("AT+NJS=?", 1000);

  if (rep.indexOf("1") >= 0) {
    Serial.println("✅ Module déjà JOIN au réseau");
    loraJoined = true;
    return true;
  }

  Serial.println("❌ Module non JOIN");
  loraJoined = false;
  return false;
}

void initLoRa() {

  Serial2.begin(115200, SERIAL_8N1, RXD2, TXD2);
  delay(2000);

  if (!checkLoRaStatus()) {
    configurerLoRa();
    joinOTAA();
  }
}

void configurerLoRa() {
  envoyerAT("AT+NWM=1",  2500);  // Mode LoRaWAN (déclenche un reboot du module)
  envoyerAT("AT+NJM=1",  500);   // Mode OTAA
  envoyerAT("AT+BAND=4", 500);   // Bande EU868

  String deveuiHex = arrayToHexString(DEVEUI, 8);
  String appeuiHex = arrayToHexString(APPEUI, 8);
  String appkeyHex = arrayToHexString(APPKEY, 16);

  envoyerAT("AT+DEVEUI=" + String(deveuiHex), 500);
  envoyerAT("AT+APPEUI=" + String(appeuiHex), 500);
  envoyerAT("AT+APPKEY=" + String(appkeyHex), 500);
  
  // Vérification (lecture des valeurs configurées)
  Serial.println("\nVérification configuration :");
  envoyerAT("AT+DEVEUI=?", 500);
  envoyerAT("AT+NJM=?",    500);
  envoyerAT("AT+BAND=?",   500);
  Serial.println("✅ Configuration terminée\n");
}

void joinOTAA() {
  Serial.println("Tentative de join OTAA...");
  envoyerAT("AT+JOIN=1:0:10:8", 500);

  unsigned long debut = millis();
  while (millis() - debut < 60000) {
    if (Serial2.available()) {
      String rep = Serial2.readStringUntil('\n');
      rep.trim();
      if (rep.length() > 0) Serial.println("[RAK] " + rep);

      if (rep.indexOf("+EVT:JOINED") >= 0) {
        Serial.println("\n✅ JOIN RÉUSSI");
        loraJoined = true;
        return;
      }

      if (rep.indexOf("+EVT:JOIN_FAILED") >= 0) {
        Serial.println("\n❌ JOIN ÉCHOUÉ");
        loraJoined = false;
        return;
      }
    }
    delay(50);
  }

  Serial.println("⏱️ Timeout");
}

void sendLoRaMessage(int port, String hexPayload) {
  String command = "AT+SEND=" + String(port) + ":" + hexPayload;

  String rep = envoyerAT(command, 2000);

  if (rep.indexOf("AT_NO_NETWORK_JOINED") >= 0) {
    Serial.println("⚠️ Perte de session LoRaWAN -> rejoin");
    joinOTAA();
  }
}

// Envoie une commande AT et collecte la réponse pendant timeoutMs ms
String envoyerAT(String commande, unsigned long timeoutMs) {
  Serial.println("[AT] → " + commande);
  Serial2.println(commande);

  String reponse = "";
  unsigned long debut = millis();
  while (millis() - debut < timeoutMs) {
    while (Serial2.available()) {
      String ligne = Serial2.readStringUntil('\n');
      ligne.trim();
      if (ligne.length() > 0) {
        Serial.println("[AT] ← " + ligne);
        reponse += ligne + "\n";
      }
    }
    delay(20);
  }
  return reponse;
}

