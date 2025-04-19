# External NFC Reader Integration Guide for Chromebooks

## Introduction

This technical guide provides detailed instructions for integrating external NFC readers with the payment system on Chromebook devices. The integration utilizes the WebUSB API to communicate with USB-connected NFC reader hardware.

## Technical Requirements

### Hardware Requirements
- External NFC reader compatible with PC/SC interface (ACR122U recommended)
- USB connection to Chromebook
- CCID compliance for best compatibility

### Software Requirements
- Chrome OS version 88 or newer
- Chrome browser (89+) with WebUSB support
- JavaScript enabled

## WebUSB Implementation

### Pre-connection Configuration

The WebUSB implementation follows these steps:

1. Filter for USB devices matching vendor/product IDs of supported NFC readers
2. Request user permission via browser dialog
3. Claim interface for communication
4. Configure device for bi-directional communication

### Communication Protocol

The application implements the PC/SC communication protocol with the following APDU command structure:

```
CLA INS P1 P2 Lc Data Le
```

Where:
- CLA: Class byte (typically 0xFF for proprietary commands)
- INS: Instruction byte
- P1, P2: Parameter bytes
- Lc: Length of command data
- Data: Command data (optional)
- Le: Expected length of response

## Implementation Steps

### Step 1: USB Device Detection

```javascript
const usbFilters = [
  { vendorId: 0x072F, productId: 0x2200 },  // ACR122U
  { vendorId: 0x072F, productId: 0x90CC },  // ACS ACR1252
  // Add additional readers as needed
];

navigator.usb.requestDevice({ filters: usbFilters })
  .then(device => {
    console.log("Device connected:", device.productName);
    return device.open();
  })
  .catch(error => {
    console.error("Error connecting to USB device:", error);
  });
```

### Step 2: Interface Configuration

```javascript
// After device is opened
device.selectConfiguration(1)
  .then(() => device.claimInterface(0))
  .then(() => {
    console.log("Interface claimed successfully");
    // Ready to communicate
  })
  .catch(error => {
    console.error("Error configuring device:", error);
  });
```

### Step 3: NFC Card Detection

```javascript
// APDU command to get card status
const getStatusCommand = new Uint8Array([
  0xFF, 0xCA, 0x00, 0x00, 0x00
]);

// Send command to device
device.transferOut(ENDPOINT_OUT, getStatusCommand)
  .then(() => device.transferIn(ENDPOINT_IN, 64))
  .then(result => {
    const data = new Uint8Array(result.data.buffer);
    const status = new Uint8Array(data.buffer, data.byteLength - 2, 2);
    
    if (status[0] === 0x90 && status[1] === 0x00) {
      // Success - card detected
      const cardId = Array.from(data.slice(0, data.byteLength - 2))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('').toUpperCase();
      console.log("Card detected:", cardId);
      return cardId;
    } else {
      // Error or no card present
      console.log("No card detected or error");
      return null;
    }
  })
  .catch(error => {
    console.error("Error communicating with NFC reader:", error);
  });
```

## Error Handling

Common errors and resolution strategies:

| Error | Description | Resolution |
|-------|-------------|------------|
| Access Denied | User did not grant permission | Prompt user to allow device access in Chrome |
| Device Busy | Another application using the device | Close other applications accessing the reader |
| Transfer Error | Failed communication | Check USB connection, retry or reset device |
| Configuration Failed | Interface claim issue | Disconnect/reconnect device, restart browser |

## Power Management Considerations

External NFC readers may have specific power requirements not always met by Chromebook USB ports. Consider:

1. Using powered USB hubs for readers with higher power needs
2. Ensuring the Chromebook is on AC power when using readers
3. Implementing error handling for power-related disconnections

## Security Considerations

1. Always validate card UIDs against trusted sources
2. Consider encrypting communication between application and server
3. Implement timeout for idle reader connections
4. Clear card data from memory after processing

## Performance Optimization

1. Only connect to reader when needed
2. Release USB interface when reader is idle
3. Implement connection pooling for multi-user environments
4. Cache reader configuration to optimize reconnections

## Troubleshooting

If encountering issues with the reader:

1. Check Chrome USB permissions in Settings > Privacy and Security > Site Settings > USB devices
2. Verify reader firmware is up-to-date
3. Try alternative USB ports
4. Test with known working NFC cards to isolate issues
5. Check Chrome console for WebUSB-specific errors

## Additional Resources

- [WebUSB API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/USB)
- [PC/SC Workgroup Specifications](https://pcscworkgroup.com/specifications/)
- [ACR122U NFC Reader Documentation](https://www.acs.com.hk/en/products/3/acr122u-usb-nfc-reader/)

## Support and Contact

For technical assistance with NFC reader implementation, contact the system administrator or refer to hardware vendor documentation.

*This implementation has been tested with Chrome OS versions 88-102 and may require adjustments for future releases.*