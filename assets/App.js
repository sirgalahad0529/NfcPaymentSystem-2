import React, { useEffect, useState } from 'react';
import { StyleSheet, StatusBar, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import NetInfo from '@react-native-community/netinfo';

// Import components
import OfflineIndicator from './src/components/OfflineIndicator';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import NFCScanScreen from './src/screens/NFCScanScreen';
import PaymentDetailsScreen from './src/screens/PaymentDetailsScreen';
import CustomerDetailsScreen from './src/screens/CustomerDetailsScreen';
import CustomerRegistrationScreen from './src/screens/CustomerRegistrationScreen';
import BalanceScreen from './src/screens/BalanceScreen';
import ReloadScreen from './src/screens/ReloadScreen';
import PaymentResultScreen from './src/screens/PaymentResultScreen';
import CustomerLookupScreen from './src/screens/CustomerLookupScreen';

// Import utilities
import { saveNetworkStatus } from './src/utils/storage';
import { syncPendingTransactions } from './src/utils/sync';

// Create a stack navigator
const Stack = createStackNavigator();

// Check if we're using simulated API
const USE_SIMULATE_API = false;

export default function App() {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingTransactions, setPendingTransactions] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Set up network monitoring
  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      const networkIsConnected = state.isConnected && state.isInternetReachable;
      setIsOffline(!networkIsConnected);
      
      // Persist the network status for other components to use
      saveNetworkStatus(networkIsConnected);
      
      // If we're coming back online and have pending transactions, try to sync
      if (networkIsConnected && pendingTransactions > 0) {
        handleSync();
      }
    });
    
    // Check pending transactions on mount
    checkPendingTransactions();
    
    // Clean up on unmount
    return () => {
      unsubscribe();
    };
  }, [pendingTransactions]);
  
  // Function to check for pending transactions
  const checkPendingTransactions = async () => {
    try {
      // This would be implemented in a real app - for now use a mock value
      // const pendingTx = await loadPendingTransactions();
      // setPendingTransactions(pendingTx.length);
      setPendingTransactions(2); // Mock value for demonstration
    } catch (error) {
      console.error('Error checking pending transactions:', error);
    }
  };
  
  // Function to handle syncing pending transactions
  const handleSync = async () => {
    if (isSyncing) return;
    
    try {
      setIsSyncing(true);
      // In a real app, this would sync the transactions
      await syncPendingTransactions();
      
      // For this demo, simulate success after a delay
      setTimeout(() => {
        setPendingTransactions(0);
        setIsSyncing(false);
      }, 3000);
    } catch (error) {
      console.error('Error syncing transactions:', error);
      setIsSyncing(false);
    }
  };
  
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Network status indicator - always visible */}
      <OfflineIndicator 
        isOffline={isOffline} 
        syncing={isSyncing}
        pendingTransactions={pendingTransactions}
        onSyncPress={handleSync}
        simulatedMode={USE_SIMULATE_API}
      />
      
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#f5f5f5' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="NFCScan" component={NFCScanScreen} />
        <Stack.Screen name="PaymentDetails" component={PaymentDetailsScreen} />
        <Stack.Screen name="CustomerDetails" component={CustomerDetailsScreen} />
        <Stack.Screen name="CustomerRegistration" component={CustomerRegistrationScreen} />
        <Stack.Screen name="Balance" component={BalanceScreen} />
        <Stack.Screen name="Reload" component={ReloadScreen} />
        <Stack.Screen name="PaymentResult" component={PaymentResultScreen} />
        <Stack.Screen name="CustomerLookup" component={CustomerLookupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}