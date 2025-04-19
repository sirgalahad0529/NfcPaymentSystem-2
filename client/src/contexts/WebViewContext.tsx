import React, { createContext, useContext, useState, useEffect } from "react";

interface WebViewContextType {
  isWebView: boolean;
  setWebViewMode: (value: boolean) => void;
}

// Create a context with default values
const WebViewContext = createContext<WebViewContextType>({ 
  isWebView: false,
  setWebViewMode: () => {} 
});

export const useWebView = () => {
  const context = useContext(WebViewContext);
  
  // Add debug logging when the hook is used
  console.log("useWebView hook called, returning isWebView:", context.isWebView);
  
  // Return context
  return context;
};

// Initialize WebView detection once at startup and save to localStorage
const detectWebViewFromUrl = (): boolean => {
  // Check URL parameters
  const isWebViewParam = window.location.search.includes('webview');
  
  // Check if we have a saved value in localStorage
  const savedWebViewMode = localStorage.getItem('isWebViewMode');
  
  // Check for Replit Android app
  const userAgent = navigator.userAgent.toLowerCase();
  const isReplitAndroidApp = userAgent.includes('replit-bonsai') || 
                            (userAgent.includes('android') && userAgent.includes('wv'));
  
  // Log detection results for debugging
  console.log("WebView Detection:", {
    isWebViewParam,
    isReplitAndroidApp,
    userAgent
  });
  
  // If it's the Replit Android app or URL has the parameter, save to localStorage
  if (isWebViewParam || isReplitAndroidApp) {
    localStorage.setItem('isWebViewMode', 'true');
    return true;
  }
  
  // If we have a saved value, use it
  if (savedWebViewMode === 'true') {
    return true;
  }
  
  return false;
};

export const WebViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with detection
  const [isWebView, setIsWebView] = useState<boolean>(detectWebViewFromUrl());

  // Function to set WebView mode and persist it
  const setWebViewMode = (value: boolean) => {
    setIsWebView(value);
    localStorage.setItem('isWebViewMode', value ? 'true' : 'false');
    
    // For debugging
    console.log("WebView mode manually set to:", value);
  };

  useEffect(() => {
    // Check for WebView environments on mount and URL changes
    const checkWebViewEnvironment = () => {
      const isWebViewParam = window.location.search.includes('webview');
      const userAgent = navigator.userAgent.toLowerCase();
      const isReplitAndroidApp = userAgent.includes('replit-bonsai') || 
                              (userAgent.includes('android') && userAgent.includes('wv'));
      
      // If we're in a WebView environment but state doesn't reflect it
      if ((isWebViewParam || isReplitAndroidApp) && !isWebView) {
        setIsWebView(true);
        localStorage.setItem('isWebViewMode', 'true');
        console.log("WebView environment detected:", { 
          isWebViewParam, 
          isReplitAndroidApp,
          userAgent
        });
      }
    };
    
    // Check on mount
    checkWebViewEnvironment();
    
    // Log current state
    console.log("WebViewContext initialized - WebView Mode:", isWebView);
    console.log("URL search params:", window.location.search);
    
    // Add listeners for URL changes
    const handleUrlChange = () => {
      checkWebViewEnvironment();
    };
    
    window.addEventListener('popstate', handleUrlChange);
    
    // Add a custom event listener for history API
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function() {
      // @ts-ignore
      const result = originalPushState.apply(this, arguments);
      handleUrlChange();
      return result;
    };
    
    window.history.replaceState = function() {
      // @ts-ignore
      const result = originalReplaceState.apply(this, arguments);
      handleUrlChange();
      return result;
    };
    
    // Make WebView state available globally for debugging
    (window as any)._appData = (window as any)._appData || {};
    (window as any)._appData.isWebView = isWebView;
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [isWebView]);

  return (
    <WebViewContext.Provider value={{ isWebView, setWebViewMode }}>
      {children}
    </WebViewContext.Provider>
  );
};