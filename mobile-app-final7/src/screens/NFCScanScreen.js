import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNFC } from '../hooks/useNFC';
import { normalizeCardId } from '../utils/formatters';

const NFCScanScreen = ({ navigation, route }) => {
  const { scanPurpose, onScanComplete } = route.params || {};
  const { isScanning, error, supported, debugInfo, startScan, cancelScan, simulateScan, showDebugInfo } = useNFC();
  const [manualEntryVisible, setManualEntryVisible] = useState(false);
  const [manualCardId, setManualCardId] = useState('');
  
  // Purpose-specific label and description
  const getPurposeText = () => {
    switch (scanPurpose) {
      case 'payment':
        return {
          title: 'Payment',
          description: 'Scan customer card to process payment'
        };
      case 'balance':
        return {
          title: 'Balance Inquiry',
          description: 'Scan customer card to check balance'
        };
      case 'reload':
        return {
          title: 'Reload Account',
          description: 'Scan customer card to reload balance'
        };
      case 'registration':
        return {
          title: 'Customer Registration',
          description: 'Scan new card to register a customer'
        };
      default:
        return {
          title: 'Scan Card',
          description: 'Please tap an NFC card to scan'
        };
    }
  };
  
  const purposeText = getPurposeText();
  
  // Start scanning when component mounts
  useEffect(() => {
    if (supported) {
      handleStartScan();
    }
    
    // Cleanup when component unmounts
    return () => {
      if (isScanning) {
        cancelScan();
      }
    };
  }, [supported]);
  
  // Handle scan result
  const handleScanResult = (result) => {
    if (result && result.cardId) {
      if (onScanComplete) {
        // Use the callback from route params if provided
        onScanComplete(result);
      } else {
        // Otherwise, navigate based on purpose
        handleNavigateAfterScan(result);
      }
    }
  };
  
  // Start NFC scanning
  const handleStartScan = () => {
    startScan(handleScanResult);
  };
  
  // Use simulated scan for testing or when NFC is not supported
  const handleSimulateScan = () => {
    simulateScan(handleScanResult);
  };
  
  // Navigate to appropriate screen after scan based on purpose
  const handleNavigateAfterScan = (result) => {
    switch (scanPurpose) {
      case 'payment':
        navigation.replace('CustomerDetails', { scanResult: result });
        break;
      case 'balance':
        navigation.replace('Balance', { scanResult: result });
        break;
      case 'reload':
        navigation.replace('Reload', { scanResult: result });
        break;
      case 'registration':
        navigation.replace('CustomerRegistration', { scanResult: result });
        break;
      default:
        // Default to customer details if no specific purpose
        navigation.replace('CustomerDetails', { scanResult: result });
    }
  };
  
  // Handle manual card ID entry
  const handleManualEntry = () => {
    if (!manualCardId.trim()) {
      Alert.alert('Error', 'Please enter a card ID');
      return;
    }
    
    const normalizedId = normalizeCardId(manualCardId);
    const result = { cardId: normalizedId };
    setManualEntryVisible(false);
    handleScanResult(result);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.spacer} />
        <Text style={styles.title}>
          {purposeText.title}
        </Text>
        <View style={styles.spacer} />
      </View>
      
      <View style={styles.scanContainer}>
        <TouchableOpacity
          style={styles.inPageBackButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#333" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <View style={styles.scanIconContainer}>
          <Icon 
            name={isScanning ? "nfc-search-variant" : "nfc"}
            size={100}
            color="#5046e5"
          />
          {isScanning && (
            <ActivityIndicator 
              size="large" 
              color="#5046e5"
              style={styles.scanningIndicator} 
            />
          )}
        </View>
        
        <Text style={styles.scanTitle}>
          {isScanning ? 'Ready to Scan' : 'NFC Scanner'}
        </Text>
        
        <Text style={styles.scanDescription}>
          {purposeText.description}
        </Text>
        
        {error && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={24} color="#f44336" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {!supported && (
          <View style={styles.unsupportedContainer}>
            <Icon name="nfc-off" size={24} color="#f44336" />
            <Text style={styles.unsupportedText}>
              NFC is not supported on this device
            </Text>
          </View>
        )}
        
        <View style={styles.actionsContainer}>
          {isScanning ? (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={cancelScan}
            >
              <Text style={styles.cancelButtonText}>Cancel Scan</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleStartScan}
              disabled={!supported}
            >
              <Text style={styles.scanButtonText}>Start Scanning</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.manualButton}
            onPress={() => setManualEntryVisible(true)}
          >
            <Text style={styles.manualButtonText}>Manual Entry</Text>
          </TouchableOpacity>
          
          {!supported && (
            <TouchableOpacity
              style={styles.simulateButton}
              onPress={handleSimulateScan}
            >
              <Text style={styles.simulateButtonText}>Simulate Scan</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.debugButton}
            onPress={showDebugInfo}
          >
            <Text style={styles.debugButtonText}>Debug Info</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Manual Entry Modal */}
      <Modal
        visible={manualEntryVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setManualEntryVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter Card ID</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setManualEntryVisible(false)}
              >
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDescription}>
              Enter the card ID manually. This should be the unique identifier printed on the NFC card.
            </Text>
            
            <TextInput
              style={styles.manualInput}
              placeholder="Enter Card ID (e.g., CARD-123ABC)"
              value={manualCardId}
              onChangeText={setManualCardId}
              autoCapitalize="characters"
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={() => setManualEntryVisible(false)}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.submitModalButton}
                onPress={handleManualEntry}
              >
                <Text style={styles.submitModalButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  spacer: {
    width: 40,
  },
  scanContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  inPageBackButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  backButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333',
  },
  scanIconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  scanningIndicator: {
    position: 'absolute',
    width: 150,
    height: 150,
  },
  scanTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  scanDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorText: {
    marginLeft: 8,
    color: '#f44336',
    fontSize: 14,
  },
  unsupportedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  unsupportedText: {
    marginLeft: 8,
    color: '#f44336',
    fontSize: 14,
  },
  actionsContainer: {
    width: '100%',
  },
  scanButton: {
    backgroundColor: '#5046e5',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 12,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  manualButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#5046e5',
    marginBottom: 12,
  },
  manualButtonText: {
    color: '#5046e5',
    fontSize: 16,
  },
  simulateButton: {
    backgroundColor: '#2F855A',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  simulateButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  debugButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '100%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  manualInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelModalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  cancelModalButtonText: {
    color: '#666',
    fontSize: 16,
  },
  submitModalButton: {
    backgroundColor: '#5046e5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  submitModalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default NFCScanScreen;