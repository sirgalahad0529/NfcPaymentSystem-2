import { users, type User, type InsertUser } from "@shared/schema";
import { cards, type Card, type InsertCard } from "@shared/schema";
import { transactions, type Transaction, type InsertTransaction } from "@shared/schema";
import { transactionItems, type TransactionItem, type InsertTransactionItem } from "@shared/schema";
import { customers, type Customer, type InsertCustomer } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Customer methods
  getCustomer(id: number): Promise<Customer | undefined>;
  getAllCustomers(): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  getCustomerByCardId(cardId: string): Promise<Customer | undefined>;
  
  // Card methods
  getCard(id: number): Promise<Card | undefined>;
  getCardByCardId(cardId: string): Promise<Card | undefined>;
  createCard(card: InsertCard): Promise<Card>;
  getCardsByCustomerId(customerId: number): Promise<Card[]>;
  updateCard(id: number, card: Partial<InsertCard>): Promise<Card | undefined>;
  
  // Transaction methods
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionByTransactionId(transactionId: string): Promise<Transaction | undefined>;
  getAllTransactions(): Promise<Transaction[]>;
  getTransactionsByCardId(cardId: string): Promise<Transaction[]>;
  getTransactionsByCustomerId(customerId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Transaction Item methods
  getTransactionItems(transactionId: string): Promise<TransactionItem[]>;
  createTransactionItem(item: InsertTransactionItem): Promise<TransactionItem>;
  createTransactionWithItems(transaction: InsertTransaction, items: InsertTransactionItem[]): Promise<Transaction>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // Customer methods
  async getCustomer(id: number): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.id, id));
    return result[0];
  }
  
  async getAllCustomers(): Promise<Customer[]> {
    return db.select().from(customers).orderBy(customers.name);
  }
  
  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const result = await db.insert(customers).values(insertCustomer).returning();
    return result[0];
  }
  
  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const result = await db
      .update(customers)
      .set(customer)
      .where(eq(customers.id, id))
      .returning();
    return result[0];
  }
  
  async getCustomerByCardId(cardId: string): Promise<Customer | undefined> {
    if (!cardId) return undefined;
    
    // Function to normalize card IDs for comparison
    const normalizeForComparison = (id: string): string => {
      // Remove all non-alphanumeric characters and convert to uppercase
      return id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    };
    
    // Handle the CARD- prefix consistently
    const normalizeWithPrefix = (id: string): string => {
      // First, strip any non-alphanumeric characters and convert to uppercase
      const alphaNum = id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      
      // Check if it already has a "CARD" prefix
      if (alphaNum.startsWith('CARD')) {
        // If it has CARD but no hyphen, add the hyphen
        if (!id.includes('-') && id.toUpperCase().startsWith('CARD')) {
          return 'CARD-' + alphaNum.substring(4);
        }
        return id.toUpperCase(); // Return with original format but uppercase
      } else {
        // Add the CARD- prefix if not present
        return 'CARD-' + alphaNum;
      }
    };
    
    // Both normalized versions for flexible matching
    const normalizedCardId = normalizeForComparison(cardId);
    const prefixedCardId = normalizeWithPrefix(cardId);
    
    console.log(`Looking up customer with cardId: "${cardId}", normalized: "${normalizedCardId}", prefixed: "${prefixedCardId}"`);
    
    // Get all cards first - there shouldn't be many
    const allCards = await db.select().from(cards);
    
    // Try to find card with different matching strategies
    let matchingCard = allCards.find(card => {
      // 1. Exact match (case-insensitive)
      if (card.cardId.toUpperCase() === cardId.toUpperCase()) {
        return true;
      }
      
      // 2. Match with normalized prefix handling
      if (normalizeWithPrefix(card.cardId) === prefixedCardId) {
        return true;
      }
      
      // 3. Match with fully normalized comparison (no prefix)
      if (normalizeForComparison(card.cardId) === normalizedCardId) {
        return true;
      }
      
      // 4. Special case: if the raw input exactly matches the ID without CARD- prefix
      if (card.cardId.startsWith('CARD-') && 
          card.cardId.substring(5).toUpperCase() === normalizedCardId) {
        return true;
      }
      
      return false;
    });
    
    if (!matchingCard) {
      console.log('No matching card found with this ID');
      return undefined;
    }
    
    console.log(`Found matching card: ${JSON.stringify(matchingCard)}`);
    
    // Get the customer for this card
    const result = await db
      .select()
      .from(customers)
      .where(eq(customers.id, matchingCard.customerId));
    
    return result[0];
  }
  
  // Card methods
  async getCard(id: number): Promise<Card | undefined> {
    const result = await db.select().from(cards).where(eq(cards.id, id));
    return result[0];
  }
  
  async getCardByCardId(cardId: string): Promise<Card | undefined> {
    if (!cardId) return undefined;
    
    // Function to normalize card IDs for comparison
    const normalizeForComparison = (id: string): string => {
      // Remove all non-alphanumeric characters and convert to uppercase
      return id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    };
    
    // Handle the CARD- prefix consistently
    const normalizeWithPrefix = (id: string): string => {
      // First, strip any non-alphanumeric characters and convert to uppercase
      const alphaNum = id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      
      // Check if it already has a "CARD" prefix
      if (alphaNum.startsWith('CARD')) {
        // If it has CARD but no hyphen, add the hyphen
        if (!id.includes('-') && id.toUpperCase().startsWith('CARD')) {
          return 'CARD-' + alphaNum.substring(4);
        }
        return id.toUpperCase(); // Return with original format but uppercase
      } else {
        // Add the CARD- prefix if not present
        return 'CARD-' + alphaNum;
      }
    };
    
    // Both normalized versions for flexible matching
    const normalizedCardId = normalizeForComparison(cardId);
    const prefixedCardId = normalizeWithPrefix(cardId);
    
    console.log(`Looking up card with cardId: "${cardId}", normalized: "${normalizedCardId}", prefixed: "${prefixedCardId}"`);
    
    // Get all cards - there shouldn't be many in a typical installation
    const allCards = await db.select().from(cards);
    
    // Try to find card with different matching strategies
    let matchingCard = allCards.find(card => {
      // 1. Exact match (case-insensitive)
      if (card.cardId.toUpperCase() === cardId.toUpperCase()) {
        return true;
      }
      
      // 2. Match with normalized prefix handling
      if (normalizeWithPrefix(card.cardId) === prefixedCardId) {
        return true;
      }
      
      // 3. Match with fully normalized comparison (no prefix)
      if (normalizeForComparison(card.cardId) === normalizedCardId) {
        return true;
      }
      
      // 4. Special case: if the raw input exactly matches the ID without CARD- prefix
      if (card.cardId.startsWith('CARD-') && 
          card.cardId.substring(5).toUpperCase() === normalizedCardId) {
        return true;
      }
      
      return false;
    });
    
    if (matchingCard) {
      console.log(`Found matching card with ID "${matchingCard.cardId}" for search term "${cardId}"`);
    } else {
      console.log(`No matching card found for "${cardId}" (normalized: "${normalizedCardId}")`);
    }
    
    return matchingCard;
  }
  
  async createCard(insertCard: InsertCard): Promise<Card> {
    const result = await db.insert(cards).values(insertCard).returning();
    return result[0];
  }
  
  async getCardsByCustomerId(customerId: number): Promise<Card[]> {
    return db
      .select()
      .from(cards)
      .where(eq(cards.customerId, customerId))
      .orderBy(desc(cards.createdAt));
  }
  
  async updateCard(id: number, card: Partial<InsertCard>): Promise<Card | undefined> {
    const result = await db
      .update(cards)
      .set(card)
      .where(eq(cards.id, id))
      .returning();
    return result[0];
  }
  
  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const result = await db.select().from(transactions).where(eq(transactions.id, id));
    return result[0];
  }
  
  async getTransactionByTransactionId(transactionId: string): Promise<Transaction | undefined> {
    const result = await db.select().from(transactions).where(eq(transactions.transactionId, transactionId));
    return result[0];
  }
  
  async getAllTransactions(): Promise<Transaction[]> {
    return db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }
  
  async getTransactionsByCardId(cardId: string): Promise<Transaction[]> {
    if (!cardId) return [];
    
    // Function to normalize card IDs for comparison
    const normalizeForComparison = (id: string): string => {
      // Remove all non-alphanumeric characters and convert to uppercase
      return id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    };
    
    // Handle the CARD- prefix consistently
    const normalizeWithPrefix = (id: string): string => {
      // First, strip any non-alphanumeric characters and convert to uppercase
      const alphaNum = id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      
      // Check if it already has a "CARD" prefix
      if (alphaNum.startsWith('CARD')) {
        // If it has CARD but no hyphen, add the hyphen
        if (!id.includes('-') && id.toUpperCase().startsWith('CARD')) {
          return 'CARD-' + alphaNum.substring(4);
        }
        return id.toUpperCase(); // Return with original format but uppercase
      } else {
        // Add the CARD- prefix if not present
        return 'CARD-' + alphaNum;
      }
    };
    
    // Both normalized versions for flexible matching
    const normalizedCardId = normalizeForComparison(cardId);
    const prefixedCardId = normalizeWithPrefix(cardId);
    
    console.log(`Looking for transactions with cardId: "${cardId}", normalized: "${normalizedCardId}", prefixed: "${prefixedCardId}"`);
    
    // Get all transactions
    const allTransactions = await db.select().from(transactions);
    
    // Filter transactions using the same multi-stage approach as getCardByCardId
    const matchingTransactions = allTransactions.filter(transaction => {
      // 1. Exact match (case-insensitive)
      if (transaction.cardId.toUpperCase() === cardId.toUpperCase()) {
        return true;
      }
      
      // 2. Match with normalized prefix handling
      if (normalizeWithPrefix(transaction.cardId) === prefixedCardId) {
        return true;
      }
      
      // 3. Match with fully normalized comparison (no prefix)
      if (normalizeForComparison(transaction.cardId) === normalizedCardId) {
        return true;
      }
      
      // 4. Special case: if the raw input exactly matches the ID without CARD- prefix
      if (transaction.cardId.startsWith('CARD-') && 
          transaction.cardId.substring(5).toUpperCase() === normalizedCardId) {
        return true;
      }
      
      return false;
    });
    
    console.log(`Found ${matchingTransactions.length} transactions for card ID "${cardId}"`);
    
    // Sort by created date descending
    return matchingTransactions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  async getTransactionsByCustomerId(customerId: number): Promise<Transaction[]> {
    // Since customerId is not directly in transactions table
    // Get all cards for this customer
    const customerCards = await this.getCardsByCustomerId(customerId);
    if (!customerCards.length) return [];
    
    // Get card IDs
    const cardIds = customerCards.map(card => card.cardId);
    
    // Get transactions for all these cards
    // Note: Using SQL in() operator since we can't directly join
    return db
      .select()
      .from(transactions)
      .where(sql`${transactions.cardId} IN (${cardIds.join(',')})`)
      .orderBy(desc(transactions.createdAt));
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(insertTransaction).returning();
    return result[0];
  }

  // Transaction Item methods
  async getTransactionItems(transactionId: string): Promise<TransactionItem[]> {
    return db
      .select()
      .from(transactionItems)
      .where(eq(transactionItems.transactionId, transactionId))
      .orderBy(transactionItems.id);
  }

  async createTransactionItem(item: InsertTransactionItem): Promise<TransactionItem> {
    const result = await db.insert(transactionItems).values(item).returning();
    return result[0];
  }

  async createTransactionWithItems(
    transaction: InsertTransaction, 
    items: InsertTransactionItem[]
  ): Promise<Transaction> {
    // Use a transaction (no pun intended) to ensure both the transaction and its items are saved atomically
    return await db.transaction(async (tx) => {
      // Create the transaction first
      const [createdTransaction] = await tx
        .insert(transactions)
        .values(transaction)
        .returning();
      
      // Now create all items with the transaction ID
      const itemsWithTransactionId = items.map(item => ({
        ...item,
        transactionId: createdTransaction.transactionId
      }));
      
      if (itemsWithTransactionId.length > 0) {
        await tx.insert(transactionItems).values(itemsWithTransactionId);
      }
      
      return createdTransaction;
    });
  }
}

export const storage = new DatabaseStorage();
