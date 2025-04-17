# Chromebook NFC Payment System Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the NFC payment system on Chromebooks with external USB NFC readers. This configuration is ideal for environments with stable internet connections where mobility is required.

## Hardware Requirements

1. Chromebook with Chrome OS version 88 or newer
2. External USB NFC reader compatible with WebUSB (ACR122U recommended)
3. Internet connection (Wi-Fi or Ethernet)
4. NFC cards (MIFARE Classic or MIFARE Ultralight recommended)

## Software Prerequisites

- Chrome browser version 89 or newer
- WebUSB enabled (enabled by default in Chrome)
- Administrator access if deploying in a managed Chromebook environment

## Pre-deployment Setup

### NFC Reader Configuration

1. Connect the NFC reader to a USB port on the Chromebook
2. If prompted, allow Chrome to access the USB device
3. Verify the reader's LED indicator is on (usually solid green for ACR122U)

### Application Configuration

The application has been configured to automatically detect external NFC readers connected via USB. The system will:

- Detect when an external reader is connected
- Request permission to access the reader
- Use the external reader for all NFC operations
- Fall back to manual entry if no reader is detected

## Deployment Steps

### Step 1: System Installation

1. Open Chrome browser and navigate to the application URL
2. If prompted, click "Allow" to permit access to the USB NFC reader
3. Verify the system recognizes the NFC reader (indicated in the status bar)
4. Log in with administrator credentials

### Step 2: Reader Authorization

1. Navigate to the "NFC Scan" page
2. Click "Connect Reader" button
3. In the USB permission dialog, select your NFC reader model
4. Click "Connect" to authorize Chrome to access the reader

### Step 3: Configuration Verification

1. Place an NFC card on the reader
2. The system should detect the card and display its unique ID
3. Verify the card scanning works by completing a test transaction

## Troubleshooting

### Reader Not Detected

1. Disconnect and reconnect the reader
2. Ensure Chrome has permission to access USB devices
3. Try a different USB port
4. Restart the Chromebook

### Permission Errors

1. Check chrome://settings/content/usbDevices for blocked devices
2. Reset site permissions in Chrome settings
3. Try using Incognito mode to rule out extension conflicts

### Scan Failures

1. Ensure card is properly positioned on the reader
2. Check that the card is a supported type
3. Try cleaning the reader surface with compressed air
4. Verify reader has sufficient power (some readers require powered USB hubs)

## Performance Optimization

For optimal performance in a Chromebook environment:

1. Use Chrome's "Install as app" feature to create a standalone application
2. Disable unnecessary Chrome extensions
3. Keep the Chromebook plugged in when possible (USB readers may drain battery)
4. Consider using a USB hub with external power for reliable reader operation

## Security Considerations

1. Enable Chromebook screen lock when unattended
2. Log out of the application when not in use
3. Store NFC cards securely when not being used
4. Regularly update Chrome to ensure security patches are applied

## Support and Maintenance

For technical support or maintenance assistance:

1. Check the application's help section for updates
2. Contact system administrator for permission-related issues
3. For hardware issues, contact the NFC reader manufacturer
4. Perform regular system updates to ensure optimal performance

## Appendix: Compatible NFC Readers

The following NFC readers have been tested and confirmed working with this system:

- ACR122U (recommended)
- ACS ACR1252U
- Identiv uTrust 4701 F
- HID Omnikey 5022
- Sony RC-S380

*Note: Reader functionality may vary based on firmware version and driver compatibility.*