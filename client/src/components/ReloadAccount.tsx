import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Loader2, CreditCard, ArrowLeft, Wallet, PlusCircle } from "lucide-react";

import { formatCurrency } from "@/lib/utils";

// Define a simple customer interface to match our needs
interface Customer {
  name: string;
  email?: string;
  phone?: string;
  balance: number;
  id: number;
}
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define the ScanResult interface
interface ScanResult {
  cardId: string;
}

interface ReloadAccountProps {
  scanResult: ScanResult;
  customer?: Customer;
  isLoading: boolean;
  onBack: () => void;
}

export function ReloadAccount({ scanResult, customer, isLoading, onBack }: ReloadAccountProps) {
  const [amount, setAmount] = useState<number>(10000); // 100 pesos in cents
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newBalance, setNewBalance] = useState<number | null>(null);

  const handleReload = async () => {
    if (!customer) return;
    
    if (amount < 10000) { // 100 pesos in cents
      setError("Minimum reload amount is ₱100");
      return;
    }
    
    // Check if amount is a multiple of 50 pesos (5000 cents)
    if (amount % 5000 !== 0) {
      setError("Reload amount must be in increments of ₱50");
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      // Call the API to reload the account
      const response = await fetch(`/api/customers/${customer.id}/reload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });
      
      if (response.ok) {
        const result = await response.json();
        setSuccess(true);
        setNewBalance(result.newBalance);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to reload account");
      }
    } catch (error) {
      console.error("Error reloading account:", error);
      setError("An error occurred while reloading the account");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="font-semibold text-lg">Reload Account</h2>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            <span>Card ID: {scanResult.cardId}</span>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading customer information...</span>
            </div>
          ) : !customer ? (
            <div className="bg-amber-50 text-amber-600 p-4 rounded-md">
              <p className="font-medium">Card Not Registered</p>
              <p className="text-sm mt-1">
                This card is not registered with any customer. Please register the card first.
              </p>
            </div>
          ) : success ? (
            <div className="space-y-6">
              <div className="bg-green-50 p-6 rounded-md text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="rounded-full bg-green-100 p-3">
                    <PlusCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-xl text-green-700">Account Reloaded!</h3>
                  <p className="text-sm text-green-600">
                    You have successfully added {formatCurrency(amount / 100)} to {customer.name}'s account.
                  </p>
                  <div className="mt-4 pt-4 border-t border-green-200 w-full">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-700">Previous Balance:</span>
                      <span className="font-semibold text-green-700">
                        {formatCurrency(customer.balance)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm font-medium text-green-700">Amount Added:</span>
                      <span className="font-semibold text-green-700">
                        +{formatCurrency(amount / 100)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-green-200">
                      <span className="text-sm font-medium text-green-700">New Balance:</span>
                      <span className="font-bold text-xl text-green-700">
                        {formatCurrency(newBalance || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={onBack}
              >
                Back to Home
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Customer Information</h3>
                <div className="bg-slate-50 p-4 rounded-md">
                  <p className="font-medium text-lg">{customer.name}</p>
                  {customer.email && <p className="text-sm text-muted-foreground">{customer.email}</p>}
                  {customer.phone && <p className="text-sm text-muted-foreground">{customer.phone}</p>}
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Current Balance</h3>
                <div className="bg-green-50 p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Wallet className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-600">Available Balance</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(customer.balance)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="reload-amount">Reload Amount (in ₱)</Label>
                  <Input
                    id="reload-amount"
                    type="number"
                    value={amount / 100}
                    onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) * 100))}
                    min="100"
                    step="50"
                    className="text-right"
                  />
                  <p className="text-xs text-muted-foreground">Minimum reload amount: ₱100 (in increments of ₱50)</p>
                </div>
                
                {error && (
                  <div className="bg-red-50 p-3 rounded-md text-red-600 text-sm">
                    {error}
                  </div>
                )}
                
                <Button 
                  className="w-full"
                  disabled={isProcessing || amount < 10000 || amount % 5000 !== 0}
                  onClick={handleReload}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Reload {formatCurrency(amount / 100)}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Back to Home button */}
      {!success && !isLoading && (
        <Button 
          className="w-full mt-4"
          variant="outline"
          onClick={onBack}
        >
          Back to Home
        </Button>
      )}
    </div>
  );
}