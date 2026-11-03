# Monarca Mobile App Release (v4.7.0)

## 1. Android Installation Package (APK)
- **File**: `Monarca-v4.7.0.apk`
- **Architecture**: Universal APK (Universal for all Android Phones & Tablets)
- **Signing Scheme**: JAR (v1) + APK Signature Scheme v2 (Signed with RSA 2048-bit key)
- **Signature Status**: Verified (`apksigner verify --verbose` passed)
- **Compatible Devices**:
  - Android Phones (Samsung, Xiaomi, Huawei, OPPO, vivo, Google Pixel, etc.)
  - Android Tablets (Samsung Galaxy Tab, Xiaomi Pad, Huawei MatePad, Lenovo Tab, etc.)
- **Installation Method**:
  1. Transfer `Monarca-v4.7.0.apk` to your Android phone or tablet (via USB, WeChat, Telegram, WhatsApp, or browser download).
  2. Tap the `.apk` file on your device.
  3. If prompted by Android Security, allow "Install from unknown sources" (允许来自此来源的应用).
  4. The app will install cleanly and appear on your home screen with the Monarca icon.

---

## 2. iOS Installation Package (IPA) & Xcode Project
- **File**: `Monarca-v4.7.0.ipa`
- **Full Xcode Project**: `代码/monarca-mobile-app/ios/App/`
- **Targeted Devices**: Universal (`TARGETED_DEVICE_FAMILY = "1,2"` for iPhone and iPad)
- **iOS Installation Notes**:
  - In Apple's closed security ecosystem, iOS strictly requires all `.ipa` applications to be signed with an authorized **Apple Developer Certificate** (`.p12`) and **Provisioning Profile** (`.mobileprovision`) matching the device's UDID.
  - An `.ipa` cannot be installed on an iPhone or iPad by simply double-clicking or copying.
  - **3 Methods to install on iPhone / iPad**:
    1. **Direct Compilation via Mac/Xcode** (Recommended for developers):
       - Open `ios/App/App.xcworkspace` in Xcode on a Mac.
       - Select your Apple Developer Team under "Signing & Capabilities".
       - Connect your iPhone or iPad via USB, select your device, and click "Run" (Command+R) or archive to TestFlight.
    2. **Sideloading without Apple Developer Account**:
       - Use tools such as **AltStore**, **Sideloadly**, or **TrollStore** on Windows/Mac to sign and install the IPA using a free personal Apple ID.
    3. **Official App Store / TestFlight**:
       - Upload the archive to Apple App Store Connect for internal/external TestFlight beta distribution.
