import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface YouTubeChannel {
  id: string;
  title: string;
  thumbnail: string;
  customUrl?: string;
  statistics?: {
    subscribers: number;
    views: number;
    videos: number;
  };
}

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnails?: {
    default?: string;
    medium?: string;
    high?: string;
  };
  statistics?: {
    views: number;
    likes: number;
    comments: number;
  };
  duration?: string;
}

interface YouTubeData {
  channel: YouTubeChannel;
  recent_videos: YouTubeVideo[];
}

interface InstagramData {
  profile?: {
    username: string;
    followers: number;
    following: number;
    posts: number;
  };
  account?: {
    username: string;
    name: string;
    profile_picture?: string;
  };
  metrics?: {
    impressions: number;
    posts: number;
    followers?: number;
    reach?: number;
    comments_count?: number;
    comments?: number;
    like_count?: number;
    profile_views?: number;
    following?: number;
  };
  is_simulated?: boolean;
  analytics?: Array<{
    day: string;
    engagement: number;
    reach: number;
  }>;
  recent_media?: Array<{
    id: string;
    caption: string;
    media_type: string;
    media_url: string;
    like_count: number;
    comments_count: number;
    timestamp: string;
  }>;
}

interface ConnectionStatus {
  connected: boolean;
  publicHandle?: string;
  channelId?: string;
  dataType?: string;
}

interface Connections {
  youtube?: ConnectionStatus;
  instagram?: ConnectionStatus;
  twitter?: ConnectionStatus;
  linkedin?: ConnectionStatus;
}

interface SocialDataContextType {
  // Data
  youtubeData: YouTubeData | null;
  instagramData: InstagramData | null;
  connections: Connections;

  // Loading states
  isLoading: boolean;
  isYoutubeLoading: boolean;
  isInstagramLoading: boolean;

  // Last fetch time
  lastFetchTime: number | null;

  // Actions
  refreshData: () => Promise<void>;
  refreshYoutubeData: () => Promise<void>;
  refreshInstagramData: () => Promise<void>;

  // Helpers
  formatNumber: (num: number) => string;

  // Unified calculations
  unifiedMetrics: {
    totalImpressions: number;
    engagementRate: number;
    totalComments: number;
    totalShares: number;
    growthRate: number;
  };
  engagementTrends: Array<{
    name: string;
    youtube?: number;
    instagram?: number;
    twitter?: number;
    linkedin?: number;
  }>;
}

const SocialDataContext = createContext<SocialDataContextType | undefined>(undefined);

import { API_BASE_URL as API_BASE } from '../services/api';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export const SocialDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [youtubeData, setYoutubeData] = useState<YouTubeData | null>(null);
  const [instagramData, setInstagramData] = useState<InstagramData | null>(null);
  const [connections, setConnections] = useState<Connections>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isYoutubeLoading, setIsYoutubeLoading] = useState(false);
  const [isInstagramLoading, setIsInstagramLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);

  // Unified Metrics State
  const [unifiedMetrics, setUnifiedMetrics] = useState({
    totalImpressions: 0,
    engagementRate: 0,
    totalComments: 0,
    totalShares: 0,
    growthRate: 12.5
  });

  const [engagementTrends, setEngagementTrends] = useState<any[]>([]);

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Load connections from localStorage
  const loadConnections = (): Connections => {
    try {
      const saved = localStorage.getItem('socialleaf_connections');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load connections:', e);
    }
    return {};
  };

  // Fetch YouTube data
  const fetchYoutubeData = async (conns: Connections) => {
    setIsYoutubeLoading(true);
    try {
      let url = `${API_BASE}/api/youtube/featured`;

      // If user has a public handle connected, fetch that specifically
      if (conns.youtube?.connected && conns.youtube.publicHandle) {
        url = `${API_BASE}/api/real/youtube?handle=${conns.youtube.publicHandle}&t=${Date.now()}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          // Find MrBeast or use first channel
          const mrBeast = data.find((c: any) =>
            c.channel?.title?.toLowerCase().includes('mrbeast') ||
            c.channel?.customUrl?.toLowerCase().includes('mrbeast')
          );
          setYoutubeData(mrBeast || data[0]);
        } else if (data.channel) {
          // Already in the right format
          setYoutubeData(data);
        } else if (data.account) {
          // Map from backend 'real' structure to frontend expected structure
          setYoutubeData({
            channel: {
              id: data.account.id,
              title: data.account.name,
              customUrl: data.account.username,
              thumbnail: data.account.profile_picture,
              statistics: {
                subscribers: data.metrics?.subscribers || 0,
                views: data.metrics?.views || 0,
                videos: data.metrics?.videos || 0
              }
            },
            recent_videos: data.recent_videos || [] // Use videos from backend
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch YouTube data:', error);
    } finally {
      setIsYoutubeLoading(false);
    }
  };

  // Fetch Instagram data
  const fetchInstagramData = async (conns: Connections) => {
    if (!conns.instagram?.connected) return;

    setIsInstagramLoading(true);
    try {
      let url = `${API_BASE}/api/real/instagram?t=${Date.now()}`;
      if (conns.instagram.publicHandle) {
        url += `&handle=${conns.instagram.publicHandle}`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setInstagramData(data);
      }
    } catch (error) {
      console.error('Failed to fetch Instagram data:', error);
    } finally {
      setIsInstagramLoading(false);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setIsLoading(true);
    // Clear session cache to ensure fresh data
    sessionStorage.removeItem('socialleaf_cached_data');

    const conns = loadConnections();
    setConnections(conns);

    // Fetch in parallel
    await Promise.all([
      fetchYoutubeData(conns),
      fetchInstagramData(conns),
    ]);

    setLastFetchTime(Date.now());
    setIsLoading(false);
  };

  // Refresh YouTube data only
  const refreshYoutubeData = async () => {
    const conns = loadConnections();
    await fetchYoutubeData(conns);
    setLastFetchTime(Date.now());
  };

  // Refresh Instagram data only
  const refreshInstagramData = async () => {
    const conns = loadConnections();
    await fetchInstagramData(conns);
    setLastFetchTime(Date.now());
  };

  // Initial fetch on mount
  useEffect(() => {
    // Check if we have cached data that's still fresh
    const cached = sessionStorage.getItem('socialleaf_cached_data');
    if (cached) {
      try {
        const { youtube, instagram, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          // Use cached data
          setYoutubeData(youtube);
          setInstagramData(instagram);
          setLastFetchTime(timestamp);
          setConnections(loadConnections());
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error('Failed to parse cached data:', e);
      }
    }

    // No valid cache, fetch fresh
    refreshData();
  }, []);

  // Cache data when it changes
  useEffect(() => {
    if (youtubeData || instagramData) {
      sessionStorage.setItem('socialleaf_cached_data', JSON.stringify({
        youtube: youtubeData,
        instagram: instagramData,
        timestamp: Date.now(),
      }));
    }
  }, [youtubeData, instagramData]);

  // Proactive Background Fetching
  // Triggered when connections exist but deep data (videos/analytics) is missing
  useEffect(() => {
    if (isLoading) return;

    const ytConn = connections.youtube;
    const igConn = connections.instagram;

    // YouTube: If connected via handle/id but no videos, fetch deep data
    if (ytConn?.connected && (ytConn.publicHandle || ytConn.channelId)) {
      if (!youtubeData?.recent_videos || youtubeData.recent_videos.length === 0) {
        if (!isYoutubeLoading) {
          console.log("[Context] Proactively fetching deep YouTube data...");
          fetchYoutubeData(connections);
        }
      }
    }

    // Instagram: If connected but no metrics/analytics, fetch deep data
    if (igConn?.connected && igConn.publicHandle) {
      if (!instagramData?.metrics || !instagramData?.analytics) {
        if (!isInstagramLoading) {
          console.log("[Context] Proactively fetching deep Instagram data...");
          fetchInstagramData(connections);
        }
      }
    }
  }, [connections, youtubeData, instagramData, isLoading]);

  // Unified Metric Engine
  // Calculates cross-platform totals whenever platform data changes
  useEffect(() => {
    // Helper for deterministic "simulated" values to prevent jitter
    const getStableValue = (seedStr: string, index: number, min: number, max: number) => {
      let hash = 0;
      for (let i = 0; i < seedStr.length; i++) {
        hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
      }
      const val = Math.abs((hash + (index * 31)) % 1000) / 1000;
      return min + (val * (max - min));
    };

    let tImpressions = 0;
    let tComments = 0;
    let tShares = 0;
    let avgER = 0;
    let sources = 0;

    // YouTube
    if (youtubeData?.channel) {
      const stats = youtubeData.channel.statistics;
      const videos = youtubeData.recent_videos || [];

      const vViews = videos.reduce((s, v) => s + (v.statistics?.views || 0), 0);
      const vLikes = videos.reduce((s, v) => s + (v.statistics?.likes || 0), 0);
      const vComments = videos.reduce((s, v) => s + (v.statistics?.comments || 0), 0);

      tImpressions += vViews || stats?.views || 0;
      tComments += vComments;
      tShares += vLikes; // Proxy

      if (vViews > 0) {
        avgER += ((vLikes + vComments) / vViews) * 100;
        sources++;
      }
    }

    // Instagram
    if (instagramData?.metrics) {
      const ig = instagramData.metrics;
      tImpressions += ig.impressions || 0;
      tComments += ig.comments_count || (ig.posts * 15) || 0;
      tShares += ig.like_count || (ig.posts * 8) || 0;

      if (ig.impressions > 0) {
        avgER += ((ig.reach || (ig.impressions * 0.1)) / ig.impressions) * 100;
        sources++;
      }
    }

    // Mock others if connected but no real API yet
    if (connections.twitter?.connected) {
      const handle = connections.twitter.publicHandle || "tw_user";
      tImpressions += Math.round(getStableValue(handle, 1, 250000, 450000));
      tComments += Math.round(getStableValue(handle, 2, 4000, 6500));
      tShares += Math.round(getStableValue(handle, 3, 1500, 2500));
      avgER += getStableValue(handle, 4, 3.2, 4.8);
      sources++;
    }

    if (connections.linkedin?.connected) {
      const handle = connections.linkedin.publicHandle || "li_user";
      tImpressions += Math.round(getStableValue(handle, 1, 100000, 150000));
      tComments += Math.round(getStableValue(handle, 2, 2500, 3500));
      tShares += Math.round(getStableValue(handle, 3, 1000, 1800));
      avgER += getStableValue(handle, 4, 4.1, 5.2);
      sources++;
    }

    // Default if literally nothing
    if (tImpressions === 0 && !isLoading) {
      tImpressions = 12500000;
      avgER = 12.5;
      tComments = 28000;
      tShares = 12000;
      sources = 1;
    }

    const finalER = sources > 0 ? (avgER / sources) : 0;

    setUnifiedMetrics({
      totalImpressions: tImpressions,
      engagementRate: Number(finalER.toFixed(2)),
      totalComments: tComments,
      totalShares: tShares,
      growthRate: 15.2
    });

    // Calculate Engagement Trends
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const ytVideos = youtubeData?.recent_videos || [];
    const igAnalytics = instagramData?.analytics || [];

    const ytHandle = youtubeData?.channel?.customUrl || youtubeData?.channel?.id || "default_yt";
    const igHandle = instagramData?.account?.username || "default_ig";

    const trends = days.map((day, i) => {
      const point: any = { name: day };

      if (ytVideos[i]) {
        point.youtube = (ytVideos[i].statistics?.views || 0) / 1000;
      } else if (youtubeData) {
        point.youtube = getStableValue(ytHandle, i, 1000, 3000);
      }

      if (igAnalytics[i]) {
        point.instagram = (igAnalytics[i].reach || 0) / 1000;
      } else if (instagramData) {
        point.instagram = getStableValue(igHandle, i, 800, 2300);
      }

      // Mock others if connected
      if (connections.twitter?.connected) {
        point.twitter = getStableValue(connections.twitter.publicHandle || "tw", i, 1200, 2500);
      }
      if (connections.linkedin?.connected) {
        point.linkedin = getStableValue(connections.linkedin.publicHandle || "li", i, 500, 1500);
      }

      return point;
    });

    setEngagementTrends(trends);

  }, [youtubeData, instagramData, connections, isLoading]);

  // Listen for connection changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'socialleaf_connections') {
        const newConns = loadConnections();
        setConnections(newConns);
        // Refresh data if connections changed
        refreshData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <SocialDataContext.Provider
      value={{
        youtubeData,
        instagramData,
        connections,
        isLoading,
        isYoutubeLoading,
        isInstagramLoading,
        lastFetchTime,
        refreshData,
        refreshYoutubeData,
        refreshInstagramData,
        formatNumber,
        unifiedMetrics,
        engagementTrends,
      }}
    >
      {children}
    </SocialDataContext.Provider>
  );
};

export const useSocialData = (): SocialDataContextType => {
  const context = useContext(SocialDataContext);
  if (!context) {
    throw new Error('useSocialData must be used within a SocialDataProvider');
  }
  return context;
};

export default SocialDataContext;
