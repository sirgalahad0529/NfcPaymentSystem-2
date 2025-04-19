import React, { useState, useEffect } from 'react';
import { ScanResult } from '@shared/schema';
import { Mail, Phone, Wallet, User, CreditCard, UserPlus } from 'lucide-react';

interface ScanResultType {
  cardId: string;
}

interface CustomerDetailsProps {
  scanResult: ScanResultType;
  onContinue: (customer: any) => void;
  onNewCustomer: () => void;
}

export function CustomerDetailsBasic({ scanResult, onContinue, onNewCustomer }: CustomerDetailsProps) {
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
      <div style={{padding: '16px'}}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            width: '48px', 
            height: '48px', 
            border: '2px solid transparent',
            borderTopColor: 'hsl(var(--primary))',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }}></div>
          <p style={{textAlign: 'center', fontSize: '18px'}}>Loading customer information...</p>
        </div>
      </div>
    );
  }
  
  if (!customer) {
    return (
      <div style={{padding: '16px'}}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'rgb(245, 158, 11)'}}>
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </div>
          <h2 style={{fontWeight: '600', fontSize: '18px', textAlign: 'center', marginBottom: '8px'}}>
            No Customer Found
          </h2>
          <p style={{textAlign: 'center', color: '#6b7280', marginBottom: '24px'}}>
            This NFC card is not registered to any customer in our system.
          </p>
          <button 
            style={{
              width: '100%',
              backgroundColor: 'hsl(var(--primary))',
              color: 'white',
              padding: '12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={onNewCustomer}
          >
            <UserPlus style={{marginRight: '8px', height: '20px', width: '20px'}} />
            Register New Customer
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{padding: '16px'}}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        overflow: 'hidden'
      }}>
        <div style={{padding: '24px'}}>
          <h2 style={{
            fontWeight: '600',
            fontSize: '18px',
            textAlign: 'center',
            marginBottom: '16px'
          }}>Customer Found</h2>
          
          <div style={{
            marginBottom: '24px',
            backgroundColor: '#f9fafb',
            padding: '16px',
            borderRadius: '8px'
          }}>
            <div style={{display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '12px'}}>
              <User style={{height: '20px', width: '20px', color: 'hsl(var(--primary))', marginTop: '2px'}} />
              <div>
                <p style={{fontWeight: '500'}}>{customer.name}</p>
                <p style={{fontSize: '12px', color: '#6b7280'}}>Card ID: {scanResult.cardId}</p>
              </div>
            </div>
            
            {customer.email && (
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                <Mail style={{height: '16px', width: '16px', color: '#6b7280'}} />
                <p>{customer.email}</p>
              </div>
            )}
            
            {customer.phone && (
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                <Phone style={{height: '16px', width: '16px', color: '#6b7280'}} />
                <p>{customer.phone}</p>
              </div>
            )}
            
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <Wallet style={{height: '16px', width: '16px', color: '#6b7280'}} />
              <div style={{display: 'flex', alignItems: 'center'}}>
                <span style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  marginRight: '4px',
                  backgroundColor: customer.walletType === 'gcash' ? '#3b82f6' : 
                                  customer.walletType === 'maya' ? '#10b981' : 
                                  '#6b7280'
                }}></span>
                <span style={{textTransform: 'capitalize'}}>{customer.walletType}</span>
              </div>
            </div>
          </div>
          
          <div style={{marginBottom: '12px'}}>
            <a 
              href={`/basic-payment/${scanResult.cardId}`} 
              style={{
                display: 'block',
                width: '100%',
                backgroundColor: 'blue',
                color: 'white',
                padding: '12px 0',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 'bold',
                textAlign: 'center'
              }}
            >
              Continue to Payment
            </a>
          </div>
          
          <div>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                onNewCustomer();
              }}
              style={{
                display: 'block',
                width: '100%',
                backgroundColor: 'lightgray', 
                color: 'black',
                padding: '12px 0',
                borderRadius: '6px',
                textDecoration: 'none',
                textAlign: 'center'
              }}
            >
              Register New Card
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}