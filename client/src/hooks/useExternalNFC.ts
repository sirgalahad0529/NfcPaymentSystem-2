import { useState, useEffect, useCallback } from 'react';

// Add WebUSB types since they're not included in the default TypeScript lib
declare global {
  interface Navigator {
    usb?: {
      getDevices(): Promise<USBDevice[]>;
      requestDevice(options: USBDeviceRequestOptions): Promise<USBDevice>;
      addEventListener(type: string, listener: EventListener): void;
      removeEventListener(type: string, listener: EventListener): void;
    };
  }

  interface USBDeviceRequestOptions {
    filters: Array<{
      vendorId?: number;
      productId?: number;
      classCode?: number;
      subclassCode?: number;
      protocolCode?: number;
      serialNumber?: string;
    }>;
  }

  interface USBDevice {
    productName: string;
    manufacturerName: string;
    opened: boolean;
    configuration: USBConfiguration | null;
    configurations: USBConfiguration[];
    open(): Promise<void>;
    close(): Promise<void>;
    selectConfiguration(configurationValue: number): Promise<void>;
    claimInterface(interfaceNumber: number): Promise<void>;
    releaseInterface(interfaceNumber: number): Promise<void>;
    transferIn(endpointNumber: number, length: number): Promise<USBInTransferResult>;
    transferOut(endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>;
  }

  interface USBConfiguration {
    configurationValue: number;
    interfaces: USBInterface[];
  }

  interface USBInterface {
    interfaceNumber: number;
    alternate: USBAlternateInterface;
    alternates: USBAlternateInterface[];
  }

  interface USBAlternateInterface {
    interfaceNumber: number;
    endpoints: USBEndpoint[];
  }

  interface USBEndpoint {
    endpointNumber: number;
    direction: string;
    type: string;
  }

  interface USBInTransferResult {
    data: DataView;
    status: string;
  }

  interface USBOutTransferResult {
    status: string;
    bytesWritten: number;
  }
}

interface NFCScanResult {
  cardId: string;
}

interface ExternalNFCHook {
  isReady: boolean;
  isScanning: boolean;
  error: string | null;
  debugInfo: string;
  connectToReader: () => Promise<boolean>;
  startScan: (callback: (result: NFCScanResult) => void) => Promise<boolean>;
  cancelScan: () => Promise<void>;
  simulateScan: (callback: (result: NFCScanResult) => void) => void;
}

// Normalize card ID to ensure consistent format
const normalizeCardId = (id: string): string => {
  // Remove any non-alphanumeric characters
  const cleanId = id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  // Add "CARD-" prefix if not present
  if (!cleanId.startsWith('CARD-')) {
    return `CARD-${cleanId}`;
  }
  
  return cleanId;
};

export const useExternalNFC = (): ExternalNFCHook => {
  const [device, setDevice] = useState<USBDevice | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('Initializing external NFC...');

  // Check if Web USB API is supported
  useEffect(() => {
    if (navigator.usb) {
      setDebugInfo('Web USB API is supported');
    } else {
      setError('Web USB API is not supported in this browser');
      setDebugInfo('Web USB API not supported');
    }
  }, []);

  // Connect to the NFC reader
  const connectToReader = useCallback(async (): Promise<boolean> => {
    try {
      setDebugInfo('Requesting USB device...');
      
      if (!navigator.usb) {
        throw new Error('Web USB API is not supported in this browser');
      }
      
      // Request USB device that matches NFC reader filters
      const usbDevice = await navigator.usb.requestDevice({
        filters: [
          // Common NFC reader vendor IDs - update based on your specific reader
          { vendorId: 0x04e6 }, // ACS readers
          { vendorId: 0x072f }, // Advanced Card Systems
          { vendorId: 0x054c }, // Sony
          // Add more filters based on your specific reader
        ]
      });
      
      setDebugInfo(`USB device selected: ${usbDevice.productName}`);
      
      await usbDevice.open();
      setDebugInfo('USB device opened');
      
      // Configuration is reader-specific and may need adjustment
      if (usbDevice.configuration === null) {
        await usbDevice.selectConfiguration(1);
        setDebugInfo('USB configuration selected');
      }
      
      // Get the first interface - most readers use interface 0
      // This might need customization based on your specific reader
      await usbDevice.claimInterface(0);
      setDebugInfo('USB interface claimed');
      
      setDevice(usbDevice);
      setIsReady(true);
      setDebugInfo('NFC reader connected and ready');
      return true;
    } catch (err: any) {
      console.error('Error connecting to NFC reader:', err);
      setError(err.message || 'Failed to connect to NFC reader');
      setDebugInfo(`Connection error: ${err.message}`);
      return false;
    }
  }, []);

  // Start scanning for NFC tags
  const startScan = useCallback(async (callback: (result: NFCScanResult) => void): Promise<boolean> => {
    if (!device) {
      setError('No NFC reader connected. Please connect a reader first.');
      return false;
    }
    
    try {
      setIsScanning(true);
      setError(null);
      setDebugInfo('Starting NFC scan...');
      
      // Setup a listener for incoming data
      if (navigator.usb) {
        navigator.usb.addEventListener('connect', (event: Event) => {
          console.log('USB device connected:', event);
        });
      }
      
      // This is a simplified example - actual implementation depends on your reader's protocol
      // Most NFC readers use APDU commands
      
      // Example command for ACR122U to get UID: FF CA 00 00 00
      // This is the "Get Data" command for the card UID
      const getUidCommand = new Uint8Array([0xFF, 0xCA, 0x00, 0x00, 0x00]);
      
      // Transfer the command to the reader
      setDebugInfo('Sending command to reader...');
      const result = await device.transferOut(1, getUidCommand.buffer);
      setDebugInfo(`Command sent, result: ${result.status}`);
      
      // Set up polling for tag detection
      // This is a simplified version - actual implementation would be more complex
      const pollInterval = setInterval(async () => {
        try {
          // Transfer the command to the reader
          await device.transferOut(1, getUidCommand.buffer);
          
          // Get the response
          const response = await device.transferIn(1, 64);
          
          if (response && response.data) {
            // Process the data
            const data = new Uint8Array(response.data.buffer);
            
            // Check if we have a valid response
            // For ACR122U, success response usually starts with 0x90, 0x00
            if (data.length > 2 && data[data.length - 2] === 0x90 && data[data.length - 1] === 0x00) {
              // Extract the card UID (excluding the status bytes at the end)
              const cardData = Array.from(data.slice(0, data.length - 2))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
              
              if (cardData) {
                setDebugInfo(`Card detected: ${cardData}`);
                
                // Normalize and return the card ID
                const normalizedId = normalizeCardId(cardData);
                
                clearInterval(pollInterval);
                setIsScanning(false);
                
                callback({ cardId: normalizedId });
                setDebugInfo(`Scan complete: ${normalizedId}`);
              }
            }
          }
        } catch (err: any) {
          // Ignore polling errors as they're expected when no card is present
          // But log for debugging
          console.log('Polling for card:', err.message);
        }
      }, 500); // Poll every 500ms
      
      // Store the interval ID for cleanup
      (window as any).nfcPollInterval = pollInterval;
      
      return true;
    } catch (err: any) {
      console.error('Error starting NFC scan:', err);
      setError(err.message || 'Failed to start NFC scan');
      setIsScanning(false);
      await cancelScan();
      return false;
    }
  }, [device]);

  // Cancel scanning
  const cancelScan = useCallback(async (): Promise<void> => {
    setDebugInfo('Cancelling NFC scan');
    setIsScanning(false);
    
    // Clear the polling interval if it exists
    if ((window as any).nfcPollInterval) {
      clearInterval((window as any).nfcPollInterval);
      (window as any).nfcPollInterval = null;
    }
    
    // For some readers, you might need to send a command to stop scanning
    if (device) {
      try {
        // Example: Send a cancel command (reader-specific)
        const cancelCommand = new Uint8Array([0xFF, 0x00, 0x40, 0x00, 0x00]);
        await device.transferOut(1, cancelCommand.buffer);
      } catch (err) {
        console.warn('Error sending cancel command:', err);
      }
    }
    
    setDebugInfo('NFC scan cancelled');
  }, [device]);

  // Simulate a scan for testing
  const simulateScan = useCallback((callback: (result: NFCScanResult) => void): void => {
    setDebugInfo('Simulating NFC scan...');
    
    // Generate a random card ID
    const randomId = (Math.floor(Math.random() * 10000000000)).toString(16).toUpperCase();
    const simulatedCardId = normalizeCardId(randomId);
    
    // Simulate a delay in scanning
    setTimeout(() => {
      setDebugInfo(`Simulated scan complete: ${simulatedCardId}`);
      callback({ cardId: simulatedCardId });
    }, 1500);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isScanning) {
        cancelScan();
      }
      
      // Release the interface and close the device when component unmounts
      if (device) {
        try {
          // Async but we can't await in useEffect cleanup
          device.releaseInterface(0).then(() => {
            device.close();
          });
        } catch (err) {
          console.warn('Error closing NFC reader:', err);
        }
      }
    };
  }, [device, isScanning, cancelScan]);

  return {
    isReady,
    isScanning,
    error,
    debugInfo,
    connectToReader,
    startScan,
    cancelScan,
    simulateScan
  };
};

// Combined hook that provides fallback options
export const useNFCWithFallback = (): ExternalNFCHook & { 
  useManualEntry: boolean;
  enterCardIdManually: (cardId: string, callback: (result: NFCScanResult) => void) => boolean;
} => {
  const externalNFC = useExternalNFC();
  const [useManualEntry, setUseManualEntry] = useState<boolean>(false);
  
  const startScan = async (callback: (result: NFCScanResult) => void): Promise<boolean> => {
    // Try to use external reader first
    if (externalNFC.isReady) {
      const success = await externalNFC.startScan(callback);
      if (success) return true;
    }
    
    // If external reader fails or isn't available, switch to manual entry
    setUseManualEntry(true);
    return false;
  };
  
  // Function to manually enter card ID
  const enterCardIdManually = (cardId: string, callback: (result: NFCScanResult) => void): boolean => {
    if (cardId && callback) {
      callback({ cardId: normalizeCardId(cardId) });
      return true;
    }
    return false;
  };
  
  return {
    ...externalNFC,
    useManualEntry,
    enterCardIdManually,
    startScan,
  };
};