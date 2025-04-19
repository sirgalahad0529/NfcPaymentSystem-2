import { useState, useEffect, useCallback } from 'react';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import { normalizeCardId } from '../utils/formatters';
import { Alert } from 'react-native';

// Initialize NFC manager
const initNFC = async () => {
  try {
    await NfcManager.start();
    console.log('[NFC] Manager initialized successfully');
    return true;
  } catch (err) {
    console.error('[NFC] Failed to initialize NFC manager:', err);
    return false;
  }
};

// Initialize on import
initNFC();

export const useNFC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [supported, setSupported] = useState(false);
  const [debugInfo, setDebugInfo] = useState('Initializing NFC...');

  // Check if NFC is supported when the hook is first used
  useEffect(() => {
    const checkSupport = async () => {
      try {
        console.log('[NFC] Checking if NFC is supported...');
        const isSupported = await NfcManager.isSupported();
        setSupported(isSupported);
        
        if (isSupported) {
          console.log('[NFC] NFC is supported, starting NFC manager');
          await NfcManager.start();
          setDebugInfo('NFC is supported and initialized');
        } else {
          console.warn('[NFC] NFC is not supported on this device');
          setDebugInfo('NFC is not supported on this device');
        }
      } catch (ex) {
        console.error('[NFC] Error checking NFC support:', ex);
        setSupported(false);
        setDebugInfo(`NFC check failed: ${ex.message}`);
      }
    };
    
    checkSupport();
    
    // Cleanup
    return () => {
      if (isScanning) {
        cancelScan();
      }
    };
  }, []);

  // Function to display NFC debug info
  const showDebugInfo = useCallback(() => {
    Alert.alert(
      'NFC Debug Info',
      `Supported: ${supported}\nScanning: ${isScanning}\nError: ${error || 'None'}\nDebug: ${debugInfo}`,
      [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
  }, [supported, isScanning, error, debugInfo]);

  // Function to start NFC scanning
  const startScan = useCallback(async (callback) => {
    try {
      setIsScanning(true);
      setError(null);
      setDebugInfo('Starting NFC scan...');
      
      if (!supported) {
        setDebugInfo('NFC not supported, cannot scan');
        throw new Error('NFC is not supported on this device');
      }
      
      // Register tag event listener
      console.log('[NFC] Registering tag event listener');
      await NfcManager.registerTagEvent();
      setDebugInfo('NFC scan started, waiting for tag...');
      
      // Set up tag discovered listener
      console.log('[NFC] Setting up tag discovered listener');
      NfcManager.setEventListener(NfcTech.Ndef, async (event) => {
        try {
          console.log('[NFC] Tag event received:', event);
          setDebugInfo(`Tag detected: ${JSON.stringify(event)}`);
          
          if (event && event.tag && event.tag.id) {
            // Get the tag ID (UID)
            const tagId = event.tag.id;
            console.log('[NFC] Tag ID detected:', tagId);
            
            // Normalize the ID to ensure consistent format
            const normalizedId = normalizeCardId(tagId);
            console.log('[NFC] Normalized ID:', normalizedId);
            
            if (callback) {
              console.log('[NFC] Calling callback with card ID:', normalizedId);
              callback({ cardId: normalizedId });
            }
            
            // Clean up after successful scan
            console.log('[NFC] Unregistering tag event after successful scan');
            await NfcManager.unregisterTagEvent();
            setIsScanning(false);
            setDebugInfo(`Scan complete: ${normalizedId}`);
          } else {
            console.warn('[NFC] Invalid tag data received');
            setDebugInfo('Invalid tag data received');
          }
        } catch (err) {
          console.error('[NFC] Error processing NFC tag event:', err);
          setError(err.message || 'Error reading NFC tag');
          setDebugInfo(`Error processing tag: ${err.message}`);
        }
      });
      
    } catch (ex) {
      console.error('[NFC] Error starting NFC scan:', ex);
      setError(ex.message || 'Failed to start NFC scan');
      setDebugInfo(`Failed to start scan: ${ex.message}`);
      setIsScanning(false);
      cancelScan();
    }
  }, [supported]);

  // Function to cancel scanning
  const cancelScan = useCallback(async () => {
    try {
      console.log('[NFC] Cancelling NFC scan');
      setIsScanning(false);
      setDebugInfo('Cancelling NFC scan');
      await NfcManager.unregisterTagEvent();
      NfcManager.setEventListener(NfcTech.Ndef, null);
      setDebugInfo('NFC scan cancelled');
    } catch (ex) {
      console.warn('[NFC] Error cancelling NFC scan:', ex);
      setDebugInfo(`Error cancelling scan: ${ex.message}`);
    }
  }, []);

  // Function to simulate a scan for testing
  const simulateScan = useCallback((callback) => {
    // Generate a random card ID
    const randomId = (Math.floor(Math.random() * 10000000000)).toString(16).toUpperCase();
    const simulatedCardId = normalizeCardId(randomId);
    
    console.log('[NFC] Simulating scan with card ID:', simulatedCardId);
    setDebugInfo(`Simulating scan: ${simulatedCardId}`);
    
    // Simulate a delay in scanning
    setTimeout(() => {
      if (callback) {
        console.log('[NFC] Calling callback with simulated card ID');
        callback({ cardId: simulatedCardId });
        setDebugInfo(`Simulation complete: ${simulatedCardId}`);
      }
    }, 1500);
  }, []);

  return {
    isScanning,
    error,
    supported,
    debugInfo,
    startScan,
    cancelScan,
    simulateScan,
    showDebugInfo
  };
};