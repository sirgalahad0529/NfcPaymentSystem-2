import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for different data types
const STORAGE_KEYS = {
  PENDING_TRANSACTIONS: 'pending_transactions',
  OFFLINE_CUSTOMERS: 'offline_customers',
  OFFLINE_TRANSACTIONS: 'offline_transactions',
  LAST_SYNC_TIMESTAMP: 'last_sync_timestamp',
  NETWORK_STATUS: 'network_status',
  USER_SETTINGS: 'user_settings',
};

/**
 * Save data to AsyncStorage
 * @param {string} key Storage key
 * @param {any} data Data to store (will be JSON stringified)
 * @returns {Promise<void>}
 */
export const saveData = async (key, data) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Load data from AsyncStorage
 * @param {string} key Storage key
 * @returns {Promise<any>} Parsed data or null if not found
 */
export const loadData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error loading data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Save a pending transaction for later sync
 * @param {Object} transaction Transaction data
 * @returns {Promise<void>}
 */
export const savePendingTransaction = async (transaction) => {
  try {
    // Generate a local ID for the pending transaction
    const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transactionWithId = { ...transaction, id: localId, pendingSync: true };
    
    // Get existing pending transactions
    const existingTransactions = await loadPendingTransactions();
    
    // Add new transaction to the list
    const updatedTransactions = [...existingTransactions, transactionWithId];
    
    // Save updated list
    await saveData(STORAGE_KEYS.PENDING_TRANSACTIONS, updatedTransactions);
    
    return localId;
  } catch (error) {
    console.error('Error saving pending transaction:', error);
    throw error;
  }
};

/**
 * Load all pending transactions
 * @returns {Promise<Array>} List of pending transactions
 */
export const loadPendingTransactions = async () => {
  try {
    const transactions = await loadData(STORAGE_KEYS.PENDING_TRANSACTIONS);
    return transactions || [];
  } catch (error) {
    console.error('Error loading pending transactions:', error);
    return [];
  }
};

/**
 * Remove a pending transaction by ID
 * @param {string} transactionId Transaction ID to remove
 * @returns {Promise<void>}
 */
export const removePendingTransaction = async (transactionId) => {
  try {
    const existingTransactions = await loadPendingTransactions();
    const updatedTransactions = existingTransactions.filter(t => t.id !== transactionId);
    await saveData(STORAGE_KEYS.PENDING_TRANSACTIONS, updatedTransactions);
  } catch (error) {
    console.error(`Error removing pending transaction ${transactionId}:`, error);
    throw error;
  }
};

/**
 * Cache customer data for offline access
 * @param {Array} customers List of customers
 * @returns {Promise<void>}
 */
export const cacheCustomers = async (customers) => {
  try {
    await saveData(STORAGE_KEYS.OFFLINE_CUSTOMERS, customers);
  } catch (error) {
    console.error('Error caching customers:', error);
    throw error;
  }
};

/**
 * Get cached customers
 * @returns {Promise<Array>} Cached customers or empty array
 */
export const getCachedCustomers = async () => {
  try {
    const customers = await loadData(STORAGE_KEYS.OFFLINE_CUSTOMERS);
    return customers || [];
  } catch (error) {
    console.error('Error getting cached customers:', error);
    return [];
  }
};

/**
 * Find a cached customer by card ID
 * @param {string} cardId The card ID to search for
 * @returns {Promise<Object|null>} The customer or null if not found
 */
export const findCachedCustomerByCardId = async (cardId) => {
  try {
    const customers = await getCachedCustomers();
    
    // First check for direct cardId property match (simpler model)
    const directMatch = customers.find(customer => customer.cardId === cardId);
    if (directMatch) {
      return directMatch;
    }
    
    // Then check for nested cards array (more complex model)
    return customers.find(customer => 
      customer.cards && customer.cards.some(card => card.cardId === cardId)
    ) || null;
  } catch (error) {
    console.error(`Error finding cached customer for card ${cardId}:`, error);
    return null;
  }
};

/**
 * Cache transaction data for offline access
 * @param {Array} transactions List of transactions
 * @returns {Promise<void>}
 */
export const cacheTransactions = async (transactions) => {
  try {
    await saveData(STORAGE_KEYS.OFFLINE_TRANSACTIONS, transactions);
  } catch (error) {
    console.error('Error caching transactions:', error);
    throw error;
  }
};

/**
 * Get cached transactions
 * @returns {Promise<Array>} Cached transactions or empty array
 */
export const getCachedTransactions = async () => {
  try {
    const transactions = await loadData(STORAGE_KEYS.OFFLINE_TRANSACTIONS);
    return transactions || [];
  } catch (error) {
    console.error('Error getting cached transactions:', error);
    return [];
  }
};

/**
 * Add a transaction to the offline cache (both pending and regular cache)
 * @param {Object} transaction Transaction data
 * @returns {Promise<void>}
 */
export const addOfflineTransaction = async (transaction) => {
  try {
    // Add to pending transactions for sync
    await savePendingTransaction(transaction);
    
    // Also add to regular transaction cache for display
    const cachedTransactions = await getCachedTransactions();
    const updatedTransactions = [transaction, ...cachedTransactions];
    await cacheTransactions(updatedTransactions);
  } catch (error) {
    console.error('Error adding offline transaction:', error);
    throw error;
  }
};

/**
 * Update the last sync timestamp
 * @returns {Promise<void>}
 */
export const updateLastSyncTimestamp = async () => {
  try {
    await saveData(STORAGE_KEYS.LAST_SYNC_TIMESTAMP, Date.now());
  } catch (error) {
    console.error('Error updating last sync timestamp:', error);
    throw error;
  }
};

/**
 * Get the last sync timestamp
 * @returns {Promise<number|null>} Timestamp or null if never synced
 */
export const getLastSyncTimestamp = async () => {
  try {
    return await loadData(STORAGE_KEYS.LAST_SYNC_TIMESTAMP);
  } catch (error) {
    console.error('Error getting last sync timestamp:', error);
    return null;
  }
};

/**
 * Save network status
 * @param {boolean} isConnected Whether the device is connected to the internet
 * @returns {Promise<void>}
 */
export const saveNetworkStatus = async (isConnected) => {
  try {
    await saveData(STORAGE_KEYS.NETWORK_STATUS, { isConnected, timestamp: Date.now() });
  } catch (error) {
    console.error('Error saving network status:', error);
    throw error;
  }
};

/**
 * Get saved network status
 * @returns {Promise<Object>} Network status object or default (disconnected)
 */
export const getNetworkStatus = async () => {
  try {
    const status = await loadData(STORAGE_KEYS.NETWORK_STATUS);
    return status || { isConnected: false, timestamp: Date.now() };
  } catch (error) {
    console.error('Error getting network status:', error);
    return { isConnected: false, timestamp: Date.now() };
  }
};

/**
 * Save user settings
 * @param {Object} settings User settings
 * @returns {Promise<void>}
 */
export const saveUserSettings = async (settings) => {
  try {
    await saveData(STORAGE_KEYS.USER_SETTINGS, settings);
  } catch (error) {
    console.error('Error saving user settings:', error);
    throw error;
  }
};

/**
 * Get user settings
 * @returns {Promise<Object>} User settings or default settings
 */
export const getUserSettings = async () => {
  try {
    const settings = await loadData(STORAGE_KEYS.USER_SETTINGS);
    return settings || {
      allowOfflineTransactions: true,
      syncOnConnection: true,
      defaultPaymentDescriptions: [],
      apiUrl: 'https://workspace.allanlucero29.repl.co/api',
      useSimulatedApi: true,
    };
  } catch (error) {
    console.error('Error getting user settings:', error);
    return {
      allowOfflineTransactions: true,
      syncOnConnection: true,
      defaultPaymentDescriptions: [],
      apiUrl: 'https://workspace.allanlucero29.repl.co/api',
      useSimulatedApi: true,
    };
  }
};

// Export STORAGE_KEYS for use in other modules
export { STORAGE_KEYS };