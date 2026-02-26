import { useState, useRef } from "react";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, Loader2, Sparkles, AlertCircle, CheckCircle2, Play, Timer, Share2, MousePointer2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/components/auth/AuthContext";
import { API_BASE_URL } from "@/services/api";

interface HookAnalysis {
  frame_index: number;
  timestamp_sec: number;
  hook_score: number;
  reason: string;
  visual_elements: string[];
  improvement_tip?: string;
  frame_image: string; // Base64
  total_frames_analyzed: number;
  video_filename: string;
  summary: string;
}

const HookDetector = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<HookAnalysis | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a video under 100MB.",
          variant: "destructive",
        });
        return;
      }
      setVideoFile(file);
      setResults(null);
    }
  };

  const handleCardClick = () => {
    if (fileInputRef.current && !isAnalyzing) {
      fileInputRef.current.click();
    }
  };

  const handleAnalyze = async () => {
    if (!videoFile) {
      toast({
        title: "No video selected",
        description: "Please select a video file first.",
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(10);

    const intervalId = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 5;
      });
    }, 1000);

    try {
      const token = session?.access_token;
      const formData = new FormData();
      formData.append("video", videoFile);

      const response = await fetch(`${API_BASE_URL}/api/hooks/analyze`, {
        method: "POST",
        headers: {
          // Note: Do not set Content-Type for FormData, the browser does it
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "Analysis failed";
        try {
          const errorData = await response.json();
          // Handle structured error response (e.g., plan restrictions)
          if (typeof errorData.detail === "object" && errorData.detail.message) {
            errorMessage = errorData.detail.message;
          } else if (typeof errorData.detail === "string") {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Response wasn't JSON
          errorMessage = `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setResults(data);
      setProgress(100);

      toast({
        title: "Analysis Complete",
        description: "Found the perfect hook moment for your video.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to analyze video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      clearInterval(intervalId);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <header className="bg-card border-b border-border px-6 py-4 h-[65px] flex items-center">
          <div className="flex items-center gap-4">
            <MobileNav />
            <h1 className="font-display text-2xl font-bold text-foreground">Auto Hook Detector</h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Zap className="h-3 w-3" />
              <span className="hidden sm:inline">Multimodal AI Hook Analysis</span>
              <span className="sm:hidden">AI Analysis</span>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-5xl mx-auto space-y-8">
          <section className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Stop the Scroll.</h2>
              <p className="text-muted-foreground text-lg">
                Upload your video and our AI will find the exact moment that grabs attention.
              </p>
            </div>

            <Card
              onClick={handleCardClick}
              className="p-8 border-dashed border-2 bg-card/50 flex flex-col items-center justify-center space-y-4 hover:border-primary/50 transition-colors cursor-pointer group relative overflow-hidden"
            >
              {isAnalyzing && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6">
                  <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                  <p className="font-semibold text-lg animate-pulse">Analyzing Video Frames...</p>
                  <p className="text-sm text-muted-foreground mb-4">Gemini 1.5 is scanning for the perfect hook</p>
                  <Progress value={progress} className="w-64 h-2" />
                </div>
              )}

              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="h-8 w-8 text-primary" />
              </div>

              <div className="text-center">
                <p className="font-medium text-lg">
                  {videoFile ? videoFile.name : "Select video to analyze"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  MP4, MOV or WEBM (Max 100MB)
                </p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="video/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  if (videoFile) {
                    handleAnalyze();
                  } else {
                    handleCardClick();
                  }
                }}
                disabled={isAnalyzing}
                className="relative z-10 px-8 shadow-lg hover:shadow-primary/20"
              >
                {isAnalyzing ? "Processing..." : results ? "Re-analyze Video" : videoFile ? "Find Winning Hook" : "Select Video"}
              </Button>
            </Card>
          </section>

          <AnimatePresence>
            {results && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  <h3 className="text-xl font-bold">Analysis Complete</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">The Winning Moment</p>
                    <div className="relative group rounded-2xl overflow-hidden border border-border shadow-2xl aspect-video bg-black flex items-center justify-center">
                      <img
                        src={`data:image/jpeg;base64,${results.frame_image}`}
                        alt="Hook moment"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute bottom-4 left-4 bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 shadow-lg">
                        <Timer className="h-4 w-4" />
                        {((results as any).timestamp_sec || 0).toFixed(1)}s
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 gap-2" size="sm">
                        <Share2 className="h-4 w-4" /> Export Moment
                      </Button>
                      <Button variant="outline" className="flex-1 gap-2" size="sm">
                        <MousePointer2 className="h-4 w-4" /> Use as Thumbnail
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Why this is gold</p>
                      <Card className="p-6 border-primary/20 bg-primary/5 relative overflow-hidden">
                        <Sparkles className="absolute -top-4 -right-4 h-24 w-24 text-primary/5 rotate-12" />

                        <div className="mb-4">
                          <div className="flex items-end gap-2 mb-2">
                            <span className="text-5xl font-black text-primary leading-none">{results.hook_score || 0}</span>
                            <span className="text-lg font-bold text-primary/70 mb-1">/100</span>
                          </div>
                          <p className="text-sm text-primary font-bold">HOOK RETENTION SCORE</p>
                        </div>

                        <p className="text-lg font-medium leading-relaxed italic border-l-4 border-primary pl-4 mb-4">
                          "{results.reason}"
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {results.visual_elements?.map((el, i) => (
                            <span key={i} className="bg-background text-foreground text-xs font-semibold px-2.5 py-1 rounded-md border border-border flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {el}
                            </span>
                          ))}
                        </div>
                      </Card>
                    </div>

                    {results.improvement_tip && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">AI Tip to Level Up</p>
                        <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex items-start gap-4">
                          <AlertCircle className="h-6 w-6 text-orange-500 mt-0.5 flex-shrink-0" />
                          <p className="text-orange-900 dark:text-orange-200">
                            {results.improvement_tip}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default HookDetector;
