import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Save, Megaphone, Flag } from "lucide-react";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { API_BASE_URL } from "@/services/api";

interface GlobalSettings {
  announcement: string;
  announcement_active: boolean;
  feature_flags: {
    beta_features: boolean;
    maintenance_mode: boolean;
  };
  maintenance_start: string;
  maintenance_end: string;
}

export default function AdminSettings() {
  const { session } = useAuth();
  const [settings, setSettings] = useState<GlobalSettings>({
    announcement: "",
    announcement_active: false,
    feature_flags: { beta_features: false, maintenance_mode: false },
    maintenance_start: "",
    maintenance_end: ""
  });
  const [loading, setLoading] = useState(false);
  const [notifying, setNotifying] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [session]);

  const fetchSettings = async () => {
    if (!session?.access_token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({
          ...prev,
          ...data,
          feature_flags: {
            ...prev.feature_flags,
            ...(data.feature_flags || {})
          }
        }));
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
    }
  };

  const handleSave = async () => {
    if (!session?.access_token) return;
    console.log("Saving settings:", settings);
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(settings)
      });

      if (!res.ok) throw new Error("Failed to save settings");
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };
  const handleNotify = async () => {
    if (!session?.access_token) return;
    if (!settings.maintenance_start || !settings.maintenance_end) {
      toast.error("Please set maintenance start and end times first");
      return;
    }

    try {
      setNotifying(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/system/notify-maintenance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          start: settings.maintenance_start,
          end: settings.maintenance_end
        })
      });

      if (!res.ok) throw new Error("Failed to send notifications");
      const data = await res.json();
      toast.success(`Notifications sent to ${data.users_notified} users`);
    } catch (error) {
      toast.error("Failed to send notifications");
    } finally {
      setNotifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center gap-4">
            <MobileNav />
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-display font-bold">Admin Settings</h1>
              <p className="text-muted-foreground">Global platform configurations.</p>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Feature Flags */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Flag className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Feature Flags</CardTitle>
                  <CardDescription>Toggle experimental or system-wide features.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Beta Features</Label>
                    <p className="text-sm text-muted-foreground">Enable experimental features for all users.</p>
                  </div>
                  <Switch
                    checked={settings.feature_flags.beta_features}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      feature_flags: { ...settings.feature_flags, beta_features: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Disable app access for non-admins.</p>
                  </div>
                  <Switch
                    checked={settings.feature_flags.maintenance_mode}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      feature_flags: { ...settings.feature_flags, maintenance_mode: checked }
                    })}
                  />
                </div>

                <div className="pt-4 border-t border-border space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Maintenance Start</Label>
                      <Input
                        type="datetime-local"
                        value={settings.maintenance_start}
                        onChange={(e) => setSettings({ ...settings, maintenance_start: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Maintenance End</Label>
                      <Input
                        type="datetime-local"
                        value={settings.maintenance_end}
                        onChange={(e) => setSettings({ ...settings, maintenance_end: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleNotify}
                    disabled={notifying}
                  >
                    {notifying ? "Sending..." : "Notify Users via Email"}
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center italic">
                    Sends a scheduled maintenance alert to all registered users.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Global Announcement</CardTitle>
                  <CardDescription>Broadcast a message to all users.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Switch
                    checked={settings.announcement_active}
                    onCheckedChange={(checked) => setSettings({ ...settings, announcement_active: checked })}
                  />
                  <Label>Active</Label>
                </div>
                <Input
                  placeholder="Enter announcement message..."
                  value={settings.announcement}
                  onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={loading} size="lg">
                {loading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
