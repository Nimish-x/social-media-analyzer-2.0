import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Brain,
  Clock,
  FileText,
  Layers,
  Sparkles,
  MessageSquare
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Unified Dashboard",
    description: "Track likes, comments, shares, reach, and engagement rate across all platforms in one view.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Layers,
    title: "Cross-Format Comparison",
    description: "Compare Reels vs Carousels vs Static posts to understand what resonates with your audience.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Brain,
    title: "AI Query Interface",
    description: 'Ask natural questions like "Which post had the highest engagement last month?" and get instant answers.',
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: TrendingUp,
    title: "Automated Insights",
    description: "Receive AI-generated summaries and strategic recommendations to optimize your content.",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: Clock,
    title: "Best Time to Post",
    description: "Discover optimal posting times based on your audience's engagement patterns.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: FileText,
    title: "Exportable Reports",
    description: "Generate comprehensive analysis reports for planning and decision-making.",
    color: "from-indigo-500 to-blue-500",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6"
          >
            Everything you need to{" "}
            <span className="text-gradient">grow your brand</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Powerful analytics tools designed to help creators and businesses understand
            and optimize their social media performance.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-white hover:to-leaf-50/30"
            >
              <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* AI Query Demo */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 relative"
        >
          <div className="bg-dark rounded-3xl p-8 md:p-12 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-leaf-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1">
                <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
                  Ask anything about your analytics
                </h3>
                <p className="text-white/60 mb-6">
                  Our AI-powered query interface understands natural language.
                  Get instant answers without digging through data.
                </p>
                <div className="space-y-3">
                  {[
                    "Which post had the highest engagement?",
                    "What's my best performing content type?",
                    "When should I post for maximum reach?",
                  ].map((query, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10"
                    >
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <span className="text-white/80 text-sm">{query}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-white font-medium">AI Response</span>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Your carousel post from Jan 15 had the highest engagement at
                    <span className="text-primary font-semibold"> 12.4%</span>.
                    It received 2,847 likes, 234 comments, and 156 shares.
                    This is <span className="text-primary font-semibold">3.2x higher</span> than
                    your average engagement rate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
