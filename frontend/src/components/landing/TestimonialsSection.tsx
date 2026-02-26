import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "SocialLeaf has completely transformed how we analyze our content. The AI insights are incredibly accurate and save us hours every week.",
    author: "Sarah Chen",
    role: "Marketing Director at TechFlow",
    stat: "381%",
    statLabel: "increase in engagement",
  },
  {
    quote: "Finally, a tool that understands cross-platform analytics. The comparison features helped us double our reach in just 3 months.",
    author: "Marcus Johnson",
    role: "Content Creator, 500K+ followers",
    stat: "2.4M",
    statLabel: "monthly impressions",
  },
  {
    quote: "The natural language query feature is a game-changer. I can just ask questions and get instant answers about my performance.",
    author: "Emily Rodriguez",
    role: "Social Media Manager at BrandCo",
    stat: "45%",
    statLabel: "time saved on reporting",
  },
];

const brands = [
  "TechFlow", "BrandCo", "MediaPro", "GrowthLabs", "SocialFirst"
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-gradient-mint">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6"
          >
            See why 30,000+ brands scale their social media with SocialLeaf
          </motion.h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-shadow"
            >
              {/* Stat Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground mb-6">
                <span className="text-2xl font-bold">{testimonial.stat}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{testimonial.statLabel}</p>

              {/* Quote */}
              <div className="flex gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-leaf-200 flex items-center justify-center">
                  <span className="text-leaf-700 font-semibold text-sm">
                    {testimonial.author.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Brand Logos */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground"
        >
          {brands.map((brand) => (
            <span key={brand} className="text-lg font-semibold opacity-40 hover:opacity-70 transition-opacity">
              {brand}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
