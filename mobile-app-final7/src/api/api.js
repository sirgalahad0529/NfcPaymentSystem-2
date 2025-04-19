/**
 * API module for NFC Payment System
 * 
 * This module handles all API interactions with the backend server.
 * It includes robust offline mode functionality that allows the app to continue
 * processing transactions even when internet connectivity is unavailable or erratic.
 * 
 * IMPORTANT: The offline mode is NOT just for simulated testing - it's a critical feature
 * for areas with poor or intermittent connectivity. The application:
 * 
 * 1. Detects network status automatically
 * 2. Caches customer data for offline access
 * 3. Processes payments and balance reloads while offline
 * 4. Stores transactions locally 
 * 5. Synchronizes with the server when connectivity is restored
 * 
 * Settings can be configured in the app under "Offline Settings", including:
 * - API URL configuration to connect to different backend servers
 * - Simulated API mode toggle for testing without a real backend
 * - Auto-sync preferences when connectivity is restored
 */

import { normalizeCardId } from '../utils/formatters';
import { shouldOperateOffline } from '../utils/network';
import { 
  findCachedCustomerByCardId, 
  getCachedCustomers, 
  getCachedTransactions, 
  savePendingTransaction, 
  addOfflineTransaction 
} from '../utils/storage';

// The base URL for the API
// IMPORTANT: This URL is now configurable in the app settings
// Format should be: https://your-replit-app-name.username.repl.co/api
// 
// INSTRUCTIONS for fixed deployment:
// 1. Replace the default URL below with your actual Replit URL
// 2. Remove the .replit.app part and replace with your username.repl.co
// 3. Check that it works by testing in Expo Go first

// Import the user settings
import { getUserSettings } from '../utils/storage';

// These values will be overridden by the user settings
let useSimulatedApi = true;
let apiBaseUrl = 'https://workspace.allanlucero29.repl.co/api';

// Load settings as soon as possible
(async () => {
  try {
    const settings = await getUserSettings();
    useSimulatedApi = settings.useSimulatedApi !== undefined ? settings.useSimulatedApi : true;
    apiBaseUrl = settings.apiUrl || 'https://workspace.allanlucero29.repl.co/api';
    console.log(`API Configuration loaded - Using ${useSimulatedApi ? 'simulated' : 'real'} API at ${apiBaseUrl}`);
  } catch (error) {
    console.error('Failed to load API settings:', error);
  }
})();

// Mock data for offline/simulation mode
const MOCK_DATA = {
  customers: [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '09123456789',
      cardId: 'CARD-12345',
      balance: 2500,
      createdAt: '2025-04-01T10:30:00Z'
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '09198765432',
      cardId: 'CARD-67890',
      balance: 5000,
      createdAt: '2025-04-02T14:45:00Z'
    },
    {
      id: 3,
      firstName: 'Maria',
      lastName: 'Santos',
      email: 'maria@example.com',
      phone: '09187654321',
      cardId: 'CARD-ABCDE',
      balance: 1500,
      createdAt: '2025-04-03T09:15:00Z'
    }
  ],
  transactions: [
    {
      id: 1,
      transactionId: 'trans_123456',
      customerId: 1,
      cardId: 'CARD-12345',
      amount: 500,
      type: 'payment',
      description: 'Coffee and snacks',
      status: 'success',
      createdAt: '2025-04-05T08:30:00Z',
      customerName: 'John Doe'
    },
    {
      id: 2,
      transactionId: 'reload_123456',
      customerId: 1,
      cardId: 'CARD-12345',
      amount: 1000,
      type: 'reload',
      description: 'Account reload',
      status: 'success',
      createdAt: '2025-04-04T15:20:00Z',
      customerName: 'John Doe'
    },
    {
      id: 3,
      transactionId: 'trans_789012',
      customerId: 2,
      cardId: 'CARD-67890',
      amount: 1500,
      type: 'payment',
      description: 'Lunch meal',
      status: 'success',
      createdAt: '2025-04-05T12:10:00Z',
      customerName: 'Jane Smith'
    }
  ]
};

// Helper function for simulated API delays
const simulateApiDelay = async () => {
  return new Promise(resolve => setTimeout(resolve, 500));
};

// Simulate an API response
const simulateApiResponse = async (data) => {
  await simulateApiDelay();
  return data;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    // Try to get error details from the response
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    } catch (e) {
      throw new Error(`API request failed with status ${response.status}`);
    }
  }
  
  return response.json();
};

// Customer API functions
export const customerAPI = {
  // Get a customer by their card ID
  getByCardId: async (cardId) => {
    try {
      const normalizedCardId = normalizeCardId(cardId);
      
      // Check if we're in offline mode
      const offline = await shouldOperateOffline();
      if (offline) {
        console.log(`[Offline] Getting customer by card ID: ${normalizedCardId}`);
        return await findCachedCustomerByCardId(normalizedCardId);
      }
      
      // Use simulated API if enabled
      if (useSimulatedApi) {
        console.log(`[Simulated API] Getting customer by card ID: ${normalizedCardId}`);
        const customer = MOCK_DATA.customers.find(c => c.cardId === normalizedCardId);
        
        if (!customer) {
          throw new Error('Customer not found');
        }
        
        return await simulateApiResponse(customer);
      }
      
      // Online mode - use real API
      const response = await fetch(`${apiBaseUrl}/customers/card/${normalizedCardId}`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching customer by card ID:', error);
      throw error;
    }
  },
  
  // Get all customers
  getAll: async () => {
    try {
      // Check if we're in offline mode
      const offline = await shouldOperateOffline();
      if (offline) {
        console.log('[Offline] Getting all customers from cache');
        return await getCachedCustomers();
      }
      
      // Use simulated API if enabled
      if (useSimulatedApi) {
        console.log('[Simulated API] Getting all customers');
        return await simulateApiResponse(MOCK_DATA.customers);
      }
      
      // Online mode - use real API
      const response = await fetch(`${apiBaseUrl}/customers`);
      const customers = await handleResponse(response);
      
      // Cache the results for offline use
      await getCachedCustomers(customers);
      
      return customers;
    } catch (error) {
      console.error('Error fetching all customers:', error);
      throw error;
    }
  },
  
  // Register a new customer with a card
  register: async (customerData) => {
    try {
      // Ensure card ID is normalized
      if (customerData.cardId) {
        customerData.cardId = normalizeCardId(customerData.cardId);
      }
      
      // Check if we're in offline mode - registration requires online connectivity
      const offline = await shouldOperateOffline();
      if (offline) {
        throw new Error('Customer registration is not available in offline mode');
      }
      
      const response = await fetch(`${apiBaseUrl}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error registering customer:', error);
      throw error;
    }
  },
  
  // Update a customer
  update: async (customerId, customerData) => {
    try {
      // Check if we're in offline mode - updates require online connectivity
      const offline = await shouldOperateOffline();
      if (offline) {
        throw new Error('Customer updates are not available in offline mode');
      }
      
      const response = await fetch(`${apiBaseUrl}/customers/${customerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },
};

// Transaction API functions
export const transactionAPI = {
  // Process a payment
  processPayment: async (paymentData) => {
    try {
      // Ensure card ID is normalized
      if (paymentData.cardId) {
        paymentData.cardId = normalizeCardId(paymentData.cardId);
      }
      
      // Check if we're in offline mode
      const offline = await shouldOperateOffline();
      if (offline) {
        console.log('[Offline] Processing payment in offline mode');
        
        // Get customer from cache to validate balance
        const customer = await findCachedCustomerByCardId(paymentData.cardId);
        
        if (!customer) {
          throw new Error('Customer not found in offline cache');
        }
        
        // Check if the customer has sufficient balance
        if (customer.balance < paymentData.amount) {
          throw new Error('Insufficient balance');
        }
        
        // Create an offline transaction
        const offlineTransaction = {
          id: `offline_payment_${Date.now()}`,
          transactionId: `offline_trans_${Math.random().toString(36).substr(2, 9)}`,
          customerId: customer.id,
          cardId: paymentData.cardId,
          amount: paymentData.amount,
          type: 'payment',
          description: paymentData.description || 'Offline payment',
          status: 'pending_sync',
          createdAt: new Date().toISOString(),
          items: paymentData.items || [],
          pendingSync: true
        };
        
        // Save the transaction to offline storage
        await addOfflineTransaction(offlineTransaction);
        
        // Manually update the cached customer's balance
        // Note: This is a temporary update until we can sync with the server
        customer.balance -= paymentData.amount;
        
        // Return the transaction with simulated success
        return {
          id: offlineTransaction.id,
          transactionId: offlineTransaction.transactionId,
          amount: offlineTransaction.amount,
          status: 'success',
          description: offlineTransaction.description,
          customerName: `${customer.firstName} ${customer.lastName}`,
          createdAt: offlineTransaction.createdAt,
          offlineMode: true,
          pendingSync: true
        };
      }
      
      // Online mode - use API
      const response = await fetch(`${apiBaseUrl}/payments/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },
  
  // Reload a customer's balance
  reloadBalance: async (reloadData) => {
    try {
      // Ensure card ID is normalized
      if (reloadData.cardId) {
        reloadData.cardId = normalizeCardId(reloadData.cardId);
      }
      
      // Check if we're in offline mode
      const offline = await shouldOperateOffline();
      if (offline) {
        console.log('[Offline] Processing balance reload in offline mode');
        
        // Get customer from cache
        const customer = await findCachedCustomerByCardId(reloadData.cardId);
        
        if (!customer) {
          throw new Error('Customer not found in offline cache');
        }
        
        // Create an offline transaction
        const offlineTransaction = {
          id: `offline_reload_${Date.now()}`,
          transactionId: `offline_trans_${Math.random().toString(36).substr(2, 9)}`,
          customerId: customer.id,
          cardId: reloadData.cardId,
          amount: reloadData.amount,
          type: 'reload',
          description: reloadData.description || 'Offline balance reload',
          status: 'pending_sync',
          createdAt: new Date().toISOString(),
          pendingSync: true
        };
        
        // Save the transaction to offline storage
        await addOfflineTransaction(offlineTransaction);
        
        // Manually update the cached customer's balance
        // Note: This is a temporary update until we can sync with the server
        customer.balance += reloadData.amount;
        
        // Return the transaction with simulated success
        return {
          id: offlineTransaction.id,
          transactionId: offlineTransaction.transactionId,
          amount: offlineTransaction.amount,
          status: 'success',
          description: offlineTransaction.description,
          customerName: `${customer.firstName} ${customer.lastName}`,
          createdAt: offlineTransaction.createdAt,
          offlineMode: true,
          pendingSync: true
        };
      }
      
      // Online mode - use API
      const response = await fetch(`${apiBaseUrl}/payments/reload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reloadData),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error reloading balance:', error);
      throw error;
    }
  },
  
  // Get transaction history
  getHistory: async () => {
    try {
      // Check if we're in offline mode
      const offline = await shouldOperateOffline();
      if (offline) {
        console.log('[Offline] Getting transaction history from cache');
        return await getCachedTransactions();
      }
      
      // Use simulated API if enabled
      if (useSimulatedApi) {
        console.log('[Simulated API] Getting transaction history');
        return await simulateApiResponse(MOCK_DATA.transactions);
      }
      
      // Online mode - use real API
      const response = await fetch(`${apiBaseUrl}/transactions`);
      const transactions = await handleResponse(response);
      
      // Cache the results for offline use
      await cacheTransactions(transactions);
      
      return transactions;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  },
  
  // Get transaction details by ID
  getById: async (transactionId) => {
    try {
      // Check if we're in offline mode
      const offline = await shouldOperateOffline();
      if (offline) {
        console.log(`[Offline] Getting transaction details for: ${transactionId}`);
        const transactions = await getCachedTransactions();
        return transactions.find(t => t.transactionId === transactionId || t.id === transactionId);
      }
      
      // Online mode - use API
      const response = await fetch(`${apiBaseUrl}/transactions/${transactionId}`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      throw error;
    }
  },
  
  // Get transactions by customer ID
  getByCustomerId: async (customerId) => {
    try {
      // Check if we're in offline mode
      const offline = await shouldOperateOffline();
      if (offline) {
        console.log(`[Offline] Getting transactions for customer: ${customerId}`);
        const transactions = await getCachedTransactions();
        return transactions.filter(t => t.customerId === customerId);
      }
      
      // Online mode - use API
      const response = await fetch(`${apiBaseUrl}/customers/${customerId}/transactions`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching customer transactions:', error);
      throw error;
    }
  },
  
  // Get transactions by card ID
  getByCardId: async (cardId) => {
    try {
      const normalizedCardId = normalizeCardId(cardId);
      
      // Check if we're in offline mode
      const offline = await shouldOperateOffline();
      if (offline) {
        console.log(`[Offline] Getting transactions for card: ${normalizedCardId}`);
        const transactions = await getCachedTransactions();
        return transactions.filter(t => t.cardId === normalizedCardId);
      }
      
      // Online mode - use API
      const response = await fetch(`${apiBaseUrl}/cards/${normalizedCardId}/transactions`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching card transactions:', error);
      throw error;
    }
  },
};