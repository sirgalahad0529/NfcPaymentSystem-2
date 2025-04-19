import { useState, useCallback, useEffect } from "react";
import { useIsMobile } from "./use-mobile";

interface ScanResult {
  cardId: string;
}

// Check if Web NFC API is available
const hasWebNFC = () => {
  return typeof window !== 'undefined' && 'NDEFReader' in window;
};

// Check if we're running in the Replit app WebView
const isReplitWebView = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  // Check for Replit's WebView specifically
  if (userAgent.includes('replit-bonsai')) {
    return true;
  }
  
  // Also check generic WebView indicators but exclude Chrome browser on Android
  if ((userAgent.includes('webview') || userAgent.includes('wv')) && 
      !(userAgent.includes('chrome') && !userAgent.includes('wv'))) {
    return true;
  }
  
  return false;
};

// This hook provides NFC scanning capability with fallbacks
export function useNFC() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nfcAvailable, setNfcAvailable] = useState(false);
  const [isInReplitWebView, setIsInReplitWebView] = useState(false);
  const isMobile = useIsMobile();
  
  // Check for NFC availability and environment
  useEffect(() => {
    setNfcAvailable(hasWebNFC() && !isReplitWebView());
    setIsInReplitWebView(isReplitWebView());
    console.log("Environment check - NFC available:", hasWebNFC(), "In Replit WebView:", isReplitWebView());
  }, []);

  // Helper function to normalize card IDs from different formats
  const normalizeCardId = (id: string): string => {
    if (!id) return 'CARD-UNKNOWN';
    
    // Remove all non-alphanumeric characters and convert to uppercase
    const alphaNum = id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    // Check if it already has a "CARD" prefix
    if (alphaNum.startsWith('CARD')) {
      // If it has CARD but no hyphen, add the hyphen
      if (!id.includes('-') && id.toUpperCase().startsWith('CARD')) {
        return 'CARD-' + alphaNum.substring(4);
      }
      return id.toUpperCase(); // Return with original format but uppercase
    } else {
      // Add the CARD- prefix if not present
      return 'CARD-' + alphaNum;
    }
  };

  // Start the NFC scan, optionally with a custom callback instead of using internal state
  const startScan = useCallback((callback?: (result: ScanResult) => void) => {
    // If already scanning, do nothing (prevent starting multiple scans)
    if (scanning) {
      console.log("Scan already in progress, ignoring startScan call");
      return () => {}; // Return empty cleanup function
    }
    
    console.log("Starting NFC scan");
    setScanning(true);
    setError(null);
    
    // If Web NFC is available (Chrome on Android), use it
    if (nfcAvailable) {
      try {
        console.log("Using Web NFC API for scanning");
        // @ts-ignore - TypeScript might not know about NDEFReader
        const ndef = new window.NDEFReader();
        
        let ndefCleanupDone = false;
        const errorHandler = (error: any) => {
          if (ndefCleanupDone) return;
          console.error("NFC Error:", error);
          setError(`NFC Error: ${error.message}`);
          setScanning(false);
        };
        
        const readingHandler = (event: any) => {
          if (ndefCleanupDone) return;
          console.log("NFC Tag detected!", event);
          
          // Extract serial number from the tag if available
          let tagId = '';
          if (event.serialNumber) {
            tagId = event.serialNumber;
          } else {
            // Generate a random ID if serial number is not available
            tagId = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
          }
          
          const result: ScanResult = {
            cardId: normalizeCardId(tagId)
          };
          
          if (callback) {
            callback(result);
          } else {
            setScanResult(result);
          }
          setScanning(false);
          
          // Clean up after successful reading
          cleanupNdefListeners();
        };
        
        // Function to clean up listeners
        const cleanupNdefListeners = () => {
          if (ndefCleanupDone) return;
          
          try {
            // Clean up listeners - using try-catch since the listeners might not exist
            ndef.removeEventListener("error", errorHandler);
            ndef.removeEventListener("reading", readingHandler);
            ndefCleanupDone = true;
            console.log("NFC listeners cleaned up");
          } catch (e) {
            console.warn("Error cleaning up NFC listeners:", e);
          }
        };
        
        // Start the scan
        ndef.scan()
          .then(() => {
            console.log("NFC scan started successfully");
            
            // Add event listeners
            ndef.addEventListener("error", errorHandler);
            ndef.addEventListener("reading", readingHandler);
          })
          .catch((error: Error) => {
            console.error("NFC Scan Error:", error);
            setError(`NFC scan failed: ${error.message}`);
            setScanning(false);
            
            // Fall back to simulation on error
            simulateScan(callback);
          });
        
        // Return cleanup function
        return () => {
          cleanupNdefListeners();
          setScanning(false);
        };
      } catch (error) {
        console.error("Web NFC API error:", error);
        // Fall back to simulation
        setScanning(false);
        return simulateScan(callback);
      }
    } else {
      // Fall back to simulation for non-NFC devices
      return simulateScan(callback);
    }
  }, [nfcAvailable, scanning]);
  
  // Simulate a scan for devices without NFC or for testing
  const simulateScan = (callback?: (result: ScanResult) => void) => {
    console.log("Using simulated NFC scanning");
    
    // Simulate a delay before detecting an NFC card
    const scanTimeout = setTimeout(() => {
      // For demo purposes, simulate success
      // Generate a random NFC card ID
      const simulatedResult: ScanResult = {
        cardId: `CARD-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`
      };
      
      if (callback) {
        callback(simulatedResult);
      } else {
        setScanResult(simulatedResult);
      }
      setScanning(false);
    }, 2000);
    
    return () => clearTimeout(scanTimeout);
  };
  
  // Cancel the scan
  const cancelScan = useCallback(() => {
    if (!scanning) {
      console.log("No active scan to cancel");
      return;
    }
    setScanning(false);
    setError("Scan canceled by user");
  }, [scanning]);
  
  // Reset the scan state for a new scan
  const resetScan = useCallback(() => {
    setScanResult(null);
    setError(null);
    setScanning(false); // Ensure scanning state is also reset
  }, []);
  
  return {
    scanning,
    scanResult,
    error,
    startScan,
    cancelScan,
    resetScan,
    nfcAvailable,
    isMobile,
    isInReplitWebView
  };
}
