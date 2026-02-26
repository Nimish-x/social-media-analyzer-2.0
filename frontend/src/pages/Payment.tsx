import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { CreditCard, Check, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthContext";
import { PLAN_DISPLAY_NAMES, PLAN_PRICES, PlanType } from "@/lib/planPermissions";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const plan = (location.state as { plan?: PlanType })?.plan || 'professional';
  const planInfo = PLAN_PRICES[plan as PlanType];
  const planName = PLAN_DISPLAY_NAMES[plan as PlanType];

  const handleCompletePayment = async () => {
    // Simulated payment - just navigate to dashboard
    toast.success(`${planName} plan activated! Enjoy your 7-day free trial.`);
    await refreshProfile();
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate('/choose-plan');
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleGoBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to plans
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-elevated p-8 border border-border"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Complete Your Purchase
            </h1>
            <p className="text-muted-foreground">
              Start your 7-day free trial of {planName}
            </p>
          </div>

          {/* Plan Summary */}
          <div className="bg-muted/50 rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-foreground">{planName} Plan</h3>
                <p className="text-sm text-muted-foreground">Billed monthly after trial</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">₹{planInfo.amount}</p>
                <p className="text-sm text-muted-foreground">/{planInfo.period}</p>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary" />
                <span>7-day free trial included</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary" />
                <span>Cancel anytime during trial</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary" />
                <span>No charge until trial ends</span>
              </div>
            </div>
          </div>

          {/* Payment Form Placeholder */}
          <div className="mb-8">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-700 dark:text-amber-400">
                    Payment processing coming soon
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-500">
                    For now, click below to activate your free trial. Stripe integration will be added later.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={handleCompletePayment}
            variant="hero"
            size="lg"
            className="w-full"
          >
            Start Free Trial
          </Button>

          {/* Security note */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            <Shield className="inline h-3 w-3 mr-1" />
            Secure payment powered by Stripe (coming soon)
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Payment;
