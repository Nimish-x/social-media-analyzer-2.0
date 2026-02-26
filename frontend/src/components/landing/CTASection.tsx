import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl bg-gradient-to-br from-primary via-leaf-500 to-leaf-600 p-12 md:p-16 overflow-hidden"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">


            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white max-w-3xl mb-6">
              Drive more impact with your social media management tool, now.
            </h2>

            <p className="text-white/80 text-lg max-w-2xl mb-10">
              Join 30,000+ brands and creators who trust SocialLeaf to understand
              their audience and optimize their content strategy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="secondary" size="xl" asChild className="bg-white text-primary hover:bg-white/90">
                <Link to="/sign-up">
                  Get started free
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                <Link to="/how-it-works">
                  See how it works
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
