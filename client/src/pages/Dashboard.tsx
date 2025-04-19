import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Transaction } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PAYMENT_STATUS } from "@/lib/constants";
import { TransactionDetails } from "@/components/TransactionDetails";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Home, 
  Calendar as CalendarIcon, 
  Search, 
  Filter, 
  Download, 
  ArrowUpDown, 
  ArrowLeft,
  BarChart4,
  CreditCard,
  Activity,
  DollarSign
} from "lucide-react";
import { Link } from "wouter";

// Helper function to get total amount from transactions
const getTotalAmount = (transactions: Transaction[]) => {
  return transactions.reduce((total, transaction) => {
    return total + transaction.amount;
  }, 0);
};

// Helper function to filter transactions
const filterTransactions = (
  transactions: Transaction[], 
  filter: {
    startDate: Date | null;
    endDate: Date | null;
    minAmount: number | null;
    maxAmount: number | null;
    status: string | null;
    search: string;
  }
) => {
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.createdAt);
    
    // Filter by date range
    if (filter.startDate && transactionDate < filter.startDate) {
      return false;
    }
    if (filter.endDate) {
      const endDate = new Date(filter.endDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of day
      if (transactionDate > endDate) {
        return false;
      }
    }
    
    // Filter by amount range
    if (filter.minAmount !== null && transaction.amount < filter.minAmount) {
      return false;
    }
    if (filter.maxAmount !== null && transaction.amount > filter.maxAmount) {
      return false;
    }
    
    // Filter by status
    if (filter.status && transaction.status !== filter.status) {
      return false;
    }
    
    // Filter by search (card ID or customer name)
    if (filter.search) {
      const search = filter.search.toLowerCase();
      return (
        transaction.cardId.toLowerCase().includes(search) ||
        transaction.customerName.toLowerCase().includes(search)
      );
    }
    
    return true;
  });
};

export default function Dashboard() {
  // State for filtering
  const [activeTab, setActiveTab] = useState("all");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [minAmount, setMinAmount] = useState<number | null>(null);
  const [maxAmount, setMaxAmount] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isTransactionDetailsOpen, setIsTransactionDetailsOpen] = useState(false);
  
  // Fetch transactions
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['/api/transactions'],
    staleTime: 5000, // 5 seconds
  });
  
  // Apply filters
  const filteredTransactions = filterTransactions(transactions as Transaction[], {
    startDate,
    endDate,
    minAmount,
    maxAmount,
    status: activeTab === "all" ? statusFilter : activeTab,
    search: searchQuery,
  });
  
  // Calculate statistics
  const totalTransactions = filteredTransactions.length;
  const totalAmount = getTotalAmount(filteredTransactions);
  const successfulTransactions = filteredTransactions.filter(
    t => t.status === PAYMENT_STATUS.COMPLETED
  );
  const totalSuccessfulAmount = getTotalAmount(successfulTransactions);
  const successRate = totalTransactions > 0 
    ? (successfulTransactions.length / totalTransactions) * 100 
    : 0;
  
  // Reset all filters
  const resetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setMinAmount(null);
    setMaxAmount(null);
    setStatusFilter(null);
    setSearchQuery("");
    setActiveTab("all");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Merchant Dashboard</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => setIsFiltersOpen(!isFiltersOpen)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart4 className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">{totalTransactions}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">{formatCurrency(totalAmount / 100)}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Successful Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">{formatCurrency(totalSuccessfulAmount / 100)}</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters Panel */}
      {isFiltersOpen && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? formatDate(startDate) : "Start Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate || undefined}
                      onSelect={(date: Date | undefined) => setStartDate(date || null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? formatDate(endDate) : "End Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate || undefined}
                      onSelect={(date: Date | undefined) => setEndDate(date || null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Amount Range (₱)</Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minAmount !== null ? minAmount / 100 : ""}
                  onChange={e => setMinAmount(e.target.value ? parseFloat(e.target.value) * 100 : null)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxAmount !== null ? maxAmount / 100 : ""}
                  onChange={e => setMaxAmount(e.target.value ? parseFloat(e.target.value) * 100 : null)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={statusFilter || ""} 
                onValueChange={value => setStatusFilter(value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value={PAYMENT_STATUS.COMPLETED}>Successful</SelectItem>
                  <SelectItem value={PAYMENT_STATUS.FAILED}>Failed</SelectItem>
                  <SelectItem value={PAYMENT_STATUS.PENDING}>Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <Label>Search by Card ID or Customer</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-end space-x-2">
              <Button variant="secondary" onClick={resetFilters} className="flex-1">
                Reset Filters
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            {totalTransactions} transactions found
          </CardDescription>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value={PAYMENT_STATUS.COMPLETED}>Successful</TabsTrigger>
              <TabsTrigger value={PAYMENT_STATUS.FAILED}>Failed</TabsTrigger>
              <TabsTrigger value={PAYMENT_STATUS.PENDING}>Pending</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found.
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium">ID</th>
                      <th className="px-4 py-3 text-left font-medium">
                        <div className="flex items-center">
                          Date/Time
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left font-medium">Card ID</th>
                      <th className="px-4 py-3 text-left font-medium">Customer</th>
                      <th className="px-4 py-3 text-left font-medium">
                        <div className="flex items-center">
                          Amount
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 text-left">{transaction.transactionId.slice(0, 8)}...</td>
                        <td className="px-4 py-3 text-left">{formatDate(new Date(transaction.createdAt))}</td>
                        <td className="px-4 py-3 text-left font-mono text-xs">{transaction.cardId}</td>
                        <td className="px-4 py-3 text-left">{transaction.customerName}</td>
                        <td className="px-4 py-3 text-left font-medium">
                          {formatCurrency(transaction.amount / 100)}
                        </td>
                        <td className="px-4 py-3 text-left">
                          <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                            ${transaction.status === PAYMENT_STATUS.COMPLETED 
                              ? 'bg-green-50 text-green-600' 
                              : transaction.status === PAYMENT_STATUS.FAILED 
                                ? 'bg-red-50 text-red-600' 
                                : 'bg-amber-50 text-amber-600'
                            }`}
                          >
                            {transaction.status}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setIsTransactionDetailsOpen(true);
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Transaction Details Dialog */}
      <TransactionDetails
        isOpen={isTransactionDetailsOpen}
        onClose={() => setIsTransactionDetailsOpen(false)}
        transaction={selectedTransaction}
      />
    </div>
  );
}