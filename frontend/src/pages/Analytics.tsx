import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSocialData } from "@/contexts/SocialDataContext";
import {
  Leaf,
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Users,
  Settings,
  ArrowLeft,
  Download,
  RefreshCw,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  Zap,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { API_BASE_URL } from "@/services/api";

const platformColors = {
  instagram: "#E4405F",
  youtube: "#FF0000",
  twitter: "#1DA1F2",
  linkedin: "#0A66C2",
};

const Analytics = () => {
  // Use shared context for fast initial load
  const {
    youtubeData: realYoutubeData,
    instagramData: realInstagramData,
    connections,
    isLoading: contextLoading,
    isYoutubeLoading,
    isInstagramLoading,
    formatNumber: contextFormatNumber
  } = useSocialData();

  const isLoading = contextLoading;
  const youtubeLoading = isYoutubeLoading;
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [refreshCooldown, setRefreshCooldown] = useState<string | null>(null);


  // Load connections on mount
  // Load connections and check backend status
  useEffect(() => {
    const loadConnections = async () => {
      let currentConns: any = {};

      // 1. Load from LocalStorage
      try {
        const saved = localStorage.getItem("socialleaf_connections");
        if (saved) {
          currentConns = JSON.parse(saved);
        }
      } catch (e) {
        console.error("Failed to load local connections", e);
      }

      // 2. Check Backend Status (Global API Keys)
      try {
        const response = await fetch(`${API_BASE_URL}/auth/status`);
        if (response.ok) {
          const status = await response.json();

          // If YouTube API Key is available on backend, force connect it
          if (status.youtube?.api_key_available) {
            currentConns.youtube = {
              ...currentConns.youtube,
              connected: true,
              status: "Real Time Data",
            };
          } else if (!currentConns.youtube?.connected) {
            // Even without API key, backend can serve featured/mock data
            currentConns.youtube = {
              ...currentConns.youtube,
              connected: true,
              status: "Simulated (Public)",
            };
          }
        }
      } catch (e) {
        console.error("Failed to fetch auth status", e);
      }

      // setConnections(currentConns);
    };

    loadConnections();
  }, []);

  // Proactive fetching now handled by SocialDataContext

  const fetchRealInstagramData = async (handle?: string) => {
    // Proactive fetching handled by context
  };

  useEffect(() => {
    fetchAnalyticsData(true); // Initial load bypasses cooldown
  }, []);

  // Get settings from localStorage
  const getSettings = () => {
    try {
      const saved = localStorage.getItem("socialleaf_settings");
      if (saved) return JSON.parse(saved);
    } catch { }
    return { refreshFrequency: "6h", lastRefresh: 0 };
  };

  // Check if refresh is allowed
  const canRefresh = () => {
    const settings = getSettings();
    // Prevent API spamming (Instagram Rate Limit Protection)
    // 5 minutes cooldown to stay safe
    const freqHours = 5 / 60; // 5 minutes
    const nextRefresh = (settings.lastRefresh || 0) + freqHours * 60 * 60 * 1000;
    const now = Date.now();

    if (now >= nextRefresh) return { allowed: true, message: "" };

    const remaining = nextRefresh - now;
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    return { allowed: false, message: `Please wait ${hours}h ${minutes}m before refreshing (based on your settings)` };
  };

  const fetchAnalyticsData = async (initial = false) => {
    // Check cooldown (skip for initial load)
    if (!initial) {
      const refreshStatus = canRefresh();
      if (!refreshStatus.allowed) {
        setRefreshCooldown(refreshStatus.message);
        setTimeout(() => setRefreshCooldown(null), 3000);
        return;
      }
    }

    // setIsLoading(true);
    try {
      const [dashboard, comparison] = await Promise.all([
        fetch(`${API_BASE_URL}/demo/full-dashboard`).then((r) => r.json()),
        fetch(`${API_BASE_URL}/demo/content-comparison`).then((r) => r.json()),
      ]);
      setAnalyticsData(dashboard);
      setComparisonData(comparison);

      setComparisonData(comparison);

      // We don't need to force fetch here, the useEffects handling 'connections' will do it

      // Update last refresh timestamp
      if (!initial) {
        const settings = JSON.parse(localStorage.getItem("socialleaf_settings") || "{}");
        settings.lastRefresh = Date.now();
        localStorage.setItem("socialleaf_settings", JSON.stringify(settings));

        // Reload connections to ensure we have latest config
        const savedConns = localStorage.getItem("socialleaf_connections");
        // if (savedConns) setConnections(JSON.parse(savedConns));
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      // setIsLoading(false);
    }
  };

  // Helper to format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  // Calculate engagement metrics from real YouTube data
  const getYoutubeMetrics = () => {
    if (!realYoutubeData?.channel || !realYoutubeData?.recent_videos) {
      return null;
    }

    const channel = realYoutubeData.channel;
    const videos = realYoutubeData.recent_videos;

    // Calculate totals from recent videos
    const totalViews = videos.reduce((sum: number, v: any) => sum + (v.statistics?.views || 0), 0);
    const totalLikes = videos.reduce((sum: number, v: any) => sum + (v.statistics?.likes || 0), 0);
    const totalComments = videos.reduce((sum: number, v: any) => sum + (v.statistics?.comments || 0), 0);

    // Calculate engagement rate (likes + comments / views * 100)
    const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews * 100) : 0;

    return {
      channelName: channel.title,
      subscribers: channel.statistics?.subscribers || 0,
      totalViews: channel.statistics?.views || 0,
      videoCount: channel.statistics?.videos || 0,
      recentViews: totalViews,
      recentLikes: totalLikes,
      recentComments: totalComments,
      engagementRate: engagementRate.toFixed(2),
      videos: videos,
    };
  };

  // Calculate engagement metrics from real Instagram data
  const getInstagramMetrics = () => {
    if (!realInstagramData?.metrics) {
      return null;
    }

    const account = realInstagramData.account;
    const metrics = realInstagramData.metrics;

    return {
      username: account?.username || "instagram_user",
      name: account?.name || account?.username || "Instagram Account",
      followers: metrics.followers || 0,
      following: metrics.following || 0,
      posts: metrics.posts || 0,
      impressions: metrics.impressions || 0,
      reach: metrics.reach || 0,
      profileViews: metrics.profile_views || 0,
      isSimulated: realInstagramData.is_simulated || false,
      // Calculate engagement rate
      engagementRate: metrics.impressions > 0
        ? ((metrics.reach / metrics.impressions) * 100).toFixed(2)
        : "4.5",
    };
  };

  // Parse ISO 8601 duration (PT1H2M3S) to seconds
  const parseDuration = (duration: string): number => {
    if (!duration) return 0;
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    const seconds = parseInt(match[3] || "0");
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Get real engagement data from videos/media for chart
  const getRealEngagementData = () => {
    if (selectedPlatform === "youtube" && realYoutubeData?.recent_videos) {
      const videos = realYoutubeData.recent_videos;
      return videos.slice(0, 6).map((video: any, index: number) => {
        const views = video.statistics?.views || 0;
        const likes = video.statistics?.likes || 0;
        const comments = video.statistics?.comments || 0;
        const engagement = views > 0 ? ((likes + comments) / views * 100) : 0;

        return {
          day: `Vid ${index + 1}`,
          engagement: parseFloat(engagement.toFixed(2)),
          reach: views,
          title: video.title?.slice(0, 20) + "...",
        };
      });
    }

    if (selectedPlatform === "instagram" && realInstagramData?.analytics) {
      // Use the analytics trend array from backend
      return realInstagramData.analytics;
    }

    return null;
  };

  // Get real content type performance from videos/media
  const getRealContentTypePerformance = () => {
    if (selectedPlatform === "youtube" && realYoutubeData?.recent_videos) {
      const videos = realYoutubeData.recent_videos;
      const categories: Record<string, { views: number; likes: number; comments: number; count: number }> = {
        "Short (<1m)": { views: 0, likes: 0, comments: 0, count: 0 },
        "Medium (1-10m)": { views: 0, likes: 0, comments: 0, count: 0 },
        "Long (10-30m)": { views: 0, likes: 0, comments: 0, count: 0 },
        "Extended (30m+)": { views: 0, likes: 0, comments: 0, count: 0 },
      };

      videos.forEach((video: any) => {
        const duration = parseDuration(video.duration);
        const views = video.statistics?.views || 0;
        const likes = video.statistics?.likes || 0;
        const comments = video.statistics?.comments || 0;

        let category: string;
        if (duration < 60) category = "Short (<1m)";
        else if (duration < 600) category = "Medium (1-10m)";
        else if (duration < 1800) category = "Long (10-30m)";
        else category = "Extended (30m+)";

        categories[category].views += views;
        categories[category].likes += likes;
        categories[category].comments += comments;
        categories[category].count += 1;
      });

      return Object.entries(categories)
        .filter(([_, data]) => data.count > 0)
        .map(([name, data]) => ({
          name,
          engagement: data.views > 0 ? parseFloat(((data.likes + data.comments) / data.views * 100).toFixed(2)) : 0,
          avgViews: Math.round(data.views / data.count),
          count: data.count,
        }));
    }

    if (selectedPlatform === "instagram" && realInstagramData?.recent_media) {
      const media = realInstagramData.recent_media;
      const categories: Record<string, { engagement: number; count: number; totalReach: number }> = {};

      media.forEach((item: any) => {
        const type = item.media_type || "POST";
        if (!categories[type]) categories[type] = { engagement: 0, count: 0, totalReach: 0 };

        // Estimate engagement rate for this specific media
        const er = item.like_count > 0 ? (item.like_count + (item.comments_count || 0)) / 100 : 8.2;
        categories[type].engagement += er;
        categories[type].count += 1;
      });

      return Object.entries(categories).map(([name, data]) => ({
        name: name.charAt(0) + name.slice(1).toLowerCase(),
        engagement: parseFloat((data.engagement / data.count).toFixed(2)),
        count: data.count
      }));
    }

    return null;
  };

  // --- Aggregation Logic for "All Platforms" ---
  const calculateAllMetrics = () => {
    let totalImpressions = 0;
    let totalEngagement = 0; // This will be weighted or summed? Usually summed actions / summed impressions
    let totalComments = 0;
    let totalShares = 0;
    let totalActions = 0;

    // YouTube
    if (connections.youtube?.connected && realYoutubeData) {
      const metrics = getYoutubeMetrics();
      if (metrics) {
        totalImpressions += metrics.recentViews;
        totalComments += metrics.recentComments;
        totalShares += metrics.recentLikes; // Likes as shares proxy
        totalActions += (metrics.recentLikes + metrics.recentComments);
      }
    }

    // Instagram
    if (connections.instagram?.connected && realInstagramData) {
      const metrics = realInstagramData.metrics;
      if (metrics) {
        totalImpressions += (metrics.impressions || 0);
        totalComments += (metrics.comments || 0); // Simulated doesn't have comments count in metrics usually, but let's check
        // known_profiles in instagram_service.py doesn't have comments count returned in 'metrics' dict explicitly? 
        // Actually it does not. We might need to estimate or update backend.
        // Let's assume engagement rate * impressions to get actions
        const estActions = metrics.impressions * 0.05; // 5% est
        totalActions += estActions;
      }
    }

    // Twitter (Mock if connected, else 0)
    if (connections.twitter?.connected) {
      totalImpressions += 350000;
      totalComments += 5200;
      totalShares += 1800;
      totalActions += (5200 + 1800 + 12000); // + likes
    }

    // LinkedIn
    if (connections.linkedin?.connected) {
      totalImpressions += 128000;
      totalComments += 2900;
      totalShares += 1200;
      totalActions += (2900 + 1200 + 5000);
    }

    const avgEngagement = totalImpressions > 0 ? (totalActions / totalImpressions) * 100 : 0;

    return {
      impressions: totalImpressions,
      engagement: parseFloat(avgEngagement.toFixed(2)),
      comments: totalComments,
      shares: totalShares,
      growth: 12.5 // Average growth
    };
  };

  const allMetrics = calculateAllMetrics();

  const engagementByPlatform: Record<string, { day: string; engagement: number; reach: number }[]> = {
    all: [
      { day: "Mon", engagement: 8.2, reach: 45000 },
      { day: "Tue", engagement: 9.1, reach: 52000 },
      { day: "Wed", engagement: 7.8, reach: 48000 },
      { day: "Thu", engagement: 11.2, reach: 67000 },
      { day: "Fri", engagement: 10.5, reach: 61000 },
      { day: "Sat", engagement: 6.3, reach: 38000 },
      { day: "Sun", engagement: 5.9, reach: 35000 },
    ],
    instagram: [
      { day: "Mon", engagement: 9.5, reach: 62000 },
      { day: "Tue", engagement: 10.2, reach: 71000 },
      { day: "Wed", engagement: 8.8, reach: 58000 },
      { day: "Thu", engagement: 12.5, reach: 89000 },
      { day: "Fri", engagement: 11.8, reach: 82000 },
      { day: "Sat", engagement: 7.2, reach: 45000 },
      { day: "Sun", engagement: 6.8, reach: 42000 },
    ],
    youtube: [
      { day: "Mon", engagement: 5.2, reach: 32000 },
      { day: "Tue", engagement: 5.8, reach: 38000 },
      { day: "Wed", engagement: 6.1, reach: 41000 },
      { day: "Thu", engagement: 7.2, reach: 52000 },
      { day: "Fri", engagement: 6.5, reach: 45000 },
      { day: "Sat", engagement: 8.9, reach: 78000 },
      { day: "Sun", engagement: 8.2, reach: 71000 },
    ],
    twitter: [
      { day: "Mon", engagement: 4.1, reach: 18000 },
      { day: "Tue", engagement: 5.2, reach: 25000 },
      { day: "Wed", engagement: 4.8, reach: 22000 },
      { day: "Thu", engagement: 6.1, reach: 31000 },
      { day: "Fri", engagement: 5.5, reach: 27000 },
      { day: "Sat", engagement: 3.2, reach: 14000 },
      { day: "Sun", engagement: 2.8, reach: 12000 },
    ],
    linkedin: [
      { day: "Mon", engagement: 5.5, reach: 15000 },
      { day: "Tue", engagement: 6.8, reach: 21000 },
      { day: "Wed", engagement: 7.2, reach: 24000 },
      { day: "Thu", engagement: 6.5, reach: 19000 },
      { day: "Fri", engagement: 5.8, reach: 17000 },
      { day: "Sat", engagement: 2.1, reach: 5000 },
      { day: "Sun", engagement: 1.8, reach: 4000 },
    ],
  };

  // Use real engagement data for YouTube/Instagram, fallback to mock for others
  const realEngagement = getRealEngagementData();
  const engagementTrend = (selectedPlatform === "youtube" || selectedPlatform === "instagram") && realEngagement
    ? realEngagement
    : (engagementByPlatform[selectedPlatform] || engagementByPlatform.all);

  // Comprehensive platform-specific data
  const platformData: Record<string, {
    impressions: number;
    engagement: number;
    comments: number;
    shares: number;
    growth: number;
    uniqueMetric: { label: string; value: string; icon: string };
    contentTypes: { name: string; engagement: number }[];
    trendingNiches: { name: string; growth: string }[];
    bestPostingTimes: string[];
    audienceAge: string;
    topHashtags: string[];
  }> = {
    all: {
      impressions: allMetrics.impressions || 0,
      engagement: allMetrics.engagement || 0,
      comments: allMetrics.comments || 0,
      shares: allMetrics.shares || 0,
      growth: allMetrics.growth || 0,
      uniqueMetric: { label: "Total Reach", value: formatNumber(allMetrics.impressions), icon: "👥" },
      contentTypes: [
        { name: "Reel", engagement: 9.2 },
        { name: "Carousel", engagement: 6.2 },
        { name: "Image", engagement: 4.1 },
        { name: "Video", engagement: 7.8 },
        { name: "Story", engagement: 3.5 },
      ],
      trendingNiches: [
        { name: "AI & Tech", growth: "+45%" },
        { name: "Health & Wellness", growth: "+32%" },
        { name: "Personal Finance", growth: "+28%" },
      ],
      bestPostingTimes: ["7 PM - 9 PM", "12 PM - 1 PM"],
      audienceAge: "25-34 (42%)",
      topHashtags: ["#contentcreator", "#growth", "#business"],
    },
    instagram: {
      impressions: 1250000,
      engagement: 12.5,
      comments: 28000,
      shares: 12000,
      growth: 28.5,
      uniqueMetric: { label: "Followers", value: "125.4K", icon: "👤" },
      contentTypes: [
        { name: "Reel", engagement: 14.2 },
        { name: "Carousel", engagement: 9.8 },
        { name: "Story", engagement: 6.5 },
        { name: "Image", engagement: 4.2 },
        { name: "Live", engagement: 8.1 },
      ],
      trendingNiches: [
        { name: "Aesthetic/Lifestyle", growth: "+52%" },
        { name: "Fitness Reels", growth: "+41%" },
        { name: "Food Content", growth: "+35%" },
        { name: "Travel", growth: "+28%" },
      ],
      bestPostingTimes: ["7 PM - 9 PM (Thu/Fri)", "12 PM (Lunch)"],
      audienceAge: "18-24 (38%), 25-34 (35%)",
      topHashtags: ["#reels", "#instagood", "#explorepage", "#trending"],
    },
    youtube: {
      impressions: 820000,
      engagement: 5.2,
      comments: 9500,
      shares: 3200,
      growth: 15.2,
      uniqueMetric: { label: "Subscribers", value: "48.2K", icon: "🔔" },
      contentTypes: [
        { name: "Short", engagement: 8.5 },
        { name: "Tutorial", engagement: 6.2 },
        { name: "Vlog", engagement: 4.8 },
        { name: "Review", engagement: 5.5 },
        { name: "Podcast", engagement: 3.2 },
      ],
      trendingNiches: [
        { name: "AI Tutorials", growth: "+68%" },
        { name: "Tech Reviews", growth: "+42%" },
        { name: "Productivity", growth: "+35%" },
        { name: "Gaming", growth: "+25%" },
      ],
      bestPostingTimes: ["5 PM - 8 PM (Sat/Sun)", "3 PM (Weekdays)"],
      audienceAge: "25-34 (45%), 35-44 (28%)",
      topHashtags: ["#youtube", "#shorts", "#tutorial", "#howto"],
    },
    twitter: {
      impressions: 350000,
      engagement: 3.8,
      comments: 5200,
      shares: 1800,
      growth: 8.5,
      uniqueMetric: { label: "Followers", value: "32.1K", icon: "🐦" },
      contentTypes: [
        { name: "Thread", engagement: 6.8 },
        { name: "Quote", engagement: 4.2 },
        { name: "Image", engagement: 3.5 },
        { name: "Poll", engagement: 5.1 },
        { name: "Link", engagement: 2.1 },
      ],
      trendingNiches: [
        { name: "Tech News", growth: "+55%" },
        { name: "Crypto/Web3", growth: "+38%" },
        { name: "Startup Tips", growth: "+32%" },
        { name: "Hot Takes", growth: "+45%" },
      ],
      bestPostingTimes: ["9 AM - 11 AM (Tue/Wed)", "4 PM (Breaking news)"],
      audienceAge: "25-34 (48%), 35-44 (32%)",
      topHashtags: ["#tech", "#startup", "#thread", "#buildinpublic"],
    },
    linkedin: {
      impressions: 127831,
      engagement: 4.5,
      comments: 2978,
      shares: 1234,
      growth: 12.1,
      uniqueMetric: { label: "Connections", value: "8.5K", icon: "💼" },
      contentTypes: [
        { name: "Document", engagement: 8.2 },
        { name: "Poll", engagement: 6.5 },
        { name: "Article", engagement: 4.8 },
        { name: "Video", engagement: 5.2 },
        { name: "Post", engagement: 3.8 },
      ],
      trendingNiches: [
        { name: "AI in Business", growth: "+72%" },
        { name: "Remote Work", growth: "+45%" },
        { name: "Leadership", growth: "+38%" },
        { name: "Career Growth", growth: "+52%" },
      ],
      bestPostingTimes: ["8 AM - 10 AM (Tue-Thu)", "5 PM (End of work)"],
      audienceAge: "25-34 (42%), 35-44 (38%)",
      topHashtags: ["#leadership", "#career", "#hiring", "#business"],
    },
  };

  const currentPlatform = platformData[selectedPlatform] || platformData.all;

  // Use real YouTube data when available
  const youtubeMetrics = getYoutubeMetrics();
  const instagramMetrics = getInstagramMetrics();

  // Determine current metrics to display
  let currentMetrics;

  if (selectedPlatform === "youtube" && youtubeMetrics) {
    currentMetrics = {
      impressions: youtubeMetrics.recentViews,
      engagement: parseFloat(youtubeMetrics.engagementRate),
      comments: youtubeMetrics.recentComments,
      shares: youtubeMetrics.recentLikes,
      growth: 15.2,
      subscribers: youtubeMetrics.subscribers,
      channelName: youtubeMetrics.channelName,
      totalViews: youtubeMetrics.totalViews,
      videoCount: youtubeMetrics.videoCount,
    };
  } else if (selectedPlatform === "instagram" && instagramMetrics) {
    // Use real/scraped Instagram metrics
    currentMetrics = {
      impressions: instagramMetrics.impressions,
      engagement: parseFloat(instagramMetrics.engagementRate),
      comments: instagramMetrics.posts * 15, // Estimated avg comments per post
      shares: instagramMetrics.posts * 8, // Estimated avg shares per post
      growth: 12.5,
      // Extra props for display
      followers: instagramMetrics.followers,
      username: instagramMetrics.username,
      name: instagramMetrics.name,
      posts: instagramMetrics.posts,
      isSimulated: instagramMetrics.isSimulated,
    };
  } else {
    currentMetrics = {
      impressions: currentPlatform.impressions,
      engagement: currentPlatform.engagement,
      comments: currentPlatform.comments,
      shares: currentPlatform.shares,
      growth: currentPlatform.growth,
    };
  }

  // Use real content type performance for YouTube, fallback to mock for others
  const realContentPerformance = getRealContentTypePerformance();
  const contentPerformance = selectedPlatform === "youtube" && realContentPerformance
    ? realContentPerformance
    : currentPlatform.contentTypes;

  const platformMetrics = analyticsData?.platforms || [
    { platform: "instagram", engagement_rate: 8.5, impressions: 450000 },
    { platform: "youtube", engagement_rate: 5.2, impressions: 320000 },
    { platform: "twitter", engagement_rate: 3.8, impressions: 180000 },
    { platform: "linkedin", engagement_rate: 4.5, impressions: 120000 },
  ];

  // Calculate real YouTube radar metrics from video data
  const getYoutubeRadarScore = () => {
    if (!youtubeMetrics) return { engagement: 72, reach: 88, growth: 82, consistency: 65, virality: 90 };

    // Engagement: Based on engagement rate (scale to 0-100)
    const engagementScore = Math.min(100, parseFloat(youtubeMetrics.engagementRate) * 20);

    // Reach: Based on subscriber count (logarithmic scale)
    const subscribers = youtubeMetrics.subscribers || 0;
    const reachScore = Math.min(100, Math.log10(subscribers + 1) * 12);

    // Virality: Based on avg views per video vs subscriber count
    const avgViews = youtubeMetrics.recentViews / 6;
    const viralityRatio = subscribers > 0 ? (avgViews / subscribers) * 100 : 0;
    const viralityScore = Math.min(100, viralityRatio * 10);

    // Growth: Based on views to subscriber ratio
    const growthScore = Math.min(100, (youtubeMetrics.totalViews / (subscribers * 100)) * 50);

    // Consistency: Based on video count
    const consistencyScore = Math.min(100, youtubeMetrics.videoCount / 10);

    return {
      engagement: Math.round(engagementScore),
      reach: Math.round(reachScore),
      growth: Math.round(growthScore),
      consistency: Math.round(consistencyScore),
      virality: Math.round(viralityScore),
    };
  };

  const ytScores = getYoutubeRadarScore();

  const radarData = [
    { metric: "Engagement", instagram: 85, youtube: ytScores.engagement, twitter: 45, linkedin: 58 },
    { metric: "Reach", instagram: 90, youtube: ytScores.reach, twitter: 55, linkedin: 42 },
    { metric: "Growth", instagram: 75, youtube: ytScores.growth, twitter: 60, linkedin: 70 },
    { metric: "Consistency", instagram: 80, youtube: ytScores.consistency, twitter: 70, linkedin: 85 },
    { metric: "Virality", instagram: 70, youtube: ytScores.virality, twitter: 80, linkedin: 35 },
  ];

  const handleExport = () => {
    const csvData = `Platform,Engagement Rate,Impressions,Likes,Comments
Instagram,${platformMetrics[0]?.engagement_rate}%,${platformMetrics[0]?.impressions},45000,2300
YouTube,${platformMetrics[1]?.engagement_rate}%,${platformMetrics[1]?.impressions},32000,1800
Twitter,${platformMetrics[2]?.engagement_rate}%,${platformMetrics[2]?.impressions},18000,950
LinkedIn,${platformMetrics[3]?.engagement_rate}%,${platformMetrics[3]?.impressions},12000,680`;

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `social_leaf_analytics_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="lg:hidden">
              <MobileNav />
            </div>
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-soft">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">Analytics</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {refreshCooldown && (
              <span className="text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
                {refreshCooldown}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={() => fetchAnalyticsData(false)}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={handleExport} className="bg-primary">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Platform Filter */}
        <div className="flex gap-2">
          {["all", "instagram", "youtube", "twitter", "linkedin"].map((platform) => (
            <Button
              key={platform}
              variant={selectedPlatform === platform ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPlatform(platform)}
              className="capitalize"
            >
              {platform === "all" ? "All Platforms" : platform}
            </Button>
          ))}
        </div>

        {/* Disconnected State for Twitter/LinkedIn */}
        {(selectedPlatform !== "all" && !connections[selectedPlatform]?.connected) ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-12 flex flex-col items-center justify-center text-center space-y-4"
          >
            <div className={`p-4 rounded-full ${platformColors[selectedPlatform as keyof typeof platformColors] ? "bg-opacity-10" : "bg-gray-100"}`} style={{ backgroundColor: `${platformColors[selectedPlatform as keyof typeof platformColors]}20` }}>
              {selectedPlatform === "twitter" && <Twitter className="h-10 w-10 text-[#1DA1F2]" />}
              {selectedPlatform === "linkedin" && <Linkedin className="h-10 w-10 text-[#0A66C2]" />}
              {selectedPlatform === "instagram" && <Instagram className="h-10 w-10 text-[#E4405F]" />}
              {selectedPlatform === "youtube" && <Youtube className="h-10 w-10 text-[#FF0000]" />}
            </div>
            <h3 className="text-xl font-bold">Connect {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}</h3>
            <p className="text-muted-foreground max-w-md">
              Connect your {selectedPlatform} account to see real-time analytics, engagement trends, and AI-powered insights.
            </p>
            <Link to="/settings">
              <Button className="mt-2">Connect Now</Button>
            </Link>
          </motion.div>
        ) : (
          <>
            {selectedPlatform === "youtube" && youtubeMetrics && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent rounded-xl p-4 border border-red-500/20 flex items-center gap-4"
              >
                <img
                  src={realYoutubeData?.channel?.thumbnail}
                  alt={youtubeMetrics.channelName}
                  className="h-14 w-14 rounded-full border-2 border-red-500/30"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-red-500" />
                    <h3 className="font-semibold text-lg">{youtubeMetrics.channelName}</h3>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                      </span>
                      Live Data
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(youtubeMetrics.subscribers)} subscribers • {formatNumber(youtubeMetrics.totalViews)} total views • {youtubeMetrics.videoCount} videos
                  </p>
                </div>
                <a
                  href={`https://youtube.com/${realYoutubeData?.channel?.customUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-red-500 hover:text-red-400 font-medium"
                >
                  View Channel →
                </a>
              </motion.div>
            )}

            {/* Instagram Channel Banner */}
            {selectedPlatform === "instagram" && instagramMetrics && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-pink-500/10 via-purple-500/5 to-transparent rounded-xl p-4 border border-pink-500/20 flex items-center gap-4"
              >
                <div className="h-14 w-14 rounded-full border-2 border-pink-500/30 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 flex items-center justify-center">
                  <Instagram className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Instagram className="h-5 w-5 text-pink-500" />
                    <h3 className="font-semibold text-lg">@{instagramMetrics.username.replace(/^@+/, '')}</h3>
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${instagramMetrics.isSimulated
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-green-500/10 text-green-500"
                      }`}>
                      <span className="relative flex h-1.5 w-1.5">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${instagramMetrics.isSimulated ? "bg-amber-500" : "bg-green-500"
                          }`}></span>
                        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${instagramMetrics.isSimulated ? "bg-amber-500" : "bg-green-500"
                          }`}></span>
                      </span>
                      {instagramMetrics.isSimulated ? "Scraped Data" : "Live Data"}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(instagramMetrics.followers)} followers • {formatNumber(instagramMetrics.posts)} posts • {formatNumber(instagramMetrics.impressions)} impressions
                  </p>
                </div>
                <a
                  href={`https://instagram.com/${instagramMetrics.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-pink-500 hover:text-pink-400 font-medium"
                >
                  View Profile →
                </a>
              </motion.div>
            )}

            {/* Key Metrics - Platform-specific */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  label: selectedPlatform === "all" ? "Total Impressions" : `${selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} Impressions`,
                  value: currentMetrics.impressions === 0
                    ? "0"
                    : currentMetrics.impressions >= 1000000
                      ? `${(currentMetrics.impressions / 1000000).toFixed(1)}M`
                      : `${(currentMetrics.impressions / 1000).toFixed(0)}K`,
                  icon: Eye,
                  color: "text-blue-500",
                  bg: "bg-blue-500/10",
                },
                {
                  label: "Engagement Rate",
                  value: `${currentMetrics.engagement}%`,
                  icon: Zap,
                  color: "text-amber-500",
                  bg: "bg-amber-500/10",
                },
                {
                  label: "Growth Rate",
                  value: `+${currentMetrics.growth}%`,
                  icon: TrendingUp,
                  color: "text-green-500",
                  bg: "bg-green-500/10",
                },
                {
                  label: "Total Engagement",
                  value: `${((currentMetrics.comments + currentMetrics.shares) / 1000).toFixed(1)}K`,
                  icon: Target,
                  color: "text-purple-500",
                  bg: "bg-purple-500/10",
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-xl p-5 border border-border"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold">{isLoading ? "..." : stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Platform-Specific Insights Row */}
            {selectedPlatform !== "all" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid md:grid-cols-3 gap-4"
              >
                {/* Unique Platform Metric */}
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-5 border border-primary/20 relative">
                  {/* Live Data Indicator for YouTube */}
                  {selectedPlatform === "youtube" && youtubeMetrics && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                      </span>
                      Live
                    </div>
                  )}
                  {/* Scraped/Live Data Indicator for Instagram */}
                  {selectedPlatform === "instagram" && instagramMetrics && (
                    <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${instagramMetrics.isSimulated
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-green-500/10 text-green-500"
                      }`}>
                      <span className="relative flex h-1.5 w-1.5">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${instagramMetrics.isSimulated ? "bg-amber-500" : "bg-green-500"
                          }`}></span>
                        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${instagramMetrics.isSimulated ? "bg-amber-500" : "bg-green-500"
                          }`}></span>
                      </span>
                      {instagramMetrics.isSimulated ? "Scraped" : "Live"}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{currentPlatform.uniqueMetric.icon}</span>
                    <span className="text-sm text-muted-foreground">{currentPlatform.uniqueMetric.label}</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {selectedPlatform === "youtube" && youtubeMetrics
                      ? formatNumber(youtubeMetrics.subscribers)
                      : selectedPlatform === "instagram" && instagramMetrics
                        ? formatNumber(instagramMetrics.followers)
                        : currentPlatform.uniqueMetric.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedPlatform === "youtube" && youtubeMetrics
                      ? `${youtubeMetrics.channelName} • Real Data`
                      : selectedPlatform === "instagram" && instagramMetrics
                        ? `@${instagramMetrics.username} • ${instagramMetrics.isSimulated ? "Scraped" : "Real"} Data`
                        : `on ${selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}`}
                  </p>
                </div>

                {/* Trending Niches */}
                <div className="bg-card rounded-xl p-5 border border-border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">🔥 Trending on {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}</h4>
                  <div className="space-y-2">
                    {currentPlatform.trendingNiches.slice(0, 3).map((niche, i) => (
                      <div key={niche.name} className="flex items-center justify-between">
                        <span className="text-sm">{niche.name}</span>
                        <span className="text-xs text-green-500 font-medium">{niche.growth}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Hashtags */}
                <div className="bg-card rounded-xl p-5 border border-border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">🏷️ Top Hashtags</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentPlatform.topHashtags.map((tag) => (
                      <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Audience: {currentPlatform.audienceAge}</p>
                </div>
              </motion.div>
            )}

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Engagement Trend */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-xl p-6 border border-border"
              >
                <h3 className="font-semibold text-lg mb-4">Weekly Engagement Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={engagementTrend}>
                    <defs>
                      <linearGradient id="engGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="engagement"
                      stroke="hsl(142, 71%, 45%)"
                      fill="url(#engGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Content Performance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-xl p-6 border border-border"
              >
                <h3 className="font-semibold text-lg mb-4">Content Type Performance</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={contentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="engagement" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Platform Comparison Radar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-xl p-6 border border-border"
            >
              <h3 className="font-semibold text-lg mb-4">
                {selectedPlatform === "all"
                  ? "Cross-Platform Performance Radar"
                  : `${selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} Performance Radar`}
                {selectedPlatform === "youtube" && youtubeMetrics && (
                  <span className="ml-2 text-xs font-normal text-green-500">(Real Data)</span>
                )}
              </h3>
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    {(selectedPlatform === "all" || selectedPlatform === "instagram") && (
                      <Radar name="Instagram" dataKey="instagram" stroke={platformColors.instagram} fill={platformColors.instagram} fillOpacity={selectedPlatform === "instagram" ? 0.5 : 0.3} />
                    )}
                    {(selectedPlatform === "all" || selectedPlatform === "youtube") && (
                      <Radar name="YouTube" dataKey="youtube" stroke={platformColors.youtube} fill={platformColors.youtube} fillOpacity={selectedPlatform === "youtube" ? 0.5 : 0.3} />
                    )}
                    {(selectedPlatform === "all" || selectedPlatform === "twitter") && (
                      <Radar name="Twitter" dataKey="twitter" stroke={platformColors.twitter} fill={platformColors.twitter} fillOpacity={selectedPlatform === "twitter" ? 0.5 : 0.3} />
                    )}
                    {(selectedPlatform === "all" || selectedPlatform === "linkedin") && (
                      <Radar name="LinkedIn" dataKey="linkedin" stroke={platformColors.linkedin} fill={platformColors.linkedin} fillOpacity={selectedPlatform === "linkedin" ? 0.5 : 0.3} />
                    )}
                  </RadarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-4 justify-center">
                  {Object.entries(platformColors).map(([platform, color]) => (
                    <div key={platform} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-sm capitalize">{platform}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Best Time to Post */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card rounded-xl p-6 border border-border"
            >
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Best Times to Post</h3>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { platform: "Instagram", times: ["7:00 PM", "9:00 PM", "12:00 PM"], best: "Thursday" },
                  { platform: "YouTube", times: ["5:00 PM", "8:00 PM"], best: "Saturday" },
                  { platform: "Twitter", times: ["9:00 AM", "12:00 PM"], best: "Tuesday" },
                  { platform: "LinkedIn", times: ["8:00 AM", "5:00 PM"], best: "Wednesday" },
                ].map((item) => (
                  <div key={item.platform} className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">{item.platform}</h4>
                    <p className="text-sm text-muted-foreground mb-2">Best day: <span className="text-foreground font-medium">{item.best}</span></p>
                    <div className="flex flex-wrap gap-1">
                      {item.times.map((time) => (
                        <span key={time} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
