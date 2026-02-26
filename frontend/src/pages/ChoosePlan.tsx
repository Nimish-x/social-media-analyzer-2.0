import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, Crown, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthContext";
import { PLAN_DISPLAY_NAMES, PLAN_PRICES, PlanType } from "@/lib/planPermissions";
import LeafLoader from "@/components/LeafLoader";
import OnboardingModal from "@/components/dashboard/OnboardingModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const plans = [
  {
    id: 'starter' as PlanType,
    name: 'Starter',
    price: 0,
    period: '/forever',
    description: 'Perfect for individuals getting started with analytics',
    icon: Sparkles,
    gradient: 'from-emerald-400 to-teal-500',
    features: [
      '1 social account',
      'Basic analytics dashboard',
      '7-day data history',
      'Weekly email reports',
      'Community support',
    ],
    cta: 'Start Free',
  },
  {
    id: 'professional' as PlanType,
    name: 'Professional',
    price: 399,
    period: '/month',
    description: 'Best for creators handling multiple platforms',
    icon: Rocket,
    gradient: 'from-cyan-400 to-blue-500',
    popular: true,
    features: [
      'Up to 5 social accounts',
      'Advanced AI insights',
      '90-day data history',
      'Custom reports & PDF export',
      'Best posting time analysis',
      'Competitor tracking',
      'AI Voice Coach',
      'Priority email support',
    ],
    cta: 'Start Free Trial',
  },
  {
    id: 'business' as PlanType,
    name: 'Business',
    price: 799,
    period: '/month',
    description: 'Built for teams and brand campaigns',
    icon: Crown,
    gradient: 'from-purple-400 to-violet-500',
    features: [
      'Unlimited social accounts',
      'Team collaboration (5 seats)',
      '1-year data history',
      'White-label reports',
      'API access',
      'Custom AI training',
      'AI Voice Coach',
      'Hook Detector (VLM)',
      'Dedicated account manager',
      '24/7 priority support',
    ],
    cta: 'Start Free Trial',
  },
];

const ChoosePlan = () => {
  const navigate = useNavigate();
  const { session, refreshProfile, profile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [loaderDestination, setLoaderDestination] = useState<string>('/dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [showConnectPrompt, setShowConnectPrompt] = useState(false);
  const [hasSkipped, setHasSkipped] = useState(false);

  // Check if user needs onboarding
  useEffect(() => {
    // Only show if not completed AND not skipped in this session
    if (profile && !profile.onboarding_completed && !hasSkipped) {
      setShowOnboarding(true);
    }
  }, [profile, hasSkipped]); // Re-evaluate if profile refreshes, but check hasSkipped

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    // Refresh profile to get updated onboarding status
    await refreshProfile();
  };

  const handleOnboardingSkip = () => {
    setHasSkipped(true);
    setShowOnboarding(false);
  };

  const handleSelectPlan = async (planId: PlanType) => {
    setSelectedPlan(planId);
    setIsLoading(true);

    try {
      if (planId === 'starter') {
        // Save starter plan to backend
        const response = await fetch(`${API_URL}/api/users/me/plan`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ plan: planId }),
        });

        if (!response.ok) {
          throw new Error('Failed to save plan');
        }

        // Refresh profile to get updated plan
        await refreshProfile();

        // Stop loading and show connect prompt for starter plan
        setIsLoading(false);
        setShowConnectPrompt(true);

      } else {
        // Stripe Checkout for paid plans (Professional/Business)
        const response = await fetch(`${API_URL}/api/payment/create-checkout-session`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ plan_id: planId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to initiate checkout');
        }

        const data = await response.json();
        if (data.url) {
          // Redirect to Stripe Checkout for payment
          window.location.href = data.url;
        } else {
          throw new Error('No checkout URL received');
        }
      }

    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to process request. Please try again.');
      setIsLoading(false);
    }
  };

  const handleConnectPromptResult = (connect: boolean) => {
    setShowConnectPrompt(false);

    // Determine destination (only for starter plan)
    const dest = connect ? '/connect-accounts' : '/dashboard';

    setLoaderDestination(dest);
    setShowLoader(true);
  };

  const handleLoaderComplete = () => {
    if (selectedPlan === 'starter') {
      toast.success('Welcome to SocialLeaf! Enjoy your Starter plan.');
      navigate(loaderDestination);
    } else {
      toast.success(`${PLAN_DISPLAY_NAMES[selectedPlan!]} plan selected!`);
      // Pass the plan state if going to payment
      navigate(loaderDestination, { state: { plan: selectedPlan } });
    }
  };

  // Show onboarding modal first
  if (showOnboarding) {
    return (
      <OnboardingModal
        open={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  // Show Connect Accounts Prompt
  if (showConnectPrompt) {
    return (
      <Dialog open={showConnectPrompt} onOpenChange={() => { }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Processing Payment</DialogTitle>
            <DialogDescription>
              Please wait while we process your secure payment.
            </DialogDescription>
          </DialogHeader>
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-display">Connect your social accounts?</DialogTitle>
            <DialogDescription className="text-center">
              Start tracking analytics immediately by connecting your platforms now.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex justify-center gap-4 text-primary">
              {/* Simple icons visual */}
              <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full bg-pink-500 flex items-center justify-center border-2 border-background z-10">
                  <span className="text-white text-[10px] font-bold">IG</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center border-2 border-background z-20">
                  <span className="text-white text-[10px] font-bold">YT</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center border-2 border-background z-30">
                  <span className="text-white text-[10px] font-bold">LI</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button
              className="w-full bg-primary"
              size="lg"
              onClick={() => handleConnectPromptResult(true)}
            >
              Connect Accounts
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => handleConnectPromptResult(false)}
            >
              Skip for now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Show loader if active
  if (showLoader) {
    return (
      <LeafLoader
        onComplete={handleLoaderComplete}
        duration={5000}
        message={selectedPlan === 'starter' ? 'Setting up your workspace...' : 'Preparing your trial...'}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl font-bold text-foreground mb-4">
            Choose the plan that fits your needs
          </h1>
          <p className="text-lg text-muted-foreground">
            Upgrade anytime as you grow.
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-6 bg-gradient-to-br ${plan.gradient} text-white shadow-xl`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-bold">₹{plan.price}</span>
                  <span className="text-white/80">{plan.period}</span>
                </div>
                <p className="text-sm text-white/80 mt-2">{plan.description}</p>
              </div>

              {/* Features accordion - simplified to always show */}
              <div className="mb-6 bg-white/10 rounded-xl p-4">
                <h4 className="font-semibold mb-3">Plan features</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isLoading && selectedPlan === plan.id}
                className="w-full bg-white text-gray-900 hover:bg-white/90 font-semibold"
              >
                {isLoading && selectedPlan === plan.id ? 'Processing...' : plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Skip link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <button
            onClick={() => handleSelectPlan('starter')}
            className="text-muted-foreground hover:text-foreground text-sm underline"
          >
            Continue with free Starter plan
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ChoosePlan;
