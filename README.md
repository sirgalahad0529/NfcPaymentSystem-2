# NFC Payment System Mobile App

A mobile application for processing NFC payments, managing customer accounts, and tracking transactions.

## Features

- **NFC Card Reading**: Scan NFC cards to identify customers
- **Payment Processing**: Create and process payments with multi-item invoices
- **Account Management**: Check balances and reload customer accounts
- **Customer Registration**: Register new customers with cards
- **Offline Mode**: Work offline and sync when connectivity is restored
- **Transaction History**: View and track all transactions

## Getting Started

### Prerequisites

- Node.js v14+
- npm or yarn
- Expo CLI
- Android device with NFC support (for full functionality)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
   or
   ```
   expo start
   ```

## Building for Production

See [EXPORT_INSTRUCTIONS.md](./EXPORT_INSTRUCTIONS.md) for detailed instructions on building and exporting the app for Android.

## Troubleshooting

The app includes a "Customer Lookup" feature that can be used to test API connectivity and debug issues with the backend.

If you're having NFC scanning issues, try the following:
1. Use the "Debug Info" button in the NFC scan screen
2. Check that NFC is enabled on your device
3. Ensure you're tapping the card against the NFC reader area of your device
4. As a fallback, use the "Manual Entry" option to enter card IDs manually

## Configuration

The app can be configured by modifying the following files:

- `src/api/api.js` - Backend API URL configuration
- `app.json` - Expo app configuration

## Technology Stack

- React Native
- Expo
- React Navigation
- React Native NFC Manager

## License

This project is licensed under the MIT License - see the LICENSE file for details.