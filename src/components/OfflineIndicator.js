import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

/**
 * A component to display online/offline status and provide sync controls
 * @param {Object} props Component props
 * @param {boolean} props.isOffline Whether the app is in offline mode
 * @param {boolean} props.syncing Whether the app is currently syncing
 * @param {number} props.pendingTransactions Number of pending transactions to sync
 * @param {Function} props.onSyncPress Function to call when the sync button is pressed
 * @param {boolean} props.simulatedMode Whether the app is using simulated API mode
 * @returns {React.ReactElement} The offline indicator component
 */
const OfflineIndicator = ({ 
  isOffline, 
  syncing = false, 
  pendingTransactions = 0,
  onSyncPress,
  simulatedMode = false
}) => {
  const [syncMessage, setSyncMessage] = useState('');
  const [fadeAnim] = useState(new Animated.Value(1));
  
  // Get the appropriate background color based on app state
  const getBackgroundColor = () => {
    if (syncing) return '#3f51b5'; // Blue when syncing
    if (isOffline) return '#f44336'; // Red when offline
    if (simulatedMode) return '#ff9800'; // Orange when in simulated mode
    return '#4caf50'; // Green when online
  };
  
  // Display a temporary sync message when syncing starts or ends
  useEffect(() => {
    if (syncing) {
      setSyncMessage('Syncing data with server...');
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (syncMessage.includes('Syncing')) {
      // If we were syncing and now we're not, show success message
      setSyncMessage('Sync completed successfully!');
      
      // Fade out the message after 3 seconds
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => setSyncMessage(''));
      }, 3000);
    }
  }, [syncing]);

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      <View style={styles.content}>
        <Icon 
          name={
            syncing ? "sync" : 
            isOffline ? "cloud-off" : 
            simulatedMode ? "dns" : "cloud-done"
          } 
          size={20} 
          color="#fff"
        />
        <Text style={styles.text}>
          {syncing ? "Syncing..." : 
           isOffline ? "Offline Mode" : 
           simulatedMode ? "Simulated Mode" : "Online Mode"}
          {pendingTransactions > 0 && ` (${pendingTransactions} pending)`}
        </Text>
      </View>
      
      {/* Sync button shown when we have pending transactions and we're online */}
      {pendingTransactions > 0 && !isOffline && !syncing && (
        <TouchableOpacity 
          style={styles.syncButton} 
          onPress={onSyncPress}
          disabled={syncing}
        >
          <View style={styles.syncContent}>
            <Icon name="sync" size={16} color="#fff" />
            <Text style={styles.syncText}>Sync Now</Text>
          </View>
        </TouchableOpacity>
      )}
      
      {/* Activity indicator shown when syncing */}
      {syncing && (
        <ActivityIndicator size="small" color="#fff" />
      )}
      
      {/* Animated sync message */}
      {syncMessage ? (
        <Animated.View 
          style={[
            styles.syncMessageContainer, 
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.syncMessage}>{syncMessage}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  syncButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  syncContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  syncMessageContainer: {
    position: 'absolute',
    bottom: -30,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncMessage: {
    color: '#fff',
    fontSize: 12,
  }
});

export default OfflineIndicator;