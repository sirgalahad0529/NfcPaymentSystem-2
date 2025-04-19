import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Wallet, CreditCard, UserPlus } from "lucide-react";
import { ScanResult } from "@shared/schema";

interface CustomerDetailsProps {
  scanResult: ScanResult;
  onContinue: (customer: any) => void;
  onNewCustomer: () => void;
}

export function CustomerDetails({ scanResult, onContinue, onNewCustomer }: CustomerDetailsProps) {
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
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-center text-lg">Loading customer information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!customer) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
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
            <Button 
              className="w-full" 
              onClick={onNewCustomer}
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Register New Customer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Simple HTML approach with table layout for more consistent vertical stacking
  return (
    <div className="p-4">
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
          
          <table style={{width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px'}}>
            <tbody>
              <tr>
                <td style={{paddingBottom: '12px'}}>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      onContinue(customer);
                    }} 
                    style={{
                      display: 'block',
                      width: '100%',
                      backgroundColor: 'hsl(var(--primary))',
                      color: 'white',
                      padding: '12px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      textAlign: 'center',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <CreditCard style={{marginRight: '8px', height: '20px', width: '20px'}} />
                      Continue to Payment
                    </span>
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      onNewCustomer();
                    }} 
                    style={{
                      display: 'block',
                      width: '100%',
                      backgroundColor: 'white',
                      color: '#374151',
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      textDecoration: 'none',
                      textAlign: 'center',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <UserPlus style={{marginRight: '8px', height: '20px', width: '20px'}} />
                      Register New Card
                    </span>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}