import { PaymentRequest } from '@shared/schema';
import { PAYMENT_STATUS } from '../constants';

interface PaymongoResponse {
  id: string;
  amount: number;
  status: string;
  description?: string;
  customerName?: string;
  errorMessage?: string;
  createdAt: string;
}

class PaymongoService {
  async processPayment(paymentRequest: PaymentRequest): Promise<PaymongoResponse> {
    // Extract data and provide defaults
    const { customerName, amount, description } = paymentRequest;
    const customerNameToUse = customerName || 'Customer';
    
    try {
      // Simply simulate a successful payment
      // In the real prepaid system, we don't need to interact with external payment systems
      // This is now only for transaction tracking
      return {
        id: `trans_${Date.now()}`,
        amount: amount,
        status: PAYMENT_STATUS.COMPLETED,
        description: description || 'Prepaid Balance Transaction',
        customerName: customerNameToUse,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Payment processing error:', error);
      
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return {
        id: `failed-${Date.now()}`,
        amount: paymentRequest.amount,
        status: PAYMENT_STATUS.FAILED,
        description: paymentRequest.description,
        customerName: customerNameToUse,
        errorMessage,
        createdAt: new Date().toISOString()
      };
    }
  }
}

export const paymongoService = new PaymongoService();
