import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { normalizeCardId } from '../utils/formatters';
import { customerAPI } from '../api/api';

const CustomerLookupScreen = ({ navigation }) => {
  const [cardId, setCardId] = useState('');
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);

  const handleLookup = async () => {
    if (!cardId.trim()) {
      Alert.alert('Error', 'Please enter a card ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setApiResponse(null);
      
      const normalizedCardId = normalizeCardId(cardId);
      console.log('Looking up customer by card ID:', normalizedCardId);
      
      const result = await customerAPI.getByCardId(normalizedCardId);
      console.log('API Response:', JSON.stringify(result));
      
      setApiResponse(JSON.stringify(result, null, 2));
      setCustomer(result);
    } catch (err) {
      console.error('Error looking up customer:', err);
      setError(err.message || 'Failed to find customer');
      setApiResponse(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCardId('');
    setCustomer(null);
    setError(null);
    setApiResponse(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Customer Lookup</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.subtitle}>Enter Card ID</Text>
        <Text style={styles.description}>
          Enter a card ID to look up customer information. This is useful for debugging API connectivity issues.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Card ID (e.g., CARD-123ABC)"
            value={cardId}
            onChangeText={setCardId}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.lookupButton}
            onPress={handleLookup}
            disabled={loading}
          >
            <Text style={styles.lookupButtonText}>
              {loading ? 'Looking Up...' : 'Look Up Customer'}
            </Text>
            {loading && (
              <ActivityIndicator size="small" color="#fff" style={styles.loadingIndicator} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={24} color="#f44336" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {customer && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Customer Found</Text>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{customer.firstName} {customer.lastName}</Text>
              <Text style={styles.customerDetail}>Email: {customer.email}</Text>
              <Text style={styles.customerDetail}>Phone: {customer.phone}</Text>
              <Text style={styles.customerBalance}>Balance: ₱{customer.balance.toLocaleString()}</Text>
            </View>
          </View>
        )}

        {apiResponse && (
          <View style={styles.apiResponseContainer}>
            <Text style={styles.apiResponseTitle}>API Response:</Text>
            <ScrollView style={styles.apiResponseScroll}>
              <Text style={styles.apiResponseText}>{apiResponse}</Text>
            </ScrollView>
          </View>
        )}
      </ScrollView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  lookupButton: {
    backgroundColor: '#5046e5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  lookupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  clearButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    color: '#f44336',
    fontSize: 14,
    flex: 1,
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  customerInfo: {
    padding: 8,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  customerDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  customerBalance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 8,
  },
  apiResponseContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  apiResponseTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  apiResponseScroll: {
    maxHeight: 200,
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 8,
  },
  apiResponseText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
  },
});

export default CustomerLookupScreen;