import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";
import { API_BASE_URL } from "@/services/api";
import { useEffect, useState } from "react";
import { MaintenancePage } from "@/pages/MaintenancePage";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [checkingMaintenance, setCheckingMaintenance] = useState(true);

  useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/system/status`);
        if (res.ok && mounted) {
          const data = await res.json();

          // Check manual toggle
          const manualMode = !!data.maintenance_mode;

          // Check scheduled time window
          let autoMode = false;
          if (data.maintenance_start && data.maintenance_end) {
            const now = new Date();
            const start = new Date(data.maintenance_start);
            const end = new Date(data.maintenance_end);
            autoMode = now >= start && now <= end;
          }

          setIsMaintenanceActive(manualMode || autoMode);
        }
      } catch (e) {
        console.error("Failed to check maintenance status", e);
      } finally {
        if (mounted) setCheckingMaintenance(false);
      }
    };
    checkStatus();

    // Heartbeat: Check every 30 seconds to catch automatic start/end times
    const interval = setInterval(checkStatus, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [location.pathname]); // Re-check on path change to be safe

  // Show nothing while loading auth state or checking maintenance status
  if (loading || checkingMaintenance) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authenticated but profile fetch failed, show error
  if (user && !profile && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold mb-2">Profile Error</h2>
        <p className="text-muted-foreground mb-4">Failed to load user profile. Please try refreshing.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md transition-colors hover:bg-primary/90"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  // If maintenance mode is active (manual or automatic) and user is not an admin, show MaintenancePage
  if (isMaintenanceActive && profile?.role !== 'admin') {
    return <MaintenancePage />;
  }

  // Not authenticated - redirect to sign in
  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Authenticated but no plan selected - redirect to plan selection
  // Skip this check if already on choose-plan or payment page
  if (
    profile &&
    !profile.plan &&
    location.pathname !== '/choose-plan' &&
    location.pathname !== '/choose-plan' &&
    !location.pathname.startsWith('/payment') &&
    profile.role !== 'admin'
  ) {
    return <Navigate to="/choose-plan" replace />;
  }

  return <>{children}</>;
};

