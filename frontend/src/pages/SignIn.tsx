import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Leaf, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/lib/supabase";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get redirect destination from location state
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        // Handle specific error messages
        if (error.message?.includes('Email not confirmed')) {
          toast.error("Please check your email and confirm your account before signing in.");
        } else if (error.message?.includes('Invalid login credentials')) {
          toast.error("Invalid email or password. Please try again.");
        } else {
          toast.error(error.message || "Sign in failed. Please try again.");
        }
        return;
      }

      toast.success("Welcome back!");

      // Check if user is admin and redirect accordingly
      // We need to fetch the profile or check the role returned if available
      // Since signIn doesn't return the profile directly in this context structure,
      // we might need to rely on the auth context state updating or fetch it.
      // However, AuthContext state updates might be async.
      // For now, let's try to redirect to dashboard which should handle it? 
      // User asked for "directly admin page".

      // Let's inspect the returned data if we can, or just redirect.
      // Better approach: Let's use the profile from AuthContext, but it might be stale 
      // immediately after signIn call returns.
      // safer to fetch profile here or let dashboard redirect. 
      // But let's try to be smart.

      // Actually, let's fetch the profile quickly to decide.

      // Safer admin check
      try {
        console.log("Debug: Checking supabase instance", supabase);
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Debug: Session user", session?.user);

        if (session?.user) {
          console.log("Debug: Fetching profile for role check");
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.warn("Debug: Profile fetch error", profileError);
          }

          if (profile?.role === 'admin') {
            navigate("/admin/analytics", { replace: true });
            return;
          }
        }
      } catch (checkError) {
        console.warn("Admin role check failed, proceeding to dashboard:", checkError);
      }

      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login process error:", err);
      toast.error("An error occurred. Please check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />

      <main className="pt-24 pb-16 min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
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
                Welcome back
              </h1>
              <p className="text-muted-foreground">
                Sign in to your account to continue
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="#"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
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
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            {/* Sign up link */}
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/sign-up" className="text-primary font-medium hover:underline">
                Sign up for free
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default SignIn;
