@echo off
echo ========================================================
echo   Monarca Mobile App - Android APK Build Script
echo ========================================================

set JAVA_HOME=C:\Program Files\Java\jdk-21.0.12
set ANDROID_HOME=D:\Android\Sdk
set PATH=%JAVA_HOME%\bin;%PATH%

cd /d "%~dp0..\android"

echo [1/3] Syncing latest web assets...
cd ..
call npx cap sync android
cd android

echo [2/3] Compiling Android APK with Gradle...
call .\gradlew.bat assembleDebug

echo [3/3] Copying APK to release directory...
if exist "app\build\outputs\apk\debug\app-debug.apk" (
    if not exist "..\release" mkdir "..\release"
    copy /Y "app\build\outputs\apk\debug\app-debug.apk" "..\release\Monarca-v4.7.0.apk"
    echo.
    echo [SUCCESS] APK built successfully:
    echo   ..\release\Monarca-v4.7.0.apk
) else (
    echo.
    echo [ERROR] Failed to find compiled APK.
)

pause
