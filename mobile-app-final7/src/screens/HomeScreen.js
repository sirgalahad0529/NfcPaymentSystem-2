import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Modal,
  FlatList,
  SafeAreaView,
  Alert 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { customerAPI, transactionAPI } from '../api/api';
import { formatCurrency, formatDate } from '../utils/formatters';

const HomeScreen = ({ navigation }) => {
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransactionsModalVisible, setIsTransactionsModalVisible] = useState(false);
  
  // Load recent transactions when the component mounts
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchRecentTransactions();
    });

    return unsubscribe;
  }, [navigation]);
  
  // Fetch recent transactions
  const fetchRecentTransactions = async () => {
    try {
      setIsLoading(true);
      const transactions = await transactionAPI.getHistory();
      
      // Sort transactions by date (newest first) and take only the 5 most recent
      const sortedTransactions = transactions
        .sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB - dateA;
        })
        .slice(0, 5);
      
      setRecentTransactions(sortedTransactions);
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      Alert.alert(
        'Error',
        'Failed to load recent transactions. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Navigate to the appropriate NFC scan screen based on the purpose
  const navigateToScan = (purpose) => {
    navigation.navigate('NFCScan', { scanPurpose: purpose });
  };
  
  // Navigate to the transactions screen
  const navigateToTransactions = () => {
    // For now, just show the modal. In the future, could navigate to a full screen
    setIsTransactionsModalVisible(true);
  };
  
  // Determine transaction icon based on description
  const getTransactionIcon = (transaction) => {
    const description = (transaction.description || '').toLowerCase();
    if (description.includes('reload')) {
      return 'wallet-plus';
    } else if (description.includes('payment')) {
      return 'credit-card';
    } else if (description.includes('purchase')) {
      return 'shopping';
    } else {
      return 'swap-horizontal';
    }
  };
  
  // Determine transaction color based on description
  const getTransactionColor = (transaction) => {
    const description = (transaction.description || '').toLowerCase();
    if (description.includes('reload')) {
      return '#2F855A'; // Green for reloads
    } else {
      return '#E53E3E'; // Red for payments/expenses
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NFC Payment System</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigateToScan('payment')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#5046e5' }]}>
                <Icon name="credit-card-outline" size={28} color="#fff" />
              </View>
              <Text style={styles.actionTitle}>Process Payment</Text>
              <Text style={styles.actionDescription}>Scan card to process a payment</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigateToScan('balance')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#38B2AC' }]}>
                <Icon name="wallet-outline" size={28} color="#fff" />
              </View>
              <Text style={styles.actionTitle}>Check Balance</Text>
              <Text style={styles.actionDescription}>View account balance and transactions</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigateToScan('reload')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#2F855A' }]}>
                <Icon name="wallet-plus-outline" size={28} color="#fff" />
              </View>
              <Text style={styles.actionTitle}>Reload Account</Text>
              <Text style={styles.actionDescription}>Add funds to customer account</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigateToScan('registration')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#DD6B20' }]}>
                <Icon name="account-plus-outline" size={28} color="#fff" />
              </View>
              <Text style={styles.actionTitle}>Register Customer</Text>
              <Text style={styles.actionDescription}>Register a new card and customer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('CustomerLookup')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#805AD5' }]}>
                <Icon name="card-account-details-outline" size={28} color="#fff" />
              </View>
              <Text style={styles.actionTitle}>Customer Lookup</Text>
              <Text style={styles.actionDescription}>Debug customer and API connectivity</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.recentActivity}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={navigateToTransactions}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentTransactions.length > 0 ? (
            <View style={styles.transactionsList}>
              {recentTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionLeftContent}>
                    <View style={[
                      styles.transactionIcon,
                      { backgroundColor: getTransactionColor(transaction) }
                    ]}>
                      <Icon 
                        name={getTransactionIcon(transaction)} 
                        size={20} 
                        color="#fff" 
                      />
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionDescription}>
                        {transaction.description || 'Transaction'}
                      </Text>
                      <Text style={styles.transactionCustomer}>
                        {transaction.customerName || 'Unknown customer'}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {formatDate(transaction.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    { color: getTransactionColor(transaction) }
                  ]}>
                    {(transaction.description || '').toLowerCase().includes('reload') ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyTransactions}>
              <Icon name="history" size={40} color="#ccc" />
              <Text style={styles.emptyTransactionsText}>
                No recent transactions
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Transactions Modal */}
      <Modal
        visible={isTransactionsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsTransactionsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transaction History</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsTransactionsModalVisible(false)}
              >
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={recentTransactions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.transactionItem}>
                  <View style={styles.transactionLeftContent}>
                    <View style={[
                      styles.transactionIcon,
                      { backgroundColor: getTransactionColor(item) }
                    ]}>
                      <Icon 
                        name={getTransactionIcon(item)} 
                        size={20} 
                        color="#fff" 
                      />
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionDescription}>
                        {item.description || 'Transaction'}
                      </Text>
                      <Text style={styles.transactionCustomer}>
                        {item.customerName || 'Unknown customer'}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {formatDate(item.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    { color: getTransactionColor(item) }
                  ]}>
                    {(item.description || '').toLowerCase().includes('reload') ? '+' : '-'}
                    {formatCurrency(item.amount)}
                  </Text>
                </View>
              )}
              contentContainerStyle={styles.modalTransactionsList}
              ListEmptyComponent={
                <View style={styles.emptyTransactions}>
                  <Icon name="history" size={40} color="#ccc" />
                  <Text style={styles.emptyTransactionsText}>
                    No transactions found
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#5046e5',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: '#666',
  },
  recentActivity: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllLink: {
    fontSize: 14,
    color: '#5046e5',
    fontWeight: '500',
  },
  transactionsList: {
    
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transactionLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  transactionCustomer: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 11,
    color: '#999',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyTransactions: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTransactionsText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalTransactionsList: {
    padding: 16,
  },
});

export default HomeScreen;