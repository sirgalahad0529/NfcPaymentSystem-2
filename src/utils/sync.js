import { 
  loadPendingTransactions, 
  removePendingTransaction, 
  updateLastSyncTimestamp,
  cacheCustomers,
  cacheTransactions 
} from './storage';
import { customerAPI, transactionAPI } from '../api/api';
import { hasInternetAccess, waitForConnectivity } from './network';

/**
 * Sync pending transactions with the server
 * @returns {Promise<{success: number, failed: number}>} Sync results
 */
export const syncPendingTransactions = async () => {
  // Check for internet connectivity
  const isConnected = await hasInternetAccess();
  
  if (!isConnected) {
    console.log('Cannot sync transactions: No internet connection');
    throw new Error('No internet connection available for synchronization');
  }
  
  // Get all pending transactions
  const pendingTransactions = await loadPendingTransactions();
  
  if (pendingTransactions.length === 0) {
    console.log('No pending transactions to sync');
    return { success: 0, failed: 0 };
  }
  
  console.log(`Syncing ${pendingTransactions.length} pending transactions`);
  
  // Process each transaction
  let successCount = 0;
  let failedCount = 0;
  
  for (const transaction of pendingTransactions) {
    try {
      // Determine transaction type and send to appropriate endpoint
      if (transaction.type === 'payment') {
        await transactionAPI.processPayment(transaction);
      } else if (transaction.type === 'reload') {
        await transactionAPI.reloadBalance(transaction);
      }
      
      // If successful, remove from pending queue
      await removePendingTransaction(transaction.id);
      successCount++;
      
      console.log(`Successfully synced transaction ${transaction.id}`);
    } catch (error) {
      console.error(`Failed to sync transaction ${transaction.id}:`, error);
      failedCount++;
    }
  }
  
  // Update last sync timestamp
  await updateLastSyncTimestamp();
  
  console.log(`Sync completed: ${successCount} successful, ${failedCount} failed`);
  
  return { success: successCount, failed: failedCount };
};

/**
 * Refresh all cached data from server
 * @returns {Promise<boolean>} Whether refresh was successful
 */
export const refreshCachedData = async () => {
  try {
    // Check for internet connectivity
    const isConnected = await hasInternetAccess();
    
    if (!isConnected) {
      console.log('Cannot refresh cached data: No internet connection');
      return false;
    }
    
    // Fetch and cache customers
    const customers = await customerAPI.getAll();
    await cacheCustomers(customers);
    
    // Fetch and cache transactions
    const transactions = await transactionAPI.getHistory();
    await cacheTransactions(transactions);
    
    // Update last sync timestamp
    await updateLastSyncTimestamp();
    
    console.log('Successfully refreshed cached data');
    return true;
  } catch (error) {
    console.error('Failed to refresh cached data:', error);
    return false;
  }
};

/**
 * Perform a full sync (both upload pending data and refresh cached data)
 * @param {boolean} forceSyncEvenIfOffline Try to wait for connectivity if currently offline
 * @returns {Promise<{success: boolean, transactionsSynced: number, transactionsFailed: number}>}
 */
export const performFullSync = async (forceSyncEvenIfOffline = false) => {
  try {
    // Check for internet connectivity
    let isConnected = await hasInternetAccess();
    
    // If not connected but force sync requested, wait for connectivity
    if (!isConnected && forceSyncEvenIfOffline) {
      console.log('No connection, waiting for connectivity...');
      isConnected = await waitForConnectivity();
    }
    
    if (!isConnected) {
      console.log('Cannot perform sync: No internet connection');
      return { 
        success: false, 
        transactionsSynced: 0, 
        transactionsFailed: 0,
        message: 'No internet connection' 
      };
    }
    
    // First sync pending transactions
    const { success, failed } = await syncPendingTransactions();
    
    // Then refresh cached data
    const refreshSuccess = await refreshCachedData();
    
    return {
      success: refreshSuccess,
      transactionsSynced: success,
      transactionsFailed: failed,
      message: 'Sync completed successfully'
    };
  } catch (error) {
    console.error('Failed to perform full sync:', error);
    return { 
      success: false, 
      transactionsSynced: 0, 
      transactionsFailed: 0,
      message: `Sync failed: ${error.message}` 
    };
  }
};