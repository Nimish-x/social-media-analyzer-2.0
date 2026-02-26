import { motion } from "framer-motion";
import { AlertTriangle, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export const MaintenancePage = () => {
  const [schedule, setSchedule] = useState<{ start: string, end: string } | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_URL}/api/system/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.maintenance_start && data.maintenance_end) {
            setSchedule({
              start: new Date(data.maintenance_start).toLocaleString(),
              end: new Date(data.maintenance_end).toLocaleString()
            });
          }
        }
      } catch (e) {
        console.error("Failed to fetch maintenance status");
      }
    };
    fetchStatus();
  }, []);

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card w-full max-w-lg rounded-2xl shadow-xl border border-border overflow-hidden"
      >
        <div className="bg-amber-500/10 p-8 flex flex-col items-center">
          <div className="bg-amber-100 p-4 rounded-full mb-6">
            <AlertTriangle className="h-10 w-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">Under Maintenance</h1>
          <p className="text-muted-foreground text-center">
            We are currently performing scheduled maintenance to improve your experience.
          </p>
        </div>
        <div className="p-8 border-t border-border bg-card/50">
          <div className="space-y-4">
            {schedule && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 text-primary mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">
                  Scheduled: {schedule.start} — {schedule.end}
                </span>
              </div>
            )}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-amber-500/5 border border-amber-200/50">
              <div className="h-2 w-2 rounded-full bg-amber-500 mt-2 shrink-0" />
              <div>
                <h3 className="font-medium text-sm">What's happening?</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Our team is deploying critical updates and security patches.
                </p>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-6">
              We'll be back online as soon as possible. Thank you for your patience!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
