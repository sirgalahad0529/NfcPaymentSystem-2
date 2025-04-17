# NFC Payment System - Replit Deployment Guide

## Overview

This mobile application is designed to connect to a backend API hosted on Replit. This guide will help you understand how to correctly configure and deploy the application to work with your Replit backend.

## Important Configuration

### API URL Setup

The mobile app is configured to connect to a Replit-hosted backend. By default, it uses:

```
https://workspace.allanlucero29.repl.co/api
```

**You must update this to your own Replit URL before building the app.**

### How to Update the API URL

1. **Before Building:** Edit `src/api/api.js` and change the following line:
   ```javascript
   let apiBaseUrl = 'https://workspace.allanlucero29.repl.co/api';
   ```
   Replace it with your actual Replit URL:
   ```javascript
   let apiBaseUrl = 'https://your-project-name.yourusername.repl.co/api';
   ```

2. **After Installing:** You can also change the API URL inside the app:
   - Go to the main menu
   - Tap the gear/settings icon
   - Select "Offline Settings"
   - Enter your API URL
   - Save the settings

## Keeping Your Replit Backend Online

Your Replit backend needs to be running for the mobile app to connect to it:

1. Make sure your Replit project is deployed
2. Keep your Replit project open and running
3. For long-term deployments, consider using Replit's "Always On" feature 

## Testing the Connection

The app has a built-in connection status indicator:

- 🟢 **Green**: Connected to the online API
- 🔴 **Red**: Offline mode (no connection to the API)
- 🟠 **Orange**: Using simulated data
- 🔵 **Blue**: Synchronizing with the server

## Troubleshooting

If you have connection issues:

1. Check that your Replit backend is running
2. Verify the API URL is correct in the app settings
3. Ensure your mobile device has internet access
4. Check the app's logs for detailed error messages

## Offline Functionality

The app supports offline mode with data synchronization:

- Transactions created offline will be synchronized when connectivity is restored
- Customer data is cached for offline access
- Offline transactions maintain the same validation rules as online ones

## Support

If you encounter any issues with this deployment, please reach out for support.