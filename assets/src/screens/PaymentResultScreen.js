import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatCurrency, formatDate } from '../utils/formatters';

const PaymentResultScreen = ({ navigation, route }) => {
  const { success, transaction, customer } = route.params || {};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>
          Payment {success ? 'Successful' : 'Failed'}
        </Text>
        <View style={styles.spacer} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.resultContainer}>
          <View style={[
            styles.statusIconContainer,
            success ? styles.successIconContainer : styles.errorIconContainer
          ]}>
            <Icon 
              name={success ? "check" : "close"} 
              size={40} 
              color="#fff" 
            />
          </View>
          
          <Text style={styles.statusText}>
            {success ? 'Payment Successful' : 'Payment Failed'}
          </Text>
          
          {!success && transaction?.errorMessage && (
            <Text style={styles.errorMessage}>
              {transaction.errorMessage}
            </Text>
          )}
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Transaction Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(transaction?.amount || 0)}
            </Text>
          </View>
          
          {transaction?.description && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Description:</Text>
              <Text style={styles.detailValue}>{transaction.description}</Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Customer:</Text>
            <Text style={styles.detailValue}>{transaction?.customerName || 'N/A'}</Text>
          </View>
          
          {transaction?.transactionId && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID:</Text>
              <Text style={styles.detailValue}>{transaction.transactionId}</Text>
            </View>
          )}
          
          {transaction?.createdAt && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>
                {formatDate(transaction.createdAt)}
              </Text>
            </View>
          )}
        </View>
        
        {customer && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Updated Balance</Text>
            
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Current Balance:</Text>
              <Text style={styles.balanceValue}>
                {formatCurrency(customer?.balance || 0)}
              </Text>
            </View>
          </View>
        )}
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.newTransactionButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.newTransactionButtonText}>New Transaction</Text>
          </TouchableOpacity>
          
          {!success && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.retryButtonText}>Retry Payment</Text>
            </TouchableOpacity>
          )}
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
  closeButton: {
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
    padding: 16,
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIconContainer: {
    backgroundColor: '#2F855A',
  },
  errorIconContainer: {
    backgroundColor: '#E53E3E',
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#E53E3E',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 120,
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F855A',
  },
  actionsContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  newTransactionButton: {
    backgroundColor: '#5046e5',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  newTransactionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  retryButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default PaymentResultScreen;