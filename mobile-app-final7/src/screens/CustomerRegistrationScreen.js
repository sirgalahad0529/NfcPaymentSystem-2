import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { customerAPI } from '../api/api';
import { formatCurrency } from '../utils/formatters';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Customer registration form validation schema
const registrationSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: 'First name is required' }),
  lastName: z
    .string()
    .min(1, { message: 'Last name is required' }),
  email: z
    .string()
    .email({ message: 'Invalid email address' })
    .min(1, { message: 'Email is required' }),
  phone: z
    .string()
    .min(1, { message: 'Phone number is required' })
    .regex(/^[0-9+\s()-]{7,15}$/, {
      message: 'Please enter a valid phone number',
    }),
  initialBalance: z
    .number({ 
      required_error: 'Initial balance is required',
      invalid_type_error: 'Please enter a valid amount'
    })
    .min(500, { message: 'Minimum initial balance is ₱500' })
});

const CustomerRegistrationScreen = ({ navigation, route }) => {
  const { scanResult } = route.params || {};
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with react-hook-form
  const { 
    control, 
    handleSubmit, 
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      initialBalance: 500
    }
  });
  
  // Handle form submission
  const onSubmit = async (data) => {
    if (!scanResult?.cardId) {
      Alert.alert('Error', 'Card ID is missing');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare registration data
      const registrationData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        initialBalance: data.initialBalance,
        cardId: scanResult.cardId
      };
      
      // Call the API to register the customer
      const result = await customerAPI.register(registrationData);
      
      if (result) {
        Alert.alert(
          'Success',
          'Customer has been successfully registered!',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('CustomerDetails', { scanResult })
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error registering customer:', error);
      Alert.alert(
        'Registration Failed',
        error.response?.data?.message || 'An unexpected error occurred'
      );
    } finally {
      setIsSubmitting(false);
    }
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
          <Text style={styles.title}>Register New Customer</Text>
          <View style={styles.spacer} />
        </View>
        
        <ScrollView style={styles.content}>
          <View style={styles.cardInfo}>
            <Icon name="nfc" size={30} color="#5046e5" />
            <Text style={styles.cardIdLabel}>Card ID:</Text>
            <Text style={styles.cardIdValue}>{scanResult?.cardId}</Text>
          </View>
          
          <View style={styles.formContainer}>
            <Text style={styles.formHeading}>Customer Information</Text>
            <Text style={styles.formSubheading}>All fields are required</Text>
            
            {/* First Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name <Text style={styles.required}>*</Text></Text>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.firstName && styles.inputError]}
                    placeholder="Enter first name"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName.message}</Text>
              )}
            </View>
            
            {/* Last Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name <Text style={styles.required}>*</Text></Text>
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.lastName && styles.inputError]}
                    placeholder="Enter last name"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName.message}</Text>
              )}
            </View>
            
            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="Enter email address"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>
            
            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone <Text style={styles.required}>*</Text></Text>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.phone && styles.inputError]}
                    placeholder="Enter phone number"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="phone-pad"
                  />
                )}
              />
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone.message}</Text>
              )}
            </View>
            
            {/* Initial Balance */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Initial Balance <Text style={styles.required}>*</Text></Text>
              <View style={styles.balanceInputContainer}>
                <Text style={styles.currencySymbol}>₱</Text>
                <Controller
                  control={control}
                  name="initialBalance"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.balanceInput, errors.initialBalance && styles.inputError]}
                      placeholder="500"
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
                      keyboardType="numeric"
                    />
                  )}
                />
              </View>
              {errors.initialBalance ? (
                <Text style={styles.errorText}>{errors.initialBalance.message}</Text>
              ) : (
                <Text style={styles.helpText}>
                  Minimum initial balance: ₱500
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.registerButton, isSubmitting && styles.disabledButton]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Register Customer</Text>
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
    padding: 16,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardIdLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginRight: 4,
  },
  cardIdValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  formHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  formSubheading: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  inputGroup: {
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
  helpText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  balanceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#333',
    marginRight: 4,
  },
  balanceInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  registerButton: {
    backgroundColor: '#5046e5',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#b4b4b4',
  },
  registerButtonText: {
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

export default CustomerRegistrationScreen;