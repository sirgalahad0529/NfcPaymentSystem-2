import { Card, CardContent } from "@/components/ui/card";

export function PaymentProcessing() {
  return (
    <div className="p-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 className="font-semibold text-lg text-center mb-2">Processing Payment</h2>
            <p className="text-muted-foreground text-center">Please wait while we process your transaction...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
