import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date into a readable string
 * @param date The date to format
 * @returns Formatted date string (e.g. "Jan 1, 2023 12:00 PM")
 */
export function formatDate(date: Date): string {
  return format(date, "MMM d, yyyy h:mm a")
}

/**
 * Format a number as currency (PHP)
 * @param amount The amount to format
 * @returns Formatted currency string (e.g. "₱1,000.00")
 */
export function formatCurrency(amount: number): string {
  // Handle the case where amounts might be stored in cents (e.g. 38500 = 385.00)
  const normalizedAmount = amount >= 1000 && amount % 100 === 0 ? amount / 100 : amount;
  
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(normalizedAmount)
}

/**
 * Check if the app is running in WebView mode
 * This consolidates all WebView detection methods into a single function
 * @returns Boolean indicating whether app is in WebView mode
 */
export function isInWebViewMode(): boolean {
  // Check for URL parameter to force WebView mode for testing
  const urlParams = new URLSearchParams(window.location.search);
  const forceWebViewMode = urlParams.has('webview');
  
  // Import functions dynamically to avoid circular dependencies
  const { isReplitWebView } = require('./browserDetect');
  
  // Return true if either the detection or URL parameter indicates WebView
  return isReplitWebView() || forceWebViewMode;
}
