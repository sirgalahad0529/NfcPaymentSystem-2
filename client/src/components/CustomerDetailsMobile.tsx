import React, { useState, useEffect } from 'react';
import { Mail, Phone, Wallet, User, ArrowLeft } from 'lucide-react';
import { isChromeOnAndroid } from '@/lib/browserDetect';
import { formatCurrency } from '@/lib/utils';
import { useWebView } from '@/contexts/WebViewContext';

interface ScanResultType {
  cardId: string;
}

interface CustomerDetailsMobileProps {
  scanResult: ScanResultType;
  onContinue: (customer: any) => void;
  onNewCustomer: () => void;
  onBack?: () => void; // Add optional back handler
}

export function CustomerDetailsMobile({ scanResult, onContinue, onNewCustomer, onBack }: CustomerDetailsMobileProps) {
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAndroidChrome, setIsAndroidChrome] = useState<boolean>(false);
  
  // Get WebView state from context
  const { isWebView, setWebViewMode } = useWebView();
  
  // Check if URL has webview parameter and update context if needed
  useEffect(() => {
    const hasWebViewParam = window.location.search.includes('webview');
    if (hasWebViewParam && !isWebView) {
      // Set WebView mode to true in context
      setWebViewMode(true);
    }
    
    setIsAndroidChrome(isChromeOnAndroid());
    
    // Add detailed debug messages to the console
    console.log("CustomerDetailsMobile Component - Current state:");
    console.log("- WebView Mode from Context:", isWebView);
    console.log("- WebView Param in URL:", hasWebViewParam);
    console.log("- URL params:", window.location.search);
    console.log("- Android Chrome:", isChromeOnAndroid());
    
    // Force the WebView mode to true if URL has the parameter
    if (hasWebViewParam) {
      console.log("FORCE ENABLING WebView mode from URL parameter");
      setWebViewMode(true);
    }
  }, [isWebView, setWebViewMode]);
  
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
          {onBack && (
            <div style={{alignSelf: 'flex-start', marginBottom: '16px', width: '100%'}}>
              <button
                onClick={onBack}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '8px 0',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ArrowLeft size={16} style={{marginRight: '4px'}} />
                Back
              </button>
            </div>
          )}
          
          <div style={{
            width: '48px', 
            height: '48px', 
            border: '2px solid transparent',
            borderTopColor: '#3b82f6',
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
          {onBack && (
            <div style={{alignSelf: 'flex-start', marginBottom: '8px'}}>
              <button
                onClick={onBack}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '8px 0',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ArrowLeft size={16} style={{marginRight: '4px'}} />
                Back
              </button>
            </div>
          )}
          
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
              backgroundColor: '#3b82f6',
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '8px 0',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ArrowLeft size={16} style={{marginRight: '4px'}} />
                Back
              </button>
            )}
            <h2 style={{
              fontWeight: '600',
              fontSize: '18px',
              textAlign: 'center',
              flex: 1,
              paddingRight: '28px' // To balance the back button
            }}>
              Customer Found
              {isWebView && (
                <span style={{ 
                  fontSize: '10px', 
                  backgroundColor: '#10b981', 
                  color: 'white',
                  padding: '2px 5px',
                  borderRadius: '10px',
                  marginLeft: '5px',
                  verticalAlign: 'middle'
                }}>
                  WebView Mode
                </span>
              )}
            </h2>
          </div>
          
          <div style={{
            marginBottom: '24px',
            backgroundColor: '#f9fafb',
            padding: '16px',
            borderRadius: '8px'
          }}>
            <div style={{display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '12px'}}>
              <div style={{height: '20px', width: '20px', color: '#3b82f6', marginTop: '2px'}}>
                <User size={20} />
              </div>
              <div>
                <p style={{fontWeight: '500'}}>{customer.name}</p>
                <p style={{fontSize: '12px', color: '#6b7280'}}>Card ID: {scanResult.cardId}</p>
              </div>
            </div>
            
            {customer.email && (
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                <div style={{height: '16px', width: '16px', color: '#6b7280'}}>
                  <Mail size={16} />
                </div>
                <p>{customer.email}</p>
              </div>
            )}
            
            {customer.phone && (
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                <div style={{height: '16px', width: '16px', color: '#6b7280'}}>
                  <Phone size={16} />
                </div>
                <p>{customer.phone}</p>
              </div>
            )}
            
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <div style={{height: '16px', width: '16px', color: '#6b7280'}}>
                <Wallet size={16} />
              </div>
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

            <div style={{marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb'}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{fontWeight: '500'}}>Current Balance:</span>
                <span style={{fontWeight: 'bold', color: '#10b981'}}>
                  {formatCurrency(customer.balance)}
                </span>
              </div>
              
              {/* Debug section: Only visible in development */}
              <div style={{
                marginTop: '8px',
                paddingTop: '8px',
                borderTop: '1px dashed #e5e7eb',
                fontSize: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div>
                  <strong>Debug:</strong> WebView Mode: {isWebView ? "ON" : "OFF"}
                </div>
                <button
                  onClick={() => {
                    setWebViewMode(!isWebView);
                    console.log("DEBUG: Toggled WebView mode to:", !isWebView);
                  }}
                  style={{
                    fontSize: '10px',
                    padding: '2px 4px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                >
                  Toggle WebView Mode
                </button>
              </div>
            </div>
          </div>
          
          <table 
            cellPadding={0} 
            cellSpacing={0} 
            className="mobile-stack-buttons" 
            style={{
              width: '100%', 
              borderCollapse: 'separate', 
              borderSpacing: '0 12px',
              // Apply additional force-breaking styles for mobile, especially Chrome Android
              ...(isAndroidChrome ? {display: 'block'} : {})
            }}>
            <tbody>
              <tr style={{...(isAndroidChrome ? {display: 'block', marginBottom: '12px'} : {})}}>
                <td style={{
                  padding: '0 0 12px 0',
                  ...(isAndroidChrome ? {display: 'block', width: '100%'} : {})
                }}>
                  <a 
                    href={`/basic-payment/${scanResult.cardId}${isWebView ? '?webview=true' : ''}`}
                    style={{
                      display: 'block',
                      width: '100%',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '12px 0',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}
                  >
                    Basic Payment
                  </a>
                </td>
              </tr>
              <tr style={{...(isAndroidChrome ? {display: 'block', marginBottom: '12px'} : {})}}>
                <td style={{
                  padding: '0 0 12px 0',
                  ...(isAndroidChrome ? {display: 'block', width: '100%'} : {})
                }}>
                  <a 
                    href={`/invoice-payment/${scanResult.cardId}${isWebView ? '?webview=true' : ''}`}
                    style={{
                      display: 'block',
                      width: '100%',
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '12px 0',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}
                  >
                    Invoice Payment
                  </a>
                </td>
              </tr>
              {/* Register New Card button - always shown in Expo environment */}
              {(() => {
                // In Expo environment, we always want to show this button
                // In a real WebView environment, this might be different
                // For now, we'll show it everywhere for better testing
                return (
                  <tr style={{...(isAndroidChrome ? {display: 'block', marginBottom: '12px'} : {})}}>
                    <td style={{...(isAndroidChrome ? {display: 'block', width: '100%'} : {})}}>
                      <button 
                        onClick={onNewCustomer}
                        style={{
                          width: '100%',
                          backgroundColor: '#e5e7eb',
                          color: '#111827',
                          padding: '12px 0',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          textAlign: 'center'
                        }}
                      >
                        Register New Card
                      </button>
                    </td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}