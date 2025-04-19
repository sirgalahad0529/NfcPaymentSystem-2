import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { transactionAPI } from '../api/api';
import { formatCurrency } from '../utils/formatters';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Common payment options/descriptions
const PAYMENT_OPTIONS = [
  { description: 'Product Purchase', amount: 100 },
  { description: 'Service Fee', amount: 50 },
  { description: 'Membership Fee', amount: 200 },
  { description: 'Subscription', amount: 150 },
];

// Form validation schema
const formSchema = z.object({
  amount: z
    .number({ 
      required_error: 'Amount is required',
      invalid_type_error: 'Please enter a valid amount'
    })
    .min(1, { message: 'Amount must be greater than 0' }),
  description: z
    .string()
    .min(1, { message: 'Description is required' })
});

const PaymentDetailsScreen = ({ navigation, route }) => {
  const { scanResult, customer } = route.params || {};
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { 
    control, 
    handleSubmit, 
    formState: { errors },
    setValue,
    watch 
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      description: ''
    }
  });

  // Watch the amount field to check if it exceeds balance
  const amount = watch('amount');
  
  // Check if the amount exceeds available balance
  useEffect(() => {
    if (amount && amount > (customer?.balance || 0)) {
      setErrorMessage('Amount exceeds available balance');
    } else {
      setErrorMessage('');
    }
  }, [amount, customer]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      // Check if the amount exceeds available balance
      if (data.amount > (customer?.balance || 0)) {
        Alert.alert(
          "Insufficient Balance",
          "The payment amount exceeds the available balance. Please reload the account or reduce the amount.",
          [
            {
              text: "OK"
            }
          ]
        );
        return;
      }

      setIsSubmitting(true);
      
      // Format the data for the API
      const paymentData = {
        cardId: scanResult?.cardId,
        amount: data.amount,
        description: data.description,
        customerId: customer?.id
      };
      
      // Call the API to process the payment
      const result = await transactionAPI.processPayment(paymentData);
      
      if (result?.success) {
        // Navigate to success screen
        navigation.navigate('PaymentResult', { 
          success: true,
          transaction: result.transaction,
          customer: result.customer
        });
      } else {
        // Navigate to error screen
        navigation.navigate('PaymentResult', { 
          success: false,
          transaction: result?.transaction || {
            errorMessage: "Failed to process payment",
            amount: data.amount,
            customerName: `${customer?.firstName} ${customer?.lastName}`
          }
        });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      
      // Navigate to error screen
      navigation.navigate('PaymentResult', { 
        success: false,
        transaction: {
          errorMessage: error.response?.data?.message || "An unexpected error occurred",
          amount: data.amount,
          customerName: `${customer?.firstName} ${customer?.lastName}`
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle selecting a preset payment option
  const handleSelectPaymentOption = (option) => {
    setValue('amount', option.amount);
    setValue('description', option.description);
  };

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
          <Text style={styles.title}>Payment Details</Text>
          <View style={styles.spacer} />
        </View>
        
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
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
              <Text style={styles.balanceLabel}>Available Balance:</Text>
              <Text style={styles.balanceValue}>
                {formatCurrency(customer?.balance || 0)}
              </Text>
            </View>
          </View>
          
          <View style={styles.paymentCard}>
            <Text style={styles.cardTitle}>Payment Information</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Amount <Text style={styles.required}>*</Text></Text>
              <Controller
                control={control}
                name="amount"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input, 
                      (errors.amount || errorMessage) && styles.inputError
                    ]}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      const parsed = parseFloat(text.replace(/[^0-9.]/g, ''));
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
              {errors.amount && (
                <Text style={styles.errorText}>{errors.amount.message}</Text>
              )}
              {!errors.amount && errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.description && styles.inputError]}
                    placeholder="Enter payment description"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.description && (
                <Text style={styles.errorText}>{errors.description.message}</Text>
              )}
            </View>
            
            <Text style={styles.quickOptionsTitle}>Quick Options:</Text>
            <View style={styles.quickOptions}>
              {PAYMENT_OPTIONS.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickOption}
                  onPress={() => handleSelectPaymentOption(option)}
                >
                  <Text style={styles.quickOptionTitle}>{option.description}</Text>
                  <Text style={styles.quickOptionAmount}>
                    {formatCurrency(option.amount)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton, 
                (isSubmitting || !!errorMessage) && styles.disabledButton
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting || !!errorMessage}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Process Payment</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F855A',
  },
  paymentCard: {
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
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  required: {
    color: '#f44336',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 4,
  },
  quickOptionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  quickOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  quickOption: {
    width: '46%',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    padding: 10,
    margin: '2%',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  quickOptionTitle: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
  },
  quickOptionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2F855A',
  },
  actionsContainer: {
    marginTop: 16,
  },
  submitButton: {
    backgroundColor: '#5046e5',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#b4b4b4',
  },
  submitButtonText: {
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

export default PaymentDetailsScreen;