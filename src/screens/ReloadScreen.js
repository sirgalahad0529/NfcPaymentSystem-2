import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { customerAPI, transactionAPI } from '../api/api';
import { formatCurrency } from '../utils/formatters';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Preset reload amounts
const PRESET_AMOUNTS = [100, 200, 500, 1000];

// Form validation schema
const formSchema = z.object({
  amount: z
    .number({ 
      required_error: 'Amount is required',
      invalid_type_error: 'Please enter a valid amount'
    })
    .min(100, { message: 'Minimum reload amount is ₱100' })
    .multipleOf(50, { message: 'Amount must be in increments of ₱50' })
});

const ReloadScreen = ({ navigation, route }) => {
  const { scanResult, customer: initialCustomer } = route.params || {};
  const [customer, setCustomer] = useState(initialCustomer);
  const [isLoading, setIsLoading] = useState(!initialCustomer);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { 
    control, 
    handleSubmit, 
    formState: { errors },
    setValue,
    watch 
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 100
    }
  });

  // If customer wasn't passed in the route params, fetch it
  useEffect(() => {
    if (!initialCustomer && scanResult?.cardId) {
      const fetchCustomer = async () => {
        try {
          setIsLoading(true);
          const customerData = await customerAPI.getByCardId(scanResult.cardId);
          
          if (customerData) {
            setCustomer(customerData);
          } else {
            setError('Customer not found');
          }
        } catch (err) {
          console.error('Error fetching customer:', err);
          setError('Failed to load customer data');
        } finally {
          setIsLoading(false);
        }
      };

      fetchCustomer();
    }
  }, [initialCustomer, scanResult]);

  // Handle selecting a preset amount
  const handleSelectAmount = (amount) => {
    setValue('amount', amount);
  };

  // Handle form submission
  const onSubmit = async (data) => {
    if (!customer) {
      Alert.alert('Error', 'Customer information is missing');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Format the data for the API
      const reloadData = {
        cardId: scanResult?.cardId,
        amount: data.amount,
        description: `Reload: +${formatCurrency(data.amount)}`,
        customerId: customer?.id
      };
      
      // Call the API to process the reload
      const result = await transactionAPI.reloadBalance(reloadData);
      
      if (result?.success) {
        Alert.alert(
          "Success",
          `The account has been successfully reloaded with ${formatCurrency(data.amount)}. New balance: ${formatCurrency(result.customer?.balance || 0)}`,
          [
            {
              text: "OK",
              onPress: () => navigation.navigate('Home')
            }
          ]
        );
      } else {
        Alert.alert(
          "Error",
          result?.errorMessage || "Failed to reload account",
          [
            {
              text: "OK"
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error reloading account:', error);
      Alert.alert(
        "Error", 
        error.response?.data?.message || "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
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
          <Text style={styles.title}>Reload Account</Text>
          <View style={styles.spacer} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5046e5" />
          <Text style={styles.loadingText}>Loading customer data...</Text>
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
          <Text style={styles.title}>Reload Account</Text>
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

  // Get current amount from the form
  const amount = watch('amount');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Reload Account</Text>
          <View style={styles.spacer} />
        </View>
        
        <View style={styles.content}>
          <View style={styles.customerCard}>
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
          
          <View style={styles.reloadCard}>
            <Text style={styles.reloadTitle}>Reload Amount</Text>
            <Text style={styles.reloadSubtitle}>
              Minimum amount is ₱100 in increments of ₱50
            </Text>
            
            <View style={styles.amountInputContainer}>
              <Controller
                control={control}
                name="amount"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.amountInput, errors.amount && styles.inputError]}
                    keyboardType="numeric"
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      const parsed = parseInt(text.replace(/[^0-9]/g, ''), 10);
                      if (!isNaN(parsed)) {
                        onChange(parsed);
                      } else {
                        onChange('');
                      }
                    }}
                    value={value ? value.toString() : ''}
                  />
                )}
              />
            </View>
            
            {errors.amount && (
              <Text style={styles.errorText}>{errors.amount.message}</Text>
            )}
            
            <View style={styles.presetAmounts}>
              {PRESET_AMOUNTS.map((presetAmount) => (
                <TouchableOpacity
                  key={presetAmount}
                  style={[
                    styles.presetButton,
                    amount === presetAmount && styles.selectedPreset
                  ]}
                  onPress={() => handleSelectAmount(presetAmount)}
                >
                  <Text style={[
                    styles.presetButtonText,
                    amount === presetAmount && styles.selectedPresetText
                  ]}>
                    {formatCurrency(presetAmount)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.newBalanceContainer}>
              <Text style={styles.newBalanceLabel}>New Balance After Reload:</Text>
              <Text style={styles.newBalanceValue}>
                {formatCurrency((customer?.balance || 0) + (amount || 0))}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.reloadButton, isSubmitting && styles.disabledButton]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.reloadButtonText}>
                  Reload {formatCurrency(amount || 0)}
                </Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.navigate('Home')}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
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
    fontSize: 14,
    color: '#f44336',
    marginVertical: 4,
  },
  retryButton: {
    backgroundColor: '#5046e5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 16,
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
  customerCard: {
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
  reloadCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  reloadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  reloadSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  amountInputContainer: {
    marginBottom: 12,
  },
  amountInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  inputError: {
    borderColor: '#f44336',
  },
  presetAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 20,
  },
  presetButton: {
    width: '46%',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    padding: 12,
    margin: '2%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedPreset: {
    backgroundColor: '#5046e5',
    borderColor: '#5046e5',
  },
  presetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedPresetText: {
    color: '#fff',
  },
  newBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginBottom: 20,
  },
  newBalanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  newBalanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F855A',
  },
  reloadButton: {
    backgroundColor: '#2F855A',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#b4b4b4',
  },
  reloadButtonText: {
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
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default ReloadScreen;