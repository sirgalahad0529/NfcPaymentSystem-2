import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  CreditCard,
  DollarSign,
  FileBarChart,
  FileText,
  TrendingUp,
} from "lucide-react";

interface ReportsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Reports({ isOpen, onClose }: ReportsProps) {
  const [activeTab, setActiveTab] = useState("transaction-summary");
  const [period, setPeriod] = useState("daily");
  const [groupBy, setGroupBy] = useState("day");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Date range for the query
  const dateParams = startDate && endDate ? {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  } : {};
  
  // Transaction Summary Query
  const transactionSummaryQuery = useQuery({
    queryKey: ['/api/reports/transactions-summary', period, dateParams],
    queryFn: async () => {
      try {
        const url = `/api/reports/transactions-summary?period=${period}${
          startDate && endDate 
            ? `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
            : ''
        }`;
        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (err) {
        console.error("Error in transaction summary query:", err);
        return { summary: [] };
      }
    },
    enabled: isOpen && activeTab === "transaction-summary"
  });
  
  // Revenue Report Query
  const revenueReportQuery = useQuery({
    queryKey: ['/api/reports/revenue', groupBy, dateParams],
    queryFn: async () => {
      try {
        const url = `/api/reports/revenue?groupBy=${groupBy}${
          startDate && endDate 
            ? `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
            : ''
        }`;
        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (err) {
        console.error("Error in revenue report query:", err);
        return { timeBasedRevenue: [], productRevenue: [] };
      }
    },
    enabled: isOpen && activeTab === "revenue-report"
  });
  
  // Reset dates when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setStartDate(undefined);
      setEndDate(undefined);
    }
  }, [isOpen]);
  
  const clearDateRange = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };
  
  const formatChartDate = (dateStr: string) => {
    if (!dateStr) return '';
    // For month format (YYYY-MM)
    if (dateStr.length === 7) {
      const [year, month] = dateStr.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
    }
    // For daily format (YYYY-MM-DD)
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Handle small screens (like mobile)
  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 500;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[290px] sm:max-w-xl md:max-w-2xl lg:max-w-3xl h-[400px] sm:h-auto sm:max-h-[90vh] overflow-y-auto p-1 sm:p-2">
        <DialogTitle className="sr-only">Reports & Analytics</DialogTitle>
        <DialogDescription className="sr-only">View and analyze payment transaction data</DialogDescription>
        
        {/* Close button */}
        <div className="fixed top-2 right-2 z-[60]">
          <Button
            variant="secondary"
            size="sm"
            className="h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full shadow-md border border-gray-300 bg-background"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </Button>
        </div>
        
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm mb-2 pt-1 pb-2 flex justify-between items-center border-b pr-8 sm:pr-10">
          <div className="flex items-center gap-2">
            <FileBarChart className="h-4 w-4 sm:h-5 sm:w-5" />
            <h2 className="text-sm sm:text-base font-medium">Reports & Analytics</h2>
          </div>
        </div>
        
        {/* Mobile simplified view */}
        {isMobileView ? (
          <div className="space-y-3 pb-4 px-2 w-full max-w-full overflow-x-hidden">
            <Alert variant="default" className="mb-4">
              <AlertDescription className="text-[10px]">
                Detailed reports are optimized for larger screens. Please use a tablet or desktop device for full analytics.
              </AlertDescription>
            </Alert>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-3">
                <TabsTrigger value="transaction-summary" className="text-xs py-1">
                  <FileText className="h-3 w-3 mr-1" />
                  Transactions
                </TabsTrigger>
                <TabsTrigger value="revenue-report" className="text-xs py-1">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Revenue
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="transaction-summary">
                {transactionSummaryQuery.isLoading ? (
                  <div className="p-4 text-center text-xs">Loading...</div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    <Card className="shadow-sm">
                      <CardHeader className="px-2 py-1">
                        <CardTitle className="text-xs">Total Transactions</CardTitle>
                      </CardHeader>
                      <CardContent className="px-2 py-1">
                        <div className="text-sm font-bold">
                          {transactionSummaryQuery.data?.summary?.reduce(
                            (sum: number, item: any) => sum + item.count, 0) || 0}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="shadow-sm">
                      <CardHeader className="px-2 py-1">
                        <CardTitle className="text-xs">Total Revenue</CardTitle>
                      </CardHeader>
                      <CardContent className="px-2 py-1">
                        <div className="text-sm font-bold">
                          {formatCurrency(transactionSummaryQuery.data?.summary?.reduce(
                            (sum: number, item: any) => sum + item.amount, 0) || 0)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="revenue-report">
                {revenueReportQuery.isLoading ? (
                  <div className="p-4 text-center text-xs">Loading...</div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    <Card className="shadow-sm">
                      <CardHeader className="px-2 py-1">
                        <CardTitle className="text-xs">Total Revenue</CardTitle>
                      </CardHeader>
                      <CardContent className="px-2 py-1">
                        <div className="text-sm font-bold">
                          {formatCurrency(revenueReportQuery.data?.timeBasedRevenue?.reduce(
                            (sum: number, item: any) => sum + item.revenue, 0) || 0)}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="shadow-sm">
                      <CardHeader className="px-2 py-1">
                        <CardTitle className="text-xs">Transaction Count</CardTitle>
                      </CardHeader>
                      <CardContent className="px-2 py-1">
                        <div className="text-sm font-bold">
                          {revenueReportQuery.data?.timeBasedRevenue?.reduce(
                            (sum: number, item: any) => sum + item.transactionCount, 0) || 0}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 pb-4 px-1 w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex flex-col gap-3 mb-3 sm:mb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="transaction-summary" className="flex items-center justify-center gap-1 text-xs sm:text-sm py-1 sm:py-2">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Transaction Summary</span>
                    <span className="sm:hidden">Transactions</span>
                  </TabsTrigger>
                  <TabsTrigger value="revenue-report" className="flex items-center justify-center gap-1 text-xs sm:text-sm py-1 sm:py-2">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Revenue Report</span>
                    <span className="sm:hidden">Revenue</span>
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 overflow-x-auto">
                  <div className="flex gap-1 sm:gap-2 min-w-max">
                    <div className="w-[100px] sm:w-auto">
                      <DatePicker
                        date={startDate}
                        onSelect={setStartDate}
                        placeholder="Start"
                      />
                    </div>
                    <div className="w-[100px] sm:w-auto">
                      <DatePicker
                        date={endDate}
                        onSelect={setEndDate}
                        placeholder="End"
                      />
                    </div>
                    {(startDate || endDate) && (
                      <Button variant="outline" size="sm" onClick={clearDateRange} className="text-xs h-8 sm:h-9 px-2 sm:px-3">
                        Clear
                      </Button>
                    )}
                  </div>
                  
                  <div className="mt-1 sm:mt-0 min-w-max">
                    {activeTab === "transaction-summary" && (
                      <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[130px] sm:w-[150px] h-8 sm:h-9 text-xs sm:text-sm">
                          <SelectValue placeholder="Select Period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily" className="text-xs sm:text-sm">Daily</SelectItem>
                          <SelectItem value="weekly" className="text-xs sm:text-sm">Weekly</SelectItem>
                          <SelectItem value="monthly" className="text-xs sm:text-sm">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    
                    {activeTab === "revenue-report" && (
                      <Select value={groupBy} onValueChange={setGroupBy}>
                        <SelectTrigger className="w-[130px] sm:w-[150px] h-8 sm:h-9 text-xs sm:text-sm">
                          <SelectValue placeholder="Group By" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day" className="text-xs sm:text-sm">Day</SelectItem>
                          <SelectItem value="week" className="text-xs sm:text-sm">Week</SelectItem>
                          <SelectItem value="month" className="text-xs sm:text-sm">Month</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </div>
              
              <TabsContent value="transaction-summary" className="mt-0">
                {transactionSummaryQuery.isLoading ? (
                  <div className="p-4 text-center">Loading data...</div>
                ) : transactionSummaryQuery.error ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      An error occurred while fetching transaction data.
                    </AlertDescription>
                  </Alert>
                ) : transactionSummaryQuery.data?.summary?.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No transaction data available for the selected period.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-2 md:gap-4">
                      <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 sm:pb-1 px-2 sm:px-4 pt-2 sm:pt-4">
                          <CardTitle className="text-xs md:text-sm font-medium">Total Transactions</CardTitle>
                          <FileText className="h-3 md:h-4 w-3 md:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-2 sm:px-4 py-1 sm:py-2">
                          <div className="text-lg sm:text-xl md:text-2xl font-bold">
                            {transactionSummaryQuery.data?.summary?.reduce((sum: number, item: any) => sum + item.count, 0) || 0}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 sm:pb-1 px-2 sm:px-4 pt-2 sm:pt-4">
                          <CardTitle className="text-xs md:text-sm font-medium">Total Revenue</CardTitle>
                          <DollarSign className="h-3 md:h-4 w-3 md:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-2 sm:px-4 py-1 sm:py-2">
                          <div className="text-sm sm:text-lg md:text-xl font-bold">
                            {formatCurrency(transactionSummaryQuery.data?.summary?.reduce((sum: number, item: any) => sum + item.amount, 0) || 0)}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="revenue-report" className="mt-0">
                {revenueReportQuery.isLoading ? (
                  <div className="p-4 text-center">Loading data...</div>
                ) : revenueReportQuery.error ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      An error occurred while fetching revenue data.
                    </AlertDescription>
                  </Alert>
                ) : revenueReportQuery.data?.timeBasedRevenue?.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No revenue data available for the selected period.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-2 md:gap-4">
                      <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 sm:pb-1 px-2 sm:px-4 pt-2 sm:pt-4">
                          <CardTitle className="text-xs md:text-sm font-medium">Total Revenue</CardTitle>
                          <DollarSign className="h-3 md:h-4 w-3 md:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-2 sm:px-4 py-1 sm:py-2">
                          <div className="text-sm sm:text-lg md:text-xl font-bold">
                            {formatCurrency(revenueReportQuery.data?.timeBasedRevenue?.reduce((sum: number, item: any) => sum + item.revenue, 0) || 0)}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 sm:pb-1 px-2 sm:px-4 pt-2 sm:pt-4">
                          <CardTitle className="text-xs md:text-sm font-medium">Transaction Count</CardTitle>
                          <FileText className="h-3 md:h-4 w-3 md:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-2 sm:px-4 py-1 sm:py-2">
                          <div className="text-lg sm:text-xl md:text-2xl font-bold">
                            {revenueReportQuery.data?.timeBasedRevenue?.reduce((sum: number, item: any) => sum + item.transactionCount, 0) || 0}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}