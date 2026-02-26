import { Link, useLocation, useNavigate } from "react-router-dom";
import { Leaf, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "How It Works", href: "/how-it-works" },
  { name: "Brand Campaigns", href: "/brand-campaigns" },
  { name: "Dashboard", href: "/dashboard", protected: true },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem("isAuthenticated") === "true";
      setIsAuthenticated(auth);

      if (auth) {
        const userStr = localStorage.getItem("currentUser");
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserName(user.name || "User");
        }
      }
    };

    checkAuth();
    // Check auth on route change
  }, [location]);

  const handleSignOut = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("currentUser");
    setIsAuthenticated(false);
    setUserName("User");
    navigate("/");
  };

  const filteredLinks = navLinks.filter(link =>
    !link.protected || (link.protected && isAuthenticated)
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-soft">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              Social<span className="text-primary">Leaf</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {filteredLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span>{userName}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/sign-in">Log in</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/sign-up">Try for free</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {filteredLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm font-medium py-2 transition-colors hover:text-primary ${location.pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                    }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-2 py-2 text-sm font-medium text-foreground">
                      <User className="h-4 w-4 text-primary" />
                      <span>{userName}</span>
                    </div>
                    <Button variant="ghost" onClick={() => { handleSignOut(); setIsOpen(false); }} className="justify-start text-muted-foreground hover:text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild>
                      <Link to="/sign-in" onClick={() => setIsOpen(false)}>
                        Log in
                      </Link>
                    </Button>
                    <Button variant="hero" asChild>
                      <Link to="/sign-up" onClick={() => setIsOpen(false)}>
                        Try for free
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
