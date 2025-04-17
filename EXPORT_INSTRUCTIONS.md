# NFC Payment System - Android Build Instructions

This document contains instructions for building and installing the NFC Payment System Android application.

## Prerequisites

1. **Node.js and npm**: Make sure you have Node.js (v14+) and npm installed on your machine
2. **Expo CLI**: Install Expo CLI globally with `npm install -g expo-cli`
3. **EAS CLI**: Install EAS CLI globally with `npm install -g eas-cli`
4. **Android Studio**: Required for Android emulator and building APKs

## Configuration

Before building, make sure your backend URL is correctly configured:

1. Open `src/api/api.js`
2. Verify that `API_BASE_URL` points to your Replit backend:
   ```javascript
   const API_BASE_URL = 'https://workspace.allanlucero29.repl.co/api';
   ```
3. If your backend URL is different, update this value accordingly

## Building the Android APK

### Method 1: Using Expo Development Build

1. Navigate to the project directory
2. Install dependencies: `npm install`
3. Run the development build: `expo start --dev-client`
4. Scan the QR code with Expo Go on your Android device

### Method 2: Building APK with EAS

1. Navigate to the project directory
2. Install dependencies: `npm install`
3. Log in to Expo: `eas login`
4. Build the Android APK: `eas build -p android --profile preview`
5. Follow the prompts and wait for the build to complete
6. Download the APK from the provided URL

### Method 3: Building APK Locally

1. Navigate to the project directory
2. Make the build script executable: `chmod +x scripts/build-android.sh`
3. Run the build script: `./scripts/build-android.sh`
4. The APK will be located at: `android/app/build/outputs/apk/release/app-release.apk` and also copied to the project root as `NFC-Payment-System.apk`

Alternatively, you can run the commands manually:
```
npm install
expo prebuild -p android
cd android
./gradlew assembleRelease
```

## Installing on Android

1. Copy the APK file to your Android device
2. On your Android device, navigate to the APK file location
3. Tap the APK file to install it
4. If prompted, enable "Install from Unknown Sources" in your device settings
5. After installation, locate the "NFC Payment System" app in your app drawer and open it

## Optimizing Assets

To optimize image assets for better performance:

1. Make the optimization script executable: `chmod +x scripts/optimize-assets.sh`
2. Run the optimization script: `./scripts/optimize-assets.sh`
3. Check the `optimized_assets` directory for optimized images
4. Replace the current assets with the optimized ones before building

## Troubleshooting

### NFC Issues
- Make sure NFC is enabled on your device (Settings > Connected devices > Connection preferences > NFC)
- The app requires NFC permission which should be granted automatically during installation
- If you're having trouble with NFC scanning, try using the "Debug Info" button in the scan screen to check the NFC state
- If NFC scanning fails, you can use the "Manual Entry" option to enter card IDs manually

### API Connection Issues
- Use the "Customer Lookup" feature to test API connectivity
- Verify that your device has internet access
- Check that the backend URL is correctly configured in `src/api/api.js`
- The app will automatically switch to offline mode if it can't connect to the server

### Build Issues
- If the build fails, try clearing the build cache with `expo start -c`
- Make sure all dependencies are installed with `npm install`
- If using Gradle directly, ensure you have the correct Java version installed

## Offline Mode

The app supports offline mode for when connectivity to the backend is unavailable:

1. Customer data and transactions are cached locally
2. Transactions made offline will be synchronized when connectivity is restored
3. An indicator will be shown when the app is operating in offline mode

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [NFC Manager Library](https://github.com/revtel/react-native-nfc-manager)