# Android preview source · 2026-11-22

This tag is the source for Monarca-4.7.27-preview-20261122.apk. Capacitor Android package: com.monarca.boutique.preview, version 4.7.27-preview (2026112201). It installs alongside the existing application.

Includes deployed departments and color photos plus the vertical full photo viewer. Payment and shipping scripts match the deployed site. It connects to the real store API; no test orders or payments were made.

Build with Java 21 and Android SDK 35:

```powershell
cd monarca-mobile-app
npm ci
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

The debug APK is generated at android/app/build/outputs/apk/debug/app-debug.apk. Signing material is local and excluded from Git. APK binaries are not committed.

Validation: Gradle assembleDebug, apksigner v1/v2 verification, aapt package/launcher checks, and SHA-256 checks of all 51 runtime assets passed. Emulator startup was blocked by insufficient available Windows commit memory; no device runtime validation is claimed. This is a Capacitor preview, not a uni-app native cloud build.
