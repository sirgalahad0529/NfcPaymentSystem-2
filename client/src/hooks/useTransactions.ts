import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Transaction } from "@/types";

export function useTransactions() {
  const queryClient = useQueryClient();

  // Fetch all transactions
  const { 
    data: transactions, 
    isLoading, 
    error 
  } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  // Create a new transaction (this would normally be called from usePayment)
  const { mutate: createTransaction } = useMutation({
    mutationFn: (newTransaction: Omit<Transaction, 'id' | 'transactionId' | 'createdAt'>) => {
      return apiRequest('POST', '/api/transactions', newTransaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
  });

  return {
    transactions: transactions || [],
    isLoading,
    error,
    createTransaction
  };
}
