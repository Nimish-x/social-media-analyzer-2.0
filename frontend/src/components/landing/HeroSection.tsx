import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Instagram, Linkedin, Twitter, Facebook, TrendingUp, Zap, BarChart3, Leaf } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden pt-16 flex items-center">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-leaf-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-leaf-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left pt-10 lg:pt-0">


            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 leading-tight"
            >
              Powerful tools for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-leaf-600">
                social media
              </span>{" "}
              management
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Consolidate all your social analytics in one dashboard. Get AI-driven insights,
              compare content formats, and discover the best time to post.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <div className="flex items-center bg-white rounded-full shadow-lg p-1.5 pl-6 border border-leaf-100 w-full sm:w-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-transparent outline-none text-sm min-w-[200px]"
                />
                <Button variant="hero" size="lg" className="rounded-full px-6" asChild>
                  <Link to="/sign-up">
                    Try free
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2 sm:mt-0">
                No credit card required
              </p>
            </motion.div>
          </div>

          {/* Visual Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex-1 w-full relative min-h-[500px] flex items-center justify-center"
          >
            {/* Central Hub */}
            <div className="relative z-20 w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center border border-leaf-100">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-leaf-500 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-inner">
                <Leaf className="w-10 h-10 text-white" />
              </div>
              {/* Ripple effects */}
              <div className="absolute inset-0 rounded-3xl border-2 border-primary/20 animate-ping-slow" />
              <div className="absolute -inset-4 rounded-[2.5rem] border border-primary/10" />
            </div>

            {/* Connecting Lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(34, 197, 94, 0.1)" />
                  <stop offset="50%" stopColor="rgba(34, 197, 94, 0.4)" />
                  <stop offset="100%" stopColor="rgba(34, 197, 94, 0.1)" />
                </linearGradient>
              </defs>
              {/* Lines to icons */}
              <motion.path
                d="M50 50 L20 25"
                stroke="url(#lineGradient)"
                strokeWidth="0.5"
                fill="none"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
              <motion.path
                d="M50 50 L80 20"
                stroke="url(#lineGradient)"
                strokeWidth="0.5"
                fill="none"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.6 }}
              />
              <motion.path
                d="M50 50 L85 60"
                stroke="url(#lineGradient)"
                strokeWidth="0.5"
                fill="none"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.7 }}
              />
              <motion.path
                d="M50 50 L25 70"
                stroke="url(#lineGradient)"
                strokeWidth="0.5"
                fill="none"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.8 }}
              />
            </svg>

            {/* Floating Icons */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[20%] left-[15%] md:left-[20%] bg-white p-3 rounded-2xl shadow-lg border border-blue-100"
            >
              <Linkedin className="w-8 h-8 text-[#0077b5]" />
            </motion.div>

            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-[15%] right-[15%] md:right-[20%] bg-white p-3 rounded-2xl shadow-lg border border-pink-100"
            >
              <Instagram className="w-8 h-8 text-[#E4405F]" />
            </motion.div>

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-[35%] right-[10%] md:right-[15%] bg-white p-3 rounded-2xl shadow-lg border border-sky-100"
            >
              <Twitter className="w-8 h-8 text-[#1DA1F2]" />
            </motion.div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="absolute bottom-[25%] left-[20%] md:left-[25%] bg-white p-3 rounded-2xl shadow-lg border border-blue-100"
            >
              <Facebook className="w-8 h-8 text-[#1877F2]" />
            </motion.div>

            {/* Floating Metric Cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="absolute top-[10%] left-[5%] md:left-0 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 max-w-[160px]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-rose-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Impressions</p>
                  <p className="text-lg font-bold">437K</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
              className="absolute top-[30%] right-0 md:-right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50"
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <p className="text-xs font-semibold text-muted-foreground">AI Insight</p>
              </div>
              <p className="text-sm font-medium">Reels perform 3.2x better 📈</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="absolute bottom-[10%] left-[10%] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Engagement Rate</p>
                  <p className="text-xl font-bold text-emerald-600">+82%</p>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
