import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Nfc, SquareMousePointer, Edit, Check, ArrowLeft, Smartphone, Info } from "lucide-react";
import { useNFC } from "@/hooks/useNFC";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useWebView } from "@/contexts/WebViewContext";

interface ScanResult {
  cardId: string;
}

interface NFCScannerProps {
  onScanComplete: (scanData: any) => void;
  onBack?: () => void;
}

export function NFCScanner({ onScanComplete, onBack }: NFCScannerProps) {
  // Core state first
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCardId, setManualCardId] = useState("");
  const [isEnvMessage, setIsEnvMessage] = useState<string | null>(null);
  
  // Get WebView state from context
  const { isWebView, setWebViewMode } = useWebView();
  
  // After regular state hooks, use other hooks
  const { scanning, scanResult, error, startScan, cancelScan, nfcAvailable, isMobile, isInReplitWebView } = useNFC();
  
  // Check for webview parameters in URL
  useEffect(() => {
    const hasWebViewParam = window.location.search.includes('webview');
    if (hasWebViewParam && !isWebView) {
      setWebViewMode(true);
    }
  }, [isWebView, setWebViewMode]);
  
  // Check environment (WebView detection)
  useEffect(() => {
    // If either WebView detection is true, show manual input
    if (isInReplitWebView || isWebView) {
      setIsEnvMessage(isWebView ? "WebView mode active. Using manual input for card ID." : "Replit App detected. Please use manual input for card ID.");
      setShowManualInput(true);
    }
    
    console.log("Environment check - NFC available:", nfcAvailable, "In Replit WebView:", isWebView);
    console.log("Environment info:", {
      userAgent: navigator.userAgent.toLowerCase(),
      isInReplitWebView,
      nfcAvailable
    });
  }, [isInReplitWebView, nfcAvailable, isWebView]);

  // Handle scan result
  useEffect(() => {
    if (scanResult) {
      onScanComplete(scanResult);
    }
  }, [scanResult, onScanComplete]);

  const handleManualSubmit = () => {
    if (manualCardId.trim()) {
      // Format and cleanup the manually entered UID
      let formattedCardId = manualCardId.trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      
      // Ensure the "CARD-" prefix is present
      if (!formattedCardId.startsWith("CARD-")) {
        formattedCardId = "CARD-" + formattedCardId;
      }
      
      console.log(`Manual scan from NFCScanner: "${manualCardId}" normalized to "${formattedCardId}"`);
      
      // Create scan result with the manually entered card ID
      const manualScanResult: ScanResult = {
        cardId: formattedCardId
      };
      
      onScanComplete(manualScanResult);
    }
  };

  return (
    <div className="p-4">
      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold text-lg text-center mb-6">Scan NFC Card</h2>
          
          {onBack && (
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </div>
          )}
          
          {/* Mobile NFC available alert */}
          {isMobile && nfcAvailable && (
            <Alert className="mb-4 bg-blue-50">
              <Smartphone className="h-4 w-4" />
              <AlertTitle>NFC Available</AlertTitle>
              <AlertDescription>
                Your device supports NFC. Place an NFC card near the back of your phone when scanning.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Mobile but no NFC alert */}
          {isMobile && !nfcAvailable && (
            <Alert className="mb-4 bg-amber-50">
              <Info className="h-4 w-4" />
              <AlertTitle>NFC Not Detected</AlertTitle>
              <AlertDescription>
                NFC is not available on this device or browser. We'll use simulated scanning instead.
              </AlertDescription>
            </Alert>
          )}
          
          {/* WebView environment message */}
          {isEnvMessage && (
            <Alert className="mb-4 bg-yellow-50">
              <Info className="h-4 w-4" />
              <AlertTitle>App Environment</AlertTitle>
              <AlertDescription>
                {isEnvMessage}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col items-center">
            {!showManualInput ? (
              <>
                <div className="relative w-56 h-56 flex items-center justify-center mb-6">
                  {/* Scanner animation rings */}
                  {scanning && (
                    <div className="absolute w-full h-full rounded-full border-4 border-primary-light opacity-20 animate-ping"></div>
                  )}
                  <div className="absolute w-5/6 h-5/6 rounded-full border-4 border-primary opacity-30"></div>
                  <div className="absolute w-2/3 h-2/3 rounded-full border-4 border-primary opacity-50"></div>
                  
                  {/* NFC icon */}
                  <div className="bg-primary rounded-full p-4 z-10">
                    <Nfc className="text-white h-12 w-12" />
                  </div>
                </div>
                
                {/* Status text */}
                <p className="text-muted-foreground text-center mb-2">
                  {error 
                    ? error 
                    : scanning 
                      ? isMobile && nfcAvailable 
                        ? "Hold an NFC card to the back of your phone..." 
                        : "Scanning for NFC card..." 
                      : scanResult 
                        ? `Card ID: ${scanResult.cardId} read successfully!` 
                        : "Ready to scan NFC card"
                  }
                </p>
                
                {/* Info text about card usage */}
                <p className="text-xs text-muted-foreground text-center mb-6">
                  The NFC card's unique ID will be used as the customer identifier for all transactions
                </p>
                
                {/* Action button */}
                <Button 
                  className="px-8 py-6 mb-3" 
                  onClick={() => {
                    if (scanning) {
                      try {
                        console.log("User canceled scan");
                        cancelScan();
                      } catch (e) {
                        console.error("Error canceling scan:", e);
                      }
                    } else {
                      try {
                        console.log("Starting new scan");
                        startScan();
                      } catch (e) {
                        console.error("Error starting scan:", e);
                      }
                    }
                  }}
                  disabled={Boolean(scanResult)}
                >
                  <SquareMousePointer className="mr-2 h-5 w-5" />
                  {scanning ? "Cancel Scan" : "Start NFC Scan"}
                </Button>
                
                {/* Manual input option */}
                <Button 
                  variant="outline" 
                  onClick={() => setShowManualInput(true)}
                  disabled={Boolean(scanResult) || scanning}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Enter Card ID Manually
                </Button>
              </>
            ) : (
              <div className="w-full space-y-4">
                <p className="text-sm text-center text-muted-foreground mb-4">
                  Enter the card's UID with or without colon separators<br/>(e.g., 85:DE:7C:33 or 85DE7C33)
                </p>
                
                <Input
                  placeholder="Card UID (e.g. 85:DE:7C:33 or 85DE7C33)"
                  value={manualCardId}
                  onChange={(e) => setManualCardId(e.target.value)}
                  className="text-center"
                />
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowManualInput(false)}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    className="flex-1"
                    onClick={handleManualSubmit}
                    disabled={!manualCardId.trim()}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Submit
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
