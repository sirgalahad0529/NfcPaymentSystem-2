import { pgTable, text, serial, integer, boolean, timestamp, json, primaryKey, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Customer schema - for customer onboarding
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  phone: text("phone"),
  balance: integer("balance").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  defaultWalletType: text("default_wallet_type").default("default").notNull(),
});

export const insertCustomerSchema = createInsertSchema(customers).pick({
  name: true,
  firstName: true,
  lastName: true, 
  email: true,
  phone: true,
  balance: true,
  active: true,
  defaultWalletType: true,
});

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

// Card schema - updated to reference customers
export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  cardId: text("card_id").notNull().unique(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  customerName: text("customer_name"),
  walletType: text("wallet_type"),
});

export const insertCardSchema = createInsertSchema(cards).pick({
  cardId: true,
  customerId: true,
  customerName: true,
  walletType: true,
});

export type InsertCard = z.infer<typeof insertCardSchema>;
export type Card = typeof cards.$inferSelect;

// Transaction schema - updated to reference customers
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(),
  amount: integer("amount").notNull(), // stored in cents - total amount of all items
  description: text("description"),
  cardId: text("card_id").notNull(),
  customerName: text("customer_name").notNull(),
  walletType: text("wallet_type"),
  status: text("status").notNull(), // "completed", "failed", "pending"
  errorMessage: text("error_message"),
  responseData: json("response_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Transaction items (line items) for invoice-like functionality
export const transactionItems = pgTable("transaction_items", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().references(() => transactions.transactionId),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: integer("unit_price").notNull(), // stored in cents
  amount: integer("amount").notNull(), // stored in cents (quantity * unitPrice)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  transactionId: true,
  amount: true,
  description: true,
  cardId: true,
  customerName: true,
  walletType: true,
  status: true,
  errorMessage: true,
  responseData: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export const insertTransactionItemSchema = createInsertSchema(transactionItems).pick({
  transactionId: true,
  description: true,
  quantity: true,
  unitPrice: true,
  amount: true,
});

export type InsertTransactionItem = z.infer<typeof insertTransactionItemSchema>;
export type TransactionItem = typeof transactionItems.$inferSelect;

// Line item schema for payment requests
export const paymentLineItemSchema = z.object({
  id: z.number().optional(), // Optional ID for client-side tracking
  description: z.string().min(1, "Description is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer").default(1),
  unitPrice: z.number().positive("Unit price must be greater than 0"),
  amount: z.number().positive("Amount must be greater than 0"),
});

export type PaymentLineItem = z.infer<typeof paymentLineItemSchema>;

// For client requests
export const paymentRequestSchema = z.object({
  cardId: z.string().min(1, "Card ID is required"),
  customerId: z.number().optional(),
  customerName: z.string().optional(),
  // Total amount is still required for validation, but will be calculated from line items
  amount: z.number().positive("Amount must be greater than 0"),
  // Overall transaction description (optional)
  description: z.string().optional(),
  // Line items for the invoice - allow empty array for backward compatibility
  items: z.array(paymentLineItemSchema).optional(),
});

export type PaymentRequest = z.infer<typeof paymentRequestSchema>;

// Updated to require card ID only
export const scanResultSchema = z.object({
  cardId: z.string().min(1, "Card ID is required"),
});

export type ScanResult = z.infer<typeof scanResultSchema>;

// Customer registration schema
export const customerRegistrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  initialBalance: z.number()
    .min(500, "Initial balance must be at least 500 pesos")
    .nonnegative("Initial balance cannot be negative")
    .default(500),
  cardId: z.string().min(1, "Card ID is required"),
});

export type CustomerRegistration = z.infer<typeof customerRegistrationSchema>;
