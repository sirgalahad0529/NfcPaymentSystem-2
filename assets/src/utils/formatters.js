/**
 * Format a number as currency (PHP)
 * @param {number} amount The amount to format
 * @returns {string} Formatted currency string (e.g. "₱1,000.00")
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Format a date into a readable string
 * @param {string|Date} date The date to format
 * @returns {string} Formatted date string (e.g. "Jan 1, 2023 12:00 PM")
 */
export function formatDate(date) {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return dateObj.toLocaleDateString('en-US', options);
}

/**
 * Normalize card ID to ensure consistent format
 * @param {string} cardId The raw card ID
 * @returns {string} Normalized card ID
 */
export function normalizeCardId(cardId) {
  if (!cardId) return '';
  
  // Remove any non-alphanumeric characters (like colons)
  let normalized = cardId.replace(/[^a-zA-Z0-9]/g, '');
  
  // Convert to uppercase
  normalized = normalized.toUpperCase();
  
  // Add the CARD- prefix if not already present
  if (!normalized.startsWith('CARD-')) {
    normalized = `CARD-${normalized}`;
  }
  
  return normalized;
}

/**
 * Truncate text with ellipsis if it exceeds the specified length
 * @param {string} text The text to truncate
 * @param {number} maxLength Maximum length before truncation
 * @returns {string} Truncated text with ellipsis
 */
export function truncateText(text, maxLength = 30) {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength) + '...';
}