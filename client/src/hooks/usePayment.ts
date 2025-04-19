import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { PaymentFormData } from "@/types";
import { ScanResult } from "@shared/schema";

export function usePayment() {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    transaction?: {
      transactionId?: string;
      amount?: number;
      customerName?: string;
      status?: string;
      errorMessage?: string;
      createdAt?: string;
      items?: Array<{
        id: number;
        description: string;
        quantity: number;
        unitPrice: number;
        amount: number;
      }>;
    };
    customer?: {
      id: number;
      name: string;
      balance: number;
    };
    error?: string;
  } | null>(null);
  
  const queryClient = useQueryClient();

  const processPayment = async (scanResult: ScanResult, customer: any, paymentData: PaymentFormData) => {
    console.log('Starting payment processing with:', { scanResult, customer, paymentData });
    setProcessing(true);
    setResult(null);
    
    // Create a timeout to ensure we don't get stuck
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Payment request timed out after 10 seconds'));
      }, 10000); // 10 second timeout
    });
    
    try {
      // Prepare request payload
      const payload = {
        cardId: scanResult.cardId,
        customerId: customer.id,
        customerName: customer.name,
        amount: paymentData.amount,
        description: paymentData.description || 'NFC Payment',
        items: paymentData.items || [] // Include line items in the request
      };
      
      console.log('Sending payment request with payload:', payload);
      
      // Use Promise.race to implement a timeout
      const response = await Promise.race([
        fetch("/api/payments/process", {
          method: "POST",
          body: JSON.stringify(payload),
          headers: {
            "Content-Type": "application/json",
          },
        }),
        timeoutPromise
      ]) as Response;
      
      console.log('Got response from server:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('Payment response data:', data);
      
      // Create result object
      const resultData = {
        success: data.success,
        transaction: data.transaction,
        customer: data.customer
      };
      
      console.log('Setting result:', resultData);
      setResult(resultData);
      
      // Invalidate the transactions cache to refresh the list
      console.log('Invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/customer', customer.id] });
      
    } catch (error) {
      console.error('Payment processing error:', error);
      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      const errorResult = {
        success: false,
        transaction: {
          errorMessage: errorMessage
        },
        customer: customer
      };
      
      console.log('Setting error result:', errorResult);
      setResult(errorResult);
    } finally {
      console.log('Payment processing complete, setting processing to false');
      setProcessing(false);
    }
  };

  const resetPayment = () => {
    setResult(null);
  };

  return {
    processing,
    result,
    processPayment,
    resetPayment
  };
}
