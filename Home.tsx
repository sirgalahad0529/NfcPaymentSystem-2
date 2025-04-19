import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/Header";
import { NFCScanner } from "@/components/NFCScanner";
import { PaymentDetails } from "@/components/PaymentDetails";
import { PaymentProcessing } from "@/components/PaymentProcessing";
import { PaymentResult } from "@/components/PaymentResult";
import { TransactionHistory } from "@/components/TransactionHistory";
import { Settings } from "@/components/Settings";
import { Reports } from "@/components/Reports";
import { CustomerDetails } from "@/components/CustomerDetails";
import { CustomerDetailsMobile } from "@/components/CustomerDetailsMobile";
import { CustomerRegistration } from "@/components/CustomerRegistration";
import { BalanceInquiry } from "@/components/BalanceInquiry";
import { ReloadAccount } from "@/components/ReloadAccount";
import { useNFC } from "@/hooks/useNFC";
import { usePayment } from "@/hooks/usePayment";
interface ScanResult {
  cardId: string;
}
import { PaymentFormData, AppSettings } from "@/types";
import { APP_STATES } from "@/lib/constants";

export default function Home() {
  // App state
  const [appState, setAppState] = useState<string>(APP_STATES.READY);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Settings
  // Initialize settings from localStorage or use defaults
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      // Try to get settings from localStorage
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error("Error loading settings from localStorage:", error);
    }
    
    // Default settings if nothing in localStorage
    return {
      apiUrl: "/api",
      scannerMode: "manual",
      scanTimeout: 30,
      paymentDescriptions: [
        { description: "Products", amount: 500 },
        { description: "Services", amount: 1000 },
        { description: "Membership fee", amount: 2500 },
        { description: "Subscription", amount: 1500 },
        { description: "Event ticket", amount: 800 }
      ],
    };
  });
  
  // Hooks - must be defined in a consistent order to prevent React errors
  const nfcHook = useNFC();
  const paymentHook = usePayment();
  const [, navigate] = useLocation();
  
  // Extract the hook values
  const { startScan, cancelScan, resetScan } = nfcHook;
  const { processing, result, processPayment, resetPayment } = paymentHook;
  
  // Handle NFC scan completion
  const handleScanComplete = async (result: ScanResult) => {
    // Ensure the cardId has the CARD- prefix
    let normalizedCardId = result.cardId;
    if (!normalizedCardId.startsWith("CARD-")) {
      normalizedCardId = "CARD-" + normalizedCardId;
    }
    
    // Update result with normalized cardId
    const normalizedResult: ScanResult = {
      cardId: normalizedCardId
    };
    
    setScanResult(normalizedResult);
    setAppState(APP_STATES.LOOKING_UP_CUSTOMER);
    setIsLoading(true);
    
    try {
      // Look up customer by card ID
      const response = await fetch(`/api/customers/byCardId/${normalizedResult.cardId}`);
      
      if (response.ok) {
        const customerData = await response.json();
        setCustomer(customerData);
        setAppState(APP_STATES.CUSTOMER_FOUND);
      } else {
        setAppState(APP_STATES.CUSTOMER_NOT_FOUND);
      }
    } catch (error) {
      console.error("Error looking up customer:", error);
      setAppState(APP_STATES.CUSTOMER_NOT_FOUND);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle customer registration
  const handleRegistrationComplete = (newCustomer: any) => {
    setCustomer(newCustomer);
    setAppState(APP_STATES.CUSTOMER_FOUND);
  };
  
  // Handle new customer button click
  const handleNewCustomer = () => {
    setAppState(APP_STATES.REGISTERING_CUSTOMER);
  };
  
  // Handle customer selection to proceed to payment
  const handleContinueToPayment = (selectedCustomer: any) => {
    if (!selectedCustomer) {
      console.error("Cannot continue to payment: Customer is missing");
      return;
    }
    
    console.log("Continuing to payment with customer:", selectedCustomer);
    setCustomer(selectedCustomer);
    
    // Make sure scan result exists
    if (!scanResult) {
      console.error("ScanResult is missing, creating a fallback scanResult");
      setScanResult({
        cardId: selectedCustomer.cardId || "FALLBACK-" + Date.now()
      });
    }
    
    // Set timeout to ensure state updates before changing app state
    setTimeout(() => {
      setAppState(APP_STATES.SCAN_COMPLETE);
    }, 100);
  };
  
  // Handle payment form submission
  const handleProcessPayment = (paymentData: PaymentFormData) => {
    if (!scanResult || !customer) return;
    
    setAppState(APP_STATES.PROCESSING_PAYMENT);
    processPayment(scanResult, customer, paymentData);
  };
  
  // Reset the entire flow for a new transaction
  const handleNewTransaction = () => {
    setScanResult(null);
    setCustomer(null);
    resetScan();
    resetPayment();
    setAppState(APP_STATES.READY);
  };
  
  // Retry the payment with the same scan result
  const handleRetryPayment = () => {
    setAppState(APP_STATES.SCAN_COMPLETE);
    resetPayment();
  };
  
  // Handle settings save
  const handleSaveSettings = (newSettings: AppSettings) => {
    console.log('Saving settings:', newSettings);
    
    // Update state first
    setSettings(newSettings);
    
    // Then try to save each setting individually to localStorage for better reliability
    try {
      // Save basic settings
      window.localStorage.setItem('settings_apiUrl', newSettings.apiUrl || '');
      window.localStorage.setItem('settings_scannerMode', newSettings.scannerMode || 'manual');
      window.localStorage.setItem('settings_scanTimeout', String(newSettings.scanTimeout || 30));
      
      // Save payment descriptions as a stringified array
      if (newSettings.paymentDescriptions && newSettings.paymentDescriptions.length > 0) {
        window.localStorage.setItem(
          'settings_paymentDescriptions', 
          JSON.stringify(newSettings.paymentDescriptions)
        );
      }
      
      console.log('All settings saved individually to localStorage');
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
    
    setIsSettingsOpen(false);
  };
  
  // Load settings from localStorage on initial load
  useEffect(() => {
    try {
      // Check if we have settings in localStorage
      const apiUrl = window.localStorage.getItem('settings_apiUrl');
      const scannerMode = window.localStorage.getItem('settings_scannerMode');
      const scanTimeout = window.localStorage.getItem('settings_scanTimeout');
      const paymentDescriptionsStr = window.localStorage.getItem('settings_paymentDescriptions');
      
      // Only update if we found some settings
      if (apiUrl || scannerMode || scanTimeout || paymentDescriptionsStr) {
        console.log('Loading settings from localStorage');
        
        // Parse payment descriptions
        let paymentDescriptions = settings.paymentDescriptions;
        if (paymentDescriptionsStr) {
          try {
            paymentDescriptions = JSON.parse(paymentDescriptionsStr);
          } catch (e) {
            console.error('Failed to parse payment descriptions:', e);
          }
        }
        
        // Create new settings object
        const loadedSettings: AppSettings = {
          apiUrl: apiUrl || settings.apiUrl,
          scannerMode: (scannerMode as 'manual' | 'automatic') || settings.scannerMode,
          scanTimeout: scanTimeout ? parseInt(scanTimeout, 10) : settings.scanTimeout,
          paymentDescriptions: paymentDescriptions
        };
        
        console.log('Loaded settings:', loadedSettings);
        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
    }
  }, []);
  
  // Cancel customer registration
  const handleCancelRegistration = () => {
    setAppState(APP_STATES.CUSTOMER_NOT_FOUND);
  };
  
  // Update app state when payment processing is complete
  useEffect(() => {
    if (result && !processing) {
      setAppState(APP_STATES.PAYMENT_COMPLETE);
    }
  }, [result, processing]);
  
  // Automatically start scanning if set to automatic
  useEffect(() => {
    if (settings.scannerMode === "automatic" && appState === APP_STATES.READY) {
      startScan();
    }
  }, [settings.scannerMode, appState, startScan]);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-lg">
      <Header 
        onOpenHistory={() => setIsHistoryOpen(true)} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenReports={() => setIsReportsOpen(true)}
      />
      
      <div className="flex-1 overflow-y-auto">
        {/* NFC Scanner Section */}
        {appState === APP_STATES.READY && (
          <div className="flex flex-col h-full">
            <NFCScanner 
              onScanComplete={handleScanComplete}
            />
            <div className="px-6 pb-6 mt-2 space-y-2">
              <button 
                className="w-full bg-indigo-600 text-white rounded-md py-2 font-medium mb-2"
                onClick={() => navigate('/basic-payment')}
              >
                View Online/Offline Demo
              </button>
              <button 
                className="w-full bg-blue-600 text-white rounded-md py-2 font-medium mb-2"
                onClick={() => navigate('/nfc-scan')}
              >
                Chromebook NFC Scanner
              </button>
              {/* Chromebook Documentation button removed as requested */}
              <button 
                className="w-full bg-primary text-white rounded-md py-2 font-medium"
                onClick={() => setAppState(APP_STATES.MANUAL_REGISTRATION)}
              >
                Register New Customer
              </button>
              <button 
                className="w-full bg-secondary text-secondary-foreground rounded-md py-2 font-medium mb-2"
                onClick={() => {
                  // Show dialog to choose between scan and manual input
                  const useManualInput = window.confirm("Would you like to enter the Card ID manually?\n\nClick 'OK' to enter Card ID manually or 'Cancel' to scan an NFC card.");
                  
                  if (useManualInput) {
                    // Get manual input
                    const manualCardId = window.prompt("Enter Card ID:", "");
                    if (manualCardId && manualCardId.trim()) {
                      // Use the manual card ID with special handling for Android Chrome
                      // First, normalize it by removing colons, spaces, dashes, etc.
                      let normalizedCardId = manualCardId.trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                      
                      // Ensure the "CARD-" prefix is present
                      if (!normalizedCardId.startsWith("CARD-")) {
                        normalizedCardId = "CARD-" + normalizedCardId;
                      }
                      
                      console.log(`Manual entry for balance check: "${manualCardId}" normalized to "${normalizedCardId}"`);
                      
                      const manualResult: ScanResult = {
                        cardId: normalizedCardId
                      };
                      setScanResult(manualResult);
                      setAppState(APP_STATES.CHECK_BALANCE);
                      setIsLoading(true);
                      
                      // Look up customer by manually entered card ID
                      fetch(`/api/customers/byCardId/${manualResult.cardId}`)
                        .then(response => {
                          if (response.ok) {
                            return response.json();
                          }
                          return null;
                        })
                        .then(customerData => {
                          setCustomer(customerData);
                          setIsLoading(false);
                        })
                        .catch(error => {
                          console.error("Error looking up customer for balance:", error);
                          setCustomer(null);
                          setIsLoading(false);
                        });
                    }
                  } else {
                    // Switch to balance check scanning mode
                    setAppState(APP_STATES.SCANNING_FOR_BALANCE);
                  }
                }}
              >
                Check Balance
              </button>
              <button 
                className="w-full bg-green-600 text-white rounded-md py-2 font-medium"
                onClick={() => {
                  // Show dialog to choose between scan and manual input
                  const useManualInput = window.confirm("Would you like to enter the Card ID manually?\n\nClick 'OK' to enter Card ID manually or 'Cancel' to scan an NFC card.");
                  
                  if (useManualInput) {
                    // Get manual input
                    const manualCardId = window.prompt("Enter Card ID:", "");
                    if (manualCardId && manualCardId.trim()) {
                      // Use the manual card ID with special handling for Android Chrome
                      // First, normalize it by removing colons, spaces, dashes, etc.
                      let normalizedCardId = manualCardId.trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                      
                      // Ensure the "CARD-" prefix is present
                      if (!normalizedCardId.startsWith("CARD-")) {
                        normalizedCardId = "CARD-" + normalizedCardId;
                      }
                      
                      console.log(`Manual entry for reload: "${manualCardId}" normalized to "${normalizedCardId}"`);
                      
                      const manualResult: ScanResult = {
                        cardId: normalizedCardId
                      };
                      setScanResult(manualResult);
                      setAppState(APP_STATES.RELOAD_ACCOUNT);
                      setIsLoading(true);
                      
                      // Look up customer by manually entered card ID
                      fetch(`/api/customers/byCardId/${manualResult.cardId}`)
                        .then(response => {
                          if (response.ok) {
                            return response.json();
                          }
                          return null;
                        })
                        .then(customerData => {
                          setCustomer(customerData);
                          setIsLoading(false);
                        })
                        .catch(error => {
                          console.error("Error looking up customer for reload:", error);
                          setCustomer(null);
                          setIsLoading(false);
                        });
                    }
                  } else {
                    // Switch to reload account scanning mode
                    setAppState(APP_STATES.SCANNING_FOR_RELOAD);
                  }
                }}
              >
                Reload Account
              </button>
            </div>
          </div>
        )}
        
        {/* We removed the SCANNING_FOR_PAYMENT state which was causing double scanning */}
        
        {/* Looking up customer */}
        {appState === APP_STATES.LOOKING_UP_CUSTOMER && (
          <div className="p-6 flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-center text-lg">Looking up customer...</p>
          </div>
        )}
        
        {/* Customer found - show details */}
        {appState === APP_STATES.CUSTOMER_FOUND && scanResult && customer && (
          <CustomerDetailsMobile 
            scanResult={scanResult}
            onContinue={handleContinueToPayment}
            onNewCustomer={handleNewCustomer}
            onBack={() => {
              setScanResult(null);
              setCustomer(null);
              setAppState(APP_STATES.READY);
            }}
          />
        )}
        
        {/* Customer not found - option to register */}
        {appState === APP_STATES.CUSTOMER_NOT_FOUND && scanResult && (
          <div className="p-6 flex flex-col items-center">
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
            <div className="space-y-3 w-full">
              <button 
                className="w-full bg-primary text-white rounded-md py-2 font-medium"
                onClick={handleNewCustomer}
              >
                Register New Customer
              </button>
              <button 
                className="w-full bg-secondary text-secondary-foreground rounded-md py-2 font-medium"
                onClick={() => {
                  setScanResult(null);
                  setCustomer(null);
                  setAppState(APP_STATES.READY);
                }}
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
        
        {/* Registering a new customer */}
        {appState === APP_STATES.REGISTERING_CUSTOMER && scanResult && (
          <CustomerRegistration 
            scanResult={scanResult}
            onRegistrationComplete={handleRegistrationComplete}
            onCancel={handleCancelRegistration}
          />
        )}
        
        {/* Payment Details Section */}
        {appState === APP_STATES.SCAN_COMPLETE && scanResult && customer && (
          <PaymentDetails 
            scanResult={scanResult}
            customer={customer}
            onProcessPayment={handleProcessPayment}
            settings={settings}
          />
        )}
        
        {/* Processing Payment Section */}
        {appState === APP_STATES.PROCESSING_PAYMENT && (
          <PaymentProcessing />
        )}
        
        {/* Payment Result Section */}
        {appState === APP_STATES.PAYMENT_COMPLETE && result && result.transaction && (
          <PaymentResult 
            success={result.success} 
            transaction={{
              transactionId: result.transaction.transactionId,
              amount: result.transaction.amount,
              customerName: result.transaction.customerName,
              createdAt: result.transaction.createdAt,
              errorMessage: result.transaction.errorMessage,
            }}
            customer={result.customer}
            onNewTransaction={handleNewTransaction}
            onRetry={handleRetryPayment}
          />
        )}

        {/* Manual Registration (without NFC scan) */}
        {appState === APP_STATES.MANUAL_REGISTRATION && (
          <div className="p-6">
            <div className="flex items-center mb-4">
              <button 
                className="text-sm text-primary flex items-center"
                onClick={() => setAppState(APP_STATES.READY)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                Back
              </button>
              <h2 className="font-semibold text-lg text-center flex-1 pr-8">Register New Customer</h2>
            </div>
            <CustomerRegistration 
              scanResult={{cardId: "CARD-" + Date.now()}}
              onRegistrationComplete={(newCustomer) => {
                setCustomer(newCustomer);
                setAppState(APP_STATES.READY);
              }}
              onCancel={() => setAppState(APP_STATES.READY)}
            />
          </div>
        )}
        
        {/* Balance Inquiry */}
        {appState === APP_STATES.CHECK_BALANCE && scanResult && (
          <div className="p-4">
            <BalanceInquiry 
              scanResult={scanResult}
              customer={customer}
              isLoading={isLoading}
              onBack={() => {
                setScanResult(null);
                setCustomer(null);
                setAppState(APP_STATES.READY);
              }}
            />
          </div>
        )}
        
        {/* Scanning for Balance Check */}
        {appState === APP_STATES.SCANNING_FOR_BALANCE && (
          <div className="p-6 flex flex-col items-center justify-center h-full">
            <NFCScanner 
              onScanComplete={(result: ScanResult) => {
                // Ensure the cardId has the CARD- prefix
                let normalizedCardId = result.cardId;
                if (!normalizedCardId.startsWith("CARD-")) {
                  normalizedCardId = "CARD-" + normalizedCardId;
                }
                
                // Update result with normalized cardId
                const normalizedResult: ScanResult = {
                  cardId: normalizedCardId
                };
                
                setScanResult(normalizedResult);
                setAppState(APP_STATES.CHECK_BALANCE);
                setIsLoading(true);
                
                // Look up customer by card ID for balance check
                fetch(`/api/customers/byCardId/${normalizedResult.cardId}`)
                  .then(response => {
                    if (response.ok) {
                      return response.json();
                    }
                    return null;
                  })
                  .then(customerData => {
                    setCustomer(customerData);
                    setIsLoading(false);
                  })
                  .catch(error => {
                    console.error("Error looking up customer for balance:", error);
                    setCustomer(null);
                    setIsLoading(false);
                  });
              }} 
              onBack={() => {
                setAppState(APP_STATES.READY);
              }}
            />
          </div>
        )}
        
        {/* Scanning for Reload */}
        {appState === APP_STATES.SCANNING_FOR_RELOAD && (
          <div className="p-6 flex flex-col items-center justify-center h-full">
            <NFCScanner 
              onScanComplete={(result: ScanResult) => {
                // Ensure the cardId has the CARD- prefix
                let normalizedCardId = result.cardId;
                if (!normalizedCardId.startsWith("CARD-")) {
                  normalizedCardId = "CARD-" + normalizedCardId;
                }
                
                // Update result with normalized cardId
                const normalizedResult: ScanResult = {
                  cardId: normalizedCardId
                };
                
                setScanResult(normalizedResult);
                setAppState(APP_STATES.RELOAD_ACCOUNT);
                setIsLoading(true);
                
                // Look up customer by card ID for reload
                fetch(`/api/customers/byCardId/${normalizedResult.cardId}`)
                  .then(response => {
                    if (response.ok) {
                      return response.json();
                    }
                    return null;
                  })
                  .then(customerData => {
                    setCustomer(customerData);
                    setIsLoading(false);
                  })
                  .catch(error => {
                    console.error("Error looking up customer for reload:", error);
                    setCustomer(null);
                    setIsLoading(false);
                  });
              }} 
              onBack={() => {
                setAppState(APP_STATES.READY);
              }}
            />
          </div>
        )}
        
        {/* Reload Account */}
        {appState === APP_STATES.RELOAD_ACCOUNT && scanResult && (
          <div className="p-4">
            <ReloadAccount 
              scanResult={scanResult}
              customer={customer}
              isLoading={isLoading}
              onBack={() => {
                setScanResult(null);
                setCustomer(null);
                setAppState(APP_STATES.READY);
              }}
            />
          </div>
        )}
      </div>
      
      {/* Transaction History Drawer */}
      <TransactionHistory 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
      />
      
      {/* Settings Drawer */}
      <Settings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSave={handleSaveSettings}
        initialSettings={settings}
      />
      
      {/* Reports Drawer */}
      <Reports
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
      />
    </div>
  );
}
