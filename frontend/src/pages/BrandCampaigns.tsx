import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Target,
  Users,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const benefits = [
  {
    icon: Target,
    title: "Find Brand-Safe Creators",
    description: "Discover creators by topic who align with your brand values and audience.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Users,
    title: "Audience Alignment Check",
    description: "See if a creator's audience matches your target demographics.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: TrendingUp,
    title: "End-to-End Campaign Management",
    description: "Manage campaigns from discovery to reporting in one platform.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: BarChart3,
    title: "Measure Performance",
    description: "Track EMV, reach, engagement, and ROI across all campaigns.",
    color: "from-orange-500 to-amber-500",
  },
];

const stats = [
  { value: "381%", label: "Average increase in engagement" },
  { value: "₹476K", label: "Average EMV per campaign" },
  { value: "1.9M", label: "Average views per campaign" },
];

const BrandCampaigns = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        {/* Hero */}
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-mint/30">
          <div className="absolute inset-0">
            <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 w-80 h-80 bg-leaf-200/50 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 py-24 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              {/* Left Content */}
              <div className="flex-1 max-w-2xl">

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="font-display text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight"
                >
                  Launch, run & scale{" "}
                  <span className="text-primary">creator campaigns</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-xl text-muted-foreground mb-10 leading-relaxed"
                >
                  Our AI-powered influencer marketing tools help you build creator
                  campaigns based on the topics your audience engages with most.
                </motion.p>

                {/* Benefits */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="space-y-5 mb-10"
                >
                  {benefits.map((benefit) => (
                    <div key={benefit.title} className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary mt-0.5 shrink-0" />
                      <div>
                        <h3 className="font-bold text-foreground text-lg">{benefit.title}</h3>
                        <p className="text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-14 text-lg font-medium" asChild>
                    <Link to="/sign-up">
                      See the product
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Link>
                  </Button>
                </motion.div>
              </div>

              {/* Right Visual */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex-1 w-full"
              >
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-border/50 relative">
                  {/* Decorative background blob */}
                  <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-primary/5 to-leaf-200/20 blur-3xl rounded-full" />

                  <div className="flex items-start gap-6 mb-8">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shrink-0">
                      <span className="text-4xl">👤</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-display font-bold text-xl text-foreground">Brand Fit Score</h3>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="h-3 flex-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full w-[82%] bg-primary rounded-full" />
                        </div>
                        <span className="text-lg font-bold text-primary">82%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="p-6 rounded-2xl bg-slate-50">
                      <p className="text-sm font-medium text-slate-500 mb-1">EMV</p>
                      <p className="text-2xl font-bold text-slate-900">₹476,697</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-slate-50">
                      <p className="text-sm font-medium text-slate-500 mb-1">Views</p>
                      <p className="text-2xl font-bold text-slate-900">1,917,655</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-slate-500 font-medium ml-2">Top 5%</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-dark py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-4xl md:text-5xl font-bold text-primary mb-2">
                    {stat.value}
                  </p>
                  <p className="text-white/60">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6"
            >
              Everything you need for{" "}
              <span className="text-gradient">successful campaigns</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-muted-foreground"
            >
              From creator discovery to performance measurement,
              we've got you covered.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative p-6 rounded-3xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-white hover:to-leaf-50/30"
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${benefit.color} mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-primary to-leaf-600 rounded-3xl p-12 text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to launch your next campaign?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Start your free trial and discover how SocialLeaf can help you
              find the right creators and measure campaign success.
            </p>
            <Button variant="secondary" size="xl" asChild className="bg-white text-primary hover:bg-white/90">
              <Link to="/sign-up">
                Get started free
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

export default BrandCampaigns;
