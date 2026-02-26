import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

interface OnboardingData {
  user_type: string;
  primary_platforms: string[];
  content_formats: string[];
  primary_goals: string[];
  posting_frequency: string;
  experience_level: string;
}

const USER_TYPES = [
  { value: 'creator', label: 'Creator', icon: '🎨', description: 'Individual content creator' },
  { value: 'business', label: 'Business', icon: '🏢', description: 'Brand or company' },
  { value: 'agency', label: 'Agency', icon: '🚀', description: 'Marketing or creative agency' },
];

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'x', label: 'X (Twitter)', icon: '🐦' },
  { value: 'youtube', label: 'YouTube', icon: '📹' },
];

const CONTENT_FORMATS = [
  { value: 'reels', label: 'Reels/Shorts', icon: '🎬' },
  { value: 'carousels', label: 'Carousels', icon: '🎠' },
  { value: 'static', label: 'Static Posts', icon: '🖼️' },
  { value: 'long_video', label: 'Long-form Video', icon: '🎥' },
  { value: 'text', label: 'Text/Articles', icon: '📝' },
];

const GOALS = [
  { value: 'reach', label: 'Increase reach & impressions', icon: '📈' },
  { value: 'engagement', label: 'Improve engagement rate', icon: '❤️' },
  { value: 'followers', label: 'Grow followers', icon: '👥' },
  { value: 'conversions', label: 'Drive conversions/sales', icon: '💰' },
  { value: 'awareness', label: 'Build brand awareness', icon: '🌟' },
  { value: 'competitor', label: 'Analyze competitor performance', icon: '🔍' },
];

const POSTING_FREQUENCIES = [
  { value: 'daily', label: 'Daily', icon: '📅' },
  { value: '3-5_week', label: '3-5 times/week', icon: '📆' },
  { value: 'weekly', label: 'Weekly', icon: '🗓️' },
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'Just getting started' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
  { value: 'advanced', label: 'Advanced', description: 'Expert level' },
];

const OnboardingModal = ({ open, onComplete, onSkip }: OnboardingModalProps) => {
  const { session } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Force open state if not provided (though parent controls it)
  // const [isOpen, setIsOpen] = useState(open);
  const [formData, setFormData] = useState<OnboardingData>({
    user_type: '',
    primary_platforms: [],
    content_formats: [],
    primary_goals: [],
    posting_frequency: '',
    experience_level: '',
  });

  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/users/me/onboarding`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save onboarding preferences');
      }

      toast.success('Preferences saved! Let\'s choose your plan.');
      onComplete();
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleArrayValue = (field: keyof OnboardingData, value: string, maxSelections?: number) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : maxSelections && currentArray.length >= maxSelections
        ? currentArray
        : [...currentArray, value];

    setFormData({ ...formData, [field]: newArray });
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.user_type !== '';
      case 2:
        return formData.primary_platforms.length > 0 && formData.content_formats.length > 0;
      case 3:
        return formData.primary_goals.length > 0 && formData.posting_frequency !== '' && formData.experience_level !== '';
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => { }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Welcome to SocialLeaf! 🌿
              </DialogTitle>
              <DialogDescription className="mt-1">
                Let's personalize your experience
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </Button>
          </div>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 my-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${s === step ? 'w-8 bg-gradient-to-r from-emerald-500 to-teal-500' :
                s < step ? 'w-2 bg-emerald-500' : 'w-2 bg-gray-300'
                }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Step 1: User Type */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">What best describes you?</h3>
                  <p className="text-sm text-muted-foreground">This helps us tailor your experience</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {USER_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setFormData({ ...formData, user_type: type.value })}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${formData.user_type === type.value
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                        : 'border-gray-200 hover:border-emerald-300'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{type.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold">{type.label}</div>
                          <div className="text-sm text-muted-foreground">{type.description}</div>
                        </div>
                        {formData.user_type === type.value && (
                          <Check className="h-5 w-5 text-emerald-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Platforms & Content */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Which platforms do you use?</h3>
                  <p className="text-sm text-muted-foreground mb-4">Select all that apply</p>
                  <div className="grid grid-cols-2 gap-3">
                    {PLATFORMS.map((platform) => (
                      <button
                        key={platform.value}
                        onClick={() => toggleArrayValue('primary_platforms', platform.value)}
                        className={`p-3 rounded-lg border-2 transition-all ${formData.primary_platforms.includes(platform.value)
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                          : 'border-gray-200 hover:border-emerald-300'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{platform.icon}</span>
                          <span className="font-medium">{platform.label}</span>
                          {formData.primary_platforms.includes(platform.value) && (
                            <Check className="h-4 w-4 text-emerald-500 ml-auto" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">What content formats do you create?</h3>
                  <p className="text-sm text-muted-foreground mb-4">Select all that apply</p>
                  <div className="grid grid-cols-2 gap-3">
                    {CONTENT_FORMATS.map((format) => (
                      <button
                        key={format.value}
                        onClick={() => toggleArrayValue('content_formats', format.value)}
                        className={`p-3 rounded-lg border-2 transition-all ${formData.content_formats.includes(format.value)
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                          : 'border-gray-200 hover:border-emerald-300'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{format.icon}</span>
                          <span className="font-medium text-sm">{format.label}</span>
                          {formData.content_formats.includes(format.value) && (
                            <Check className="h-4 w-4 text-emerald-500 ml-auto" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Goals & Activity */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">What are your primary goals?</h3>
                  <p className="text-sm text-muted-foreground mb-4">Select up to 2</p>
                  <div className="grid grid-cols-1 gap-2">
                    {GOALS.map((goal) => (
                      <button
                        key={goal.value}
                        onClick={() => toggleArrayValue('primary_goals', goal.value, 2)}
                        disabled={!formData.primary_goals.includes(goal.value) && formData.primary_goals.length >= 2}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${formData.primary_goals.includes(goal.value)
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                          : 'border-gray-200 hover:border-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{goal.icon}</span>
                          <span className="font-medium text-sm">{goal.label}</span>
                          {formData.primary_goals.includes(goal.value) && (
                            <Check className="h-4 w-4 text-emerald-500 ml-auto" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">How often do you post?</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {POSTING_FREQUENCIES.map((freq) => (
                      <button
                        key={freq.value}
                        onClick={() => setFormData({ ...formData, posting_frequency: freq.value })}
                        className={`p-3 rounded-lg border-2 transition-all ${formData.posting_frequency === freq.value
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                          : 'border-gray-200 hover:border-emerald-300'
                          }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-1">{freq.icon}</div>
                          <div className="font-medium text-xs">{freq.label}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">What's your experience level?</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {EXPERIENCE_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setFormData({ ...formData, experience_level: level.value })}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${formData.experience_level === level.value
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                          : 'border-gray-200 hover:border-emerald-300'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{level.label}</div>
                            <div className="text-sm text-muted-foreground">{level.description}</div>
                          </div>
                          {formData.experience_level === level.value && (
                            <Check className="h-5 w-5 text-emerald-500" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="text-sm text-muted-foreground">
            Step {step} of {totalSteps}
          </div>

          <Button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            {step === totalSteps ? (
              isSubmitting ? 'Saving...' : (
                <>
                  Complete <Sparkles className="h-4 w-4" />
                </>
              )
            ) : (
              <>
                Next <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
