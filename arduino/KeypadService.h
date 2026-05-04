#ifndef KEYPADSERVICE_H
#define KEYPADSERVICE_H

#include <Arduino.h>
#include <Keypad.h>

extern Keypad keypad;
extern String CS16MC;

void initKeypad();
String manageKeypad();

#endif