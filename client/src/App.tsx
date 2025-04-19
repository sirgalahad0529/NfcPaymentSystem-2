import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { WebViewProvider } from "@/contexts/WebViewContext";
import { NFCProvider } from "@/contexts/NFCContext";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import BasicPayment from "@/pages/BasicPayment";
import InvoicePayment from "@/pages/InvoicePayment";
import NFCScan from "@/pages/NFCScan";
import ChromebookDocs from "@/pages/ChromebookDocs";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/basic-payment" component={BasicPayment} />
      <Route path="/basic-payment/:cardId" component={BasicPayment} />
      <Route path="/invoice-payment/:cardId" component={InvoicePayment} />
      <Route path="/nfc-scan" component={NFCScan} />
      <Route path="/docs/chromebook" component={ChromebookDocs} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WebViewProvider>
        <NFCProvider>
          <Router />
          <Toaster />
        </NFCProvider>
      </WebViewProvider>
    </QueryClientProvider>
  );
}

export default App;
