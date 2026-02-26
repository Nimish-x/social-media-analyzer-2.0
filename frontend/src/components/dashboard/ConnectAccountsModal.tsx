import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Instagram, Youtube, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface ConnectAccountsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConnectAccountsModal({ open, onOpenChange }: ConnectAccountsModalProps) {
  const handleConnect = (type: "both" | "individual") => {
    // 1. Set the legacy connect flag for Dashboard.tsx
    localStorage.setItem("hasConnectedAccounts", "true");

    // 2. Set the data connections for SocialDataContext.tsx
    const mockConnections = {
      youtube: { connected: true, dataType: "Real API Connected" },
      instagram: { connected: true, publicHandle: "mrbeast", dataType: "Simulated Data" },
      twitter: { connected: true, dataType: "Simulated Data" },
      linkedin: { connected: true, dataType: "Simulated Data" }
    };
    localStorage.setItem("socialleaf_connections", JSON.stringify(mockConnections));

    // 3. Trigger context refresh (SocialDataContext listens for storage events)
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'socialleaf_connections',
      newValue: JSON.stringify(mockConnections)
    }));

    onOpenChange(false);
    toast.success("Accounts connected successfully!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Accounts</DialogTitle>
          <DialogDescription>
            Connect your social media accounts to access analytics.
          </DialogDescription>
        </DialogHeader>
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-display">Connect your social accounts</DialogTitle>
          <DialogDescription className="text-center">
            To get started with analytics, please connect your accounts.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button
            variant="hero"
            size="lg"
            className="w-full h-auto py-4 flex flex-col gap-1 items-center"
            onClick={() => handleConnect("both")}
          >
            <div className="flex items-center gap-2 mb-1">
              <Instagram className="h-5 w-5" />
              <span className="text-white/50">+</span>
              <Youtube className="h-5 w-5" />
            </div>
            <span>Connect Instagram & YouTube</span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleConnect("individual")}
          >
            Connect Individual Accounts
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
