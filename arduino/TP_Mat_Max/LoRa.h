#ifndef LORA_H
#define LORA_H

#include <Arduino.h>

bool checkLoRaStatus();
void initLoRa();
void configurerLoRa();
void joinOTAA();
void sendLoRaMessage(int port, String payload);

String envoyerAT(String commande, unsigned long timeoutMs);

#endif