import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNFC as useOriginalNFC } from '@/hooks/useNFC';
import { useWebView } from './WebViewContext';

// Define proper type for context
type NFCContextType = {
  externalReaderConnected: boolean;
  externalReaderName: string | null;
};

// Create context with initial default values
export const NFCContext = createContext<NFCContextType>({
  externalReaderConnected: false,
  externalReaderName: null
});

// We'll continue to use the original hook directly where needed
// instead of re-exporting it here to avoid circular dependencies
// export const useNFC = useOriginalNFC;

// NFC Provider component - a compatibility wrapper for the future
// implementation of external NFC readers
export function NFCProvider({ children }: { children: ReactNode }) {
  // Basic state for external readers
  const [externalReaderConnected, setExternalReaderConnected] = useState(false);
  const [externalReaderName, setExternalReaderName] = useState<string | null>(null);
  
  // We'll implement external reader detection later

  return (
    <NFCContext.Provider value={{
      externalReaderConnected,
      externalReaderName
    }}>
      {children}
    </NFCContext.Provider>
  );
}