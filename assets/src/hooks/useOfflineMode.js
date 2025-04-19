import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { 
  shouldOperateOffline, 
  initNetworkMonitoring 
} from '../utils/network';
import { 
  getCachedCustomers, 
  getCachedTransactions,
  getNetworkStatus,
  getUserSettings
} from '../utils/storage';
import {
  performFullSync
} from '../utils/sync';

/**
 * Hook for managing offline mode functionality
 * @returns {Object} Offline mode state and functions
 */
export const useOfflineMode = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [pendingTransactions, setPendingTransactions] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [settings, setSettings] = useState({
    allowOfflineTransactions: true,
    syncOnConnection: true
  });

  // Initialize offline mode detection
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check if we should operate in offline mode
        const offline = await shouldOperateOffline();
        setIsOffline(offline);
        
        // Get network status from storage
        const networkStatus = await getNetworkStatus();
        setLastSyncTime(networkStatus.timestamp);
        
        // Get user settings
        const userSettings = await getUserSettings();
        setSettings(userSettings);
        
        setIsInitializing(false);
      } catch (error) {
        console.error('Failed to initialize offline mode:', error);
        setIsInitializing(false);
      }
    };
    
    initialize();
    
    // Set up network monitoring
    const unsubscribe = initNetworkMonitoring(async (isConnected) => {
      setIsOffline(!isConnected);
      
      // If we just came back online and settings allow auto-sync
      if (isConnected && settings.syncOnConnection) {
        syncData();
      }
    });
    
    // Clean up network monitoring on unmount
    return () => {
      unsubscribe();
    };
  }, [settings.syncOnConnection]);
  
  // Function to fetch data based on current mode (online/offline)
  const fetchCustomers = useCallback(async () => {
    if (isOffline) {
      // Use cached data when offline
      return await getCachedCustomers();
    } else {
      // Use online data when connected
      // This is handled by the regular API functions in the components
      return null;
    }
  }, [isOffline]);
  
  const fetchTransactions = useCallback(async () => {
    if (isOffline) {
      // Use cached data when offline
      return await getCachedTransactions();
    } else {
      // Use online data when connected
      // This is handled by the regular API functions in the components
      return null;
    }
  }, [isOffline]);
  
  // Function to sync data with server
  const syncData = useCallback(async (forceSync = false) => {
    if (isOffline && !forceSync) {
      Alert.alert(
        'Offline Mode',
        'Cannot sync while offline. Please connect to the internet and try again.',
        [{ text: 'OK' }]
      );
      return { success: false, message: 'Device is offline' };
    }
    
    try {
      setSyncing(true);
      
      const result = await performFullSync(forceSync);
      
      if (result.success) {
        Alert.alert(
          'Sync Complete',
          `Successfully synced ${result.transactionsSynced} transaction(s). ${result.transactionsFailed} failed.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Sync Failed',
          result.message || 'Failed to sync data with server',
          [{ text: 'OK' }]
        );
      }
      
      setSyncing(false);
      return result;
    } catch (error) {
      setSyncing(false);
      Alert.alert(
        'Sync Error',
        `Error syncing data: ${error.message}`,
        [{ text: 'OK' }]
      );
      return { success: false, message: error.message };
    }
  }, [isOffline]);
  
  return {
    isOffline,
    isInitializing,
    lastSyncTime,
    pendingTransactions,
    syncing,
    settings,
    fetchCustomers,
    fetchTransactions,
    syncData
  };
};