import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthContext";
import { SocialDataProvider } from "@/contexts/SocialDataContext";
import Index from "./pages/Index";
import HowItWorks from "./pages/HowItWorks";
import BrandCampaigns from "./pages/BrandCampaigns";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ConnectAccounts from "./pages/ConnectAccounts";
import Dashboard from "./pages/Dashboard";
import CreatePost from "./pages/CreatePost";
import Analytics from "./pages/Analytics";
import Performance from "./pages/Performance";
import Audience from "./pages/Audience";
import Settings from "./pages/Settings";
import VoiceCoach from "./pages/VoiceCoach";
import HookDetector from "./pages/HookDetector";
import ChoosePlan from "./pages/ChoosePlan";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import Account from "./pages/Account";
import CompetitorSpy from "./pages/CompetitorSpy";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminUsers from "./pages/admin/AdminUsers";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <AuthProvider>
        <SocialDataProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/brand-campaigns" element={<BrandCampaigns />} />
                <Route path="/sign-in" element={<SignIn />} />
                <Route path="/sign-up" element={<SignUp />} />
                <Route path="/connect-accounts" element={<ConnectAccounts />} />

                {/* Plan selection (protected but allows no plan) */}
                <Route
                  path="/choose-plan"
                  element={
                    <ProtectedRoute>
                      <ChoosePlan />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment"
                  element={
                    <ProtectedRoute>
                      <Payment />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment/success"
                  element={
                    <ProtectedRoute>
                      <PaymentSuccess />
                    </ProtectedRoute>
                  }
                />

                {/* Protected routes (require auth + plan) */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-post"
                  element={
                    <ProtectedRoute>
                      <CreatePost />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/performance"
                  element={
                    <ProtectedRoute>
                      <Performance />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/audience"
                  element={
                    <ProtectedRoute>
                      <Audience />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/voice-coach"
                  element={
                    <ProtectedRoute>
                      <VoiceCoach />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hook-detector"
                  element={
                    <ProtectedRoute>
                      <HookDetector />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <Account />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/competitor-spy"
                  element={
                    <ProtectedRoute>
                      <CompetitorSpy />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute>
                      <AdminAnalytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute>
                      <AdminSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute>
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SocialDataProvider>
      </AuthProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
