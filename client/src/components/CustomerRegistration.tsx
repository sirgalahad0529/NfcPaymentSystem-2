import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UserPlus, ArrowLeft } from "lucide-react";
import { ScanResult, CustomerRegistration as CustomerRegistrationType } from "@shared/schema";

// Form validation schema
const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().min(1, { message: "Email is required" }).email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }).min(1, { message: "Phone number is required" }),
  initialBalance: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 500, 
    { message: "Initial balance must be at least 500 pesos" }
  )
});

interface CustomerRegistrationProps {
  scanResult: ScanResult;
  onRegistrationComplete: (customer: any) => void;
  onCancel: () => void;
}

export function CustomerRegistration({ scanResult, onRegistrationComplete, onCancel }: CustomerRegistrationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      initialBalance: "500"
    }
  });
  
  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      const registrationData: CustomerRegistrationType = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        initialBalance: parseFloat(data.initialBalance),
        cardId: scanResult.cardId
      };
      
      const response = await fetch("/api/customers/register", {
        method: "POST",
        body: JSON.stringify(registrationData),
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const customerData = await response.json();
        onRegistrationComplete(customerData);
      } else {
        const errorData = await response.json();
        console.error("Registration error:", errorData);
        form.setError("root", { 
          type: "manual",
          message: errorData.message || "Failed to register customer. Please try again."
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      form.setError("root", { 
        type: "manual",
        message: "An unexpected error occurred. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <div className="p-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onCancel}
              className="h-8 w-8 mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="font-semibold text-lg">Register New Customer</h2>
          </div>
          
          <p className="text-muted-foreground text-sm mb-2">
            This card (ID: {scanResult.cardId}) is not registered. Please enter customer details below.
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Fields marked with <span className="text-red-500">*</span> are required. Email and phone must be provided for customer identification.
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter first name" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter last name" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="customer@example.com" 
                        type="email"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+63 XXX XXX XXXX" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="initialBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Balance (PHP) <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">₱</span>
                        <Input 
                          placeholder="0.00" 
                          type="number"
                          className="pl-8"
                          min="500"
                          step="0.01"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">Minimum initial balance: ₱500.00</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.formState.errors.root && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {form.formState.errors.root.message}
                </div>
              )}
              
              <div className="flex justify-between pt-2">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register Customer
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Back to Home button */}
      <Button 
        className="w-full mt-4"
        variant="outline"
        onClick={onCancel}
      >
        Back to Home
      </Button>
    </div>
  );
}