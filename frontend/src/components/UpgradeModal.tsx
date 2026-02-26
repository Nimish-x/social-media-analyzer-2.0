import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lock, Sparkles, X, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeatureType, getRequiredPlan, PLAN_DISPLAY_NAMES } from "@/lib/planPermissions";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: FeatureType;
  currentPlan: string;
}

const featureInfo: Record<FeatureType, { name: string; benefits: string[] }> = {
  voiceCoach: {
    name: 'AI Voice Coach',
    benefits: [
      'Analyze your scripts with AI',
      'Generate high-retention hooks',
      'Text-to-speech preview',
      'Improve content engagement',
    ],
  },
  vlm: {
    name: 'Hook Detector',
    benefits: [
      'AI-powered video analysis',
      'Find the best hook moments',
      'Vision language model technology',
      'Optimize video performance',
    ],
  },
  createPost: {
    name: 'AI Post Generator',
    benefits: [
      'Generate captions from images',
      'AI-optimized hashtags',
      'Call-to-Action suggestions',
      'Auto-scheduling',
    ],
  },
};

const UpgradeModal = ({ isOpen, onClose, feature, currentPlan }: UpgradeModalProps) => {
  const navigate = useNavigate();
  const info = featureInfo[feature];
  const requiredPlan = getRequiredPlan(feature);
  const requiredPlanName = PLAN_DISPLAY_NAMES[requiredPlan];

  const handleUpgrade = () => {
    onClose();
    navigate('/choose-plan');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-card rounded-2xl shadow-elevated border border-border overflow-hidden w-full max-w-md pointer-events-auto">
              {/* Header with gradient */}
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      Unlock {info.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Available on {requiredPlanName} and above
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-muted-foreground mb-4">
                  Upgrade your plan to access this premium feature:
                </p>

                {/* Benefits list */}
                <div className="bg-muted/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground">What you'll get</span>
                  </div>
                  <ul className="space-y-2">
                    {info.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Current plan info */}
                <p className="text-xs text-muted-foreground mb-4 text-center">
                  Your current plan: <span className="font-medium">{PLAN_DISPLAY_NAMES[currentPlan as keyof typeof PLAN_DISPLAY_NAMES] || 'Starter'}</span>
                </p>

                {/* CTA */}
                <Button
                  onClick={handleUpgrade}
                  variant="hero"
                  size="lg"
                  className="w-full"
                >
                  Upgrade to {requiredPlanName}
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <button
                  onClick={onClose}
                  className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;
