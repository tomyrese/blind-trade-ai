---
description: Build APK for Android
---

# Build APK Workflow

Use these steps to generate an APK for testing or release.

## 1. Build Debug APK (Fastest for testing)

// turbo

1. Run the command to build the debug APK:
   `cd android && ./gradlew assembleDebug`
2. The APK will be located at:
   `android/app/build/outputs/apk/debug/app-debug.apk`

## 2. Build Release APK (Proper version for sharing)

> [!IMPORTANT]
> This requires a Keystore file. If you haven't created one, follow the official React Native documentation for [Signed APK](https://reactnative.dev/docs/signed-apk-android).

// turbo

1. Clean previous builds:
   `cd android && ./gradlew clean`
2. Run the command to build the release APK:
   `cd android && ./gradlew assembleRelease`
3. The APK will be located at:
   `android/app/build/outputs/apk/release/app-release.apk`
