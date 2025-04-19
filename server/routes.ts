import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { paymongoService } from "./services/paymongoService";
import { z } from "zod";
import { 
  paymentRequestSchema,
  scanResultSchema,
  insertCardSchema,
  insertTransactionSchema,
  insertTransactionItemSchema,
  customerRegistrationSchema,
  insertCustomerSchema,
  type TransactionItem
} from "@shared/schema";
import { PAYMENT_STATUS } from "./constants";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  
  // --- Customer Management Routes ---
  
  // Get all customers
  app.get("/api/customers", async (_req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });
  
  // Get customer by ID
  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });
  
  // Lookup customer by card ID
  app.get("/api/customers/byCardId/:cardId", async (req, res) => {
    try {
      const { cardId } = req.params;
      const customer = await storage.getCustomerByCardId(cardId);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found for this card" });
      }
      
      res.json(customer);
    } catch (error) {
      console.error("Failed to lookup customer by card:", error);
      res.status(500).json({ message: "Failed to lookup customer" });
    }
  });
  
  // Register a new customer with card
  app.post("/api/customers/register", async (req, res) => {
    try {
      // Validate registration data
      const registrationData = customerRegistrationSchema.parse(req.body);
      
      // Check if card is already registered
      const existingCard = await storage.getCardByCardId(registrationData.cardId);
      if (existingCard) {
        return res.status(400).json({ 
          message: "This card is already registered to a customer" 
        });
      }
      
      // Create the customer with first name, last name, combined name and initial balance
      const customerData = insertCustomerSchema.parse({
        name: `${registrationData.firstName} ${registrationData.lastName}`,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        email: registrationData.email,
        phone: registrationData.phone,
        // Convert to cents for storage 
        balance: Math.round((registrationData.initialBalance || 0) * 100),
        active: true,
        defaultWalletType: 'default'
      });
      
      const customer = await storage.createCustomer(customerData);
      
      // Create the card linked to the customer
      const cardData = insertCardSchema.parse({
        cardId: registrationData.cardId,
        customerId: customer.id,
        customerName: customer.name,
        walletType: 'default'
      });
      
      const card = await storage.createCard(cardData);
      
      // Return the customer with the registered card
      res.status(201).json({
        customer,
        card
      });
    } catch (error) {
      console.error("Customer registration error:", error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid registration data", 
          errors: error.errors 
        });
      } else if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "An unknown error occurred" });
      }
    }
  });
  
  // --- Transaction Routes ---
  
  // Get all transactions
  app.get("/api/transactions", async (_req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  
  // Get transactions by card ID
  app.get("/api/transactions/card/:cardId", async (req, res) => {
    try {
      const { cardId } = req.params;
      const transactions = await storage.getTransactionsByCardId(cardId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  
  // Get transactions by customer ID
  app.get("/api/transactions/customer/:customerId", async (req, res) => {
    try {
      const id = parseInt(req.params.customerId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      
      const transactions = await storage.getTransactionsByCustomerId(id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer transactions" });
    }
  });
  
  // Get transaction items by transaction ID
  app.get("/api/transactions/:transactionId/items", async (req, res) => {
    try {
      const { transactionId } = req.params;
      
      // First check if the transaction exists
      const transaction = await storage.getTransactionByTransactionId(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      const items = await storage.getTransactionItems(transactionId);
      
      // Convert amounts from cents to decimal for display
      const formattedItems = items.map(item => ({
        ...item,
        unitPrice: item.unitPrice / 100,
        amount: item.amount / 100
      }));
      
      res.json(formattedItems);
    } catch (error) {
      console.error("Failed to fetch transaction items:", error);
      res.status(500).json({ message: "Failed to fetch transaction items" });
    }
  });
  
  // Process payment from NFC scan
  app.post("/api/payments/process", async (req, res) => {
    try {
      const paymentData = paymentRequestSchema.parse(req.body);
      
      // Look up customer by card ID
      const customer = await storage.getCustomerByCardId(paymentData.cardId);
      
      if (!customer) {
        return res.status(404).json({ 
          message: "Customer not found for this card. Please register the customer first." 
        });
      }
      
      // Check if customer has sufficient balance
      const amountInCents = Math.round(paymentData.amount * 100);
      if (customer.balance < amountInCents) {
        return res.status(400).json({
          message: "Insufficient balance. Please add funds to the customer account.",
          currentBalance: customer.balance / 100,
          requiredAmount: paymentData.amount
        });
      }
      
      // Provide customer details if not included in the payment data
      const processedPaymentData = {
        ...paymentData,
        customerName: paymentData.customerName || customer.name,
        customerId: paymentData.customerId || customer.id,
        email: customer.email || undefined
      };
      
      console.log("Processing payment with data:", JSON.stringify({
        customerId: customer.id,
        customerName: customer.name,
        cardId: paymentData.cardId,
        amount: paymentData.amount,
        email: customer.email
      }));
      
      // Process payment
      const paymentResult = await paymongoService.processPayment(processedPaymentData);
      
      // Create transaction record
      const transactionData = insertTransactionSchema.parse({
        transactionId: paymentResult.id,
        amount: Math.round(paymentResult.amount * 100), // Store in cents
        description: paymentResult.description || "NFC Payment",
        cardId: processedPaymentData.cardId,
        customerName: customer.name,
        walletType: 'default',
        status: paymentResult.status,
        errorMessage: paymentResult.errorMessage,
        responseData: paymentResult,
      });
      
      // Prepare transaction items if they exist
      let transaction;
      if (paymentData.items && Array.isArray(paymentData.items) && paymentData.items.length > 0) {
        // Convert line items to transaction items
        const transactionItems = paymentData.items.map(item => 
          insertTransactionItemSchema.parse({
            transactionId: paymentResult.id, // Will be set properly in createTransactionWithItems
            description: item.description,
            quantity: item.quantity,
            unitPrice: Math.round(item.unitPrice * 100), // Store in cents
            amount: Math.round(item.amount * 100), // Store in cents
          })
        );
        
        // Create transaction with items in a single operation
        transaction = await storage.createTransactionWithItems(transactionData, transactionItems);
      } else {
        // Create transaction without items (fallback to previous implementation)
        transaction = await storage.createTransaction(transactionData);
      }
      
      // Deduct balance from customer account if payment was successful
      if (paymentResult.status === PAYMENT_STATUS.COMPLETED) {
        const newBalance = customer.balance - transactionData.amount;
        await storage.updateCustomer(customer.id, {
          balance: newBalance,
        });
        
        // Update the customer object for the response
        customer.balance = newBalance;
      }
      
      // Get transaction items if they exist
      let transactionItems: TransactionItem[] = [];
      
      if (paymentData.items && Array.isArray(paymentData.items) && paymentData.items.length > 0) {
        transactionItems = await storage.getTransactionItems(transaction.transactionId);
      }
      
      // Return payment result with updated customer balance and transaction items
      res.json({
        success: paymentResult.status === PAYMENT_STATUS.COMPLETED,
        transaction: {
          transactionId: transaction.transactionId,
          amount: transaction.amount / 100, // Convert back to decimal
          customerName: transaction.customerName,
          description: transaction.description,
          status: transaction.status,
          errorMessage: transaction.errorMessage,
          createdAt: transaction.createdAt,
          items: transactionItems.map((item: TransactionItem) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice / 100, // Convert back to decimal
            amount: item.amount / 100, // Convert back to decimal
          }))
        },
        customer: {
          id: customer.id,
          name: customer.name,
          balance: customer.balance / 100, // Convert to decimal for display
        }
      });
    } catch (error) {
      console.error("Payment processing error:", error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      } else if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "An unknown error occurred" });
      }
    }
  });
  
  // Update customer information
  app.patch("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      
      // Make sure customer exists
      const existingCustomer = await storage.getCustomer(id);
      if (!existingCustomer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      // Validate update data
      const updateData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
      };
      
      // Update the customer
      const updatedCustomer = await storage.updateCustomer(id, updateData);
      
      res.json(updatedCustomer);
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(500).json({ message: "Failed to update customer" });
    }
  });
  
  // Reload customer account
  app.post("/api/customers/:id/reload", async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const { amount } = req.body;
      
      if (isNaN(customerId)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      
      if (!amount || amount < 100) {
        return res.status(400).json({ message: "Minimum reload amount is ₱100" });
      }
      
      // Look up the customer
      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      // Create a transaction record for the reload
      const transactionData = insertTransactionSchema.parse({
        transactionId: `reload_${Date.now()}`,
        amount: Math.round(amount), // Amount should already be in cents
        description: "Account Reload",
        cardId: "", // We'll get this from customer's cards later
        customerName: customer.name,
        walletType: 'default',
        status: PAYMENT_STATUS.COMPLETED,
      });
      
      // Get the customer's card
      const cards = await storage.getCardsByCustomerId(customerId);
      if (cards && cards.length > 0) {
        transactionData.cardId = cards[0].cardId;
      }
      
      // Add the amount to the customer's balance
      const newBalance = customer.balance + amount;
      await storage.updateCustomer(customer.id, {
        balance: newBalance,
      });
      
      // Create the transaction record
      await storage.createTransaction(transactionData);
      
      // Return the updated balance
      res.json({
        success: true,
        customerId: customer.id,
        customerName: customer.name,
        previousBalance: customer.balance / 100,
        amountAdded: amount / 100,
        newBalance: newBalance,
      });
    } catch (error) {
      console.error("Failed to reload account:", error);
      res.status(500).json({ message: "Failed to reload account" });
    }
  });

  // --- Reports Routes ---
  
  // Get transaction summary by time period (daily, weekly, monthly)
  app.get("/api/reports/transactions-summary", async (req, res) => {
    try {
      const { period = "daily", startDate, endDate } = req.query;
      
      // Get all transactions
      const transactions = await storage.getAllTransactions();
      
      if (!transactions.length) {
        return res.json({ summary: [] });
      }
      
      // Filter by date range if provided
      let filteredTransactions = transactions;
      
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        
        filteredTransactions = transactions.filter(t => {
          const txDate = new Date(t.createdAt);
          return txDate >= start && txDate <= end;
        });
      }
      
      // Group transactions by period
      let summary = [];
      
      if (period === "daily") {
        // Group by day
        const byDay = filteredTransactions.reduce((acc, transaction) => {
          const date = new Date(transaction.createdAt);
          const day = date.toISOString().split('T')[0]; // YYYY-MM-DD
          
          if (!acc[day]) {
            acc[day] = { date: day, count: 0, amount: 0, success: 0, failed: 0 };
          }
          
          acc[day].count += 1;
          acc[day].amount += transaction.amount;
          
          if (transaction.status === PAYMENT_STATUS.COMPLETED) {
            acc[day].success += 1;
          } else if (transaction.status === PAYMENT_STATUS.FAILED) {
            acc[day].failed += 1;
          }
          
          return acc;
        }, {});
        
        summary = Object.values(byDay);
        
      } else if (period === "weekly") {
        // Group by week (Sunday to Saturday)
        const byWeek = filteredTransactions.reduce((acc, transaction) => {
          const date = new Date(transaction.createdAt);
          const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - dayOfWeek); // Move to Sunday
          const weekKey = weekStart.toISOString().split('T')[0]; // YYYY-MM-DD of Sunday
          
          if (!acc[weekKey]) {
            acc[weekKey] = { 
              weekStart: weekKey, 
              weekEnd: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              count: 0, 
              amount: 0,
              success: 0,
              failed: 0
            };
          }
          
          acc[weekKey].count += 1;
          acc[weekKey].amount += transaction.amount;
          
          if (transaction.status === PAYMENT_STATUS.COMPLETED) {
            acc[weekKey].success += 1;
          } else if (transaction.status === PAYMENT_STATUS.FAILED) {
            acc[weekKey].failed += 1;
          }
          
          return acc;
        }, {});
        
        summary = Object.values(byWeek);
        
      } else if (period === "monthly") {
        // Group by month
        const byMonth = filteredTransactions.reduce((acc, transaction) => {
          const date = new Date(transaction.createdAt);
          const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
          
          if (!acc[month]) {
            acc[month] = { month, count: 0, amount: 0, success: 0, failed: 0 };
          }
          
          acc[month].count += 1;
          acc[month].amount += transaction.amount;
          
          if (transaction.status === PAYMENT_STATUS.COMPLETED) {
            acc[month].success += 1;
          } else if (transaction.status === PAYMENT_STATUS.FAILED) {
            acc[month].failed += 1;
          }
          
          return acc;
        }, {});
        
        summary = Object.values(byMonth);
      }
      
      // Sort summary by date in ascending order
      summary.sort((a, b) => {
        const dateA = a.date || a.weekStart || a.month;
        const dateB = b.date || b.weekStart || b.month;
        return dateA.localeCompare(dateB);
      });
      
      // Convert amounts from cents to decimal
      summary = summary.map(item => ({
        ...item,
        amount: item.amount / 100 // Convert to decimal
      }));
      
      res.json({ summary });
    } catch (error) {
      console.error("Error generating transactions summary:", error);
      // Return empty array instead of 500 error
      res.json({ summary: [] });
    }
  });
  
  // Get revenue reports by time period and/or product
  app.get("/api/reports/revenue", async (req, res) => {
    try {
      const { startDate, endDate, groupBy = "day" } = req.query;
      
      // Get all transactions with COMPLETED status
      const allTransactions = await storage.getAllTransactions();
      const completedTransactions = allTransactions.filter(t => 
        t.status === PAYMENT_STATUS.COMPLETED
      );
      
      if (!completedTransactions.length) {
        return res.json({ revenue: [] });
      }
      
      // Filter by date range if provided
      let filteredTransactions = completedTransactions;
      
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        
        filteredTransactions = completedTransactions.filter(t => {
          const txDate = new Date(t.createdAt);
          return txDate >= start && txDate <= end;
        });
      }
      
      // Group by time period
      let revenueByTime = [];
      
      if (groupBy === "day") {
        // Group by day
        const byDay = filteredTransactions.reduce((acc, transaction) => {
          const date = new Date(transaction.createdAt);
          const day = date.toISOString().split('T')[0]; // YYYY-MM-DD
          
          if (!acc[day]) {
            acc[day] = { 
              date: day, 
              revenue: 0,
              transactionCount: 0,
              averageValue: 0
            };
          }
          
          acc[day].revenue += transaction.amount;
          acc[day].transactionCount += 1;
          
          return acc;
        }, {});
        
        // Calculate average transaction value
        Object.values(byDay).forEach(day => {
          day.averageValue = day.revenue / day.transactionCount;
        });
        
        revenueByTime = Object.values(byDay);
        
      } else if (groupBy === "week") {
        // Group by week
        const byWeek = filteredTransactions.reduce((acc, transaction) => {
          const date = new Date(transaction.createdAt);
          const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - dayOfWeek); // Move to Sunday
          const weekKey = weekStart.toISOString().split('T')[0]; // YYYY-MM-DD of Sunday
          
          if (!acc[weekKey]) {
            acc[weekKey] = { 
              weekStart: weekKey, 
              weekEnd: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              revenue: 0,
              transactionCount: 0,
              averageValue: 0
            };
          }
          
          acc[weekKey].revenue += transaction.amount;
          acc[weekKey].transactionCount += 1;
          
          return acc;
        }, {});
        
        // Calculate average transaction value
        Object.values(byWeek).forEach(week => {
          week.averageValue = week.revenue / week.transactionCount;
        });
        
        revenueByTime = Object.values(byWeek);
        
      } else if (groupBy === "month") {
        // Group by month
        const byMonth = filteredTransactions.reduce((acc, transaction) => {
          const date = new Date(transaction.createdAt);
          const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
          
          if (!acc[month]) {
            acc[month] = { 
              month, 
              revenue: 0,
              transactionCount: 0,
              averageValue: 0
            };
          }
          
          acc[month].revenue += transaction.amount;
          acc[month].transactionCount += 1;
          
          return acc;
        }, {});
        
        // Calculate average transaction value
        Object.values(byMonth).forEach(month => {
          month.averageValue = month.revenue / month.transactionCount;
        });
        
        revenueByTime = Object.values(byMonth);
      }
      
      // Sort by date
      revenueByTime.sort((a, b) => {
        const dateA = a.date || a.weekStart || a.month;
        const dateB = b.date || b.weekStart || b.month;
        return dateA.localeCompare(dateB);
      });
      
      // Convert amounts from cents to decimal
      revenueByTime = revenueByTime.map(item => ({
        ...item,
        revenue: item.revenue / 100, // Convert to decimal
        averageValue: item.averageValue / 100 // Convert to decimal
      }));
      
      // Find product revenue if transaction items exist
      let productRevenue = [];
      
      // Get all transaction items for completed transactions
      const transactionIds = filteredTransactions.map(t => t.transactionId);
      let allItems = [];
      
      try {
        // This could be improved with a bulk fetch method, but for now we'll do it one by one
        for (const txId of transactionIds) {
          const items = await storage.getTransactionItems(txId);
          allItems = [...allItems, ...items];
        }
      } catch (err) {
        console.log("Could not fetch transaction items, continuing with time-based revenue only:", err);
        // Continue with the response, just without product revenue
      }
      
      if (allItems.length > 0) {
        // Group by product description
        const byProduct = allItems.reduce((acc, item) => {
          const description = item.description;
          
          if (!acc[description]) {
            acc[description] = {
              description,
              quantity: 0,
              revenue: 0
            };
          }
          
          acc[description].quantity += item.quantity;
          acc[description].revenue += item.amount;
          
          return acc;
        }, {});
        
        productRevenue = Object.values(byProduct);
        
        // Sort by revenue (highest first)
        productRevenue.sort((a, b) => b.revenue - a.revenue);
        
        // Convert amounts from cents to decimal
        productRevenue = productRevenue.map(item => ({
          ...item,
          revenue: item.revenue / 100 // Convert to decimal
        }));
      }
      
      res.json({ 
        timeBasedRevenue: revenueByTime,
        productRevenue
      });
    } catch (error) {
      console.error("Error generating revenue report:", error);
      // Return empty arrays instead of 500 error
      res.json({ 
        timeBasedRevenue: [],
        productRevenue: []
      });
    }
  });

  // Documentation routes - Add before server creation
  app.get('/CHROMEBOOK_DEPLOYMENT.md', (req, res) => {
    const path = require('path');
    const fs = require('fs');
    const filePath = path.resolve('.', 'CHROMEBOOK_DEPLOYMENT.md');
    
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'text/markdown');
      res.sendFile(filePath);
    } else {
      res.status(404).send('Documentation file not found');
    }
  });
  
  // Add route for technical NFC guide
  app.get('/docs/CHROMEBOOK_NFC_GUIDE.md', (req, res) => {
    const path = require('path');
    const fs = require('fs');
    const filePath = path.resolve('.', 'docs', 'CHROMEBOOK_NFC_GUIDE.md');
    
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'text/markdown');
      res.sendFile(filePath);
    } else {
      res.status(404).send('Documentation file not found');
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
