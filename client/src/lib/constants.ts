export const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export const APP_STATES = {
  READY: "ready",
  SCANNING: "scanning",
  SCAN_COMPLETE: "scan_complete",
  LOOKING_UP_CUSTOMER: "looking_up_customer",
  CUSTOMER_FOUND: "customer_found",
  CUSTOMER_NOT_FOUND: "customer_not_found",
  REGISTERING_CUSTOMER: "registering_customer",
  PROCESSING_PAYMENT: "processing_payment",
  PAYMENT_COMPLETE: "payment_complete",
  MANUAL_REGISTRATION: "manual_registration",
  MANAGE_CUSTOMERS: "manage_customers",
  CHECK_BALANCE: "check_balance",
  RELOAD_ACCOUNT: "reload_account",
  SCANNING_FOR_BALANCE: "scanning_for_balance",
  SCANNING_FOR_RELOAD: "scanning_for_reload",
  SCANNING_FOR_PAYMENT: "scanning_for_payment",
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
export type AppState = (typeof APP_STATES)[keyof typeof APP_STATES];
