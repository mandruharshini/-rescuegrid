# RescueGrid — Flutter Only

A Flutter/Dart implementation of the RescueGrid campus emergency reporting and response case study.

## Included
- Student / Responder / Command Admin roles
- SOS reporting with category, optional photo and GPS
- Severity classification
- Responder ranking by skill and distance
- Automatic assignment
- Assignment accept / decline-ready workflow
- Navigation launch
- Live incident status
- Backup request and escalation
- In-app notifications
- Command center, map-style campus view, analytics
- Chronological incident timeline
- Animated depth / glass / grid visual design

## Run
flutter pub get
flutter run

## Web
flutter run -d chrome
flutter build web --release

The demo uses local Flutter state and simulated live data, so it does not require API keys.
