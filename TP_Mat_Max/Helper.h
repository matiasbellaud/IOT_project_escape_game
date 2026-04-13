#ifndef HELPER_H
#define HELPER_H

#include <Arduino.h>

String encodeDHTPayload(float temp, float hum);
String encodeLDRPayload(int ldrValue);
String encodeKeypadPayload(String keypadInput);
String mergePayloads(const String& dhtPayload, const String& ldrPayload, const String& keypadPayload);
String arrayToHexString(const uint8_t* array, int len);

#endif