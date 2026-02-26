import { motion } from "framer-motion";
import { Instagram, Twitter, Linkedin, Youtube, Facebook, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const platforms = [
  { icon: Instagram, name: "Instagram", color: "from-pink-500 to-purple-500" },
  { icon: Twitter, name: "Twitter/X", color: "from-blue-400 to-blue-600" },
  { icon: Linkedin, name: "LinkedIn", color: "from-blue-600 to-blue-800" },
  { icon: Youtube, name: "YouTube", color: "from-red-500 to-red-600" },
  { icon: Facebook, name: "Facebook", color: "from-blue-500 to-blue-700" },
];

const plans = [
  {
    name: "Starter",
    price: "₹0",
    period: "/forever",
    description: "Perfect for individuals getting started with analytics",
    gradient: "from-emerald-500 to-teal-500",
    features: [
      "1 social account",
      "Basic analytics dashboard",
      "7-day data history",
      "Weekly email reports",
      "Community support",
    ],
    cta: "Start Free",
  },
  {
    name: "Professional",
    price: "₹399",
    period: "/month",
    description: "Best for creators handling multiple platforms",
    gradient: "from-blue-500 to-cyan-500",
    popular: true,
    features: [
      "Up to 5 social accounts",
      "Advanced AI insights",
      "90-day data history",
      "Custom reports & PDF export",
      "Best posting time analysis",
      "Competitor tracking",
      "AI Voice Coach",
      "Priority email support",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Business",
    price: "₹799",
    period: "/month",
    description: "Built for teams and brand campaigns",
    gradient: "from-violet-500 to-purple-500",
    features: [
      "Unlimited social accounts",
      "Team collaboration (5 seats)",
      "1-year data history",
      "White-label reports",
      "API access",
      "Custom AI training",
      "AI Voice Coach",
      "Hook Detector (VLM)",
      "Dedicated account manager",
      "24/7 priority support",
    ],
    cta: "Start Free Trial",
  },
];

export function IntegrationsSection() {
  const [expandedPlan, setExpandedPlan] = useState<string | null>("Professional");

  return (
    <section className="py-24 bg-dark overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Content */}
          <div className="flex-1">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="font-display text-3xl md:text-4xl font-bold text-white mb-6"
            >
              Trusted partnerships and integrations across leading platforms
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-white/60 mb-8"
            >
              SocialLeaf builds and maintains strong network partnerships to help you
              unify your customer touchpoints and keep pace with changes in the social landscape.
            </motion.p>
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              href="#"
              className="inline-flex items-center text-white font-medium underline underline-offset-4 hover:text-primary transition-colors"
            >
              See all integrations
            </motion.a>
          </div>

          {/* Right - Platform Icons */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {platforms.map((platform, index) => (
                <motion.div
                  key={platform.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="aspect-square flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <platform.icon className="h-8 w-8 text-white/60 group-hover:text-white transition-colors" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-24"
        >
          <h3 className="font-display text-2xl md:text-3xl font-bold text-white text-center mb-4">
            Try free for 30 days – no credit card required
          </h3>
          <p className="text-white/60 text-center mb-12 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade anytime as you grow.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative p-6 rounded-2xl bg-gradient-to-br ${plan.gradient} overflow-hidden`}
              >
                {plan.popular && (
                  <div className="absolute top-3 right-3 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <h4 className="font-display text-2xl font-bold text-white mb-1">
                  {plan.name}
                </h4>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold text-white max-w-[140px] truncate">{plan.price}</span>
                  <span className="text-white/70 text-sm">{plan.period}</span>
                </div>
                <p className="text-white/80 text-sm mb-4">
                  {plan.description}
                </p>

                {/* Expandable Features */}
                <button
                  onClick={() => setExpandedPlan(expandedPlan === plan.name ? null : plan.name)}
                  className="w-full py-3 rounded-xl bg-white/20 text-white font-medium hover:bg-white/30 transition-colors flex items-center justify-between px-4 mb-3"
                >
                  <span>Plan features</span>
                  {expandedPlan === plan.name ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {expandedPlan === plan.name && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2 mb-4"
                  >
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-white/90 text-sm">
                        <Check className="h-4 w-4 text-white" />
                        {feature}
                      </div>
                    ))}
                  </motion.div>
                )}

                <button className="w-full py-3 rounded-xl bg-white text-gray-900 font-semibold hover:bg-white/90 transition-colors">
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
