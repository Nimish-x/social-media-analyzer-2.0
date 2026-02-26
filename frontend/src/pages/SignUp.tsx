import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Leaf, Mail, Lock, ArrowRight, Eye, EyeOff, User, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthContext";

const benefits = [
  "AI-powered analytics insights",
  "Cross-platform performance tracking",
  "Natural language query interface",
  "Exportable reports & recommendations",
];

const SignUp = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(email, password, name);

      if (error) {
        toast.error(error.message || "Failed to create account");
        return;
      }

      toast.success("Account created successfully!");
      navigate("/choose-plan");
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />

      <main className="pt-24 pb-16 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:block"
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Start your free trial
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join 30,000+ brands and creators who use SocialLeaf to grow their social presence.
            </p>

            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.li
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-foreground">{benefit}</span>
                </motion.li>
              ))}
            </ul>

            <div className="mt-12 p-6 rounded-2xl bg-card border border-border">
              <p className="text-foreground italic mb-4">
                "SocialLeaf transformed how we analyze our content. The AI insights are incredibly accurate."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-leaf-200 flex items-center justify-center">
                  <span className="text-leaf-700 font-semibold text-sm">SC</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Sarah Chen</p>
                  <p className="text-sm text-muted-foreground">Marketing Director, TechFlow</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-card rounded-2xl shadow-elevated p-8 border border-border">
              {/* Logo */}
              <div className="flex justify-center mb-8">
                <Link to="/" className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-soft">
                    <Leaf className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="font-display text-2xl font-bold text-foreground">
                    Social<span className="text-primary">Leaf</span>
                  </span>
                </Link>
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                  Create your account
                </h1>
                <p className="text-muted-foreground">
                  7-day free trial • No credit card required
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      disabled={isLoading}
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create account"}
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>

              {/* Sign in link */}
              <p className="mt-8 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/sign-in" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>

              {/* Terms */}
              <p className="mt-4 text-center text-xs text-muted-foreground">
                By creating an account, you agree to our{" "}
                <a href="#" className="underline hover:text-foreground">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="underline hover:text-foreground">Privacy Policy</a>
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SignUp;
