import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Leaf,
  ArrowLeft,
  Link2,
  CheckCircle,
  Sliders,
  Brain,
  Download,
  Shield,
  FileText,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  Save,
  X,
  Key,
  ExternalLink,
} from "lucide-react";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { API_BASE_URL } from "@/services/api";

// Settings type
interface AppSettings {
  timezone: string;
  refreshFrequency: string;
  insightTone: string;
  notifications: boolean;
  recommendationStyle: string;
  exportFormat: string;
  dataRetention: string;
  lastRefresh: number;
}

// Platform connection type
interface PlatformConnection {
  name: string;
  key: string;
  icon: any;
  color: string;
  connected: boolean;
  status: "Live" | "Simulated" | "Not Connected";
  apiKey?: string;
  channelId?: string;
  publicHandle?: string;
  helpUrl: string;
}

// Default settings
const defaultSettings: AppSettings = {
  timezone: "Asia/Kolkata",
  refreshFrequency: "6h",
  insightTone: "detailed",
  notifications: true,
  recommendationStyle: "Balanced",
  exportFormat: "csv",
  dataRetention: "90 days",
  lastRefresh: Date.now(),
};

// Load settings from localStorage
const loadSettings = (): AppSettings => {
  try {
    const saved = localStorage.getItem("socialleaf_settings");
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch {
    console.error("Failed to load settings");
  }
  return defaultSettings;
};

// Save settings to localStorage
const saveSettings = (settings: AppSettings) => {
  try {
    localStorage.setItem("socialleaf_settings", JSON.stringify(settings));
  } catch {
    console.error("Failed to save settings");
  }
};

// Load platform connections from localStorage
const loadConnections = (): Record<string, { connected: boolean; status: string; apiKey?: string; channelId?: string; publicHandle?: string }> => {
  // Default connections - YouTube always connected with real API
  const defaults = {
    instagram: { connected: false, status: "Not connected" },
    youtube: { connected: true, status: "Real Time Data" }, // Always connected - API key in backend
    twitter: { connected: false, status: "Not connected" },
    linkedin: { connected: false, status: "Not connected" },
  };

  try {
    const saved = localStorage.getItem("socialleaf_connections");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch { }

  return defaults;
};

// Save connections to localStorage and notify other components
const saveConnections = (connections: Record<string, any>) => {
  try {
    const connString = JSON.stringify(connections);
    localStorage.setItem("socialleaf_connections", connString);

    // Trigger storage event so SocialDataContext (which is in the same window) can update
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'socialleaf_connections',
      newValue: connString
    }));
  } catch { }
};

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [connections, setConnections] = useState(loadConnections);

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connectedPlatform = params.get("connected");

    if (connectedPlatform) {
      // Update connection status
      const newConnections = {
        ...connections,
        [connectedPlatform]: { connected: true, status: "Live" },
      };
      setConnections(newConnections);
      saveConnections(newConnections);

      toast({
        title: "✅ Connected!",
        description: `${connectedPlatform.charAt(0).toUpperCase() + connectedPlatform.slice(1)} has been connected via OAuth.`,
      });

      // Clean URL
      window.history.replaceState({}, "", "/settings");
    }

    // Fetch connection status from backend
    fetchConnectionStatus();
  }, []);

  const fetchConnectionStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/status`);
      if (response.ok) {
        const status = await response.json(); // Parse the backend response
        const currentLocal = loadConnections(); // Get fresh local state
        const newConnections: Record<string, any> = {};

        for (const [platform, data] of Object.entries(status)) {
          const platformData = data as { connected: boolean; has_credentials: boolean; api_key_available?: boolean };

          // Default to what backend says
          let isConnected = platformData.connected;
          let statusText = isConnected ? "Live" : (platformData.has_credentials ? "Ready" : "Not Connected");

          // Special case for YouTube
          if (platform === "youtube") {
            if (platformData.api_key_available) {
              // If API key is real, we have Real Data
              if (!isConnected) {
                isConnected = true;
                statusText = "Real Time Data";
              }
            } else {
              // If no API key and no OAuth, we still fallback to Backend Simulation/Featured
              // So we treat it as Simulated by default instead of Disconnected
              if (!isConnected && !currentLocal["youtube"]?.apiKey) {
                isConnected = true;
                statusText = "Simulated (Public)";
              }
            }
          }

          // PRESERVE LOCAL SIMULATION STATE if backend says disconnected
          // If we have a local "Simulated" connection, keep it unless backend says "Live"
          const localConn = currentLocal[platform];
          if (!isConnected && localConn?.connected && (localConn.status.includes("Simulated") || localConn.apiKey)) {
            // Be careful: if user explicitly disconnected in backend, we usually want to reflect that.
            // But here "backend disconnected" just means "no oauth token".
            // So if we have a local API key or handle, we keep "Simulated"/"Real Time" status.
            isConnected = true;
            statusText = localConn.status;
          }

          newConnections[platform] = {
            connected: isConnected,
            status: statusText,
            // Preserve existing keys/handles if not provided by backend
            apiKey: localConn?.apiKey,
            channelId: localConn?.channelId,
            publicHandle: localConn?.publicHandle,
          };
        }

        setConnections(newConnections);
        // Do NOT save to localStorage here blindly, as it might strip keys if we aren't careful.
        // Actually, we just reconstituted the keys above. So it is safe to save.
        saveConnections(newConnections);
      }
    } catch (error) {
      console.log("Backend not available, using local state");
    }
  };

  // Modal state (fallback for API key entry)
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [channelIdInput, setChannelIdInput] = useState("");
  const [publicHandleInput, setPublicHandleInput] = useState("");
  const [platformToDisconnect, setPlatformToDisconnect] = useState<string | null>(null);


  // Platform definitions
  const platformDefs: PlatformConnection[] = [
    {
      name: "Instagram",
      key: "instagram",
      icon: Instagram,
      color: "bg-pink-500",
      connected: connections.instagram?.connected || false,
      status: connections.instagram?.status as any || "Not Connected",
      helpUrl: "https://developers.facebook.com/docs/instagram-api/getting-started",
    },
    {
      name: "YouTube",
      key: "youtube",
      icon: Youtube,
      color: "bg-red-500",
      connected: connections.youtube?.connected || false,
      status: connections.youtube?.status as any || "Not Connected",
      helpUrl: "https://console.cloud.google.com/apis/credentials",
    },
    {
      name: "Twitter",
      key: "twitter",
      icon: Twitter,
      color: "bg-blue-400",
      connected: connections.twitter?.connected || false,
      status: connections.twitter?.status as any || "Not Connected",
      helpUrl: "https://developer.twitter.com/en/portal/dashboard",
    },
    {
      name: "LinkedIn",
      key: "linkedin",
      icon: Linkedin,
      color: "bg-blue-600",
      connected: connections.linkedin?.connected || false,
      status: connections.linkedin?.status as any || "Not Connected",
      helpUrl: "https://www.linkedin.com/developers/apps",
    },
  ];

  // Open modal to enter API key (removed OAuth redirect)
  const handleConnect = (platformKey: string) => {
    setSelectedPlatform(platformKey);
    setApiKeyInput("");
    setChannelIdInput("");
    setPublicHandleInput("");
    setShowConnectModal(true);
  };

  // Save connection
  const handleSaveConnection = () => {
    // Validation: Require either API Key OR Public Handle
    if (!selectedPlatform) return;

    // For specific simulation mode request
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

    setConnections(newConnections);
    saveConnections(newConnections);
    setShowConnectModal(false);
    setApiKeyInput("");
    setChannelIdInput("");

    const platformName = platformDefs.find(p => p.key === selectedPlatform)?.name;
    toast({
      title: "✅ Connected!",
      description: `${platformName} has been connected successfully.`
    });
  };

  // Disconnect platform
  const handleDisconnect = (platformKey: string) => {
    setPlatformToDisconnect(platformKey);
  };

  const confirmDisconnect = () => {
    if (!platformToDisconnect) return;
    const platformKey = platformToDisconnect;
    const platformName = platformDefs.find(p => p.key === platformKey)?.name;

    const newConnections = {
      ...connections,
      [platformKey]: {
        connected: false,
        status: "Not Connected",
        apiKey: undefined,
        channelId: undefined,
        publicHandle: undefined,
      },
    };

    setConnections(newConnections);
    saveConnections(newConnections);
    setPlatformToDisconnect(null);

    toast({
      title: "🔌 Disconnected",
      description: `${platformName} has been disconnected.`
    });
  };

  // Update a setting
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  // Save settings
  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    saveSettings(settings);
    setHasChanges(false);
    setIsSaving(false);
    toast({
      title: "✅ Settings Saved",
      description: "Your preferences have been saved successfully.",
    });
  };

  // Export data
  const handleExport = () => {
    const format = settings.exportFormat;

    if (format === "csv") {
      const csvData = `Social Leaf Analytics Export
Generated: ${new Date().toLocaleString()}

Platform,Status,API Key Present
Instagram,${connections.instagram?.status},${connections.instagram?.apiKey ? "Yes" : "No"}
YouTube,${connections.youtube?.status},${connections.youtube?.apiKey ? "Yes" : "No"}
Twitter,${connections.twitter?.status},${connections.twitter?.apiKey ? "Yes" : "No"}
LinkedIn,${connections.linkedin?.status},${connections.linkedin?.apiKey ? "Yes" : "No"}`;

      const blob = new Blob([csvData], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `social_leaf_export_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "pdf") {
      const printContent = `
        <html>
          <head>
            <title>Social Leaf Report</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              h1 { color: #22C55E; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background: #22C55E; color: white; }
            </style>
          </head>
          <body>
            <h1>🌿 Social Leaf Report</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <table>
              <tr><th>Platform</th><th>Status</th><th>Connected</th></tr>
              ${platformDefs.map(p => `<tr><td>${p.name}</td><td>${connections[p.key]?.status || "Not Connected"}</td><td>${connections[p.key]?.connected ? "Yes" : "No"}</td></tr>`).join("")}
            </table>
          </body>
        </html>
      `;
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
    } else {
      const jsonData = { exportDate: new Date().toISOString(), settings, connections };
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `social_leaf_export_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    toast({ title: `📥 Exported as ${format.toUpperCase()}`, description: "Export completed" });
  };

  // Refresh cooldown
  const getRefreshCooldown = () => {
    const lastRefresh = settings.lastRefresh;
    const freqHours = parseInt(settings.refreshFrequency.replace("h", ""));
    const nextRefresh = lastRefresh + freqHours * 60 * 60 * 1000;
    const now = Date.now();

    if (now >= nextRefresh) return { canRefresh: true, message: "Ready to refresh" };

    const remaining = nextRefresh - now;
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

    return { canRefresh: false, message: `Next refresh in ${hours}h ${minutes}m` };
  };

  const refreshStatus = getRefreshCooldown();

  return (
    <div className="min-h-screen bg-muted flex">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {/* Header with MobileNav */}
        <header className="bg-card border-b border-border px-6 py-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <MobileNav />
              <Link to="/dashboard" className="hidden lg:block">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Settings
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && <span className="text-xs text-amber-500 hidden sm:inline">Unsaved changes</span>}
              <span className={`text-xs px-2 py-1 rounded-full ${refreshStatus.canRefresh ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>
                {refreshStatus.message}
              </span>
            </div>
          </div>
        </header>

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
                  <div className={`p-2 rounded-lg ${platformDefs.find(p => p.key === selectedPlatform)?.color}`}>
                    {(() => {
                      const Icon = platformDefs.find(p => p.key === selectedPlatform)?.icon;
                      return Icon ? <Icon className="h-4 w-4 text-white" /> : null;
                    })()}
                  </div>
                  <h3 className="font-semibold">Connect {platformDefs.find(p => p.key === selectedPlatform)?.name}</h3>
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

                <a
                  href={platformDefs.find(p => p.key === selectedPlatform)?.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  How to get your API key? <ExternalLink className="h-3 w-3" />
                </a>

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
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                </div>
              </div>
            </motion.div>
          </div >
        )}

        {/* Disconnect Confirmation Modal */}
        <AlertDialog open={!!platformToDisconnect} onOpenChange={(open) => !open && setPlatformToDisconnect(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will disconnect {platformDefs.find(p => p.key === platformToDisconnect)?.name} from your dashboard.
                You will need to reconnect to see its live data again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDisconnect} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Disconnect
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>


        <div className="p-6 max-w-4xl mx-auto space-y-6">
          {/* Platform Connections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="flex items-center gap-2 mb-4">
              <Link2 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Platform Connections</h3>
            </div>
            <div className="space-y-3">
              {platformDefs.map((platform) => {
                const conn = connections[platform.key];
                const isConnected = conn?.connected;
                const status = conn?.status || "Not Connected";

                return (
                  <div
                    key={platform.name}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${platform.color}`}>
                        <platform.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{platform.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {isConnected ? "Connected" : "Not connected"}
                          {conn?.apiKey && <span className="ml-1 text-green-500">• API Key saved</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isConnected ? (
                        <>
                          <span
                            className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${status === "Real Time Data" || status === "Live"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-amber-500/10 text-amber-500"
                              }`}
                          >
                            {(status === "Real Time Data" || status === "Live") && (
                              <span className="relative flex h-1.5 w-1.5 mr-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                              </span>
                            )}
                            {status}
                          </span>
                          <Button variant="outline" size="sm" onClick={() => handleDisconnect(platform.key)}>
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" className="bg-primary" onClick={() => handleConnect(platform.key)}>
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-4 p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
              💡 <strong>Tip:</strong> Enter your real API keys to get live data. Without API keys, we show simulated demo data.
            </p>
          </motion.div>

          {/* Data Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sliders className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Data Preferences</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Timezone</p>
                  <p className="text-xs text-muted-foreground">Used for scheduling and analytics</p>
                </div>
                <select
                  value={settings.timezone}
                  onChange={(e) => updateSetting("timezone", e.target.value)}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Data Refresh Frequency</p>
                  <p className="text-xs text-muted-foreground">How often to sync platform data</p>
                </div>
                <div className="flex gap-2">
                  {["1h", "6h", "12h", "24h"].map((freq) => (
                    <button
                      key={freq}
                      onClick={() => updateSetting("refreshFrequency", freq)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${settings.refreshFrequency === freq
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                        }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold">AI Preferences</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Insight Tone</p>
                  <p className="text-xs text-muted-foreground">How detailed should AI insights be?</p>
                </div>
                <div className="flex gap-2">
                  {["concise", "detailed"].map((tone) => (
                    <button
                      key={tone}
                      onClick={() => updateSetting("insightTone", tone)}
                      className={`px-4 py-1.5 rounded-lg text-sm capitalize transition-colors ${settings.insightTone === tone
                        ? "bg-purple-500 text-white"
                        : "bg-muted hover:bg-muted/80"
                        }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">AI Notifications</p>
                  <p className="text-xs text-muted-foreground">Get alerts for AI-detected insights</p>
                </div>
                <button
                  onClick={() => updateSetting("notifications", !settings.notifications)}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.notifications ? "bg-primary" : "bg-muted"
                    }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.notifications ? "translate-x-6" : "translate-x-0.5"
                      }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Recommendation Style</p>
                  <p className="text-xs text-muted-foreground">How aggressive should suggestions be?</p>
                </div>
                <select
                  value={settings.recommendationStyle}
                  onChange={(e) => updateSetting("recommendationStyle", e.target.value)}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm"
                >
                  <option>Conservative</option>
                  <option>Balanced</option>
                  <option>Aggressive</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Export & Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="flex items-center gap-2 mb-4">
              <Download className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold">Export & Privacy</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Export Format</p>
                  <p className="text-xs text-muted-foreground">Default format for data exports</p>
                </div>
                <div className="flex gap-2">
                  {["csv", "pdf", "json"].map((format) => (
                    <button
                      key={format}
                      onClick={() => updateSetting("exportFormat", format)}
                      className={`px-4 py-1.5 rounded-lg text-sm uppercase transition-colors ${settings.exportFormat === format
                        ? "bg-green-500 text-white"
                        : "bg-muted hover:bg-muted/80"
                        }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Data Retention</p>
                  <p className="text-xs text-muted-foreground">How long to keep historical data</p>
                </div>
                <select
                  value={settings.dataRetention}
                  onChange={(e) => updateSetting("dataRetention", e.target.value)}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm"
                >
                  <option>30 days</option>
                  <option>90 days</option>
                  <option>1 year</option>
                  <option>Forever</option>
                </select>
              </div>
              <div className="pt-4 border-t border-border flex gap-3">
                <Button variant="outline" className="flex-1" onClick={handleExport}>
                  {settings.exportFormat === "pdf" ? <FileText className="h-4 w-4 mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                  Export as {settings.exportFormat.toUpperCase()}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete all data? This cannot be undone.")) {
                      localStorage.clear();
                      toast({ title: "🗑️ Data Deleted", description: "All local data has been cleared." });
                      navigate("/dashboard");
                    }
                  }}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Delete All Data
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end gap-3 mt-8"
          >
            <Button variant="outline" onClick={() => navigate("/dashboard")}>Cancel</Button>
            <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="bg-primary">
              {isSaving ? "Saving..." : <><Save className="h-4 w-4 mr-2" />Save Changes</>}
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
