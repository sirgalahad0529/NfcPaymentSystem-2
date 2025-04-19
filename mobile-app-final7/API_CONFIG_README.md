# API Configuration & Chromebook Support Guide

## New Features in v1.1.0

This document outlines the new API configuration options and Chromebook support added in v1.1.0 of the NFC Payment System.

## API Configuration

The application now supports configurable API endpoints, which is essential for deploying to different environments.

### Configuring the API URL

1. Navigate to "Settings" → "Offline Settings" in the mobile application
2. Locate the "API Configuration" section
3. Enter your backend API URL (e.g., `https://your-server.replit.app/api`)
4. Toggle "Use Simulated API" off for production use, or on for testing without a backend

### Benefits of Configurable API

- Deploy to multiple environments (development, staging, production) without rebuilding
- Test with simulated data when no internet connection is available
- Quickly switch between different backend servers

## Chromebook Deployment

This version adds support for Chromebook deployment with external USB NFC readers.

### Hardware Requirements

- Chromebook running Chrome OS
- External NFC reader compatible with USB (recommended: ACR122U or similar)
- Internet connectivity (optional, app works offline)

### Setup Instructions

1. Connect the external NFC reader to a USB port on the Chromebook
2. Open Chrome and navigate to your deployed web app
3. When prompted, allow the application to access the USB device
4. Configure the API URL to point to your backend server

### Using with External NFC Readers

The application will:

1. Detect connected USB NFC readers
2. Request permission to access the reader
3. Automatically poll for NFC cards when scanning is initiated
4. Fallback to manual entry if no reader is detected or permission is denied

### Configuration Tips

- Use simulated mode for testing when a physical NFC reader is not available
- For production use, ensure "Use Simulated API" is turned off
- If experiencing issues with the NFC reader, check the USB connection and try reconnecting

## Offline Functionality

The application continues to support robust offline functionality, which is particularly important for areas with erratic internet connectivity:

- All transactions are stored locally when offline
- Data synchronizes automatically when connection is restored
- Visual indicators show the current connection status:
  - Green: Online (connected to backend)
  - Red: Offline (no internet connection)
  - Blue: Syncing (uploading stored transactions)
  - Orange: Simulated mode (using local data only)

## Troubleshooting

If you encounter issues with the Chromebook deployment:

1. **NFC Reader Not Detected**
   - Check physical connection
   - Try a different USB port
   - Restart Chrome

2. **Permission Issues**
   - Look for the permission prompt in Chrome
   - Reset site permissions in Chrome settings

3. **API Connection Issues**
   - Verify the API URL configuration
   - Check internet connectivity
   - Confirm the backend server is running

## More Information

For detailed technical information about implementing NFC with external readers on Chromebooks, refer to the `CHROMEBOOK_NFC_GUIDE.md` in the documentation folder.