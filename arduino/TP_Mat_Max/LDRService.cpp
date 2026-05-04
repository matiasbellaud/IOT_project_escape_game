#include <Arduino.h>

#include "ldrservice.h"
#include "helper.h"
#include "lora.h"

#define LDRPIN 34   // GPIO34 pour le capteur LDR

void initLDR(){
  pinMode(LDRPIN, INPUT);
  Serial.println("🚀 Prêt ! Envoi LDR");
}

String manageLDR(){
    // Lecture du capteur LDR
    int ldrValue = analogRead(LDRPIN);

    Serial.print("LDR raw: ");
    Serial.println(ldrValue);

    // Convertir la valeur en payload hexadécimal sur 2 octets
    String payload = encodeLDRPayload(ldrValue);
    return payload;
}
