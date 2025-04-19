import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircleIcon, CircleAlert, PanelTopOpen, Repeat1, Receipt } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface TransactionItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface PaymentResultProps {
  success: boolean;
  transaction: {
    transactionId?: string;
    amount?: number;
    description?: string;
    customerName?: string;
    walletType?: string;
    timestamp?: string;
    createdAt?: string;
    errorMessage?: string;
    items?: TransactionItem[];
  };
  customer?: {
    id: number;
    name: string;
    balance: number;
  };
  onNewTransaction: () => void;
  onRetry: () => void;
}

export function PaymentResult({ success, transaction, customer, onNewTransaction, onRetry }: PaymentResultProps) {
  // Redirect to home page for new transactions
  const handleNewTransaction = () => {
    window.location.href = '/';
  };
  return (
    <div className="p-4">
      <Card>
        <CardContent className="p-6">
          {success ? (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircleIcon className="text-green-600 h-12 w-12" />
              </div>
              <h2 className="font-semibold text-lg text-center mb-2">Payment Successful</h2>
              <p className="text-muted-foreground text-center mb-6">
                Your transaction has been completed successfully!
              </p>
              
              <div className="w-full bg-neutral-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-muted-foreground">Transaction ID:</div>
                  <div className="font-medium">{transaction.transactionId}</div>
                  {transaction.description && (
                    <>
                      <div className="text-muted-foreground">Description:</div>
                      <div className="font-medium">{transaction.description}</div>
                    </>
                  )}
                  <div className="text-muted-foreground">Total Amount:</div>
                  <div className="font-medium">₱{transaction.amount?.toFixed(2)}</div>
                  <div className="text-muted-foreground">Date & Time:</div>
                  <div className="font-medium">
                    {transaction.createdAt 
                      ? formatDate(new Date(transaction.createdAt)) 
                      : transaction.timestamp 
                        ? formatDate(new Date(transaction.timestamp))
                        : "-"}
                  </div>
                  {customer && (
                    <>
                      <div className="text-muted-foreground">Updated Balance:</div>
                      <div className="font-medium text-primary font-bold">₱{customer.balance.toFixed(2)}</div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Display transaction items if available */}
              {transaction.items && transaction.items.length > 0 && (
                <div className="w-full border rounded-md mb-6 overflow-hidden">
                  <div className="bg-muted p-2 flex items-center">
                    <Receipt className="h-4 w-4 mr-2 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Transaction Items</h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40%]">Description</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transaction.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">₱{item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right">₱{item.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-medium">
                          Total
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          ₱{transaction.amount?.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
              
              <Button 
                className="w-full" 
                onClick={handleNewTransaction}
              >
                <PanelTopOpen className="mr-2 h-5 w-5" />
                New Transaction
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <CircleAlert className="text-red-600 h-12 w-12" />
              </div>
              <h2 className="font-semibold text-lg text-center mb-2">Payment Failed</h2>
              <p className="text-muted-foreground text-center mb-2">
                We couldn't complete your transaction.
              </p>
              <p className="text-red-600 text-center text-sm mb-6">
                {transaction.errorMessage || "An unknown error occurred"}
              </p>
              
              <div className="flex w-full space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={onRetry}
                >
                  <Repeat1 className="mr-2 h-5 w-5" />
                  Retry
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleNewTransaction}
                >
                  <PanelTopOpen className="mr-2 h-5 w-5" />
                  New
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
