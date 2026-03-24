#include <Arduino.h>
#include "button.h"

#define BUTTON_PIN 18   // GPIO18 pour le bouton de validation
#define DEBOUNCE_TIME 50  // Temps de debounce en ms

unsigned long lastDebounceTime = 0;

bool ValidateButton() {
  // Vérifier si le bouton est appuyé (LOW avec INPUT_PULLUP)
  if (digitalRead(BUTTON_PIN) == LOW) {
    // Attendre un peu pour débouncer
    delay(50);
    
    // Confirmer que c'est toujours appuyé
    if (digitalRead(BUTTON_PIN) == LOW) {
      // Attendre le relâchement du bouton
      while (digitalRead(BUTTON_PIN) == LOW) {
        delay(10);
      }
      // Petit délai après relâchement pour éviter doubler
      delay(100);
      return true;
    }
  }

  return false;
}

