import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HandMetal, Edit, CreditCard, User, Mail, Phone, Plus, Trash, Receipt } from "lucide-react";
import { ScanResult } from "@shared/schema";
import { PaymentFormData, AppSettings, PaymentLineItem } from "@/types";

interface PaymentDetailsProps {
  scanResult: ScanResult;
  customer: any; // Customer data returned from API
  onProcessPayment: (paymentData: PaymentFormData) => void;
  settings: AppSettings;
}

export function PaymentDetails({ scanResult, customer, onProcessPayment, settings }: PaymentDetailsProps) {
  const [lineItems, setLineItems] = useState<PaymentLineItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  
  // New item form state
  const [newItemDescription, setNewItemDescription] = useState<string>("");
  const [newItemQuantity, setNewItemQuantity] = useState<number>(1);
  const [newItemUnitPrice, setNewItemUnitPrice] = useState<string>("");
  const [selectedItemTemplate, setSelectedItemTemplate] = useState<string>("");
  
  // Calculate total amount whenever line items change
  useEffect(() => {
    const total = lineItems.reduce((sum, item) => sum + item.amount, 0);
    setTotalAmount(total);
  }, [lineItems]);

  const handleAddItem = () => {
    if (!newItemDescription || !newItemUnitPrice || newItemQuantity <= 0) return;
    
    const unitPrice = parseFloat(newItemUnitPrice);
    const amount = unitPrice * newItemQuantity;
    
    const newItem: PaymentLineItem = {
      description: newItemDescription,
      quantity: newItemQuantity,
      unitPrice: unitPrice,
      amount: amount
    };
    
    setLineItems([...lineItems, newItem]);
    
    // Reset form
    setNewItemDescription("");
    setNewItemQuantity(1);
    setNewItemUnitPrice("");
    setSelectedItemTemplate("");
  };
  
  const handleRemoveItem = (index: number) => {
    const updatedItems = [...lineItems];
    updatedItems.splice(index, 1);
    setLineItems(updatedItems);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentData: PaymentFormData = {
      amount: totalAmount,
      description: description || "NFC Payment",
      items: lineItems
    };
    
    onProcessPayment(paymentData);
  };

  const handleItemTemplateSelect = (value: string) => {
    setSelectedItemTemplate(value);
    
    if (value === "custom") {
      // User wants to enter custom item
      setNewItemDescription("");
      setNewItemUnitPrice("");
    } else {
      // Use predefined item
      const index = parseInt(value);
      if (index >= 0 && index < settings.paymentDescriptions.length) {
        const selectedItem = settings.paymentDescriptions[index];
        setNewItemDescription(selectedItem.description);
        setNewItemUnitPrice(selectedItem.amount.toString());
      }
    }
  };

  return (
    <div className="p-4">
      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold text-lg text-center mb-4">Payment Details</h2>
          
          {/* Customer info */}
          <div className="mb-6 bg-neutral-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <HandMetal className="text-primary mr-2 h-5 w-5" />
              <h3 className="font-medium">Customer Information</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-xs text-muted-foreground">Card ID: {scanResult.cardId}</p>
                </div>
              </div>
              
              {customer.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p>{customer.email}</p>
                </div>
              )}
              
              {customer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p>{customer.phone}</p>
                </div>
              )}
              
              <div className="flex items-center gap-2 mt-2 border-t pt-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Current Balance</p>
                  <p className="text-lg font-bold text-primary">₱{(customer.balance / 100).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Invoice Description */}
          <div className="mb-4">
            <Label htmlFor="description" className="text-sm font-medium">
              Invoice Description (Optional)
            </Label>
            <Input
              id="description"
              type="text"
              placeholder="E.g., Monthly Dues, School Fees"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full"
            />
          </div>
          
          {/* Line Items */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium flex items-center">
                <Receipt className="mr-2 h-4 w-4" />
                Line Items
              </Label>
              <div className="text-sm text-muted-foreground">
                Total: <span className="font-medium">₱{totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            {lineItems.length > 0 ? (
              <div className="border rounded-md mb-4 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Description</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">₱{item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₱{item.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(index)}
                            className="h-8 w-8"
                          >
                            <Trash className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ₱{totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md mb-4 text-muted-foreground">
                No items added yet
              </div>
            )}
            
            {/* Add Item Form */}
            <div className="border rounded-md p-4 bg-neutral-50">
              <h4 className="font-medium text-sm mb-3 flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </h4>
              
              <div className="grid gap-3">
                <div>
                  <Label htmlFor="itemTemplate" className="text-xs">Item Template</Label>
                  <Select 
                    value={selectedItemTemplate} 
                    onValueChange={handleItemTemplateSelect}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select item or enter custom" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.paymentDescriptions.map((item, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          <span className="flex items-center justify-between w-full">
                            <span>{item.description}</span>
                            <span className="text-muted-foreground ml-2">₱{item.amount.toFixed(2)}</span>
                          </span>
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">
                        <span className="flex items-center">
                          <Edit className="mr-2 h-4 w-4" />
                          Custom item
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-1">
                    <Label htmlFor="itemDescription" className="text-xs">Description</Label>
                    <Input
                      id="itemDescription"
                      placeholder="Item description"
                      value={newItemDescription}
                      onChange={(e) => setNewItemDescription(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="itemQuantity" className="text-xs">Quantity</Label>
                    <Input
                      id="itemQuantity"
                      type="number"
                      min="1"
                      step="1"
                      value={newItemQuantity}
                      onChange={(e) => setNewItemQuantity(parseInt(e.target.value || "1"))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="itemUnitPrice" className="text-xs">Unit Price (₱)</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">₱</span>
                      <Input
                        id="itemUnitPrice"
                        type="number"
                        step="0.01"
                        min="0.01"
                        className="pl-8"
                        placeholder="0.00"
                        value={newItemUnitPrice}
                        onChange={(e) => setNewItemUnitPrice(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  onClick={handleAddItem}
                  disabled={!newItemDescription || !newItemUnitPrice || newItemQuantity <= 0}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </div>
          </div>
          
          {/* Validation message for insufficient balance */}
          {totalAmount > 0 && totalAmount > (customer.balance / 100) && (
            <div className="mb-4 mt-2 text-red-600 text-sm bg-red-50 p-3 rounded-md flex flex-col">
              <div className="font-medium mb-1">Insufficient Balance</div>
              <p>The customer's current balance (₱{(customer.balance / 100).toFixed(2)}) is not enough for this payment (₱{totalAmount.toFixed(2)}).</p>
              <p className="mt-1">Please ask the customer to reload their balance before proceeding.</p>
            </div>
          )}
          
          {/* Submit Button */}
          <form onSubmit={handleSubmit}>
            <Button 
              type="submit" 
              className="w-full bg-secondary hover:bg-secondary-dark text-white py-6" 
              disabled={
                lineItems.length === 0 || 
                totalAmount <= 0 || 
                totalAmount > (customer.balance / 100)
              }
            >
              <CreditCard className="mr-2 h-5 w-5" />
              Process Payment (₱{totalAmount.toFixed(2)})
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
