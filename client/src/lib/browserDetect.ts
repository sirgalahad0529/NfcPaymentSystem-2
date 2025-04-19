/**
 * Browser and environment detection utilities
 */

/**
 * Detect if the current browser is Chrome
 */
export function isChrome(): boolean {
  return navigator.userAgent.toLowerCase().includes('chrome');
}

/**
 * Detect if the browser is Chrome on Android
 */
export function isChromeOnAndroid(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return (ua.includes('chrome') && ua.includes('android'));
}

/**
 * Detect if the browser is Firefox
 */
export function isFirefox(): boolean {
  return navigator.userAgent.toLowerCase().includes('firefox');
}

/**
 * Detect if we're running in a WebView
 */
export function isWebView(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  
  // Check for generic WebView indicators but exclude Chrome browser on Android
  return (ua.includes('webview') || ua.includes('wv')) && 
         !(ua.includes('chrome') && !ua.includes('wv'));
}

/**
 * Detect if we're running in the Replit WebView specifically
 * 
 * The detection is enhanced to also check for URL parameters that indicate we're in the WebView,
 * as the user agent string may not always be reliable.
 */
export function isReplitWebView(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  
  // For more reliable detection in Replit environment, we'll check multiple indicators:
  // 1. Check for Replit's WebView user agent indicators (replit-bonsai and/or wv)
  // 2. Check for URL parameters that may indicate we're in a WebView context
  // 3. Check for any WebView indicators in the user agent
  
  // Check URL for indicators
  const urlParams = new URLSearchParams(window.location.search);
  const inEmbeddedMode = urlParams.has('embedded') || urlParams.has('webview') || urlParams.has('fromApp');
  
  // Check user agent for Replit or WebView indicators
  const hasReplitIndicator = ua.includes('replit') || ua.includes('bonsai');
  const hasWebViewIndicator = ua.includes('wv') || ua.includes('webview');
  
  // Environment-specific check for local testing
  if (window.location.hostname === 'localhost' && inEmbeddedMode) {
    return true;
  }
  
  // Always consider it a WebView if the URL parameter is present
  if (inEmbeddedMode) {
    return true;
  }
  
  // If testing specifically in Replit environment, consider it a WebView
  if (window.location.hostname.includes('replit')) {
    // Enhanced detection - either explicit indicators or combination of factors
    return hasReplitIndicator || hasWebViewIndicator || inEmbeddedMode;
  }
  
  // In production, require stronger indicators
  return hasWebViewIndicator || (hasReplitIndicator && inEmbeddedMode);
}

/**
 * Get the current browser environment
 */
export function getBrowserEnvironment(): {
  isChrome: boolean;
  isFirefox: boolean;
  isChromeOnAndroid: boolean;
  isWebView: boolean;
  isReplitWebView: boolean;
} {
  return {
    isChrome: isChrome(),
    isFirefox: isFirefox(),
    isChromeOnAndroid: isChromeOnAndroid(),
    isWebView: isWebView(),
    isReplitWebView: isReplitWebView()
  };
}