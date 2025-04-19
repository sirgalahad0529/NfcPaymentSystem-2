import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  FlatList 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { customerAPI, transactionAPI } from '../api/api';
import { formatCurrency, formatDate } from '../utils/formatters';

const BalanceScreen = ({ navigation, route }) => {
  const { scanResult } = route.params || {};
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load customer data and recent transactions when the component mounts
  useEffect(() => {
    if (!scanResult?.cardId) {
      setError('No card ID provided');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get customer data
        const customerData = await customerAPI.getByCardId(scanResult.cardId);
        
        if (customerData) {
          setCustomer(customerData);
          
          // Get recent transactions for this customer
          const recentTransactions = await transactionAPI.getHistory();
          
          // Filter transactions for this customer and sort by date (newest first)
          const filteredTransactions = recentTransactions
            .filter(tx => tx.cardId === scanResult.cardId)
            .sort((a, b) => {
              const dateA = new Date(a.createdAt);
              const dateB = new Date(b.createdAt);
              return dateB - dateA;
            });
          
          setTransactions(filteredTransactions);
        } else {
          setError('Customer not found');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load customer data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [scanResult]);

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
          <Text style={styles.title}>Balance Inquiry</Text>
          <View style={styles.spacer} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5046e5" />
          <Text style={styles.loadingText}>Loading balance information...</Text>
        </View>
      </View>
    );
  }

  // Render error state
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
          <Text style={styles.title}>Balance Inquiry</Text>
          <View style={styles.spacer} />
        </View>
        
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={50} color="#f44336" />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render balance information
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Balance Inquiry</Text>
        <View style={styles.spacer} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.balanceCard}>
          <View style={styles.customerHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {customer?.firstName?.charAt(0) || ''}
                {customer?.lastName?.charAt(0) || ''}
              </Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>
                {customer?.firstName} {customer?.lastName}
              </Text>
              <Text style={styles.cardId}>
                Card ID: {scanResult?.cardId}
              </Text>
            </View>
          </View>
          
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Current Balance:</Text>
            <Text style={styles.balanceValue}>
              {formatCurrency(customer?.balance || 0)}
            </Text>
          </View>
        </View>
        
        <View style={styles.transactionsContainer}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>Recent Transactions</Text>
          </View>
          
          {transactions.length > 0 ? (
            <FlatList
              data={transactions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.transactionItem}>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionDescription}>
                      {item.description || 'Transaction'}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(item.createdAt)}
                    </Text>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    // If it's a reload, show green. Otherwise, red for payments
                    item.description?.toLowerCase().includes('reload') 
                      ? styles.positiveAmount 
                      : styles.negativeAmount
                  ]}>
                    {item.description?.toLowerCase().includes('reload') ? '+' : '-'}
                    {formatCurrency(item.amount)}
                  </Text>
                </View>
              )}
              contentContainerStyle={styles.transactionsList}
            />
          ) : (
            <View style={styles.noTransactionsContainer}>
              <Icon name="history" size={40} color="#ccc" />
              <Text style={styles.noTransactionsText}>
                No recent transactions found
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.reloadButton}
            onPress={() => navigation.navigate('Reload', { scanResult, customer })}
          >
            <Text style={styles.reloadButtonText}>Reload Account</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  retryButton: {
    backgroundColor: '#5046e5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#5046e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  customerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardId: {
    fontSize: 12,
    color: '#666',
  },
  balanceContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2F855A',
  },
  transactionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    flex: 1,
    elevation: 2,
  },
  transactionsHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionsList: {
    paddingHorizontal: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  positiveAmount: {
    color: '#2F855A',
  },
  negativeAmount: {
    color: '#E53E3E',
  },
  noTransactionsContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noTransactionsText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  actionsContainer: {
    marginTop: 'auto',
    paddingTop: 16,
  },
  reloadButton: {
    backgroundColor: '#2F855A',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  reloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  homeButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  homeButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default BalanceScreen;