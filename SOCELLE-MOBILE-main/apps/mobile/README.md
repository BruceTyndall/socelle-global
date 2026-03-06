# SLOTFORCE Mobile (Flutter)

This directory contains the pure Flutter client app.

## Prerequisites

- Flutter SDK (stable)
- Xcode command line tools (for iOS)
- Android Studio SDK (for Android)

## First Run

1. `flutter pub get`
2. Configure Firebase for iOS/Android (`google-services.json`, `GoogleService-Info.plist`)
3. Ensure Firebase Auth (Anonymous) and Cloud Functions are enabled in project
4. Set function region/defaults if needed for your Firebase project
5. `flutter run`

## Current State

- Firebase bootstrap + anonymous auth in `lib/main.dart`
- Sync Dashboard calls callable `syncCalendarEvents` and renders live totals/gaps
