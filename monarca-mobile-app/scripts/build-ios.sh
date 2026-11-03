#!/bin/bash
# ========================================================
#   Monarca Mobile App - iOS Archive & IPA Build Script
#   (Run this script on macOS with Xcode installed)
# ========================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== [1/4] Syncing web assets to iOS ==="
cd "$APP_DIR"
npx cap sync ios

echo "=== [2/4] Installing CocoaPods Dependencies ==="
cd "$APP_DIR/ios/App"
rm -rf App.xcworkspace
pod install

echo "=== [3/4] Archiving Xcode Project ==="
xcodebuild -workspace App.xcworkspace \
           -scheme App \
           -configuration Release \
           -destination 'generic/platform=iOS' \
           -archivePath ./build/App.xcarchive \
           archive \
           CODE_SIGN_IDENTITY="" \
           CODE_SIGNING_REQUIRED=NO \
           CODE_SIGNING_ALLOWED=NO \
           AD_HOC_CODE_SIGNING_ALLOWED=YES

echo "=== [4/4] Packaging Monarca-v4.7.0.ipa ==="
rm -rf Payload
mkdir -p Payload
cp -R ./build/App.xcarchive/Products/Applications/App.app Payload/App.app
mkdir -p "$APP_DIR/release"
zip -r "$APP_DIR/release/Monarca-v4.7.0.ipa" Payload
rm -rf Payload

echo "========================================================"
echo " [SUCCESS] IPA package created at:"
echo "   $APP_DIR/release/Monarca-v4.7.0.ipa"
echo "========================================================"
