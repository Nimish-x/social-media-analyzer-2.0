import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Link2,
  BarChart3,
  Lightbulb,
  FileText,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    icon: Link2,
    title: "Connect Your Accounts",
    description: "Link your social media platforms in just a few clicks. We support Instagram, Twitter, LinkedIn, YouTube, Facebook, and more.",
    features: ["One-click OAuth connection", "Secure data handling", "Multi-account support"],
    color: "from-emerald-500 to-teal-500",
  },
  {
    number: "02",
    icon: BarChart3,
    title: "View Unified Analytics",
    description: "See all your metrics in one beautiful dashboard. Track likes, comments, shares, reach, and engagement rate across all platforms.",
    features: ["Real-time data sync", "Cross-platform comparison", "Custom date ranges"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: "03",
    icon: Lightbulb,
    title: "Get AI-Powered Insights",
    description: "Our AI analyzes your data to surface actionable insights. Ask questions in natural language and get instant answers.",
    features: ["Natural language queries", "Trend detection", "Performance predictions"],
    color: "from-violet-500 to-purple-500",
  },
  {
    number: "04",
    icon: FileText,
    title: "Export & Take Action",
    description: "Generate comprehensive reports and implement strategic recommendations to grow your brand presence.",
    features: ["PDF & CSV exports", "Scheduled reports", "Team sharing"],
    color: "from-orange-500 to-amber-500",
  },
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="container mx-auto px-4 py-16 text-center">

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground max-w-4xl mx-auto mb-6"
          >
            From connection to{" "}
            <span className="text-gradient">insights in minutes</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Get started with SocialLeaf in just four simple steps.
            No technical skills required.
          </motion.p>
        </section>

        {/* Steps */}
        <section className="container mx-auto px-4 py-16">
          <div className="space-y-24">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`flex flex-col lg:flex-row items-center gap-12 ${index % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
              >
                {/* Content */}
                <div className="flex-1">
                  <span className="text-6xl font-bold text-leaf-200 font-display">
                    {step.number}
                  </span>
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-4 mb-4">
                    {step.title}
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    {step.description}
                  </p>
                  <ul className="space-y-3">
                    {step.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual */}
                <div className="flex-1 w-full">
                  <div className={`aspect-video rounded-2xl bg-gradient-to-br ${step.color} p-8 flex items-center justify-center`}>
                    <div className="bg-white/20 backdrop-blur-xl rounded-xl p-8">
                      <step.icon className="h-16 w-16 text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to get started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of creators and brands who trust SocialLeaf
              for their social media analytics.
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/sign-up">
                Start free trial
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;
