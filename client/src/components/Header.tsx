import { Button } from "@/components/ui/button";
import { Nfc, HistoryIcon, Settings2Icon, FileBarChart } from "lucide-react";

interface HeaderProps {
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenReports: () => void;
}

export function Header({ onOpenHistory, onOpenSettings, onOpenReports }: HeaderProps) {
  return (
    <header className="bg-primary text-white p-4 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Nfc className="mr-2" />
          <h1 className="font-sans font-bold text-xl">NFC Pay</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-primary-dark" 
            onClick={onOpenHistory}
            title="Transaction History"
          >
            <HistoryIcon className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-primary-dark" 
            onClick={onOpenReports}
            title="Reports & Analytics"
          >
            <FileBarChart className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-primary-dark" 
            onClick={onOpenSettings}
            title="Settings"
          >
            <Settings2Icon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
