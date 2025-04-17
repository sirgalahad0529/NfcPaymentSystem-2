# Android Deployment Guide with Offline Mode

This guide explains how to deploy the NFC Payment System as an Android native application with full offline functionality.

## Prerequisites

- Node.js LTS version
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Expo account (sign up at [expo.dev](https://expo.dev))
- Android Studio (for testing on emulator)
- Physical Android device with NFC capability (for full testing)

## Setting Up for Deployment

### 1. Update the API URL

Before building the application, you must update the API URL in the mobile app to point to your production server:

1. Open `mobile-app/src/api/api.js`
2. Update the `API_BASE_URL` constant with your production API endpoint:

```javascript
const API_BASE_URL = 'https://your-production-server.com/api';
```

### 2. Install Required Dependencies

The mobile app requires several additional packages for offline functionality. They are already included in the package.json, but if you need to install them manually:

```bash
cd mobile-app
npm install @react-native-async-storage/async-storage @react-native-community/netinfo
```

### 3. Configure EAS Build

1. Login to EAS CLI:

```bash
eas login
```

2. Initialize your project for EAS Build:

```bash
eas build:configure
```

3. The eas.json file is already configured for Android builds with the following profiles:
   - `development`: For development testing with a development client
   - `preview`: For internal distribution as an APK file
   - `production`: For Play Store submission as an App Bundle

## Building the Android App

### For Testing (APK)

To build an APK file for testing:

```bash
cd mobile-app
npm run build:android
# or directly: eas build -p android --profile preview
```

This will generate an APK file that you can install directly on Android devices without going through the Play Store.

### For Production Release

To build an Android App Bundle for Play Store submission:

```bash
cd mobile-app
eas build -p android --profile production
```

## Offline Mode Functionality

The offline mode in the mobile app provides the following features:

1. **Customer Data Caching**: Customer information is cached locally for use when offline.
2. **Offline Transactions**: Payments and balance reloads can be processed offline and synchronized when back online.
3. **Transaction History**: All transactions (including pending offline transactions) are available for viewing offline.
4. **Automatic Synchronization**: When internet connectivity is restored, the app can automatically synchronize pending transactions.
5. **Manual Synchronization**: Users can manually trigger synchronization from the Offline Settings screen.

### How Offline Mode Works

1. **Data Caching**:
   - Customer data is cached when the app is online
   - Transaction history is stored locally
   - All changes are tracked for later synchronization

2. **Network Detection**:
   - The app automatically detects network status changes
   - Visual indicators show offline status and pending sync operations

3. **Transaction Processing**:
   - In offline mode, transactions are validated locally against cached customer data
   - Temporary balance adjustments are applied to cached customer records
   - Transactions are marked as "pending sync" until connected

4. **Synchronization**:
   - When online, pending transactions are sent to the server
   - Local data is refreshed with server data
   - Conflicts are resolved based on server authority

## Testing Offline Functionality

1. Open the app with an internet connection first to cache customer data
2. Enable Airplane Mode or disable data/Wi-Fi on your device
3. Process payments or balance reloads
4. Verify that transactions are stored locally
5. Turn off Airplane Mode or re-enable data/Wi-Fi
6. Verify that transactions synchronize with the server

## Common Issues and Troubleshooting

### API Connection Issues

If the app cannot connect to the API, check:

1. The API URL is correctly set in `mobile-app/src/api/api.js`
2. The server is running and accessible from the internet
3. Any firewalls or security settings that might block API requests

### Offline Mode Not Working

If offline mode is not functioning properly:

1. Check that `@react-native-async-storage/async-storage` and `@react-native-community/netinfo` are properly installed
2. Verify that you've given the app internet permission in your Android manifest
3. Ensure you've accessed the app online first to initialize the data cache

### Transaction Synchronization Failures

If transactions fail to synchronize:

1. Check server logs for detailed error information
2. Verify that API endpoints for transactions are functioning correctly
3. Ensure the device has a stable internet connection during synchronization

## Conclusion

With offline mode, the NFC Payment System can operate in environments with unreliable internet connectivity, ensuring business continuity. When properly deployed as a native Android app, the system provides a robust payment solution that can operate independently of network conditions, while maintaining data integrity through its synchronization mechanisms.