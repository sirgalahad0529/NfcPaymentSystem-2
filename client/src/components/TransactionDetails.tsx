import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Transaction } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PAYMENT_STATUS } from "@/lib/constants";
import { 
  CreditCard, 
  User, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock,
  Printer,
  Share,
  Receipt
} from "lucide-react";

interface TransactionItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface TransactionDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: (Transaction & { items?: TransactionItem[] }) | null;
}

export function TransactionDetails({ isOpen, onClose, transaction }: TransactionDetailsProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  if (!transaction) return null;
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            Transaction ID: {transaction.transactionId}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status Indicator */}
          <div className={`flex items-center justify-center p-4 rounded-lg 
            ${transaction.status === PAYMENT_STATUS.COMPLETED 
              ? 'bg-green-50' 
              : transaction.status === PAYMENT_STATUS.FAILED 
                ? 'bg-red-50' 
                : 'bg-amber-50'
            }`}
          >
            <div className="flex flex-col items-center">
              {transaction.status === PAYMENT_STATUS.COMPLETED ? (
                <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
              ) : transaction.status === PAYMENT_STATUS.FAILED ? (
                <XCircle className="h-10 w-10 text-red-500 mb-2" />
              ) : (
                <Clock className="h-10 w-10 text-amber-500 mb-2" />
              )}
              
              <div className={`text-lg font-semibold 
                ${transaction.status === PAYMENT_STATUS.COMPLETED 
                  ? 'text-green-700' 
                  : transaction.status === PAYMENT_STATUS.FAILED 
                    ? 'text-red-700' 
                    : 'text-amber-700'
                }`}
              >
                {transaction.status}
              </div>
              
              {transaction.status === PAYMENT_STATUS.FAILED && transaction.errorMessage && (
                <div className="text-sm text-red-600 text-center mt-2">
                  {transaction.errorMessage}
                </div>
              )}
            </div>
          </div>
          
          {/* Transaction Info */}
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Date & Time
              </div>
              <div className="font-medium">
                {formatDate(new Date(transaction.createdAt))}
              </div>
            </div>
            
            <div className="flex justify-between py-2 border-b">
              <div className="flex items-center text-muted-foreground">
                <DollarSign className="h-4 w-4 mr-2" />
                Amount
              </div>
              <div className="font-medium text-lg">
                {formatCurrency(transaction.amount / 100)}
              </div>
            </div>
            
            <div className="flex justify-between py-2 border-b">
              <div className="flex items-center text-muted-foreground">
                <User className="h-4 w-4 mr-2" />
                Customer
              </div>
              <div className="font-medium">
                {transaction.customerName}
              </div>
            </div>
            
            <div className="flex justify-between py-2 border-b">
              <div className="flex items-center text-muted-foreground">
                <CreditCard className="h-4 w-4 mr-2" />
                Card ID
              </div>
              <div className="font-mono text-sm">
                {transaction.cardId}
              </div>
            </div>
            
            {transaction.description && (
              <div className="flex justify-between py-2 border-b">
                <div className="flex items-center text-muted-foreground">
                  Description
                </div>
                <div>
                  {transaction.description}
                </div>
              </div>
            )}
          </div>
          
          {/* Transaction Items */}
          {transaction.items && transaction.items.length > 0 && (
            <div className="border rounded-md overflow-hidden">
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
                      <TableCell className="text-right">{formatCurrency(item.unitPrice / 100)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.amount / 100)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">
                      Total
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(transaction.amount / 100)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex sm:justify-between gap-4">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}