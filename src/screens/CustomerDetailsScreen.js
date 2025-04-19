import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  ScrollView 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { customerAPI } from '../api/api';
import { formatCurrency } from '../utils/formatters';

const CustomerDetailsScreen = ({ navigation, route }) => {
  const { scanResult } = route.params || {};
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load customer data based on the scanned card ID
  useEffect(() => {
    if (!scanResult?.cardId) {
      setError('No card ID provided');
      setIsLoading(false);
      return;
    }

    fetchCustomerData();
  }, [scanResult]);

  const fetchCustomerData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const customerData = await customerAPI.getByCardId(scanResult.cardId);
      
      if (customerData) {
        setCustomer(customerData);
      } else {
        setError('No customer found with this card');
      }
    } catch (err) {
      console.error('Error fetching customer data:', err);
      setError('Failed to load customer data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle continue to payment details
  const handleContinueToPayment = () => {
    if (customer) {
      navigation.navigate('PaymentDetails', { scanResult, customer });
    }
  };

  // Handle new customer registration
  const handleNewCustomer = () => {
    navigation.navigate('CustomerRegistration', { scanResult });
  };

  // Render loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Customer Details</Text>
          <View style={styles.spacer} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5046e5" />
          <Text style={styles.loadingText}>Loading customer data...</Text>
        </View>
      </View>
    );
  }

  // Render error state with option to register new customer
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Customer Details</Text>
          <View style={styles.spacer} />
        </View>
        
        <View style={styles.errorContainer}>
          <Icon name="account-question" size={60} color="#f44336" />
          <Text style={styles.errorTitle}>Customer Not Found</Text>
          <Text style={styles.errorText}>
            {error === 'No customer found with this card' 
              ? 'This card is not registered to any customer.' 
              : error}
          </Text>
          
          <View style={styles.errorActions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleNewCustomer}
            >
              <Text style={styles.primaryButtonText}>Register New Customer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.secondaryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
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
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Customer Details</Text>
        <View style={styles.spacer} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.customerCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {customer?.firstName?.charAt(0) || ''}
              {customer?.lastName?.charAt(0) || ''}
            </Text>
          </View>
          
          <Text style={styles.customerName}>
            {customer?.firstName} {customer?.lastName}
          </Text>
          
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Available Balance:</Text>
            <Text style={styles.balanceValue}>
              {formatCurrency(customer?.balance || 0)}
            </Text>
          </View>
          
          <View style={styles.cardContainer}>
            <Text style={styles.cardLabel}>Card ID:</Text>
            <Text style={styles.cardValue}>{scanResult?.cardId}</Text>
          </View>
        </View>
        
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Contact Information</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Icon name="email-outline" size={20} color="#5046e5" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Email:</Text>
              <Text style={styles.detailValue}>{customer?.email || 'Not provided'}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Icon name="phone-outline" size={20} color="#5046e5" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Phone:</Text>
              <Text style={styles.detailValue}>{customer?.phone || 'Not provided'}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Icon name="calendar-outline" size={20} color="#5046e5" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Registered On:</Text>
              <Text style={styles.detailValue}>
                {new Date(customer?.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleContinueToPayment}
          >
            <Icon name="credit-card-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Process Payment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.balanceButton]}
            onPress={() => navigation.navigate('Balance', { scanResult, customer })}
          >
            <Icon name="wallet-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>View Balance History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.reloadButton]}
            onPress={() => navigation.navigate('Reload', { scanResult, customer })}
          >
            <Icon name="wallet-plus-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Reload Account</Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorActions: {
    width: '100%',
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: '#5046e5',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  customerCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#5046e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
  },
  customerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  balanceContainer: {
    backgroundColor: '#f0f9eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#333',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F855A',
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#5046e5',
    paddingVertical: 12,
    borderRadius: 5,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceButton: {
    backgroundColor: '#38B2AC',
  },
  reloadButton: {
    backgroundColor: '#2F855A',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default CustomerDetailsScreen;