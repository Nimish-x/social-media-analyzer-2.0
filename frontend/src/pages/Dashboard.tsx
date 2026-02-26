import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import { useSocialData } from "@/contexts/SocialDataContext";
import {
  Leaf,
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Users,
  Settings,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  MessageSquare,
  Send,
  Sparkles,
  Calendar,
  Download,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Megaphone,
  ArrowRight,
  Loader2,
  X,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { useAuth } from "@/components/auth/AuthContext";
import api from "@/services/api";
import { generateDashboardPDF } from "@/lib/pdfGenerator";
import { toast } from "sonner";
import { API_BASE_URL } from "@/services/api";

const engagementData = [
  { name: "Jan", instagram: 4000, twitter: 2400, linkedin: 1800 },
  { name: "Feb", instagram: 3000, twitter: 1398, linkedin: 2200 },
  { name: "Mar", instagram: 5000, twitter: 4800, linkedin: 2900 },
  { name: "Apr", instagram: 2780, twitter: 3908, linkedin: 2000 },
  { name: "May", instagram: 6890, twitter: 4800, linkedin: 3181 },
  { name: "Jun", instagram: 8390, twitter: 3800, linkedin: 2500 },
  { name: "Jul", instagram: 7490, twitter: 4300, linkedin: 3100 },
];

const contentTypeData = [
  { name: "Reels", value: 45, color: "hsl(142, 71%, 45%)" },
  { name: "Carousels", value: 30, color: "hsl(200, 80%, 50%)" },
  { name: "Static", value: 15, color: "hsl(280, 60%, 50%)" },
  { name: "Stories", value: 10, color: "hsl(35, 90%, 55%)" },
];

const recentPosts = [
  { id: 1, platform: "instagram", title: "Product Launch Carousel", likes: 2847, comments: 234, shares: 156 },
  { id: 2, platform: "twitter", title: "Industry Insights Thread", likes: 1234, comments: 89, shares: 456 },
  { id: 3, platform: "linkedin", title: "Company Culture Post", likes: 892, comments: 67, shares: 123 },
  { id: 4, platform: "instagram", title: "Behind the Scenes Reel", likes: 3456, comments: 345, shares: 234 },
];

const aiInsights = [];

import { ConnectAccountsModal } from "@/components/dashboard/ConnectAccountsModal";
import { FeaturedChannels } from "@/components/dashboard/FeaturedChannels";

const Dashboard = () => {
  const navigate = useNavigate();
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showTomorrowTip, setShowTomorrowTip] = useState(false);
  const [tomorrowRecommendation, setTomorrowRecommendation] = useState<string | null>(null);
  const [loadingTip, setLoadingTip] = useState(false);
  const [showIdeas, setShowIdeas] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("all");

  const [userName, setUserName] = useState("User");
  const [userInitials, setUserInitials] = useState("U");
  const { profile } = useAuth();

  // Dashboard data from API
  const [dashboardData, setDashboardData] = useState<{
    overview: { total_impressions: number; engagement_rate: number; total_comments: number; total_shares: number; growth_rate: number };
    insights: Array<{ type: string; summary: string }>;
    recommendations: Array<{ type: string; content: string; priority: number }>;
  } | null>(null);

  // Use shared social data context instead of local fetching
  const {
    youtubeData: realYoutubeData,
    instagramData: realInstagramData,
    connections,
    isLoading: contextLoading,
    formatNumber,
    unifiedMetrics,
    engagementTrends,
    isYoutubeLoading,
    isInstagramLoading
  } = useSocialData();

  const isLoading = contextLoading;

  useEffect(() => {
    const hasConnected = localStorage.getItem("hasConnectedAccounts");
    if (!hasConnected) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => setShowConnectModal(true), 500);
      return () => clearTimeout(timer);
    }

    if (profile?.role === 'admin') {
      navigate('/admin/analytics');
      return;
    }


    // Get user data from profile (source of truth) or fallback to localStorage
    if (profile?.name) {
      setUserName(profile.name);
      const initials = profile.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
      setUserInitials(initials);
    } else {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(user.name || "John Doe");

        // Generate initials
        if (user.name) {
          const initials = user.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
          setUserInitials(initials);
        }
      }
    }

    // Fetch demo dashboard for fallback insights (separate from context-managed data)
    const fetchDemoInsights = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/demo/full-dashboard`);
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (e) {
        console.error("Failed to fetch demo dashboard", e);
      }
    };
    fetchDemoInsights();
  }, [profile, navigate]);

  // Platform list

  // Get list of connected platforms
  const getConnectedPlatforms = () => {
    const platforms: { key: string; name: string; color: string; gradient: string }[] = [];

    if (connections.youtube?.connected || realYoutubeData) {
      platforms.push({
        key: "youtube",
        name: "YouTube",
        color: "#ff0000",
        gradient: "colorYoutube"
      });
    }
    if (connections.instagram?.connected || realInstagramData) {
      platforms.push({
        key: "instagram",
        name: "Instagram",
        color: "#ec4899",
        gradient: "colorInstagram"
      });
    }
    if (connections.twitter?.connected) {
      platforms.push({
        key: "twitter",
        name: "Twitter",
        color: "#60a5fa",
        gradient: "colorTwitter"
      });
    }
    if (connections.linkedin?.connected) {
      platforms.push({
        key: "linkedin",
        name: "LinkedIn",
        color: "#1d4ed8",
        gradient: "colorLinkedin"
      });
    }

    return platforms;
  };

  const connectedPlatforms = getConnectedPlatforms();

  // Generate dynamic engagement data based on connected platforms
  const getDynamicEngagementData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

    // If we have real YouTube video data and Instagram analytics, use them
    if (realYoutubeData?.recent_videos || realInstagramData?.analytics) {
      const videos = realYoutubeData?.recent_videos || [];
      const igTrend = realInstagramData?.analytics || [];

      const maxLen = Math.max(videos.length, igTrend.length, 7);
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

      return Array.from({ length: Math.min(maxLen, 7) }).map((_, i) => {
        const dataPoint: any = { name: days[i] || `Day ${i + 1}` };

        if (videos[i]) {
          dataPoint.youtube = (videos[i].statistics?.views || 0) / 1000;
        } else if (realYoutubeData) {
          dataPoint.youtube = Math.random() * 5000;
        }

        if (igTrend[i]) {
          dataPoint.instagram = (igTrend[i].reach || 0) / 1000;
        } else if (realInstagramData) {
          dataPoint.instagram = Math.random() * 4000;
        }

        // Mock others if connected
        if (connections.twitter?.connected) dataPoint.twitter = 1000 + Math.random() * 2000;
        if (connections.linkedin?.connected) dataPoint.linkedin = 500 + Math.random() * 1000;

        return dataPoint;
      });
    }

    // Fallback to monthly data for connected platforms only
    return months.map((month, i) => {
      const baseValue = 3000 + Math.random() * 5000;
      const dataPoint: any = { name: month };

      if (connections.youtube?.connected || realYoutubeData) {
        dataPoint.youtube = baseValue * 1.5;
      }
      if (connections.instagram?.connected || realInstagramData) {
        dataPoint.instagram = baseValue * 1.2;
      }
      if (connections.twitter?.connected) {
        dataPoint.twitter = baseValue * 0.8;
      }
      if (connections.linkedin?.connected) {
        dataPoint.linkedin = baseValue * 0.5;
      }

      return dataPoint;
    });
  };

  const dynamicEngagementData = engagementTrends;

  // Generate dynamic content type data
  const getDynamicContentTypeData = () => {
    // If we have YouTube data, categorize by video duration
    if (realYoutubeData?.recent_videos) {
      const videos = realYoutubeData.recent_videos;

      const categories: Record<string, number> = {
        "Short (<1m)": 0,
        "Medium (1-10m)": 0,
        "Long (10-30m)": 0,
        "Extended (30m+)": 0,
      };

      videos.forEach((video: any) => {
        const duration = video.duration || "";
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (match) {
          const hours = parseInt(match[1] || "0");
          const minutes = parseInt(match[2] || "0");
          const seconds = parseInt(match[3] || "0");
          const totalSeconds = hours * 3600 + minutes * 60 + seconds;

          if (totalSeconds < 60) categories["Short (<1m)"]++;
          else if (totalSeconds < 600) categories["Medium (1-10m)"]++;
          else if (totalSeconds < 1800) categories["Long (10-30m)"]++;
          else categories["Extended (30m+)"]++;
        }
      });

      const total = Object.values(categories).reduce((a, b) => a + b, 0) || 1;

      return [
        { name: "Short (<1m)", value: Math.round((categories["Short (<1m)"] / total) * 100), color: "hsl(142, 71%, 45%)" },
        { name: "Medium (1-10m)", value: Math.round((categories["Medium (1-10m)"] / total) * 100), color: "hsl(200, 80%, 50%)" },
        { name: "Long (10-30m)", value: Math.round((categories["Long (10-30m)"] / total) * 100), color: "hsl(280, 60%, 50%)" },
        { name: "Extended (30m+)", value: Math.round((categories["Extended (30m+)"] / total) * 100), color: "hsl(35, 90%, 55%)" },
      ].filter(item => item.value > 0);
    }

    // Fallback for Instagram-only mode
    if (realInstagramData && !realYoutubeData) {
      return [
        { name: "Reels", value: 45, color: "hsl(142, 71%, 45%)" },
        { name: "Carousels", value: 30, color: "hsl(200, 80%, 50%)" },
        { name: "Static", value: 15, color: "hsl(280, 60%, 50%)" },
        { name: "Stories", value: 10, color: "hsl(35, 90%, 55%)" },
      ];
    }

    // Default fallback
    return contentTypeData;
  };

  const dynamicContentTypeData = getDynamicContentTypeData();

  // Generate dynamic recent posts from real data
  const getDynamicRecentPosts = () => {
    const posts: Array<{
      id: string | number;
      platform: string;
      title: string;
      likes: number;
      comments: number;
      shares: number;
      thumbnail?: string;
      url?: string;
    }> = [];

    // Add real YouTube videos
    if (realYoutubeData?.recent_videos) {
      realYoutubeData.recent_videos.slice(0, 4).forEach((video: any, i: number) => {
        posts.push({
          id: video.id || `yt-${i}`,
          platform: "youtube",
          title: video.title || "Untitled Video",
          likes: video.statistics?.likes || 0,
          comments: video.statistics?.comments || 0,
          shares: Math.round((video.statistics?.likes || 0) * 0.1), // Estimate shares
          thumbnail: video.thumbnails?.medium || video.thumbnails?.default,
          url: video.id ? `https://youtube.com/watch?v=${video.id}` : undefined,
        });
      });
    }

    // Add Instagram placeholder posts (since we can't get real post data without API)
    if (connections.instagram?.connected || realInstagramData) {
      const igHandle = connections.instagram?.publicHandle || realInstagramData?.profile?.username || "mrbeast";
      // These are estimated/placeholder - real data needs Instagram Graph API
      posts.push({
        id: `ig-placeholder-1`,
        platform: "instagram",
        title: `Latest Post from @${igHandle}`,
        likes: realInstagramData?.metrics?.impressions ? Math.round(realInstagramData.metrics.impressions * 0.05) : 50000,
        comments: realInstagramData?.metrics?.posts ? realInstagramData.metrics.posts * 20 : 1200,
        shares: realInstagramData?.metrics?.posts ? realInstagramData.metrics.posts * 10 : 600,
      });
    }

    // Add Twitter/LinkedIn only if connected
    if (connections.twitter?.connected) {
      posts.push({
        id: "tw-placeholder",
        platform: "twitter",
        title: "Recent Tweet",
        likes: 1234,
        comments: 89,
        shares: 456,
      });
    }

    if (connections.linkedin?.connected) {
      posts.push({
        id: "li-placeholder",
        platform: "linkedin",
        title: "Recent LinkedIn Post",
        likes: 892,
        comments: 67,
        shares: 123,
      });
    }

    // If no data, return empty to show "No posts yet" message
    return posts;
  };

  const dynamicRecentPosts = getDynamicRecentPosts();

  const handleExport = () => {
    const data = dashboardData?.overview || { total_impressions: 2547831, engagement_rate: 11.7, total_comments: 45678, total_shares: 18234, growth_rate: 23.8 };
    const csvContent = `Social Leaf Analytics Report
Generated: ${new Date().toLocaleString()}

OVERVIEW METRICS
Metric,Value
Total Impressions,${data.total_impressions}
Engagement Rate,${data.engagement_rate}%
Total Comments,${data.total_comments}
Total Shares,${data.total_shares}
Growth Rate,${data.growth_rate || 23.8}%

PLATFORM BREAKDOWN
Platform,Engagement Rate,Status
Instagram,8.5%,Active
YouTube,5.2%,Active
Twitter,3.8%,Active
LinkedIn,4.5%,Active

RECOMMENDATIONS
1. Create more Reels/Shorts content
2. Post during peak hours (7-9 PM)
3. Use carousel posts for educational content
4. Increase posting frequency to 4-5x/week
`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social_leaf_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePdfExport = async () => {
    const toastId = toast.loading('Starting AI Analysis for Report...');

    try {
      let analysisData: any = undefined;

      // Attempt to get AI analysis if logged in
      if (session?.access_token) {
        try {
          const response = await api.getReportAnalysis(session.access_token, unifiedMetrics);
          analysisData = response;
          toast.dismiss(toastId);
          toast.info('AI Analysis added. Generating PDF...');
        } catch (err) {
          console.error("AI Analysis failed", err);
          toast.dismiss(toastId);
          toast.warning('Generating PDF without AI analysis (Service Unavailable)');
        }
      } else {
        toast.dismiss(toastId);
        toast.info('Generating PDF (Login for AI insights)...');
      }

      const charts = [
        { id: "engagement-chart", title: "Engagement Overview" },
        { id: "content-type-chart", title: "Content Performance" }
      ];

      await generateDashboardPDF("Social Leaf Analytics Report", unifiedMetrics, charts, analysisData);

      // Cleanup running toasts
      toast.dismiss(toastId);

    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);
      toast.error('Export failed');
    }
  };

  const { session } = useAuth();

  const handleAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    if (!session?.access_token) {
      setAiResponse("Please log in to use AI insights.");
      return;
    }

    setAiResponse(""); // Clear previous
    setIsAiTyping(true);

    try {
      // Extract YouTube handle if available (for Public Handle fallback)
      let ytHandle = undefined;
      if (selectedPlatform === 'youtube' || selectedPlatform === 'all') {
        // @ts-ignore
        ytHandle = realYoutubeData?.account?.username || connections?.youtube?.publicHandle;
        if (ytHandle) ytHandle = ytHandle.replace('@', '');
      }

      const response = await api.queryAI(session.access_token, aiQuery, selectedPlatform, ytHandle);

      // Typing animation for the real response
      const answer = response.answer || "I couldn't generate an answer at this time.";
      setAiQuery("");

      for (let i = 0; i <= answer.length; i++) {
        // Speed up typing for longer responses
        await new Promise((resolve) => setTimeout(resolve, 5));
        setAiResponse(answer.slice(0, i));
      }

    } catch (error) {
      console.error("AI Query failed:", error);
      setAiResponse("Sorry, I encountered an error connecting to the AI brain. Please try again.");
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleTomorrowTip = async () => {
    if (!showTomorrowTip && !tomorrowRecommendation) {
      setLoadingTip(true);
      try {
        const prompt = "Analyze my data and suggest exactly ONE high-performing post idea for tomorrow. Return ONLY the following format:\n\n**Platform**: [Platform]\n**Format**: [Format]\n**Best Time**: [Time]\n**Topic**: [Topic]\n**Why**: [Brief reason]";
        // @ts-ignore
        const res = await api.queryAI(session?.access_token || '', prompt, 'all');
        setTomorrowRecommendation(res.answer);
      } catch (e) {
        console.error(e);
        setTomorrowRecommendation("Could not generate tip. Please try again.");
      } finally {
        setLoadingTip(false);
      }
    }
    setShowTomorrowTip(!showTomorrowTip);
  };

  const handleInsightAction = (action: string) => {
    switch (action) {
      case "View Reel Analytics":
        navigate("/analytics");
        break;
      case "Optimize Schedule":
        navigate("/performance");
        break;
      case "Create Similar":
        setShowIdeas(true);
        break;
      default:
        navigate("/analytics");
    }
  };


  // System Status State
  const [systemStatus, setSystemStatus] = useState({
    announcement: "",
    announcement_active: false,
    maintenance_mode: false,
    maintenance_start: "",
    maintenance_end: ""
  });

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/system/status`);
      if (res.ok) {
        setSystemStatus(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch system status");
    }
  };

  return (
    <div className="min-h-screen bg-muted flex">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* System Announcement Banner */}
        {/* System Announcement Floating Card */}
        {systemStatus.announcement_active && systemStatus.announcement && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-indigo-600 text-white p-4 rounded-xl shadow-2xl flex items-start gap-4 border border-indigo-500/50 backdrop-blur-sm"
          >
            <div className="p-2 bg-white/20 rounded-lg shrink-0">
              <Megaphone className="h-5 w-5" />
            </div>
            <div className="flex-1 pt-0.5">
              <h4 className="font-semibold text-sm mb-1">System Update</h4>
              <p className="text-sm text-indigo-50 leading-relaxed mb-1">{systemStatus.announcement}</p>
              {systemStatus.maintenance_start && (
                <p className="text-[10px] text-indigo-200 font-medium">
                  Maintenance: {new Date(systemStatus.maintenance_start).toLocaleString()} - {new Date(systemStatus.maintenance_end).toLocaleString()}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 h-[65px] flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <MobileNav />
              <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
              {/* Live Data Indicator - inline */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Live Data from API
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* AI Post Recommendation Button - Minimalistic */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleTomorrowTip}
                className="border-green-500/30 text-green-600 hover:bg-green-50 hover:border-green-500 transition-all group"
              >
                {loadingTip ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2 group-hover:fill-green-500/20" />
                )}
                Post Ideas
              </Button>

              <Button variant="outline" size="sm" onClick={handlePdfExport}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="hero" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4" />
                CSV
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div id="dashboard-content" className="p-6 space-y-6">
          {/* Welcome Message */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-3xl font-display font-bold text-foreground line-clamp-1">
                Welcome back, {userName.split(' ')[0]}! 👋
              </h2>
              <p className="text-muted-foreground">
                Here's what's happening across your connected platforms today.
              </p>
            </motion.div>

            {/* Quick Refresh Button for Unified Data */}
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>

          {/* Unified Account Banner & Get Started */}
          <div className="flex flex-col gap-4">
            {/* NO ACCOUNTS CONNECTED BANNER */}
            {!connections.youtube?.connected && !connections.instagram?.connected && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/5 rounded-2xl p-8 border border-primary/20 flex flex-col items-center text-center gap-4"
              >
                <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Start Your Unified Dashboard</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Connect your YouTube and Instagram accounts to see real-time engagement and AI growth tips.
                  </p>
                </div>
                <Button variant="hero" onClick={() => setShowConnectModal(true)}>
                  Connect My Accounts
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {/* Unified Account Summary Banner (If connected) */}
            {(connections.youtube?.connected || connections.instagram?.connected) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-6 border border-border flex flex-wrap items-center justify-between gap-6 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {connections.youtube?.connected && (
                      <div className="h-10 w-10 rounded-full bg-red-500 border-2 border-card flex items-center justify-center z-20">
                        <Youtube className="h-5 w-5 text-white" />
                      </div>
                    )}
                    {connections.instagram?.connected && (
                      <div className="h-10 w-10 rounded-full bg-pink-500 border-2 border-card flex items-center justify-center z-10">
                        <Instagram className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">Unified Performance</h3>
                      {(isYoutubeLoading || isInstagramLoading) && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold animate-pulse">
                          <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                          SYNCING
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {Object.values(connections).filter(c => c?.connected).length} platforms connected
                    </p>
                  </div>
                </div>

                <div className="flex gap-8">
                  <div className="hidden sm:block">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Avg. Engagement</p>
                    <p className="text-xl font-bold text-primary">{unifiedMetrics.engagementRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Total Reach</p>
                    <p className="text-xl font-bold">{formatNumber(unifiedMetrics.totalImpressions)}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Platform Specific Banners Row */}
            {/* YouTube Banner */}
            {realYoutubeData?.channel && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent rounded-xl p-4 border border-red-500/20 flex items-center gap-4"
              >
                <img
                  src={realYoutubeData.channel.thumbnail}
                  alt={realYoutubeData.channel.title}
                  className="h-12 w-12 rounded-full border-2 border-red-500/30"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-red-500" />
                    <h3 className="font-semibold">{realYoutubeData.channel.title}</h3>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                      </span>
                      Live Data
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(realYoutubeData.channel.statistics?.subscribers || 0)} subscribers •
                    {formatNumber(realYoutubeData.channel.statistics?.views || 0)} total views •
                    {realYoutubeData.channel.statistics?.videos || 0} videos
                  </p>
                </div>
                <a
                  href={`https://youtube.com/${realYoutubeData.channel.customUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-red-500 hover:text-red-400 font-medium"
                >
                </a>
              </motion.div>
            )}
            {/* Instagram Banner */}
            {connections.instagram?.connected && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-pink-500/10 via-purple-500/5 to-transparent rounded-xl p-4 border border-pink-500/20 flex items-center gap-4"
              >
                <div className="h-12 w-12 rounded-full border-2 border-pink-500/30 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 flex items-center justify-center">
                  <Instagram className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Instagram className="h-5 w-5 text-pink-500" />
                    <h3 className="font-semibold">@{(connections.instagram.publicHandle || realInstagramData?.profile?.username || "instagram_user").replace(/^@+/, '')}</h3>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                      </span>
                      {realInstagramData ? "Live Data" : "Connected"}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {realInstagramData?.profile?.followers ? `${formatNumber(realInstagramData.profile.followers)} followers • ` : ""}
                    Managing audience and engagement strategies
                  </p>
                </div>
                <Link to="/analytics" className="text-sm text-pink-500 hover:text-pink-400 font-medium">
                  Detailed Insights →
                </Link>
              </motion.div>
            )}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: "Total Impressions",
                value: formatNumber(unifiedMetrics.totalImpressions),
                change: `+${unifiedMetrics.growthRate}%`,
                icon: Eye,
                color: "text-blue-500"
              },
              {
                label: "Engagement Rate",
                value: `${unifiedMetrics.engagementRate}%`,
                change: "+2.1%",
                icon: Heart,
                color: "text-rose-500"
              },
              {
                label: "Total Comments",
                value: formatNumber(unifiedMetrics.totalComments),
                change: "+18.2%",
                icon: MessageCircle,
                color: "text-amber-500"
              },
              {
                label: "Total Shares",
                value: formatNumber(unifiedMetrics.totalShares),
                change: "+5.3%",
                icon: Share2,
                color: "text-primary"
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">{isLoading ? "..." : stat.value}</p>
                <p className="text-sm text-primary font-medium">{stat.change} vs last month</p>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Engagement Chart */}
            <motion.div
              id="engagement-chart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-semibold text-foreground">Engagement Overview</h3>
                <div className="flex items-center gap-4 text-sm">
                  {/* Dynamic legend based on connected platforms */}
                  {connectedPlatforms.map((platform) => (
                    <div key={platform.key} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: platform.color }} />
                      <span className="text-muted-foreground">{platform.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dynamicEngagementData}>
                    <defs>
                      <linearGradient id="colorYoutube" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff0000" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ff0000" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorInstagram" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorTwitter" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorLinkedin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    {/* Render Area for each connected platform */}
                    {connectedPlatforms.map((platform) => (
                      <Area
                        key={platform.key}
                        type="monotone"
                        dataKey={platform.key}
                        stroke={platform.color}
                        fill={`url(#${platform.gradient})`}
                        strokeWidth={2}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Content Type Chart */}
            <motion.div
              id="content-type-chart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-card rounded-2xl p-6 border border-border"
            >
              <h3 className="font-display text-lg font-semibold text-foreground mb-6">Content Performance</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dynamicContentTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dynamicContentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {dynamicContentTypeData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    <span className="text-sm font-medium text-foreground">{item.value}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Featured YouTube Channels - Real Data */}
          <FeaturedChannels />

          {/* AI Insights & Recent Posts */}
          <div className="flex flex-col-reverse gap-6 pb-40">
            {/* AI Query Interface */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="fixed bottom-6 inset-x-0 mx-auto w-[95%] max-w-3xl z-50 bg-neutral-900/40 backdrop-blur-xl backdrop-saturate-150 border border-white/10 rounded-[2rem] p-4 shadow-2xl"
            >
              {/* Response Pop-up (Floats above the bar) */}
              {aiResponse && (
                <div className="absolute bottom-[calc(100%+1rem)] left-0 right-0 max-h-[60vh] overflow-y-auto p-6 bg-black/80 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl">
                  <button
                    onClick={() => setAiResponse(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="prose prose-invert prose-base max-w-none text-white/90">
                    <ReactMarkdown
                      components={{
                        table: ({ node, ...props }) => <div className="overflow-x-auto my-4"><table className="w-full text-left border-collapse" {...props} /></div>,
                        thead: ({ node, ...props }) => <thead className="bg-white/10" {...props} />,
                        th: ({ node, ...props }) => <th className="p-2 border border-white/20 font-semibold" {...props} />,
                        td: ({ node, ...props }) => <td className="p-2 border border-white/20" {...props} />,
                        strong: ({ node, ...props }) => <strong className="text-emerald-400 font-bold" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-4 mb-2 text-white" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-md font-semibold mt-3 mb-1 text-white/90" {...props} />
                      }}
                    >
                      {aiResponse}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              <form onSubmit={handleAiQuery} className="flex items-end gap-3 px-2">
                <div className="h-10 w-8 flex items-center justify-center text-green-600 shrink-0 pb-1">
                  <Sparkles className="h-6 w-6" fill="currentColor" />
                </div>

                <div className="flex-1 min-w-0 bg-white/5 rounded-2xl border border-white/10 focus-within:border-primary/50 focus-within:bg-white/10 transition-colors flex items-center">
                  <Textarea
                    placeholder={`Ask AI about your ${selectedPlatform === 'all' ? 'social media' : selectedPlatform}...`}
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAiQuery(e);
                      }
                    }}
                    className="border-none focus-visible:ring-0 bg-transparent min-h-[44px] h-[44px] max-h-[120px] py-2.5 px-4 resize-none text-black placeholder:text-gray-700 leading-relaxed w-full font-medium"
                  />

                  {/* Platform Selector (Icon style or minimal) */}
                  <div className="relative pr-2 border-l border-white/10 ml-1">
                    <select
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      className="bg-transparent text-white/60 text-xs py-1 pl-2 pr-6 outline-none cursor-pointer hover:text-white"
                      style={{ appearance: 'none' }}
                    >
                      <option value="all" className="bg-slate-900">All</option>
                      <option value="instagram" className="bg-slate-900">Insta</option>
                      <option value="youtube" className="bg-slate-900">YT</option>
                      <option value="twitter" className="bg-slate-900">X</option>
                      <option value="linkedin" className="bg-slate-900">In</option>
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 text-white/40 pointer-events-none" />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="icon"
                  disabled={isAiTyping || !aiQuery.trim()}
                  className="h-11 w-11 rounded-full bg-primary hover:bg-primary/90 text-white shrink-0 shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95"
                >
                  {isAiTyping ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <ArrowRight className="h-5 w-5" />
                  )}
                </Button>
              </form>
            </motion.div>

            {/* Removed - Button moved to header */}
            <div className="max-w-xl mx-auto w-full pb-32">

              {/* AI Recommendation Modal - Centered */}
              {showTomorrowTip && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                  >
                    {/* Modal Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                          <Sparkles className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">AI Recommendation</h3>
                          <span className="text-xs text-gray-500">Powered by Social Leaf AI</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowTomorrowTip(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-6">
                      {loadingTip ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-3">
                          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                          <span className="text-gray-600 font-medium">Analyzing your metrics...</span>
                          <span className="text-sm text-gray-400">Generating personalized recommendations</span>
                        </div>
                      ) : (
                        <div className="prose prose-gray max-w-none">
                          <div className="text-gray-800 leading-relaxed">
                            <ReactMarkdown
                              components={{
                                strong: ({ node, ...props }) => <strong className="text-gray-900 font-semibold" {...props} />,
                                p: ({ node, ...props }) => <p className="text-gray-700 mb-3" {...props} />,
                                h1: ({ node, ...props }) => <h1 className="text-gray-900 font-bold text-xl mb-3" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-gray-900 font-bold text-lg mb-2" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-gray-900 font-semibold text-base mb-2" {...props} />,
                              }}
                            >
                              {tomorrowRecommendation || ''}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Modal Footer */}
                    {!loadingTip && tomorrowRecommendation && (
                      <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 rounded-b-2xl">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowTomorrowTip(false)}
                        >
                          Close
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => {
                            window.open('https://calendar.google.com/', '_blank');
                          }}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Post
                        </Button>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
            </div>


            {/* Recent Posts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="bg-card rounded-2xl p-6 border border-border"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-semibold text-foreground">Recent Posts</h3>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                  </span>
                  Real Data
                </div>
              </div>

              <div className="space-y-4">
                {dynamicRecentPosts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No posts yet. Connect your accounts to see real data.</p>
                  </div>
                ) : (
                  dynamicRecentPosts.map((post) => {
                    const PlatformIcon = post.platform === "instagram" ? Instagram
                      : post.platform === "twitter" ? Twitter
                        : post.platform === "youtube" ? Youtube
                          : Linkedin;

                    const PostContent = (
                      <div key={post.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer">
                        {/* Show thumbnail for YouTube videos */}
                        {post.thumbnail ? (
                          <img
                            src={post.thumbnail}
                            alt={post.title}
                            className="h-16 w-24 object-cover rounded-lg"
                          />
                        ) : (
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${post.platform === "instagram" ? "bg-gradient-to-br from-pink-500 to-purple-500"
                            : post.platform === "twitter" ? "bg-blue-400"
                              : post.platform === "youtube" ? "bg-red-500"
                                : "bg-blue-700"
                            }`}>
                            <PlatformIcon className="h-5 w-5 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {post.thumbnail && (
                              <div className={`h-5 w-5 rounded flex items-center justify-center shrink-0 ${post.platform === "youtube" ? "bg-red-500" : "bg-pink-500"
                                }`}>
                                <PlatformIcon className="h-3 w-3 text-white" />
                              </div>
                            )}
                            <p className="font-medium text-foreground truncate">{post.title}</p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" /> {post.likes.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" /> {post.comments.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Share2 className="h-3 w-3" /> {post.shares.toLocaleString()}
                            </span>
                            {/* Direct Link Button */}
                            {post.url && (
                              <a
                                href={post.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-auto text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition-colors flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Watch <ArrowRight className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );

                    // Wrap in link if URL exists
                    return post.url ? (
                      <a
                        key={post.id}
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        {PostContent}
                      </a>
                    ) : (
                      PostContent
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <ConnectAccountsModal open={showConnectModal} onOpenChange={setShowConnectModal} />
    </div>
  );
};

export default Dashboard;
