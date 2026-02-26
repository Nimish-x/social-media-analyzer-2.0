import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, CreditCard, Shield, Clock, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthContext";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { PLAN_DISPLAY_NAMES, PlanType } from "@/lib/planPermissions";

const Account = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const planName = profile?.plan
    ? PLAN_DISPLAY_NAMES[profile.plan as PlanType]
    : 'No Plan Selected';

  const getPlanStatusBadge = () => {
    if (!profile?.plan_status) return null;

    const statusColors = {
      active: 'bg-green-500/10 text-green-600 border-green-500/30',
      trial: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
      expired: 'bg-red-500/10 text-red-600 border-red-500/30',
      cancelled: 'bg-gray-500/10 text-gray-600 border-gray-500/30',
    };

    const statusLabels = {
      active: 'Active',
      trial: 'Trial',
      expired: 'Expired',
      cancelled: 'Cancelled',
    };

    const color = statusColors[profile.plan_status] || statusColors.active;
    const label = statusLabels[profile.plan_status] || 'Unknown';

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
        {label}
      </span>
    );
  };

  const formatTrialEndDate = () => {
    if (!profile?.trial_ends_at) return null;
    const date = new Date(profile.trial_ends_at);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="flex min-h-screen bg-muted">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* Header with MobileNav */}
        <header className="bg-card border-b border-border px-6 py-4 mb-8">
          <div className="flex items-center gap-4">
            <MobileNav />
            <h1 className="font-display text-2xl font-bold text-foreground">
              Account & Billing
            </h1>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto px-6"
        >
          {/* Page Description */}
          <div className="mb-8">
            <p className="text-muted-foreground">
              Manage your account settings and subscription
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-card rounded-2xl shadow-soft border border-border p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {profile?.name || 'User'}
                </h2>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Current Plan Card */}
          <div className="bg-card rounded-2xl shadow-soft border border-border p-6 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Current Plan</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold text-foreground">{planName}</span>
                    {getPlanStatusBadge()}
                  </div>
                </div>
              </div>
            </div>

            {/* Trial Info */}
            {profile?.plan_status === 'trial' && profile?.trial_ends_at && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-700 dark:text-amber-400">
                      Free Trial
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-500">
                      Your trial ends on {formatTrialEndDate()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Upgrade Button */}
            {profile?.plan !== 'business' && (
              <Button
                onClick={() => navigate('/choose-plan')}
                className="w-full"
                variant="outline"
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            )}
          </div>

          {/* Billing Portal Placeholder */}
          <div className="bg-card rounded-2xl shadow-soft border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Billing & Invoices</h3>
                <p className="text-sm text-muted-foreground">Manage payment methods and view invoices</p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-muted-foreground text-sm">
                Billing portal coming soon with Stripe integration
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Account;
