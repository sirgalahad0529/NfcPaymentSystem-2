// Define PaymentFormData interface
export interface PaymentFormData {
  customerId: number;
  amount: number;
  description: string;
  items: PaymentLineItem[];
}

// Define PaymentLineItem interface
export interface PaymentLineItem {
  id?: number; // Make id optional
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// Define AppSettings interface
export interface AppSettings {
  apiUrl: string;
  scannerMode: 'manual' | 'automatic';
  scanTimeout: number;
  paymentDescriptions: PaymentDescriptionItem[];
}

// Define PaymentDescriptionItem interface
export interface PaymentDescriptionItem {
  description: string;
  amount: number;
}