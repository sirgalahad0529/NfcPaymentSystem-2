import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, CreditCard, ArrowLeft, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Define the ScanResult interface
interface ScanResult {
  cardId: string;
}

// Define a simple customer interface to match our needs
interface Customer {
  name: string;
  email?: string;
  phone?: string;
  balance: number;
}

interface BalanceInquiryProps {
  scanResult: ScanResult;
  customer?: Customer;
  isLoading: boolean;
  onBack: () => void;
}

export function BalanceInquiry({ scanResult, customer, isLoading, onBack }: BalanceInquiryProps) {
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
            <h2 className="font-semibold text-lg">Balance Inquiry</h2>
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
                <h3 className="text-sm font-medium text-muted-foreground">Balance Information</h3>
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
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Back to Home button */}
      <Button 
        className="w-full mt-4"
        variant="outline"
        onClick={onBack}
      >
        Back to Home
      </Button>
    </div>
  );
}