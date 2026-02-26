import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Youtube, Eye, Users, PlayCircle, ExternalLink } from "lucide-react";
import { API_BASE_URL } from "@/services/api";
import { Button } from "@/components/ui/button";

interface ChannelStats {
  id: string;
  title: string;
  description: string;
  customUrl: string;
  thumbnail: string;
  country: string;
  statistics: {
    subscribers: number;
    views: number;
    videos: number;
  };
}

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  statistics: {
    views: number;
    likes: number;
    comments: number;
  };
}

interface FeaturedChannel {
  key: string;
  channel: ChannelStats;
  recent_videos: Video[];
}

const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null) return "0";
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

export const FeaturedChannels = () => {
  const [channels, setChannels] = useState<FeaturedChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedChannels = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/youtube/featured`);
        if (!response.ok) throw new Error("Failed to fetch channels");
        const data = await response.json();
        // Only show first 2 channels for cleaner UI
        setChannels(data.slice(0, 2));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedChannels();
  }, []);

  if (error) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border">
        <p className="text-muted-foreground">Unable to load featured channels</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-card rounded-2xl p-6 border border-border"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-red-500 flex items-center justify-center">
            <Youtube className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              Featured YouTube Channels
            </h3>
            <p className="text-sm text-muted-foreground">Real-time data from YouTube API</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live Data
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-xl p-4 h-48"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {channels.map((item, index) => (
            <motion.div
              key={item.key || index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-muted/50 rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-all"
            >
              {/* Channel Header */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={item?.channel?.thumbnail || ""}
                  alt={item?.channel?.title || "Channel"}
                  className="h-12 w-12 rounded-full object-cover bg-card"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">
                    {item?.channel?.title || "Unknown Channel"}
                  </h4>
                  <p className="text-sm text-muted-foreground">{item?.channel?.customUrl || ""}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => item?.channel?.customUrl && window.open(`https://youtube.com/${item.channel.customUrl}`, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-card rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 text-red-500 mb-1">
                    <Users className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {formatNumber(item?.channel?.statistics?.subscribers)}
                  </p>
                  <p className="text-xs text-muted-foreground">Subscribers</p>
                </div>
                <div className="bg-card rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                    <Eye className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {formatNumber(item?.channel?.statistics?.views)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </div>
                <div className="bg-card rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 text-purple-500 mb-1">
                    <PlayCircle className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {formatNumber(item?.channel?.statistics?.videos)}
                  </p>
                  <p className="text-xs text-muted-foreground">Videos</p>
                </div>
              </div>

              {/* Recent Videos */}
              <div className="flex gap-2 overflow-hidden">
                {item?.recent_videos?.slice(0, 3).map((video) => (
                  <div
                    key={video?.id || Math.random()}
                    className="flex-1 min-w-0 cursor-pointer group"
                    onClick={() => video?.id && window.open(`https://youtube.com/watch?v=${video.id}`, "_blank")}
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-1 bg-card">
                      {video?.thumbnail && (
                        <img
                          src={video.thumbnail}
                          alt={video?.title || "Video"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <PlayCircle className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(video?.statistics?.views)} views
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default FeaturedChannels;
