import { useState, useEffect } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { Button } from "@/components/ui/button";
import { PanelBottomClose, HistoryIcon, WalletMinimal } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Transaction } from "@/types";
import { PAYMENT_STATUS } from "@/lib/constants";

interface TransactionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionHistory({ isOpen, onClose }: TransactionHistoryProps) {
  const { transactions, isLoading } = useTransactions();
  const [slideIn, setSlideIn] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setSlideIn(true);
    } else {
      setSlideIn(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-30">
      <div className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white h-full transform transition-transform duration-300 ${slideIn ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="bg-primary text-white p-4 flex items-center justify-between">
            <h2 className="font-semibold text-lg flex items-center">
              <HistoryIcon className="mr-2 h-5 w-5" />
              Transaction History
            </h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-primary-dark" 
              onClick={onClose}
            >
              <PanelBottomClose className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="text-center py-8">Loading transactions...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions yet
              </div>
            ) : (
              transactions.map((transaction: Transaction) => (
                <div key={transaction.transactionId} className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{transaction.description || "NFC Payment"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(new Date(transaction.createdAt))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">₱{(transaction.amount / 100).toFixed(2)}</p>
                      <div className="flex items-center justify-end">
                        <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                          transaction.status === PAYMENT_STATUS.COMPLETED 
                            ? 'bg-secondary' 
                            : transaction.status === PAYMENT_STATUS.PENDING 
                              ? 'bg-amber-500' 
                              : 'bg-red-500'
                        }`}></span>
                        <span className="text-xs text-muted-foreground capitalize">{transaction.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div className="text-muted-foreground">ID: <span>{transaction.transactionId}</span></div>
                    <div className="flex items-center text-muted-foreground">
                      <WalletMinimal className="h-3 w-3 mr-1" />
                      <span className="capitalize">{transaction.walletType}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
