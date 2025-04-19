CREATE TABLE "cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"card_id" text NOT NULL,
	"customer_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"customer_name" text,
	"wallet_type" text,
	CONSTRAINT "cards_card_id_unique" UNIQUE("card_id")
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"email" text,
	"phone" text,
	"balance" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"default_wallet_type" text DEFAULT 'default' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_id" text NOT NULL,
	"amount" integer NOT NULL,
	"description" text,
	"card_id" text NOT NULL,
	"customer_name" text NOT NULL,
	"wallet_type" text,
	"status" text NOT NULL,
	"error_message" text,
	"response_data" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_transaction_id_unique" UNIQUE("transaction_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;