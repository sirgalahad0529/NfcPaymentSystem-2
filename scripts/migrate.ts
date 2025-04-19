import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { sql } from 'drizzle-orm';
import * as schema from '../shared/schema';

const { Client } = pg;

// Run migrations in non-interactive mode
async function runMigration() {
  console.log('Creating database tables...');
  
  try {
    // Connect directly to PostgreSQL
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('- Created users table');
    
    // Create customers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        first_name TEXT,
        last_name TEXT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        default_wallet_type TEXT NOT NULL,
        balance INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('- Created customers table');
    
    // Create cards table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cards (
        id SERIAL PRIMARY KEY,
        card_id TEXT NOT NULL UNIQUE,
        customer_id INTEGER NOT NULL,
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('- Created cards table');
    
    // Create transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        transaction_id TEXT NOT NULL UNIQUE,
        amount INTEGER NOT NULL,
        description TEXT,
        card_id TEXT NOT NULL,
        customer_id INTEGER NOT NULL,
        customer_name TEXT NOT NULL,
        wallet_type TEXT NOT NULL,
        status TEXT NOT NULL,
        error_message TEXT,
        response_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('- Created transactions table');
    
    console.log('Database migration completed successfully!');
    
    await client.end();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();