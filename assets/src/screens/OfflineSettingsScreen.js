import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getUserSettings, saveUserSettings } from '../utils/storage';
import { performFullSync } from '../utils/sync';
import { shouldOperateOffline } from '../utils/network';

/**
 * Screen for managing offline mode settings
 */
const OfflineSettingsScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    allowOfflineTransactions: true,
    syncOnConnection: true,
    apiUrl: 'https://workspace.allanlucero29.repl.co/api',
    useSimulatedApi: true,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await getUserSettings();
        setSettings(savedSettings);
        
        // Check if we're offline
        const offline = await shouldOperateOffline();
        setIsOffline(offline);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading settings:', error);
        setIsLoading(false);
        Alert.alert('Error', 'Failed to load settings');
      }
    };
    
    loadSettings();
  }, []);

  // Save settings when they change
  const handleSettingChange = async (key, value) => {
    try {
      const updatedSettings = { ...settings, [key]: value };
      setSettings(updatedSettings);
      await saveUserSettings(updatedSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  // Trigger sync manually
  const handleSyncPress = async () => {
    if (isOffline) {
      Alert.alert(
        'Offline Mode',
        'Cannot sync while offline. Please connect to the internet and try again.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsSyncing(true);
    
    try {
      const result = await performFullSync(true);
      
      if (result.success) {
        Alert.alert(
          'Sync Complete',
          `Successfully synced ${result.transactionsSynced} transaction(s). ${result.transactionsFailed} failed.`,
          [{ text: 'OK' }]
        );
        setLastSyncTime(new Date());
      } else {
        Alert.alert(
          'Sync Failed',
          result.message || 'Failed to sync data with server',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', `Sync failed: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offline Settings</Text>
      </View>
      
      {isOffline && (
        <View style={styles.offlineIndicator}>
          <Icon name="cloud-off" size={20} color="#fff" />
          <Text style={styles.offlineText}>You are currently offline</Text>
        </View>
      )}
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synchronization</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Auto-sync when online</Text>
              <Text style={styles.settingDescription}>
                Automatically synchronize pending transactions when an internet connection becomes available
              </Text>
            </View>
            <Switch
              value={settings.syncOnConnection}
              onValueChange={(value) => handleSettingChange('syncOnConnection', value)}
              trackColor={{ false: '#d1d1d1', true: '#4caf50' }}
              thumbColor={settings.syncOnConnection ? '#2e7d32' : '#f5f5f5'}
            />
          </View>
          
          <TouchableOpacity
            style={[
              styles.syncButton,
              (isSyncing || isOffline) && styles.syncButtonDisabled
            ]}
            onPress={handleSyncPress}
            disabled={isSyncing || isOffline}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View style={styles.syncButtonContent}>
                <Icon name="sync" size={18} color="#fff" />
                <Text style={styles.syncButtonText}>Sync Now</Text>
              </View>
            )}
          </TouchableOpacity>
          
          {lastSyncTime && (
            <Text style={styles.lastSyncText}>
              Last synced: {lastSyncTime.toLocaleString()}
            </Text>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offline Functionality</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Allow offline transactions</Text>
              <Text style={styles.settingDescription}>
                Enable processing payments and reloads while offline (transactions will be synced when online)
              </Text>
            </View>
            <Switch
              value={settings.allowOfflineTransactions}
              onValueChange={(value) => handleSettingChange('allowOfflineTransactions', value)}
              trackColor={{ false: '#d1d1d1', true: '#4caf50' }}
              thumbColor={settings.allowOfflineTransactions ? '#2e7d32' : '#f5f5f5'}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Configuration</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.settingTitle}>API URL</Text>
            <Text style={styles.settingDescription}>
              Enter the URL of your API server (e.g., https://your-project.replit.app/api)
            </Text>
            <TextInput
              style={styles.textInput}
              value={settings.apiUrl}
              onChangeText={(value) => handleSettingChange('apiUrl', value)}
              placeholder="Enter API URL"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Use Simulated API</Text>
              <Text style={styles.settingDescription}>
                Enable to use mock data for testing (no internet connection required)
              </Text>
            </View>
            <Switch
              value={settings.useSimulatedApi}
              onValueChange={(value) => handleSettingChange('useSimulatedApi', value)}
              trackColor={{ false: '#d1d1d1', true: '#4caf50' }}
              thumbColor={settings.useSimulatedApi ? '#2e7d32' : '#f5f5f5'}
            />
          </View>
          
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => {
              // Show a message explaining the setting will take effect after restart
              Alert.alert(
                'API Configuration',
                'API configuration changes will take effect after restarting the app.',
                [{ text: 'OK' }]
              );
            }}
          >
            <Text style={styles.testButtonText}>Save API Configuration</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoSection}>
          <Icon name="info-outline" size={20} color="#0066cc" />
          <Text style={styles.infoText}>
            In offline mode, you can still process payments and reloads, but the data will be stored locally until you connect to the internet and sync.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f44336',
    padding: 8,
    paddingHorizontal: 16,
  },
  offlineText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  syncButton: {
    backgroundColor: '#0066cc',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  syncButtonDisabled: {
    backgroundColor: '#b0bec5',
  },
  syncButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  lastSyncText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    marginTop: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  testButton: {
    backgroundColor: '#5046E5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default OfflineSettingsScreen;