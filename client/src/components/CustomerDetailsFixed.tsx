import React, { useState, useEffect } from 'react';
import { Mail, Phone, Wallet, User } from 'lucide-react';

interface ScanResultType {
  cardId: string;
}

interface CustomerDetailsFixedProps {
  scanResult: ScanResultType;
  onContinue: (customer: any) => void;
  onNewCustomer: () => void;
}

export function CustomerDetailsFixed({ scanResult, onContinue, onNewCustomer }: CustomerDetailsFixedProps) {
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`/api/customers/byCardId/${scanResult.cardId}`);
        
        if (response.ok) {
          const data = await response.json();
          setCustomer(data);
        }
      } catch (error) {
        console.error("Error fetching customer:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomer();
  }, [scanResult.cardId]);
  
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-center text-lg">Loading customer information...</p>
        </div>
      </div>
    );
  }
  
  if (!customer) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </div>
          <h2 className="font-semibold text-lg text-center mb-2">No Customer Found</h2>
          <p className="text-muted-foreground text-center mb-6">
            This NFC card is not registered to any customer in our system.
          </p>
          <button 
            className="w-full bg-blue-500 text-white rounded-md py-2 font-medium"
            onClick={onNewCustomer}
          >
            Register New Customer
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="font-semibold text-lg text-center mb-4">Customer Found</h2>
          
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start gap-2 mb-3">
              <User className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">{customer.name}</p>
                <p className="text-xs text-gray-500">Card ID: {scanResult.cardId}</p>
              </div>
            </div>
            
            {customer.email && (
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <p>{customer.email}</p>
              </div>
            )}
            
            {customer.phone && (
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <p>{customer.phone}</p>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-gray-500" />
              <div className="flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full mr-1 ${
                  customer.walletType === 'gcash' ? 'bg-blue-500' : 
                  customer.walletType === 'maya' ? 'bg-green-500' : 
                  'bg-gray-500'
                }`}></span>
                <span className="capitalize">{customer.walletType}</span>
              </div>
            </div>
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            <a 
              href={`/basic-payment/${scanResult.cardId}`}
              style={{
                display: 'block',
                width: '100%',
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '8px 0',
                borderRadius: '6px',
                textDecoration: 'none',
                textAlign: 'center',
                fontWeight: '500'
              }}
            >
              Continue to Payment
            </a>
            
            <button 
              onClick={onNewCustomer}
              style={{
                width: '100%',
                backgroundColor: '#e5e7eb',
                color: '#1f2937',
                border: 'none',
                padding: '8px 0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Register New Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}