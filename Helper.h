#ifndef HELPER_H
#define HELPER_H

#include <Arduino.h>

String encodePayload(float temp, float hum);
String arrayToHexString(const uint8_t* array, int len);

#endif