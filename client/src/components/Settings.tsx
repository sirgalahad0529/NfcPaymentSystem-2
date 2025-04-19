import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PanelBottomClose, SettingsIcon, SaveIcon, Plus, X, Users } from "lucide-react";
import { AppSettings, PaymentDescriptionItem } from "@/types";
import { CustomerManagement } from "@/components/CustomerManagement";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AppSettings) => void;
  initialSettings: AppSettings;
}

export function Settings({ isOpen, onClose, onSave, initialSettings }: SettingsProps) {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [slideIn, setSlideIn] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [newAmount, setNewAmount] = useState<number>(0);
  
  useEffect(() => {
    if (isOpen) {
      setSlideIn(true);
    } else {
      setSlideIn(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    onSave(settings);
    onClose();
  };
  
  const addDescription = () => {
    if (newDescription.trim() === '') return;
    
    const newItem: PaymentDescriptionItem = {
      description: newDescription,
      amount: newAmount
    };
    
    setSettings({
      ...settings, 
      paymentDescriptions: [...settings.paymentDescriptions, newItem]
    });
    
    setNewDescription("");
    setNewAmount(0);
  };
  
  const removeDescription = (index: number) => {
    const updatedDescriptions = [...settings.paymentDescriptions];
    updatedDescriptions.splice(index, 1);
    setSettings({
      ...settings, 
      paymentDescriptions: updatedDescriptions
    });
  };
  
  const updateDescriptionAmount = (index: number, newAmount: number) => {
    const updatedDescriptions = [...settings.paymentDescriptions];
    updatedDescriptions[index] = {
      ...updatedDescriptions[index],
      amount: newAmount
    };
    
    setSettings({
      ...settings,
      paymentDescriptions: updatedDescriptions
    });
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-30">
      <div className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white h-full transform transition-transform duration-300 ${slideIn ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="bg-primary text-white p-4 flex items-center justify-between">
            <h2 className="font-semibold text-lg flex items-center">
              <SettingsIcon className="mr-2 h-5 w-5" />
              Settings
            </h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-primary-dark" 
              onClick={onClose}
            >
              <PanelBottomClose className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <Tabs defaultValue="app-settings">
              <TabsList className="mb-4 w-full">
                <TabsTrigger value="app-settings">App Settings</TabsTrigger>
                <TabsTrigger value="customer-management" className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Customer Management
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="app-settings">
                <div className="bg-white border border-neutral-200 rounded-lg shadow-sm mb-4">
                  <div className="p-4 border-b border-neutral-200">
                    <h3 className="font-medium mb-4">API Configuration</h3>
                    <div className="mb-4">
                      <Label htmlFor="api-url" className="text-sm font-medium mb-2">
                        PayMongo API URL
                      </Label>
                      <Input 
                        id="api-url" 
                        type="text" 
                        placeholder="https://api.paymongo.com/v1" 
                        value={settings.apiUrl}
                        onChange={(e) => setSettings({...settings, apiUrl: e.target.value})}
                      />
                    </div>
                  </div>
                  

                  
                  <div className="p-4">
                    <h3 className="font-medium mb-4">NFC Scanner Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="scanner-mode" className="text-sm font-medium mb-2">
                          Scanner Mode
                        </Label>
                        <Select 
                          value={settings.scannerMode}
                          onValueChange={(value) => 
                            setSettings({
                              ...settings, 
                              scannerMode: value as "automatic" | "manual"
                            })
                          }
                        >
                          <SelectTrigger id="scanner-mode">
                            <SelectValue placeholder="Select scanner mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="automatic">Automatic (On Startup)</SelectItem>
                            <SelectItem value="manual">Manual (On Button Press)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="scan-timeout" className="text-sm font-medium mb-2">
                          Scan Timeout (seconds)
                        </Label>
                        <Input 
                          id="scan-timeout" 
                          type="number" 
                          value={settings.scanTimeout}
                          onChange={(e) => setSettings({...settings, scanTimeout: parseInt(e.target.value)})}
                          min={5}
                          max={60}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Payment Descriptions Section */}
                <div className="bg-white border border-neutral-200 rounded-lg shadow-sm">
                  <div className="p-4">
                    <h3 className="font-medium mb-4">Payment Descriptions with Amounts</h3>
                    
                    {/* Add new description with amount */}
                    <div className="mb-4">
                      <div className="flex mb-2">
                        <Input 
                          type="text" 
                          placeholder="Add new payment description" 
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                          className="flex-grow"
                        />
                      </div>
                      <div className="flex">
                        <div className="flex-grow mr-2">
                          <Label htmlFor="new-amount" className="text-xs mb-1 block">
                            Amount
                          </Label>
                          <Input 
                            id="new-amount"
                            type="number" 
                            placeholder="Amount"
                            min={0}
                            step={0.01}
                            value={newAmount}
                            onChange={(e) => setNewAmount(parseFloat(e.target.value))}
                          />
                        </div>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={addDescription}
                          className="self-end h-10"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                    
                    {/* List of descriptions with amounts */}
                    {settings.paymentDescriptions.length === 0 ? (
                      <div className="text-muted-foreground py-2 text-center border border-dashed rounded-md">
                        No payment descriptions added yet
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {settings.paymentDescriptions.map((item, index) => (
                          <div key={index} className="flex items-center justify-between bg-neutral-50 p-3 rounded-md">
                            <div className="flex-grow">
                              <div className="font-medium">{item.description}</div>
                              <div className="flex items-center mt-1">
                                <Label className="text-xs mr-2 w-16">Amount:</Label>
                                <Input
                                  type="number"
                                  className="h-8 w-28"
                                  min={0}
                                  step={0.01}
                                  value={item.amount}
                                  onChange={(e) => updateDescriptionAmount(index, parseFloat(e.target.value))}
                                />
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => removeDescription(index)}
                              className="ml-2 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 self-start"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="customer-management">
                <CustomerManagement onClose={() => {}} />
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="p-4 border-t border-neutral-200">
            <Button 
              className="w-full py-6" 
              onClick={handleSave}
            >
              <SaveIcon className="mr-2 h-5 w-5" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
