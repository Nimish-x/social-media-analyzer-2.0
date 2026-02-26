import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Facebook,
  CheckCircle2,
  ArrowRight,
  Loader2,
  X,
  Key,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const platforms = [
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "from-pink-500 to-purple-500",
    description: "Connect your Instagram Business or Creator account"
  },
  {
    id: "twitter",
    name: "Twitter/X",
    icon: Twitter,
    color: "from-blue-400 to-blue-600",
    description: "Connect your Twitter account for analytics"
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "from-blue-600 to-blue-800",
    description: "Connect your LinkedIn Page for insights"
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    color: "from-red-500 to-red-600",
    description: "Connect your YouTube channel"
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "from-blue-500 to-blue-700",
    description: "Connect your Facebook Page"
  },
];

const ConnectAccounts = () => {
  const { toast } = useToast();
  // We use the same localStorage key as Settings.tsx
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [connections, setConnections] = useState<Record<string, any>>({});

  // Modal state
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [channelIdInput, setChannelIdInput] = useState("");
  const [publicHandleInput, setPublicHandleInput] = useState("");

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = () => {
    try {
      const saved = localStorage.getItem("socialleaf_connections");
      if (saved) {
        const parsed = JSON.parse(saved);
        setConnections(parsed);
        // Update connected list based on the object
        const connectedKeys = Object.keys(parsed).filter(key => parsed[key]?.connected);
        setConnectedPlatforms(connectedKeys);
      }
    } catch (e) {
      console.error("Failed to load connections", e);
    }
  };

  const saveConnectionsToStorage = (newConnections: Record<string, any>) => {
    try {
      const connString = JSON.stringify(newConnections);
      localStorage.setItem("socialleaf_connections", connString);

      // Update local state
      setConnections(newConnections);
      const connectedKeys = Object.keys(newConnections).filter(key => newConnections[key]?.connected);
      setConnectedPlatforms(connectedKeys);

      // Trigger event for other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'socialleaf_connections',
        newValue: connString
      }));
    } catch { }
  };

  const handleConnectClick = (platformId: string) => {
    setSelectedPlatform(platformId);
    setApiKeyInput("");
    setChannelIdInput("");
    setPublicHandleInput("");
    setShowConnectModal(true);
  };

  const handleSaveConnection = () => {
    if (!selectedPlatform) return;

    if (!apiKeyInput.trim() && !publicHandleInput.trim()) {
      toast({ title: "❌ Error", description: "Please enter an API key or Public Handle" });
      return;
    }

    const newConnections = {
      ...connections,
      [selectedPlatform]: {
        connected: true,
        status: publicHandleInput.trim() ? "Simulated (Public)" : "Live",
        apiKey: apiKeyInput.trim() || undefined,
        channelId: channelIdInput.trim() || undefined,
        publicHandle: publicHandleInput.trim() || undefined,
      },
    };

    saveConnectionsToStorage(newConnections);
    setShowConnectModal(false);

    toast({
      title: "✅ Connected!",
      description: `${platforms.find(p => p.id === selectedPlatform)?.name} has been connected successfully.`
    });
  };

  const handleDisconnect = (platformId: string) => {
    const newConnections = {
      ...connections,
      [platformId]: {
        connected: false,
        status: "Not Connected",
      }
    };
    saveConnectionsToStorage(newConnections);
    toast({
      title: "Disconnected",
      description: `${platforms.find(p => p.id === platformId)?.name} has been disconnected.`
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="max-w-2xl mx-auto text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-leaf-100 text-leaf-700 text-sm font-medium mb-6"
            >
              Step 1 of 2
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              Connect your social accounts
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-muted-foreground"
            >
              Link your accounts to start tracking analytics across all platforms.
              Your data is securely encrypted.
            </motion.p>
          </div>

          {/* Progress */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {connectedPlatforms.length} of {platforms.length} connected
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round((connectedPlatforms.length / platforms.length) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(connectedPlatforms.length / platforms.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Platform Cards */}
          <div className="max-w-2xl mx-auto space-y-4">
            {platforms.map((platform, index) => {
              const isConnected = connectedPlatforms.includes(platform.id);

              return (
                <motion.div
                  key={platform.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className={`p-6 rounded-2xl border transition-all duration-300 ${isConnected
                    ? "bg-leaf-50 border-primary"
                    : "bg-card border-border hover:shadow-card"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
                        <platform.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{platform.name}</h3>
                          {isConnected && (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{platform.description}</p>
                      </div>
                    </div>

                    {isConnected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(platform.id)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        variant="hero"
                        size="sm"
                        onClick={() => handleConnectClick(platform.id)}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="max-w-2xl mx-auto mt-12 flex justify-between items-center"
          >
            <Button variant="ghost" asChild>
              <Link to="/">Skip for now</Link>
            </Button>
            <Button
              variant="hero"
              size="lg"
              asChild
              disabled={connectedPlatforms.length === 0}
            >
              <Link to="/dashboard">
                Continue to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Connect Modal */}
      {showConnectModal && selectedPlatform && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-6 w-full max-w-md border border-border shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${platforms.find(p => p.id === selectedPlatform)?.color}`}>
                  {(() => {
                    const Icon = platforms.find(p => p.id === selectedPlatform)?.icon;
                    return Icon ? <Icon className="h-4 w-4 text-white" /> : null;
                  })()}
                </div>
                <h3 className="font-semibold">Connect {platforms.find(p => p.id === selectedPlatform)?.name}</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowConnectModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">API Key *</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Enter your API key..."
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {(selectedPlatform === "youtube" || selectedPlatform === "instagram") && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    {selectedPlatform === "youtube" ? "Channel ID" : "Account ID"} (optional)
                  </label>
                  <Input
                    type="text"
                    placeholder={selectedPlatform === "youtube" ? "UC..." : "@username"}
                    value={channelIdInput}
                    onChange={(e) => setChannelIdInput(e.target.value)}
                  />
                </div>
              )}

              {/* Help URL would be dynamic based on platform if needed, simplified for now */}
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ExternalLink className="h-3 w-3" /> Get API keys from developer portal
              </p>

              {(selectedPlatform === "youtube" || selectedPlatform === "instagram") && (
                <div className="pt-2 border-t border-border mt-2">
                  <p className="text-sm font-semibold mb-2 text-primary">OR Simulate Public Profile</p>
                  <label className="text-sm font-medium mb-1.5 block">
                    Public Handle (@username)
                  </label>
                  <Input
                    placeholder="@mrbeast"
                    value={publicHandleInput}
                    onChange={(e) => setPublicHandleInput(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use this to track a specific public profile without login.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowConnectModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-primary" onClick={handleSaveConnection}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              </div>
            </div>
          </motion.div>
        </div >
      )}
    </div>
  );
};

export default ConnectAccounts;
