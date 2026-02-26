import { useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import {
  Search,
  Users,
  Eye,
  TrendingUp,
  Video,
  Swords,
  Target,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const CompetitorSpy = () => {
  const { session } = useAuth();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Fix for lint error: convert null to undefined for session?.access_token
    const token = session?.access_token;
    if (!token) {
      toast.error("Please log in to use this feature");
      return;
    }

    setIsLoading(true);
    try {
      const result = await api.analyzeCompetitor(token, query);
      setData(result);
      toast.success("Competitor analysis complete!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze competitor. Check the handle/ID.");
    } finally {
      setIsLoading(false);
    }
  };

  // Mock user data for comparison (in real app, fetch from analytics)
  const userData = {
    engagement: 45,
    virality: 60,
    consistency: 75,
    growth: 50,
    reach: 40
  };

  const radarData = data ? [
    { metric: "Engagement", You: userData.engagement, Competitor: data.analysis.engagement_rate * 5 }, // Scale up for chart
    { metric: "Virality", You: userData.virality, Competitor: data.analysis.virality_score },
    { metric: "Content Vol", You: userData.consistency, Competitor: Math.min(100, data.channel.statistics.videos / 10) },
    { metric: "Growth", You: userData.growth, Competitor: 70 }, // Mock
    { metric: "Reach", You: userData.reach, Competitor: Math.min(100, Math.log10(data.channel.statistics.subscribers) * 10) },
  ] : [];

  return (
    <div className="min-h-screen bg-muted flex">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <header className="bg-card border-b border-border px-6 py-4 mb-8">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <MobileNav />
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Swords className="h-6 w-6 text-red-500" />
                </div>
                <h1 className="text-2xl font-display font-bold">Competitor Spyglass</h1>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Target className="h-3.5 w-3.5" />
              Strategic Benchmarking
            </div>
          </div>
        </header>

        <div className="px-6 pb-12">
          <p className="text-muted-foreground mb-8">
            Analyze any YouTube channel to benchmark your performance and steal their strategies.
          </p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card p-6 rounded-2xl border border-border shadow-sm mb-8"
          >
            <form onSubmit={handleAnalyze} className="flex gap-4 max-w-2xl">
              <Input
                placeholder="Enter Channel Name, Handle (@mrbeast), or ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 text-lg py-6"
              />
              <Button size="lg" disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white px-8">
                {isLoading ? "Spying..." : (
                  <>
                    <Search className="mr-2 h-5 w-5" /> Analyze
                  </>
                )}
              </Button>
            </form>
          </motion.div>

          {data && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Competitor Header */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-2xl border border-border flex items-start gap-4">
                  <img
                    src={data.channel.thumbnail}
                    alt={data.channel.title}
                    className="w-20 h-20 rounded-full border-4 border-muted"
                  />
                  <div>
                    <h2 className="text-2xl font-bold">{data.channel.title}</h2>
                    <p className="text-muted-foreground mb-4">{data.channel.customUrl}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <strong>{(data.channel.statistics.subscribers / 1000000).toFixed(1)}M</strong> Subs
                      </span>
                      <span className="flex items-center gap-1">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        <strong>{data.channel.statistics.videos}</strong> Videos
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card p-4 rounded-xl border border-border">
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                      <Target className="h-4 w-4" /> Engagement Rate
                    </div>
                    <div className="text-2xl font-bold">{data.analysis.engagement_rate}%</div>
                    <div className="text-xs text-green-500">Based on recent videos</div>
                  </div>
                  <div className="bg-card p-4 rounded-xl border border-border">
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" /> Virality Score
                    </div>
                    <div className="text-2xl font-bold">{data.analysis.virality_score}/100</div>
                    <div className="text-xs text-muted-foreground">Performance vs Subs</div>
                  </div>
                </div>
              </div>

              {/* Comparison Chart */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-card p-6 rounded-2xl border border-border">
                  <h3 className="font-semibold mb-6 flex items-center gap-2">
                    <Swords className="h-4 w-4" /> You vs Competitor
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="You" dataKey="You" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                        <Radar name={data.channel.title} dataKey="Competitor" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                        <Legend />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Videos */}
                <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border">
                  <h3 className="font-semibold mb-6">Recent Top Content</h3>
                  <div className="space-y-4">
                    {data.recent_videos.map((vid: any) => (
                      <div key={vid.id} className="flex gap-4 p-3 hover:bg-muted/50 rounded-xl transition-colors group cursor-pointer">
                        <div className="relative w-32 h-20 shrink-0">
                          <img src={vid.thumbnail} className="w-full h-full object-cover rounded-lg" />
                          <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">
                            {vid.duration.replace("PT", "").replace("M", ":").replace("S", "")}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium truncate group-hover:text-primary transition-colors">{vid.title}</h4>
                          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" /> {(vid.statistics.views / 1000).toFixed(0)}K
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" /> {((vid.statistics.likes + vid.statistics.comments) / vid.statistics.views * 100).toFixed(1)}% Eng.
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div >
  );
};

export default CompetitorSpy;
