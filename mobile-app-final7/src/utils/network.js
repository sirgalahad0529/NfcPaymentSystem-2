/**
 * Network Utility Module for NFC Payment System
 *
 * This module provides robust network connectivity detection for areas with erratic internet.
 * It's specifically designed to support offline operation in environments where connectivity
 * is unreliable or intermittent.
 *
 * Key features:
 * - Real-time network connectivity monitoring
 * - Deep internet access verification (beyond simple connected status)
 * - Offline mode determination with fallback mechanisms
 * - Connection resilience through retry mechanisms
 * - Network status persistence for consistent app behavior
 *
 * The utilities here are critical for the app's ability to function in areas with poor
 * connectivity while maintaining data integrity and ensuring transactions can continue.
 */
import NetInfo from '@react-native-community/netinfo';
import { saveNetworkStatus, getNetworkStatus } from './storage';

/**
 * Initialize network monitoring
 * @param {function} onConnectionChange Callback when connection state changes
 * @returns {function} Unsubscribe function
 */
export const initNetworkMonitoring = (onConnectionChange) => {
  // Set up network state change subscription
  const unsubscribe = NetInfo.addEventListener(state => {
    // Save connection state to storage
    saveNetworkStatus(state.isConnected);
    
    // Call callback if provided
    if (onConnectionChange) {
      onConnectionChange(state.isConnected);
    }
  });
  
  return unsubscribe;
};

/**
 * Check if the device is currently connected to the internet
 * @returns {Promise<boolean>} Whether the device is connected
 */
export const isConnected = async () => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected;
};

/**
 * Check if the device has internet access
 * This does a deeper check than isConnected by testing for actual internet access
 * @returns {Promise<boolean>} Whether the device has internet access
 */
export const hasInternetAccess = async () => {
  try {
    // Try to fetch a small resource to check for actual internet access
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.status === 204;
  } catch (error) {
    console.log('Internet access check failed:', error.message);
    return false;
  }
};

/**
 * Wait for internet connectivity before proceeding
 * @param {number} maxRetries Maximum number of retries (default: 5)
 * @param {number} retryDelay Delay between retries in ms (default: 2000)
 * @returns {Promise<boolean>} Whether internet connectivity was restored
 */
export const waitForConnectivity = async (maxRetries = 5, retryDelay = 2000) => {
  let retries = 0;
  
  while (retries < maxRetries) {
    const connected = await hasInternetAccess();
    
    if (connected) {
      return true;
    }
    
    // Wait before next retry
    await new Promise(resolve => setTimeout(resolve, retryDelay));
    retries++;
  }
  
  return false;
};

/**
 * Get the current network connection type
 * @returns {Promise<string>} Network connection type
 */
export const getConnectionType = async () => {
  const netInfo = await NetInfo.fetch();
  return netInfo.type;
};

/**
 * Determine if the app should operate in offline mode
 * 
 * This function is a critical decision point for the application's behavior.
 * It implements a multi-layer approach to network detection:
 * 1. First checks basic connectivity status (wifi/cellular connection)
 * 2. Then performs a real internet access test by attempting to reach an external endpoint
 * 3. Uses a conservative approach - defaults to offline mode unless connectivity is confirmed
 * 
 * In areas with erratic internet, this ensures the app can still process transactions
 * by defaulting to offline mode whenever connectivity is questionable. This prevents
 * transaction failures and provides a seamless experience in challenging environments.
 * 
 * @returns {Promise<boolean>} Whether the app should operate in offline mode
 */
export const shouldOperateOffline = async () => {
  // First check current network status
  const currentlyConnected = await isConnected();
  
  if (currentlyConnected) {
    // Double-check with actual internet access test
    // This is important because sometimes devices show as "connected" 
    // but actually have no internet access (e.g., connected to WiFi with no internet)
    const hasInternet = await hasInternetAccess();
    if (hasInternet) {
      return false; // We have confirmed internet, no need for offline mode
    }
  }
  
  // Default to offline mode when connectivity is uncertain
  // This conservative approach ensures transactions can still be processed
  // even when internet connectivity is questionable
  return true; 
};